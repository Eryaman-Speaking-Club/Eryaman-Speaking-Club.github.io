/* Public Taboo controller: correct +1, forbidden word -1, pass 0. */
const cats=['All','Everyday','Travel','Food','Work','Entertainment'],TEAM_KEY='esc-taboo-team-config-v1';
let selected='All',deck=[],pos=-1,score=0,correct=0,fouls=0,passes=0,time=60,t=null,running=false,activeTeam=0,teamMode=false;
let phase='ready',remainingMs=60000,deadline=0,activeCard=null,cardHidden=false;
let teams=[{name:'Team A',players:['Player 1'],score:0,playerIndex:0},{name:'Team B',players:['Player 2'],score:0,playerIndex:0}];
const $=id=>document.getElementById(id),shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function cleanPlayers(raw,fallback){const p=String(raw).split(/\n/).map(x=>x.trim().slice(0,60)).filter(Boolean).slice(0,100);return p.length?p:[fallback]}
function loadTeams(){try{const saved=JSON.parse(localStorage.getItem(TEAM_KEY)||'null');if(saved&&Array.isArray(saved.teams)&&saved.teams.length===2){teamMode=!!saved.teamMode;teams=saved.teams.map((x,i)=>({name:String(x.name||('Team '+(i+1))).trim().slice(0,60),players:cleanPlayers(Array.isArray(x.players)?x.players.join('\n'):'','Player '+(i+1)),score:0,playerIndex:0}))}}catch{}}
function saveTeamConfig(){try{localStorage.setItem(TEAM_KEY,JSON.stringify({teamMode,teams:teams.map(x=>({name:x.name,players:x.players}))}))}catch{ESCGameKit.toast('Player names cannot be saved in this browser. This round still works.')}}
function build(){deck=shuffle(cards.filter(x=>Array.isArray(x)&&x[1]&&Array.isArray(x[2])&&x[2].length&&(selected==='All'||x[0]===selected)));pos=-1;$('catInfo').textContent=selected==='All'?'All categories':selected}
function paintCard(){
 $('target').textContent=cardHidden?'Word hidden':String(activeCard?.[1]||'No cards available');
 $('forbidden').replaceChildren();
 if(!cardHidden&&activeCard)activeCard[2].forEach(word=>{const span=document.createElement('span');span.textContent=String(word);$('forbidden').appendChild(span)});
 document.querySelector('.dont').hidden=cardHidden||!activeCard;
 $('hideCard').textContent=cardHidden?'Show card':'Hide card';$('hideCard').setAttribute('aria-pressed',String(cardHidden));
}
function show(){if(!deck.length||pos>=deck.length-1)build();activeCard=deck[++pos]||null;$('badge').textContent=activeCard?.[0]||'EMPTY';paintCard();$('deckInfo').textContent=Math.max(0,deck.length-pos-1)+' left';if(!activeCard)stop();sync()}
function currentSpeaker(i){const team=teams[i];return team.players[team.playerIndex%team.players.length]}
function renderTeams(){
 $('teamStrip').hidden=!teamMode;
 if(!teamMode){$('newRound').textContent='New round';$('gameNote').textContent='Correct +1 / Taboo -1 / Pass 0. Only the speaker should see the word. Online: share the word privately, then use Hide card before sharing your screen.';return}
 $('teamAName').textContent=teams[0].name;$('teamBName').textContent=teams[1].name;$('teamAScore').textContent=teams[0].score;$('teamBScore').textContent=teams[1].score;
 $('teamAPlayers').textContent=teams[0].players.join(' / ');$('teamBPlayers').textContent=teams[1].players.join(' / ');
 $('turnTeam').textContent=teams[activeTeam].name+"'s turn";$('turnSpeaker').textContent='Speaker: '+currentSpeaker(activeTeam);
 $('teamABox').classList.toggle('active',activeTeam===0);$('teamBBox').classList.toggle('active',activeTeam===1);
 $('newRound').textContent='End turn / Next team';$('gameNote').textContent='Correct +1 / Taboo -1 / Pass 0. The net round score is added once. Teams alternate and speakers rotate. Use Hide card when sharing online.';
}
function sync(){
 $('timer').textContent=time;$('score').textContent='Score: '+score+' / Correct: '+correct+' / Taboo: '+fouls+' / Passes: '+passes;
 $('start').textContent=running?'Pause':phase==='paused'?'Resume':phase==='ended'?'Start new round':'Start 60s';$('start').disabled=!activeCard;
 ['got','tabooFoul','pass'].forEach(id=>{$(id).disabled=!running});
 $('tabooRoundStatus').textContent=phase==='running'?'Round in progress.':phase==='paused'?'Paused. Scores are locked until you resume.':phase==='ended'?'Time is up. Start a new round.':'Press Start 60s. Scoring opens only while the timer is running.';
 renderTeams();
}
function stop(){clearInterval(t);t=null;running=false;sync()}
function prepareRound(){clearInterval(t);t=null;running=false;phase='ready';remainingMs=60000;time=60;score=0;correct=0;fouls=0;passes=0;build();show()}
function finishTurn(auto=false){
 const roundScore=score;clearInterval(t);t=null;running=false;
 if(teamMode){const finished=teams[activeTeam];finished.score+=roundScore;finished.playerIndex=(finished.playerIndex+1)%finished.players.length;activeTeam=1-activeTeam;prepareRound();ESCGameKit.toast(finished.name+' scored '+roundScore+' / '+teams[activeTeam].name+' next')}
 else{phase='ended';remainingMs=0;time=0;sync();if(auto)ESCGameKit.toast('Time! Score: '+roundScore)}
}
function tick(){const previous=time;remainingMs=Math.max(0,deadline-Date.now());time=Math.ceil(remainingMs/1000);sync();if(time!==previous&&time<=5&&time>0)ESCGameKit.audio.count(time);if(remainingMs<=0){ESCGameKit.audio.timeup();finishTurn(true)}}
function start(){
 if(running){remainingMs=Math.max(0,deadline-Date.now());time=Math.ceil(remainingMs/1000);phase='paused';stop();return}
 if(phase==='ended')prepareRound();if(!activeCard)return;
 phase='running';running=true;deadline=Date.now()+remainingMs;sync();ESCGameKit.audio.select();t=setInterval(tick,200);
}
function record(kind){
 if(!running)return;if(Date.now()>=deadline){tick();return}
 if(kind==='got'){correct++;score++;ESCGameKit.audio.success()}
 else if(kind==='taboo'){fouls++;score--;ESCGameKit.audio.fail()}
 else{passes++;ESCGameKit.audio.soft()}
 show();
}
function openTeams(){if(running)start();$('team1Name').value=teams[0].name;$('team2Name').value=teams[1].name;$('team1Players').value=teams[0].players.join('\n');$('team2Players').value=teams[1].players.join('\n');$('teamsOverlay').classList.add('open');$('team1Name').focus()}
function closeTeams(){$('teamsOverlay').classList.remove('open')}
$('teamsBtn').onclick=openTeams;$('teamsClose').onclick=closeTeams;$('teamsOverlay').onclick=e=>{if(e.target===$('teamsOverlay'))closeTeams()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTeams()});
$('saveTeams').onclick=()=>{teams=[{name:$('team1Name').value.trim().slice(0,60)||'Team A',players:cleanPlayers($('team1Players').value,'Player 1'),score:0,playerIndex:0},{name:$('team2Name').value.trim().slice(0,60)||'Team B',players:cleanPlayers($('team2Players').value,'Player 2'),score:0,playerIndex:0}];teamMode=true;activeTeam=0;saveTeamConfig();closeTeams();prepareRound();ESCGameKit.toast('Team mode ready')};
$('quickPlay').onclick=()=>{teamMode=false;activeTeam=0;saveTeamConfig();closeTeams();prepareRound();ESCGameKit.toast('Quick play mode')};
$('resetScores').onclick=()=>{teams.forEach(x=>{x.score=0;x.playerIndex=0});activeTeam=0;prepareRound();ESCGameKit.toast('Team and round scores reset')};
$('start').onclick=start;$('got').onclick=()=>record('got');$('tabooFoul').onclick=()=>record('taboo');$('pass').onclick=()=>record('pass');
$('newRound').onclick=()=>{if(teamMode)finishTurn();else prepareRound()};$('hideCard').onclick=()=>{cardHidden=!cardHidden;paintCard()};
cats.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='game-chip'+(c==='All'?' active':'');b.textContent=c;b.onclick=()=>{selected=c;document.querySelectorAll('.game-chip').forEach(x=>x.classList.toggle('active',x===b));prepareRound()};$('chips').appendChild(b)});loadTeams();build();show();sync();
