/* Progressive enhancement for native /tr/ and /en/ pages. No translation,
 * organiser-state writes or intercepted navigation. Bundled before home.js.
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
  } catch (_) {}

  if (languageHop) {
    document.documentElement.classList.add('esc-language-hop');
    const style = document.createElement('style');
    style.dataset.escNativeNavigation = 'true';
    style.textContent = '.esc-language-hop .reveal{opacity:1!important;transform:none!important;transition:none!important;animation:none!important}.esc-language-hop .site-nav{transition:none!important}';
    document.head.appendChild(style);
  }

  function preserveEnglishCasing() {
    if (here !== 'en' || !document.documentElement.style.getPropertyValue('-webkit-locale')) return;
    const skip = 'script,style,noscript,textarea,pre,code,[contenteditable="true"]';
    function format(root) {
      if (!root.isConnected) return;
      const nodes = [];
      if (root.nodeType === Node.TEXT_NODE) nodes.push(root);
      else if (root instanceof Element && !root.closest(skip)) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) nodes.push(node);
      }
      const modes = new Map();
      const writes = [];
      for (const node of nodes) {
        const parent = node.parentElement;
        if (!parent || parent.closest(skip) || !node.nodeValue.trim()) continue;
        if (!modes.has(parent)) modes.set(parent, getComputedStyle(parent).textTransform);
        const mode = modes.get(parent);
        const raw = node.nodeValue;
        let value = raw;
        if (mode === 'uppercase') value = raw.toLocaleUpperCase('en-US');
        else if (mode === 'lowercase') value = raw.toLocaleLowerCase('en-US');
        else if (mode === 'capitalize') value = raw.replace(/\b\p{L}/gu, char => char.toLocaleUpperCase('en-US'));
        if (value !== raw) writes.push([node, value]);
      }
      // Batch writes after reads; never rewrite a value that is already right.
      for (const [node, value] of writes) node.nodeValue = value;
    }
    format(document.body);
    const options = {childList:true, characterData:true, subtree:true};
    const observer = new MutationObserver(changes => {
      observer.disconnect();
      try {
        const roots = new Set();
        for (const change of changes) {
          if (change.type === 'characterData') roots.add(change.target);
          else change.addedNodes.forEach(node => roots.add(node));
        }
        for (const root of roots) format(root);
      } finally { observer.observe(document.body, options); }
    });
    observer.observe(document.body, options);
  }

  function init() {
    preserveEnglishCasing();
    const switcher = document.querySelector('.esc-lang-switch');
    if (!switcher) return;
    let warmed = false;
    function warmAlternate() {
      if (warmed || navigator.connection?.saveData || !navigator.onLine) return;
      warmed = true;
      const target = here === 'tr' ? '/en/' : '/tr/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      fetch(target, {credentials:'same-origin', cache:'no-cache', signal:controller.signal})
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
