(() => {
'use strict';
const cfg=window.ESC_NEW_GAME||{};
const $=s=>document.querySelector(s);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s==null?'':s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const aud=()=>window.ESCGameKit&&window.ESCGameKit.audio?window.ESCGameKit.audio:{soft(){},select(){},success(){},fail(){},count(){},timeup(){}};
let deck=[],pos=-1,history=[],timer=null,time=0,rank=[],phase=0;
const card=()=>$('#gameCard'),prompt=()=>$('#prompt'),sub=()=>$('#sub'),badge=()=>$('#badge'),controls=()=>$('#controls');
function clearDynamic(){card().querySelectorAll('.dynamic').forEach(n=>n.remove());prompt().classList.remove('hidden-target','revealed');}
function stopTimer(){clearInterval(timer);timer=null;const old=$('#timer');if(old)old.remove();}
function startTimer(seconds,onEnd){stopTimer();time=seconds;const el=document.createElement('div');el.id='timer';el.className='timer-big dynamic';el.textContent=time;card().appendChild(el);aud().select();timer=setInterval(()=>{time--;el.textContent=time;if(time<=5&&time>0){el.classList.add('danger');aud().count(time)}if(time<=0){clearInterval(timer);timer=null;el.textContent='0';aud().timeup();if(onEnd)onEnd()}},1000)}
function setCard(title,desc,tag){badge().textContent=tag||cfg.badge||'SPEAKING GAME';prompt().textContent=title||'';sub().textContent=desc||'';}
function btn(label,cls,id){return '<button class="'+(cls||'new-btn')+'" '+(id?'id="'+id+'"':'')+' type="button">'+label+'</button>'}
function nextItem(){if(!deck.length||pos>=deck.length-1){deck=cfg.type==='bingo'?Array.from({length:30},()=>shuffle(cfg.items||[]).slice(0,16)):shuffle(cfg.items||[]);pos=-1}const x=deck[++pos];history.push(x);renderItem(x);aud().soft()}
function prevItem(){if(history.length<2)return;history.pop();renderItem(history[history.length-1]);aud().soft()}
function baseButtons(extra){controls().innerHTML=btn('↩ Previous','new-btn','prev')+btn('Next →','new-btn primary','next')+btn('↻ Shuffle','new-btn','shuffle')+(extra||'');$('#prev').onclick=prevItem;$('#next').onclick=nextItem;$('#shuffle').onclick=()=>{deck=[];pos=-1;nextItem();if(window.ESCGameKit)window.ESCGameKit.toast('Shuffled')}}
function addOptions(items,mode){
 const g=document.createElement('div');g.className='option-grid dynamic';g.innerHTML=items.map(v=>'<button class="option-card">'+esc(v)+'</button>').join('');card().appendChild(g);
 g.querySelectorAll('button').forEach(b=>b.onclick=()=>{
   if(mode==='limit3'){const selected=[...g.querySelectorAll('.selected')];if(b.classList.contains('selected'))b.classList.remove('selected');else if(selected.length<3)b.classList.add('selected')}
   else if(mode==='rank'){if(b.classList.contains('rank-selected'))return;rank.push(b.textContent);b.classList.add('rank-selected');b.dataset.rank=rank.length;let r=$('.rank-result');if(!r){r=document.createElement('div');r.className='rank-result dynamic';card().appendChild(r)}r.innerHTML=rank.map((v,i)=>'<span>#'+(i+1)+' '+esc(v)+'</span>').join('')}
   else{g.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')}
   aud().select();
 });
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
   controls().innerHTML=btn('Reveal identity','new-btn good','reveal')+btn('Next identity →','new-btn primary','next')+btn('↻ Shuffle','new-btn','shuffle');
   $('#reveal').onclick=()=>{prompt().classList.toggle('revealed');$('#reveal').textContent=prompt().classList.contains('revealed')?'Hide identity':'Reveal identity'};
   $('#next').onclick=nextItem;$('#shuffle').onclick=()=>{deck=[];nextItem()};
   break;
  case 'storyChain':
   setCard(x[1],x[2],x[0]);
   break;
  case 'explainBadly':
   setCard(x[1],x[2],x[0]);prompt().classList.add('hidden-target');
   controls().innerHTML=btn('Reveal to speaker','new-btn good','reveal')+btn('Next target →','new-btn primary','next');
   $('#reveal').onclick=()=>prompt().classList.toggle('revealed');$('#next').onclick=nextItem;
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
   controls().innerHTML=btn('Reveal word','new-btn good','reveal')+btn('Next word →','new-btn primary','next');$('#reveal').onclick=()=>prompt().classList.toggle('revealed');$('#next').onclick=nextItem;
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
   {const g=document.createElement('div');g.className='bingo-grid dynamic';g.innerHTML=x.map(v=>'<button class="bingo-cell">'+esc(v)+'</button>').join('');card().appendChild(g);g.querySelectorAll('button').forEach(b=>b.onclick=()=>b.classList.toggle('done'))}
   controls().innerHTML=btn('New bingo card','new-btn primary','next');$('#next').onclick=nextItem;
   break;
  case 'emoji':
   setCard('Build a story','Use every emoji in one connected story. Add a beginning, a problem and an ending.',x[0]);
   {const d=document.createElement('div');d.className='emoji-row dynamic';d.innerHTML=x[1].map(v=>'<span>'+v+'</span>').join('');card().appendChild(d)}
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
   {const d=document.createElement('div');d.className='scene-box dynamic';d.innerHTML='<div class="scene-icons">'+x.icons.join(' ')+'</div><div class="scene-title">'+esc(x.title)+'</div><ul class="scene-questions">'+x.questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>';card().appendChild(d)}
   break;
 }
}
function init(){
 $('#gameTitle').textContent=cfg.title||'ESC Game';$('#gameDesc').textContent=cfg.desc||'';$('#gameEyebrow').textContent=cfg.eyebrow||'ESC SPEAKING GAME';document.title=(cfg.title||'Game')+' · Eryaman Speaking Club';
 (cfg.rules||[]).forEach(r=>{const s=document.createElement('span');s.textContent=r;$('#gameRules').appendChild(s)});
 if(cfg.type==='bingo')deck=Array.from({length:30},()=>shuffle(cfg.items||[]).slice(0,16));else deck=shuffle(cfg.items||[]);
 nextItem();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();