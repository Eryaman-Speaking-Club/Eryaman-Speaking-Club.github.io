(() => {
  'use strict';
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  let ctx;
  let timers = [];

  const enabled = () => {
    try {
      const state = JSON.parse(localStorage.getItem('esc-truth-dare-v1') || '{}');
      return (!state.settings || state.settings.sound !== false) && Number(localStorage.getItem('esc-truth-dare-volume-percent-v1') || 200) > 0;
    } catch (_) { return true; }
  };

  function audio() {
    if (!AudioCtor || !enabled()) return null;
    ctx ||= new AudioCtor();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function flick(step) {
    const a = audio();
    if (!a) return;
    const now = a.currentTime;
    const osc = a.createOscillator();
    const gain = a.createGain();
    const filter = a.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(310 - step * 15, now);
    osc.frequency.exponentialRampToValueAtTime(155 - step * 5, now + 0.055);
    filter.type = 'lowpass';
    filter.frequency.value = 950;
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(filter).connect(gain).connect(a.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  function start() {
    timers.forEach(clearTimeout);
    timers = [];
    audio();
    [0,105,215,330,450,575,705].forEach((delay, i) => timers.push(setTimeout(() => flick(i), delay)));
  }

  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function mount() {
    const wheel = document.getElementById('questionWheel');
    if (!wheel) return;
    let wasSpinning = wheel.classList.contains('spinning-question');
    new MutationObserver(() => {
      const spinning = wheel.classList.contains('spinning-question');
      if (spinning && !wasSpinning) start();
      if (!spinning && wasSpinning) stop();
      wasSpinning = spinning;
    }).observe(wheel, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('pointerdown', (event) => {
      if (event.target.closest && event.target.closest('#chooseTruth,#chooseDare,#spinAgain')) audio();
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
