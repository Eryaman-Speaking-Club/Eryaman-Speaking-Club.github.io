(() => {
  'use strict';

  const VOLUME_KEY = 'esc-global-volume-v1';
  const CENTER_SYMBOL = '../esc-center-symbol.webp';
  let ctx = null;
  let clickBuffer = null;
  let raf = 0;
  let tracking = false;
  let lastAngle = 0;
  let unwrapped = 0;
  let lastBoundary = 0;
  let activeIndex = -1;

  const volume = () => {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    return Math.max(0, Math.min(1, (Number.isFinite(saved) ? saved : 100) / 100));
  };

  function getContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    ctx ||= new AudioCtor();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function bufferFor(context) {
    if (clickBuffer) return clickBuffer;
    const length = Math.floor(context.sampleRate * 0.022);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const fade = Math.pow(1 - i / length, 3.6);
      data[i] = (Math.random() * 2 - 1) * fade;
    }
    clickBuffer = buffer;
    return buffer;
  }

  function pointerKick() {
    const pointer = document.querySelector('.wheel-pointer');
    if (!pointer) return;
    pointer.classList.remove('esc-segment-tick');
    void pointer.offsetWidth;
    pointer.classList.add('esc-segment-tick');
    setTimeout(() => pointer.classList.remove('esc-segment-tick'), 85);
  }

  function clickSound(strong = false) {
    const v = volume();
    if (v <= 0) return;
    const audio = getContext();
    if (!audio) return;
    const now = audio.currentTime;
    const src = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    src.buffer = bufferFor(audio);
    filter.type = 'bandpass';
    filter.frequency.value = strong ? 1850 : 1550;
    filter.Q.value = strong ? 0.85 : 1.15;
    gain.gain.value = (strong ? 0.60 : 0.42) * Math.pow(v, 0.72);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (strong ? 0.040 : 0.027));
    src.connect(filter).connect(gain).connect(audio.destination);
    src.start(now);
    src.stop(now + 0.045);
    if (strong) {
      const osc = audio.createOscillator();
      const low = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = 235;
      low.gain.value = 0.13 * Math.pow(v, 0.72);
      low.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      osc.connect(low).connect(audio.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    }
    pointerKick();
  }

  function rotationOf(el) {
    const t = getComputedStyle(el).transform;
    if (!t || t === 'none') return 0;
    try {
      const m = new DOMMatrixReadOnly(t);
      return (Math.atan2(m.b, m.a) * 180 / Math.PI + 360) % 360;
    } catch (_) {
      return 0;
    }
  }

  const point = (r, deg) => {
    const a = deg * Math.PI / 180;
    return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r];
  };

  function sectorPath(segment) {
    const pad = Math.min(1.25, segment * 0.04);
    const start = -90 - segment / 2 + pad;
    const end = -90 + segment / 2 - pad;
    const outer = 48.15;
    const inner = 14.1;
    const [a,b] = point(outer,start), [c,d] = point(outer,end);
    const [e,f] = point(inner,end), [g,h] = point(inner,start);
    return `M ${a} ${b} A ${outer} ${outer} 0 0 1 ${c} ${d} L ${e} ${f} A ${inner} ${inner} 0 0 0 ${g} ${h} Z`;
  }

  function frameFor(wheel, count) {
    let svg = wheel.querySelector('.esc-live-selection');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 100 100');
      svg.classList.add('esc-live-selection');
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.classList.add('esc-live-selection-path');
      svg.appendChild(path);
      wheel.appendChild(svg);
    }
    svg.querySelector('path').setAttribute('d', sectorPath(360 / count));
  }

  function activeName(wheel, index) {
    if (index === activeIndex) return;
    activeIndex = index;
    wheel.querySelectorAll('.wheel-name').forEach((name, i) => name.classList.toggle('esc-under-pointer', i === index));
  }

  function stop(wheel, final = true) {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    const wasTracking = tracking;
    tracking = false;
    if (wasTracking && final) clickSound(true);
    const rotor = wheel && wheel.querySelector('.wheel-rotor');
    const count = rotor ? rotor.querySelectorAll('.wheel-name').length : 0;
    if (rotor && count) {
      const segment = 360 / count;
      const pos = ((360 - rotationOf(rotor)) % 360 + 360) % 360;
      activeName(wheel, Math.floor(pos / segment) % count);
    }
  }

  function start(wheel) {
    const rotor = wheel.querySelector('.wheel-rotor');
    const count = rotor ? rotor.querySelectorAll('.wheel-name').length : 0;
    if (!rotor || !count) return;
    stop(wheel, false);
    frameFor(wheel, count);
    tracking = true;
    const segment = 360 / count;
    lastAngle = rotationOf(rotor);
    unwrapped = lastAngle;
    lastBoundary = Math.floor(unwrapped / segment);

    const step = () => {
      if (!tracking) return;
      const current = rotationOf(rotor);
      let delta = current - lastAngle;
      if (delta < -180) delta += 360;
      if (delta > 180) delta -= 360;
      unwrapped += delta;
      lastAngle = current;
      const boundary = Math.floor(unwrapped / segment);
      const crossed = boundary - lastBoundary;
      if (crossed !== 0) {
        const n = Math.min(4, Math.abs(crossed));
        for (let i = 0; i < n; i += 1) setTimeout(() => clickSound(false), i * 8);
        lastBoundary = boundary;
      }
      const pos = ((360 - current) % 360 + 360) % 360;
      activeName(wheel, Math.floor(pos / segment) % count);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function mount() {
    const wheel = document.getElementById('playerWheel');
    if (!wheel || document.getElementById('esc-wheel-feedback-style')) return;

    const style = document.createElement('style');
    style.id = 'esc-wheel-feedback-style';
    style.textContent = `
      body #app #playerWheel .wheel-center{
        width:27%!important;height:27%!important;padding:0!important;border:4px solid #fff!important;
        border-radius:50%!important;overflow:hidden!important;background:#fff url('${CENTER_SYMBOL}') center/100% 100% no-repeat!important;
        box-shadow:0 8px 24px rgba(11,47,91,.16)!important;z-index:10!important;
      }
      body #app #playerWheel #wheelLabel{display:none!important}
      body #app #playerWheel .wheel-center strong{display:none!important}
      body #app #playerWheel .wheel-name{transition:filter .07s ease,text-shadow .07s ease!important}
      body #app #playerWheel .wheel-name.esc-under-pointer{
        filter:brightness(1.24)!important;text-shadow:0 0 5px #fff,0 3px 10px rgba(0,0,0,.48)!important;
      }
      body #app #playerWheel .esc-live-selection{
        position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:8!important;
        overflow:visible!important;pointer-events:none!important;filter:drop-shadow(0 5px 8px rgba(242,163,41,.34));
      }
      body #app #playerWheel .esc-live-selection-path{
        fill:rgba(255,255,255,.07);stroke:#f2a329;stroke-width:1.75;stroke-linejoin:round;vector-effect:non-scaling-stroke;
      }
      body .wheel-pointer{transform-origin:50% 10%!important}
      body .wheel-pointer.esc-segment-tick{animation:escSegmentTick .085s ease-out!important}
      @keyframes escSegmentTick{0%{transform:translateX(-50%) rotate(0)}45%{transform:translateX(-50%) rotate(5deg)}100%{transform:translateX(-50%) rotate(0)}}
      @media(max-width:560px){body #app #playerWheel .wheel-center{width:28%!important;height:28%!important;border-width:3px!important}}
    `;
    document.head.appendChild(style);

    const prime = () => { const audio = getContext(); if (audio && audio.state === 'suspended') audio.resume().catch(() => {}); };
    const isSpinTarget = (target) => target instanceof Element && (target.closest('#playerWheel') || target.closest('#spinPlayer'));

    window.addEventListener('pointerdown', (event) => {
      if (!isSpinTarget(event.target)) return;
      prime();
      event.stopPropagation();
    }, true);

    window.addEventListener('click', (event) => {
      if (!isSpinTarget(event.target)) return;
      const spinButton = document.getElementById('spinPlayer');
      event.preventDefault();
      event.stopPropagation();
      if (!spinButton || spinButton.disabled) return;
      if (typeof spinButton.onclick === 'function') spinButton.onclick.call(spinButton, event);
    }, true);

    const refresh = () => {
      const rotor = wheel.querySelector('.wheel-rotor');
      const count = rotor ? rotor.querySelectorAll('.wheel-name').length : 0;
      if (!count) return;
      frameFor(wheel, count);
      if (!tracking) {
        const segment = 360 / count;
        const pos = ((360 - rotationOf(rotor)) % 360 + 360) % 360;
        activeName(wheel, Math.floor(pos / segment) % count);
      }
    };
    refresh();
    new MutationObserver(() => requestAnimationFrame(refresh)).observe(wheel,{childList:true,subtree:true});

    let spinning = wheel.classList.contains('is-spinning');
    new MutationObserver(() => {
      const now = wheel.classList.contains('is-spinning');
      if (now && !spinning) start(wheel);
      if (!now && spinning) stop(wheel,true);
      spinning = now;
    }).observe(wheel,{attributes:true,attributeFilter:['class']});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();