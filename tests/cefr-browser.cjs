'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const slugs=Object.keys(JSON.parse(fs.readFileSync('cefr-counts.json','utf8')).counts),levels=['A1-A2','B1-B2','C1-C2'];
const base='http://127.0.0.1:8123';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 await context.route(/^https?:\/\/(?!127\.0\.0\.1:8123)/,r=>r.abort());
 await context.addInitScript(()=>{
  window.__writes=[];window.__config={};window.__admin=true;
  window.ESCSupabase={isConfigured:()=>false,getGameSettings:async s=>window.__config[s]||{content:[['UNREVIEWED','OLD_UNGRADED_SENTINEL']],truths:['OLD_UNGRADED_SENTINEL'],dares:['OLD_UNGRADED_SENTINEL'],keepSetting:73},saveGameSettings:async(s,x)=>{window.__writes.push([s,x]);window.__config[s]=JSON.parse(JSON.stringify(x))},isAdmin:async()=>window.__admin,getSession:async()=>({user:{id:'local-test-admin',email:'test@example.invalid'}}),getClient:async()=>null};
  localStorage.setItem('esc-truth-dare-v1',JSON.stringify({names:['Player One','Player Two'],truths:['LOCAL_OLD_SENTINEL'],dares:['LOCAL_OLD_SENTINEL']}));
  localStorage.setItem('esc-local-admin-v2',JSON.stringify({custom:[{id:'old',q:'LOCAL_OLD_SENTINEL'}]}));
 });
 const results=[];let cursor=0;
 async function one(slug){
  const page=await context.newPage();page.setDefaultTimeout(6000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base+'/'+slug+'/?level=A1-A2',{waitUntil:'domcontentloaded'});await page.waitForSelector('#cefrLevel');
   for(const level of levels){
    await page.locator('#cefrLevel [data-cefr-level="'+level+'"]') .click();await page.waitForTimeout(80);
    const state=await page.evaluate(()=>({level:ESCCEFR.level,loading:document.documentElement.hasAttribute('data-cefr-loading'),count:ESCCEFR.count(ESCCEFR.get()),body:document.body.innerText,newGame:!!window.ESC_NEW_GAME,poolOK:!window.ESC_NEW_GAME||JSON.stringify(ESC_NEW_GAME.items)===JSON.stringify(ESCCEFR.get())}));
    assert.equal(state.level,level);assert(!state.loading,'Loading never cleared');assert(state.poolOK,'Mixed/new-game pool');assert(!state.body.includes('OLD_UNGRADED_SENTINEL'),'Ungraded content leak');assert(!state.body.includes('LOCAL_OLD_SENTINEL'),'Old local content leak');
    if(slug==='taboo'){const n=await page.locator('#forbidden span').count();if(level==='A1-A2')assert(n>=1&&n<=2);else if(level==='B1-B2')assert(n>=3&&n<=4);else assert.equal(n,4);}
    if(slug==='conversation-bingo')assert.equal(await page.locator('.bingo-cell').count(),16);
    for(let n=0;n<3;n++){const next=page.locator('#next,#skip').first();if(await next.count()&&await next.isVisible())await next.click();}
    results.push({game:slug,level,count:state.count,pass:true});
   }
   const help=page.locator('.esc-answer-help-btn');if(await help.count()){await help.click();await page.waitForSelector('dialog.cefr-dialog[open]');assert((await page.locator('dialog.cefr-dialog h2').textContent()).includes('C1-C2'));await page.locator('dialog.cefr-dialog .cefr-dialog-head button').click();}
   await page.evaluate(()=>{void ESCCEFR.editor()});await page.waitForSelector('dialog.cefr-dialog[open]');
   assert(await page.locator('.cefr-card-form textarea').count()>0,'Missing friendly editor');
   await page.getByRole('button',{name:'Kaydet ve yayınla',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('dialog.cefr-dialog')?.textContent.includes('Kaydedildi ve sunucudan'));
   assert(await page.evaluate(()=>__config[ESCCEFR.slug].keepSetting===73),'Save lost unrelated config');
   assert(await page.evaluate(()=>JSON.stringify(__config[ESCCEFR.slug].cefr.levels['C1-C2'])===JSON.stringify(ESCCEFR.get())),'Save verification mismatch');
   await page.locator('dialog.cefr-dialog .cefr-dialog-head button').click();
   await page.setViewportSize({width:390,height:844});await page.locator('#cefrLevel [data-cefr-level="'+'A1-A2'+'"]') .click();
   if(['hot-seat','taboo','question-roulette','one-for-me-one-for-you'].includes(slug))await page.screenshot({path:'cefr-'+slug+'-mobile.png',fullPage:true});
   assert(errors.length===0,errors.join(' | '));
  }catch(e){results.push({game:slug,pass:false,error:e.message,pageerrors:errors});}
  finally{await page.close()}
 }
 async function worker(){while(cursor<slugs.length)await one(slugs[cursor++]);}
 await Promise.all(Array.from({length:4},worker));
 // Card animations must not restore an old level after a rapid switch.
 const page=await context.newPage();const extraErrors=[];page.on('pageerror',e=>extraErrors.push(e.message));
 try{
  await page.goto(base+'/one-for-me-one-for-you/?level=C1-C2');await page.click('#start');await page.click('#draw');await page.locator('#cefrLevel [data-cefr-level="'+'A1-A2'+'"]') .click();await page.waitForTimeout(500);assert.equal(await page.locator('#q').textContent(),'Ready?');await page.click('#draw');await page.waitForTimeout(400);assert(await page.evaluate(()=>ESCCEFR.get().some(x=>x.q===document.querySelector('#q').textContent)));
  await page.goto(base+'/truth-or-dare/?level=C1-C2');await page.click('#spinPlayer');await page.waitForSelector('#chooseTruth:visible',{timeout:8000});await page.click('#chooseTruth');await page.waitForTimeout(250);await page.locator('#cefrLevel [data-cefr-level="'+'A1-A2'+'"]') .click();await page.waitForTimeout(1100);assert.equal(await page.locator('#questionText').textContent(),'');assert((await page.locator('#roundStatus').textContent()).includes('2'));
  await page.goto(base+'/taboo/?level=A1-A2');await page.click('#start');await page.click('#pass');await page.click('#pass');await page.click('#pass');assert(await page.locator('#pass').isDisabled(),'Fourth pass permitted');await page.locator('#cefrLevel [data-cefr-level="'+'C1-C2'+'"]') .click();assert(await page.evaluate(()=>running===false),'Timer survived level change');
  // restored-category-filters
  await page.goto(base+'/what-would-you-do-if/?level=A1-A2');await page.waitForSelector('#cefrLevel');
  const whatIfCats=await page.locator('#filters button').allTextContents();
  for(const c of ['All','Everyday','Chaos','Social','Money','Deep','Spicy'])assert(whatIfCats.includes(c),'Missing What If category '+c);
  assert.equal(await page.locator('#filters button:disabled').count(),0,'What If should have every category at every level');
  await page.locator('#filters button[data-cat="Money"]').click();await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>ESCCEFR.category),'Money');
  assert(await page.evaluate(()=>ESCCEFR.get().length>0&&ESCCEFR.get().every(x=>x.c==='Money')),'What If category filter mixed cards');
  await page.locator('#cefrLevel [data-cefr-level="'+'B1-B2'+'"]') .click();assert.equal(await page.evaluate(()=>ESCCEFR.category),'Money');

  await page.goto(base+'/question-roulette/?level=B1-B2');await page.waitForSelector('#cefrCategories');
  const rouletteCats=await page.locator('#cefrCategories button').allTextContents();
  for(const c of ['All','Everyday','Fun','Social','Deep','Spicy'])assert(rouletteCats.includes(c),'Missing Question Roulette category '+c);
  const socialButton=page.locator('#cefrCategories button[data-cat="Social"]');assert(!(await socialButton.isDisabled()),'Social category unexpectedly empty');
  await socialButton.click();await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>ESCCEFR.category),'Social');
  assert(await page.evaluate(()=>ESC_NEW_GAME.items.length>0&&ESC_NEW_GAME.items.every(x=>x[0]==='Social')),'New-game category filter mixed cards');
  await page.goto(base+'/games/?level=A1-A2');await page.locator('#cefrLevel [data-cefr-level="'+'B1-B2'+'"]') .click();assert(await page.evaluate(()=>[...document.querySelectorAll('a.game-card')].every(a=>new URL(a.href).searchParams.get('level')==='B1-B2')));
  await page.goto(base+'/hot-seat/?level=A3');assert.equal(await page.locator('#cefrLevel').getAttribute('data-level'),'B1-B2');
  assert.deepEqual(extraErrors,[]);results.push({game:'cross-game-regressions',pass:true});
 }catch(e){results.push({game:'cross-game-regressions',pass:false,error:e.message,pageerrors:extraErrors});}
 await page.close();await browser.close();
 fs.writeFileSync('cefr-browser-results.json',JSON.stringify(results,null,2));
 const failures=results.filter(x=>!x.pass);console.log(JSON.stringify({passed:results.filter(x=>x.pass).length,failures},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
