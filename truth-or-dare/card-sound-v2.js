(() => {
  'use strict';
  const STATE='esc-truth-dare-v1';
  const MASTER='esc-global-volume-v1';
  let ctx=null;
  let timers=[];

  function enabled(){
    let game=true;
    try{
      const s=JSON.parse(localStorage.getItem(STATE)||'{}');
      game=!s.settings||s.settings.sound!==false;
    }catch(_){}
    const raw=Number(localStorage.getItem(MASTER));
    const volume=Number.isFinite(raw)?raw:100;
    return game&&volume>0;
  }

  function audio(){
    if(!enabled()) return null;
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C) return null;
    ctx||=new C();
    if(ctx.state==='suspended') ctx.resume().catch(()=>{});
    return ctx;
  }

  function tick(step=0,strong=false){
    const a=audio();
    if(!a) return;
    const now=a.currentTime;
    const osc=a.createOscillator();
    const gain=a.createGain();
    osc.type='triangle';
    osc.frequency.setValueAtTime(Math.max(319,618-step*31),now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(176,306-step*12),now+0.055);
    gain.gain.setValueAtTime(strong?0.045:0.03,now);
    gain.gain.exponentialRampToValueAtTime(0.0001,now+0.06);
    osc.connect(gain).connect(a.destination);
    osc.start(now);
    osc.stop(now+0.065);
  }

  function stop(){
    timers.forEach(clearTimeout);
    timers=[];
  }

  function sequence(){
    stop();
    if(!audio()) return;
    [0,105,215,330,450,575,705,825].forEach((delay,i)=>{
      timers.push(setTimeout(()=>tick(i,i===0),delay));
    });
  }

  function mount(){
    const wheel=document.getElementById('questionWheel');
    if(!wheel) return;
    let spinning=wheel.classList.contains('spinning-question');
    new MutationObserver(()=>{
      const now=wheel.classList.contains('spinning-question');
      if(now&&!spinning) sequence();
      if(!now&&spinning) stop();
      spinning=now;
    }).observe(wheel,{attributes:true,attributeFilter:['class']});

    document.addEventListener('pointerdown',e=>{
      if(e.target instanceof Element&&e.target.closest('#chooseTruth,#chooseDare,#spinAgain')){
        const a=audio();
        if(a) tick(0,true);
      }
    },true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
