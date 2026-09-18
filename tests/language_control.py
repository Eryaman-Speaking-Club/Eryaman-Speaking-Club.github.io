"""Independent-runner control: compare no-op TR clicks with first EN switches."""
import functools,json,os,subprocess,threading
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
out=root/'test-results';out.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',8767),functools.partial(Quiet,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
variant=os.environ.get('VARIANT','fixed')
first=os.environ.get('FIRST','tr')
results={'variant':variant,'first':first,'samples':[]}
with sync_playwright() as p:
 b=p.webkit.launch();page=b.new_page(viewport={'width':1440,'height':950})
 if variant=='baseline':
  old=subprocess.check_output(['git','show','cfab346adefcff8b225503903b79fb3fe8671eea:language-switcher.js'],cwd=root,text=True)
  page.route('**/language-switcher.js*',lambda route:route.fulfill(status=200,body=old,content_type='application/javascript'))
 page.goto('http://127.0.0.1:8767/',wait_until='domcontentloaded');page.wait_for_timeout(700)
 page.evaluate('''() => {
  window.samples=[];
  document.addEventListener('pointerdown',event=>{
   const button=event.target.closest('button[data-esc-lang]');if(!button)return;
   let sample={to:button.dataset.escLang,from:document.documentElement.lang,start:performance.now()};samples.push(sample);
   requestAnimationFrame(()=>setTimeout(()=>{sample.ms=performance.now()-sample.start;sample.lang=document.documentElement.lang},0));
  },true);
 }''')
 for lang in ([first]+(['en'] if first=='tr' else [])+['tr','en','tr','en']):
  page.locator('button[data-esc-lang="'+lang+'"]').click()
  page.wait_for_timeout(750)
  results['samples'].append(page.evaluate('samples[samples.length-1]'))
 results['preparation']=page.evaluate('performance.getEntriesByName("esc-language-preparation").map(x=>x.duration)')
 print(json.dumps(results),flush=True)
 (out/'control.json').write_text(json.dumps(results,indent=2))
 b.close()
server.shutdown()
