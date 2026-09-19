(() => {
  'use strict';

  const ADMIN_HASH = 'c28440d7f9de5738eddf560c79371754e9ffa41fba2afd1efaa3da1458438a52';
  const STUDIO_SESSION = 'esc-studio-unlocked-v1';
  const GENERIC_SESSION = 'esc-admin-unlocked-v2';
  const TRUTH_SESSION = 'esc-truth-dare-admin-unlocked-v1';

  const games = [
    { n:'01', name:'Truth or Dare', path:'truth-or-dare', tone:'coral', desc:'Truth, Dare, oyuncu listeleri ve oyun ayarları.', key:'esc-truth-dare-v1' },
    { n:'02', name:'One for Me · One for You', path:'one-for-me-one-for-you', tone:'blue', desc:'Soru kütüphanesi, gizleme, düzenleme ve özel sorular.', key:'esc-local-admin-v2' },
    { n:'03', name:'Last Thing You Did', path:'last-thing-you-did', tone:'teal', desc:'Hikâye ve sohbet promptları.', generic:true },
    { n:'04', name:'What Would You Do If...?', path:'what-would-you-do-if', tone:'orange', desc:'Senaryo ve karar soruları.', generic:true },
    { n:'05', name:'Would You Rather?', path:'would-you-rather', tone:'violet', desc:'A/B seçenekleri ve kategoriler.', generic:true },
    { n:'06', name:'Most Likely To', path:'most-likely-to', tone:'coral', desc:'Grup oylama soruları.', generic:true },
    { n:'07', name:'Hot Seat', path:'hot-seat', tone:'orange', desc:'Hızlı soru kütüphanesi.', generic:true },
    { n:'08', name:'5 Second Challenge', path:'five-second-challenge', tone:'teal', desc:'5 saniyelik challenge listesi.', generic:true },
    { n:'09', name:'Red Flag / Green Flag', path:'red-flag-green-flag', tone:'teal', desc:'Durum kartları ve kategoriler.', generic:true },
    { n:'10', name:'Taboo', path:'taboo', tone:'coral', desc:'Ana kelimeler ve yasaklı kelimeler.', generic:true },
    { n:'11', name:'Debate Roulette', path:'debate-roulette', tone:'violet', desc:'Debate motion kütüphanesi.', generic:true },
    { n:'12', name:'Never Have I Ever', path:'never-have-i-ever', tone:'orange', desc:'Never Have I Ever ifadeleri.', generic:true }
  ];

  const $ = (id) => document.getElementById(id);
  let toastTimer = 0;

  const genericKey = (path) => 'esc-custom-content-v1:/' + path;

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function unlockSessions() {
    sessionStorage.setItem(STUDIO_SESSION, 'yes');
    sessionStorage.setItem(GENERIC_SESSION, 'yes');
    sessionStorage.setItem(TRUTH_SESSION, 'yes');
  }

  function clearSessions() {
    sessionStorage.removeItem(STUDIO_SESSION);
    sessionStorage.removeItem(GENERIC_SESSION);
    sessionStorage.removeItem(TRUTH_SESSION);
  }

  async function updateBackendStatus() {
    const status = $('backendStatus');
    const badge = $('backendBadge');
    if (!status || !badge) return;
    if (!window.ESCSupabase || !window.ESCSupabase.isConfigured()) {
      status.textContent = 'Backend kodu hazır. Supabase proje URL ve publishable/anon key bağlantısı bekleniyor.';
      badge.textContent = 'BEKLİYOR';
      return;
    }
    try {
      await window.ESCSupabase.getClient();
      status.textContent = 'Supabase istemcisi yapılandırıldı. Veritabanı şeması ve admin hesabı doğrulandıktan sonra merkezi senkronizasyon açılacak.';
      badge.textContent = 'BAĞLI';
    } catch (error) {
      status.textContent = 'Supabase ayarı bulundu ancak bağlantı kurulamadı.';
      badge.textContent = 'HATA';
    }
  }

  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
  }

  function hasLocalData(game) {
    const key = game.generic ? genericKey(game.path) : game.key;
    return Boolean(key && localStorage.getItem(key));
  }

  function renderGames() {
    const grid = $('gameGrid');
    grid.innerHTML = games.map((game) => {
      const saved = hasLocalData(game);
      return `<article class="game-card" data-tone="${game.tone}">
        <span class="game-number">${game.n} · ESC GAME</span>
        <h3>${game.name}</h3>
        <p>${game.desc}</p>
        <div class="status ${saved ? 'saved' : ''}"><i></i>${saved ? 'Bu tarayıcıda yerel veri var' : 'Varsayılan içerik'}</div>
        <div class="game-actions-row">
          <button type="button" class="manage-button" data-manage="${game.path}">Yönet →</button>
          <a class="open-button" href="../${game.path}/" target="_blank" aria-label="${game.name} oyununu aç">↗</a>
        </div>
      </article>`;
    }).join('');

    const count = games.filter(hasLocalData).length;
    $('customCount').textContent = String(count);

    grid.querySelectorAll('[data-manage]').forEach((button) => {
      button.addEventListener('click', () => manageGame(button.dataset.manage));
    });
  }

  function showDashboard() {
    $('loginView').hidden = true;
    $('dashboardView').hidden = false;
    renderGames();
    void updateBackendStatus();
  }

  function showLogin() {
    $('dashboardView').hidden = true;
    $('loginView').hidden = false;
    $('studioPassword').value = '';
    $('loginError').hidden = true;
    setTimeout(() => $('studioPassword').focus(), 30);
  }

  function manageGame(path) {
    unlockSessions();
    location.assign('../' + path + '/?studio=1');
  }

  function studioDataKeys() {
    const keys = new Set(['esc-local-admin-v2', 'esc-truth-dare-v1', 'esc-taboo-team-config-v1']);
    games.filter((game) => game.generic).forEach((game) => keys.add(genericKey(game.path)));
    return [...keys];
  }

  function exportAll() {
    const data = {};
    studioDataKeys().forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    });
    const payload = { app:'ESC Studio', version:1, exportedAt:new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'esc-studio-backup.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Studio yedeği indirildi.');
  }

  async function importAll(file) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || parsed.app !== 'ESC Studio' || !parsed.data || typeof parsed.data !== 'object') throw new Error('invalid');
      Object.entries(parsed.data).forEach(([key, value]) => {
        if (studioDataKeys().includes(key) && typeof value === 'string') localStorage.setItem(key, value);
      });
      renderGames();
      showToast('Studio yedeği yüklendi.');
    } catch {
      showToast('Geçerli bir ESC Studio yedeği değil.');
    }
  }

  async function login(event) {
    event.preventDefault();
    const entered = $('studioPassword').value;
    if (await sha256(entered) !== ADMIN_HASH) {
      $('loginError').hidden = false;
      return;
    }
    $('loginError').hidden = true;
    unlockSessions();
    const next = new URLSearchParams(location.search).get('next');
    if (next && games.some((game) => game.path === next)) {
      manageGame(next);
      return;
    }
    history.replaceState(null, '', './');
    showDashboard();
  }

  $('loginForm').addEventListener('submit', (event) => void login(event));
  $('logoutButton').addEventListener('click', () => { clearSessions(); showLogin(); });
  $('exportAll').addEventListener('click', exportAll);
  $('importAll').addEventListener('change', (event) => {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    if (file) void importAll(file);
    event.currentTarget.value = '';
  });

  if (sessionStorage.getItem(STUDIO_SESSION) === 'yes') {
    unlockSessions();
    const next = new URLSearchParams(location.search).get('next');
    if (next && games.some((game) => game.path === next)) manageGame(next);
    else showDashboard();
  } else {
    showLogin();
  }
})();