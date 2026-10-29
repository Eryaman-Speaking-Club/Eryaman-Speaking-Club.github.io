/* Eryaman Speaking Club: a consistent Games return link and original calm background music. */
(() => {
  'use strict';
  if (window.ESCGameExtras) return;

  const VERSION = '20261029-game-extras1';
  const STORAGE_KEY = 'esc-background-music-v1';
  const HUB_URL = '/games/';
  const TRACKS = {
    piano: {
      label: 'Soft Piano', caption: 'Gentle notes & slow melodies', tempo: 68,
      chords: [[48,52,55,59], [45,48,52,55], [41,45,48,52], [43,47,50,55]]
    },
    ambient: {
      label: 'Dreamy Ambient', caption: 'Airy, floating harmonies', tempo: 55,
      chords: [[48,52,55,59], [41,45,48,52], [45,48,52,55], [43,47,50,55]]
    },
    lofi: {
      label: 'Cozy Lo-Fi', caption: 'Warm keys & a gentle rhythm', tempo: 73,
      chords: [[50,53,57,60], [46,50,53,57], [41,45,48,52], [48,52,55,59]]
    }
  };

  const state = { track: 'piano', volume: 32, playing: false };
  let audio = null;
  let output = null;
  let scheduleTimer = null;
  let nextNoteAt = 0;
  let stepIndex = 0;
  let backLink = null;
  let musicButton = null;
  let panel = null;
  let playButton = null;
  let trackSelect = null;
  let volumeSlider = null;
  let volumeValue = null;
  let musicStatus = null;
  let host = null;

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return;
      if (Object.prototype.hasOwnProperty.call(TRACKS, saved.track)) state.track = saved.track;
      if (Number.isFinite(Number(saved.volume))) state.volume = Math.min(100, Math.max(0, Number(saved.volume)));
    } catch (_) { /* Private browsing or disabled storage: controls still work. */ }
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ track: state.track, volume: state.volume })); }
    catch (_) { /* Music doesn't require storage. */ }
  }
  const midiHz = midi => 440 * Math.pow(2, (midi - 69) / 12);

  // Entirely original, quietly synthesized loops: no external audio stream or music licence required.
  function voice(midi, at, duration, kind, velocity = 1) {
    if (!audio || !output) return;
    const ctx = audio;
    const start = Math.max(at, ctx.currentTime + 0.005);
    const isPad = kind === 'pad';
    const isBell = kind === 'bell';
    const attack = isPad ? 0.55 : isBell ? 0.018 : 0.014;
    const sustain = isPad ? Math.max(1.1, duration) : isBell ? Math.max(0.75, duration) : Math.max(0.6, duration);
    const release = isPad ? 1.65 : isBell ? 1.12 : 0.72;
    const peak = (isPad ? 0.0052 : isBell ? 0.0068 : kind === 'bass' ? 0.0105 : 0.0095) * velocity;
    const envelope = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = isPad ? 1000 : isBell ? 2450 : kind === 'bass' ? 520 : 1750;
    filter.Q.value = 0.25;
    envelope.gain.setValueAtTime(0.000001, start);
    envelope.gain.linearRampToValueAtTime(peak, start + attack);
    if (isPad) {
      envelope.gain.setValueAtTime(peak * 0.78, start + sustain);
      envelope.gain.exponentialRampToValueAtTime(0.000001, start + sustain + release);
    } else {
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.00015, peak * 0.24), start + sustain * 0.72);
      envelope.gain.exponentialRampToValueAtTime(0.000001, start + sustain + release);
    }
    filter.connect(envelope);
    envelope.connect(output);

    const fundamental = ctx.createOscillator();
    fundamental.type = isPad ? 'sine' : kind === 'bass' ? 'sine' : 'triangle';
    fundamental.frequency.setValueAtTime(midiHz(midi), start);
    fundamental.connect(filter);

    const harmonic = ctx.createOscillator();
    harmonic.type = isPad ? 'triangle' : 'sine';
    harmonic.frequency.setValueAtTime(midiHz(midi) * (isBell ? 2 : 1), start);
    harmonic.detune.value = isPad ? 4 : -3;
    const harmonicLevel = ctx.createGain();
    // Setting .value avoids intercepting the site's existing game-effect gain automation.
    harmonicLevel.gain.value = isPad ? 0.22 : isBell ? 0.19 : 0.17;
    harmonic.connect(harmonicLevel);
    harmonicLevel.connect(filter);

    const end = start + sustain + release + 0.04;
    fundamental.start(start);
    harmonic.start(start);
    fundamental.stop(end);
    harmonic.stop(end);
    fundamental.onended = () => {
      try { fundamental.disconnect(); harmonic.disconnect(); harmonicLevel.disconnect(); filter.disconnect(); envelope.disconnect(); }
      catch (_) { /* Context may have closed on track change. */ }
    };
  }

  function scheduleStep(index, time) {
    const track = TRACKS[state.track];
    if (!track) return;
    const beat = 60 / track.tempo;
    const beatHalf = beat / 2;
    const bar = Math.floor(index / 8);
    const pos = index % 8;
    const chord = track.chords[bar % track.chords.length];
    const variation = Math.floor(bar / track.chords.length) % 2;

    if (state.track === 'piano') {
      if (pos === 0) {
        voice(chord[0] - 12, time, beat * 2.25, 'bass', 0.60);
        voice(chord[1], time, beat * 2.1, 'pad', 0.26);
        voice(chord[3], time, beat * 2.1, 'pad', 0.23);
      }
      if (pos % 2 === 0) {
        const melodicOrder = variation ? [2, 1, 3, 2] : [1, 2, 3, 2];
        const indexInChord = melodicOrder[pos / 2];
        voice(chord[indexInChord] + 12, time + (variation && pos === 6 ? beatHalf * 0.14 : 0), beat * 0.95, 'key', 0.72);
      }
    } else if (state.track === 'ambient') {
      if (pos === 0) {
        chord.forEach((note, i) => voice(note + (i > 1 ? 12 : 0), time, beat * 3.0, 'pad', i === 0 ? 0.65 : 0.48));
      }
      if (pos === 3 || pos === 6) {
        const high = chord[pos === 3 ? 2 : (variation ? 1 : 3)] + 24;
        voice(high, time, beat * 1.05, 'bell', 0.40);
      }
    } else if (state.track === 'lofi') {
      if (pos === 0) voice(chord[0] - 12, time, beat * 1.65, 'bass', 0.65);
      if (pos === 0 || pos === 4) {
        chord.slice(1).forEach((note, i) => voice(note + 12, time + i * 0.018, beat * 1.0, 'key', 0.30));
      }
      if (pos === 3 || pos === 6) {
        voice(chord[(pos === 3 ? 3 : (variation ? 2 : 1))] + 12, time, beat * 0.85, 'key', 0.49);
      }
    }
  }

  function tick() {
    if (!audio || !state.playing) return;
    const ahead = audio.currentTime + 0.48;
    while (nextNoteAt < ahead) {
      const tempo = TRACKS[state.track].tempo;
      scheduleStep(stepIndex, nextNoteAt);
      stepIndex += 1;
      nextNoteAt += 60 / tempo / 2;
    }
  }

  function stop() {
    if (scheduleTimer !== null) clearInterval(scheduleTimer);
    scheduleTimer = null;
    state.playing = false;
    const oldAudio = audio;
    const oldOutput = output;
    audio = null;
    output = null;
    if (oldAudio) {
      try { oldOutput?.gain.setTargetAtTime(0, oldAudio.currentTime, 0.055); }
      catch (_) { /* Already suspended/closed. */ }
      window.setTimeout(() => { try { void oldAudio.close().catch(() => {}); } catch (_) {} }, 350);
    }
    updateUI();
  }

  function start() {
    if (state.playing) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      if (musicStatus) musicStatus.textContent = 'Music is not supported in this browser.';
      return;
    }
    try {
      const ctx = new AudioContextClass();
      audio = ctx;
      output = ctx.createGain();
      output.gain.value = (state.volume / 100) * 0.32;
      output.connect(ctx.destination);
      stepIndex = 0;
      nextNoteAt = ctx.currentTime + 0.08;
      state.playing = true;
      tick();
      scheduleTimer = window.setInterval(tick, 95);
      // A user-initiated click starts music. Modern browsers block audio autoplay.
      const result = ctx.resume();
      if (result && typeof result.catch === 'function') result.catch(() => {
        if (audio === ctx) {
          stop();
          if (musicStatus) musicStatus.textContent = 'Tap Play to enable audio in your browser.';
        }
      });
      updateUI();
    } catch (_) {
      stop();
      if (musicStatus) musicStatus.textContent = 'Music could not start in this browser.';
    }
  }

  function updateUI() {
    if (!musicButton) return;
    musicButton.classList.toggle('is-playing', state.playing);
    musicButton.setAttribute('aria-label', state.playing ? 'Background music is playing. Open music settings.' : 'Open background music settings');
    if (playButton) {
      playButton.textContent = state.playing ? 'Pause music' : 'Play music';
      playButton.setAttribute('aria-pressed', String(state.playing));
      playButton.classList.toggle('is-playing', state.playing);
    }
    if (trackSelect) trackSelect.value = state.track;
    if (volumeSlider) volumeSlider.value = String(state.volume);
    if (volumeValue) volumeValue.textContent = Math.round(state.volume) + '%';
    if (musicStatus) musicStatus.textContent = state.playing
      ? 'Playing ' + TRACKS[state.track].label + ' softly in the background.'
      : 'Paused · Press Play when you are ready.';
  }

  function positionPanel() {
    if (!panel || panel.hidden || !musicButton) return;
    const rect = musicButton.getBoundingClientRect();
    const width = panel.getBoundingClientRect().width || 326;
    const height = panel.getBoundingClientRect().height || 315;
    const x = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
    const topBelow = rect.bottom + 10;
    const top = topBelow + height < window.innerHeight - 12
      ? topBelow
      : Math.max(12, Math.min(rect.top - height - 8, window.innerHeight - height - 12));
    panel.style.left = x + 'px';
    panel.style.top = top + 'px';
  }
  function closePanel() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    musicButton?.setAttribute('aria-expanded', 'false');
  }
  function togglePanel() {
    if (!panel) return;
    panel.hidden = !panel.hidden;
    musicButton.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) { updateUI(); positionPanel(); }
  }

  function getHost() {
    let actions = document.querySelector('.game-actions, .new-game-actions, .header-actions, .esc-display-actions');
    if (actions) return actions;
    const header = document.querySelector('header.game-topbar, header.new-game-topbar, header.topbar, header.site-header, header');
    if (!header) return null;
    actions = document.createElement('div');
    actions.className = 'esc-display-actions';
    header.appendChild(actions);
    return actions;
  }
  function isGamesLink(link) {
    try {
      const url = new URL(link.getAttribute('href'), location.href);
      return url.origin === location.origin && url.pathname.replace(/\/+$/, '') === '/games';
    } catch (_) { return false; }
  }
  function mountBackLink() {
    if (!host || document.querySelector('.esc-all-games-btn')) return;
    const header = host.closest('header');
    backLink = Array.from(header ? header.querySelectorAll('a[href]') : []).find(isGamesLink) || document.createElement('a');
    backLink.href = HUB_URL;
    backLink.classList.add('esc-all-games-btn');
    backLink.textContent = '← All games';
    backLink.setAttribute('aria-label', 'Back to all games');
    backLink.title = 'Return to the games list';
    host.prepend(backLink);
  }
  function mountPanel() {
    if (document.querySelector('.esc-calm-music-button')) return;
    musicButton = document.createElement('button');
    musicButton.type = 'button';
    musicButton.className = 'esc-calm-music-button';
    musicButton.innerHTML = '<span aria-hidden="true">♫</span><span>Music</span><i aria-hidden="true"></i>';
    musicButton.setAttribute('aria-haspopup', 'dialog');
    musicButton.setAttribute('aria-expanded', 'false');
    musicButton.addEventListener('click', togglePanel);
    musicButton.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); });
    host.appendChild(musicButton);

    panel = document.createElement('section');
    panel.className = 'esc-calm-music-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Background music settings');
    panel.innerHTML = `
      <div class="esc-calm-music-heading">
        <div><strong>Background music</strong><p>Calm sounds for your game</p></div>
        <button type="button" class="esc-calm-close" aria-label="Close music settings">×</button>
      </div>
      <div class="esc-calm-main">
        <button type="button" class="esc-calm-play" aria-pressed="false">Play music</button>
        <label class="esc-calm-field">Music style
          <select class="esc-calm-track" aria-label="Choose background music">
            ${Object.entries(TRACKS).map(([key, track]) => `<option value="${key}">${track.label}</option>`).join('')}
          </select>
        </label>
        <label class="esc-calm-field esc-calm-volume-field"><span>Music volume <output class="esc-calm-volume-value">32%</output></span>
          <input type="range" class="esc-calm-volume" min="0" max="100" step="1" value="32" aria-label="Music volume">
        </label>
        <div class="esc-calm-status" role="status" aria-live="polite">Paused · Press Play when you are ready.</div>
        <p class="esc-calm-footnote">Separate from game sound effects. Music starts only when you press Play.</p>
      </div>`;
    document.body.appendChild(panel);
    playButton = panel.querySelector('.esc-calm-play');
    trackSelect = panel.querySelector('.esc-calm-track');
    volumeSlider = panel.querySelector('.esc-calm-volume');
    volumeValue = panel.querySelector('.esc-calm-volume-value');
    musicStatus = panel.querySelector('.esc-calm-status');
    panel.querySelector('.esc-calm-close').addEventListener('click', () => { closePanel(); musicButton.focus(); });
    playButton.addEventListener('click', () => { if (state.playing) stop(); else start(); });
    trackSelect.addEventListener('change', () => {
      const next = trackSelect.value;
      if (!Object.prototype.hasOwnProperty.call(TRACKS, next)) return;
      if (state.track === next) return;
      const wasPlaying = state.playing;
      if (wasPlaying) stop();
      state.track = next;
      persist();
      if (wasPlaying) start(); else updateUI();
    });
    volumeSlider.addEventListener('input', () => {
      state.volume = Math.max(0, Math.min(100, Number(volumeSlider.value)));
      if (output && audio) {
        try { output.gain.setTargetAtTime((state.volume / 100) * 0.32, audio.currentTime, 0.045); }
        catch (_) { output.gain.value = (state.volume / 100) * 0.32; }
      }
      persist(); updateUI();
    });
    panel.addEventListener('keydown', event => {
      // Keep game-specific keyboard shortcuts from treating track and volume controls as moves.
      if ([' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.stopPropagation();
    });
    document.addEventListener('pointerdown', event => {
      if (!panel.hidden && !panel.contains(event.target) && !musicButton.contains(event.target)) closePanel();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) closePanel(); });
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    document.addEventListener('visibilitychange', () => { if (document.hidden && state.playing) stop(); });
    window.addEventListener('pagehide', () => { if (state.playing) stop(); });
    updateUI();
  }

  function mount() {
    if (!document.body) return;
    host = getHost();
    if (!host) return;
    if (!document.querySelector('link[data-esc-game-extras]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/esc-game-extras.css?v=' + VERSION;
      stylesheet.dataset.escGameExtras = '1';
      document.head.appendChild(stylesheet);
    }
    restore();
    mountBackLink();
    mountPanel();
  }

  window.ESCGameExtras = { mount, pause: stop, isPlaying: () => state.playing };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
