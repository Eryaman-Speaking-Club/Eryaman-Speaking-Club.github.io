/* ESC | Consent-aware analytics dashboard, November 2026 */
(() => {
  'use strict';
  const A = window.ESCAdmin;
  if (!A) return;
  const { $, $$, esc } = A;
  const number = n => Number(n || 0).toLocaleString('tr-TR');
  const clean = value => esc(String(value == null ? '' : value));
  const dateKey = value => new Date(value).toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
  const dateTime = value => new Date(value).toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });
  function ranked(events, keyFn) {
    const counts = new Map();
    for (const item of events) {
      const key = String(keyFn(item) || 'Bilinmiyor');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }
  function sourceName(raw) {
    const host = String(raw || '').toLowerCase().replace(/^www\./, '');
    if (!host) return 'Doğrudan / bilinmeyen';
    if (host === 'eryamanspeakingclub.com' || host === 'eryaman-speaking-club.github.io') return 'ESC site içi';
    if (host.includes('instagram.com')) return 'Instagram';
    if (host.includes('google.')) return 'Google';
    if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook';
    if (host.includes('tiktok.com')) return 'TikTok';
    return host.slice(0, 70);
  }
  function actionName(raw) {
    const labels = {
      registration: 'Katılım formu', in_person_registration: 'Yüz yüze katılım',
      online_registration: 'Online katılım', instagram: 'Instagram',
      games: 'Oyunlar', private_lessons: 'Özel dersler',
      educator_auth_open_signup: 'Eğitmen kaydı', educator_auth_open_login: 'Eğitmen girişi'
    };
    const key = String(raw || 'other');
    return labels[key] || key.replace(/_/g, ' ');
  }
  function screenName(width) {
    const n = Number(width);
    if (!n || n <= 0) return 'Ölçülemedi';
    if (n < 768) return 'Dar ekran (mobil benzeri)';
    if (n < 1024) return 'Orta ekran (tablet benzeri)';
    return 'Geniş ekran (masaüstü benzeri)';
  }
  function bars(items, emptyText) {
    if (!items.length) return '<p class="muted">' + clean(emptyText) + '</p>';
    const max = Math.max(1, ...items.map(item => item[1]));
    return '<div class="analytics-chart esc-analytics-bars">' + items.map(([label, value]) =>
      '<div class="bar-row"><b title="' + clean(label) + '">' + clean(label) + '</b>' +
      '<i aria-hidden="true"><span style="--w:' + Math.round(value / max * 100) + '%"></span></i>' +
      '<em>' + number(value) + '</em></div>'
    ).join('') + '</div>';
  }
  async function dashboard(requestedDays = 30) {
    const days = [7, 30, 90].includes(Number(requestedDays)) ? Number(requestedDays) : 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const events = [];
    const batchSize = 1000;
    const maxBatches = 25;
    let isCapped = false;
    for (let batch = 0; batch < maxBatches; batch++) {
      const { data, error } = await A.state.db.from('site_analytics')
        .select('id,created_at,event_name,page_path,target,mode,session_id,referrer_host,viewport_width')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(batch * batchSize, (batch + 1) * batchSize - 1);
      if (error) throw error;
      events.push(...(data || []));
      if (!data || data.length < batchSize) break;
      if (batch === maxBatches - 1) isCapped = true;
    }

    const views = events.filter(row => row.event_name === 'page_view');
    const clicks = events.filter(row => row.event_name === 'cta_click');
    const scroll50 = events.filter(row => row.event_name === 'scroll_50');
    const scroll90 = events.filter(row => row.event_name === 'scroll_90');
    const sessions = new Set(views.map(row => row.session_id).filter(Boolean));
    const pages = ranked(views, row => row.page_path || '/').slice(0, 12);
    const sources = ranked(views, row => sourceName(row.referrer_host)).slice(0, 10);
    const screens = ranked(views, row => screenName(row.viewport_width));
    const actions = ranked(clicks, row => actionName(row.target || row.mode)).slice(0, 10);
    const chartDays = days === 7 ? 7 : 14;
    const byDate = new Map(ranked(views, row => dateKey(row.created_at)));
    const dates = [];
    for (let back = chartDays - 1; back >= 0; back--) {
      const key = dateKey(Date.now() - back * 86400000);
      dates.push([key, byDate.get(key) || 0]);
    }
    const maxDaily = Math.max(1, ...dates.map(item => item[1]));
    const dailyChart = '<div class="esc-analytics-trend" role="group" aria-label="Günlük sayfa görüntüleme">' +
      dates.map(([day, total]) =>
        '<div class="esc-analytics-trend-day" title="' + clean(day) + ': ' + number(total) + ' görüntüleme">' +
        '<span class="esc-analytics-trend-number">' + number(total) + '</span>' +
        '<div class="esc-analytics-trend-track"><i style="height:' + (total ? Math.max(4, Math.round(total / maxDaily * 100)) : 0) + '%"></i></div>' +
        '<span class="esc-analytics-trend-date">' + clean(day.slice(8) + '/' + day.slice(5, 7)) + '</span>' +
        '</div>'
      ).join('') + '</div>';

    const kpis = [
      ['Sayfa görüntüleme', views.length, 'Toplam sayfa açılma olayı'],
      ['Farklı oturum', sessions.size, 'Tekil kişi sayısı değildir'],
      ['Bağlantı tıklaması', clicks.length, 'Form, oyun, Instagram vb.'],
      ['%90 kaydırma', scroll90.length, 'Sayfa sonuna yakın kaydırma']
    ];
    const eventLabels = {
      page_view: 'Sayfa açıldı', cta_click: 'Bağlantıya tıklandı',
      scroll_50: '%50 kaydırıldı', scroll_90: '%90 kaydırıldı'
    };
    const recent = events.slice(0, 10);
    const recentRows = recent.map(row =>
      '<tr><td>' + clean(dateTime(row.created_at)) + '</td>' +
      '<td>' + clean(eventLabels[row.event_name] || row.event_name) + '</td>' +
      '<td><code>' + clean(row.page_path || '/') + '</code></td>' +
      '<td>' + clean(row.target ? actionName(row.target) : '—') + '</td>' +
      '<td>' + clean(sourceName(row.referrer_host)) + '</td></tr>'
    ).join('');
    const buttons = [7, 30, 90].map(value =>
      '<button type="button" data-analytics-period="' + value + '" class="btn ' +
      (value === days ? 'primary' : 'secondary') + '" aria-pressed="' +
      String(value === days) + '">Son ' + value + ' gün</button>'
    ).join('');

    $('#panel').innerHTML =
      '<div class="esc-analytics-toolbar"><div><span class="pill live">İZİNLİ ZİYARET ANALİZİ</span>' +
      '<h2>Ziyaretçi davranışları</h2>' +
      '<p class="muted">ESC sitesi · Anlık veritabanı sorgusu · İstanbul saat dilimi</p></div>' +
      '<div class="esc-analytics-filters" role="group" aria-label="İstatistik dönemi">' + buttons + '</div></div>' +
      '<div class="stats esc-analytics-stats">' + kpis.map(([label, value, note]) =>
        '<article class="stat"><span>' + clean(label) + '</span><strong>' +
        number(value) + '</strong><small>' + clean(note) + '</small></article>'
      ).join('') + '</div>' +
      (isCapped ? '<div class="notice warning">Bu dönemde 25.000 olay sınırına ulaşıldı. Toplamlar eksik olabilir.</div>' : '') +
      '<div class="esc-analytics-grid">' +
        '<section class="card"><div class="card-head"><div><h2>Günlük trafik</h2>' +
        '<p class="muted">Son ' + chartDays + ' gün · sayfa görüntüleme</p></div></div>' + dailyChart + '</section>' +
        '<section class="card"><div class="card-head"><div><h2>En çok ziyaret edilen sayfalar</h2>' +
        '<p class="muted">Seçilen ' + days + ' günlük dönem</p></div></div>' +
        bars(pages, 'Bu dönemde sayfa kaydı yok.') + '</section>' +
        '<section class="card"><div class="card-head"><div><h2>Trafik kaynakları</h2>' +
        '<p class="muted">Yönlendiren siteye göre sayfa görüntülemeleri</p></div></div>' +
        bars(sources, 'Yönlendirme kaydı bulunamadı.') + '</section>' +
        '<section class="card"><div class="card-head"><div><h2>İlgilenilen bağlantılar</h2>' +
        '<p class="muted">Tıklama kaydı; tamamlanmış kayıt veya satış değildir</p></div></div>' +
        bars(actions, 'Bu dönemde takip edilen tıklama yok.') + '</section>' +
        '<section class="card"><div class="card-head"><div><h2>Ekran genişliği</h2>' +
        '<p class="muted">Tarayıcı genişliğine dayalı tahmin, kesin cihaz türü değildir</p></div></div>' +
        bars(screens, 'Ekran bilgisi kaydı yok.') + '</section>' +
        '<section class="card"><div class="card-head"><div><h2>İçerikle etkileşim</h2>' +
        '<p class="muted">Sayfada belirli kaydırma seviyesine ulaşan olaylar</p></div></div>' +
        bars([['%50 kaydırma', scroll50.length], ['%90 kaydırma', scroll90.length]], 'Kaydırma yok.') +
        '<p class="esc-analytics-small">Kaydırma sayıları kişi sayısını göstermez.</p></section>' +
      '</div>' +
      '<section class="card"><div class="card-head"><div><h2>Son 10 anonim olay</h2>' +
      '<p class="muted">Bir kayıt örneği: zaman, işlem, sayfa, bağlantı, trafik kaynağı</p></div></div>' +
      (recent.length ? '<div class="table-wrap"><table><thead><tr><th>İşlem zamanı</th><th>Olay</th>' +
      '<th>Sayfa</th><th>Hedef</th><th>Kaynak</th></tr></thead><tbody>' + recentRows +
      '</tbody></table></div>' : '<p class="muted">Kayıt bulunamadı.</p>') + '</section>' +
      '<section class="card esc-analytics-privacy"><h2>Bu rapor neyi göstermez?</h2>' +
      '<p>Site analizine izin veren tarayıcılardan olay bilgisi gönderilir. Bu tabloya ad, soyad, e-posta, ' +
      'telefon numarası veya IP alanı yazılmaz. Oturum kimliği kişiyi tanımlamaz; farklı oturumlar aynı kişiye ait olabilir.</p>' +
      '<p><strong>Çerez kabul / ret sayıları:</strong> Tercihler tarayıcıda tutuluyor; bugün için kabul ve ret toplamları veritabanında sayılmıyor.</p>' +
      '<p><strong>Meta Pixel:</strong> Pazarlama izni verilirse Meta tarafına PageView gönderiliyor. ' +
      'Meta raporları bu Supabase panelinden ayrı incelenir.</p>' +
      '<p><strong>Form tıklamaları:</strong> Katılım bağlantısına tıklamak, formu doldurmak veya buluşmaya kayıt olmak anlamına gelmez.</p>' +
      '</section>';
    $$('#panel [data-analytics-period]').forEach(button => button.addEventListener('click', async () => {
      const value = Number(button.dataset.analyticsPeriod);
      if (value === days) return;
      $('#panel').innerHTML = '<div class="card"><div class="empty">İstatistikler yükleniyor…</div></div>';
      try { await dashboard(value); }
      catch (err) {
        console.error(err);
        $('#panel').innerHTML = '<div class="card"><p class="danger-text">' + clean(err.message || err) + '</p></div>';
      }
    }));
  }
  // Override only the legacy read-only analytics view; leave all other admin features untouched.
  A.register('analytics', dashboard);
})();
