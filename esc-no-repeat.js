/* Eryaman Speaking Club -- fair question rotation.
   A question is dealt once per game/CEFR level until the eligible deck is exhausted.
   Changing category, using Shuffle or reloading keeps the same local progress.
   This is per browser only, never sent to a server. */
(function(root){
'use strict';
if(root.ESCNoRepeat)return;
const PREFIX='esc-seen-v1:', memory=new Map();
const clean=s=>String(s==null?'':s).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const level=()=>root.ESCCEFR?.level||'B1-B2';
function prompt(game,card){
 if(typeof card==='string')return card;
 if(!card)return '';
 const type=root.ESCCefrBank?.types?.[game];
 if(Array.isArray(card)){
  if(type==='choice'||type==='twoTruths')return JSON.stringify(card.slice(1));
  if(type==='triples')return JSON.stringify(card);
  if(type==='emoji')return JSON.stringify(card[1]);
  if(type==='taboo'||type==='word')return card[1];
  if(type==='bingo')return card.join(' | ');
  return card[1]||JSON.stringify(card);
 }
 if(typeof card==='object'){
  if(typeof card.q==='string')return card.q;
  if(typeof card.item==='string')return card.item+' | '+(card.twist||'');
  if(typeof card.title==='string')return card.title;
  if(typeof card.setup==='string')return card.setup;
 }
 return JSON.stringify(card);
}
function key(game,card){return clean(prompt(game,card))}
function storageKey(game,variant){return PREFIX+game+':'+level()+(variant?':'+variant:'')}
function read(store){
 let content;
 try{content=root.localStorage?.getItem(store)}catch(_){}
 if(!content&&memory.has(store))content=JSON.stringify(memory.get(store));
 try{
  const obj=JSON.parse(content||'null');
  if(obj&&Array.isArray(obj.used)&&obj.used.length<=6000){
   return {used:[...new Set(obj.used.filter(x=>typeof x==='string'))],last:typeof obj.last==='string'?obj.last:''};
  }
 }catch(_){}
 return {used:[],last:''};
}
function write(store,obj){
 // Retain the most recent items only if a user imports an unusually large bank.
 if(obj.used.length>5000)obj.used=obj.used.slice(-5000);
 memory.set(store,{used:obj.used.slice(),last:obj.last});
 try{root.localStorage?.setItem(store,JSON.stringify(obj))}catch(_){}
}
function randomise(items){
 const array=[...items];
 for(let i=array.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];
 }
 return array;
}
function unique(game,items){
 const seen=new Set(),out=[];
 for(const card of items||[]){
  const id=key(game,card);
  if(!id||seen.has(id))continue;
  seen.add(id);out.push(card);
 }
 return out;
}
function makeDeck(game,items,variant=''){
 const pool=unique(game,items),store=storageKey(game,variant);
 if(!pool.length)return [];
 const state=read(store),used=new Set(state.used);
 let remaining=pool.filter(x=>!used.has(key(game,x)));
 if(!remaining.length){
  const eligible=new Set(pool.map(x=>key(game,x)));
  state.used=state.used.filter(x=>!eligible.has(x));
  write(store,state);
  remaining=pool;
  // A new round is inevitable after every available question has appeared.
  try{root.ESCGameKit?.toast?.('All questions used · Starting a new shuffled round.')}catch(_){}
 }
 const deck=randomise(remaining);
 if(deck.length>1&&key(game,deck[0])===state.last){
  const swap=deck.findIndex((x,i)=>i>0&&key(game,x)!==state.last);
  if(swap>0)[deck[0],deck[swap]]=[deck[swap],deck[0]];
 }
 return deck;
}
function mark(game,card,variant=''){
 const id=key(game,card);if(!id)return false;
 const store=storageKey(game,variant),state=read(store);
 if(!state.used.includes(id))state.used.push(id);
 state.last=id;write(store,state);return true;
}
function pick(game,items,variant=''){
 const deck=makeDeck(game,items,variant);
 const first=deck[0]||null;
 if(first!==null)mark(game,first,variant);
 return first;
}
function drawMany(game,items,count,variant=''){
 const pool=unique(game,items);
 if(pool.length<count||count<=0)return [];
 const store=storageKey(game,variant),state=read(store),used=new Set(state.used);
 let left=randomise(pool.filter(item=>!used.has(key(game,item))));
 if(left.length<count){
  // Use the remaining fresh prompts first, then complete the board from a
  // new cycle. No duplicates inside a bingo card.
  const selected=left.slice();
  const selectedIds=new Set(selected.map(x=>key(game,x)));
  const eligible=new Set(pool.map(x=>key(game,x)));
  state.used=state.used.filter(id=>!eligible.has(id));
  write(store,state);
  let fresh=randomise(pool.filter(item=>!selectedIds.has(key(game,item))));
  left=[...selected,...fresh];
 }else if(left.length>1&&key(game,left[0])===state.last){
  const j=left.findIndex((x,i)=>i>0&&key(game,x)!==state.last);
  if(j>0)[left[0],left[j]]=[left[j],left[0]];
 }
 const chosen=left.slice(0,count);
 chosen.forEach(x=>mark(game,x,variant));
 return chosen;
}
function progress(game,items,variant=''){
 const pool=unique(game,items),seen=new Set(read(storageKey(game,variant)).used);
 return {available:pool.length,used:pool.filter(x=>seen.has(key(game,x))).length};
}
root.ESCNoRepeat={key,makeDeck,mark,pick,drawMany,progress};
})(window);
