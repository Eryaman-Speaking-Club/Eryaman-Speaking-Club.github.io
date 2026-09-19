(() => {
  'use strict';

  const defaults = window.ESC_TRUTH_DARE_DEFAULTS || { names: [], truths: [], dares: [] };
  const STORAGE_KEY = 'esc-truth-dare-v1';
  const PASSWORD_HASH_KEY = 'esc-truth-dare-password-hash-v1';
  const ADMIN_SESSION_KEY = 'esc-truth-dare-admin-unlocked-v1';
  const DEFAULT_PASSWORD_HASH = 'c28440d7f9de5738eddf560c79371754e9ffa41fba2afd1efaa3da1458438a52';
  const STUDIO_MODE = new URLSearchParams(location.search).get('studio') === '1';
  const CLUB_LOGO_URL = '../51a64254-0651-4c02-8235-bef5325d7947%20(1).png';
  const WHEEL_COLORS = ['#123a6b', '#f74f54', '#225f9d', '#f28b45', '#0b2f5b', '#ef7e65'];

  const $ = (id) => document.getElementById(id);
  let state = loadState();
  let selectedPlayer = '';
  let selectedType = 'truth';
  let audioContext = null;
  let spinTimer = 0;
  let toastTimer = 0;
  let wheelRotation = 0;
  let wheelAnimation = null;
  let labelAnimations = [];

  function defaultState() {
    return {
      names: [],
      truths: defaults.truths.map((item) => item.text),
      dares: defaults.dares.map((item) => item.text),
      settings: { fairRotation: true, noRepeat: true, sound: true, vibration: true },
      history: { names: [], truths: [], dares: [] }
    };
  }

  function uniqueLines(value) {
    const seen = new Set();
    return value.map((item) => String(item || '').trim()).filter((item) => {
      const key = item.toLocaleLowerCase('en');
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function normalizeState(raw) {
    const base = defaultState();
    const source = raw && typeof raw === 'object' ? raw : {};
    const settings = source.settings && typeof source.settings === 'object' ? source.settings : {};
    const history = source.history && typeof source.history === 'object' ? source.history : {};
    return {
      names: Array.isArray(source.names) ? uniqueLines(source.names) : base.names,
      truths: Array.isArray(source.truths) ? uniqueLines(source.truths) : base.truths,
      dares: Array.isArray(source.dares) ? uniqueLines(source.dares) : base.dares,
      settings: {
        fairRotation: settings.fairRotation !== false,
        noRepeat: settings.noRepeat !== false,
        sound: settings.sound !== false,
        vibration: settings.vibration !== false
      },
      history: {
        names: Array.isArray(history.names) ? uniqueLines(history.names) : [],
        truths: Array.isArray(history.truths) ? uniqueLines(history.truths) : [],
        dares: Array.isArray(history.dares) ? uniqueLines(history.dares) : []
      }
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : defaultState();
    } catch {
      return defaultState();
    }
  }

  function saveState(message) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateAdminCounts();
    updateControls();
    if ($('saveLabel')) $('saveLabel').textContent = 'Saved';
    if (message) showToast(message);
  }

  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
  }

  function getAudio() {
    if (!state.settings.sound) return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext ||= new AudioCtor();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }

  function tone(frequency, duration = 0.045, delay = 0, volume = 0.024, type = 'sine') {
    const ctx = getAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + delay + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.02);
  }

  function playClick() {
    tone(659.25, 0.05, 0, 0.022, 'sine');
    tone(987.77, 0.06, 0.025, 0.014, 'sine');
  }

  function playTick(step = 0) {
    tone(390 + (step % 7) * 42, 0.045, 0, 0.019, 'triangle');
  }

  function playReveal(type) {
    const base = type === 'dare' ? 440 : 523.25;
    tone(base, 0.09, 0, 0.032, 'sine');
    tone(base * 1.25, 0.11, 0.05, 0.024, 'sine');
    tone(base * 1.5, 0.15, 0.1, 0.018, 'sine');
  }

  function vibrate(pattern) {
    if (state.settings.vibration && navigator.vibrate) navigator.vibrate(pattern);
  }

  function installWheelEnhancements() {
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

  function centerLogo() {
    const name = $('wheelName');
    if (!name) return;
    name.classList.add('logo-mode');
    name.innerHTML = `<img class="wheel-logo-symbol" src="${CLUB_LOGO_URL}" alt="Eryaman Speaking Club symbol">`;
  }

  function centerSelectedName(value) {
    const name = $('wheelName');
    name.classList.remove('logo-mode');
    name.textContent = value || '?';
  }

  function ensureWheelRotor() {
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

  function ensureWheelRotor() {
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

  function showScreen(name) {
    ['player', 'choice', 'question'].forEach((screen) => {
      $(`${screen}Screen`).hidden = screen !== name;
      const step = document.querySelector(`.step[data-step="${screen}"]`);
      const order = { player: 1, choice: 2, question: 3 };
      step.classList.toggle('active', screen === name);
      step.classList.toggle('done', order[screen] < order[name]);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateControls() {
    const canPlay = state.names.length >= 2;
    $('emptyPlayers').hidden = canPlay;
    $('spinPlayer').disabled = !canPlay;
    const used = state.settings.fairRotation ? state.history.names.filter((name) => state.names.includes(name)).length : 0;
    $('roundStatus').textContent = state.settings.fairRotation && canPlay ? `${Math.min(used, state.names.length)} of ${state.names.length} players used this round` : `${state.names.length} players ready`;
    $('sound').textContent = state.settings.sound ? '🔊' : '🔇';
    $('sound').setAttribute('aria-label', state.settings.sound ? 'Turn sound off' : 'Turn sound on');
    renderWheel();
  }

  function choosePlayer() {
    let pool = state.names.slice();
    if (state.settings.fairRotation) {
      const used = new Set(state.history.names);
      pool = pool.filter((name) => !used.has(name));
      if (!pool.length) {
        state.history.names = [];
        pool = state.names.slice();
        showToast('New round started.');
      }
    }
    return pool[Math.floor(Math.random() * pool.length)] || '';
  }

  function spinPlayer() {
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

    clearInterval(spinTimer);
    spinTimer = 0;

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

  function randomFrom(list, historyKey) {
    if (!list.length) return '';
    let pool = list.slice();
    if (state.settings.noRepeat) {
      const used = new Set(state.history[historyKey]);
      pool = pool.filter((item) => !used.has(item));
      if (!pool.length) {
        state.history[historyKey] = [];
        pool = list.slice();
        showToast(`All ${historyKey} used — starting again.`);
      }
    }
    const selected = pool[Math.floor(Math.random() * pool.length)] || '';
    if (selected && state.settings.noRepeat && !state.history[historyKey].includes(selected)) state.history[historyKey].push(selected);
    return selected;
  }

  function setQuestionType(type) {
    selectedType = type;
    const isTruth = type === 'truth';
    $('questionType').textContent = isTruth ? 'TRUTH' : 'DARE';
    $('questionType').className = `type-pill ${isTruth ? 'truth' : 'dare'}`;
    $('questionFor').textContent = `${isTruth ? 'Truth' : 'Dare'} for ${selectedPlayer}`;
    $('questionWheel').classList.toggle('dare-mode', !isTruth);
  }

  function spinQuestion(type) {
    setQuestionType(type);
    const list = type === 'truth' ? state.truths : state.dares;
    const historyKey = type === 'truth' ? 'truths' : 'dares';
    const empty = $('emptyQuestions');
    const wheel = $('questionWheel');
    const text = $('questionText');
    empty.hidden = list.length > 0;
    wheel.hidden = list.length === 0;
    $('spinAgain').disabled = list.length === 0;
    if (!list.length) return;

    playClick();
    wheel.classList.remove('revealed');
    wheel.classList.add('spinning-question');
    text.textContent = type === 'truth' ? 'TRUTH' : 'DARE';
    let ticks = 0;
    const preview = setInterval(() => {
      const item = list[Math.floor(Math.random() * list.length)];
      text.textContent = item;
      playTick(ticks++);
    }, 95);

    setTimeout(() => {
      clearInterval(preview);
      const picked = randomFrom(list, historyKey);
      text.textContent = picked;
      wheel.classList.remove('spinning-question');
      wheel.classList.add('revealed');
      saveState();
      vibrate(70);
      playReveal(type);
    }, 900);
  }

  function chooseType(type) {
    playClick();
    showScreen('question');
    setTimeout(() => spinQuestion(type), 120);
  }

  function nextPlayer() {
    playClick();
    selectedPlayer = '';
    $('wheelLabel').textContent = 'READY';
    centerLogo();
    $('playerWheel').classList.remove('winner');
    showScreen('player');
    updateControls();
  }

  function newRound() {
    playClick();
    state.history.names = [];
    saveState('New player round started.');
    $('wheelLabel').textContent = 'READY';
    centerLogo();
    $('playerWheel').classList.remove('winner');
  }

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function passwordHash() {
    return localStorage.getItem(PASSWORD_HASH_KEY) || DEFAULT_PASSWORD_HASH;
  }

  function showAdminLogin() {
    $('adminLogin').hidden = false;
    $('adminDashboard').hidden = true;
    $('adminError').hidden = true;
    $('adminPassword').value = '';
  }

  function populateEditors() {
    $('namesEditor').value = state.names.join('\n');
    $('truthsEditor').value = state.truths.join('\n');
    $('daresEditor').value = state.dares.join('\n');
    $('fairRotation').checked = state.settings.fairRotation;
    $('noRepeat').checked = state.settings.noRepeat;
    $('soundSetting').checked = state.settings.sound;
    $('vibrationSetting').checked = state.settings.vibration;
    updateAdminCounts();
  }

  function showAdminDashboard(tab = 'names') {
    $('adminLogin').hidden = true;
    $('adminDashboard').hidden = false;
    populateEditors();
    selectAdminTab(tab);
  }

  function openAdmin(tab = 'names') {
    playClick();
    $('adminPanel').showModal();
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'yes') showAdminDashboard(tab);
    else {
      showAdminLogin();
      $('adminPanel').dataset.requestedTab = tab;
    }
  }

  async function loginAdmin() {
    playClick();
    const entered = await sha256($('adminPassword').value);
    if (entered !== passwordHash()) {
      $('adminError').hidden = false;
      return;
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'yes');
    $('adminError').hidden = true;
    const tab = $('adminPanel').dataset.requestedTab || 'names';
    showAdminDashboard(tab);
    showToast('Edit mode unlocked.');
  }

  function logoutAdmin() {
    playClick();
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    showAdminLogin();
    showToast('Edit mode locked.');
  }

  function selectAdminTab(tab) {
    document.querySelectorAll('[data-admin-tab]').forEach((button) => button.classList.toggle('active', button.dataset.adminTab === tab));
    document.querySelectorAll('[data-tab-panel]').forEach((panel) => { panel.hidden = panel.dataset.tabPanel !== tab; });
  }

  function updateAdminCounts() {
    $('nameCount').textContent = state.names.length;
    $('truthCount').textContent = state.truths.length;
    $('dareCount').textContent = state.dares.length;
  }

  function parseEditor(id) {
    return uniqueLines($(id).value.split(/\r?\n/));
  }

  function saveEditor(kind) {
    const map = { names: 'namesEditor', truths: 'truthsEditor', dares: 'daresEditor' };
    state[kind] = parseEditor(map[kind]);
    state.history[kind] = [];
    saveState(`${kind[0].toUpperCase()}${kind.slice(1)} saved.`);
    populateEditors();
  }

  function clearEditorList(kind) {
    if (!confirm(`Remove all ${kind}?`)) return;
    state[kind] = [];
    state.history[kind] = [];
    saveState(`All ${kind} removed.`);
    populateEditors();
  }

  function restoreList(kind) {
    const source = kind === 'names' ? defaults.names : defaults[kind].map((item) => item.text);
    state[kind] = source.slice();
    state.history[kind] = [];
    saveState(`Sample ${kind} restored.`);
    populateEditors();
  }

  function updateSetting(key, value) {
    state.settings[key] = value;
    if (key === 'fairRotation') state.history.names = [];
    if (key === 'noRepeat') { state.history.truths = []; state.history.dares = []; }
    saveState();
    populateEditors();
  }

  function exportBackup() {
    playClick();
    const payload = { app: 'Eryaman Speaking Club Truth or Dare', version: 1, exportedAt: new Date().toISOString(), state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eryaman-truth-or-dare-backup.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Backup exported.');
  }

  async function importBackup(file) {
    try {
      const parsed = JSON.parse(await file.text());
      state = normalizeState(parsed && parsed.state ? parsed.state : parsed);
      saveState('Backup imported.');
      populateEditors();
      nextPlayer();
    } catch {
      showToast('Invalid backup file.');
    }
  }

  function clearHistory() {
    state.history = { names: [], truths: [], dares: [] };
    saveState('Round history cleared.');
  }

  function restoreAll() {
    if (!confirm('Restore all sample names, truths, dares and default settings?')) return;
    state = defaultState();
    state.names = defaults.names.slice();
    saveState('All samples restored.');
    populateEditors();
    nextPlayer();
  }

  function openPasswordPanel() {
    playClick();
    $('currentPassword').value = '';
    $('newPassword').value = '';
    $('repeatPassword').value = '';
    $('passwordError').hidden = true;
    $('passwordPanel').showModal();
  }

  async function changePassword() {
    const current = await sha256($('currentPassword').value);
    const next = $('newPassword').value;
    const repeat = $('repeatPassword').value;
    const error = $('passwordError');
    if (current !== passwordHash()) {
      error.textContent = 'Current password is incorrect.';
      error.hidden = false;
      return;
    }
    if (next.length < 6) {
      error.textContent = 'Use at least 6 characters.';
      error.hidden = false;
      return;
    }
    if (next !== repeat) {
      error.textContent = 'New passwords do not match.';
      error.hidden = false;
      return;
    }
    localStorage.setItem(PASSWORD_HASH_KEY, await sha256(next));
    error.hidden = true;
    $('passwordPanel').close();
    showToast('Password changed on this device.');
  }

  function restartGame() {
    playClick();
    selectedPlayer = '';
    $('wheelLabel').textContent = 'READY';
    centerLogo();
    $('playerWheel').classList.remove('winner');
    showScreen('player');
  }

  function init() {
    installWheelEnhancements();
    updateControls();
    updateAdminCounts();
    centerLogo();
    showScreen('player');

    $('spinPlayer').onclick = spinPlayer;
    $('playerWheel').onclick = spinPlayer;
    $('newRound').onclick = newRound;
    $('chooseTruth').onclick = () => chooseType('truth');
    $('chooseDare').onclick = () => chooseType('dare');
    $('skipPlayer').onclick = nextPlayer;
    $('nextPlayer').onclick = nextPlayer;
    $('spinAgain').onclick = () => spinQuestion(selectedType);
    $('homeLogo').onclick = restartGame;
    $('sound').onclick = () => { state.settings.sound = !state.settings.sound; saveState(); updateControls(); if (state.settings.sound) playClick(); };
    if ($('admin')) $('admin').onclick = () => openAdmin('names');
    $('openNames').onclick = () => openAdmin('names');
    $('openQuestions').onclick = () => {
      if (STUDIO_MODE) openAdmin(selectedType === 'truth' ? 'truths' : 'dares');
      else showToast('Question library is empty.');
    };
    $('closeAdmin').onclick = () => $('adminPanel').close();
    $('adminLoginButton').onclick = () => void loginAdmin();
    $('adminPassword').addEventListener('keydown', (event) => { if (event.key === 'Enter') void loginAdmin(); });
    $('adminLogout').onclick = logoutAdmin;

    document.querySelectorAll('[data-admin-tab]').forEach((button) => { button.onclick = () => selectAdminTab(button.dataset.adminTab); });
    $('saveNames').onclick = () => saveEditor('names');
    $('saveTruths').onclick = () => saveEditor('truths');
    $('saveDares').onclick = () => saveEditor('dares');
    $('clearNames').onclick = () => clearEditorList('names');
    $('clearTruths').onclick = () => clearEditorList('truths');
    $('clearDares').onclick = () => clearEditorList('dares');
    $('restoreNames').onclick = () => restoreList('names');
    $('restoreTruths').onclick = () => restoreList('truths');
    $('restoreDares').onclick = () => restoreList('dares');

    $('fairRotation').onchange = (event) => updateSetting('fairRotation', event.currentTarget.checked);
    $('noRepeat').onchange = (event) => updateSetting('noRepeat', event.currentTarget.checked);
    $('soundSetting').onchange = (event) => updateSetting('sound', event.currentTarget.checked);
    $('vibrationSetting').onchange = (event) => updateSetting('vibration', event.currentTarget.checked);

    $('changePassword').onclick = openPasswordPanel;
    $('closePassword').onclick = () => $('passwordPanel').close();
    $('savePassword').onclick = () => void changePassword();
    $('exportBackup').onclick = exportBackup;
    $('importBackup').onchange = (event) => {
      const file = event.currentTarget.files && event.currentTarget.files[0];
      if (file) void importBackup(file);
      event.currentTarget.value = '';
    };
    $('clearHistory').onclick = clearHistory;
    $('restoreAll').onclick = restoreAll;

    $('adminPanel').addEventListener('click', (event) => { if (event.target === $('adminPanel')) $('adminPanel').close(); });
    $('passwordPanel').addEventListener('click', (event) => { if (event.target === $('passwordPanel')) $('passwordPanel').close(); });

    if (STUDIO_MODE) {
      if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== 'yes') {
        location.replace('/esc-studio/?next=truth-or-dare');
        return;
      }
      const back = document.createElement('a');
      back.href = '/esc-studio/';
      back.textContent = '← ESC Studio';
      back.style.cssText = 'display:inline-flex;align-items:center;min-height:40px;padding:0 12px;border:1px solid #dce5ed;border-radius:12px;background:#fff;color:#0b2f5b;text-decoration:none;font-weight:900;font-size:12px';
      document.querySelector('.header-actions')?.prepend(back);
      setTimeout(() => openAdmin('truths'), 0);
    }
  }

  init();
})();