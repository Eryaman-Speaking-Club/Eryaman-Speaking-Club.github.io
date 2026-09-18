"""Diagnostic CSS variants are browser-only and never published."""
import functools,json,threading
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/'test-results';REPORT.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',8766),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
probe='''() => {
 window.diag={frames:[]};let last=performance.now();
 function tick(t){if(diag.clicked)diag.frames.push(t-last);last=t;requestAnimationFrame(tick);}requestAnimationFrame(tick);
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-esc-lang]'))return;diag.clicked=performance.now();requestAnimationFrame(()=>{diag.rafMs=performance.now()-diag.clicked;setTimeout(()=>diag.paintMs=performance.now()-diag.clicked,0)});},true);
 document.addEventListener('pointerdown',()=>{if(diag.clicked)diag.handlerEndMs=performance.now()-diag.clicked;});
}'''
cv='main>section:not(.hero){content-visibility:auto;contain-intrinsic-size:auto 700px}'
noise='.page-noise{display:none!important}'
variants={'normal':'','containment':cv,'no-noise':noise,'containment-no-noise':cv+noise}
results=[]
with sync_playwright() as p:
 for repetition in range(2):
  for mode,css in variants.items():
   b=p.webkit.launch();ctx=b.new_context(viewport={'width':1440,'height':950});page=ctx.new_page();page.set_default_timeout(15000)
   page.goto('http://127.0.0.1:8766/',wait_until='domcontentloaded')
   if css:page.add_style_tag(content=css)
   page.wait_for_timeout(700);page.evaluate(probe);page.locator('button[data-esc-lang="en"]').click();page.wait_for_timeout(1500)
   data=page.evaluate('diag');data['mode']=mode;data['repetition']=repetition
   print(json.dumps(data),flush=True);results.append(data);(REPORT/'webkit-diagnostic.json').write_text(json.dumps(results,indent=2));b.close()
server.shutdown()
