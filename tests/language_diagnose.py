"""Isolate first TR to EN delay without modifying the published site."""
import functools,json,threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/'test-results'; REPORT.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',8766),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
probe='''() => {
 window.diag={ops:[],frames:[],events:[]};
 function wrap(obj,name){let old=obj[name];obj[name]=function(...args){let t=performance.now();let v=old.apply(this,args);let ms=performance.now()-t;if(ms>1)diag.ops.push({name,args:args.slice(0,2),ms});return v;};}
 wrap(Storage.prototype,'setItem');
 let d=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'lang');
 Object.defineProperty(HTMLElement.prototype,'lang',{...d,set(v){let t=performance.now();d.set.call(this,v);diag.ops.push({name:'lang',value:v,ms:performance.now()-t});}});
 let last=performance.now();
 function tick(t){if(diag.clicked)diag.frames.push(t-last);last=t;requestAnimationFrame(tick);}requestAnimationFrame(tick);
 document.addEventListener('pointerdown', e=>{
  if(!e.target.closest('[data-esc-lang]'))return;
  diag.clicked=performance.now();
  queueMicrotask(()=>diag.microtaskMs=performance.now()-diag.clicked);
  requestAnimationFrame(()=>{diag.rafMs=performance.now()-diag.clicked;setTimeout(()=>diag.paintMs=performance.now()-diag.clicked,0)});
 },true);
 document.addEventListener('pointerdown',()=>{if(diag.clicked)diag.handlerEndMs=performance.now()-diag.clicked;});
}'''
results=[]
with sync_playwright() as p:
 for mode in ['normal','no-lang','no-noise','no-effects']:
  b=p.webkit.launch(); ctx=b.new_context(viewport={'width':1440,'height':950});page=ctx.new_page()
  page.set_default_timeout(15000)
  if mode=='no-lang':
   script=(ROOT/'language-switcher.js').read_text().replace('document.documentElement.lang = next;','/* diagnostic only: skip root lang update */')
   page.route('**/language-switcher.js*',lambda route:route.fulfill(status=200,body=script,content_type='application/javascript'))
  page.goto('http://127.0.0.1:8766/',wait_until='domcontentloaded')
  if mode=='no-noise':page.add_style_tag(content='.page-noise{display:none!important}')
  if mode=='no-effects':page.add_style_tag(content='*,*::before,*::after{animation:none!important;transition:none!important;filter:none!important;backdrop-filter:none!important;box-shadow:none!important}.page-noise{display:none!important}')
  page.wait_for_timeout(700);page.evaluate(probe)
  page.locator('button[data-esc-lang="en"]').click()
  page.wait_for_timeout(1800)
  data=page.evaluate('diag'); data['mode']=mode
  print(json.dumps(data),flush=True);results.append(data)
  (REPORT/'webkit-diagnostic.json').write_text(json.dumps(results,indent=2))
  b.close()
server.shutdown()
