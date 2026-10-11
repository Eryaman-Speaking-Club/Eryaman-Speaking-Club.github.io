'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scripts=['cefr-source.js','cefr-bank.js','cefr50-conversation.js','cefr50-interpersonal.js','cefr50-activities.js','cefr50-structured.js','cefr-groups.js','cefr-clarity.js','cefr-quality.js','cefr-tip-guide.js','cefr-runtime.js'];
const context={console,URL,URLSearchParams,location:{pathname:'/tests/',search:'',href:'http://localhost/tests/'},localStorage:{getItem(){return null},setItem(){}},document:{readyState:'loading',addEventListener(){}},setTimeout,clearTimeout};
context.window=context;vm.createContext(context);
for(const file of scripts)vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const B=context.ESCCefrBank,R=context.ESCCEFR;
assert.equal(B.qualityVersion,'20261011-quality2');
assert.equal(Object.keys(B.games).length,32);
assert.equal(B.levels.length,3);
let total=0;
function questionOf(game,x){
 const type=B.types[game];
 if(type==='paired'||type==='past')return x.q;
 if(type==='problem'&&game==='what-would-you-do-if')return x.q;
 if(type==='ranking'||type==='packing')return JSON.stringify([x.title,x.items]);
 if(type==='detective'||type==='photo')return JSON.stringify([x.title,x.setup||x.desc]);
 if(type==='word'||type==='taboo')return x[1];
 if(type==='emoji')return JSON.stringify(x[1]);
 if(type==='triples')return JSON.stringify(x);
 if(type==='choice')return JSON.stringify(x.slice(1));
 if(type==='truth')return x;
 if(typeof x==='string')return x;
 return Array.isArray(x)?x[1]:(x.q||JSON.stringify(x));
}
const normalize=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const uniqueGames=new Set(['one-for-me-one-for-you','hot-seat','question-roulette','opinion-line','hot-take','worst-advice-only','five-second-challenge','story-chain','two-truths-one-lie','never-have-i-ever','most-likely-to','what-would-you-do-if']);
for(const [game,pools] of Object.entries(B.games))for(const level of B.levels){
 const deck=pools[level],cards=Array.isArray(deck)?deck:[...deck.truths,...deck.dares];
 assert(R.validate(game,deck),'Invalid schema '+game+'/'+level);
 assert(cards.length>=(game==='truth-or-dare'?200:100),'Card count too low '+game+'/'+level);
 total+=cards.length;
 if(B.categorySets[game]){
  const counts=R.categoryCounts(game,level);
  for(const category of B.categorySets[game])assert(counts[category]>0,'Missing category '+game+'/'+level+'/'+category);
 }
 if(uniqueGames.has(game)){
  const seen=new Set();
  for(const [i,x] of cards.entries()){
   const k=normalize(questionOf(game,x));
   assert(!seen.has(k),'Duplicate displayed question '+game+'/'+level+'/'+i+': '+k);
   seen.add(k);
  }
 }
 const html=fs.readFileSync(game+'/index.html','utf8');
 for(const file of ['cefr-quality.js','cefr-tip-guide.js'])assert(html.includes('/'+file+'?v=20261011-quality3'),'Missing new script '+game+'/'+file);
}
for(const level of B.levels){
 const q=game=>new Set(B.games[game][level].map(x=>normalize(questionOf(game,x))));
 const a=q('one-for-me-one-for-you'),b=q('hot-seat'),c=q('question-roulette');
 assert([...a].filter(x=>b.has(x)).length<=5,'Open-game cards overlap too much');
 assert([...a].filter(x=>c.has(x)).length<=5,'One-for-me and roulette overlap too much');
 assert([...b].filter(x=>c.has(x)).length<=5,'Hot Seat and roulette overlap too much');
}
const guide=context.ESCSpeakingTipGuide.build('Which animal would make a terrible bus driver?','hot-seat','B1-B2','quick',false);
assert.equal(guide.cards.length,4);
assert(guide.cards.some(([label,s])=>s.includes('giraffe')),'Help not matched to the current question');
assert.equal(context.ESCSpeakingTipGuide.build('COFFEE','taboo','A1-A2','explain',true),null,'Hidden word leaked');
const feedback=fs.readFileSync('esc-game-controls.js','utf8');
assert(feedback.includes('mountQuestionReport()')&&feedback.includes('mailto:eryamanspeakingclub@gmail.com'),'Question reporting not wired');
console.log(JSON.stringify({games:32,levels:3,cards:total,openOverlapLimit:5,uniqueGames:[...uniqueGames],contextualHelp:true,reportButton:true,passed:true}));
