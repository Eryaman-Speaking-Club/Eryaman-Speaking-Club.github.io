/* CEFR build applied */
/* CEFR practice levels. The current level owns its own deck; ungraded legacy
   content is preserved in storage, but never mixed into a graded session. */
(function(){
'use strict';
/* direct-level-buttons-release50 */
const bank=window.ESCCefrBank;if(!bank)return;
const LEVELS=bank.levels,slug=window.ESC_CEFR_PAGE_SLUG||location.pathname.split('/').find(part=>bank.games[part]||part==='games'||part==='admin')||'',supported=!!bank.games[slug],KEY='eryaman-cefr-level-v1';
const copy=x=>JSON.parse(JSON.stringify(x));
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const LEGACY_LEVEL_MAP={A1:'A1-A2',A2:'A1-A2',B1:'B1-B2',B2:'B1-B2',C1:'C1-C2',C2:'C1-C2'};
const normalizeLevel=v=>LEVELS.includes(v)?v:(LEGACY_LEVEL_MAP[v]||null);
let saved=LEVELS[1]||LEVELS[0];try{saved=localStorage.getItem(KEY)||saved}catch(_){}
const requested=new URLSearchParams(location.search).get('level');
let level=normalizeLevel(requested)||normalizeLevel(saved)||LEVELS[1]||LEVELS[0],revision=0;
/* cefr-category-state-20261007 */
let category=new URLSearchParams(location.search).get('category')||'All';
try{localStorage.setItem(KEY,level)}catch(_){}
const listeners=new Set(),overrides={},loaded=new Set(),syncs=new Map();
const count=x=>Array.isArray(x)?x.length:(x?.truths?.length||0)+(x?.dares?.length||0);
const text=x=>typeof x==='string'&&x.trim().length>0&&x.length<1600;
function validItem(game,x){
 const type=bank.types[game];
 if(['mission','bingo'].includes(type))return text(x);
 if(type==='paired')return x&&text(x.q)&&text(x.f)&&text(x.id)&&(!x.level||LEVELS.includes(x.level));
 if(['past'].includes(type)||(type==='problem'&&game==='what-would-you-do-if'))return x&&text(x.c)&&text(x.q);
 if(['ranking','packing'].includes(type))return x&&text(x.title)&&Array.isArray(x.items)&&x.items.length===(type==='ranking'?5:6)&&x.items.every(text)&&new Set(x.items).size===x.items.length;
 if(type==='sell')return x&&text(x.item)&&text(x.twist);
 if(type==='detective')return x&&text(x.title)&&text(x.setup)&&Array.isArray(x.facts)&&x.facts.length>=2&&x.facts.every(text);
 if(type==='photo')return x&&text(x.title)&&text(x.desc)&&Array.isArray(x.icons)&&x.icons.every(text)&&Array.isArray(x.questions)&&x.questions.length>=1&&x.questions.every(text);
 if(type==='triples')return Array.isArray(x)&&x.length===3&&x.every(text)&&new Set(x).size===3;
 if(type==='emoji')return Array.isArray(x)&&text(x[0])&&Array.isArray(x[1])&&x[1].length>=3&&x[1].every(text);
 if(type==='taboo')return Array.isArray(x)&&text(x[0])&&text(x[1])&&Array.isArray(x[2])&&x[2].length>=1&&x[2].length<=4&&x[2].every(text)&&new Set(x[2].map(v=>v.toLowerCase())).size===x[2].length&&!x[2].some(v=>v.toLowerCase()===x[1].toLowerCase());
 if(['choice','twoTruths'].includes(type))return Array.isArray(x)&&x.length===3&&x.every(text)&&x[1]!==x[2];
 return Array.isArray(x)&&x.length>=2&&text(x[0])&&text(x[1]);
}
function validate(game,payload){
 if(!bank.games[game])return false;
 if(bank.types[game]==='truth')return payload&&['truths','dares'].every(k=>Array.isArray(payload[k])&&payload[k].length>0&&payload[k].every(text)&&new Set(payload[k].map(s=>s.trim().toLowerCase())).size===payload[k].length);
 if(!Array.isArray(payload)||payload.length<(bank.types[game]==='bingo'?16:1)||payload.length>5000)return false;
 if(!payload.every(x=>validItem(game,x)))return false;
 if(bank.types[game]==='paired'&&new Set(payload.map(x=>x.id)).size!==payload.length)return false;
 const keys=payload.map(x=>canonical(bank.types[game]==='paired'?x.q:(Array.isArray(x)&&bank.types[game]!=='triples'?x.slice(1):x)).toLowerCase().replace(/\s+/g,' '));
 return new Set(keys).size===keys.length;
}
function categoryOf(game,x){
 const type=bank.types[game];
 if(type==='paired')return x?.category||null;
 if(type==='past'||(type==='problem'&&game==='what-would-you-do-if'))return x?.c||null;
 if(['ranking','packing','detective','photo'].includes(type))return x?.cat||null;
 if(['mission','bingo','triples','sell','truth'].includes(type))return null;
 if(Array.isArray(x)&&['emoji','taboo','choice','twoTruths','word','story','finish','social','challenge','flag','motion','experience','open','personal','problem'].includes(type))return x[0]||null;
 return null;
}
function raw(game=slug,l=level){if(!bank.games[game]||!LEVELS.includes(l))return[];return copy(overrides[game]?.[l]||bank.games[game][l])}
function categoryCounts(game=slug,l=level){const p=raw(game,l),counts={};if(Array.isArray(p))for(const x of p){const c=categoryOf(game,x);if(c)counts[c]=(counts[c]||0)+1}return counts}
function categories(game=slug,l=level){const counts=categoryCounts(game,l),ordered=bank.categorySets?.[game]||[];const active=ordered.filter(c=>counts[c]>0),extras=Object.keys(counts).filter(c=>!ordered.includes(c)&&counts[c]>0);return [...active,...extras]}
function filterPayload(game,payload,cat){if(cat==='All'||!Array.isArray(payload))return payload;return payload.filter(x=>categoryOf(game,x)===cat)}
function get(game=slug,l=level,cat=(game===slug&&l===level?category:'All')){const p=raw(game,l);return copy(filterPayload(game,p,cat))}
function stats(game,config){return LEVELS.map(l=>{const p=config?.cefr?.version===1&&validate(game,config.cefr.levels?.[l])?config.cefr.levels[l]:raw(game,l);return {level:l,count:count(p)}})}
const description={
 'A1-A2':['Temel','Günlük konular; kısa ve basit cümlelerden biraz daha ayrıntılı anlatıma geç.','Use clear everyday English. A short answer is fine; add one simple detail if you can.'],
 'B1-B2':['Orta','Deneyimini açıkla; neden ver, örnek kullan ve gerektiğinde seçenekleri karşılaştır.','Explain your reason, give an example, and compare another reasonable option when useful.'],
 'C1-C2':['İleri','Nüans, varsayım, istisna ve karşı görüşleri değerlendir; görüşünü hassas biçimde savun.','Qualify your view, make assumptions explicit, and address a plausible counterargument or exception.']};
function notify(reason){if(category!=='All'&&!categoryCounts(slug,level)[category])category='All';revision++;for(const fn of listeners){try{fn(level,reason)}catch(e){console.error('CEFR deck refresh failed',e)}}paint();document.dispatchEvent(new CustomEvent('eryaman:levelchange',{detail:{level,reason}}))}
function updateLocation(){
 try{localStorage.setItem(KEY,level);const u=new URL(location.href);u.searchParams.set('level',level);if(category==='All')u.searchParams.delete('category');else u.searchParams.set('category',category);window.history.replaceState(null,'',u)}catch(_){}
}
function setLevel(l){
 if(!LEVELS.includes(l)||l===level)return false;
 level=l;if(category!=='All'&&!categoryCounts(slug,level)[category])category='All';
 updateLocation();notify('level');return true;
}
function setCategory(c){
 const allowed=['All',...categories(slug,level)],counts=categoryCounts(slug,level);
 if(!allowed.includes(c)||c===category||(c!=='All'&&!counts[c]))return false;
 category=c;updateLocation();notify('category');return true;
}
function renderCategories(host){
 if(!host)return;
 const counts=categoryCounts(slug,level),names=['All',...categories(slug,level)];
 const signature=JSON.stringify([level,names,counts]);
 if(host.dataset.pool!==signature){
  host.replaceChildren();host.dataset.pool=signature;
  for(const c of names){const b=element('button',{type:'button','data-cat':c},c);b.disabled=c!=='All'&&!counts[c];b.title=b.disabled?'Bu seviyede kart yok / No cards at this level':(c==='All'?count(raw()):counts[c])+' kart / cards';b.onclick=()=>setCategory(c);host.append(b)}
 }
 host.querySelectorAll('button').forEach(b=>{const active=b.dataset.cat===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
function onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)}
function ready(){document.documentElement.removeAttribute('data-cefr-loading');paint()}
function paint(){
 if(slug==='one-for-me-one-for-you'){const badge=document.getElementById('level');if(badge)badge.textContent=level+' LEVEL';}
 if(slug==='what-would-you-do-if'){const lead=document.querySelector('.lead');if(lead)lead.textContent='Your situation / '+level;}
 if(slug==='most-likely-to'){const lead=document.querySelector('.mlt-lead');if(lead)lead.textContent='Choose someone / '+level;}
 if(slug==='never-have-i-ever'){const story=document.getElementById('story');if(story)story.textContent=description[level][2]+' Sharing a story is optional.';}

 const how=document.querySelector('.esc-how-to-play span');if(how&&supported)how.textContent=howToPlay();
 document.documentElement.dataset.cefrLevel=level;
 const group=document.getElementById('cefrLevel');if(group){group.dataset.level=level;group.querySelectorAll('[data-cefr-level]').forEach(b=>{const active=b.dataset.cefrLevel===level;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}
 const note=document.getElementById('cefrLevelNote');if(note)note.textContent=description[level][1]+' / '+description[level][2];
 const total=document.getElementById('cefrPoolCount');if(total)total.textContent=supported?count(raw())+' kart / '+level:'Seçilen seviye oyunlara aktarılır.';
 renderCategories(document.getElementById('cefrCategories'));
 document.querySelectorAll('a.game-card').forEach(a=>{const u=new URL(a.href,location.href);u.searchParams.set('level',level);a.href=u.href});
 document.querySelectorAll('.cefr-card-level').forEach(n=>n.textContent=level);
}
function installDefaults(){
 if(slug==='truth-or-dare'){
  const p=get();window.ESC_TRUTH_DARE_DEFAULTS={...(window.ESC_TRUTH_DARE_DEFAULTS||{}),truths:p.truths.map((text,i)=>({id:'cefr-t-'+level+'-'+i,text})),dares:p.dares.map((text,i)=>({id:'cefr-d-'+level+'-'+i,text}))};
 }
 if(slug==='one-for-me-one-for-you')window.ESC_QUESTIONS=get();
}
function legacySource(){
 try{if(typeof prompts!=='undefined'&&Array.isArray(prompts))return prompts}catch(_){}
 try{if(typeof situations!=='undefined'&&Array.isArray(situations))return situations}catch(_){}
 try{if(typeof items!=='undefined'&&Array.isArray(items))return items}catch(_){}
 try{if(typeof cards!=='undefined'&&Array.isArray(cards))return cards}catch(_){}
 try{if(typeof motions!=='undefined'&&Array.isArray(motions))return motions}catch(_){}
 return null;
}
let bound=false;
function bindLegacy(){
 if(bound||!supported||window.ESC_NEW_GAME||['truth-or-dare','one-for-me-one-for-you'].includes(slug))return;
 const source=legacySource();if(!source)return;bound=true;
 const draw=()=>{if(typeof buildDeck==='function')buildDeck();else if(typeof build==='function')build();if(slug==='hot-seat'&&typeof resetRound==='function')resetRound();else if(slug==='taboo'&&typeof prepareRound==='function')prepareRound();else if(slug==='debate-roulette'&&typeof show==='function')show();else if(typeof next==='function')next();ready()};
 const clear=()=>{try{if(typeof history!=='undefined'&&Array.isArray(history))history.length=0;if(typeof previous!=='undefined'&&Array.isArray(previous))previous.length=0}catch(_){};for(const id of ['historyList','historyCount']){const e=document.getElementById(id);if(e)e.textContent=id==='historyCount'?'0':''}};
 function refresh(){
  if(typeof stop==='function'&&['hot-seat','taboo','debate-roulette'].includes(slug))stop();
  if(typeof resetClock==='function')resetClock();if(typeof resetVote==='function')resetVote();
  clear();source.splice(0,source.length,...get());selected=category;
  const cats=['All',...categories(slug,level)],counts=categoryCounts(slug,level);
  const host=document.getElementById('chips')||document.getElementById('filters');
  if(host){host.replaceChildren();for(const c of cats){const b=document.createElement('button');b.type='button';b.className=(host.id==='filters'?'chip':'game-chip')+(c===category?' active':'');b.textContent=c;b.dataset.cat=c;b.disabled=c!=='All'&&!counts[c];b.title=b.disabled?'Bu seviyede bu kategoride kart yok / No cards at this level':'';b.onclick=()=>{setCategory(c)};host.appendChild(b)}}
  draw();
 }
 onChange(refresh);refresh();
}
const lower=()=>level==='A1-A2';
function storySupport(){return level==='A1-A2'?'Use familiar words and tell events in a clear order.':level==='B1-B2'?'Connect events clearly and explain at least one cause or consequence.':'Include nuance, competing interpretations, or a change of perspective; distinguish what is known from what is assumed.';}

function guidance(type){
 const basic=level==='A1-A2',advanced=level==='C1-C2',base=description[level][2];
 const map={
  twoTruths:basic?'Say three short statements: two true and one false. The group guesses.':advanced?'Make the false statement plausible, answer one follow-up, then reveal it. '+base:'Say three statements: two true and one false. '+base,
  whoAmI:basic?'Ask simple yes/no questions: Is it a person? Is it a place? Can I use it?':'Ask efficient yes/no questions and narrow the possibilities. '+base,
  storyChain:basic?'Add one or two short sentences. Keep the same story.':'Continue the same story. '+storySupport(),
  explainBadly:basic?'Give two simple clues without saying the hidden word.':advanced?'Describe it indirectly but accurately; avoid obvious synonyms and distinguish it from a close alternative.':'Give accurate but indirect clues, without saying the hidden word.',
  roulette:base,
  opinion:basic?'Choose agree, not sure, or disagree. Give one reason.':advanced?'Take a position, qualify it, and address one reasonable objection.':'Choose a position and support it with a reason or example.',
  ranking:basic?'Put the five things in order and explain your first choice.':advanced?'Rank all five; state your criteria and explain one trade-off in the ranking.':'Rank all five options and explain your top two.',
  finish:basic?'Finish the sentence with a word or short sentence.':advanced?'Finish it, then add one qualification or exception.':base,
  threeClues:basic?'Give three simple clues: what it is like, where it is used, and one more detail.':advanced?'Give three precise clues, moving from broad to discriminating, without using a direct synonym.':'Give three clues without saying the target. Start broad, then narrow down.',
  mission:basic?'Read the mission privately and complete the small task naturally.':'Read privately, hide the card, then complete the mission naturally. '+base,
  minuteStory:basic?'Use the three words in a short connected story. The timer is optional.':'Use all three words in a connected story. The timer is optional. '+storySupport(),
  wouldILie:basic?'Tell a short true or invented story. The group guesses.':advanced?'Tell a plausible account, answer two probing questions, and keep the details internally consistent. '+base:'Tell a true or invented account. The group asks questions, then guesses. '+base,
  desert:basic?'Choose three things and give a simple reason for each.':advanced?'Choose exactly three; state your criteria and explain the opportunity cost of leaving out the next-best option.':'Choose exactly three items and explain your priorities. '+base,
  bingo:basic?'Ask simple questions and mark a box when someone matches it.':'Find people who match the squares. Ask a follow-up before marking each square. '+base,
  emoji:basic?'Connect the pictures with a few simple sentences.':'Connect all pictures in a coherent story. '+storySupport(),
  worstAdvice:basic?'Give funny, harmless bad advice, then give useful advice.':advanced?'Give deliberately bad but safe advice, identify why it fails, then replace it with proportionate advice. '+base:'First give harmless, deliberately bad advice; then switch to useful advice. '+base,
  sell:basic?'Say what it is, who can use it, and two good things about it.':advanced?'Make an honest pitch, state one limitation, and identify who should not buy it. '+base:'Make an honest pitch for this customer. '+base,
  hotTake:basic?'Say agree or disagree and add one reason.':advanced?'Take a position, state the assumption it depends on, and acknowledge one credible counterpoint. '+base:'Take a position and support it. '+base
 };
 return map[type]||base;
}
function howToPlay(){
 const t=window.ESC_NEW_GAME?.type;if(t)return guidance(t);
 const instructions={
 'truth-or-dare':'Spin a player. Choose Truth or Dare. Take one card, then change player.',
 'one-for-me-one-for-you':'Draw a card. Answer it, then pass to the other person.',
 'last-thing-you-did':'Think of the last example you remember. A short answer is fine.',
 'what-would-you-do-if':'Read the situation. Say what you do first.',
 'would-you-rather':'Choose A or B. Say which you like.',
 'most-likely-to':'Read the card. Count 3, 2, 1 and choose someone. Keep it friendly.',
 'hot-seat':'Answer quick questions. Tap Got it after an answer, or Skip.',
 'five-second-challenge':'Read first, then start. Name three different examples. Practise without the timer when needed.',
 'red-flag-green-flag':'Choose good or bad. You can also say it depends; explain without voting.',
 'taboo':'Describe the word without the words below it. Correct: +1. Taboo: -1. Three passes per round.',
 'debate-roulette':'Read the idea. Pick a side and say what you think. The timer is optional.',
 'never-have-i-ever':'Read the question. Choose yes or no. Sharing a story is optional.'
 };return (instructions[slug]||'Choose one card and take turns.')+' '+description[level][2];
}
function afterNewRender(type){
 const sub=document.getElementById('sub');if(sub&&!['detective','photoTalk','sell'].includes(type))sub.textContent=guidance(type);
 if(type==='sell'&&sub)sub.textContent=guidance(type)+' '+(window.ESC_NEW_GAME?.items?.find(x=>x.item===document.getElementById('prompt')?.textContent)?.twist||'');
 const rules=document.getElementById('gameRules');if(rules)rules.style.display='none';
 const meta=document.querySelector('.new-game-meta > span');if(meta)meta.textContent=level+' \u00b7 18+';
 const desc=document.getElementById('gameDesc');if(desc)desc.textContent=lower()?'Take turns. Help each other. You can pass.':window.ESC_NEW_GAME?.desc||'';
 if(type==='roulette'&&sub){const q=document.getElementById('prompt')?.textContent;const support=bank.games['one-for-me-one-for-you'][level].find(x=>x.q===q);if(support)sub.textContent=support.f;}
 const footer=document.querySelector('.new-game-note');if(footer)footer.textContent=lower()?'A short answer is okay. Passing is always okay.':window.ESC_NEW_GAME?.note||'Take turns and explain your view.';
 const tag=document.getElementById('badge');if(tag&&!tag.querySelector('.cefr-card-level')){const n=document.createElement('span');n.className='cefr-card-level';n.textContent=level;tag.append(' / ',n)}
 if(type==='photoTalk'){const n=document.querySelector('.scene-icons');if(n)n.setAttribute('aria-label','Conversation scene; read the description');}
 ready();
}
async function platform(){
 for(let i=0;i<60;i++){if(window.ESCSupabase?.getGameSettings)return window.ESCSupabase;await new Promise(r=>setTimeout(r,100))}return null;
}
async function sync(game=slug){
 if(!bank.games[game]||loaded.has(game))return;
 if(syncs.has(game))return syncs.get(game);
 const task=(async()=>{const api=await platform();if(!api)return;
  try{const config=await api.getGameSettings(game);loaded.add(game);
   if(config?.cefr?.version!==1)return;
   const clean={};for(const l of LEVELS)if(validate(game,config.cefr.levels?.[l]))clean[l]=config.cefr.levels[l];
   if(Object.keys(clean).length){overrides[game]=copy(clean);if(game===slug)notify('cloud')}
  }catch(e){console.warn('Level library unavailable; using reviewed built-ins.',e)}
 })();syncs.set(game,task);try{await task}finally{syncs.delete(game)}
}
function element(tag,attrs={},value){const e=document.createElement(tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(value!==undefined)e.textContent=value;return e}
function dialog(title){
 const d=element('dialog',{class:'cefr-dialog','aria-label':title}),head=element('div',{class:'cefr-dialog-head'}),h=element('h2',{},title),close=element('button',{type:'button','aria-label':'Close / Kapat'},'\u00d7');head.append(h,close);d.append(head);close.onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();return d;
}
function help(){
 const d=dialog('Nasıl cevap verebilirim? / '+level),type=bank.types[slug],p=element('p',{},description[level][1]+' '+description[level][2]);d.append(p);
 const basic=level==='A1-A2',advanced=level==='C1-C2',hidden=['word','taboo'].includes(type);let example='';
 if(hidden){
  example=basic?'It is small. You use it at home. It can be blue.':advanced?'Its defining feature is ..., although it can be confused with ...; the key distinction is ...':'It is something you use for ... A similar thing is ..., but this one ...';
  d.append(element('p',{},'Bu örnek mevcut gizli kelimenin cevabı değildir; sadece ipucu verme kalıbıdır.'));
 }else if(type==='mission'||type==='bingo'){
  example=basic?'Do you ...? / Can you ...? / What do you like?':advanced?'What assumption does that depend on? What evidence would change your view?':'Could you give an example? What happened next? Why?';
 }else if(type==='choice'){
  example=basic?'I choose the first one because ...':advanced?'I would lean towards ... because ..., although under ... the other option would be more defensible.':'Both have advantages. I would choose ... because ...';
 }else if(type==='triples'||type==='story'||type==='emoji'){
  example=basic?'First ... Then ... In the end ...':advanced?'What initially looked like ... turned out to be ...; this changed ... because ...':'At first ... Then ... This led to ... In the end ...';
 }else{
  example=basic?'I think ... because ... For example ...':advanced?'To a large extent, ... However, this assumes ... A reasonable exception would be ...':'In my experience, ... One reason is ... For example ... On the other hand ...';
 }
 d.append(element('h3',{},'Cevap kalıbı / Speaking support'),element('blockquote',{},example),element('p',{},'Tek bir doğru cevap yok. Kişisel bir deneyimi paylaşmak istemiyorsan hayali bir örnek seçebilir veya pas geçebilirsin.'));
}
function cardEditor(dialog,area,getLevel){
 const frame=element('fieldset',{class:'cefr-card-form'}),group=element('select',{'aria-label':'Kart grubu'}),pick=element('select',{'aria-label':'Kart se\u00e7'}),fields=element('div'),add=element('button',{type:'button'},'Yeni kart'),remove=element('button',{type:'button'},'Kart\u0131 sil'),error=element('p',{role:'status'});
 const advanced=element('details'),summary=element('summary',{},'Geli\u015fmi\u015f JSON');advanced.append(summary);area.before(frame,advanced);advanced.append(area);frame.append(group,pick,fields,add,remove,error);
 let index=0,groupName='truths';
 for(const k of ['truths','dares'])group.append(element('option',{value:k},k==='truths'?'Truth sorular\u0131':'Dare g\u00f6revleri'));
 const labels={c:'Kategori',cat:'Kategori',q:'Soru',f:'Cevap deste\u011fi',title:'Ba\u015fl\u0131k',setup:'Durum',facts:'Ayr\u0131nt\u0131lar (her sat\u0131ra bir madde)',items:'Se\u00e7enekler (her sat\u0131ra bir madde)',item:'\u00dcr\u00fcn / nesne',twist:'G\u00f6rev',desc:'A\u00e7\u0131klama',questions:'Sorular (her sat\u0131ra bir soru)'};
 function read(){try{return JSON.parse(area.value)}catch(_){error.textContent='JSON ge\u00e7ersiz; Geli\u015fmi\u015f JSON alan\u0131n\u0131 kontrol edin.';return null}}
 function array(data){return Array.isArray(data)?data:data[groupName]}
 function write(data){area.value=JSON.stringify(data,null,2)}
 function refresh(){
  const data=read();if(!data)return;error.textContent='';const list=array(data);group.hidden=Array.isArray(data);group.value=groupName;
  if(!Array.isArray(list))return;index=Math.max(0,Math.min(index,list.length-1));pick.replaceChildren();
  list.forEach((card,i)=>{const title=typeof card==='string'?card:Array.isArray(card)?card[1]:card.q||card.title||card.item;pick.append(element('option',{value:i},(i+1)+'. '+String(title||'Yeni kart').slice(0,85)))});pick.value=String(index);fields.replaceChildren();
  const card=list[index];if(card===undefined)return;
  const field=(key,label,value,asList=false)=>{const wrap=element('label',{},label),input=element('textarea',{rows:asList?'4':'2','data-cefr-field':String(key),spellcheck:'false'});input.value=asList?value.join('\n'):String(value||'');input.placeholder='Bu seviyeye uygun a\u00e7\u0131k ve anlaml\u0131 i\u00e7erik';wrap.append(input);fields.append(wrap);input.oninput=()=>{const now=read();if(!now)return;const arr=array(now),v=asList?input.value.split('\n').map(x=>x.trim()).filter(Boolean):input.value;if(typeof arr[index]==='string')arr[index]=v;else arr[index][key]=v;write(now)}};
  if(typeof card==='string')field('text','Soru / g\u00f6rev',card);
  else if(Array.isArray(card))card.forEach((value,i)=>field(i,bank.types[slug]==='triples'?'Kelime '+(i+1):i===0?'Kategori':i===1?'Soru / kelime / A se\u00e7ene\u011fi':Array.isArray(value)?'Kelimeler (her sat\u0131ra bir kelime)':'Destek / B se\u00e7ene\u011fi',value,Array.isArray(value)));
  else for(const [key,value]of Object.entries(card)){if(['id','level','icons'].includes(key))continue;field(key,labels[key]||key,value,Array.isArray(value))}
  remove.disabled=list.length<=(slug==='conversation-bingo'?16:1);
 }
 pick.onchange=()=>{index=Number(pick.value);refresh()};group.onchange=()=>{groupName=group.value;index=0;refresh()};
 add.onclick=()=>{const data=read();if(!data)return;const list=array(data);if(!list?.length)return;let card=copy(list[index]||list[0]);
  if(typeof card==='string')card='';else if(Array.isArray(card)){if(bank.types[slug]==='triples')card=['','',''];else card[1]=''}else{if(card.q!==undefined)card.q='';else if(card.title!==undefined)card.title='';else if(card.item!==undefined)card.item='';if(card.id)card.id='custom-'+getLevel()+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);if(card.level)card.level=getLevel()}
  list.push(card);index=list.length-1;write(data);refresh();
 };
 remove.onclick=()=>{const data=read();if(!data)return;const list=array(data),min=slug==='conversation-bingo'?16:1;if(list.length<=min)return;if(confirm('Bu kart taslaktan silinsin mi? Kal\u0131c\u0131 olmas\u0131 i\u00e7in Kaydet gerekir.')){list.splice(index,1);write(data);refresh()}};
 area.addEventListener('change',refresh);return {refresh,disable(value){frame.disabled=value}};
}

async function editor(){
 const api=await platform();if(!api||!(await api.isAdmin())){location.href='/admin/?next='+encodeURIComponent(slug)+'#games';return}
 await sync();
 const d=dialog('Seviye soru k\u00fct\u00fcphanesi'),sel=element('select',{'aria-label':'Edit level'}),area=element('textarea',{'aria-label':'Question data JSON',rows:'16',spellcheck:'false'}),status=element('p',{role:'status'}),save=element('button',{type:'button'},'Kaydet ve yay\u0131nla'),reset=element('button',{type:'button'},'Bu seviyenin varsay\u0131lanlar\u0131');
 for(const l of LEVELS)sel.append(element('option',{value:l},l+' / '+count(raw(slug,l))+' kart'));sel.value=level;
 area.setAttribute('data-cefr-json','');
 d.append(element('p',{},'Yaln\u0131zca se\u00e7ili seviyeyi d\u00fczenler. Eski kar\u0131\u015f\u0131k havuz silinmez ve bu oyunlara kar\u0131\u015ft\u0131r\u0131lmaz. Alan yap\u0131s\u0131n\u0131 koruyun. Her soruyu a\u00e7\u0131kl\u0131k, uygun kelimeler ve cevaplanabilirlik a\u00e7\u0131s\u0131ndan kontrol edin.'),sel,area,status,save,reset);
 let editing=level,base='',busy=false,friendly;function fill(){area.value=JSON.stringify(raw(slug,editing),null,2);base=area.value;status.textContent=count(raw(slug,editing))+' kart';friendly?.refresh()}
 fill();friendly=cardEditor(d,area,()=>editing);friendly.refresh();
 sel.onchange=()=>{if(area.value!==base&&!confirm('Kaydedilmeyen de\u011fi\u015fikliklerden vazge\u00e7ilsin mi?')){sel.value=editing;return}editing=sel.value;fill()};
 reset.onclick=()=>{if(confirm('Yaln\u0131zca bu seviyeyi varsay\u0131lana d\u00f6nd\u00fcrmek i\u00e7in tasla\u011f\u0131 haz\u0131rla? Yay\u0131nlamak i\u00e7in Kaydet gerekir.')){area.value=JSON.stringify(bank.games[slug][editing],null,2);friendly.refresh()}};
 const mayClose=()=>!busy&&(area.value===base||confirm('Kaydedilmeyen de\u011fi\u015fikliklerden vazge\u00e7ilsin mi?'));
 d.addEventListener('cancel',e=>{if(!mayClose())e.preventDefault()});
 const nativeClose=d.close.bind(d);d.close=()=>{if(mayClose())nativeClose()};
 save.onclick=async()=>{if(busy)return;let payload;try{payload=JSON.parse(area.value);if(!validate(slug,payload))throw Error('Alanlar, yinelenen sorular veya kart say\u0131s\u0131 ge\u00e7ersiz. Bingo i\u00e7in en az 16 farkl\u0131 madde gerekir.')}catch(e){status.textContent=e.message;return}
  busy=true;save.disabled=true;sel.disabled=true;area.disabled=true;reset.disabled=true;friendly.disable(true);status.textContent='Payla\u015f\u0131lan k\u00fct\u00fcphaneye kaydediliyor...';
  try{if(!(await api.isAdmin()))throw Error('Y\u00f6netici oturumu gerekli.');const latest=await api.getGameSettings(slug)||{};const previous=latest.cefr?.version===1?latest.cefr.levels||{}:{};
   const next={...latest,cefr:{version:1,levels:{...previous,[editing]:payload},updatedAt:new Date().toISOString()}};
   await api.saveGameSettings(slug,next);const check=await api.getGameSettings(slug);if(canonical(check?.cefr?.levels?.[editing])!==canonical(payload))throw Error('Kay\u0131t do\u011frulanamad\u0131. Taslak korunuyor.');
   overrides[slug]={...(overrides[slug]||{}),[editing]:copy(payload)};base=area.value;notify('saved');status.textContent='Kaydedildi ve sunucudan do\u011fruland\u0131: '+editing+' / '+count(payload)+' kart.';
  }catch(e){status.textContent='Yay\u0131nlanamad\u0131: '+e.message+' Taslak bu pencerede korunuyor.'}finally{busy=false;save.disabled=false;sel.disabled=false;area.disabled=false;reset.disabled=false;friendly.disable(false)}
 };
}
function mount(){
 if(!supported&&slug!=='games')return;
 if(document.getElementById('cefrLevel'))return;
 const host=document.querySelector('.game-hero,.new-game-hero,.hero,.hub-hero')||document.querySelector('header')||document.body;
 const bar=element('section',{class:'cefr-bar','aria-label':'CEFR level selector'}),label=element('span',{id:'cefrLevelLabel',class:'cefr-level-label'},'Seviye / Level'),sel=element('div',{id:'cefrLevel',class:'cefr-level-buttons',role:'group','aria-labelledby':'cefrLevelLabel'}),note=element('p',{id:'cefrLevelNote'}),total=element('small',{id:'cefrPoolCount',role:'status'});
 for(const l of LEVELS){const b=element('button',{type:'button','data-cefr-level':l,'aria-pressed':String(l===level),title:l+' / '+description[l][0]},l);b.className='cefr-level-button'+(l===level?' active':'');b.onclick=e=>{e.stopPropagation();setLevel(l)};sel.append(b)}bar.append(label,sel,total,note);
 if(host===document.body)document.body.prepend(bar);else host.after(bar);
 if(supported&&(window.ESC_NEW_GAME||slug==='one-for-me-one-for-you')&&categories(slug,level).length){
  const catBar=element('nav',{class:'cefr-category-bar',id:'cefrCategories','aria-label':'Question categories'});bar.after(catBar);renderCategories(catBar);
 }
 if(supported){
  // The existing answer-help button keeps its administrator-selected icon and colour.

  if(new URLSearchParams(location.search).get('studio')==='1'){const b=element('button',{type:'button'},'Seviye sorular\u0131n\u0131 d\u00fczenle');b.onclick=()=>void editor();bar.append(b);}
  bindLegacy();void sync();
 }
 paint();
}
if(category!=='All'&&!categoryCounts(slug,level)[category])category='All';
window.ESCCEFR={get,raw,stats,count,validate,categoryOf,setLevel,setCategory,categories,categoryCounts,onChange,sync,ready,installDefaults,bindLegacy,afterNewRender,guidance,howToPlay,editor,help,get level(){return level},get category(){return category},get revision(){return revision},slug,supported,levels:LEVELS};
if(supported){document.documentElement.setAttribute('data-cefr-loading','');setTimeout(()=>{if(document.documentElement.hasAttribute('data-cefr-loading')){const n=document.createElement('p');n.className='cefr-load-error';n.textContent='Oyun yüklenemedi. Sayfayı yenileyin / Please reload this game.';document.body.prepend(n)}},10000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
