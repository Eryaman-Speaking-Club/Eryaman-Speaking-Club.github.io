/* Shared display control for every public game. No game state is reset. */
(() => {
  'use strict';
  if (window.ESCFullscreen) return;
  let button = null, busy = false, fallback = false;
  const current = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  function notice(message) {
    let el = document.getElementById('escDisplayStatus');
    if (!el) {
      el = document.createElement('div'); el.id = 'escDisplayStatus';
      el.className = 'esc-display-status'; el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message; el.hidden = false;
    clearTimeout(el._hide); el._hide = setTimeout(() => { el.hidden = true; }, 5500);
  }
  function sync() {
    const active = Boolean(current()) || fallback;
    document.documentElement.classList.toggle('esc-game-presenting', active);
    if (!button) return;
    const label = active ? 'Exit fullscreen' : 'Fullscreen';
    button.title = label; button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('active', active);
    button.innerHTML = '<span aria-hidden="true">\u26f6</span>';
  }
  async function toggle() {
    if (busy) return;
    busy = true; button.disabled = true;
    try {
      if (current()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) await exit.call(document);
      } else if (fallback) {
        fallback = false;
      } else {
        const root = document.documentElement;
        const request = root.requestFullscreen || root.webkitRequestFullscreen;
        if (!request) throw new Error('FULLSCREEN_UNAVAILABLE');
        await request.call(root);
      }
    } catch (error) {
      if (!current()) {
        fallback = !fallback;
        notice('Browser fullscreen is unavailable. In-page presentation mode is on; use \u26f6 to exit.');
      } else {
        notice('Press Esc to exit fullscreen.');
      }
    } finally { busy = false; button.disabled = false; sync(); }
  }
  function mount() {
    if (button?.isConnected) return;
    let host = document.querySelector('.game-actions, .new-game-actions, .header-actions');
    if (!host) {
      const header = document.querySelector('header.topbar, header.site-header, header');
      if (!header) return;
      host = document.createElement('div'); host.className = 'esc-display-actions';
      const sound = header.querySelector('#soundBtn, #sound, [data-esc-sound]');
      if (sound) host.appendChild(sound);
      header.appendChild(host);
    }
    // Replace legacy controls so cached versions cannot attach duplicate listeners.
    const old = document.querySelector('#fullscreenGame, [data-esc-fullscreen]');
    button = document.createElement('button'); button.type = 'button';
    button.id = old?.id || 'escFullscreen'; button.className = 'esc-fullscreen-btn';
    button.setAttribute('data-esc-fullscreen', '1');
    if (old) old.replaceWith(button); else host.prepend(button);
    document.querySelectorAll('[data-esc-fullscreen]').forEach(el => { if (el !== button) el.remove(); });
    button.addEventListener('click', toggle);
    button.addEventListener('keydown', e => { if (e.code === 'Space' || e.key === 'Enter') e.stopPropagation(); });
    sync();
  }
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && fallback) { fallback = false; sync(); } });
  window.addEventListener('esc:languagechange', sync);
  window.ESCFullscreen = { mount, toggle };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
