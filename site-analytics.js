(() => {
  'use strict';
  // No analytics session identifiers or third-party advertising scripts run before consent.
  if (window.__ESC_CONSENT_INITIALIZED__) return;
  window.__ESC_CONSENT_INITIALIZED__ = true;
  const key = 'esc_cookie_preferences_v1';
  function read() {
    try {
      const p = JSON.parse(localStorage.getItem(key) || 'null');
      return p && typeof p.analytics === 'boolean' && typeof p.marketing === 'boolean' ? p : null;
    } catch (_) { return null; }
  }
  let preferences = read();
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
    return null;
  }

  window.ESCAnalytics = {
    track(target, mode='other') {
      return send('cta_click', {target, mode});
    }
  };

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
    if (preferences.analytics) startAnalytics();
    if (preferences.marketing) startMetaPixel();
    else if (window.__ESC_META_PIXEL_STARTED__) stopMetaPixel();
    window.dispatchEvent(new CustomEvent('esc:consent-changed', {detail:{...preferences}}));
    if (wasMarketing && !preferences.marketing) location.reload();
  }
  function showPreferences() {
    if (document.getElementById('esc-consent-panel')) return;
    const panel = document.createElement('section');
    panel.id = 'esc-consent-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Çerez tercihleri');
    panel.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:540px;z-index:2147483647;background:#fff;color:#16263b;padding:20px;border:1px solid #b9c5d4;border-radius:14px;box-shadow:0 10px 40px #0005;font:14px/1.5 system-ui,sans-serif';
    panel.innerHTML = `<strong style="display:block;font-size:17px;margin-bottom:8px">ESC · Gizlilik tercihleri</strong>
      <p style="margin:0 0 12px">Zorunlu işlevler dışında, siteyi geliştirmek için ziyaret ve tıklama istatistikleri tutmak; ileride izinli reklamlarla yeniden ulaşabilmek için ayrı tercihler istiyoruz. Kabul etmeseniz de siteyi kullanabilirsiniz.</p>
      <label style="display:block;margin:8px 0"><input id="esc-consent-analytics" type="checkbox"> Ziyaret ve tıklama analizi (Supabase)</label>
      <label style="display:block;margin:8px 0"><input id="esc-consent-marketing" type="checkbox"> Instagram/Facebook yeniden hedefleme (Meta Pixel)</label>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:15px">
        <button type="button" data-esc-consent="reject">Tümünü reddet</button>
        <button type="button" data-esc-consent="selected">Seçimimi kaydet</button>
        <button type="button" data-esc-consent="accept">Tümünü kabul et</button>
      </div>`;
    panel.querySelectorAll('button').forEach(btn => {
      btn.style.cssText = 'padding:9px 12px;border:1px solid #7789a2;border-radius:8px;cursor:pointer;background:#f4f7fb;color:#16263b;font:inherit';
      btn.addEventListener('click', () => {
        const action = btn.dataset.escConsent;
        save(action === 'accept' || (action === 'selected' && panel.querySelector('#esc-consent-analytics').checked),
             action === 'accept' || (action === 'selected' && panel.querySelector('#esc-consent-marketing').checked));
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
    link.textContent = 'Çerez tercihleri';
    link.style.cssText = 'position:fixed;bottom:0;right:0;z-index:1000;background:#fff;color:#243953;border:1px solid #ccd4df;border-radius:6px 0 0 0;padding:4px 8px;font:11px system-ui;cursor:pointer';
    link.addEventListener('click', showPreferences);
    document.body.appendChild(link);
  }
  function init() {
    installSettingsLink();
    if (preferences?.analytics) startAnalytics();
    if (preferences?.marketing) startMetaPixel();
    if (!preferences) showPreferences();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
