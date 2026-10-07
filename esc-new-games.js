/* CEFR build applied */
(() => {
'use strict';
const cfg=window.ESC_NEW_GAME||{};

cfg.items=window.ESCCEFR.get(cfg.slug);
const builtInItems=Array.isArray(cfg.items)?JSON.parse(JSON.stringify(cfg.items)):[];
const $=s=>document.querySelector(s);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s==null?'':s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const aud=()=>window.ESCGameKit&&window.ESCGameKit.audio?window.ESCGameKit.audio:{soft(){},select(){},success(){},fail(){},count(){},timeup(){}};
let deck=[],pos=-1,history=[],historyCursor=-1,timer=null,time=0,rank=[],phase=0;
let timerInitial=0,timerDeadline=0,timerPaused=false,timerDone=null,userInteracted=false;
const card=()=>$('#gameCard'),prompt=()=>$('#prompt'),sub=()=>$('#sub'),badge=()=>$('#badge'),controls=()=>$('#controls');
function clearDynamic(){card().querySelectorAll('.dynamic').forEach(n=>n.remove());prompt().classList.remove('hidden-target','revealed');}
function stopTimer(){
 clearInterval(timer);timer=null;timerPaused=false;timerInitial=0;timerDone=null;
 ['timer','timerPause','timerReset'].forEach(id=>{const el=$('#'+id);if(el)el.remove()});
 const start=$('#start');if(start)start.disabled=false;
}
function paintTimer(){
 const el=$('#timer');if(el){el.textContent=String(time);el.classList.toggle('danger',time<=5&&time>0);el.setAttribute('aria-label',time+' seconds remaining')}
 const pause=$('#timerPause');if(pause){pause.textContent=timerPaused?'Resume':'Pause';pause.disabled=time<=0}
 const start=$('#start');if(start)start.disabled=time>0;
}
function tickTimer(){
 const previous=time;time=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));paintTimer();
 if(time!==previous&&time<=5&&time>0)aud().count(time);
 if(time<=0){clearInterval(timer);timer=null;timerPaused=false;paintTimer();aud().timeup();const done=timerDone;timerDone=null;if(done)done()}
}
function toggleTimer(){
 if(time<=0)return;
 if(timerPaused){timerPaused=false;timerDeadline=Date.now()+time*1000;timer=setInterval(tickTimer,200)}
 else{time=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));clearInterval(timer);timer=null;timerPaused=true}
 paintTimer();
}
function startTimer(seconds,onEnd){
 stopTimer();timerInitial=seconds;time=seconds;timerDone=onEnd||null;
 const el=document.createElement('div');el.id='timer';el.className='timer-big dynamic';card().appendChild(el);
 const pause=document.createElement('button');pause.id='timerPause';pause.type='button';pause.className='new-btn';pause.onclick=toggleTimer;
 const reset=document.createElement('button');reset.id='timerReset';reset.type='button';reset.className='new-btn';reset.textContent='Restart timer';reset.onclick=()=>startTimer(seconds,onEnd);
 controls().append(pause,reset);timerDeadline=Date.now()+seconds*1000;paintTimer();aud().select();timer=setInterval(tickTimer,200);
}
function setCard(title,desc,tag){badge().textContent=tag||cfg.badge||'SPEAKING GAME';prompt().textContent=title||'';sub().textContent=desc||'';}
function validItem(x){
  if(x===null||x===undefined)return false;
  switch(cfg.type){
    case 'twoTruths': return Array.isArray(x)&&x.length>=3&&String(x[1]||'').trim()&&String(x[2]||'').trim();
    case 'whoAmI':
    case 'storyChain':
    case 'explainBadly':
    case 'roulette':
    case 'finish':
    case 'threeClues':
    case 'wouldILie':
    case 'worstAdvice':
    case 'hotTake': return Array.isArray(x)&&x.length>=2&&String(x[1]||'').trim();
    case 'opinion': return Array.isArray(x)&&x.length>=2&&String(x[1]||'').trim();
    case 'ranking':
    case 'desert': return x&&typeof x==='object'&&String(x.title||'').trim()&&Array.isArray(x.items)&&x.items.length>=3;
    case 'detective': return x&&typeof x==='object'&&String(x.title||'').trim()&&String(x.setup||'').trim()&&Array.isArray(x.facts)&&x.facts.length>=2;
    case 'mission': return typeof x==='string'&&x.trim().length>3;
    case 'minuteStory': return Array.isArray(x)&&x.length>=3&&x.every(v=>String(v||'').trim());
    case 'bingo': return typeof x==='string'&&x.trim().length>2;
    case 'emoji': return Array.isArray(x)&&x.length>=2&&Array.isArray(x[1])&&x[1].length>=3;
    case 'sell': return x&&typeof x==='object'&&String(x.item||'').trim()&&String(x.twist||'').trim();
    case 'photoTalk': return x&&typeof x==='object'&&String(x.title||'').trim()&&Array.isArray(x.questions)&&x.questions.length>=1;
    default: return true;
  }
}
function playableItem(x){return cfg.type==='bingo' ? Array.isArray(x)&&x.length===16&&x.every(v=>typeof v==='string'&&v.trim()) : validItem(x)}
function usableItems(){return Array.isArray(cfg.items)?cfg.items.filter(validItem):[]}
function showEmpty(){
  stopTimer();clearDynamic();
  setCard('Content is being prepared','This game does not have any active cards yet. Please choose another game or try again later.','GAME LIBRARY');
  controls().innerHTML='<a class="new-btn primary" href="/games/" style="text-decoration:none;display:inline-flex;align-items:center">← All games</a>';
}
function btn(label,cls,id){return '<button class="'+(cls||'new-btn')+'" '+(id?'id="'+id+'"':'')+' type="button">'+label+'</button>'}
function nextItem(){
  const items=usableItems();
  if(!items.length || (cfg.type==='bingo'&&items.length<16)){showEmpty();return}
  if(historyCursor<history.length-1){historyCursor++;renderItem(history[historyCursor]);aud().soft();return}
  if(!deck.length||pos>=deck.length-1){
    deck=cfg.type==='bingo'?Array.from({length:30},()=>shuffle(items).slice(0,Math.min(16,items.length))):shuffle(items);
    pos=-1;
  }
  const x=deck[++pos];
  if(x===undefined||!playableItem(x)){showEmpty();return}
  history.push(x);historyCursor=history.length-1;
  try{renderItem(x);aud().soft()}
  catch(e){
    console.warn('Invalid game card skipped.',e);
    const safe=window.ESCCEFR.get(cfg.slug).filter(validItem);
    if(safe.length){cfg.items=safe;deck=[];pos=-1;history=[];historyCursor=-1;nextItem()}
    else showEmpty();
  }
}
function prevItem(){if(historyCursor<1)return;historyCursor--;renderItem(history[historyCursor]);aud().soft()}
function shuffleDeck(){deck=[];pos=-1;history=[];historyCursor=-1;nextItem();if(window.ESCGameKit)window.ESCGameKit.toast('Shuffled')}
function baseButtons(extra){controls().innerHTML=btn('↩ Previous','new-btn','prev')+btn('Next →','new-btn primary','next')+btn('↻ Shuffle','new-btn','shuffle')+(extra||'');$('#prev').onclick=prevItem;$('#prev').disabled=historyCursor<1;$('#next').onclick=nextItem;$('#shuffle').onclick=shuffleDeck}
function addOptions(items,mode){
 const g=document.createElement('div');g.className='option-grid dynamic';
 g.innerHTML=items.map(v=>'<button type="button" class="option-card" aria-pressed="false">'+esc(v)+'</button>').join('');card().appendChild(g);
 const status=document.createElement('p');status.className='selection-status dynamic';status.setAttribute('role','status');card().appendChild(status);
 function update(){
  if(mode==='rank'){
   g.querySelectorAll('button').forEach(b=>{const idx=rank.indexOf(b.textContent);b.classList.toggle('rank-selected',idx>=0);b.setAttribute('aria-pressed',String(idx>=0));if(idx>=0)b.dataset.rank=String(idx+1);else delete b.dataset.rank});
   status.textContent=rank.length?rank.map((v,i)=>(i+1)+'. '+v).join(' / '):'Choose your first item. Click a ranked item again to undo it.';
  }else{status.textContent=g.querySelectorAll('.selected').length+' / 3 selected';}
 }
 g.querySelectorAll('button').forEach(b=>b.onclick=()=>{
  if(mode==='limit3'){
   if(b.classList.contains('selected'))b.classList.remove('selected');
   else if(g.querySelectorAll('.selected').length<3)b.classList.add('selected');
   else{window.ESCGameKit?.toast('Choose only 3. Deselect an item to change your choice.');return}
   b.setAttribute('aria-pressed',String(b.classList.contains('selected')));
  }else if(mode==='rank'){const i=rank.indexOf(b.textContent);if(i>=0)rank.splice(i,1);else rank.push(b.textContent)}
  aud().select();update();
 });update();
}
function renderBingo(items){
 const g=document.createElement('div');g.className='bingo-grid dynamic';
 g.innerHTML=items.map(v=>'<button type="button" class="bingo-cell" aria-pressed="false">'+esc(v)+'</button>').join('');card().appendChild(g);
 const status=document.createElement('p');status.id='bingoStatus';status.className='dynamic';status.setAttribute('role','status');card().appendChild(status);
 function update(){
  const cells=[...g.querySelectorAll('button')],marked=cells.map(b=>b.classList.contains('done'));let lines=0;
  for(let i=0;i<4;i++){if([0,1,2,3].every(j=>marked[i*4+j]))lines++;if([0,1,2,3].every(j=>marked[j*4+i]))lines++}
  if([0,5,10,15].every(i=>marked[i]))lines++;if([3,6,9,12].every(i=>marked[i]))lines++;
  const count=marked.filter(Boolean).length;status.textContent=count===16?'Full card completed!':count+' / 16 marked'+(lines?' - Bingo! '+lines+' complete line'+(lines>1?'s':''):'');status.classList.toggle('complete',lines>0);
 }
 g.querySelectorAll('button').forEach(b=>b.onclick=()=>{b.classList.toggle('done');b.setAttribute('aria-pressed',String(b.classList.contains('done')));aud().select();update()});update();
}
function renderItem(x){
 stopTimer();clearDynamic();rank=[];phase=0;baseButtons();
 switch(cfg.type){
  case 'twoTruths':
   setCard(x[1],x[2],x[0]);
   break;
  case 'whoAmI':
   setCard(x[1],'One player privately sees the identity. Everyone else asks yes/no questions until they guess it.',x[0]);
   prompt().classList.add('hidden-target');
   controls().innerHTML=btn('Reveal target','new-btn good','reveal')+btn('Next target →','new-btn primary','next')+btn('↻ Shuffle','new-btn','shuffle');
   $('#reveal').onclick=()=>{prompt().classList.toggle('revealed');$('#reveal').textContent=prompt().classList.contains('revealed')?'Hide target':'Reveal target'};
   $('#next').onclick=nextItem;$('#shuffle').onclick=shuffleDeck;
   break;
  case 'storyChain':
   setCard(x[1],x[2],x[0]);
   break;
  case 'explainBadly':
   setCard(x[1],x[2],x[0]);prompt().classList.add('hidden-target');
   controls().innerHTML=btn('Reveal to speaker','new-btn good','reveal')+btn('Next target →','new-btn primary','next');
   $('#reveal').onclick=()=>{const visible=prompt().classList.toggle('revealed');$('#reveal').textContent=visible?'Hide word':'Reveal word';$('#reveal').setAttribute('aria-pressed',String(visible))};$('#next').onclick=nextItem;
   break;
  case 'roulette':
   setCard(x[1],x[2],x[0]);
   break;
  case 'opinion':
   setCard(x[1],'Choose your position first. Then explain your reason and give one example.',x[0]);
   {const d=document.createElement('div');d.className='scale-row dynamic';d.innerHTML=['Strongly disagree','Disagree','Not sure','Agree','Strongly agree'].map(v=>'<button class="scale-btn">'+v+'</button>').join('');card().appendChild(d);d.querySelectorAll('button').forEach(b=>b.onclick=()=>{d.querySelectorAll('button').forEach(y=>y.classList.remove('selected'));b.classList.add('selected');aud().select()})}
   break;
  case 'ranking':
   setCard(x.title,'Click the items in your preferred order: #1 first, then #2, #3, #4 and #5.',x.cat);addOptions(x.items,'rank');
   break;
  case 'detective':
   setCard(x.title,x.setup,x.cat);
   {const d=document.createElement('div');d.className='truth-list dynamic';d.innerHTML=x.facts.map((v,i)=>'<div class="truth-line"><small>'+(i+1)+'</small>'+esc(v)+'</div>').join('');card().appendChild(d)}
   break;
  case 'finish':
   setCard(x[1],'Finish the sentence, then add one reason or example.',x[0]);
   break;
  case 'threeClues':
   setCard(x[1],'Speaker: give exactly three clues. Do not say the word itself. The group gets one guess after each clue.',x[0]);prompt().classList.add('hidden-target');
   controls().innerHTML=btn('Reveal word','new-btn good','reveal')+btn('Next word →','new-btn primary','next');$('#reveal').onclick=()=>{const visible=prompt().classList.toggle('revealed');$('#reveal').textContent=visible?'Hide word':'Reveal word';$('#reveal').setAttribute('aria-pressed',String(visible))};$('#next').onclick=nextItem;
   break;
  case 'mission':
   setCard('Secret Mission','Read your mission privately, hide it, then pass the screen. Complete it naturally during the meetup.','PRIVATE');
   {const m=document.createElement('div');m.className='mission-box dynamic';m.innerHTML='<strong id="missionText" class="hidden-target">'+esc(x)+'</strong><small>Do not announce the mission. Try to complete it naturally in conversation.</small>';card().appendChild(m)}
   controls().innerHTML=btn('Reveal mission','new-btn good','reveal')+btn('Hide & pass','new-btn','hide')+btn('Next mission →','new-btn primary','next');$('#reveal').onclick=()=>$('#missionText').classList.add('revealed');$('#hide').onclick=()=>$('#missionText').classList.remove('revealed');$('#next').onclick=nextItem;
   break;
  case 'minuteStory':
   setCard('Use all three words','You have 60 seconds to tell one connected story. The story can be true or invented.','60-SECOND STORY');
   {const d=document.createElement('div');d.className='word-row dynamic';d.innerHTML=x.map(v=>'<span class="word-pill">'+esc(v)+'</span>').join('');card().appendChild(d)}
   controls().innerHTML=btn('Start 60s','new-btn good','start')+btn('New words →','new-btn primary','next');$('#start').onclick=()=>startTimer(60);$('#next').onclick=nextItem;
   break;
  case 'wouldILie':
   setCard(x[1],'Tell a short story based on this topic. It may be true or invented. The group can ask up to two questions, then votes: TRUE or LIE?',x[0]);
   break;
  case 'desert':
   setCard(x.title,'Choose exactly three items. Then explain why your group would keep them.',x.cat);addOptions(x.items,'limit3');
   break;
  case 'bingo':
   setCard('Conversation Bingo','Find different people who match the squares. Ask a real follow-up question before marking a square.','MINGLE');
   renderBingo(x);
   controls().innerHTML=btn('New bingo card','new-btn primary','next');$('#next').onclick=nextItem;
   break;
  case 'emoji':
   setCard('Build a story','Use every emoji in one connected story. Add a beginning, a problem and an ending.',x[0]);
   {const d=document.createElement('div');d.className='emoji-row dynamic';d.innerHTML=x[1].map(v=>'<span>'+esc(v)+'</span>').join('');card().appendChild(d)}
   break;
  case 'worstAdvice':
   setCard(x[1],'Round 1: give the worst possible advice. Then switch to Round 2 and give genuinely useful advice.',x[0]);
   {const p=document.createElement('div');p.className='phase-pill dynamic';p.id='phase';p.textContent='ROUND 1 · WORST ADVICE ONLY';card().appendChild(p)}
   controls().innerHTML=btn('Show good-advice round','new-btn good','phaseBtn')+btn('Next problem →','new-btn primary','next');$('#phaseBtn').onclick=()=>{phase=1-phase;$('#phase').classList.toggle('good',phase===1);$('#phase').textContent=phase?'ROUND 2 · REAL ADVICE':'ROUND 1 · WORST ADVICE ONLY';aud().select()};$('#next').onclick=nextItem;
   break;
  case 'sell':
   setCard(x.item,'Sell this in 30 seconds. Twist: '+x.twist,'SALES PITCH');
   controls().innerHTML=btn('Start 30s','new-btn good','start')+btn('Next product →','new-btn primary','next');$('#start').onclick=()=>startTimer(30);$('#next').onclick=nextItem;
   break;
  case 'hotTake':
   setCard(x[1],'Take a position and defend it for 30 seconds. Then let one person give a counterargument.',x[0]);
   controls().innerHTML=btn('Start 30s','new-btn good','start')+btn('Next take →','new-btn primary','next');$('#start').onclick=()=>startTimer(30);$('#next').onclick=nextItem;
   break;
  case 'photoTalk':
   setCard(x.title,x.desc,x.cat);
   {const d=document.createElement('div');d.className='scene-box dynamic';d.innerHTML='<div class="scene-icons">'+x.icons.map(esc).join(' ')+'</div><div class="scene-title">'+esc(x.title)+'</div><ul class="scene-questions">'+x.questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>';card().appendChild(d)}
   break;
 }
 window.ESCCEFR.afterNewRender(cfg.type);
}
async function syncRemote(){await window.ESCCEFR.sync(cfg.slug)}
function resetToBuiltIns(){cfg.items=window.ESCCEFR.get(cfg.slug);deck=[];pos=-1;history=[];historyCursor=-1;nextItem()}
function init(){
 window.ESCCEFR.onChange(()=>{stopTimer();cfg.items=window.ESCCEFR.get(cfg.slug);deck=[];pos=-1;history=[];historyCursor=-1;nextItem()});
 document.addEventListener('click',e=>{if(e.target.closest('.new-game-controls, .new-game-card button'))userInteracted=true});
 $('#gameTitle').textContent=cfg.title||'Speaking Game';$('#gameDesc').textContent=cfg.desc||'';$('#gameEyebrow').textContent=cfg.eyebrow||'SPEAKING GAME';document.title=(cfg.title||'Game')+' · Eryaman Speaking Club';
 (cfg.rules||[]).forEach(r=>{const s=document.createElement('span');s.textContent=r;$('#gameRules').appendChild(s)});
 const items=usableItems();
 if(cfg.type==='bingo')deck=Array.from({length:30},()=>shuffle(items).slice(0,Math.min(16,items.length)));else deck=shuffle(items);
 nextItem();
 void syncRemote();
 window.EryamanSpeakingGame={refresh(){deck=[];pos=-1;history=[];historyCursor=-1;nextItem()},resetToBuiltIns,config:cfg};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();