(() => {
  'use strict';

  const GENERIC_SESSION = 'esc-admin-unlocked-v2';
  const TRUTH_SESSION = 'esc-truth-dare-admin-unlocked-v1';
  const PENDING_BOOTSTRAP = 'esc-pending-bootstrap-code-v1';

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

  function unlockLegacySessions() {
    sessionStorage.setItem(GENERIC_SESSION, 'yes');
    sessionStorage.setItem(TRUTH_SESSION, 'yes');
  }

  function clearLegacySessions() {
    sessionStorage.removeItem(GENERIC_SESSION);
    sessionStorage.removeItem(TRUTH_SESSION);
  }

  async function updateBackendStatus() {
    const status = $('backendStatus');
    const badge = $('backendBadge');
    if (!status || !badge) return;
    if (!window.ESCSupabase || !window.ESCSupabase.isConfigured()) {
      status.textContent = 'Supabase yapılandırması bulunamadı.';
      badge.textContent = 'BEKLİYOR';
      return;
    }
    try {
      const health = await window.ESCSupabase.ping();
      if (!health.database) {
        status.textContent = 'Supabase bağlantısı var ancak ESC veritabanı şeması erişilemiyor.';
        badge.textContent = 'HATA';
        return;
      }
      const admin = await window.ESCSupabase.isAdmin().catch(() => false);
      status.textContent = admin
        ? 'Supabase veritabanı ve admin oturumu aktif. Merkezi oyun yönetimi hazır.'
        : 'Supabase veritabanı hazır; admin oturumu bekleniyor.';
      badge.textContent = admin ? 'BAĞLI' : 'AUTH';
    } catch (error) {
      status.textContent = 'Supabase bağlantısı doğrulanamadı.';
      badge.textContent = 'HATA';
    }
  }

  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
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
        <div class="status saved"><i></i>Supabase merkezi içerik</div>
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
    unlockLegacySessions();
    renderGames();
    void updateBackendStatus();
  }

  function showLogin() {
    $('dashboardView').hidden = true;
    $('loginView').hidden = false;
    $('studioPassword').value = '';
    $('loginError').hidden = true;
    setTimeout(() => $('studioEmail').focus(), 30);
  }

  function manageGame(path) {
    unlockLegacySessions();
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
    const payload = { app:'ESC Studio', version:2, exportedAt:new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'esc-studio-local-backup.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Yerel fallback yedeği indirildi.');
  }

  async function importAll(file) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || parsed.app !== 'ESC Studio' || !parsed.data || typeof parsed.data !== 'object') throw new Error('invalid');
      Object.entries(parsed.data).forEach(([key, value]) => {
        if (studioDataKeys().includes(key) && typeof value === 'string') localStorage.setItem(key, value);
      });
      renderGames();
      showToast('Yerel fallback yedeği yüklendi.');
    } catch {
      showToast('Geçerli bir ESC Studio yedeği değil.');
    }
  }

  async function claimPendingIfNeeded() {
    const pending = localStorage.getItem(PENDING_BOOTSTRAP);
    if (!pending) return false;
    if (await window.ESCSupabase.isAdmin()) {
      localStorage.removeItem(PENDING_BOOTSTRAP);
      return true;
    }
    try {
      const claimed = await window.ESCSupabase.claimFirstAdmin(pending);
      if (claimed) localStorage.removeItem(PENDING_BOOTSTRAP);
      return claimed;
    } catch {
      return false;
    }
  }

  async function login(event) {
    event.preventDefault();
    const email = $('studioEmail').value.trim();
    const password = $('studioPassword').value;
    const error = $('loginError');
    error.hidden = true;
    try {
      await window.ESCSupabase.signIn(email, password);
      let admin = await window.ESCSupabase.isAdmin();
      if (!admin) {
        await claimPendingIfNeeded();
        admin = await window.ESCSupabase.isAdmin();
      }
      if (!admin) throw new Error('Bu kullanıcı ESC admin listesinde değil.');
      const next = new URLSearchParams(location.search).get('next');
      history.replaceState(null, '', './');
      if (next && games.some((game) => game.path === next)) manageGame(next);
      else showDashboard();
    } catch (e) {
      error.textContent = e && e.message ? e.message : 'Giriş yapılamadı.';
      error.hidden = false;
    }
  }

  async function setup(event) {
    event.preventDefault();
    const email = $('setupEmail').value.trim();
    const password = $('setupPassword').value;
    const code = $('setupCode').value.trim();
    const message = $('setupMessage');
    message.hidden = false;
    try {
      localStorage.setItem(PENDING_BOOTSTRAP, code);
      const result = await window.ESCSupabase.signUp(email, password);
      if (result && result.session) {
        const claimed = await claimPendingIfNeeded();
        if (!claimed) throw new Error('Admin yetkisi alınamadı.');
        message.textContent = 'İlk admin hesabı oluşturuldu.';
        $('studioEmail').value = email;
        showDashboard();
      } else {
        message.textContent = 'Hesap oluşturuldu. Supabase doğrulama e-postasını onayla; sonra yukarıdaki giriş formundan giriş yap. Kurulum kodu bu tarayıcıda geçici olarak saklandı.';
      }
    } catch (e) {
      message.textContent = e && e.message ? e.message : 'İlk admin kurulumu tamamlanamadı.';
    }
  }

  async function logout() {
    try { await window.ESCSupabase.signOut(); } catch {}
    clearLegacySessions();
    showLogin();
  }

  async function init() {
    if (!window.ESCSupabase || !window.ESCSupabase.isConfigured()) {
      $('loginError').textContent = 'Supabase bağlantısı yapılandırılmamış.';
      $('loginError').hidden = false;
      return;
    }
    try {
      const session = await window.ESCSupabase.getSession();
      if (session) {
        let admin = await window.ESCSupabase.isAdmin();
        if (!admin) {
          await claimPendingIfNeeded();
          admin = await window.ESCSupabase.isAdmin();
        }
        if (admin) {
          const next = new URLSearchParams(location.search).get('next');
          if (next && games.some((game) => game.path === next)) manageGame(next);
          else showDashboard();
          return;
        }
      }
    } catch {}
    showLogin();
  }

  $('loginForm').addEventListener('submit', (event) => void login(event));
  $('setupForm').addEventListener('submit', (event) => void setup(event));
  $('logoutButton').addEventListener('click', () => void logout());
  $('exportAll').addEventListener('click', exportAll);
  $('importAll').addEventListener('change', (event) => {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    if (file) void importAll(file);
    event.currentTarget.value = '';
  });

  void init();
})();