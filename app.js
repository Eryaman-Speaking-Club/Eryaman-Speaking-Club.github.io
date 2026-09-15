(() => {
  'use strict';

  const ADMIN_PASSWORD = 'Eryaman6144.';
  const STORAGE_KEY = 'esc-local-admin-v2';
  const SOUND_KEY = 'esc-sound-v2';
  const UNLOCK_KEY = 'esc-admin-unlocked-v2';
  const PAGE_SIZE = 24;
  const builtIns = Array.isArray(window.ESC_QUESTIONS) ? window.ESC_QUESTIONS : [];

  let config = loadConfig();
  let turn = 'me';
  let usedIds = new Set();
  let currentId = null;
  let adminPage = 0;
  let editingId = null;
  let showDisabled = false;
  let soundEnabled = localStorage.getItem(SOUND_KEY) !== 'off';
  let audioContext = null;
  let toastTimer = 0;

  const $ = (id) => document.getElementById(id);

  function defaultConfig() {
    return { disabledIds: [], edits: {}, custom: [] };
  }

  function normalizeConfig(value) {
    const source = value && typeof value === 'object' ? value : {};
    const disabledIds = Array.isArray(source.disabledIds) ? source.disabledIds.filter((id) => typeof id === 'string') : [];
    const edits = source.edits && typeof source.edits === 'object' ? source.edits : {};
    const custom = Array.isArray(source.custom)
      ? source.custom.filter((item) => item && typeof item.id === 'string' && typeof item.q === 'string')
      : [];
    return { disabledIds, edits, custom };
  }

  function loadConfig() {
    try {
      return normalizeConfig(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      return defaultConfig();
    }
  }

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  function allCards() {
    const editedBuiltIns = builtIns.map((card) => {
      const edit = config.edits[card.id];
      return edit ? { ...card, q: edit.q, f: edit.f } : card;
    });
    return [...editedBuiltIns, ...config.custom.map((card) => ({ ...card, custom: true }))];
  }

  function activeDeck() {
    const disabled = new Set(config.disabledIds);
    return allCards().filter((card) => !disabled.has(card.id));
  }

  function cardById(id) {
    return allCards().find((card) => card.id === id);
  }

  function getAudio() {
    if (!soundEnabled) return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext ||= new AudioCtor();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function tone(frequency, duration = 0.05, delay = 0, volume = 0.02) {
    const ctx = getAudio();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + delay + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration + 0.02);
  }

  function playClick() {
    tone(320, 0.045, 0, 0.018);
    tone(470, 0.05, 0.025, 0.014);
  }

  function playDraw() {
    [0, 1, 2, 3].forEach((step) => tone(190 + step * 55, 0.045, step * 0.055, 0.015));
  }

  function playReveal() {
    tone(390, 0.09, 0, 0.024);
    tone(590, 0.11, 0.055, 0.019);
    tone(790, 0.15, 0.11, 0.014);
  }

  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
  }

  function updateSoundButton() {
    $('sound').textContent = soundEnabled ? '🔊' : '🔇';
    $('sound').setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on');
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_KEY, soundEnabled ? 'on' : 'off');
    updateSoundButton();
    if (soundEnabled) playClick();
  }

  function updateTurn() {
    const isMe = turn === 'me';
    $('turn').textContent = isMe ? 'FOR ME' : 'FOR YOU';
    $('draw').textContent = isMe ? 'Draw one for me' : 'Draw one for you';
    $('next').textContent = isMe ? 'Next: FOR YOU' : 'Next: FOR ME';
    document.body.classList.toggle('you', !isMe);
  }

  function resetQuestionCard() {
    currentId = null;
    $('q').textContent = 'Ready?';
    $('f').textContent = 'Draw a card to start.';
    $('draw').removeAttribute('hidden');
    $('next').setAttribute('hidden', '');
    $('questionCard').classList.remove('revealed', 'shuffling');
  }

  function chooseUnusedCard() {
    const deck = activeDeck();
    if (!deck.length) return null;
    let available = deck.filter((card) => !usedIds.has(card.id));
    if (!available.length) {
      usedIds.clear();
      available = deck;
      showToast('New round shuffled.');
    }
    return available[Math.floor(Math.random() * available.length)] || null;
  }

  function drawCard() {
    const selected = chooseUnusedCard();
    if (!selected) {
      showToast('No active questions. Open the Control Panel.');
      return;
    }
    playClick();
    playDraw();
    const card = $('questionCard');
    card.classList.remove('revealed');
    card.classList.add('shuffling');
    $('draw').disabled = true;
    setTimeout(() => {
      currentId = selected.id;
      usedIds.add(selected.id);
      $('q').textContent = selected.q;
      $('f').textContent = selected.f || 'Explain your answer and give an example.';
      $('draw').setAttribute('hidden', '');
      $('next').removeAttribute('hidden');
      card.classList.remove('shuffling');
      card.classList.add('revealed');
      $('draw').disabled = false;
      playReveal();
    }, 330);
  }

  function startGame() {
    playClick();
    $('home').setAttribute('hidden', '');
    $('game').removeAttribute('hidden');
    updateTurn();
  }

  function nextTurn() {
    playClick();
    turn = turn === 'me' ? 'you' : 'me';
    resetQuestionCard();
    updateTurn();
  }

  function goHome() {
    playClick();
    $('game').setAttribute('hidden', '');
    $('home').removeAttribute('hidden');
  }

  function showAdminLogin() {
    $('adminLogin').removeAttribute('hidden');
    $('adminDashboard').setAttribute('hidden', '');
    $('adminError').setAttribute('hidden', '');
    $('adminPassword').value = '';
  }

  function showAdminDashboard() {
    $('adminLogin').setAttribute('hidden', '');
    $('adminDashboard').removeAttribute('hidden');
    adminPage = 0;
    renderLibrary();
  }

  function openAdmin() {
    playClick();
    $('adminPanel').showModal();
    if (sessionStorage.getItem(UNLOCK_KEY) === 'yes') showAdminDashboard();
    else showAdminLogin();
  }

  function closeAdmin() {
    playClick();
    $('adminPanel').close();
  }

  function loginAdmin() {
    playClick();
    const password = $('adminPassword').value.trim();
    if (password !== ADMIN_PASSWORD) {
      $('adminError').removeAttribute('hidden');
      return;
    }
    sessionStorage.setItem(UNLOCK_KEY, 'yes');
    $('adminError').setAttribute('hidden', '');
    showAdminDashboard();
    showToast('Control Panel unlocked.');
  }

  function logoutAdmin() {
    playClick();
    sessionStorage.removeItem(UNLOCK_KEY);
    editingId = null;
    showAdminLogin();
    showToast('Control Panel locked.');
  }

  function clearEditor() {
    editingId = null;
    $('editorEmpty').removeAttribute('hidden');
    $('editorFields').setAttribute('hidden', '');
    $('clearEditor').setAttribute('hidden', '');
    $('editQuestion').value = '';
    $('editFollowup').value = '';
  }

  function selectForEdit(id) {
    const card = cardById(id);
    if (!card) return;
    playClick();
    editingId = id;
    $('editorEmpty').setAttribute('hidden', '');
    $('editorFields').removeAttribute('hidden');
    $('clearEditor').removeAttribute('hidden');
    $('editQuestion').value = card.q;
    $('editFollowup').value = card.f || '';
    $('editorFields').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function saveSelectedEdit() {
    if (!editingId) return;
    const q = $('editQuestion').value.trim();
    const f = $('editFollowup').value.trim();
    if (!q) {
      showToast('Question text cannot be empty.');
      return;
    }
    const customIndex = config.custom.findIndex((item) => item.id === editingId);
    if (customIndex >= 0) config.custom[customIndex] = { ...config.custom[customIndex], q, f };
    else config.edits[editingId] = { q, f };
    saveConfig();
    clearEditor();
    renderLibrary();
    resetQuestionCard();
    showToast('Question updated on this device.');
  }

  function toggleQuestion(id) {
    playClick();
    const disabled = new Set(config.disabledIds);
    const isDisabled = disabled.has(id);
    if (isDisabled) disabled.delete(id);
    else disabled.add(id);
    config.disabledIds = [...disabled];
    saveConfig();
    if (currentId === id && !isDisabled) resetQuestionCard();
    renderLibrary();
    showToast(isDisabled ? 'Question enabled.' : 'Question hidden on this device.');
  }

  function deleteCustom(id) {
    if (!confirm('Delete this custom question permanently from this device?')) return;
    config.custom = config.custom.filter((item) => item.id !== id);
    config.disabledIds = config.disabledIds.filter((item) => item !== id);
    if (editingId === id) clearEditor();
    saveConfig();
    renderLibrary();
    resetQuestionCard();
    showToast('Custom question deleted.');
  }

  function uniqueId() {
    if (window.crypto && crypto.randomUUID) return `c-${crypto.randomUUID()}`;
    return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function addQuestion() {
    playClick();
    const q = $('newQuestion').value.trim();
    const f = $('newFollowup').value.trim();
    if (!q) {
      showToast('Write a question first.');
      return;
    }
    config.custom.push({ id: uniqueId(), q, f, custom: true });
    saveConfig();
    $('newQuestion').value = '';
    $('newFollowup').value = '';
    renderLibrary();
    showToast('Question added on this device.');
  }

  function searchableCards() {
    const search = $('questionSearch').value.trim().toLocaleLowerCase('en');
    const disabled = new Set(config.disabledIds);
    return allCards().filter((card) => {
      if (!showDisabled && disabled.has(card.id)) return false;
      if (!search) return true;
      return `${card.q} ${card.f || ''}`.toLocaleLowerCase('en').includes(search);
    });
  }

  function renderLibrary() {
    const cards = searchableCards();
    const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
    adminPage = Math.min(adminPage, totalPages - 1);
    const visible = cards.slice(adminPage * PAGE_SIZE, adminPage * PAGE_SIZE + PAGE_SIZE);
    const disabled = new Set(config.disabledIds);
    const list = $('questionList');
    list.innerHTML = '';

    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No questions match your search.';
      list.appendChild(empty);
    }

    visible.forEach((card) => {
      const row = document.createElement('div');
      row.className = `question-row${disabled.has(card.id) ? ' disabled' : ''}`;

      const copy = document.createElement('div');
      copy.className = 'question-copy';
      const title = document.createElement('strong');
      title.textContent = card.q;
      const follow = document.createElement('p');
      follow.textContent = card.f || 'No follow-up question.';
      copy.append(title, follow);

      const actions = document.createElement('div');
      actions.className = 'row-actions';
      const edit = document.createElement('button');
      edit.className = 'small-button';
      edit.textContent = 'Edit';
      edit.onclick = () => selectForEdit(card.id);

      const toggle = document.createElement('button');
      toggle.className = disabled.has(card.id) ? 'small-button enable' : 'small-button disable';
      toggle.textContent = disabled.has(card.id) ? 'Enable' : 'Hide';
      toggle.onclick = () => toggleQuestion(card.id);
      actions.append(edit, toggle);

      if (card.custom) {
        const remove = document.createElement('button');
        remove.className = 'small-button delete';
        remove.textContent = 'Delete';
        remove.onclick = () => deleteCustom(card.id);
        actions.appendChild(remove);
      }

      row.append(copy, actions);
      list.appendChild(row);
    });

    $('pageLabel').textContent = `Page ${adminPage + 1} of ${totalPages}`;
    $('prevPage').disabled = adminPage === 0;
    $('nextPage').disabled = adminPage >= totalPages - 1;
    $('showDisabled').textContent = showDisabled ? 'Hide disabled' : 'Show all';
  }

  function exportBackup() {
    const payload = { app: 'Eryaman Speaking Club - One for Me One for You', version: 2, exportedAt: new Date().toISOString(), config };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eryaman-speaking-club-backup.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Backup exported.');
  }

  async function importBackup(file) {
    try {
      const parsed = JSON.parse(await file.text());
      config = normalizeConfig(parsed && parsed.config ? parsed.config : parsed);
      saveConfig();
      usedIds.clear();
      clearEditor();
      renderLibrary();
      resetQuestionCard();
      showToast('Backup imported on this device.');
    } catch {
      showToast('Invalid backup file.');
    }
  }

  function resetLocalChanges() {
    if (!confirm('Reset all edits, hidden questions and custom questions on this device?')) return;
    config = defaultConfig();
    localStorage.removeItem(STORAGE_KEY);
    usedIds.clear();
    clearEditor();
    adminPage = 0;
    renderLibrary();
    resetQuestionCard();
    showToast('Local changes reset.');
  }

  function init() {
    updateSoundButton();
    updateTurn();
    $('start').onclick = startGame;
    $('draw').onclick = drawCard;
    $('next').onclick = nextTurn;
    $('homeLogo').onclick = goHome;
    $('sound').onclick = toggleSound;
    $('admin').onclick = openAdmin;
    $('closeAdmin').onclick = closeAdmin;
    $('adminLoginButton').onclick = loginAdmin;
    $('adminLogout').onclick = logoutAdmin;
    $('addQuestion').onclick = addQuestion;
    $('saveEdit').onclick = saveSelectedEdit;
    $('clearEditor').onclick = clearEditor;
    $('exportBackup').onclick = exportBackup;
    $('resetLocal').onclick = resetLocalChanges;
    $('importBackup').onchange = (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) importBackup(file);
      event.target.value = '';
    };
    $('questionSearch').oninput = () => {
      adminPage = 0;
      renderLibrary();
    };
    $('showDisabled').onclick = () => {
      showDisabled = !showDisabled;
      adminPage = 0;
      renderLibrary();
    };
    $('prevPage').onclick = () => {
      playClick();
      adminPage = Math.max(0, adminPage - 1);
      renderLibrary();
    };
    $('nextPage').onclick = () => {
      playClick();
      adminPage += 1;
      renderLibrary();
    };
    $('adminPassword').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') loginAdmin();
    });
    $('adminPanel').addEventListener('click', (event) => {
      if (event.target === $('adminPanel')) closeAdmin();
    });
  }

  init();
})();
