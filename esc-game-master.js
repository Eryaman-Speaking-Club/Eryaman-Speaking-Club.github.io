/* ESC Game Master - session, poll, scores, tasks and joined-player board */
(()=>{'use strict';if(window.ESCGameMaster)return;
const GAMES=["conversation-bingo","debate-roulette","desert-island","detective-alibi","emoji-story","explain-it-badly","finish-the-sentence","five-second-challenge","hot-seat","hot-take","last-thing-you-did","most-likely-to","never-have-i-ever","one-for-me-one-for-you","one-minute-story","opinion-line","photo-talk","question-roulette","ranking-room","red-flag-green-flag","secret-mission","sell-me-this","story-chain","taboo","three-clues","truth-or-dare","two-truths-one-lie","what-would-you-do-if","who-am-i","worst-advice-only","would-i-lie-to-you","would-you-rather"];
const LABEL=x=>x.replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
const CHALLENGES=['Answer using the past tense.','Give three reasons.','Ask another player a follow-up question.','Give a real-life example.','Explain your idea without using “very”.','Make your answer a short story.','Use “because”, “however”, and “therefore”.','Compare two possibilities.','Include a question in your answer.','Finish your answer with a recommendation.','Speak for at least 30 seconds.','Draw a clue and describe it.'];
const POWERS=['Joker: skip one prompt','Extra 15 seconds','Double points: next correct answer','Switch player','Draw instead of explaining'];
const MIX=[{slug:'question-roulette',mins:10},{slug:'taboo',mins:15},{slug:'debate-roulette',mins:15},{slug:'one-for-me-one-for-you',mins:20}];
const KEY='esc-gamemaster-session-v1';
let client=null,session=null,data=null,timer=null,speechTimer=null,speechStarted=0,remaining=60,boardPainting=false,boardPoints=[],lastBoardLength=-1,projector=false,view='players',requesting=false,lastFocused=null;
let hostBtn=null,shade=null,stage=null,notifyEl=null,speechApi=null;
let renderSignature='',qrVisible=false,boardInk='#174b82',boardThickness=3,transcript='',refreshQueued=false;
const q=s=>stage?.querySelector(s);const e=s=>document.createElement(s);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function flash(msg){if(!notifyEl)return;notifyEl.textContent=msg;notifyEl.hidden=false;clearTimeout(flash.t);flash.t=setTimeout(()=>{notifyEl.hidden=true},3500)}
async function db(){if(client)return client;client=await window.ESCSupabase?.getClient?.();if(!client)throw Error('Game service is not available');return client}
async function rpc(name,args){const {data,error}=await (await db()).rpc(name,args);if(error)throw Error(error.message||'Game service unavailable');return data}
function save(){try{if(session)sessionStorage.setItem(KEY,JSON.stringify(session));else sessionStorage.removeItem(KEY)}catch(_){}}
function load(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'null');if(x&&/^[0-9A-F]{10}$/.test(x.code)&&/^[a-f0-9]{64}$/.test(x.token))session=x}catch(_){}}
function queryRoom(){return(new URLSearchParams(location.search)).get('room')?.toUpperCase().slice(0,10)||''}
function open(){if(!shade)return;lastFocused=document.activeElement;shade.hidden=false;document.body.classList.add('esc-gm-open');if(session){wrap('<div class="esc-gm-section"><h3>Connecting to your room…</h3><p>Loading the latest session state.</p></div>');void refresh()}else showWelcome();shade.querySelector('.esc-gm-close')?.focus()}
function close(){if(!shade)return;speechApi?.stop();speechApi=null;shade.hidden=true;document.body.classList.remove('esc-gm-open');lastFocused?.focus?.()}
function title(){return document.querySelector('main h1,.game-hero h1,.new-game-hero h1')?.textContent?.trim()||LABEL(location.pathname.split('/')[1]||'taboo')}
function slug(){const g=location.pathname.split('/').filter(Boolean)[0];return GAMES.includes(g)?g:'taboo'}
function wrap(html){stage.querySelector('.esc-gm-main').innerHTML=html;bindMain()}
function showWelcome(){data=null;wrap('<div class="esc-gm-section"><div class="esc-gm-overline">NEW GAME SESSION</div><h3>Play together, even on different phones.</h3><p>Start a hosted session or join with a room code. No participant account required.</p><label>Your display name<input id="gmName" maxlength="40" placeholder="Enter your name" autocomplete="nickname"></label><div class="esc-gm-two"><button data-do="create" class="esc-gm-primary">Create room</button><button data-do="joinForm">Join a room</button></div></div>');}
function showJoin(){wrap('<div class="esc-gm-section"><h3>Join game session</h3><p>Enter the code displayed on the host screen.</p><label>Room code<input id="gmCode" maxlength="10" placeholder="XXXXXXXXXX" value="'+escape(queryRoom())+'" autocapitalize="characters"></label><label>Your name<input id="gmName" maxlength="40" placeholder="Your name" autocomplete="nickname"></label><div class="esc-gm-two"><button data-do="join" class="esc-gm-primary">Join room</button><button data-do="welcome">Back</button></div></div>');}
function tab(label,which){return '<button class="'+(view===which?'active':'')+'" data-tab="'+which+'">'+label+'</button>'}
function roomUrl(){return location.origin+'/play/?room='+encodeURIComponent(session.code)}
function showQrPanel(){
 if(!qrVisible||!session||!stage||stage.querySelector('.esc-gm-qr'))return;
 const summary=stage.querySelector('.esc-gm-summary');if(!summary)return;
 const node=e('div');node.className='esc-gm-qr';
 const pic=e('img');pic.src='https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data='+encodeURIComponent(roomUrl());
 pic.alt='Scan QR to join room '+session.code;pic.width=220;pic.height=220;
 const caption=e('p');caption.textContent='Scan to join · '+roomUrl();
 pic.onerror=()=>{caption.textContent='QR could not load. Use Copy invite instead.'};
 node.append(pic,caption);summary.insertAdjacentElement('afterend',node);
}
function viewSignature(){
 if(!data)return'';
 const r=data.room,base=[r.code,r.game,r.round,r.status],p=data.players||[];
 if(view==='players')return JSON.stringify(['players',base,r.currentTurn,p]);
 if(view==='votes')return JSON.stringify(['votes',base,r.question,r.voteOpen,r.settings?.voteOptions,data.votes]);
 if(view==='board')return JSON.stringify(['board',base,r.board]);
 if(view==='activities')return JSON.stringify(['activities',base,r.challenge,r.settings]);
 return JSON.stringify(['summary',base,p]);
}
function render(force=false){
 if(!data||!stage||shade.hidden)return;
 const current=viewSignature(),active=document.activeElement;
 const isEditing=stage.contains(active)&&['INPUT','TEXTAREA','SELECT'].includes(active?.tagName);
 if(!force&&(current===renderSignature||boardPainting||isEditing||(view==='activities'&&speechApi)))return;
 renderSignature=current;
 const rememberedScroll=stage.scrollTop;
 const r=data.room,me=data.me,players=data.players||[],votes=data.votes||{},sum=Object.values(votes).reduce((a,b)=>a+Number(b),0);
 const controls=me.host;
 const common='<div class="esc-gm-summary"><div><strong>Room '+escape(session.code)+'</strong><span>'+escape(LABEL(r.game))+' · Round '+r.round+'</span></div><button data-do="copy" title="Copy player link">Copy invite</button><button data-do="qr">Show QR</button></div><div class="esc-gm-tabs">'+tab('Players','players')+tab('Votes','votes')+tab('Whiteboard','board')+tab('Activities','activities')+tab('Summary','summary')+'</div>';
 let html='';
 if(view==='players'){
  html='<div class="esc-gm-section"><div class="esc-gm-row"><h3>Players & scoreboard</h3>'+(controls?'<button data-do="nextTurn">Next player</button>':'')+'</div><div class="esc-gm-roster">'+players.map(p=>'<div class="esc-gm-player '+(r.currentTurn===p.id?'current':'')+'"><div class="esc-gm-avatar">'+escape(p.name.slice(0,1).toUpperCase())+'</div><div class="esc-gm-playername"><strong>'+escape(p.name)+(p.id===me.id?' (you)':'')+'</strong><small>Team '+escape(p.team||'—')+' · '+p.speakingSeconds+'s speaking</small></div><b>'+p.score+' pts</b>'+(controls?'<div class="esc-gm-steps"><button data-do="score" data-id="'+p.id+'" data-delta="-1" aria-label="Minus one point">−</button><button data-do="score" data-id="'+p.id+'" data-delta="1" aria-label="Add one point">+</button><button data-do="team" data-id="'+p.id+'">A/B</button><button data-do="turn" data-id="'+p.id+'">Turn</button></div>':'')+'</div>').join('')+'</div>'+(controls?'<div class="esc-gm-two"><label>Switch game<select id="gmGame">'+GAMES.map(x=>'<option value="'+x+'" '+(r.game===x?'selected':'')+'>'+LABEL(x)+'</option>').join('')+'</select></label><button data-do="changeGame">Change game</button></div><button data-do="newRound">Start next round</button>':'')+'</div>';
 }else if(view==='votes'){
  const opts=Array.isArray(r.settings.voteOptions)?r.settings.voteOptions:['A','B'];
  html='<div class="esc-gm-section"><h3>Live poll</h3><p>'+escape(r.question||'Ask your group a question.')+'</p>'+(controls?'<label>Question<input id="gmPoll" maxlength="220" placeholder="What do you think?" value="'+escape(r.question)+'"></label><div class="esc-gm-two"><button data-do="poll" class="esc-gm-primary">Open voting</button><button data-do="closePoll">Close voting</button></div>':'')+'<div class="esc-gm-vote">'+opts.map(o=>'<button '+(!r.voteOpen?'disabled':'')+' data-do="vote" data-choice="'+escape(o)+'">'+escape(o)+'</button>').join('')+'</div><div class="esc-gm-results">'+opts.map(o=>'<div><span>'+escape(o)+'</span><div><i style="width:'+(sum?Math.round(100*(votes[o]||0)/sum):0)+'%"></i></div><b>'+Number(votes[o]||0)+'</b></div>').join('')+'</div><p>'+sum+' votes · '+(r.voteOpen?'Voting open':'Voting closed')+'</p></div>';
 }else if(view==='board'){
  html='<div class="esc-gm-section"><div class="esc-gm-row"><h3>Shared Whiteboard</h3>'+(controls?'<button data-do="clearBoard">Clear</button>':'')+'</div><p>Draw with a mouse or finger. Everyone in the room sees the same board.</p><div class="esc-gm-canvas"><canvas id="gmBoard" width="720" height="400"></canvas></div><div class="esc-gm-row"><label>Ink <input type="color" id="gmInk" value="'+boardInk+'"></label><label>Size <input id="gmSize" type="range" min="1" max="12" value="'+boardThickness+'"></label></div></div>';
 }else if(view==='activities'){
  html='<div class="esc-gm-section"><h3>Speaking challenges</h3><p>'+escape(r.challenge||'Choose a challenge to get started.')+'</p><div class="esc-gm-two"><button data-do="challenge">Random challenge</button><button data-do="power">Power-up card</button></div>'+(controls?'<div class="esc-gm-row"><button data-do="mix">Start Game Mix</button><button data-do="projector">Projector mode</button></div>':'')+'<h4>Speaking practice</h4><div class="esc-gm-two"><button data-do="voiceStart">Start speech transcription</button><button data-do="voiceStop">Stop</button></div><textarea id="gmTranscript" aria-label="Local speaking transcript" placeholder="Speech appears here when supported by your browser." rows="3"></textarea><h4>Speaking timer</h4><div class="esc-gm-timer" id="gmTimer">'+remaining+'s</div><div class="esc-gm-three"><button data-do="timerStart">Start</button><button data-do="timerStop">Stop</button><button data-do="timerReset">Reset</button></div><p>Speaking time is self-reported; microphone recording is not required.</p></div>';
 }else if(view==='summary'){
  const total=players.reduce((a,p)=>a+p.speakingSeconds,0);
  html='<div class="esc-gm-section"><h3>Session summary</h3><div class="esc-gm-stat"><b>'+players.length+'</b><span>Players</span></div><div class="esc-gm-stat"><b>'+r.round+'</b><span>Rounds</span></div><div class="esc-gm-stat"><b>'+Math.round(total/60)+'</b><span>Estimated speaking minutes</span></div><div class="esc-gm-stat"><b>'+players.reduce((a,p)=>a+p.score,0)+'</b><span>Total points</span></div><button data-do="downloadSummary">Download results</button>'+(controls?'<button data-do="endSession">End session</button>':'')+'</div>';
 }
 stage.querySelector('.esc-gm-main').innerHTML=common+html+'<div class="esc-gm-footer"><span>'+escape(r.status==='active'?'● Session live':'● Session ended')+'</span><button data-do="leave">Leave room</button></div>';
 bindMain();
 if(r.status!=='active')stage.querySelectorAll('[data-do]').forEach(b=>{if(!['downloadSummary','leave','copy','qr'].includes(b.dataset.do))b.disabled=true});
 if(view==='board')drawBoard();
 if(view==='activities'&&q('#gmTranscript'))q('#gmTranscript').value=transcript;
 if(r.game!==slug()&&!location.pathname.startsWith('/play/'))stage.querySelector('.esc-gm-summary')?.insertAdjacentHTML('beforeend','<a href="/'+encodeURIComponent(r.game)+'/?gm=1">Open current game</a>');
 showQrPanel();stage.scrollTop=rememberedScroll;
}
function pos(evt,canvas){const z=canvas.getBoundingClientRect();return [+(Math.max(0,Math.min(1,(evt.clientX-z.left)/z.width)).toFixed(4)),+(Math.max(0,Math.min(1,(evt.clientY-z.top)/z.height)).toFixed(4))]}
function paint(ctx,path,w,h){const points=path.points;if(!Array.isArray(points)||points.length<2)return;ctx.beginPath();ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.min(20,Math.max(1,Number(path.size)||3));ctx.strokeStyle=/^#[0-9a-f]{6}$/i.test(path.color)?path.color:'#174b82';points.forEach((p,i)=>{const x=Number(p[0])*w,y=Number(p[1])*h;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.stroke()}
function drawBoard(){const canvas=q('#gmBoard');if(!canvas)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,720,400);ctx.fillStyle='#fff';ctx.fillRect(0,0,720,400);(data.room.board||[]).forEach(p=>paint(ctx,p,720,400));if(boardPoints.length>1)paint(ctx,{points:boardPoints,color:boardInk,size:boardThickness},720,400);lastBoardLength=(data.room.board||[]).length}
function bindBoard(){const c=q('#gmBoard');if(!c)return;
 const ink=q('#gmInk'),size=q('#gmSize');
 if(ink)ink.oninput=()=>{boardInk=ink.value};
 if(size)size.oninput=()=>{boardThickness=Number(size.value)||3};
 c.style.touchAction='none';c.onpointerdown=ev=>{boardPainting=true;boardPoints=[pos(ev,c)];c.setPointerCapture(ev.pointerId)};c.onpointermove=ev=>{if(!boardPainting)return;boardPoints.push(pos(ev,c));if(boardPoints.length>95)boardPoints=boardPoints.filter((_,i)=>i%2===0);drawBoard()};c.onpointerup=async ev=>{if(!boardPainting)return;boardPainting=false;boardPoints.push(pos(ev,c));const path={points:boardPoints,color:boardInk,size:boardThickness};boardPoints=[];try{await action('board_add',path);await refresh()}catch(err){flash(err.message)}};c.onpointercancel=()=>{boardPainting=false;boardPoints=[];drawBoard()}}
