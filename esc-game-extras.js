/* Eryaman Speaking Club: a consistent Games return link and original calm background music. */
(() => {
  'use strict';
  if (window.ESCGameExtras) return;

  const VERSION = '20261029-game-extras3';
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

  const state = { track: 'piano', volume: 65, playing: false };
  let audio = null;
  let musicPlayer = null;
  let testPlayer = null;
  const audioUrls = new Map();
  let testUrl = null;
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

  // Music gains are independent of the game's sound-effect gain patch.
  // Using native GainNode avoids an effect-volume multiplier that could mute the music.
  function makeMusicGain(ctx, gain = 1) {
    try { if (typeof window.GainNode === 'function') return new window.GainNode(ctx, { gain }); } catch (_) {}
    const node = ctx.createGain();
    node.gain.value = gain;
    return node;
  }
  const musicVolume = value => value <= 0 ? 0 : Math.pow(value / 100, 0.75) * 0.68;

  // Entirely original, gently synthesized loops: no external stream or licence required.
  function voice(midi, at, duration, kind, velocity = 1) {
    if (!audio || !output) return;
    const ctx = audio;
    const start = Math.max(at, ctx.currentTime + 0.005);
    const isPad = kind === 'pad';
    const isBell = kind === 'bell';
    const attack = isPad ? 0.55 : isBell ? 0.018 : 0.014;
    const sustain = isPad ? Math.max(1.1, duration) : isBell ? Math.max(0.75, duration) : Math.max(0.6, duration);
    const release = isPad ? 1.65 : isBell ? 1.12 : 0.72;
    const peak = (isPad ? 0.07 : isBell ? 0.09 : kind === 'bass' ? 0.12 : 0.13) * velocity;
    const envelope = makeMusicGain(ctx);
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
    const harmonicLevel = makeMusicGain(ctx);
    // A low-level harmonic to soften the fundamental note.
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


  // A browser-native media element gives reliable volume and playback on phones,
  // Safari and muted game-effect setups. Every track is synthesized locally.
  function createWav(key) {
    const sampleRate = 22050;
    const track = TRACKS[key];
    const beat = 60 / track.tempo;
    const duration = beat * 16;
    const count = Math.ceil(duration * sampleRate);
    const pcm = new Float32Array(count);
    const TAU = Math.PI * 2;
    const addNote = (midi, at, length, strength, voiceType) => {
      const hz = midiHz(midi);
      const begin = Math.max(0, Math.floor(at * sampleRate));
      const end = Math.min(count, Math.ceil((at + length) * sampleRate));
      const attack = voiceType === 'pad' ? 0.28 : 0.025;
      const release = voiceType === 'pad' ? 0.8 : 0.45;
      for (let i = begin; i < end; i++) {
        const t = i / sampleRate - at;
        const envIn = Math.min(1, Math.max(0, t / attack));
        const envOut = Math.min(1, Math.max(0, (length - t) / release));
        const decay = voiceType === 'pad' ? 1 : Math.exp(-t * (voiceType === 'bell' ? 0.82 : 0.40));
        const phase = TAU * hz * t;
        const tone = voiceType === 'pad'
          ? Math.sin(phase) + 0.18 * Math.sin(phase * 2)
          : Math.sin(phase) + 0.31 * Math.sin(phase * 2) + 0.07 * Math.sin(phase * 3);
        pcm[i] += strength * envIn * envOut * decay * tone;
      }
    };
    for (let bar = 0; bar < 4; bar++) {
      const chord = track.chords[bar];
      const at = bar * beat * 4;
      addNote(chord[0] - 12, at, beat * 3.8, 0.19, 'pad');
      if (key === 'ambient') {
        chord.forEach((note, index) => addNote(note + (index > 1 ? 12 : 0), at, beat * 3.9, index === 0 ? 0.065 : 0.05, 'pad'));
        addNote(chord[2] + 24, at + beat * 1.7, beat * 1.8, 0.15, 'bell');
      } else if (key === 'lofi') {
        [1, 2, 3].forEach(index => {
          addNote(chord[index] + 12, at, beat * 1.85, 0.11, 'pad');
          addNote(chord[index] + 12, at + beat * 2.0, beat * 1.55, 0.09, 'pad');
        });
        addNote(chord[3] + 12, at + beat * 1.0, beat * 0.9, 0.20, 'key');
        addNote(chord[2] + 12, at + beat * 3.0, beat * 0.9, 0.19, 'key');
      } else {
        const sequence = [1, 2, 3, 2];
        sequence.forEach((index, step) => addNote(chord[index] + 12, at + step * beat, beat * 1.13, 0.31, 'key'));
        addNote(chord[1], at, beat * 3.75, 0.055, 'pad');
      }
    }
    // Normalize to an audible, safe peak and crossfade the loop boundaries.
    let peak = 0;
    for (let i = 0; i < count; i++) peak = Math.max(peak, Math.abs(pcm[i]));
    const scale = peak > 0 ? 0.65 / peak : 0;
    const fade = Math.floor(sampleRate * 0.10);
    const bytes = new ArrayBuffer(44 + count * 2);
    const view = new DataView(bytes);
    const label = (offset, value) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
    label(0, 'RIFF'); view.setUint32(4, 36 + count * 2, true);
    label(8, 'WAVE'); label(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint16(24, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    label(36, 'data'); view.setUint32(40, count * 2, true);
    for (let i = 0; i < count; i++) {
      const edge = Math.min(1, i / fade, (count - 1 - i) / fade);
      const sample = Math.max(-1, Math.min(1, pcm[i] * scale * Math.max(0, edge)));
      view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
    }
    return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
  }
  function trackUrl(key) {
    if (!audioUrls.has(key)) audioUrls.set(key, createWav(key));
    return audioUrls.get(key);
  }
  function stop() {
    const player = musicPlayer;
    musicPlayer = null;
    if (player) { try { player.pause(); player.currentTime = 0; player.src = ''; } catch (_) {} }
    state.playing = false;
    updateUI();
  }
  function start() {
    if (state.playing) return;
    try {
      const player = new Audio(trackUrl(state.track));
      player.loop = true;
      player.preload = 'auto';
      player.volume = Math.max(0, Math.min(1, Math.pow(state.volume / 100, 0.8)));
      musicPlayer = player;
      state.playing = true;
      player.addEventListener('playing', () => { if (musicPlayer === player) updateUI(); });
      player.addEventListener('error', () => {
        if (musicPlayer !== player) return;
        stop();
        if (musicStatus) musicStatus.textContent = 'Audio failed to load. Please refresh and try again.';
      });
      const result = player.play();
      if (result?.then) result.then(() => { if (musicPlayer === player) updateUI(); }).catch(error => {
        if (musicPlayer !== player) return;
        stop();
        if (musicStatus) musicStatus.textContent = error?.name === 'NotAllowedError'
          ? 'Browser blocked audio. Tap Play again and allow sound for this tab.'
          : 'Could not play music. Check the browser tab sound setting.';
      });
      updateUI();
    } catch (_) {
      stop();
      if (musicStatus) musicStatus.textContent = 'Could not start audio. Please refresh the game.';
    }
  }
  function testSound() {
    try {
      if (!testUrl) {
        const rate = 22050, count = rate;
        const bytes = new ArrayBuffer(44 + count * 2), data = new DataView(bytes);
        const text = (at, value) => { for (let i = 0; i < value.length; i++) data.setUint8(at + i, value.charCodeAt(i)); };
        text(0,'RIFF'); data.setUint32(4, 36 + count * 2, true); text(8,'WAVE'); text(12,'fmt ');
        data.setUint32(16,16,true);data.setUint16(20,1,true);data.setUint16(22,1,true);
        data.setUint32(24,rate,true);data.setUint32(28,rate*2,true);data.setUint16(32,2,true);
        data.setUint16(34,16,true);text(36,'data');data.setUint32(40,count*2,true);
        for (let i=0;i<count;i++) {
          const t=i/rate;
          const env=Math.min(1,t/.025, Math.max(0,(0.95-t)/.24));
          const value=.42*env*(Math.sin(2*Math.PI*660*t)+.24*Math.sin(2*Math.PI*880*t));
          data.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,value))*32767),true);
        }
        testUrl = URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));
      }
      testPlayer?.pause();
      const player = new Audio(testUrl);
      testPlayer = player;
      player.volume = 0.85;
      const done = player.play();
      if (musicStatus) musicStatus.textContent = 'Playing test chime… If you hear nothing, check tab mute and device volume.';
      done?.catch?.(() => { if (musicStatus) musicStatus.textContent = 'Browser blocked test sound. Check the tab permissions.'; });
    } catch (_) { if (musicStatus) musicStatus.textContent = 'Audio test unavailable. Check your browser output.'; }
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
      ? (musicPlayer && !musicPlayer.paused && musicPlayer.readyState >= 2 ? 'Playing ' + TRACKS[state.track].label + ' · Adjust your device volume if quiet.' : 'Starting music…')
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
        <button type="button" class="esc-calm-play" aria-pressed="false">Play music</button><button type="button" class="esc-calm-test">Test speaker sound</button>
        <label class="esc-calm-field">Music style
          <select class="esc-calm-track" aria-label="Choose background music">
            ${Object.entries(TRACKS).map(([key, track]) => `<option value="${key}">${track.label}</option>`).join('')}
          </select>
        </label>
        <label class="esc-calm-field esc-calm-volume-field"><span>Music volume <output class="esc-calm-volume-value">65%</output></span>
          <input type="range" class="esc-calm-volume" min="0" max="100" step="1" value="65" aria-label="Music volume">
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
    panel.querySelector('.esc-calm-test').addEventListener('click', testSound);
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
      if (musicPlayer) musicPlayer.volume = Math.max(0, Math.min(1, Math.pow(state.volume / 100, 0.8)));
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
    window.addEventListener('pagehide', () => { if (state.playing) stop(); for (const url of audioUrls.values()) URL.revokeObjectURL(url); if (testUrl) URL.revokeObjectURL(testUrl); });
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

  window.ESCGameExtras = { mount, pause: stop, isPlaying: () => state.playing, audioStatus: () => ({ playing: state.playing, playerPaused: musicPlayer?.paused, playerReadyState: musicPlayer?.readyState, volume: musicPlayer?.volume, track: state.track }) }; 
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
