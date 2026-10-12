'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('esc-no-repeat.js','utf8');
function newBrowser(storage,game='hot-seat',level='A1-A2'){
 const o={...storage},localStorage={
   getItem(k){return Object.hasOwn(o,k)?o[k]:null},
   setItem(k,v){o[k]=String(v)},
   removeItem(k){delete o[k]}
 };
 const w={ESCCEFR:{level},ESCCefrBank:{types:{'hot-seat':'open','taboo':'taboo','truth-or-dare':'truth','conversation-bingo':'bingo','one-for-me-one-for-you':'paired'}},ESCGameKit:{toast(){}},localStorage};
 const sandbox={window:w,localStorage,console,Math};vm.createContext(sandbox);vm.runInContext(code,sandbox,{filename:'esc-no-repeat.js'});
 return {w,storage:o,api:w.ESCNoRepeat};
}
const pool=Array.from({length:100},(_,i)=>['Everyday','Question '+i+'?']);
let storage={};let b=newBrowser(storage),seen=new Set(),count=0;
function deal(){const deck=b.api.makeDeck('hot-seat',pool);assert(deck.length,'No remaining cards');const q=b.api.key('hot-seat',deck[0]);assert(!seen.has(q),'Repeated question before the deck was exhausted');seen.add(q);b.api.mark('hot-seat',deck[0]);return q}
for(let i=0;i<15;i++)deal();
storage=b.storage;b=newBrowser(storage);
for(let i=15;i<100;i++)deal();
assert.equal(seen.size,100);assert.equal(b.api.progress('hot-seat',pool).used,100);
const last=[...seen].at(-1),cycle=b.api.makeDeck('hot-seat',pool);
assert.equal(cycle.length,100,'A fresh cycle should have all 100 available');
assert.notEqual(b.api.key('hot-seat',cycle[0]),last,'Do not repeat the same card at the cycle boundary');
b.api.mark('hot-seat',cycle[0]);
assert.equal(b.api.progress('hot-seat',pool).used,1,'A new cycle did not restart cleanly');
const group=pool.slice(0,5), other=pool.slice(5,10);
let q1=newBrowser({});
let groupFirst=q1.api.makeDeck('hot-seat',group)[0];q1.api.mark('hot-seat',groupFirst);
assert.equal(q1.api.progress('hot-seat',pool).used,1);
assert.equal(q1.api.makeDeck('hot-seat',group).length,4,'Category must exclude previous prompts');
assert.equal(q1.api.makeDeck('hot-seat',other).length,5,'Other category must not be cleared');
q1.w.ESCCEFR.level='B1-B2';assert.equal(q1.api.progress('hot-seat',pool).used,0,'Levels must be isolated');
q1.w.ESCCEFR.level='A1-A2';assert.equal(q1.api.progress('hot-seat',pool).used,1,'Returning to a level loses history');
assert.equal(q1.api.progress('other-game',pool).used,0,'Different games share history');
const truth=['I ate pizza.','I have a cat.','I know three languages.'];
q1.api.pick('truth-or-dare',truth,'truth');
assert.equal(q1.api.progress('truth-or-dare',truth,'truth').used,1);
assert.equal(q1.api.progress('truth-or-dare',truth,'dare').used,0,'Dares must be separate');
const dupe=[...pool,['Different category','Question 3?']];
assert.equal(q1.api.makeDeck('hot-seat',dupe).length,99,'Duplicate wording must be a single card');
assert.equal(q1.api.key('taboo',['Vocab','COFFEE',['DRINK','CAFE']]),'coffee');
assert.equal(q1.api.key('one-for-me-one-for-you',{id:'x',q:'What is your favourite book?'}),'what is your favourite book?');
const bingo=Array.from({length:100},(_,i)=>'Find a person who likes hobby '+i);
let boardBrowser=newBrowser({}),squares=new Set(),boards=[];
for(let i=0;i<6;i++){
 const drawn=boardBrowser.api.drawMany('conversation-bingo',bingo,16);
 assert.equal(drawn.length,16);
 for(const cell of drawn){assert(!squares.has(cell),'Bingo square repeated before pool exhaustion');squares.add(cell)}
 boards.push(drawn);
}
assert.equal(squares.size,96);
const seventh=boardBrowser.api.drawMany('conversation-bingo',bingo,16);
assert.equal(new Set(seventh).size,16,'Duplicate inside bingo board');
assert(seventh.some(x=>!squares.has(x)),'Remaining 4 new bingo squares were not used');
assert.equal(boardBrowser.api.progress('conversation-bingo',bingo).used,16);

/* Static integration guard: re-generating the site must not undo the adapters. */
const legacy=['last-thing-you-did','what-would-you-do-if','would-you-rather','most-likely-to','hot-seat','five-second-challenge','red-flag-green-flag','debate-roulette','never-have-i-ever'];
for(const slug of legacy){
 const html=fs.readFileSync(slug+'/index.html','utf8');
 assert(html.includes("ESCNoRepeat.makeDeck('"+slug+"'"),'Legacy deck is not guarded: '+slug);
 assert(html.includes("ESCNoRepeat.mark('"+slug+"'"),'Legacy displayed card is not recorded: '+slug);
}
const external=[
 ['taboo/round.js',"ESCNoRepeat.makeDeck('taboo'","ESCNoRepeat.mark('taboo'"],
 ['one-for-me-one-for-you/app.js',"ESCNoRepeat.makeDeck('one-for-me-one-for-you'","ESCNoRepeat.mark('one-for-me-one-for-you'"],
 ['truth-or-dare/app.js',"ESCNoRepeat.pick('truth-or-dare'","state.settings.noRepeat=true"],
 ['esc-new-games.js','ESCNoRepeat.makeDeck(cfg.slug','ESCNoRepeat.drawMany(cfg.slug']
];
for(const [file,...needles]of external){
 const js=fs.readFileSync(file,'utf8');
 for(const needle of needles)assert(js.includes(needle),'No-repeat adapter missing in '+file+': '+needle);
}
const slugs=[
'truth-or-dare','one-for-me-one-for-you','last-thing-you-did','what-would-you-do-if','would-you-rather','most-likely-to','hot-seat','five-second-challenge','red-flag-green-flag','taboo','debate-roulette','never-have-i-ever',
'two-truths-one-lie','who-am-i','story-chain','explain-it-badly','opinion-line','ranking-room','question-roulette','detective-alibi','finish-the-sentence','three-clues','secret-mission','one-minute-story',
'would-i-lie-to-you','desert-island','conversation-bingo','emoji-story','worst-advice-only','sell-me-this','hot-take','photo-talk'
];
assert.equal(slugs.length,32);
for(const slug of slugs){
 const html=fs.readFileSync(slug+'/index.html','utf8');
 assert(html.includes('/esc-no-repeat.js?v=20261012-norepeat1'),'Question rotation script not loaded: '+slug);
 assert(html.indexOf('esc-no-repeat.js')<html.lastIndexOf('</head>'),'Question rotation loads after the game: '+slug);
}

console.log(JSON.stringify({passed:true,testedQuestions:100,cycles:2,persistent:true,perLevel:true,perGame:true,separateTruthDare:true,categoryRetention:true,bingoUniqueSquares:96,bingoBoards:7}));
