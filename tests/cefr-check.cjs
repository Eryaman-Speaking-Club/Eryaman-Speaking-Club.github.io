'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={console,URL,URLSearchParams,location:{pathname:'/tests/',search:'',href:'http://localhost/tests/'},localStorage:{getItem(){return null},setItem(){}},document:{readyState:'loading',addEventListener(){}},setTimeout,clearTimeout};
context.window=context;vm.createContext(context);
for(const file of ['cefr-source.js', 'cefr-bank.js', 'cefr50-conversation.js', 'cefr50-interpersonal.js', 'cefr50-activities.js', 'cefr50-structured.js', 'cefr-groups.js', 'cefr-runtime.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const {games,levels}=context.ESCCefrBank;
assert.equal(Object.keys(games).length,32);assert.equal(levels.join(','),'A1-A2,B1-B2,C1-C2');
let total=0;const counts={};
for(const [slug,byLevel] of Object.entries(games)){
 counts[slug]={};
 for(const level of levels){
  assert(context.ESCCEFR.validate(slug,byLevel[level]),`Invalid ${slug}/${level}`);
  const n=context.ESCCEFR.count(byLevel[level]);assert(n>=(slug==='truth-or-dare'?200:100),`${slug}/${level}: ${n}`);
  total+=n;counts[slug][level]=n;
  const copy=context.ESCCEFR.get(slug,level);assert.equal(JSON.stringify(copy),JSON.stringify(byLevel[level]));
  if(Array.isArray(copy))copy.length=0;assert(context.ESCCEFR.count(context.ESCCEFR.get(slug,level))>0);
 }
 const html=fs.readFileSync(slug+'/index.html','utf8');
 assert(html.includes('reviewed-cefr-20261007'),`No level boot: ${slug}`);
 assert(!/<script[^>]+src=["'][^"']*game-content-v2/.test(html),`Legacy expansion: ${slug}`);
}
const coreSpeaking=[
 'truth-or-dare','one-for-me-one-for-you','last-thing-you-did','what-would-you-do-if','would-you-rather','most-likely-to','hot-seat','five-second-challenge','red-flag-green-flag','debate-roulette','never-have-i-ever','two-truths-one-lie','opinion-line','question-roulette','finish-the-sentence','would-i-lie-to-you','worst-advice-only','hot-take'
];
for(const game of coreSpeaking)for(const level of levels)assert(context.ESCCEFR.count(context.ESCCEFR.raw(game,level))>=100,`Core pool too small: ${game}/${level}`);
const categorySummary={};
for(const [game,expected] of Object.entries(context.ESCCefrBank.categorySets)){
 categorySummary[game]={};
 for(const level of levels){
  const cc=context.ESCCEFR.categoryCounts(game,level);
  categorySummary[game][level]=cc;
  for(const c of Object.keys(cc))assert(expected.includes(c),`Unexpected category: ${game}/${level}/${c}`);for(const c of expected)assert(cc[c]>0,`Inactive category: ${game}/${level}/${c}`);
 }
}
for(const level of levels){
 const cc=context.ESCCEFR.categoryCounts('what-would-you-do-if',level);
 for(const c of context.ESCCefrBank.categorySets['what-would-you-do-if'])assert(cc[c]>0,`Missing What If category: ${level}/${c}`);
}
assert.equal(context.ESCCEFR.setLevel('A3'),false);
assert(!context.ESCCEFR.validate('conversation-bingo',['too short']));
assert(!context.ESCCEFR.validate('taboo',[['Test','CAT',['CAT']]]));
assert(!context.ESCCEFR.validate('hot-seat',[['x','Same'],['y','Same']]));
assert(!fs.readFileSync('esc-new-games.js','utf8').includes('ensureExpandedContent'));
for(const file of ['esc-new-games.js','esc-content-editor.js','esc-game-controls.js','esc-depth-pass.js','truth-or-dare/app.js','one-for-me-one-for-you/app.js','admin/admin-data.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
console.log(JSON.stringify({games:32,levels:3,combinations:96,totalGameLevelCards:total,counts,categorySummary},null,2));
