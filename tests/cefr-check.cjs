'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={console,URL,URLSearchParams,location:{pathname:'/tests/',search:'',href:'http://localhost/tests/'},localStorage:{getItem(){return null},setItem(){}},document:{readyState:'loading',addEventListener(){}},setTimeout,clearTimeout};
context.window=context;vm.createContext(context);
for(const file of ['cefr-source.js','cefr-bank.js','cefr-runtime.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const {games,levels}=context.ESCCefrBank;
assert.equal(Object.keys(games).length,32);assert.equal(levels.join(','),'A1,A2,B1,B2,C1');
let total=0;const counts={};
for(const [slug,byLevel] of Object.entries(games)){
 counts[slug]={};
 for(const level of levels){
  assert(context.ESCCEFR.validate(slug,byLevel[level]),`Invalid ${slug}/${level}`);
  const n=context.ESCCEFR.count(byLevel[level]);assert(n>=10&&n<=40,`${slug}/${level}: ${n}`);
  total+=n;counts[slug][level]=n;
  const copy=context.ESCCEFR.get(slug,level);assert.equal(JSON.stringify(copy),JSON.stringify(byLevel[level]));
  if(Array.isArray(copy))copy.length=0;assert(context.ESCCEFR.count(context.ESCCEFR.get(slug,level))>0);
 }
 const html=fs.readFileSync(slug+'/index.html','utf8');
 assert(html.includes('reviewed-cefr-20261007'),`No level boot: ${slug}`);
 assert(!/<script[^>]+src=["'][^"']*game-content-v2/.test(html),`Legacy expansion: ${slug}`);
}
assert.equal(context.ESCCEFR.setLevel('A3'),false);
assert(!context.ESCCEFR.validate('conversation-bingo',['too short']));
assert(!context.ESCCEFR.validate('taboo',[['Test','CAT',['CAT']]]));
assert(!context.ESCCEFR.validate('hot-seat',[['x','Same'],['y','Same']]));
assert(!fs.readFileSync('esc-new-games.js','utf8').includes('ensureExpandedContent'));
for(const file of ['esc-new-games.js','esc-content-editor.js','esc-game-controls.js','esc-depth-pass.js','truth-or-dare/app.js','one-for-me-one-for-you/app.js','admin/admin-data.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
console.log(JSON.stringify({games:32,levels:5,combinations:160,totalGameLevelCards:total,counts},null,2));
