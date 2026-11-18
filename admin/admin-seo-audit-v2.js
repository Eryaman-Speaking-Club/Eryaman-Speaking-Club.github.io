(() => {
  'use strict';
  const A = window.ESCAdmin;
  if (!A) return;
  const SITE = 'https://eryamanspeakingclub.com';
  const { $, esc, toast, openModal } = A;
  let scanToken = 0;
  let lastReport = null;

  const tidy = value => String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  const validHttps = value => /^https:\/\/[^/\s]+/i.test(String(value || ''));
  const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
  const severityText = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Öneri' };
  const toPath = value => {
    try {
      const u = new URL(String(value || '/'), SITE);
      if (u.origin !== SITE) return null;
      let path = u.pathname.replace(/\/index\.html$/i, '/');
      if (!/\.[a-z0-9]+$/i.test(path) && !path.endsWith('/')) path += '/';
      return path;
    } catch (_) { return null; }
  };
  const siteUrl = path => SITE + (toPath(path) || '/');

  function cleanText(node) {
    if (!node) return '';
    const copy = node.cloneNode(true);
    copy.querySelectorAll('script,style,noscript,template,nav,footer,[hidden],[aria-hidden="true"]').forEach(el => el.remove());
    return tidy(copy.textContent);
  }

  function readMeta(doc, selector) {
    return tidy(doc.querySelector(selector)?.getAttribute('content'));
  }

  function schemaSummary(doc) {
    let valid = 0, invalid = 0;
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const value = JSON.parse(script.textContent || 'null');
        const items = Array.isArray(value) ? value : [value];
        const typed = items.some(item => item && typeof item === 'object' &&
          (item['@type'] || (Array.isArray(item['@graph']) && item['@graph'].some(x => x && x['@type']))));
        if (typed) valid++;
        else invalid++;
      } catch (_) { invalid++; }
    });
    return { valid, invalid };
  }

  function auditHtml(page, html, headerRobots) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const title = tidy(doc.title);
    const description = readMeta(doc, 'meta[name="description"]');
    const canonical = tidy(doc.querySelector('link[rel="canonical"]')?.getAttribute('href'));
    const canonicalOk = validHttps(canonical) && toPath(canonical) === toPath(page.path);
    const alternateCanonical = validHttps(canonical) && toPath(canonical) !== toPath(page.path);
    const robots = [readMeta(doc, 'meta[name="robots"]'), readMeta(doc, 'meta[name="googlebot"]'), tidy(headerRobots)].join(', ');
    const htmlNoindex = /\bnoindex\b/i.test(robots);
    const cmsSeo = page.published_seo || {};
    const cmsNoindex = cmsSeo.indexable === false;
    const indexable = !htmlNoindex && !cmsNoindex;
    const deliberatelyExcluded = htmlNoindex && (alternateCanonical || toPath(page.path) === '/join/');
    const root = doc.querySelector('main') || doc.body;
    const mainText = cleanText(root);
    const bodyText = cleanText(doc.body);
    const h1Elements = [...doc.querySelectorAll('h1')].filter(el => tidy(el.textContent));
    const h1 = tidy(h1Elements[0]?.textContent);
    const intro = [...(root?.querySelectorAll('p') || [])]
      .map(p => tidy(p.textContent)).find(text => text.length >= 35) || '';
    const schema = schemaSummary(doc);
    const ogTitle = readMeta(doc, 'meta[property="og:title"]');
    const ogDescription = readMeta(doc, 'meta[property="og:description"]');
    const ogImage = readMeta(doc, 'meta[property="og:image"]');
    const issues = [];
    const scores = { seo: 0, geo: 0 };
    const check = (kind, ok, points, label, fix, severity) => {
      if (ok) scores[kind] += points;
      else issues.push({ kind: kind.toUpperCase(), severity, label, fix });
    };

    check('seo', title.length >= 20, 18, 'HTML title eksik veya çok kısa', 'Her sayfanın ilk HTML yanıtında özgün ve açıklayıcı bir title kullan.', 'high');
    check('seo', description.length >= 50, 18, 'Meta açıklama eksik veya çok kısa', 'İlk HTML yanıtına sayfayı özgün şekilde özetleyen bir meta description ekle.', 'high');
    check('seo', canonicalOk || deliberatelyExcluded, 20, 'Canonical adres uyuşmuyor', 'HTTPS canonical adresini bu sayfanın gerçek, indekslenebilir URL adresiyle eşleştir.', 'high');
    check('seo', !!ogTitle && !!ogDescription, 10, 'Sosyal paylaşım başlığı/açıklaması eksik', 'Open Graph başlık ve açıklamasını görünür sayfa içeriğiyle uyumlu ekle.', 'medium');
    check('seo', validHttps(ogImage), 8, 'Open Graph görseli eksik', 'Herkese açık HTTPS adresinde, sayfayla ilgili bir paylaşım görseli kullan.', 'low');
    check('seo', h1Elements.length === 1, 10, 'H1 sayısı uygun değil', 'Sayfanın ana konusunu anlatan tek bir H1 başlığı kullan.', 'high');
    check('seo', indexable || deliberatelyExcluded, 10, 'Noindex sinyali tespit edildi', 'Bu sayfa aramada görünmeli ise ilk HTML ve CMS robots ayarını kontrol et.', 'critical');
    check('seo', html.length > 100 && !!doc.body, 6, 'HTML içeriği yetersiz', 'Sayfa ilk yanıtının gerçek HTML içerdiğinden emin ol.', 'high');

    check('geo', !!h1, 15, 'Ana konu başlığı eksik', 'İçeriğin ana sorusunu H1 ile açıkça belirt.', 'high');
    check('geo', intro.length >= 50 && intro.length <= 600, 25, 'İlk bölümde açıklayıcı paragraf yetersiz', 'İlk bölümde sayfanın ne sunduğunu 1-3 doğal cümleyle doğrudan açıkla.', 'medium');
    check('geo', mainText.length >= 180, 15, 'Taranabilir açıklayıcı metin az', 'Görünür HTML içinde özgün, doğrulanabilir açıklama ve kullanım bilgisi ekle.', 'medium');
    check('geo', /Eryaman Speaking Club/i.test(bodyText), 15, 'Marka adı görünür metinde bulunamadı', 'Sayfanın kullanıcıya görünen içeriğinde Eryaman Speaking Club kimliğini açık kullan.', 'medium');
    check('geo', title.length >= 20 && description.length >= 50, 10, 'Sayfanın başlık/açıklama bağlamı zayıf', 'Sayfa başlığı ve özetini belirgin konu ve arama niyetiyle uyumlu yaz.', 'medium');
    check('geo', canonicalOk || deliberatelyExcluded, 10, 'Kaynak URL net değil', 'Bu sayfanın doğru HTTPS canonical adresini ilk HTML içine koy.', 'high');
    check('geo', !!root?.querySelector('h2, h3, a[href]'), 5, 'İçerik başlıkları veya iç bağlantılar eksik', 'İlgili alt başlık ve doğal iç bağlantılar kullan.', 'low');
    check('geo', schema.valid > 0, 5, 'Yapılandırılmış veri bulunamadı (isteğe bağlı)', 'Yalnız sayfaya ve görünür içeriğe uygun Schema.org JSON-LD varsa ekle; her sayfada zorunlu değil.', 'low');

    if (schema.invalid > 0) issues.push({
      kind: 'SCHEMA', severity: 'high', label: 'Geçersiz veya türü eksik JSON-LD',
      fix: 'JSON-LD sözdizimini, @type ve sayfaya uygun özellikleri kontrol et. Google Rich Results Test ile doğrula.'
    });
    const cmsChecks = [
      ['title', title, 'title'],
      ['description', description, 'meta description'],
      ['canonical', canonical, 'canonical']
    ];
    cmsChecks.forEach(([key, actual, label]) => {
      if (tidy(cmsSeo[key]) && tidy(cmsSeo[key]) !== actual) issues.push({
        kind: 'HTML/CMS', severity: 'high',
        label: 'CMS ' + label + ' ile ilk HTML farklı',
        fix: 'Yönetim panelindeki yayınlanan ' + label + ' değeri ilk HTML kaynağına da yansıtılmalı; yalnız tarayıcı JS güncellemesi yeterli olmayabilir.'
      });
    });
    if (cmsNoindex && !htmlNoindex) issues.push({
      kind: 'HTML/CMS', severity: 'critical', label: 'CMS noindex, ilk HTML içinde yok',
      fix: 'Gerçek robots meta veya X-Robots-Tag yanıtını CMS isteğiyle uyumlu hale getir.'
    });

    return {
      page, title, description, canonical, robots, h1, intro, schema, indexable,
      htmlNoindex, deliberatelyExcluded, scores, issues, status: 200, error: '', sitemap: null
    };
  }

  function failedAudit(page, message) {
    return {
      page, title: '', description: '', canonical: '', robots: '', h1: '', intro: '',
      schema: { valid: 0, invalid: 0 }, indexable: false, scores: { seo: 0, geo: 0 },
      issues: [{ kind: 'ERİŞİM', severity: 'critical', label: 'Sayfa taranamadı',
        fix: 'HTTP hatası, URL veya bağlantıyı kontrol et: ' + message }],
      status: 0, error: message, sitemap: null
    };
  }

  async function auditPage(page) {
    const path = toPath(page.path);
    if (!path) return failedAudit(page, 'Güvensiz veya geçersiz sayfa yolu');
    try {
      const res = await fetch(path + (path.includes('?') ? '&' : '?') + 'seo_audit=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      if (!/text\/html/i.test(res.headers.get('content-type') || '')) throw new Error('Yanıt HTML değil');
      const html = await res.text();
      const result = auditHtml(page, html, res.headers.get('x-robots-tag') || '');
      result.status = res.status;
      return result;
    } catch (error) {
      return failedAudit(page, error && error.message ? error.message : 'Bağlantı hatası');
    }
  }

  async function globalStatus() {
    const key = 'c9487a4d6e0b4fdca1e8f7d93b6a21c5';
    const get = async path => {
      try {
        const res = await fetch(path + '?seo_audit=' + Date.now(), { cache: 'no-store' });
        return res.ok ? await res.text() : '';
      } catch (_) { return ''; }
    };
    const [robots, sitemapXml, llms, keyFile] = await Promise.all([
      get('/robots.txt'), get('/sitemap.xml'), get('/llms.txt'), get('/' + key + '.txt')
    ]);
    const oaiBlock = robots.split(/(?=^user-agent:)/im).find(block => /^user-agent:\s*OAI-SearchBot/im.test(block)) || '';
    const oai = !!oaiBlock && /^allow:\s*\/\s*$/im.test(oaiBlock) && !/^disallow:\s*\/\s*$/im.test(oaiBlock);
    const sitemapPaths = new Set();
    if (sitemapXml.includes('<urlset') || sitemapXml.includes('<sitemapindex')) {
      const doc = new DOMParser().parseFromString(sitemapXml, 'application/xml');
      if (!doc.querySelector('parsererror')) {
        [...doc.getElementsByTagNameNS('*', 'loc')].forEach(el => {
          const path = toPath(tidy(el.textContent));
          if (path) sitemapPaths.add(path);
        });
      }
    }
    return {
      oai, sitemapOk: sitemapPaths.size > 0, sitemapPaths,
      llms: /^#\s*Eryaman Speaking Club/im.test(llms),
      indexNowKey: keyFile.trim() === key
    };
  }

  function appendSitemapIssues(reports, global) {
    if (!global.sitemapOk) return;
    reports.forEach(report => {
      if (report.error || !report.indexable) return;
      report.sitemap = global.sitemapPaths.has(toPath(report.page.path));
      if (!report.sitemap) report.issues.push({
        kind: 'SITEMAP', severity: 'medium', label: 'Sitemap içinde bulunamadı',
        fix: 'İndekslenebilir ve herkese açık bu sayfayı sitemap.xml dosyasına canonical URL ile ekle.'
      });
    });
  }

  function importance(report) {
    return report.issues.reduce((n, issue) => Math.max(n, severityRank[issue.severity] || 0), 0);
  }
  const problemCount = report => report.issues.filter(issue => issue.severity !== 'low').length;
  const scorePill = score => '<span class="pill ' + (score >= 90 ? 'live' : score >= 70 ? 'published' : 'draft') + '">' + score + '/100</span>';

  function openEditor(id) {
    A.state.currentView = 'siteEditor';
    try { window.history.replaceState(null, '', '#siteEditor'); } catch (_) {}
    A.$$('#nav button').forEach(el => el.classList.toggle('active', el.dataset.view === 'siteEditor'));
    $('#viewTitle').textContent = 'Canlı Site Editörü';
    if (typeof A.openSeoEditor === 'function') A.openSeoEditor(id);
    else A.go('siteEditor');
  }

  function showDetails(report) {
    const items = report.issues.slice().sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));
    openModal(
      '<h2>SEO & GEO · ' + esc(report.page.name) + '</h2>' +
      '<p class="muted">' + esc(report.page.path) + ' · Teknik SEO ' + report.scores.seo + '/100 · GEO hazırlık ' + report.scores.geo + '/100</p>' +
      '<p class="seo-v2-note">Bu sonuç ilk HTML yanıtına dayanır. Gerçek indeksleme ve arama performansı için Google Search Console gerekir.</p>' +
      (items.length ? '<div class="seo-v2-issue-list">' + items.map(issue =>
        '<div class="seo-v2-issue"><span class="pill ' + (issue.severity === 'critical' || issue.severity === 'high' ? 'draft' : 'published') + '">' +
        esc(severityText[issue.severity] || 'Kontrol') + '</span><div><strong>' + esc(issue.label) + '</strong>' +
        '<small>' + esc(issue.kind) + ' · ' + esc(issue.fix) + '</small></div></div>'
      ).join('') + '</div>' : '<div class="notice">Bu otomatik taramada önemli eksik görünmüyor.</div>') +
      '<div class="row-actions seo-v2-modal-actions">' + (report.page.external ? '' : '<button class="btn primary" id="seoV2Edit">Sayfayı düzenle</button>') +
      '<a class="icon-btn" href="' + esc(siteUrl(report.page.path)) + '" target="_blank" rel="noopener">Sayfayı aç</a></div>'
    );
    if ($('#seoV2Edit')) $('#seoV2Edit').onclick = () => { A.closeModal(); openEditor(report.page.id); };
  }

  function exportCsv(reports) {
    const headings = ['Sayfa', 'URL', 'Teknik SEO', 'GEO hazırlık', 'İndekslemeye açık', 'Sitemap', 'Durum', 'Eksikler'];
    const rows = reports.map(r => [
      r.page.name, siteUrl(r.page.path), r.scores.seo, r.scores.geo,
      r.indexable ? 'Evet' : 'Hayır', r.sitemap === null ? 'Bilinmiyor' : r.sitemap ? 'Evet' : 'Hayır',
      r.error || 'Taranabildi', r.issues.map(i => severityText[i.severity] + ': ' + i.label).join('; ')
    ]);
    const csv = '\uFEFF' + [headings, ...rows].map(fields =>
      fields.map(value => '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"').join(',')
    ).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'eryaman-seo-geo-denetim.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function statusCard(ok, title, description, optional) {
    return '<div class="geo-status ' + (ok ? 'ok' : optional ? '' : 'warn') + '">' +
      '<span>' + (ok ? '✓' : optional ? 'i' : '!') + '</span><div><strong>' + esc(title) +
      '</strong><small>' + esc(description) + '</small></div></div>';
  }

  function renderReport(reports, global) {
    const root = $('#seoV2Root');
    if (!root) return;
    lastReport = reports;
    const available = reports.filter(r => !r.error);
    const publicPages = available.filter(r => r.indexable);
    const average = kind => publicPages.length ? Math.round(publicPages.reduce((sum, r) => sum + r.scores[kind], 0) / publicPages.length) : 0;
    const priority = reports.filter(r => !r.deliberatelyExcluded && importance(r) >= 3).length;
    const indexable = available.filter(r => r.indexable).length;
    const blocked = available.length - indexable;
    const missingSitemap = reports.filter(r => r.indexable && r.sitemap === false).length;
    const failed = reports.length - available.length;
    root.innerHTML =
      '<div class="geo-explainer"><div><span class="pill live">SEO + GEO</span><h3>Arama görünürlüğü · teknik denetim</h3>' +
      '<p>Bu araç ilk HTML kaynağını ve teknik/içerik sinyallerini denetler. Puanlar Google sıralamasını, indeks sayısını veya AI tarafından önerilmeyi ölçmez.</p></div>' +
      '<div class="row-actions"><a class="icon-btn" href="https://search.google.com/search-console" target="_blank" rel="noopener">Search Console</a>' +
      '<a class="icon-btn" href="/sitemap.xml" target="_blank" rel="noopener">Sitemap</a></div></div>' +
      '<div class="geo-global-grid">' +
        statusCard(global.oai, 'ChatGPT Search tarama izni', global.oai ? 'OAI-SearchBot için açık; görünürlük garantisi değil' : 'robots.txt erişimini kontrol et') +
        statusCard(global.sitemapOk, 'XML Sitemap', global.sitemapOk ? global.sitemapPaths.size + ' URL listelendi; ' + missingSitemap + ' CMS sayfası eksik' : 'Sitemap okunamadı') +
        statusCard(global.indexNowKey, 'IndexNow anahtarı', global.indexNowKey ? 'Anahtar erişilebilir; gönderim/indeksleme sonucu doğrulanmadı' : 'Anahtar dosyası doğrulanamadı') +
        statusCard(global.llms, 'llms.txt (isteğe bağlı)', global.llms ? 'Dosya mevcut; resmi sıralama faktörü değil' : 'İsteğe bağlı dosya bulunamadı', true) +
      '</div>' +
      '<div class="stats seo-audit-stats">' +
        '<div class="stat"><span>TEKNİK SEO · TAHMİNİ</span><strong>' + average('seo') + '/100</strong><small>' + available.length + ' sayfa yanıt verdi</small></div>' +
        '<div class="stat"><span>GEO HAZIRLIK · TAHMİNİ</span><strong>' + average('geo') + '/100</strong><small>AI arama performans verisi değil</small></div>' +
        '<div class="stat"><span>ÖNCELİKLİ SORUNLU SAYFA</span><strong>' + priority + '</strong><small>' + failed + ' tarama hatası · ' + missingSitemap + ' sitemap eksiği</small></div>' +
        '<div class="stat"><span>İNDEKSLENEBİLİR / NOINDEX</span><strong>' + indexable + ' / ' + blocked + '</strong><small>Google indeksine alınmış demek değil</small></div>' +
      '</div>' +
      '<p class="seo-v2-note"><strong>Önemli:</strong> CMS üzerinde yapılan SEO değişikliği ilk HTML yanıtına yansımamışsa botlar farklı veriyi görebilir. ' +
      'Gerçek indeks kapsamı, tıklama ve gösterim verilerini Search Console üzerinden doğrulayın.</p>' +
      '<div class="seo-audit-tools"><div class="row-actions">' +
        '<label>Filtrele<select id="seoV2Filter"><option value="all">Tüm sayfalar</option><option value="priority">Kritik / yüksek</option>' +
        '<option value="needs">İyileştirilecek</option><option value="failed">Tarama hatası</option><option value="sitemap">Sitemap eksik</option>' +
        '<option value="noindex">Noindex</option><option value="game">Oyun sayfaları</option></select></label>' +
        '<button class="btn secondary" id="seoV2Export" type="button">CSV raporu indir</button></div>' +
        '<label>Sayfa ara<input id="seoV2Search" type="search" placeholder="Sayfa adı veya URL..."></label></div>' +
      '<div class="table-wrap"><table class="seo-v2-table"><thead><tr><th>Sayfa</th><th>Teknik SEO</th><th>GEO hazırlık</th>' +
      '<th>İndeksleme izni</th><th>Sitemap</th><th>Öncelikli eksik</th><th>İşlem</th></tr></thead><tbody id="seoV2Rows"></tbody></table></div>' +
      '<p class="seo-v2-footnote">Son tarama: ' + esc(new Date().toLocaleString('tr-TR')) + ' · Yalnız kaynak HTML kontrol edildi. ' +
      'Google Search Console ve Rich Results Test doğrulaması ayrıca gereklidir.</p>';

    const draw = () => {
      if (!$('#seoV2Rows')) return;
      const filter = $('#seoV2Filter').value;
      const search = tidy($('#seoV2Search').value).toLocaleLowerCase('tr-TR');
      const selected = reports.filter(r => {
        if (search && !(r.page.name + ' ' + r.page.path).toLocaleLowerCase('tr-TR').includes(search)) return false;
        if (filter === 'priority' && importance(r) < 3) return false;
        if (filter === 'needs' && problemCount(r) === 0) return false;
        if (filter === 'failed' && !r.error) return false;
        if (filter === 'sitemap' && r.sitemap !== false) return false;
        if (filter === 'noindex' && (r.indexable || r.error)) return false;
        if (filter === 'game' && !/^\/(?!en\/|tr\/|games\/|educators\/|events\/|ozel-dersler\/)[a-z0-9-]+\/?$/i.test(r.page.path)) return false;
        return true;
      }).sort((a, b) => importance(b) - importance(a) || a.page.name.localeCompare(b.page.name, 'tr'));
      $('#seoV2Rows').innerHTML = selected.map(r => {
        const issue = r.issues.slice().sort((a, b) => severityRank[b.severity] - severityRank[a.severity])[0];
        return '<tr><td><strong>' + esc(r.page.name) + '</strong><small class="seo-v2-path">' + esc(r.page.path) + '</small></td>' +
          '<td>' + (r.error ? '<span class="pill draft">HATA</span>' : scorePill(r.scores.seo)) + '</td>' +
          '<td>' + (r.error ? '—' : scorePill(r.scores.geo)) + '</td>' +
          '<td>' + (r.error ? '—' : '<span class="pill ' + (r.indexable ? 'published' : 'draft') + '">' +
          (r.indexable ? 'İzin açık' : 'Noindex') + '</span>') + '</td>' +
          '<td>' + (r.sitemap === null ? '—' : r.sitemap ? '✓' : '<span class="pill draft">Eksik</span>') + '</td>' +
          '<td>' + (issue ? '<strong>' + esc(issue.label) + '</strong><small class="seo-v2-path">' + esc(severityText[issue.severity]) +
          ' · ' + r.issues.length + ' kontrol</small>' : '<span class="pill published">Temel kontroller geçti</span>') + '</td>' +
          '<td><div class="row-actions"><button class="icon-btn" data-seo-v2-detail="' + esc(r.page.id) + '">Ayrıntılar</button>' +
          (r.page.external ? '' : '<button class="icon-btn" data-seo-v2-edit="' + esc(r.page.id) + '">Düzenle</button>') + '</div></td></tr>';
      }).join('') || '<tr><td colspan="7"><div class="empty">Bu filtreyle eşleşen sayfa yok.</div></td></tr>';
      $('#seoV2Rows').querySelectorAll('[data-seo-v2-detail]').forEach(btn => {
        btn.onclick = () => { const r = reports.find(x => String(x.page.id) === btn.dataset.seoV2Detail); if (r) showDetails(r); };
      });
      $('#seoV2Rows').querySelectorAll('[data-seo-v2-edit]').forEach(btn => btn.onclick = () => openEditor(btn.dataset.seoV2Edit));
    };
    $('#seoV2Filter').onchange = draw;
    $('#seoV2Search').oninput = draw;
    $('#seoV2Export').onclick = () => exportCsv(reports);
    draw();
  }

  async function seoCenterV2() {
    const token = ++scanToken;
    $('#panel').innerHTML =
      '<div class="card"><div class="card-head"><div><h2>SEO & GEO Merkezi</h2>' +
      '<p class="muted">Teknik tarama, içerik kalitesi ve uygulanabilir düzeltmeler.</p></div>' +
      '<button id="seoV2Refresh" class="btn secondary" type="button">Taramayı yenile</button></div>' +
      '<div id="seoV2Root"><div class="empty">Sayfaların HTML kaynakları kontrol ediliyor…</div></div></div>';
    $('#seoV2Refresh').onclick = seoCenterV2;
    try {
      const { data, error } = await A.state.db.from('esc_cms_pages')
        .select('id,name,path,category,published_seo,updated_at')
        .eq('active', true).eq('page_kind', 'static').order('category').order('name');
      if (error) throw error;
      const pages = data || [];
      if (!pages.some(p => toPath(p.path) === '/events/')) pages.push({id:null,name:'Etkinlik Takvimi',path:'/events/',category:'events',published_seo:{},external:true});
      const reports = new Array(pages.length);
      let cursor = 0;
      const worker = async () => {
        while (cursor < pages.length && scanToken === token) {
          const index = cursor++;
          reports[index] = await auditPage(pages[index]);
        }
      };
      const globalPromise = globalStatus();
      await Promise.all(Array.from({ length: Math.min(6, pages.length) }, () => worker()));
      const global = await globalPromise;
      if (scanToken !== token || !$('#seoV2Root')) return;
      appendSitemapIssues(reports, global);
      renderReport(reports, global);
    } catch (error) {
      if (scanToken !== token || !$('#seoV2Root')) return;
      $('#seoV2Root').innerHTML = '<div class="notice warning">SEO & GEO taraması tamamlanamadı: ' +
        esc(error?.message || String(error)) + '</div>';
    }
  }

  A.register('seo', seoCenterV2);
})();
