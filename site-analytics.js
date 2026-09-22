(() => {
  'use strict';
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
    if (!allowed.has(eventName) || !window.ESCSupabase?.getClient) return;
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
})();