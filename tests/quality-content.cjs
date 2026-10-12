'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scripts=['cefr-source.js','cefr-bank.js','cefr50-conversation.js','cefr50-interpersonal.js','cefr50-activities.js','cefr50-structured.js','cefr-groups.js','cefr-clarity.js','cefr-quality.js','cefr-tip-guide.js','cefr-runtime.js'];
const context={console,URL,URLSearchParams,location:{pathname:'/tests/',search:'',href:'http://localhost/tests/'},localStorage:{getItem(){return null},setItem(){}},document:{readyState:'loading',addEventListener(){}},setTimeout,clearTimeout};
context.window=context;vm.createContext(context);
for(const file of scripts)vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const B=context.ESCCefrBank,R=context.ESCCEFR;
assert.equal(B.qualityVersion,'20261011-quality4');
assert.equal(Object.keys(B.games).length,32);
assert.equal(B.curriculumVersion,'20261011-curriculum1');
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
 for(const file of ['cefr-quality.js','cefr-tip-guide.js'])assert(html.includes('/'+file+'?v=20261012-norepeat2'),'Missing new script '+game+'/'+file);
}
for(const level of B.levels){
 const q=game=>new Set(B.games[game][level].map(x=>normalize(questionOf(game,x))));
 const a=q('one-for-me-one-for-you'),b=q('hot-seat'),c=q('question-roulette');
 assert([...a].filter(x=>b.has(x)).length<=5,'Open-game cards overlap too much');
 assert([...a].filter(x=>c.has(x)).length<=5,'One-for-me and roulette overlap too much');
 assert([...b].filter(x=>c.has(x)).length<=5,'Hot Seat and roulette overlap too much');
}
const storyEasy=B.games['story-chain']['A1-A2'];
assert(storyEasy.every(row=>!row[1].includes('Then a surprise changes the plan.')),'A1 stories still repeat the same twist');
const lastAdvanced=B.games['last-thing-you-did']['C1-C2'];
assert(lastAdvanced.every(item=>(item.q.match(/\?/g)||[]).length===1),'C1 last-thing cards must have one clear question');
assert.equal(new Set(lastAdvanced.map(item=>item.q.toLowerCase())).size,100,'C1 last-thing must have 100 distinct questions');

// The word games now share only a portion of their vocabulary.
for(const level of B.levels){
 const original=new Set(B.games['taboo'][level].map(x=>String(x[1]).toLowerCase()));
 for(const slug of ['who-am-i','three-clues','explain-it-badly']){
  const words=B.games[slug][level].map(x=>String(x[1]).toLowerCase());
  assert.equal(words.length,100,'Wrong word-card count: '+slug+'/'+level);
  assert.equal(new Set(words).size,100,'Repeated target word: '+slug+'/'+level);
  assert([...words].filter(x=>original.has(x)).length<=60,'Word-game overlap too high: '+slug+'/'+level);
 }
}
// Roulette must retain the follow-up question on every card.
for(const level of B.levels)
 for(const x of B.games['question-roulette'][level])
  assert(typeof x[2]==='string'&&x[2].endsWith('?'),'Missing roulette follow-up: '+level);


/* Grammar must match the "I HAVE / NEVER" game and never ask about habits. */
const experiences=B.games['never-have-i-ever']['A1-A2'];
assert.equal(experiences.length,100,'A1 experience bank shrank');
assert(experiences.every(item=>/^Have you ever [a-z].+\?$/.test(item[1])),'Never Have I Ever has a mismatched question');
assert.equal(new Set(experiences.map(item=>item[1].toLowerCase())).size,100,'Repeated easy experiences');
for(const level of B.levels){
 const debate=new Set(B.games['debate-roulette'][level].map(item=>item[1].toLowerCase()));
 for(const game of ['opinion-line','hot-take']){
  const overlapping=B.games[game][level].filter(item=>debate.has(item[1].toLowerCase()));
  assert(overlapping.length<=40,game+' reuses too many Debate Roulette motions: '+level+'/'+overlapping.length);
 }
}
for(const game of ['taboo','who-am-i','explain-it-badly','three-clues']){
 const words=B.games[game]['C1-C2'].map(item=>item[1].toUpperCase());
 for(const term of ['PROPORTIONALITY','RECIPROCITY','INSTITUTIONAL INERTIA','MARGINAL BENEFIT'])
  assert(!words.includes(term),'Unplayable advanced jargon remained: '+game+'/'+term);
 assert.equal(new Set(words).size,100,'C1 target words duplicated: '+game);
}

const neverTips=context.ESCSpeakingTipGuide.build('Have you ever left your keys at home?','never-have-i-ever','A1-A2','past',false);
assert.equal(neverTips.cards.length,4);
assert(neverTips.cards[0][1].includes('left my keys at home'), 'The help should match the actual experience and use correct pronouns');
assert(neverTips.cards[1][1].includes("No, I haven't"), 'Both voting options need an example');
const guide=context.ESCSpeakingTipGuide.build('Which animal would make a terrible bus driver?','hot-seat','B1-B2','quick',false);
assert.equal(guide.cards.length,4);
assert(guide.cards.some(([label,s])=>s.includes('giraffe')),'Help not matched to the current question');
assert.equal(context.ESCSpeakingTipGuide.build('COFFEE','taboo','A1-A2','explain',true),null,'Hidden word leaked');
const feedback=fs.readFileSync('esc-game-controls.js','utf8');
assert(feedback.includes('mountQuestionReport()')&&feedback.includes('mailto:eryamanspeakingclub@gmail.com'),'Question reporting not wired');
console.log(JSON.stringify({games:32,levels:3,cards:total,openOverlapLimit:5,uniqueGames:[...uniqueGames],contextualHelp:true,reportButton:true,passed:true}));
