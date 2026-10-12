'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs');
const base='http://127.0.0.1:8123',slugs=[
 {slug:'hot-seat',selector:'#skip'},
 {slug:'never-have-i-ever',selector:'#next'},
 {slug:'what-would-you-do-if',selector:'#nextBtn'},
 {slug:'would-you-rather',selector:'#next'},
 {slug:'debate-roulette',selector:'#next'},
 {slug:'question-roulette',selector:'#next'},
 {slug:'story-chain',selector:'#next'}
];
async function progress(page,slug){
 return page.evaluate(g=>window.ESCNoRepeat.progress(g,window.ESCCEFR.get()).used,slug);
}
(async()=>{
 const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1180,height:790}});
 await context.route(/^https?:\/\/(?!127\.0\.0\.1:8123)/,r=>r.abort());
 await context.addInitScript(()=>{
  window.ESCSupabase={isConfigured:()=>false,getGameSettings:async()=>null,getClient:async()=>null};
 });
 const outcomes=[];
 try{
  for(const {slug,selector} of slugs){
   const page=await context.newPage();
   page.setDefaultTimeout(10000);
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/'+slug+'/?level=A1-A2',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.ESCNoRepeat&&window.ESCCEFR);
   try{
    await page.waitForFunction(g=>window.ESCNoRepeat.progress(g,window.ESCCEFR.get()).used>=1,slug,{timeout:5000});
   }catch(e){
    const diagnostic=await page.evaluate(g=>({
      level:window.ESCCEFR?.level,available:window.ESCCEFR?.get(g)?.length,
      progress:window.ESCNoRepeat?.progress(g,window.ESCCEFR?.get(g)),
      prompt:document.querySelector('#prompt')?.textContent,
      status:document.querySelector('#cefrLevel')?.textContent,
      script:!!document.querySelector('script[src*="esc-no-repeat.js"]')
    }),slug);
    throw new Error(slug+' did not draw initial question: '+JSON.stringify(diagnostic)+' JS: '+JSON.stringify(errors)+' '+e.message);
   }
   const observed=new Set();
   const getText=()=>page.evaluate(g=>{
    if(g==='what-would-you-do-if')return document.getElementById('questionText')?.textContent;
    if(g==='would-you-rather')return document.getElementById('textA')?.textContent+' | '+document.getElementById('textB')?.textContent;
    if(g==='debate-roulette')return document.getElementById('motion')?.textContent;
    return document.getElementById('prompt')?.textContent;
   },slug);
   observed.add(await getText());
   for(let i=0;i<5;i++){
    const before=await progress(page,slug);
    await page.locator(selector).click();
    const after=await progress(page,slug);
    assert.equal(after,before+1,slug+': next did not consume exactly one NEW question');
    const q=await getText();assert(q,'Empty visible question on '+slug);assert(!observed.has(q),'Repeated visible question in '+slug+': '+q);observed.add(q);
   }
   const countBefore=await progress(page,slug);
   const shuffle=page.locator('#shuffle,#shuffleBtn');
   if(await shuffle.count()&&await shuffle.isVisible()){
    await shuffle.first().click();
    assert.equal(await progress(page,slug),countBefore+1,slug+': shuffle repeated a question');
    const q=await getText();assert(!observed.has(q),slug+': shuffle displayed an old question');observed.add(q);
   }
   const beforeReload=await progress(page,slug);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(g=>window.ESCNoRepeat?.progress(g,window.ESCCEFR.get()).used>0,slug);
   assert.equal(await progress(page,slug),beforeReload+1,slug+': browser reload lost rotation progress');
   const after=await getText();assert(!observed.has(after),slug+': reload repeated a question');
   assert.equal(errors.length,0,'Page JS errors in '+slug+': '+errors.join(' | '));
   outcomes.push({slug,seen:observed.size+1,passed:true});
   await page.close();
  }
  // New-game bingo is a grid: its SQUARES must not repeat before its word pool cycles.
  {
   const page=await context.newPage();
   await page.goto(base+'/conversation-bingo/?level=A1-A2',{waitUntil:'domcontentloaded'});
   await page.waitForSelector('.bingo-cell');
   const a=await page.locator('.bingo-cell').allTextContents();
   assert.equal(a.length,16);
   await page.click('#next');
   const b=await page.locator('.bingo-cell').allTextContents();
   assert.equal(b.length,16);assert.equal(new Set([...a,...b]).size,32,'Bingo squares repeated across first two cards');
   assert.equal(await progress(page,'conversation-bingo'),32);
   outcomes.push({slug:'conversation-bingo',uniqueSquares:32,passed:true});
   await page.close();
  }
  // Hidden words are tracked by their target, not by the static instruction text.
  {
   const page=await context.newPage();
   await page.goto(base+'/taboo/?level=A1-A2',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.ESCNoRepeat?.progress('taboo',window.ESCCEFR.get()).used>=1);
   const first=await page.locator('#target').textContent();
   const n=await progress(page,'taboo');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(v=>window.ESCNoRepeat?.progress('taboo',window.ESCCEFR.get()).used===v,n+1);
   const second=await page.locator('#target').textContent();
   assert.notEqual(first,second,'Taboo target repeated after reload');
   outcomes.push({slug:'taboo',used:n+1,passed:true});
   await page.close();
  }
  {
   const page=await context.newPage();
   await page.goto(base+'/one-for-me-one-for-you/?level=A1-A2',{waitUntil:'domcontentloaded'});
   await page.waitForSelector('#start');
   await page.click('#start');
   await page.click('#draw');
   await page.waitForFunction(()=>window.ESCNoRepeat?.progress('one-for-me-one-for-you',window.ESCCEFR.get()).used>=1);
   const first=await page.locator('#q').textContent();
   await page.reload({waitUntil:'domcontentloaded'});
   await page.click('#start');await page.click('#draw');
   await page.waitForFunction(()=>window.ESCNoRepeat?.progress('one-for-me-one-for-you',window.ESCCEFR.get()).used>=2);
   assert.notEqual(first,await page.locator('#q').textContent(),'Paired game repeated after reload');
   outcomes.push({slug:'one-for-me-one-for-you',used:2,passed:true});
   await page.close();
  }
  /* Two open tabs using the same level should not replay the next queued card. */
  {
   const tabs=await browser.newContext({viewport:{width:1180,height:790}});
   await tabs.route(/^https?:\/\/(?!127\.0\.0\.1:8123)/,route=>route.abort());
   await tabs.addInitScript(()=>{
     // Stable shuffle order makes an expired card deterministic across tabs.
     Math.random=()=>0.999999;
     window.ESCSupabase={isConfigured:()=>false,getGameSettings:async()=>null,getClient:async()=>null};
   });
   try{
    const first=await tabs.newPage();
    await first.goto(base+'/hot-seat/?level=A1-A2',{waitUntil:'domcontentloaded'});
    await first.waitForFunction(()=>window.ESCNoRepeat?.progress('hot-seat',window.ESCCEFR.get()).used===1);
    await first.waitForSelector('#cefrUnseenCount');
    const firstQuestion=await first.locator('#prompt').textContent();
    const second=await tabs.newPage();
    await second.goto(base+'/hot-seat/?level=A1-A2',{waitUntil:'domcontentloaded'});
    await second.waitForFunction(()=>window.ESCNoRepeat?.progress('hot-seat',window.ESCCEFR.get()).used===2);
    const secondQuestion=await second.locator('#prompt').textContent();
    assert.notEqual(firstQuestion,secondQuestion,'Second tab repeated an already shown question');
    await first.waitForFunction(()=>{
      const p=window.ESCNoRepeat.progress('hot-seat',window.ESCCEFR.get());
      return document.querySelector('#cefrUnseenCount')?.textContent==='Yeni / New: '+(p.available-p.used)+' / '+p.available;
    });
    const beforeCrossTab=await first.evaluate(q=>({
      current:document.querySelector('#prompt')?.textContent,
      fresh:window.ESCNoRepeat.isFresh('hot-seat',['Mixed',q]),
      store:JSON.parse(localStorage.getItem('esc-seen-v1:hot-seat:A1-A2')||'null'),
      counter:document.querySelector('#cefrUnseenCount')?.textContent
    }),secondQuestion);
    await first.click('#skip');
    const thirdQuestion=await first.locator('#prompt').textContent();
    assert.notEqual(thirdQuestion,firstQuestion,'First tab repeated its own previous question');
    assert.notEqual(thirdQuestion,secondQuestion,'First tab did not skip a card used in second tab: '+JSON.stringify({firstQuestion,secondQuestion,thirdQuestion,beforeCrossTab}));
    const category=first.locator('#chips button').filter({hasText:/^Personal$/});
    await category.click();
    const scoped=await first.evaluate(()=>{
      const c=document.querySelector('#chips button.active')?.textContent?.trim()||'All';
      const p=window.ESCNoRepeat.progress('hot-seat',window.ESCCEFR.get('hot-seat',window.ESCCEFR.level,c));
      return {actual:document.querySelector('#cefrUnseenCount')?.textContent,expected:'Yeni / New: '+(p.available-p.used)+' / '+p.available};
    });
    assert.equal(scoped.actual,scoped.expected,'Counter did not reflect legacy category filter');
    await first.locator('#cefrLevel [data-cefr-level="B1-B2"]').click();
    await first.waitForFunction(()=>window.ESCCEFR?.level==='B1-B2');
    assert((await first.locator('#cefrUnseenCount').textContent()).includes('Yeni / New:'),'Level change hid progress indicator');
    await first.locator('#cefrLevel [data-cefr-level="A1-A2"]').click();
    await first.waitForFunction(()=>window.ESCCEFR?.level==='A1-A2');
    const beforeReload=await first.evaluate(()=>window.ESCNoRepeat.progress('hot-seat',window.ESCCEFR.raw()).used);
    await first.reload({waitUntil:'domcontentloaded'});
    await first.waitForFunction(()=>window.ESCNoRepeat?.progress('hot-seat',window.ESCCEFR.raw()).used>0);
    const afterReload=await first.evaluate(()=>window.ESCNoRepeat.progress('hot-seat',window.ESCCEFR.raw()).used);
    assert(afterReload>=beforeReload,'Reload lost history of used cards');
    outcomes.push({slug:'two-tab-hot-seat',seen:afterReload,categoryCounter:true,passed:true});
   }finally{await tabs.close()}
  }
  /* Truth/Dare has two pools: the unseen counter combines both variants. */
  {
   const page=await context.newPage();
   await page.goto(base+'/truth-or-dare/?level=A1-A2',{waitUntil:'domcontentloaded'});
   await page.waitForSelector('#cefrUnseenCount');
   const state=await page.evaluate(()=>{
    const data=window.ESCCEFR.raw();
    const a=window.ESCNoRepeat.progress('truth-or-dare',data.truths,'truth');
    const b=window.ESCNoRepeat.progress('truth-or-dare',data.dares,'dare');
    return {counter:document.querySelector('#cefrUnseenCount')?.textContent,
      expected:'Yeni / New: '+(a.available+b.available-a.used-b.used)+' / '+(a.available+b.available)};
   });
   assert.equal(state.counter,state.expected,'Truth/Dare counter does not combine truth and dare decks');
   outcomes.push({slug:'truth-or-dare-counter',passed:true});
   await page.close();
  }

  console.log(JSON.stringify({tests:outcomes,passed:true},null,2));
  fs.writeFileSync('no-repeat-browser-results.json',JSON.stringify({tests:outcomes,passed:true},null,2));
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
