(function(){
  'use strict';

  const path=(location.pathname.replace(/\/+$/,'')||'/');
  const $id=id=>document.getElementById(id);
  const toast=msg=>{try{ESCGameKit.toast(msg)}catch(e){}};
  const soft=()=>{try{ESCGameKit.audio.soft()}catch(e){}};
  const select=()=>{try{ESCGameKit.audio.select()}catch(e){}};
  const success=()=>{try{ESCGameKit.audio.success()}catch(e){}};

  const style=document.createElement('style');
  style.textContent=`
    .esc-depth-box{margin-top:14px;padding:12px 14px;border:1px solid #e1e9ef;border-radius:16px;background:#f8fafc;color:#52677b}
    .esc-depth-title{font-size:10px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;color:#175ca8;margin-bottom:8px}
    .esc-depth-row{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
    .esc-depth-mini{min-height:38px;border:1px solid #d8e3ec;border-radius:12px;background:#fff;color:#0b2f5b;padding:0 12px;font:inherit;font-size:11px;font-weight:900;cursor:pointer}
    .esc-depth-mini strong{margin-left:5px}
    .esc-depth-mini.active{background:#edf5fc;border-color:#8fb2d5}
    .esc-depth-reset{color:#6e8193}
    .esc-depth-note{margin-top:7px;text-align:center;font-size:10px;font-weight:800;color:#8494a4}
    .esc-roster-btn{min-height:44px;border:1px solid #dce5ed;border-radius:15px;background:#fff;color:#0b2f5b;padding:0 13px;font:inherit;font-size:12px;font-weight:900;cursor:pointer;white-space:nowrap}
    .esc-roster-overlay{position:fixed;inset:0;z-index:9500;display:none;place-items:center;padding:18px;background:rgba(7,28,52,.48);backdrop-filter:blur(7px)}
    .esc-roster-overlay.open{display:grid}
    .esc-roster-panel{width:min(540px,96vw);max-height:88vh;overflow:auto;background:#fff;border:1px solid rgba(11,47,91,.08);border-radius:24px;padding:20px;box-shadow:0 28px 90px rgba(0,0,0,.27)}
    .esc-roster-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}.esc-roster-head h2{margin:0 0 5px;color:#0b2f5b}.esc-roster-head p{margin:0;color:#718397;font-size:12px;line-height:1.45}
    .esc-roster-close{width:40px;height:40px;border:1px solid #dce5ed;border-radius:13px;background:#fff;color:#0b2f5b;font-size:23px;cursor:pointer}
    .esc-roster-panel textarea{width:100%;min-height:180px;margin-top:14px;border:1px solid #d5e0e9;border-radius:14px;padding:12px;font:inherit;font-size:13px;resize:vertical;outline:none}
    .esc-roster-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:10px}.esc-roster-actions button{min-height:40px;border-radius:12px;padding:0 13px;font:inherit;font-size:11px;font-weight:900;cursor:pointer}
    .esc-roster-save{border:0;background:linear-gradient(135deg,#0b2f5b,#175ca8);color:#fff}.esc-roster-secondary{border:1px solid #dce5ed;background:#fff;color:#0b2f5b}
    .esc-player-picks{display:none;margin-top:10px}.esc-player-picks.show{display:block}.esc-player-chip{min-height:36px;border:1px solid #d8e3ec;border-radius:999px;background:#fff;color:#0b2f5b;padding:0 12px;font:inherit;font-size:11px;font-weight:900;cursor:pointer}.esc-player-chip.active{background:#0b2f5b;color:#fff;border-color:#0b2f5b}
    .esc-turn-strip{display:none;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;padding:11px 14px;border:1px solid #dce5ed;border-radius:16px;background:#fff}.esc-turn-strip.show{display:flex}.esc-turn-strip strong{color:#0b2f5b}.esc-turn-strip span{color:#718397;font-size:11px;font-weight:850}.esc-scoreboard{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.esc-score-pill{padding:5px 8px;border-radius:999px;background:#eef5fb;color:#175ca8;font-size:10px;font-weight:900}
    @media(max-width:680px){.esc-roster-btn{width:44px;padding:0;font-size:16px}.esc-roster-btn span{display:none}.esc-turn-strip{align-items:flex-start;flex-direction:column}.esc-scoreboard{justify-content:flex-start}.esc-depth-row{align-items:stretch}.esc-depth-mini{flex:1}}
  `;
  document.head.appendChild(style);

  function attachReset(ids,fn){
    ids.forEach(id=>{const el=$id(id);if(el)el.addEventListener('click',()=>setTimeout(fn,0))});
    document.querySelectorAll('.game-chip').forEach(el=>el.addEventListener('click',()=>setTimeout(fn,0)));
  }

  function createRoster({storageKey,title,help,onSave,onReset}){
    const host=document.querySelector('.game-actions')||document.querySelector('.header-actions')||document.querySelector('.topbar');
    if(!host)return null;
    const btn=document.createElement('button');btn.type='button';btn.className='esc-roster-btn';btn.innerHTML='<span>Players</span> 👥';host.insertBefore(btn,host.firstChild);
    const overlay=document.createElement('div');overlay.className='esc-roster-overlay';overlay.innerHTML=`<section class="esc-roster-panel" role="dialog" aria-modal="true"><div class="esc-roster-head"><div><h2>${title}</h2><p>${help}</p></div><button type="button" class="esc-roster-close">×</button></div><textarea placeholder="One name per line"></textarea><div class="esc-roster-actions"><button type="button" class="esc-roster-secondary esc-clear">Play without players</button><button type="button" class="esc-roster-secondary esc-reset">Reset scores</button><button type="button" class="esc-roster-save">Save players</button></div></section>`;document.body.appendChild(overlay);
    const area=overlay.querySelector('textarea');
    let names=[];
    try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))names=saved.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim())}catch(e){}
    const close=()=>overlay.classList.remove('open');
    btn.onclick=()=>{area.value=names.join('\n');overlay.classList.add('open')};
    overlay.querySelector('.esc-roster-close').onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    overlay.querySelector('.esc-roster-save').onclick=()=>{names=area.value.split(/\n/).map(x=>x.trim()).filter(Boolean);localStorage.setItem(storageKey,JSON.stringify(names));close();onSave&&onSave([...names]);toast(names.length?'Players saved':'Player mode off')};
    overlay.querySelector('.esc-clear').onclick=()=>{names=[];localStorage.setItem(storageKey,'[]');area.value='';close();onSave&&onSave([]);toast('Player mode off')};
    overlay.querySelector('.esc-reset').onclick=()=>{onReset&&onReset();toast('Scores reset')};
    return{getNames:()=>[...names],setNames:v=>{names=[...v]}};
  }

  function setupWouldYouRather(){
    const why=$id('why');if(!why)return;
    const box=document.createElement('div');box.className='esc-depth-box';box.innerHTML='<div class="esc-depth-title">Optional group vote</div><div class="esc-depth-row"><button class="esc-depth-mini" id="escVoteA">+1 Option A <strong>0</strong></button><button class="esc-depth-mini" id="escVoteB">+1 Option B <strong>0</strong></button><button class="esc-depth-mini esc-depth-reset" id="escVoteReset">Reset</button></div><div class="esc-depth-note">Use this only when the group wants a visible vote count.</div>';why.insertAdjacentElement('afterend',box);
    let a=0,b=0;const render=()=>{box.querySelector('#escVoteA strong').textContent=a;box.querySelector('#escVoteB strong').textContent=b};const reset=()=>{a=0;b=0;render()};
    box.querySelector('#escVoteA').onclick=()=>{a++;render();select()};box.querySelector('#escVoteB').onclick=()=>{b++;render();select()};box.querySelector('#escVoteReset').onclick=reset;attachReset(['next','back','shuffle'],reset);
  }

  function setupRoundVotes(kind){
    if(kind==='flags'){
      const label=document.querySelector('.tally');if(!label)return;label.insertAdjacentHTML('afterbegin','<span>This round</span><span>•</span>');
      const render=()=>{$id('redCount').textContent='Red: '+r;$id('greenCount').textContent='Green: '+g};const resetRound=()=>{r=0;g=0;render()};
      $id('red').onclick=()=>{resetChoice();$id('red').classList.add('chosen');$id('follow').classList.add('show');r++;render();select()};
      $id('green').onclick=()=>{resetChoice();$id('green').classList.add('chosen');$id('follow').classList.add('show');g++;render();select()};
      attachReset(['next','back','shuffle'],resetRound);resetRound();
    }else{
      const stats=$id('stats');if(!stats)return;stats.textContent='This round · I HAVE: 0 · NEVER: 0';
      const render=()=>{stats.textContent='This round · I HAVE: '+have+' · NEVER: '+never};const resetRound=()=>{have=0;never=0;render()};
      $id('have').onclick=()=>{have++;$id('have').style.transform='scale(1.02)';$id('story').classList.add('show');success();render()};
      $id('never').onclick=()=>{never++;$id('never').style.transform='scale(1.02)';select();render()};
      attachReset(['next','back','shuffle'],resetRound);resetRound();
    }
  }

  function setupMostLikely(){
    const voteBox=document.querySelector('.vote-box');if(!voteBox)return;
    let names=[],picked={};
    const area=document.createElement('div');area.className='esc-player-picks';area.innerHTML='<div class="esc-depth-note">Tap the person who received the most votes.</div><div class="esc-depth-row esc-pick-buttons"></div><div class="esc-depth-note esc-pick-result"></div>';voteBox.appendChild(area);
    const renderChoices=()=>{const row=area.querySelector('.esc-pick-buttons');row.innerHTML='';if(!names.length){area.classList.remove('show');return}names.forEach(name=>{const b=document.createElement('button');b.className='esc-player-chip';b.textContent=name;b.onclick=()=>{picked[name]=(picked[name]||0)+1;row.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');area.querySelector('.esc-pick-result').textContent=name+' has been picked '+picked[name]+' time'+(picked[name]===1?'':'s')+'.';success()};row.appendChild(b)});area.classList.add('show')};
    const clearPick=()=>{area.classList.remove('show');area.querySelector('.esc-pick-result').textContent='';area.querySelector('.esc-pick-buttons').innerHTML=''};
    const roster=createRoster({storageKey:'esc-mlt-players-v1',title:'Most Likely To Players',help:'Optional. Add names to record who gets picked most often. Leave the list empty to point manually.',onSave:n=>{names=n;picked={};clearPick()},onReset:()=>{picked={};clearPick()}});names=roster?roster.getNames():[];
    $id('vote').onclick=async()=>{if(counting)return;counting=true;const token=++voteToken;$id('vote').style.display='none';clearPick();for(const n of [3,2,1]){if(token!==voteToken)return;$id('count').textContent=n;$id('count').classList.add('show');ESCGameKit.audio.count(n);await new Promise(r=>setTimeout(r,650));if(token!==voteToken)return;$id('count').classList.remove('show');await new Promise(r=>setTimeout(r,80))}if(token!==voteToken)return;$id('point').classList.add('show');success();counting=false;if(names.length)renderChoices()};
    attachReset(['next','back','shuffle'],clearPick);
  }

  function setupFiveSecond(){
    const panel=document.querySelector('.game-panel');if(!panel)return;
    let names=[],scores={},turn=0;
    const strip=document.createElement('div');strip.className='esc-turn-strip';strip.innerHTML='<div><strong class="esc-current-player"></strong><span>Current player</span></div><div class="esc-scoreboard"></div>';const card=document.querySelector('.game-card');panel.insertBefore(strip,card);
    const render=()=>{if(!names.length){strip.classList.remove('show');return}strip.classList.add('show');strip.querySelector('.esc-current-player').textContent=names[turn%names.length];strip.querySelector('.esc-scoreboard').innerHTML=names.map(n=>'<span class="esc-score-pill">'+n+': '+(scores[n]||0)+'</span>').join('')};
    const roster=createRoster({storageKey:'esc-five-sec-players-v1',title:'5 Second Challenge Players',help:'Optional. Add names to rotate turns automatically and keep a simple score.',onSave:n=>{names=n;scores={};turn=0;render()},onReset:()=>{scores={};turn=0;render()}});names=roster?roster.getNames():[];names.forEach(n=>scores[n]=0);render();
    const advance=()=>{if(names.length){turn=(turn+1)%names.length;render()}};
    $id('made').onclick=()=>{made++;if(names.length){const n=names[turn%names.length];scores[n]=(scores[n]||0)+1}stats();success();advance();next()};
    $id('missed').onclick=()=>{missed++;stats();try{ESCGameKit.audio.fail()}catch(e){}advance();next()};
  }

  function setupDebate(){
    const startBtn=$id('start');if(!startBtn)return;startBtn.textContent='Prep 10s + Speak 45s';$id('phase').textContent='10s prep · 45s speaking';
    startBtn.onclick=()=>{
      if(running)return;
      if(!['FOR','AGAINST'].includes($id('side').textContent))pick();
      stop();running=true;let prep=10;$id('timer').textContent=prep;$id('phase').textContent='Prepare your argument';startBtn.disabled=true;startBtn.textContent='Preparing…';select();
      t=setInterval(()=>{prep--;$id('timer').textContent=prep;if(prep<=3&&prep>0)ESCGameKit.audio.count(prep);if(prep<=0){clearInterval(t);time=45;$id('timer').textContent=time;$id('phase').textContent='Speak now';startBtn.textContent='Speaking…';success();t=setInterval(()=>{time--;$id('timer').textContent=time;if(time<=5&&time>0)ESCGameKit.audio.count(time);if(time<=0){clearInterval(t);t=null;running=false;$id('phase').textContent='Time!';startBtn.disabled=false;startBtn.textContent='Prep 10s + Speak 45s';ESCGameKit.audio.timeup()}},1000)}},1000);
    };
    const restore=()=>{startBtn.disabled=false;startBtn.textContent='Prep 10s + Speak 45s';$id('phase').textContent='10s prep · 45s speaking'};attachReset(['next'],restore);document.querySelectorAll('.game-chip').forEach(el=>el.addEventListener('click',()=>setTimeout(restore,0)));
  }

  if(path.endsWith('/would-you-rather'))setupWouldYouRather();
  else if(path.endsWith('/red-flag-green-flag'))setupRoundVotes('flags');
  else if(path.endsWith('/never-have-i-ever'))setupRoundVotes('never');
  else if(path.endsWith('/most-likely-to'))setupMostLikely();
  else if(path.endsWith('/five-second-challenge'))setupFiveSecond();
  else if(path.endsWith('/debate-roulette'))setupDebate();
})();
