(() => {
  'use strict';

  const STORAGE_KEY = 'esc-global-volume-v1';
  const MAX_BOOST = 8;
  const savedMasterPercent = localStorage.getItem(STORAGE_KEY);
  const parsedMasterPercent = Number(savedMasterPercent);
  let masterPercent = savedMasterPercent === null || !Number.isFinite(parsedMasterPercent)
    ? 100
    : Math.max(0, Math.min(100, parsedMasterPercent));
  const legacyBoost = typeof window.ESC_SOUND_PERCENT !== 'undefined';

  let spinAudio = null;
  let spinSoundUrl = '';
  let lastSpinStart = 0;

  const level = () => masterPercent / 100;
  const currentFactor = () => level() * MAX_BOOST;

  function applyLegacyBoost() {
    if (legacyBoost) window.ESC_SOUND_PERCENT = masterPercent * MAX_BOOST;
  }

  function patchAudioContext() {
    if (legacyBoost || window.__ESC_MASTER_AUDIO_PATCHED__) return;
    const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
    if (!NativeAudioContext) return;

    const scaleValue = (value) => Math.max(0.000001, Number(value) * currentFactor());

    function wrapContext(context) {
      const nativeCreateGain = context.createGain.bind(context);
      context.createGain = function createEscGain() {
        const node = nativeCreateGain();
        const param = node.gain;
        ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime'].forEach((method) => {
          if (typeof param[method] !== 'function') return;
          const nativeMethod = param[method].bind(param);
          try {
            param[method] = (value, time) => nativeMethod(scaleValue(value), time);
          } catch (_) {}
        });
        return node;
      };
      return context;
    }

    function EscAudioContext(...args) {
      return wrapContext(new NativeAudioContext(...args));
    }

    try {
      EscAudioContext.prototype = NativeAudioContext.prototype;
      Object.setPrototypeOf(EscAudioContext, NativeAudioContext);
    } catch (_) {}

    if (window.AudioContext) window.AudioContext = EscAudioContext;
    if (window.webkitAudioContext) window.webkitAudioContext = EscAudioContext;
    window.__ESC_MASTER_AUDIO_PATCHED__ = true;
  }

  function ensureGameSoundEnabled(button) {
    if (masterPercent <= 0 || !button) return;
    if (/🔇/.test(button.textContent || '')) button.click();
  }

  function makeSpinSoundUrl() {
    if (spinSoundUrl) return spinSoundUrl;

    const sampleRate = 12000;
    const duration = 0.96;
    const sampleCount = Math.floor(sampleRate * duration);
    const bytesPerSample = 2;
    const dataSize = sampleCount * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeText = (offset, text) => {
      for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
    };

    writeText(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeText(8, 'WAVE');
    writeText(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * bytesPerSample, true);
    view.setUint16(32, bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeText(36, 'data');
    view.setUint32(40, dataSize, true);

    let noiseSeed = 0x12345678;
    const randomNoise = () => {
      noiseSeed = (1664525 * noiseSeed + 1013904223) >>> 0;
      return (noiseSeed / 0xffffffff) * 2 - 1;
    };

    for (let i = 0; i < sampleCount; i += 1) {
      const t = i / sampleRate;
      const clickPeriod = 0.075;
      const phase = t % clickPeriod;
      const envelope = Math.exp(-phase * 58);
      const click =
        envelope *
        (0.62 * Math.sin(2 * Math.PI * 910 * t) +
          0.22 * Math.sin(2 * Math.PI * 1380 * t) +
          0.13 * randomNoise());
      const hum =
        0.075 * Math.sin(2 * Math.PI * 145 * t) +
        0.045 * Math.sin(2 * Math.PI * 290 * t);
      const pulse = 0.06 * Math.sin(2 * Math.PI * 7.5 * t);
      const sample = Math.max(-0.96, Math.min(0.96, click + hum + pulse));
      view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
    }

    spinSoundUrl = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    return spinSoundUrl;
  }

  function stopSpinAudio() {
    if (!spinAudio) return;
    try {
      spinAudio.pause();
      spinAudio.currentTime = 0;
    } catch (_) {}
    spinAudio = null;
  }

  function startSpinAudio() {
    if (masterPercent <= 0) return;

    const now = performance.now();
    if (now - lastSpinStart < 180) return;
    lastSpinStart = now;

    stopSpinAudio();

    const audio = new Audio(makeSpinSoundUrl());
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = Math.max(0, Math.min(1, Math.pow(level(), 0.58)));
    spinAudio = audio;

    const promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  }

  function updateLiveSpinVolume() {
    if (!spinAudio) return;
    spinAudio.volume = Math.max(0, Math.min(1, Math.pow(level(), 0.58)));
    if (masterPercent <= 0) stopSpinAudio();
  }

  function enhanceTruthOrDareWheel() {
    const wheel = document.getElementById('playerWheel');
    if (!wheel || document.getElementById('escWheelPolishStyles')) return;

    const style = document.createElement('style');
    style.id = 'escWheelPolishStyles';
    style.textContent = `
      #playerWheel{
        border:7px solid #fff!important;
        border-radius:50%!important;
        background:#fff!important;
        box-shadow:0 18px 42px rgba(11,47,91,.18)!important;
        overflow:visible!important;
      }
      #playerWheel .wheel-rotor{
        inset:0!important;
        border-radius:50%!important;
        overflow:hidden!important;
      }
      #playerWheel .wheel-rotor .wheel-ring{display:none!important}
      #playerWheel .wheel-name-layer{
        position:absolute!important;
        inset:0!important;
        border-radius:50%!important;
        pointer-events:none!important;
      }
      #playerWheel .wheel-name{
        transform:translate(-50%,-50%) rotate(var(--esc-label-angle,0deg))!important;
        transform-origin:center!important;
        color:#fff!important;
        font-weight:950!important;
        line-height:1!important;
        letter-spacing:-.02em!important;
        text-align:center!important;
        text-shadow:0 2px 7px rgba(0,0,0,.34)!important;
        white-space:nowrap!important;
        overflow:visible!important;
        text-overflow:clip!important;
        padding:3px 6px!important;
        pointer-events:none!important;
      }
      #playerWheel .wheel-center{
        z-index:8!important;
        width:27%!important;
        height:27%!important;
        padding:0!important;
        border:4px solid #fff!important;
        border-radius:50%!important;
        overflow:hidden!important;
        box-shadow:0 8px 24px rgba(11,47,91,.16)!important;
        background-color:#fff!important;
        background-image:url('../51a64254-0651-4c02-8235-bef5325d7947%20(1).png')!important;
        background-repeat:no-repeat!important;
        background-size:272% 272%!important;
        background-position:35.3% 31.3%!important;
        background-clip:padding-box!important;
      }
      #playerWheel #wheelLabel{display:none!important}
      #playerWheel .wheel-center strong.logo-mode{
        display:block!important;
        width:100%!important;
        height:100%!important;
        margin:0!important;
        opacity:0!important;
        pointer-events:none!important;
      }
      #playerWheel .wheel-logo-symbol{display:none!important}
      #playerWheel .wheel-center strong:not(.logo-mode){
        display:flex!important;
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
        margin:0!important;
        align-items:center!important;
        justify-content:center!important;
        padding:10px!important;
        text-align:center!important;
        color:#0b2f5b!important;
        background:#fff!important;
        border-radius:50%!important;
        font-size:clamp(16px,3.2vw,30px)!important;
        line-height:1.05!important;
      }
      @media(max-width:560px){
        #playerWheel{border-width:5px!important}
        #playerWheel .wheel-center{
          width:28%!important;
          height:28%!important;
          border-width:3px!important;
        }
      }
    `;
    document.head.appendChild(style);

    const refresh = () => {
      const rotor = wheel.querySelector('.wheel-rotor');
      if (!rotor) return;

      const labels = Array.from(rotor.querySelectorAll('.wheel-name'));
      const count = labels.length;
      if (!count) return;

      const segment = 360 / count;
      const radius = count > 12 ? 36 : count > 8 ? 35 : 34.5;

      labels.forEach((label, index) => {
        const angle = -90 + (index + 0.5) * segment;
        const radians = angle * Math.PI / 180;
        const x = 50 + Math.cos(radians) * radius;
        const y = 50 + Math.sin(radians) * radius;

        let readableAngle = ((angle + 180) % 360) - 180;
        if (readableAngle > 90) readableAngle -= 180;
        if (readableAngle < -90) readableAngle += 180;

        label.style.left = `${x}%`;
        label.style.top = `${y}%`;
        label.style.setProperty('--esc-label-angle', `${readableAngle}deg`);
        label.style.maxWidth = count > 12 ? '17%' : count > 8 ? '21%' : '27%';
        label.style.fontSize =
          count > 12 ? '10px' :
          count > 8 ? '12px' :
          count > 6 ? '14px' :
          'clamp(16px,2.2vw,23px)';
      });
    };

    refresh();

    const observer = new MutationObserver(() => requestAnimationFrame(refresh));
    observer.observe(wheel, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    window.addEventListener('resize', refresh);

    const spinButton = document.getElementById('spinPlayer');
    const triggerSound = () => {
      if (!spinButton || spinButton.disabled || masterPercent <= 0) return;
      startSpinAudio();
    };

    wheel.addEventListener('pointerdown', triggerSound, true);
    wheel.addEventListener('click', triggerSound, true);
    if (spinButton) {
      spinButton.addEventListener('pointerdown', triggerSound, true);
      spinButton.addEventListener('click', triggerSound, true);
    }

    const spinningObserver = new MutationObserver(() => {
      if (!wheel.classList.contains('is-spinning')) stopSpinAudio();
    });
    spinningObserver.observe(wheel, { attributes: true, attributeFilter: ['class'] });
  }

  function mount() {
    const button = document.getElementById('sound');
    if (!button || document.getElementById('escVolumePopover')) return;

    applyLegacyBoost();
    patchAudioContext();
    ensureGameSoundEnabled(button);
    enhanceTruthOrDareWheel();

    const style = document.createElement('style');
    style.id = 'escVolumeStyles';
    style.textContent = `
      .volume-control{display:none!important}
      #escVolumePopover{
        position:fixed;
        z-index:99999;
        width:min(290px,calc(100vw - 24px));
        padding:14px 15px 13px;
        border:1px solid rgba(11,47,91,.14);
        border-radius:16px;
        background:rgba(255,255,255,.98);
        box-shadow:0 18px 50px rgba(11,47,91,.22);
        backdrop-filter:blur(12px);
        display:none;
      }
      #escVolumePopover.open{display:block}
      #escVolumePopover .esc-volume-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-bottom:10px;
        color:#0b2f5b;
        font-weight:900;
        font-size:12px;
      }
      #escVolumePopover .esc-volume-value{
        font-variant-numeric:tabular-nums;
        color:#174b82;
      }
      #escVolumePopover input[type=range]{
        width:100%;
        margin:0;
        accent-color:#0b2f5b;
        cursor:pointer;
      }
      #escVolumePopover .esc-volume-note{
        margin-top:7px;
        color:#718397;
        font-size:10px;
        font-weight:700;
      }
      #sound[aria-expanded=true]{
        box-shadow:0 0 0 3px rgba(23,75,130,.12),0 8px 24px rgba(11,47,91,.10);
      }
    `;
    document.head.appendChild(style);

    const popover = document.createElement('div');
    popover.id = 'escVolumePopover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Sound level');
    popover.innerHTML = `
      <div class="esc-volume-head">
        <span>Sound level</span>
        <span class="esc-volume-value" id="escVolumeValue">${Math.round(masterPercent)}%</span>
      </div>
      <input id="escVolumeSlider" type="range" min="0" max="100" step="5"
        value="${Math.round(masterPercent)}" aria-label="Sound level">
      <div class="esc-volume-note">100% = loud</div>
    `;
    document.body.appendChild(popover);

    const slider = document.getElementById('escVolumeSlider');
    const valueLabel = document.getElementById('escVolumeValue');

    const renderIcon = () => {
      const icon = masterPercent <= 0 ? '🔇' : masterPercent < 45 ? '🔉' : '🔊';
      if (button.textContent !== icon) button.textContent = icon;
      button.title = `Sound ${Math.round(masterPercent)}%`;
      button.setAttribute('aria-label', `Sound level ${Math.round(masterPercent)} percent`);
    };

    const positionPopover = () => {
      const rect = button.getBoundingClientRect();
      const width = Math.min(290, window.innerWidth - 24);
      const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.right - width));
      popover.style.left = `${left}px`;
      popover.style.top = `${Math.min(window.innerHeight - 120, rect.bottom + 10)}px`;
    };

    const setVolume = (value) => {
      masterPercent = Math.max(0, Math.min(100, Number(value) || 0));
      localStorage.setItem(STORAGE_KEY, String(masterPercent));
      slider.value = String(masterPercent);
      valueLabel.textContent = `${Math.round(masterPercent)}%`;
      applyLegacyBoost();
      if (masterPercent > 0) ensureGameSoundEnabled(button);
      updateLiveSpinVolume();
      renderIcon();
    };

    setVolume(masterPercent);

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const open = !popover.classList.contains('open');
      if (open) {
        positionPopover();
        popover.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        setTimeout(() => slider.focus(), 0);
      } else {
        popover.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
      }
    }, true);

    slider.addEventListener('input', (event) => setVolume(event.currentTarget.value));

    document.addEventListener('click', (event) => {
      if (!popover.classList.contains('open')) return;
      if (popover.contains(event.target) || event.target === button) return;
      popover.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    });

    window.addEventListener('resize', () => {
      if (popover.classList.contains('open')) positionPopover();
    });

    const observer = new MutationObserver(renderIcon);
    observer.observe(button, { childList: true, characterData: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
