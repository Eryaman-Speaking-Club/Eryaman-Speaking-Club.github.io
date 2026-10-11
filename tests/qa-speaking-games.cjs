'use strict';
/* Isolated mock test: no reads or writes against live Supabase. */
const {chromium}=require('playwright');
const fs=require('node:fs'), assert=require('node:assert/strict');
const base='http://127.0.0.1:8123';
const games=['question-roulette','one-for-me-one-for-you','hot-seat','taboo','never-have-i-ever','hot-take',
'would-you-rather','five-second-challenge','story-chain','truth-or-dare',
'what-would-you-do-if','opinion-line','three-clues','emoji-story',
'red-flag-green-flag','most-likely-to','worst-advice-only','ranking-room'];
const bands=['A1-A2','B1-B2','C1-C2'];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:850}});
 await context.route(/^https?:\/\/(?!127\.0\.0\.1:8123)/,route=>route.abort());
 await context.addInitScript(()=>{
  window.ESCSupabase={isConfigured:()=>false,getGameSettings:async()=>null,getClient:async()=>null};
 });
 const results=[];let failures=0;
 for(const slug of games){
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.setDefaultTimeout(8000);
  try{
   await page.goto(base+'/'+slug+'/?level=A1-A2',{waitUntil:'domcontentloaded'});
   await page.locator('#cefrLevel [data-cefr-level="A1-A2"]').waitFor();
   const btn=page.locator('.esc-answer-help-btn');
   assert.equal(await page.locator('.esc-question-report-btn').count(),1,'Question report button missing');
   assert.equal(await btn.count(),1,'Missing help button');
   assert(await btn.isVisible(),'Help button hidden');
   for(const band of bands){
    await page.locator('#cefrLevel [data-cefr-level="'+band+'"]').click();
    await page.waitForTimeout(80);
    const state=await page.evaluate(()=>({
     band:window.ESCCEFR?.level,
     count:window.ESCCEFR?.count(window.ESCCEFR?.get()),
     loading:document.documentElement.hasAttribute('data-cefr-loading')
    }));
    assert.equal(state.band,band,'Wrong CEFR level');
    assert(state.count>=100,'Card count too low');
    assert(!state.loading,'Game stuck loading');
    await btn.click();
    const modal=page.locator('dialog.cefr-tips-dialog[open]');
    await modal.waitFor();
    const cards=modal.locator('.cefr-tip-card');
    assert.equal(await cards.count(),4,'Tips panel must contain four examples');
    const samples=await cards.allTextContents();
    assert(samples.every(x=>x.trim().length>25),'Incomplete example card');
    const inDialog=await modal.innerText();
    assert(inDialog.includes(band),'Wrong help level');
    assert(inDialog.length>130,'Help has no useful explanation');
    await modal.locator('.cefr-dialog-head button').click();
    assert.equal(await page.locator('dialog.cefr-tips-dialog[open]').count(),0,'Help modal cannot close');
   }
   await page.setViewportSize({width:390,height:844});
   await page.locator('#cefrLevel [data-cefr-level="A1-A2"]').click();
   await btn.click();
   const d=page.locator('dialog.cefr-tips-dialog[open]');
   await d.waitFor();
   const dimensions=await page.evaluate(()=>({
    viewport:innerWidth,
    dialogWidth:document.querySelector('dialog.cefr-tips-dialog')?.getBoundingClientRect().width,
    bodyScroll:document.documentElement.scrollWidth
   }));
   assert(dimensions.dialogWidth<=dimensions.viewport+2,'Help modal wider than screen');
   assert.equal(await d.locator('.cefr-tip-card').count(),4,'Missing cards on mobile');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('dialog.cefr-tips-dialog[open]').count(),0,'Escape did not close help');
   assert.equal(errors.length,0,'Page errors: '+errors.join(' | '));
   results.push({slug,ok:true,tested_levels:3,mobile:true,errors:[]});
  }catch(error){
   failures++;
   results.push({slug,ok:false,error:error.message,page_errors:errors});
  }finally{await page.close()}
 }
 await browser.close();
 fs.writeFileSync('qa-speaking-games-results.json',JSON.stringify({games:games.length,levels:bands.length,failures,results},null,2));
 console.log(JSON.stringify({games:games.length,levels:bands.length,passed:games.length-failures,failures:results.filter(x=>!x.ok)},null,2));
 if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
