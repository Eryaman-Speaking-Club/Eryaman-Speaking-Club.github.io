"""Passive native-language probes: cold first switch, repeated navigation, casing.

Times include the whole native navigation, not just the JavaScript handler.
TEST_BASE_URL selects production; otherwise serve the exact built site locally.
"""
import functools,json,os,threading
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
ENGINE=os.environ.get('ENGINE','webkit')
MOBILE=os.environ.get('MOBILE','false')=='true'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',8768),functools.partial(Quiet,directory=str(ROOT/'_site')))
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE=os.environ.get('TEST_BASE_URL','http://127.0.0.1:8768/')
INIT=r'''(() => {
 window.navProbe={};
 document.addEventListener('pointerdown',event=>{
   const link=event.target.closest('.esc-lang-switch a');if(!link)return;
   sessionStorage.setItem('__navProbeStart',JSON.stringify({start:Date.now(),from:location.pathname,to:link.getAttribute('href')}));
 },true);
 document.addEventListener('DOMContentLoaded',()=>{
  const raw=sessionStorage.getItem('__navProbeStart');if(!raw)return;
  const sample=JSON.parse(raw);window.navProbe=sample;
  sample.path=location.pathname;sample.language=document.documentElement.lang;
  sample.domReadyMs=Date.now()-sample.start;
  const nav=performance.getEntriesByType('navigation')[0];
  if(nav)sample.network={requestStart:nav.requestStart,responseStart:nav.responseStart,responseEnd:nav.responseEnd,domInteractive:nav.domInteractive,transferSize:nav.transferSize};
  let last=performance.now(),count=0,maxGap=0;
  function tick(t){maxGap=Math.max(maxGap,t-last);last=t;sample.maxFrameGapMs=maxGap;if(++count<100)requestAnimationFrame(tick)}
  requestAnimationFrame(tick);
  requestAnimationFrame(()=>setTimeout(()=>{
   sample.firstFrameMs=Date.now()-sample.start;
   sample.menu=document.querySelector('.nav-links a')?.innerText;
   function visible(){
    const hero=document.querySelector('.hero-copy');
    if(hero && parseFloat(getComputedStyle(hero).opacity)>.99){sample.heroVisibleMs=Date.now()-sample.start;return;}
    if(Date.now()-sample.start<10000)requestAnimationFrame(visible);
   }
   visible();
  },0));
 });
})();'''
result={'engine':ENGINE,'mobile':MOBILE,'baseUrl':BASE,'samples':[],'errors':[]}
with sync_playwright() as p:
 b=getattr(p,ENGINE).launch()
 c=b.new_context(viewport={'width':390 if MOBILE else 1440,'height':844 if MOBILE else 950},is_mobile=MOBILE,has_touch=MOBILE)
 c.add_init_script(INIT)
 page=c.new_page();page.set_default_timeout(12000)
 page.on('pageerror',lambda error:result['errors'].append(str(error)))
 try:
  page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
  page.wait_for_timeout(1200)
  result['initialUrl']=page.url
  for lang in ['en','tr']*6:
   link=page.locator('.esc-lang-switch a[href="/'+lang+'/"]')
   link.tap() if MOBILE else link.click()
   sample=None
   for _ in range(60):
    page.wait_for_timeout(100)
    sample=page.evaluate('window.navProbe')
    if sample.get('language')==lang and 'heroVisibleMs' in sample:break
   result['samples'].append(sample)
   assert sample.get('language')==lang,sample
   assert sample.get('menu')==('About' if lang=='en' else 'Hakkımızda'),sample
   assert sample.get('heroVisibleMs') is not None,sample
   sample['afterReadyMs']=sample['heroVisibleMs']-sample['domReadyMs']
   assert page.evaluate('document.documentElement.classList.contains("esc-language-hop")'),'Navigation helper is absent'
   assert sample['heroVisibleMs'] < 500, 'Slow full language navigation: '+str(sample)
   assert sample['afterReadyMs'] < 350, 'Delayed content after DOM ready: '+str(sample)
   assert page.locator('.esc-lang-dual').count()==0
   assert not any('language-switcher.js' in src for src in page.locator('script[src]').evaluate_all('(nodes)=>nodes.map(n=>n.src)'))
   sample['casing']=page.evaluate('''() => {
    const box=document.createElement('div');box.style.cssText='position:absolute;left:-10000px';
    box.innerHTML='<span style="text-transform:uppercase">indigo science</span><span style="text-transform:lowercase">INDIGO SCIENCE</span>';
    document.body.appendChild(box);const values=[...box.children].map(n=>n.innerText);box.remove();return values;
   }''')
   expected=['INDIGO SCIENCE','indigo science'] if lang=='en' else ['İNDİGO SCİENCE','ındıgo scıence']
   assert sample['casing']==expected, sample
   page.wait_for_timeout(500)
   if len(result['samples'])==1:page.screenshot(path=str(OUT/(ENGINE+('-mobile' if MOBILE else '-desktop')+'-en.png')))
  if MOBILE:page.locator('.menu-btn').click()
  page.locator('.nav-links a[href="#faq"]').click()
  page.wait_for_timeout(900)
  assert page.locator('#faq h2').is_visible()
  assert not result['errors'],result['errors']
  result['passed']=True
 except Exception as error:
  result['passed']=False;result['failure']=str(error)
 finally:
  print(json.dumps(result),flush=True)
  (OUT/'static-language-results.json').write_text(json.dumps(result,indent=2))
  b.close()
server.shutdown()
assert result['passed'],'See static-language-results.json'
