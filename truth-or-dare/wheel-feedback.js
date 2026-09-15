(() => {
  'use strict';

  const VOLUME_KEY = 'esc-global-volume-v1';
  const CENTER_SYMBOL = '../esc-center-symbol.webp';
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let clickBuffer = null;
  let audioBus = null;
  let raf = 0;
  let tracking = false;
  let lastAngle = 0;
  let unwrapped = 0;
  let lastBoundary = 0;
  let activeIndex = -1;
  let pointerTimer = 0;

  const volume = () => {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    return Math.max(0, Math.min(1, (Number.isFinite(saved) ? saved : 100) / 100));
  };

  function getContext() {
    if (!NativeAudioContext) return null;
    ctx ||= new NativeAudioContext();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (!audioBus) {
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 8;
      compressor.ratio.value = 7;
      compressor.attack.value = 0.001;
      compressor.release.value = 0.055;
      compressor.connect(ctx.destination);
      audioBus = compressor;
    }
    return ctx;
  }

  function bufferFor(context) {
    if (clickBuffer) return clickBuffer;
    const length = Math.floor(context.sampleRate * 0.024);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 0x51a64254;
    for (let i = 0; i < length; i += 1) {
      const t = i / context.sampleRate;
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      const noise = (((seed >>> 0) / 4294967295) * 2 - 1);
      const envelope = Math.pow(1 - i / length, 4.2);
      const metal =
        0.56 * Math.sin(2 * Math.PI * 2050 * t) +
        0.27 * Math.sin(2 * Math.PI * 3180 * t) +
        0.11 * Math.sin(2 * Math.PI * 4480 * t);
      data[i] = Math.max(-1, Math.min(1, (0.58 * noise + 0.42 * metal) * envelope));
    }
    clickBuffer = buffer;
    return buffer;
  }

  function pointerKick() {
    const pointer = document.querySelector('.wheel-pointer');
    if (!pointer) return;
    clearTimeout(pointerTimer);
    pointer.classList.remove('esc-segment-tick');
    void pointer.offsetWidth;
    pointer.classList.add('esc-segment-tick');
    pointerTimer = setTimeout(() => pointer.classList.remove('esc-segment-tick'), 72);
  }

  function clickSound(strong = false) {
    const v = volume();
    if (v <= 0) return;
    const audio = getContext();
    if (!audio || !audioBus) return;

    const now = audio.currentTime;
    const loudness = Math.pow(v, 0.56);
    const base = strong ? 330 : 370;

    const filter = audio.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1350, now);
    filter.Q.value = 0.35;
    filter.connect(audioBus);

    const tone = audio.createOscillator();
    const toneGain = audio.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(base * 1.06, now);
    tone.frequency.exponentialRampToValueAtTime(base, now + 0.045);
    toneGain.gain.setValueAtTime((strong ? 0.34 : 0.24) * loudness, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + (strong ? 0.16 : 0.115));
    tone.connect(toneGain).connect(filter);
    tone.start(now);
    tone.stop(now + 0.17);

    const softBody = audio.createOscillator();
    const softBodyGain = audio.createGain();
    softBody.type = 'triangle';
    softBody.frequency.setValueAtTime(base / 2, now);
    softBodyGain.gain.setValueAtTime((strong ? 0.14 : 0.09) * loudness, now);
    softBodyGain.gain.exponentialRampToValueAtTime(0.0001, now + (strong ? 0.14 : 0.10));
    softBody.connect(softBodyGain).connect(filter);
    softBody.start(now);
    softBody.stop(now + 0.15);

    const bell = audio.createOscillator();
    const bellGain = audio.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(base * 2.5, now);
    bellGain.gain.setValueAtTime((strong ? 0.05 : 0.03) * loudness, now);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + (strong ? 0.095 : 0.07));
    bell.connect(bellGain).connect(filter);
    bell.start(now);
    bell.stop(now + 0.10);

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
        const n = Math.min(6, Math.abs(crossed));
        for (let i = 0; i < n; i += 1) {
          setTimeout(() => clickSound(false), i * 5);
        }
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
      body .wheel-pointer.esc-segment-tick{animation:escSegmentTick .072s ease-out!important}
      @keyframes escSegmentTick{0%{transform:translateX(-50%) rotate(0)}42%{transform:translateX(-50%) rotate(5deg)}100%{transform:translateX(-50%) rotate(0)}}
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