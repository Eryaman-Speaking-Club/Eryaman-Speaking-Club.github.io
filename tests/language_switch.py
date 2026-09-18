"""Exercise real language buttons in Chromium and WebKit; keep timings and screenshots."""
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
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest('button[data-esc-lang]');
    if (!button) return;
    const sample = {to: button.dataset.escLang, start: performance.now()};
    window.switchSamples.push(sample);
    requestAnimationFrame(() => setTimeout(() => {
      sample.toPaintMs = performance.now() - sample.start;
      sample.language = document.documentElement.lang;
      sample.visibleText = document.querySelector('.nav-links').innerText;
    }, 0));
  }, true);
}"""
with sync_playwright() as p:
    for engine, mobile in [('chromium', False), ('webkit', False), ('webkit', True)]:
        label = engine + ('-mobile' if mobile else '-desktop')
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
            page.evaluate(probe)
            result['beforeNodes'] = page.locator('*').count()
            samples = []
            for index, language in enumerate(['en', 'tr'] * 12):
                button = page.locator('button[data-esc-lang="' + language + '"]')
                if mobile:
                    button.tap()
                else:
                    button.click()
                page.wait_for_function('lang => document.documentElement.lang === lang', arg=language)
                page.wait_for_function('() => window.switchSamples.length && window.switchSamples[window.switchSamples.length - 1].toPaintMs !== undefined')
                sample = page.evaluate('window.switchSamples[window.switchSamples.length - 1]')
                samples.append(sample)
                expected = 'About' if language == 'en' else 'Hakkımızda'
                assert page.locator('.nav-links a').first.text_content().strip() == expected or expected in page.locator('.nav-links a').first.inner_text()
                if index == 0:
                    page.screenshot(path=str(REPORT / (label + '-en.png')))
                page.wait_for_timeout(60)
            result['samples'] = samples
            durations = [s['toPaintMs'] for s in samples]
            result['medianMs'] = statistics.median(durations)
            result['maxMs'] = max(durations)
            result['afterNodes'] = page.locator('*').count()
            page.wait_for_timeout(2800)
            page.locator('button[data-esc-lang="en"]').click()
            page.wait_for_timeout(150)
            result['savedLanguage'] = page.evaluate('localStorage.getItem("esc-language-v1")')
            page.reload(wait_until='domcontentloaded')
            page.wait_for_timeout(350)
            result['reloadLanguage'] = page.evaluate('document.documentElement.lang')
            assert result['savedLanguage'] == 'en' and result['reloadLanguage'] == 'en'
            assert not result['errors'], result['errors']
            assert result['maxMs'] < 500, result
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
