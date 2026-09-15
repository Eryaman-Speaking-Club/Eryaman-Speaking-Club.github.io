(() => {
  'use strict';

  const STORAGE_KEY = 'esc-global-volume-v1';
  const MAX_BOOST = 5; // 100% equals the former 500% loudness.
  let masterPercent = Math.max(0, Math.min(100, Number(localStorage.getItem(STORAGE_KEY)) || 100));
  const legacyBoost = typeof window.ESC_SOUND_PERCENT !== 'undefined';

  const currentFactor = () => (masterPercent / 100) * MAX_BOOST;
  const applyLegacyBoost = () => {
    if (legacyBoost) window.ESC_SOUND_PERCENT = masterPercent * MAX_BOOST;
  };

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
    // Preserve the existing game logic but make sure old saved mute states do not block audio.
    if (button && /🔇/.test(button.textContent || '')) {
      button.click();
    }
  }

  function mount() {
    const button = document.getElementById('sound');
    if (!button || document.getElementById('escVolumePopover')) return;

    ensureGameSoundEnabled(button);
    applyLegacyBoost();
    patchAudioContext();

    const style = document.createElement('style');
    style.id = 'escVolumeStyles';
    style.textContent = `
      .volume-control{display:none!important}
      #escVolumePopover{position:fixed;z-index:99999;width:min(290px,calc(100vw - 24px));padding:14px 15px 13px;border:1px solid rgba(11,47,91,.14);border-radius:16px;background:rgba(255,255,255,.98);box-shadow:0 18px 50px rgba(11,47,91,.22);backdrop-filter:blur(12px);display:none}
      #escVolumePopover.open{display:block}
      #escVolumePopover .esc-volume-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;color:#0b2f5b;font-weight:900;font-size:12px}
      #escVolumePopover .esc-volume-value{font-variant-numeric:tabular-nums;color:#174b82}
      #escVolumePopover input[type=range]{width:100%;margin:0;accent-color:#0b2f5b;cursor:pointer}
      #escVolumePopover .esc-volume-note{margin-top:7px;color:#718397;font-size:10px;font-weight:700}
      #sound[aria-expanded=true]{box-shadow:0 0 0 3px rgba(23,75,130,.12),0 8px 24px rgba(11,47,91,.10)}
    `;
    document.head.appendChild(style);

    const popover = document.createElement('div');
    popover.id = 'escVolumePopover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Sound level');
    popover.innerHTML = `
      <div class="esc-volume-head"><span>Sound level</span><span class="esc-volume-value" id="escVolumeValue">${Math.round(masterPercent)}%</span></div>
      <input id="escVolumeSlider" type="range" min="0" max="100" step="5" value="${Math.round(masterPercent)}" aria-label="Sound level">
      <div class="esc-volume-note">100% = maximum club volume</div>
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
