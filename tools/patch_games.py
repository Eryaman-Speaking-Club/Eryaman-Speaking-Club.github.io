from pathlib import Path
import re

# --- shared sound controller ---
sound_js = r'''(() => {
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
'''
Path('sound-control.js').write_text(sound_js, encoding='utf-8')

# --- inject shared sound controller into both games ---
for rel in ['truth-or-dare/index.html', 'one-for-me-one-for-you/index.html']:
    path = Path(rel)
    html = path.read_text(encoding='utf-8')
    tag = '<script src="../sound-control.js"></script>'
    if tag not in html:
        html = html.replace('</body>', f'  {tag}\n</body>', 1)
    path.write_text(html, encoding='utf-8')

# --- Truth or Dare wheel: horizontal names, rotating wedges, static smaller center ---
path = Path('truth-or-dare/app.js')
text = path.read_text(encoding='utf-8')

if 'let labelAnimations = [];' not in text:
    text = text.replace('  let wheelAnimation = null;\n', '  let wheelAnimation = null;\n  let labelAnimations = [];\n', 1)

install = r'''  function installWheelEnhancements() {
    if ($('wheelEnhancementStyles')) return;
    const style = document.createElement('style');
    style.id = 'wheelEnhancementStyles';
    style.textContent = `
      .player-wheel{overflow:visible;background:#fff!important}
      .wheel-rotor{position:absolute;inset:0;border-radius:50%;overflow:hidden;z-index:1;will-change:transform}
      .wheel-name-layer{position:absolute;inset:0;z-index:2;pointer-events:none;border-radius:50%}
      .wheel-name{position:absolute;transform:translate(-50%,-50%) rotate(var(--counter-rotation,0deg));transform-origin:center;color:#fff;font-weight:950;line-height:1.05;letter-spacing:-.02em;text-align:center;text-shadow:0 2px 6px rgba(0,0,0,.38);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:4px 6px;pointer-events:none;z-index:3}
      .wheel-rotor .wheel-ring{z-index:1}
      .wheel-center{z-index:5!important;width:39.2%!important;height:39.2%!important;padding:10px!important;position:relative;overflow:hidden}
      .wheel-center strong.logo-mode{width:86px;height:86px;margin-top:5px;display:block;overflow:hidden;border-radius:50%;position:relative}
      .wheel-logo-symbol{position:absolute;display:block;width:185px;height:185px;max-width:none;left:50%;top:50%;transform:translate(-50%,-50%);object-fit:contain}
      .wheel-center strong:not(.logo-mode){font-size:clamp(18px,4vw,32px)!important}
      .player-wheel.is-spinning{will-change:auto}
      @media(max-width:560px){.wheel-name{font-size:9px!important}.wheel-center{width:40%!important;height:40%!important;padding:8px!important}.wheel-center strong.logo-mode{width:64px;height:64px}.wheel-logo-symbol{width:138px;height:138px}}
    `;
    document.head.appendChild(style);
  }
'''
text, n = re.subn(r"  function installWheelEnhancements\(\) \{.*?\n  \}\n", install, text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not replace installWheelEnhancements')

render = r'''  function ensureWheelRotor() {
    const wheel = $('playerWheel');
    let rotor = wheel.querySelector('.wheel-rotor');
    if (rotor) return rotor;

    rotor = document.createElement('div');
    rotor.className = 'wheel-rotor';
    const center = wheel.querySelector('.wheel-center');
    Array.from(wheel.children)
      .filter((child) => child.classList && child.classList.contains('wheel-ring'))
      .forEach((ring) => rotor.appendChild(ring));
    wheel.insertBefore(rotor, center || null);
    return rotor;
  }

  function renderWheel() {
    const wheel = $('playerWheel');
    if (!wheel) return;
    const rotor = ensureWheelRotor();

    let layer = rotor.querySelector('.wheel-name-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'wheel-name-layer';
      rotor.appendChild(layer);
    }
    layer.replaceChildren();

    const names = state.names.slice();
    if (!names.length) return;

    const segment = 360 / names.length;
    const gap = Math.min(2.4, Math.max(1.0, segment * 0.055));
    const gradient = [];
    names.forEach((name, index) => {
      const start = index * segment;
      const colorStart = start + gap / 2;
      const colorEnd = (index + 1) * segment - gap / 2;
      const end = (index + 1) * segment;
      const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
      gradient.push(`#fff ${start.toFixed(3)}deg ${colorStart.toFixed(3)}deg`);
      gradient.push(`${color} ${colorStart.toFixed(3)}deg ${colorEnd.toFixed(3)}deg`);
      gradient.push(`#fff ${colorEnd.toFixed(3)}deg ${end.toFixed(3)}deg`);

      const angle = -90 + (index + 0.5) * segment;
      const radians = angle * Math.PI / 180;
      const radius = names.length > 12 ? 38 : names.length > 8 ? 37.5 : 37;
      const x = 50 + Math.cos(radians) * radius;
      const y = 50 + Math.sin(radians) * radius;
      const label = document.createElement('span');
      label.className = 'wheel-name';
      label.textContent = name;
      label.title = name;
      label.style.left = `${x}%`;
      label.style.top = `${y}%`;
      label.style.maxWidth = names.length > 12 ? '14%' : names.length > 8 ? '18%' : '27%';
      label.style.fontSize = names.length > 12 ? '9px' : names.length > 8 ? '11px' : '13px';
      label.style.setProperty('--counter-rotation', `${-wheelRotation}deg`);
      layer.appendChild(label);
    });

    rotor.style.background = `conic-gradient(${gradient.join(',')})`;
    rotor.style.transform = `rotate(${wheelRotation}deg)`;
  }
'''
text, n = re.subn(r"  function renderWheel\(\) \{.*?\n  \}\n", render, text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not replace renderWheel')

spin = r'''  function spinPlayer() {
    const button = $('spinPlayer');
    if (state.names.length < 2 || button.disabled) return;

    const wheel = $('playerWheel');
    const rotor = ensureWheelRotor();
    const label = $('wheelLabel');
    selectedPlayer = choosePlayer();
    const selectedIndex = Math.max(0, state.names.indexOf(selectedPlayer));
    const segment = 360 / state.names.length;
    const selectedCenter = (selectedIndex + 0.5) * segment;
    const desiredModulo = (360 - selectedCenter) % 360;
    const currentModulo = ((wheelRotation % 360) + 360) % 360;
    const alignmentDelta = (desiredModulo - currentModulo + 360) % 360;
    const targetRotation = wheelRotation + 1440 + alignmentDelta;
    const spinDuration = 2350;
    const easing = 'cubic-bezier(.12,.72,.13,1)';

    getAudio();
    playClick();
    button.disabled = true;
    wheel.classList.remove('winner');
    wheel.classList.add('is-spinning');
    label.textContent = 'SPINNING';
    centerLogo();

    if (wheelAnimation) wheelAnimation.cancel();
    labelAnimations.forEach((animation) => animation.cancel());
    labelAnimations = [];

    wheelAnimation = rotor.animate(
      [
        { transform: `rotate(${wheelRotation}deg)` },
        { transform: `rotate(${targetRotation}deg)` }
      ],
      { duration: spinDuration, easing, fill: 'forwards' }
    );

    rotor.querySelectorAll('.wheel-name').forEach((nameLabel) => {
      const animation = nameLabel.animate(
        [
          { transform: `translate(-50%,-50%) rotate(${-wheelRotation}deg)` },
          { transform: `translate(-50%,-50%) rotate(${-targetRotation}deg)` }
        ],
        { duration: spinDuration, easing, fill: 'forwards' }
      );
      labelAnimations.push(animation);
    });

    let ticks = 0;
    clearInterval(spinTimer);
    spinTimer = setInterval(() => playTick(ticks++), 82);

    wheelAnimation.onfinish = () => {
      clearInterval(spinTimer);
      wheelRotation = targetRotation;
      rotor.style.transform = `rotate(${wheelRotation}deg)`;
      rotor.querySelectorAll('.wheel-name').forEach((nameLabel) => {
        nameLabel.style.setProperty('--counter-rotation', `${-wheelRotation}deg`);
      });
      labelAnimations.forEach((animation) => animation.cancel());
      labelAnimations = [];
      wheelAnimation.cancel();
      wheelAnimation = null;
      wheel.classList.remove('is-spinning');
      wheel.classList.add('winner');
      centerSelectedName(selectedPlayer);
      label.textContent = 'SELECTED';

      if (state.settings.fairRotation && !state.history.names.includes(selectedPlayer)) state.history.names.push(selectedPlayer);
      saveState();
      vibrate([45, 45, 90]);
      playReveal('truth');
      button.disabled = false;

      setTimeout(() => {
        $('selectedPlayer').textContent = `${selectedPlayer}!`;
        showScreen('choice');
      }, 850);
    };
  }
'''
text, n = re.subn(r"  function spinPlayer\(\) \{.*?\n  \}\n", spin, text, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Could not replace spinPlayer')

path.write_text(text, encoding='utf-8')
