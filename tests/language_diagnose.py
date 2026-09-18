"""Diagnostic variants only; no variant is applied to the published site."""
import functools,json,threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
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
symbols=r'''() => {
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const ns=[];let n;
 while(n=walker.nextNode())if(!n.parentElement.closest('script,style,noscript,textarea')&&n.nodeValue.trim()&&!/[\p{L}\p{N}]/u.test(n.nodeValue))ns.push(n);
 for(const n of ns){if(n.parentElement.childNodes.length===1)n.parentElement.lang='zxx';else{let e=document.createElement('bdi');e.lang='zxx';n.replaceWith(e);e.append(n);}}
 return ns.length;
}'''
fixedfont='''@font-face{font-family:EscTestFont;src:local("Arial"),local("Liberation Sans");font-weight:400;font-style:normal;font-display:swap}@font-face{font-family:EscTestFont;src:local("Arial Bold"),local("Arial-BoldMT"),local("Liberation Sans Bold");font-weight:700;font-style:normal;font-display:swap}body,button,input,textarea{font-family:EscTestFont,Arial,sans-serif!important}'''
results=[]
with sync_playwright() as p:
 for mode in ['normal','symbols-lang','strip-emoji','fixed-font','fixed-font-symbols','warm-all']:
  b=p.webkit.launch();ctx=b.new_context(viewport={'width':1440,'height':950});page=ctx.new_page();page.set_default_timeout(15000)
  page.goto('http://127.0.0.1:8766/',wait_until='domcontentloaded')
  prep=0
  if mode in ['symbols-lang','fixed-font-symbols']:prep=page.evaluate(symbols)
  if mode in ['fixed-font','fixed-font-symbols']:page.add_style_tag(content=fixedfont)
  if mode=='strip-emoji':
   page.evaluate(r'''() => {let w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n;while(n=w.nextNode())if(!n.parentElement.closest('script,style,noscript,textarea'))n.nodeValue=n.nodeValue.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'');}''')
  if mode=='warm-all':
   prep=page.evaluate('''() => {let t=performance.now(), styles=new Set([...document.querySelectorAll('body *')].filter(e=>!e.matches('script,style')).map(e=>getComputedStyle(e).font)), box=document.createElement('div');box.lang='en';box.style.cssText='position:absolute;visibility:hidden;pointer-events:none;';for(let s of styles){let e=document.createElement('span');e.style.font=s;e.textContent='ABC abc 0123 English 🗣️ 💬 ☕ ✨ ↗ → 🎯 🎙️ 🤝 🌱';box.append(e);}document.body.append(box);box.getBoundingClientRect();box.remove();return performance.now()-t;}''')
  page.wait_for_timeout(700);page.evaluate(probe);page.locator('button[data-esc-lang="en"]').click();page.wait_for_timeout(1300)
  data=page.evaluate('diag');data['mode']=mode;data['prep']=prep
  print(json.dumps(data),flush=True);results.append(data);(REPORT/'webkit-diagnostic.json').write_text(json.dumps(results,indent=2));b.close()
server.shutdown()
