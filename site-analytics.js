(() => {
  'use strict';
  // No analytics session identifiers or third-party advertising scripts run before consent.
  if (window.__ESC_CONSENT_INITIALIZED__) return;
  window.__ESC_CONSENT_INITIALIZED__ = true;
  const key = 'esc_cookie_preferences_v2';
  function read() {
    try {
      const p = JSON.parse(localStorage.getItem(key) || 'null');
      return p && typeof p.analytics === 'boolean' && typeof p.marketing === 'boolean' && p.updated_at && (Date.now() - Date.parse(p.updated_at)) < 180*86400000 ? p : null;
    } catch (_) { return null; }
  }
  let preferences = read();
  const bannerDefaults = {
    title:'Çerezleri Kullanıyoruz',
    description:'Deneyiminizi iyileştirmek, site kullanımını analiz etmek ve reklamları ölçmek için çerezler kullanıyoruz. Tercihlerinizi istediğiniz zaman değiştirebilirsiniz.',
    link_label:'Çerez Politikası',
    accept_label:'Çerezleri kabul et',
    reject_label:'Reddet',
    settings_label:'Tercihler'
  };
  const bannerCopy = {...bannerDefaults};
  async function loadBannerCopy() {
    try {
      const client = await window.ESCSupabase?.getClient?.();
      if(!client) return;
      const {data,error} = await client.from('esc_cookie_banner')
        .select('title,description,link_label,accept_label,reject_label,settings_label')
        .eq('id',true).maybeSingle();
      if(error || !data) return;
      for(const [key,defaultValue] of Object.entries(bannerDefaults)) {
        const value = data[key];
        if(typeof value==='string' && value.trim().length>0 && value.length<=600) {
          bannerCopy[key]=value.trim();
        } else bannerCopy[key]=defaultValue;
      }
    } catch (_) {}
  }
  window.ESCCookieConsent = {
    getPreferences: () => preferences ? {...preferences} : null,
    openSettings: showPreferences
  };
  window.ESCAnalytics = {track: () => Promise.resolve()};
  function startAnalytics() {
    if (window.__ESC_ANALYTICS_STARTED__) return;
    window.__ESC_ANALYTICS_STARTED__ = true;
  const allowed = new Set(['page_view','cta_click','scroll_50','scroll_90']);
  const sessionKey = 'esc_analytics_session';
  let sessionId = sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2,14).padEnd(12,'0');
    sessionStorage.setItem(sessionKey, sessionId);
  }

  const referrerHost = (() => {
    try { return document.referrer ? new URL(document.referrer).host.slice(0,255) : null; }
    catch (_) { return null; }
  })();


  async function captureVisitor() {
    if (!preferences?.analytics || !window.ESCSupabase?.getClient) return;
    try {
      const client = await window.ESCSupabase.getClient();
      if (!client) return;
      await client.functions.invoke('esc-visitor-analytics', {body: {
        action: 'capture', sessionId, analyticsConsent: true,
        marketingConsent: !!preferences.marketing,
        language: navigator.language || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        screenWidth: window.screen?.width || null,
        screenHeight: window.screen?.height || null,
        viewportWidth: window.innerWidth || null,
        referrerHost
      }});
    } catch (_) { /* Optional diagnostics never interrupt navigation. */ }
  }
  async function withdrawVisitor() {
    try {
      const client = await window.ESCSupabase?.getClient?.();
      if (client) await client.functions.invoke('esc-visitor-analytics', {
        body: {action:'withdraw',sessionId}
      });
    } catch (_) {}
  }
  
  async function send(eventName, extra={}) {
    if (!preferences?.analytics || !allowed.has(eventName) || !window.ESCSupabase?.getClient) return;
    try {
      const client = await window.ESCSupabase.getClient();
      if (!client) return;
      const payload = {
        event_name: eventName,
        page_path: location.pathname.slice(0,256),
        target: extra.target ? String(extra.target).slice(0,160) : null,
        mode: ['in_person','online','instagram','games','private_lessons','other'].includes(extra.mode) ? extra.mode : null,
        session_id: sessionId,
        referrer_host: referrerHost,
        viewport_width: Math.min(10000, Math.max(0, window.innerWidth || 0))
      };
      await client.from('site_analytics').insert(payload);
    } catch (_) {}
  }

  function classify(link) {
    if (link.dataset.joinMode === 'online') return ['online_registration','online'];
    if (link.dataset.joinMode === 'in_person') return ['in_person_registration','in_person'];
    const href = link.getAttribute('href') || '';
    const text = (link.textContent || '').toLowerCase();
    if (href.includes('instagram.com')) return ['instagram','instagram'];
    if (href.includes('/games') || link.closest('.game-showcase,.all-games-banner')) return ['games','games'];
    if (href.includes('/ozel-dersler')) return ['private_lessons','private_lessons'];
    if (href.includes('forms.gle')) return [text.includes('online') ? 'online_registration' : 'registration','other'];
    // Track internal navigation without collecting form contents, URL queries or page fragments.
    try {
      const url=new URL(href,location.href);
      if(url.origin===location.origin && ['http:','https:'].includes(url.protocol)){
        if(url.pathname===location.pathname && url.hash) return ['section_navigation','other'];
        return ['page:'+url.pathname.slice(0,145),'other'];
      }
    } catch (_) {}
    return null;
  }

  window.ESCAnalytics = {
    track(target, mode='other') {
      return send('cta_click', {target, mode});
    },
    refreshConsent: captureVisitor,
    withdrawVisitor
  };

  captureVisitor();
  send('page_view');
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const info = classify(link);
    if (!info) return;
    send('cta_click', {target: link.dataset.analyticsTarget || info[0], mode: info[1]});
  }, {capture:true});

  const fired = new Set();
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const pct = scrollY / max;
    if (pct >= .5 && !fired.has('50')) { fired.add('50'); send('scroll_50'); }
    if (pct >= .9 && !fired.has('90')) { fired.add('90'); send('scroll_90'); window.removeEventListener('scroll', onScroll); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  }
  // Meta Pixel loads only after explicit marketing consent. Never add a noscript pixel.
  function startMetaPixel() {
    if (!preferences?.marketing || window.__ESC_META_PIXEL_STARTED__) return;
    window.__ESC_META_PIXEL_STARTED__ = true;
    !function(f,b,e,v,n,t,x) {
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      x=b.getElementsByTagName(e)[0];x.parentNode.insertBefore(t,x);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', '1667598808341200');
    window.fbq('track', 'PageView');
  }
  function stopMetaPixel() {
    // Existing third-party cookies cannot be deleted reliably by this site.
    // Prevent any further Pixel calls and require a page reload for fresh consent.
    if (window.fbq) window.fbq = function() {};
  }
  function save(analytics, marketing) {
    const wasMarketing = !!preferences?.marketing;
    preferences = {analytics: !!analytics, marketing: !!marketing, updated_at: new Date().toISOString()};
    try { localStorage.setItem(key, JSON.stringify(preferences)); } catch (_) {}
    const dialog = document.getElementById('esc-consent-panel');
    if (dialog) dialog.remove();
    if (preferences.analytics) {
      if (window.__ESC_ANALYTICS_STARTED__) window.ESCAnalytics?.refreshConsent?.();
      else startAnalytics();
    }
    if (preferences.marketing) startMetaPixel();
    else if (window.__ESC_META_PIXEL_STARTED__) stopMetaPixel();
    window.dispatchEvent(new CustomEvent('esc:consent-changed', {detail:{...preferences}}));
    if (!preferences.analytics && window.__ESC_ANALYTICS_STARTED__) {
      const revoke = window.ESCAnalytics?.withdrawVisitor?.() || Promise.resolve();
      if (wasMarketing && !preferences.marketing) revoke.finally(() => location.reload());
    } else if (wasMarketing && !preferences.marketing) location.reload();
  }
  function showPreferences() {
    if (document.getElementById('esc-consent-panel')) return;
    const panel = document.createElement('section');
    panel.id = 'esc-consent-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Çerez tercihleri');
    panel.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:530px;z-index:2147483647;background:#fff;color:#192e44;padding:22px;border:1px solid #cddde5;border-radius:16px;box-shadow:0 16px 46px #001b3340;font:14px/1.55 system-ui,-apple-system,sans-serif';
    panel.innerHTML = '<strong id="esc-banner-title" style="display:block;font-size:19px;letter-spacing:-.025em;margin-bottom:7px"></strong>' +
      '<p id="esc-banner-description" style="margin:0 0 9px;color:#425a6e"></p>' +
      '<a id="esc-banner-link" href="/gizlilik-ve-cerezler/" style="display:inline-block;margin-bottom:13px;color:#175ca8;text-underline-offset:2px;font-size:12px"></a>' +
      '<div id="esc-consent-options" hidden style="margin:4px 0 14px;padding:13px;border:1px solid #dbe5ec;border-radius:11px;background:#f7fafc">' +
        '<strong style="font-size:12px">Çerez tercihlerinizi seçin</strong>' +
        '<p style="margin:4px 0 9px;font-size:12px;color:#516579">Zorunlu çerezler siteyi çalıştırır. Diğerleri isteğe bağlıdır.</p>' +
        '<label style="display:flex;align-items:start;gap:9px;margin:10px 0;font-size:13px"><input id="esc-consent-analytics" type="checkbox" style="margin-top:4px"> Ziyaret analizi ve kullanım istatistikleri</label>' +
        '<label style="display:flex;align-items:start;gap:9px;margin:10px 0;font-size:13px"><input id="esc-consent-marketing" type="checkbox" style="margin-top:4px"> Reklam çerezleri</label>' +
        '<button type="button" data-esc-consent="selected">Seçimimi kaydet</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px" id="esc-consent-actions">' +
        '<button type="button" data-esc-consent="accept"></button>' +
        '<button type="button" data-esc-consent="reject"></button>' +
        '<button type="button" data-esc-consent="preferences"></button>' +
      '</div>';
    panel.querySelector('#esc-banner-title').textContent = bannerCopy.title;
    panel.querySelector('#esc-banner-description').textContent = bannerCopy.description;
    panel.querySelector('#esc-banner-link').textContent = bannerCopy.link_label;
    panel.querySelector('[data-esc-consent="accept"]').textContent = bannerCopy.accept_label;
    panel.querySelector('[data-esc-consent="reject"]').textContent = bannerCopy.reject_label;
    panel.querySelector('[data-esc-consent="preferences"]').textContent = bannerCopy.settings_label;
    panel.querySelectorAll('button').forEach(btn => {
      btn.style.cssText = 'padding:10px 8px;min-height:43px;border:1px solid #8197aa;border-radius:10px;cursor:pointer;background:#eff4f8;color:#163452;font:600 12px/1.25 system-ui,-apple-system,sans-serif';
      btn.addEventListener('click', () => {
        const action = btn.dataset.escConsent;
        if (action === 'preferences') {
          const details = panel.querySelector('#esc-consent-options');
          details.hidden = !details.hidden;
          btn.setAttribute('aria-expanded', String(!details.hidden));
          return;
        }
        save(
          action === 'accept' || (action === 'selected' && panel.querySelector('#esc-consent-analytics').checked),
          action === 'accept' || (action === 'selected' && panel.querySelector('#esc-consent-marketing').checked)
        );
      });
    });
    panel.querySelector('#esc-consent-analytics').checked = !!preferences?.analytics;
    panel.querySelector('#esc-consent-marketing').checked = !!preferences?.marketing;
    document.body.appendChild(panel);
  }
  function installSettingsLink() {
    if (document.getElementById('esc-cookie-settings')) return;
    const link = document.createElement('button');
    link.id = 'esc-cookie-settings';
    link.type = 'button';
    link.textContent = 'Çerez ayarları';
    link.style.cssText = 'position:fixed;bottom:0;right:0;z-index:1000;background:#fff;color:#243953;border:1px solid #ccd4df;border-radius:6px 0 0 0;padding:4px 8px;font:11px system-ui;cursor:pointer';
    link.addEventListener('click', showPreferences);
    document.body.appendChild(link);
  }
  function init() {
    installSettingsLink();
    if (preferences?.analytics) startAnalytics();
    if (preferences?.marketing) startMetaPixel();
    const initCopy=loadBannerCopy();
    if(!preferences){
      Promise.race([initCopy,new Promise(resolve=>setTimeout(resolve,1800))])
        .finally(()=>showPreferences());
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