async function refresh(){
 if(!session)return;
 if(requesting){refreshQueued=true;return}
 requesting=true;
 const code=session.code,token=session.token;
 try{
   const next=await rpc('esc_live_snapshot',{p_code:code,p_token:token});
   if(!session||session.code!==code||session.token!==token)return;
   data=next;
   if(!shade.hidden)render();
 }catch(err){
   if(!session||session.code!==code)return;
   if(!shade.hidden)flash(err.message);
   if(/expired|Invalid room|Invalid room access|Room membership required/i.test(err.message)){
     session=null;data=null;renderSignature='';save();showWelcome();
   }
 }finally{
   requesting=false;
   if(refreshQueued){refreshQueued=false;setTimeout(()=>{if(session)refresh()},50)}
 }
}
async function action(kind,payload={}){if(!session)throw Error('Join a room first');return rpc('esc_live_action',{p_code:session.code,p_token:session.token,p_kind:kind,p_payload:payload})}
function download(){const lines=['ESC Game Master · '+session.code,'Game: '+LABEL(data.room.game),'Rounds: '+data.room.round,'Players:'];data.players.forEach(p=>lines.push(p.name+' · '+p.score+' pts · '+p.speakingSeconds+' seconds'));const blob=new Blob([lines.join('\n')],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=e('a');a.href=url;a.download='esc-game-master-summary.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function handle(btn){const kind=btn.dataset.do;const id=btn.dataset.id;try{
 if(kind==='create'||kind==='join'){
  const name=q('#gmName')?.value?.trim()||'';if(!name)throw Error('Enter your name');
  const x=kind==='create'?await rpc('esc_live_create',{p_name:name,p_game:slug()}):await rpc('esc_live_join',{p_name:name,p_code:q('#gmCode')?.value?.trim()||''});
  session=x;save();view='players';await refresh();flash('Connected to room '+x.code);return;
 }
 if(kind==='joinForm'){showJoin();return}if(kind==='welcome'){showWelcome();return}
 if(kind==='copy'){await navigator.clipboard.writeText(roomUrl());flash('Invite link copied');return}
 if(kind==='qr'){qrVisible=!qrVisible;const old=stage.querySelector('.esc-gm-qr');if(old)old.remove();else showQrPanel();return}
 if(kind==='leave'){session=null;data=null;save();showWelcome();return}
 if(kind==='downloadSummary'){download();return}
 if(kind==='voiceStart'){const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){flash('Speech recognition is not supported here');return}speechApi?.stop();speechApi=new Speech();speechApi.lang='en-US';speechApi.continuous=true;speechApi.interimResults=true;speechApi.onresult=ev=>{const text=[...ev.results].map(x=>x[0].transcript).join(' ');if(q('#gmTranscript'))q('#gmTranscript').value=text};speechApi.onerror=ev=>flash('Speech error: '+ev.error);speechApi.start();flash('Allow microphone access to transcribe your speech');return}
 if(kind==='voiceStop'){speechApi?.stop();speechApi=null;return}
 if(kind==='timerStart'){if(speechTimer)return;remaining=Math.max(1,remaining);speechStarted=Date.now();speechTimer=setInterval(()=>{remaining=Math.max(0,remaining-1);if(q('#gmTimer'))q('#gmTimer').textContent=remaining+'s';if(!remaining)stopSpeaking()},1000);return}
 if(kind==='timerStop'){await stopSpeaking();return}if(kind==='timerReset'){await stopSpeaking();remaining=60;if(q('#gmTimer'))q('#gmTimer').textContent='60s';return}
 const payload={};let target=kind;
 if(kind==='score'){payload.playerId=id;payload.delta=Number(btn.dataset.delta)}
 else if(kind==='team'){const p=data.players.find(x=>x.id===id);payload.playerId=id;payload.team=p.team==='A'?'B':p.team==='B'?'':'A'}
 else if(kind==='turn'){payload.playerId=id}
 else if(kind==='nextTurn'){const ix=data.players.findIndex(p=>p.id===data.room.currentTurn);payload.playerId=data.players[(ix+1)%data.players.length]?.id;target='turn'}
 else if(kind==='changeGame'){payload.slug=q('#gmGame')?.value;target='game'}
 else if(kind==='newRound'){target='round'}
 else if(kind==='poll'){target='poll_open';payload.question=q('#gmPoll')?.value||'';payload.options=['A','B']}
 else if(kind==='closePoll'){target='poll_close'}
 else if(kind==='vote'){payload.choice=btn.dataset.choice}
 else if(kind==='clearBoard'){target='board_clear';if(!confirm('Clear the shared Whiteboard?'))return}
 else if(kind==='challenge'){target='challenge';payload.text=CHALLENGES[Math.floor(Math.random()*CHALLENGES.length)]}
 else if(kind==='power'){target='challenge';payload.text=POWERS[Math.floor(Math.random()*POWERS.length)]}
 else if(kind==='projector'){document.body.classList.toggle('esc-gm-projector');flash('Projector view toggled');return}
 else if(kind==='mix'){target='game';payload.slug=MIX[Math.min(MIX.findIndex(x=>x.slug===data.room.game)+1,MIX.length-1)]?.slug||MIX[0].slug}
 else if(kind==='endSession'){target='end';if(!confirm('End this session for all players?'))return}
 else return;
 await action(target,payload);await refresh();
 }catch(err){flash(err.message)}}
