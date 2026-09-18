"""Passive cold-page and repeated language navigation probes on the live site."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('test-results');OUT.mkdir(exist_ok=True)
ENGINE=os.environ.get('ENGINE','webkit')
MOBILE=os.environ.get('MOBILE','false')=='true'
BASE=os.environ.get('TEST_BASE_URL','https://eryaman-speaking-club.github.io/')
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
  result['scripts']=page.locator('script[src]').evaluate_all('(nodes)=>nodes.map(n=>n.src)')
  for lang in ['en','tr','en','tr','en','tr']:
   link=page.locator('.esc-lang-switch a[href="/'+lang+'/"]')
   link.tap() if MOBILE else link.click()
   page.wait_for_timeout(1400)
   sample=page.evaluate('window.navProbe');result['samples'].append(sample)
   assert sample.get('language')==lang,sample
   assert sample.get('menu')==('About' if lang=='en' else 'Hakkımızda'),sample
   assert sample.get('heroVisibleMs') is not None,sample
   assert page.locator('.esc-lang-dual').count()==0
   assert not any('language-switcher.js' in src for src in page.locator('script[src]').evaluate_all('(nodes)=>nodes.map(n=>n.src)'))
   if len(result['samples'])==1:page.screenshot(path=str(OUT/(ENGINE+('-mobile' if MOBILE else '-desktop')+'-en.png')))
  assert not result['errors'],result['errors']
  result['passed']=True
 except Exception as error:
  result['passed']=False;result['failure']=str(error)
 finally:
  print(json.dumps(result),flush=True)
  (OUT/'static-language-results.json').write_text(json.dumps(result,indent=2))
  b.close()
assert result['passed'],'See static-language-results.json'
