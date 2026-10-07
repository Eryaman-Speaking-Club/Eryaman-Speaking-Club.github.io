/* CEFR practice levels. The current level owns its own deck; ungraded legacy
   content is preserved in storage, but never mixed into a graded session. */
(function(){
'use strict';
const bank=window.ESCCefrBank;if(!bank)return;
const LEVELS=bank.levels,slug=window.ESC_CEFR_PAGE_SLUG||location.pathname.split('/').find(part=>bank.games[part]||part==='games'||part==='admin')||'',supported=!!bank.games[slug],KEY='eryaman-cefr-level-v1';
const copy=x=>JSON.parse(JSON.stringify(x));
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
let saved='B1';try{saved=localStorage.getItem(KEY)||saved}catch(_){}
const requested=new URLSearchParams(location.search).get('level');
let level=LEVELS.includes(requested)?requested:LEVELS.includes(saved)?saved:'B1',revision=0;
try{localStorage.setItem(KEY,level)}catch(_){}
const listeners=new Set(),overrides={},loaded=new Set(),syncs=new Map();
const count=x=>Array.isArray(x)?x.length:(x?.truths?.length||0)+(x?.dares?.length||0);
const text=x=>typeof x==='string'&&x.trim().length>0&&x.length<1600;
function validItem(game,x){
 const type=bank.types[game];
 if(['mission','bingo'].includes(type))return text(x);
 if(type==='paired')return x&&text(x.q)&&text(x.f)&&text(x.id);
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
 const keys=payload.map(x=>canonical(bank.types[game]==='paired'?x.q:(Array.isArray(x)&&bank.types[game]!=='triples'?x.slice(1):x)).toLowerCase().replace(/\s+/g,' '));
 return new Set(keys).size===keys.length;
}
function get(game=slug,l=level){if(!bank.games[game]||!LEVELS.includes(l))return[];return copy(overrides[game]?.[l]||bank.games[game][l])}
function stats(game,config){return LEVELS.map(l=>{const p=config?.cefr?.version===1&&validate(game,config.cefr.levels?.[l])?config.cefr.levels[l]:get(game,l);return {level:l,count:count(p)}})}
const description={
 A1:['Ba\u015flang\u0131\u00e7','Tan\u0131d\u0131k konular; kelimeler ve k\u0131sa c\u00fcmleler.','Use familiar words and short sentences.'],
 A2:['Temel','G\u00fcnl\u00fck durumlar; basit bir ayr\u0131nt\u0131 ekle.','Use simple sentences. Add one detail.'],
 B1:['Orta','Deneyimini anlat; bir neden veya \u00f6rnek ver.','Explain your experience, with a reason or example.'],
 B2:['Orta-\u00fcst\u00fc','Se\u00e7enekleri kar\u015f\u0131la\u015ft\u0131r; g\u00f6r\u00fc\u015f\u00fcn\u00fc destekle.','Compare options and support your view.'],
 C1:['\u0130leri','G\u00f6r\u00fc\u015f\u00fcn\u00fc nitele; istisna ve kar\u015f\u0131 g\u00f6r\u00fc\u015f\u00fc de\u011ferlendir.','Qualify your view; consider an exception or another perspective.']};
function notify(reason){revision++;for(const fn of listeners){try{fn(level,reason)}catch(e){console.error('CEFR deck refresh failed',e)}}paint();document.dispatchEvent(new CustomEvent('eryaman:levelchange',{detail:{level,reason}}))}
function setLevel(l){if(!LEVELS.includes(l)||l===level)return false;level=l;try{localStorage.setItem(KEY,l);const u=new URL(location.href);u.searchParams.set('level',l);window.history.replaceState(null,'',u)}catch(_){}notify('level');return true}
function onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)}
function ready(){document.documentElement.removeAttribute('data-cefr-loading');paint()}
function paint(){
 if(slug==='what-would-you-do-if'){const lead=document.querySelector('.lead');if(lead)lead.textContent='Your situation / '+level;}
 if(slug==='most-likely-to'){const lead=document.querySelector('.mlt-lead');if(lead)lead.textContent='Choose someone / '+level;}
 if(slug==='never-have-i-ever'){const story=document.getElementById('story');if(story)story.textContent=description[level][2]+' Sharing a story is optional.';}

 const how=document.querySelector('.esc-how-to-play span');if(how&&supported)how.textContent=howToPlay();
 document.documentElement.dataset.cefrLevel=level;
 const select=document.getElementById('cefrLevel');if(select)select.value=level;
 const note=document.getElementById('cefrLevelNote');if(note)note.textContent=description[level][1]+' / '+description[level][2];
 const total=document.getElementById('cefrPoolCount');if(total)total.textContent=supported?count(get())+' kart / '+level:'Se\u00e7ilen seviye oyunlara aktar\u0131l\u0131r.';
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
 const draw=()=>{if(typeof buildDeck==='function')buildDeck();else if(typeof build==='function')build();if(slug==='hot-seat'&&typeof nextPrompt==='function')nextPrompt();else if(['taboo','debate-roulette'].includes(slug)&&typeof show==='function')show();else if(typeof next==='function')next();ready()};
 const clear=()=>{try{if(typeof history!=='undefined'&&Array.isArray(history))history.length=0;if(typeof previous!=='undefined'&&Array.isArray(previous))previous.length=0}catch(_){};for(const id of ['historyList','historyCount']){const e=document.getElementById(id);if(e)e.textContent=id==='historyCount'?'0':''}};
 function refresh(){
  if(typeof stop==='function'&&['hot-seat','taboo','debate-roulette'].includes(slug))stop();
  if(typeof resetClock==='function')resetClock();if(typeof resetVote==='function')resetVote();
  clear();source.splice(0,source.length,...get());selected='All';
  const categories=['All',...new Set(source.map(x=>Array.isArray(x)?x[0]:x.c))];
  const host=document.getElementById('chips')||document.getElementById('filters');
  if(host){host.replaceChildren();for(const c of categories){const b=document.createElement('button');b.type='button';b.className=(host.id==='filters'?'chip':'game-chip')+(c==='All'?' active':'');b.textContent=c;b.dataset.cat=c;b.onclick=()=>{selected=c;clear();host.querySelectorAll('button').forEach(n=>n.classList.toggle('active',n===b));draw()};host.appendChild(b)}}
  draw();
 }
 onChange(refresh);refresh();
}
const lower=()=>level==='A1'||level==='A2';
function guidance(type){
 const basic=level==='A1',base=description[level][2];
 const map={
 twoTruths:basic?'Say three short sentences: two true, one not true. The group guesses.': 'Say three statements: two true and one false. '+base,
 whoAmI:basic?'Ask: Is it big? Is it food? Is it a person? Use yes/no questions.':'Ask yes/no questions. Do not look at the hidden target. '+base,
 storyChain:basic?'Add one short sentence. The next person adds one more.':'Continue the same story. '+base,
 explainBadly:basic?'Say two simple clues. Do not say the hidden word.':'Give accurate but indirect clues, without saying the hidden word.',
 roulette:base, opinion:basic?'Choose: agree, not sure, or disagree. Say: I think ...':'Choose a position. '+base,
 ranking:basic?'Put five things in order. Say: Number one is ...':'Rank all five options in your preferred order. '+base,
 finish:basic?'Finish with a word or a short sentence.':base,
 threeClues:basic?'Give three short clues: It is ... It has ... You can ...':'Give three clues without saying the target. Start broad, then narrow down.',
 mission:basic?'Read your card alone. Hide it. Do the small task while you talk.':'Read privately, hide the card, then complete the mission naturally.',
 minuteStory:basic?'Use the three words in three short sentences. The timer is optional.':'Use all three words in a connected story. The timer is optional. '+base,
 wouldILie:basic?'Say three short sentences. True or not true? The group guesses.':'Tell a true or invented account. The group asks two questions, then guesses. '+base,
 desert:basic?'Choose three things. Say: I want ...':'Choose exactly three items. '+base,
 bingo:basic?'Ask: Do you ...? Mark a box when someone says yes.':'Find people who match the squares. Ask a follow-up before marking each square.',
 emoji:basic?'Say one short sentence for each picture.':'Connect all pictures in a story. '+base,
 worstAdvice:basic?'Give funny, bad advice. Then give good advice. Keep it safe.':'First give harmless, deliberately bad advice; then switch to useful advice. '+base,
 sell:basic?'Say what it is and two good things about it. The timer is optional.':'Make an honest pitch for this customer. The timer is optional. '+base,
 hotTake:basic?'Say: I agree, or I disagree. Add a short sentence.':'Take a position. The timer is optional. '+base
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
 const rules=document.getElementById('gameRules');if(rules)rules.textContent=guidance(type);
 const desc=document.getElementById('gameDesc');if(desc&&lower())desc.textContent=guidance(type);
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
 const d=dialog('Nas\u0131l cevap verebilirim? / '+level),type=bank.types[slug],p=element('p',{},description[level][1]+' '+description[level][2]);d.append(p);
 const hidden=['word','taboo','mission'].includes(type);let example='';
 if(hidden){example=level==='A1'?'It is small. It is blue. You can use it at home.':level==='A2'?'It is something you use when you travel. You can find it in a bag.':level==='B1'?'It is a type of everyday object. You use it to ...':level==='B2'?'It serves a similar purpose to ..., but its main feature is ...':'Its defining feature is ..., although it is sometimes confused with ...';d.append(element('p',{},'Bu \u00f6rnek mevcut gizli kelimenin cevab\u0131 de\u011fildir; ipucu verme kal\u0131b\u0131d\u0131r.'))}
 else if(type==='choice'){example=level==='A1'?'I like tea.':level==='A2'?'I choose tea because I like it.':level==='B1'?'I would choose the first option because ... For example, ...':level==='B2'?'Both have advantages, but I would prioritise ... because ...':'Under these conditions, I would lean towards ..., although ... could change my decision.'}
 else if(type==='triples'||type==='story'||type==='emoji'){example=level==='A1'?'I am at home. My cat is in a box. It is happy.':level==='A2'?'Yesterday, I was at home. My cat jumped into a box. Then it fell asleep.':level==='B1'?'At first, ... Then something unexpected happened: ... In the end, ...':level==='B2'?'Although everything seemed normal, ... This led to ..., and eventually ...':'Looking back, what seemed like ... was actually ... Had ..., the outcome might have been different.'}
 else {const question=document.querySelector('#promptText,#questionText,#q,#prompt,#taskText,#motion')?.textContent?.trim();const pairs=bank.games['one-for-me-one-for-you'][level];const matched=pairs.find(x=>x.q===question);example=matched?.f||({A1:'I like ... / I have ... / It is ...',A2:'I ... because ... It was ...',B1:'In my experience, ... One example is ... That is why ...',B2:'One advantage is ..., whereas ... I would choose ... because ...',C1:'To some extent, ... However, this assumes that ... An important exception would be ...'}[level]);}
 d.append(element('h3',{},'Cevap kal\u0131b\u0131 / Speaking support'),element('blockquote',{},example),element('p',{},'Tek bir do\u011fru cevap yok. Bilmedi\u011fin bir deneyimi uydurman gerekmez; hayali bir \u00f6rnek se\u00e7ebilir veya pas ge\u00e7ebilirsin.'));
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
 for(const l of LEVELS)sel.append(element('option',{value:l},l+' / '+count(get(slug,l))+' kart'));sel.value=level;
 area.setAttribute('data-cefr-json','');
 d.append(element('p',{},'Yaln\u0131zca se\u00e7ili seviyeyi d\u00fczenler. Eski kar\u0131\u015f\u0131k havuz silinmez ve bu oyunlara kar\u0131\u015ft\u0131r\u0131lmaz. Alan yap\u0131s\u0131n\u0131 koruyun. Her soruyu a\u00e7\u0131kl\u0131k, uygun kelimeler ve cevaplanabilirlik a\u00e7\u0131s\u0131ndan kontrol edin.'),sel,area,status,save,reset);
 let editing=level,base='',busy=false,friendly;function fill(){area.value=JSON.stringify(get(slug,editing),null,2);base=area.value;status.textContent=count(get(slug,editing))+' kart';friendly?.refresh()}
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
 const host=document.querySelector('.game-hero,.new-game-hero,.hero,.hub-hero')||document.querySelector('header')||document.body;
 const bar=element('section',{class:'cefr-bar','aria-label':'CEFR level selector'}),label=element('label',{for:'cefrLevel'},'Seviye / Level'),sel=element('select',{id:'cefrLevel'}),note=element('p',{id:'cefrLevelNote'}),total=element('small',{id:'cefrPoolCount',role:'status'});
 for(const l of LEVELS)sel.append(element('option',{value:l},l+' \u00b7 '+description[l][0]));sel.value=level;sel.onchange=()=>setLevel(sel.value);bar.append(label,sel,total,note);
 if(host===document.body)document.body.prepend(bar);else host.after(bar);
 if(supported){
  // The existing answer-help button keeps its administrator-selected icon and colour.

  if(new URLSearchParams(location.search).get('studio')==='1'){const b=element('button',{type:'button'},'Seviye sorular\u0131n\u0131 d\u00fczenle');b.onclick=()=>void editor();bar.append(b);}
  bindLegacy();void sync();
 }
 paint();
}
window.ESCCEFR={get,stats,count,validate,setLevel,onChange,sync,ready,installDefaults,bindLegacy,afterNewRender,guidance,howToPlay,editor,help,get level(){return level},get revision(){return revision},slug,supported,levels:LEVELS};
if(supported)document.documentElement.setAttribute('data-cefr-loading','');
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
