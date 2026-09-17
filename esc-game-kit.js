(function(){
  const KEY='esc-global-volume-v1';
  const getVolume=()=>{const raw=Number(localStorage.getItem(KEY)??100);return Number.isFinite(raw)?Math.max(0,Math.min(100,raw)):100};
  let ctx=null;
  function context(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=ctx||new C();if(ctx.state==='suspended')ctx.resume();return ctx}
  function tone(freq=440,duration=.08,type='sine',gain=.08,delay=0){const c=context(),v=getVolume()/100;if(!c||v<=0)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(Math.max(.0001,gain*v),t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(c.destination);o.start(t);o.stop(t+duration+.015)}
  const audio={
    soft(){tone(420,.07,'sine',.07);tone(620,.08,'sine',.04,.035)},
    select(){tone(360,.08,'triangle',.075);tone(520,.09,'sine',.045,.03)},
    count(n){tone(n<=1?700:520,.07,'sine',n<=1?.11:.075)},
    success(){tone(440,.09,'sine',.075);tone(660,.1,'sine',.07,.06);tone(880,.12,'sine',.06,.12)},
    fail(){tone(260,.12,'triangle',.075);tone(190,.15,'sine',.055,.07)},
    timeup(){tone(260,.16,'triangle',.09);tone(220,.18,'triangle',.07,.12)}
  };
  function mountSound(){
    const btn=document.querySelector('[data-esc-sound]');if(!btn)return;
    const pop=document.createElement('div');pop.className='game-volume-pop';
    pop.innerHTML='<b>Sound level <span data-vol-label></span></b><input data-vol-range type="range" min="0" max="100" step="5">';document.body.appendChild(pop);
    const slider=pop.querySelector('[data-vol-range]'),label=pop.querySelector('[data-vol-label]');
    function sync(){const v=getVolume();slider.value=v;label.textContent=v+'%';btn.textContent=v===0?'🔇':v<45?'🔉':'🔊'}
    sync();btn.addEventListener('click',e=>{e.stopPropagation();pop.classList.toggle('open')});
    pop.addEventListener('click',e=>e.stopPropagation());document.addEventListener('click',()=>pop.classList.remove('open'));
    slider.addEventListener('input',()=>{localStorage.setItem(KEY,slider.value);sync();audio.soft()});
  }
  function toast(msg){let el=document.querySelector('.game-toast');if(!el){el=document.createElement('div');el.className='game-toast';document.body.appendChild(el)}el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),900)}
  window.ESCGameKit={audio,getVolume,toast,mountSound};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountSound);else mountSound();
})();
