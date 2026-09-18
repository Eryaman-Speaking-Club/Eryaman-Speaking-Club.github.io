"""Real clicks/taps, first paint, language persistence and navigation regression.

TEST_BASE_URL selects the live site. ENGINE/MOBILE isolate browser families on
independent CI runners. No English pre-click is performed by the test harness.
Reported paint times are next-frame proxies, not physical-display measurements.
"""
import functools
import json
import os
import statistics
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'test-results'
REPORT.mkdir(exist_ok=True)
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 8765), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base_url = os.environ.get('TEST_BASE_URL', 'http://127.0.0.1:8765/')
results = []
probe = """() => {
  window.switchSamples = [];
  window.switchFrames = [];
  let last = performance.now();
  function frame(now) {
    if (window.switchSamples.length) window.switchFrames.push(now - last);
    last = now;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest('button[data-esc-lang]');
    if (!button) return;
    const sample = {to: button.dataset.escLang, start: performance.now()};
    window.switchSamples.push(sample);
    requestAnimationFrame(() => setTimeout(() => {
      sample.toPaintMs = performance.now() - sample.start;
      sample.language = document.documentElement.lang;
      sample.text = document.querySelector('.nav-links a').textContent.trim();
    }, 0));
  }, true);
}"""

cases = [('chromium', False, 0), ('webkit', False, 0), ('webkit', True, 0),
         ('webkit', False, 1), ('webkit', True, 1), ('webkit', False, 2), ('webkit', True, 2)]
if os.environ.get('ENGINE'):
    cases = [case for case in cases if case[0] == os.environ['ENGINE'] and case[1] == (os.environ.get('MOBILE') == 'true')]
assert cases, 'No matching test cases'
with sync_playwright() as p:
    for engine, mobile, repeat in cases:
        label = engine + ('-mobile' if mobile else '-desktop') + '-cold-' + str(repeat + 1)
        result = {'label': label, 'base_url': base_url, 'errors': []}
        results.append(result)
        browser = getattr(p, engine).launch(headless=True)
        context = browser.new_context(viewport={'width': 390 if mobile else 1440, 'height': 844 if mobile else 950}, is_mobile=mobile, has_touch=mobile)
        page = context.new_page()
        page.set_default_timeout(10000)
        page.on('pageerror', lambda error, r=result: r['errors'].append(str(error)))
        try:
            page.goto(base_url, wait_until='domcontentloaded', timeout=30000)
            page.wait_for_timeout(700)
            result['preparationMs'] = page.evaluate('performance.getEntriesByName("esc-language-preparation").map(e => e.duration)')
            page.evaluate(probe)
            result['beforeNodes'] = page.locator('*').count()
            result['samples'] = []
            for index, language in enumerate(['en', 'tr'] * (12 if repeat == 0 else 3)):
                button = page.locator('button[data-esc-lang="' + language + '"]')
                button.tap() if mobile else button.click()
                page.wait_for_function('lang => document.documentElement.lang === lang', arg=language)
                page.wait_for_function('() => window.switchSamples.length && window.switchSamples[window.switchSamples.length - 1].toPaintMs !== undefined')
                sample = page.evaluate('window.switchSamples[window.switchSamples.length - 1]')
                result['samples'].append(sample)
                expected = 'About' if language == 'en' else 'Hakkımızda'
                assert sample['text'] == expected and sample['language'] == language, sample
                assert button.get_attribute('aria-pressed') == 'true'
                page.wait_for_timeout(60)
            durations = [s['toPaintMs'] for s in result['samples']]
            result['firstMs'] = durations[0]
            result['medianMs'] = statistics.median(durations)
            result['maxMs'] = max(durations)
            result['afterNodes'] = page.locator('*').count()
            result['maxFrameGapMs'] = page.evaluate('Math.max(...window.switchFrames)')
            assert result['afterNodes'] == result['beforeNodes'], 'DOM grows while toggling'
            assert page.locator('.esc-lang-dual').count() == 0, 'Old dual-wrapper runtime still loaded'
            assert result['maxMs'] < 250, 'Language paint exceeds 250 ms: ' + str(result['maxMs'])
            page.wait_for_timeout(1000)
            result['maxFrameGapMs'] = page.evaluate('Math.max(...window.switchFrames)')
            assert result['maxFrameGapMs'] < 300, 'Long frame after language switch'

            if repeat == 0:
                page.evaluate("""() => {
                  const box = document.createElement('div'); box.id = 'language-test';
                  box.innerHTML = '<p id="dynamic-copy">Hakkımızda</p><b id="case-upper" style="text-transform:uppercase">indigo science</b><b id="case-lower" style="text-transform:lowercase">INDIGO SCIENCE</b><code id="no-translate">Hakkımızda</code>';
                  document.body.appendChild(box);
                }""")
                page.wait_for_timeout(80)
                assert page.locator('#case-upper').inner_text() == 'İNDİGO SCİENCE'
                assert page.locator('#case-lower').inner_text() == 'ındıgo scıence'
                page.locator('button[data-esc-lang="en"]').click()
                page.wait_for_timeout(100)
                assert page.locator('#dynamic-copy').text_content() == 'About'
                assert page.locator('#case-upper').inner_text() == 'INDIGO SCIENCE'
                assert page.locator('#case-lower').inner_text() == 'indigo science'
                assert page.locator('#no-translate').text_content() == 'Hakkımızda'
                page.evaluate("document.querySelector('#dynamic-copy').firstChild.nodeValue = 'Hemen katıl'")
                page.wait_for_timeout(60)
                assert page.locator('#dynamic-copy').text_content() == 'Join now'
                page.locator('button[data-esc-lang="tr"]').focus()
                page.keyboard.press('Enter')
                page.wait_for_timeout(100)
                assert page.locator('#dynamic-copy').text_content() == 'Hemen katıl'
                assert page.locator('#case-upper').inner_text() == 'İNDİGO SCİENCE'
                page.evaluate("document.querySelector('#language-test').remove()")
                result['dynamicCasingKeyboardPassed'] = True
                page.locator('button[data-esc-lang="en"]').click()
                page.wait_for_timeout(150)
                page.screenshot(path=str(REPORT / (label + '-en.png')))
                result['anchors'] = []
                for anchor in ['#about', '#faq', '#katilim']:
                    if mobile:
                        page.locator('.menu-btn').click()
                    page.locator('.nav-links a[href="' + anchor + '"]').click()
                    page.wait_for_timeout(1000)
                    box = page.locator(anchor).bounding_box()
                    assert box and box['height'] > 80 and box['y'] < page.viewport_size['height'] and box['y'] + box['height'] > 60, {'anchor': anchor, 'box': box}
                    assert page.locator(anchor + ' h2').first.is_visible(), anchor
                    result['anchors'].append({'anchor': anchor, 'box': box})
                result['savedLanguage'] = page.evaluate('localStorage.getItem("esc-language-v1")')
                page.reload(wait_until='domcontentloaded')
                page.wait_for_timeout(350)
                result['reloadLanguage'] = page.evaluate('document.documentElement.lang')
                assert result['savedLanguage'] == 'en' and result['reloadLanguage'] == 'en'
                assert page.locator('.nav-links a').first.text_content().strip() == 'About'
            assert not result['errors'], result['errors']
            result['passed'] = True
        except Exception as error:
            result['passed'] = False
            result['failure'] = str(error)
        finally:
            print(json.dumps(result), flush=True)
            (REPORT / 'language-results.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
            context.close()
            browser.close()
server.shutdown()
assert all(result.get('passed') for result in results), 'See test-results/language-results.json'
