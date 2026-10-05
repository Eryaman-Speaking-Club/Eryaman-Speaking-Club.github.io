(() => {
'use strict';
const cfg=window.ESC_NEW_GAME||{};

(function ensureExpandedContent(){
 const MIN=200;
 const cats=['Everyday','Social','Travel','Work','Food','Fun','Personal','Deep','Technology','Spicy'];
 const topics=['daily routines','free time','sleep','exercise','money','shopping','cooking','travel','public transport','friendship','family','work','career plans','education','English learning','technology','social media','music','movies','sports','health','stress','confidence','patience','honesty','trust','teamwork','communication','motivation','habits','decision making','time management','creativity','goals','memories','the future','weekends','holidays','restaurants','cafés','city life','remote work','meetings','job interviews','relationships','first impressions','personal space','good manners','online communication','phone use','news','weather','fashion','books','gaming','photography','learning new skills','saving money','healthy food','home life','neighbours','commuting','customer service','leadership','feedback','problem solving','risk taking','success','failure','change','comfort zones'];
 const words=['phone','wallet','umbrella','elevator','mirror','password','traffic','alarm','battery','neighbour','toothbrush','fridge','microwave','balcony','receipt','queue','headphones','keys','doorbell','vacuum cleaner','laundry','supermarket','pharmacy','suitcase','passport','airport','boarding pass','hotel','hostel','beach','map','tourist','ticket','platform','taxi','train','bus','bicycle','backpack','guidebook','delay','coffee','pizza','chocolate','burger','salad','breakfast','spicy food','recipe','dessert','restaurant','takeaway','leftovers','ingredient','reservation','waiter','menu','soup','popcorn','lemon','avocado','meeting','deadline','boss','email','salary','interview','promotion','colleague','presentation','remote work','feedback','teamwork','overtime','training','office','printer','spreadsheet','calendar','microphone','podcast','concert','karaoke','meme','gaming console','cinema','playlist','selfie','trailer','subtitle','audience','episode','board game','camera','book','newspaper','guitar','piano','football','basketball','tennis','gym','doctor','nurse','teacher','engineer','designer','chef','driver','pilot','lawyer','manager','student','cashier','photographer','musician','actor','writer','dentist','mechanic','farmer','programmer','firefighter','police officer','architect','scientist','receptionist','accountant','translator','barber','baker','coach','journalist','electrician','plumber','artist','shopkeeper','delivery driver','language teacher','tour guide','barista','pharmacist','librarian','entrepreneur','best friend','roommate','cousin','partner','teammate','stranger','customer','client','visitor','passenger','city centre','bus stop','train station','shopping mall','coffee shop','park','library','hospital','school','university','airport gate','hotel lobby','restaurant table','kitchen','bedroom','living room','bathroom','garden','mountain','village','museum','stadium','market','bank','post office','classroom','meeting room','parking lot','traffic light','bridge','tunnel','city square','metro station','rain','snow','sunshine','wind','storm','birthday','wedding','exam','trip','vacation','commute','morning routine','evening routine','lunch break','video call','group chat','online class','delivery order','shopping list','coffee break','weekend plan','flight delay','train journey','road trip','job offer','team project','workshop','language course','fitness class','doctor appointment','family dinner','house party','first date','museum visit','concert ticket','movie night','football match','book club','picnic','camping trip','hotel booking','restaurant booking','online order','lost luggage','phone charger','power bank','water bottle','notebook','office chair','coffee machine','washing machine','dishwasher','remote control','shopping cart','credit card','cash machine','street market','city map','travel insurance','seat belt','traffic jam','weather forecast','alarm clock','birthday cake','wedding invitation','job application','school project','presentation slide','voice message','email attachment','video game','fitness tracker','smart watch'];
 const places=['a café','an airport','a train station','a hotel','an office','a classroom','a supermarket','a restaurant','a park','a museum','a hospital','a library','a shopping mall','a bus stop','a beach','a mountain village','a city centre','a gym','a cinema','a meeting room'];
 const emojis=['☕','📱','🌧️','🚕','✈️','🧳','😱','😂','🎉','🍕','🏠','🚪','🔑','💼','📧','⏰','💸','❤️','🤔','🎵','🎬','⚽','🚲','🌙','☀️','🔥','🎁','🚌','🚆','📚','💻','🗺️'];
 const survival=['Fresh water filter','Knife','Tent','Fishing line','Solar charger','First-aid kit','Mirror','Blanket','Rope','Flashlight','Compass','Cooking pot','Rain jacket','Water bottle','Radio','Map','Multi-tool','Insect repellent','Notebook','Emergency whistle'];
 const arr=Array.isArray(cfg.items)?cfg.items:(cfg.items=[]);
 const seen=new Set(arr.map(x=>JSON.stringify(x)));
 const add=x=>{const k=JSON.stringify(x);if(!seen.has(k)){arr.push(x);seen.add(k)}};
 const cap=s=>String(s).replace(/\b\w/g,m=>m.toUpperCase());
 const cat=i=>cats[i%cats.length],topic=i=>topics[i%topics.length],word=i=>words[i%words.length],place=i=>places[i%places.length];
 const patterns={
  roulette:[
   t=>'What is one thing you would change about '+t+'?',
   t=>'What have you learned recently about '+t+'?',
   t=>'What makes '+t+' easier or more difficult?',
   t=>'What advice would you give someone about '+t+'?'
  ],
  opinion:[
   t=>cap(t)+' is more important than people think.',
   t=>'People should spend less time worrying about '+t+'.',
   t=>'Schools should teach more practical lessons about '+t+'.',
   t=>'Technology has improved the way we deal with '+t+'.'
  ],
  finish:[
   t=>'When I think about '+t+', the first thing that comes to mind is...',
   t=>'The best thing about '+t+' is...',
   t=>'I wish people understood that '+t+'...',
   t=>'One thing I would change about '+t+' is...'
  ],
  hot:[
   t=>cap(t)+' should be treated as a basic life skill.',
   t=>'People take '+t+' too seriously.',
   t=>'Modern life has made '+t+' unnecessarily complicated.',
   t=>'We would be happier if we changed the way we think about '+t+'.'
  ],
  lie:[
   t=>'A time when '+t+' surprised you.',
   t=>'Something unusual that happened because of '+t+'.',
   t=>'A mistake you once made involving '+t+'.',
   t=>'A story about '+t+' that sounds difficult to believe.'
  ],
  bingo:[
   t=>'Has recently talked about '+t,
   t=>'Would like to improve something about '+t,
   t=>'Has a strong opinion about '+t,
   t=>'Can tell a funny story about '+t
  ]
 };
 function generate(i){
  const cycle=Math.floor(i/topics.length)%4;
  switch(cfg.type){
   case 'twoTruths': return [cat(i),cap(topic(i)), 'Say three statements about '+topic(i)+'. Two must be true and one must be false.'];
   case 'whoAmI': return [cat(i),cap(word(i))];
   case 'storyChain': return [cat(i),'When I arrived at '+place(i)+', I found '+word(i)+' waiting for me.','By the third player, connect the story to '+topic(i)+'.'];
   case 'explainBadly': return [cat(i),cap(word(i)),'Describe it without saying its name or the most obvious category word.'];
   case 'roulette': return [cat(i),patterns.roulette[cycle](topic(i)),'Give one specific example and let someone ask one follow-up question.'];
   case 'opinion': return [cat(i),patterns.opinion[cycle](topic(i))];
   case 'ranking': return {cat:cat(i),title:'Rank these for '+topic(i),items:[word(i),word(i+7),word(i+19),word(i+31),word(i+43)].map(cap)};
   case 'detective': return {cat:cat(i),title:'The Missing '+cap(word(i)),setup:'A '+word(i)+' disappeared at '+place(i)+' between '+(10+i%10)+':10 and '+(10+i%10)+':20. Your group says you were together the whole time.',facts:['Agree where everyone was standing or sitting.','Agree what each person was doing five minutes earlier.','Agree on one detail the detective can verify.']};
   case 'finish': return [cat(i),patterns.finish[cycle](topic(i))];
   case 'threeClues': return [cat(i),cap(word(i))];
   case 'mission': {
    const missionPatterns=[
     t=>'During the conversation, ask someone about '+t+' and ask one natural follow-up question.',
     t=>'Naturally bring up '+t+' and invite two people to share different opinions.',
     t=>'Ask a question about '+t+' without using the words “yes” or “no”.',
     t=>'Find someone with a different view about '+t+' and ask what shaped their opinion.'
    ];
    return missionPatterns[cycle](topic(i));
   }
   case 'minuteStory': return [word(i),word(i+17),word(i+41)];
   case 'wouldILie': return [cat(i),patterns.lie[cycle](topic(i))];
   case 'desert': return {cat:cat(i),title:'Survival challenge: '+topic(i)+' near '+place(i),items:Array.from({length:8},(_,j)=>survival[(i+j*3)%survival.length])};
   case 'bingo': return patterns.bingo[cycle](topic(i));
   case 'emoji': {
    const g=Math.floor(i/emojis.length);
    return [cat(i),[emojis[i%emojis.length],emojis[(i+5+g)%emojis.length],emojis[(i+11+g*2)%emojis.length],emojis[(i+19+g*3)%emojis.length]]];
   }
   case 'worstAdvice': return [cat(i),'I keep having problems with '+topic(i)+' and I do not know what to change.'];
   case 'sell': return {item:cap(word(i)),twist:'Sell it to someone who cares most about '+topic(i)+'.'};
   case 'hotTake': return [cat(i),patterns.hot[cycle](topic(i))];
   case 'photoTalk': return {cat:cat(i),title:cap(word(i))+' at '+cap(place(i)),desc:'Someone is at '+place(i)+' with '+word(i)+' when an unexpected situation begins.',icons:[emojis[i%emojis.length],emojis[(i+3)%emojis.length],emojis[(i+9)%emojis.length]],questions:['What probably happened just before this moment?','How does the person feel and why?','What is the most likely thing to happen next?']};
   default:return null;
  }
 }
 for(let i=0;arr.length<MIN&&i<3000;i++){const x=generate(i);if(x!==null)add(x)}
})();
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
    const safe=JSON.parse(JSON.stringify(builtInItems)).filter(validItem);
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
   controls().innerHTML=btn('Reveal identity','new-btn good','reveal')+btn('Next identity →','new-btn primary','next')+btn('↻ Shuffle','new-btn','shuffle');
   $('#reveal').onclick=()=>{prompt().classList.toggle('revealed');$('#reveal').textContent=prompt().classList.contains('revealed')?'Hide identity':'Reveal identity'};
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
async function syncRemote(){
  try{
    if(window.ESCGameKit?.ensurePlatform)await window.ESCGameKit.ensurePlatform();
    for(let i=0;i<40&&!window.ESCSupabase;i++)await new Promise(r=>setTimeout(r,50));
    if(!window.ESCSupabase?.getGameSettings||!cfg.slug)return;
    const settings=await window.ESCSupabase.getGameSettings(cfg.slug);
    if(settings&&Array.isArray(settings.content)){
      const remote=JSON.parse(JSON.stringify(settings.content)).filter(validItem);
      if(remote.length){
        cfg.items=remote;
        if(!userInteracted){deck=[];pos=-1;history=[];historyCursor=-1;nextItem()}
      }else{
        console.warn('Remote game content was empty or invalid; keeping built-in cards.');
      }
    }
  }catch(e){console.warn('Shared game content unavailable; using built-in cards.',e)}
}
function resetToBuiltIns(){cfg.items=JSON.parse(JSON.stringify(builtInItems));deck=[];pos=-1;history=[];historyCursor=-1;nextItem()}
function init(){
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