async function stopSpeaking(){if(!speechTimer)return;clearInterval(speechTimer);speechTimer=null;const elapsed=Math.min(120,Math.floor((Date.now()-speechStarted)/1000));if(elapsed>0&&session){try{await action('speaking',{seconds:elapsed});await refresh()}catch(err){flash(err.message)}}}
function bindMain(){stage.querySelectorAll('[data-do]').forEach(b=>b.onclick=()=>handle(b));stage.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{view=b.dataset.tab;render(true)});if(view==='board'&&data)bindBoard()}
function mount(){
 if(document.querySelector('.esc-gm-layer'))return;
 const css=e('link');css.rel='stylesheet';css.href='/esc-game-master.css?v=20261029-mvp1';document.head.appendChild(css);
 shade=e('div');shade.className='esc-gm-layer';shade.hidden=true;
 shade.innerHTML='<div class="esc-gm-dialog" role="dialog" aria-modal="true" aria-label="ESC Game Master"><header class="esc-gm-head"><div><small>ERYAMAN SPEAKING CLUB</small><strong>Game Master</strong></div><button type="button" class="esc-gm-close" aria-label="Close">×</button></header><main class="esc-gm-main"></main></div><div class="esc-gm-toast" hidden></div>';
 document.body.appendChild(shade);stage=shade.querySelector('.esc-gm-dialog');notifyEl=shade.querySelector('.esc-gm-toast');
 shade.querySelector('.esc-gm-close').onclick=close;
 shade.addEventListener('pointerdown',ev=>{if(ev.target===shade)close()});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!shade.hidden)close()});
 const top=document.querySelector('.game-actions,.new-game-actions,.header-actions,.esc-display-actions,.hub-hero,.game-topbar,.new-game-topbar');
 hostBtn=e('button');hostBtn.type='button';hostBtn.className='esc-gm-launch';hostBtn.textContent='Game Master';hostBtn.title='Players, voting, scoring and live collaboration';hostBtn.onclick=open;
 (top||document.body).appendChild(hostBtn);
 load();
 const url=queryRoom();if(url&&(!session||session.code!==url)){session=null;save();open();showJoin()}else if(session){refresh();if(location.pathname.startsWith('/play/'))open()}
 else if(location.pathname.startsWith('/play/')){open();showJoin()}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session)void refresh()});
 setInterval(()=>{if(session&&!document.hidden)void refresh()},3000);
}
window.ESCGameMaster={open,mount};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();