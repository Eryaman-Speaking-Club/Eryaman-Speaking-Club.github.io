'use strict';
// Exercise the real controls in every game. All backend writes are isolated mocks.
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const levels=['A1','A2','B1','B2','C1'],base='http://127.0.0.1:8123';
const games=Object.keys(JSON.parse(fs.readFileSync('cefr-counts.json','utf8')).counts);
(async()=>{
 const browser=await chromium.launch({headless:true}),db={};
 const context=await browser.newContext({viewport:{width:1280,height:1000}});
 await context.route(/^https?:\/\/(?!127\.0\.0\.1:8123)/,r=>r.abort());
 await context.exposeBinding('readLibrary',(_,s)=>db[s]||{unrelatedSetting:'keep',content:[['legacy','UNREVIEWED_SENTINEL']]});
 await context.exposeBinding('writeLibrary',(_,s,x)=>{db[s]=JSON.parse(JSON.stringify(x))});
 await context.addInitScript(()=>{
  window.ESCSupabase={isConfigured:()=>false,getGameSettings:s=>window.readLibrary(s),saveGameSettings:(s,x)=>window.writeLibrary(s,x),isAdmin:async()=>true,getSession:async()=>({user:{id:'test',email:'qa@example.invalid'}}),getClient:async()=>null};
  localStorage.setItem('esc-truth-dare-v1',JSON.stringify({names:['Player One','Player Two'],truths:['UNREVIEWED_SENTINEL'],dares:['UNREVIEWED_SENTINEL']}));
 });
 const results=[];let cursor=0;
 async function test(slug){
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(7000);page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base+'/'+slug+'/?level=A1',{waitUntil:'domcontentloaded'});
   await page.waitForSelector('#cefrLevel button');
   assert.equal(await page.locator('select#cefrLevel').count(),0,'A dropdown remains');
   assert.deepEqual(await page.locator('#cefrLevel button').allTextContents(),levels);
   for(const level of levels){
    await page.locator('#cefrLevel [data-cefr-level="'+level+'"]').click();await page.waitForTimeout(60);
    const state=await page.evaluate(()=>({level:ESCCEFR.level,loading:document.documentElement.hasAttribute('data-cefr-loading'),raw:ESCCEFR.count(ESCCEFR.raw()),pressed:[...document.querySelectorAll('#cefrLevel [aria-pressed="true"]')].map(b=>b.textContent),poolOK:!window.ESC_NEW_GAME||JSON.stringify(ESC_NEW_GAME.items)===JSON.stringify(ESCCEFR.get()),body:document.body.innerText}));
    assert.equal(state.level,level);assert.deepEqual(state.pressed,[level]);assert(!state.loading,'Loading did not clear');assert(state.poolOK,'Wrong new-game pool');assert(!state.body.includes('UNREVIEWED_SENTINEL'));
    const expected=slug==='truth-or-dare'?100:50;assert.equal(state.raw,expected);assert.equal((await page.locator('#cefrPoolCount').textContent()).trim(),expected+' kart / '+level+(ESCCEFR.category!=='All'?' / '+ESCCEFR.category:''));
    const host=page.locator('#cefrCategories,#filters,#chips').first();let categories=[];
    if(await host.count())categories=await host.locator('button[data-cat]:not([disabled])').evaluateAll(bs=>bs.map(b=>b.dataset.cat));
    for(const category of categories){
     if(category==='All')continue;
     await page.locator('#cefrCategories,#filters,#chips').first().getByRole('button',{name:category,exact:true}).click();
     const selected=await page.evaluate(()=>({category:ESCCEFR.category,n:ESCCEFR.count(ESCCEFR.get()),good:ESCCEFR.get().every(x=>ESCCEFR.categoryOf(ESCCEFR.slug,x)===ESCCEFR.category),poolOK:!window.ESC_NEW_GAME||JSON.stringify(ESC_NEW_GAME.items)===JSON.stringify(ESCCEFR.get())}));
     assert.equal(selected.category,category);assert(selected.n>0&&selected.good&&selected.poolOK,'Category did not filter its level');
     const next=page.locator('#next,#skip,#nextBtn').first();if(await next.count()&&await next.isVisible()&&await next.isEnabled())await next.click();
    }
    if(categories.includes('All'))await page.locator('#cefrCategories,#filters,#chips').first().getByRole('button',{name:'All',exact:true}).click();
    results.push({game:slug,level,cards:state.raw,activeCategories:categories.length,passed:true});
   }
   if(['what-would-you-do-if','debate-roulette','would-you-rather','one-for-me-one-for-you','truth-or-dare','question-roulette'].includes(slug)){
    await page.locator('#cefrLevel [data-cefr-level="A1"]').click();
    await page.screenshot({path:'cefr50-'+slug+'-desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:'cefr50-'+slug+'-mobile.png',fullPage:true});
    const dims=await page.locator('#cefrLevel').evaluate(e=>({width:e.getBoundingClientRect().width,scroll:e.scrollWidth}));assert(dims.scroll<=dims.width+2,'Level controls overflow on mobile');
   }
   assert.deepEqual(errors,[]);
  }catch(e){results.push({game:slug,passed:false,error:e.message,pageerrors:errors});await page.screenshot({path:'cefr50-'+slug+'-failure.png',fullPage:true});}
  finally{await page.close()}
 }
 async function worker(){while(cursor<games.length)await test(games[cursor++]);}
 await Promise.all(Array.from({length:4},worker));
 const page=await context.newPage();page.setDefaultTimeout(8000);
 try{
  await page.goto(base+'/what-would-you-do-if/?level=A1');
  await page.locator('#filters button[data-cat="Money"]').click();
  await page.locator('#cefrLevel [data-cefr-level="C1"]').click();assert.equal(await page.evaluate(()=>ESCCEFR.category),'Money');
  await page.reload();await page.waitForSelector('#cefrLevel button');assert.deepEqual(await page.evaluate(()=>[ESCCEFR.level,ESCCEFR.category]),['C1','Money']);
  await page.evaluate(()=>{void ESCCEFR.editor()});await page.waitForSelector('dialog[open]');
  assert.equal(JSON.parse(await page.locator('[data-cefr-json]').inputValue()).length,50,'Editor opened only filtered cards');
  await page.locator('[data-cefr-field="q"]').fill('When can a clear rule still produce an unfair outcome?');
  await page.getByRole('button',{name:'Kaydet ve yayınla',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('dialog')?.textContent.includes('Kaydedildi ve sunucudan'));
  assert.equal(db['what-would-you-do-if'].cefr.levels.C1.length,50,'Filtered edit deleted other categories');assert.equal(db['what-would-you-do-if'].unrelatedSetting,'keep');
  await page.locator('.cefr-dialog-head button').click();await page.reload();await page.waitForFunction(()=>ESCCEFR.raw()[0].q==='When can a clear rule still produce an unfair outcome?');
  await page.locator('#cefrLevel [data-cefr-level="A1"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>ESCCEFR.level),'A1');
  results.push({game:'filter-persistence-full-editor-keyboard',passed:true});
 }catch(e){results.push({game:'filter-persistence-full-editor-keyboard',passed:false,error:e.message});}
 await page.close();await browser.close();
 fs.writeFileSync('cefr50-buttons-results.json',JSON.stringify(results,null,2));
 const failures=results.filter(r=>!r.passed);console.log(JSON.stringify({passed:results.filter(r=>r.passed).length,failures},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
