/* Native TR/EN navigation only: no client-side translation or game-state writes.
 * Prepended to home.js by the static build so no extra request is required.
 */
(() => {
  'use strict';
  if (window.__escNativeNavigation) return;
  window.__escNativeNavigation = true;
  const paths = new Set(['/', '/tr/', '/en/']);
  if (!paths.has(location.pathname)) return;
  const languageOf = path => path === '/en/' ? 'en' : 'tr';
  const markerKey = 'esc-native-language-hop-v1';
  const here = languageOf(location.pathname);
  let languageHop = false;
  try {
    const previous = document.referrer ? new URL(document.referrer) : null;
    languageHop = Boolean(previous && previous.origin === location.origin && paths.has(previous.pathname) && languageOf(previous.pathname) !== here);
    const marker = JSON.parse(sessionStorage.getItem(markerKey) || 'null');
    if (marker && marker.to === location.pathname && Date.now() - marker.at < 15000) languageHop = true;
    sessionStorage.removeItem(markerKey);
  } catch (_) { /* Navigation must work with browser storage blocked. */ }

  if (languageHop) {
    document.documentElement.classList.add('esc-language-hop');
    const style = document.createElement('style');
    style.dataset.escNativeNavigation = 'true';
    style.textContent = '.esc-language-hop .reveal{opacity:1!important;transform:none!important;transition:none!important;animation:none!important}.esc-language-hop .site-nav{transition:none!important}';
    document.head.appendChild(style);
  }

  function init() {
    const switcher = document.querySelector('.esc-lang-switch');
    if (!switcher) return;
    let warmed = false;
    function warmAlternate() {
      if (warmed || navigator.connection?.saveData || !navigator.onLine) return;
      warmed = true;
      const target = here === 'tr' ? '/en/' : '/tr/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      // An explicit same-origin fetch also warms browsers without HTML-prefetch.
      // Keep ordinary links, back/forward and no-JS navigation intact.
      fetch(target, {credentials:'same-origin', cache:'default', signal:controller.signal})
        .then(response => response.ok ? response.arrayBuffer() : undefined)
        .catch(() => {})
        .finally(() => clearTimeout(timeout));
    }
    switcher.addEventListener('pointerenter', warmAlternate, {once:true});
    switcher.addEventListener('focusin', warmAlternate, {once:true});
    switcher.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = new URL(link.href, location.href);
      if (target.origin !== location.origin || !paths.has(target.pathname)) return;
      if (languageOf(target.pathname) === here) return;
      try { sessionStorage.setItem(markerKey, JSON.stringify({to:target.pathname, at:Date.now()})); } catch (_) {}
    });
    requestAnimationFrame(() => setTimeout(warmAlternate, 0));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
