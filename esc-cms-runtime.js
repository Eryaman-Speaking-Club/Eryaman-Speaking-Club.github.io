(() => {
  'use strict';
  if (window.__ESC_CMS_RUNTIME__) return;
  window.__ESC_CMS_RUNTIME__ = true;

  const normalizePath = (value) => {
    let path = String(value || '/').split('?')[0].split('#')[0] || '/';
    if (!path.startsWith('/')) path = '/' + path;
    if (path.endsWith('/index.html')) path = path.slice(0, -10);
    if (path !== '/' && !path.endsWith('/')) path += '/';
    return path.replace(/\/+/g, '/');
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function client() {
    for (let i = 0; i < 80; i++) {
      if (window.ESCSupabase?.getClient) {
        try { return await window.ESCSupabase.getClient(); } catch (_) {}
      }
      await sleep(50);
    }
    return null;
  }

  function applyPatch(patch) {
    if (!patch?.selector) return;
    let elements = [];
    try { elements = [...document.querySelectorAll(patch.selector)]; } catch (_) { return; }
    if (!elements.length) return;
    elements.forEach(el => {
      const kind = patch.kind || 'text';
      if (kind === 'text') el.textContent = patch.value ?? '';
      else if (kind === 'textNode') {
        const nodes=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE);
        const node=nodes[Number.isInteger(patch.node_index)?patch.node_index:0];
        if(node) node.nodeValue=patch.value ?? '';
      }
      else if (kind === 'html') el.innerHTML = patch.value ?? '';
      else if (kind === 'image') {
        if ('src' in el && patch.value) el.src = patch.value;
        if (patch.alt !== undefined && 'alt' in el) el.alt = patch.alt || '';
      } else if (kind === 'attr' && patch.attr) {
        if (patch.value === null || patch.value === '') el.removeAttribute(patch.attr);
        else el.setAttribute(patch.attr, patch.value);
      }
    });
  }

  function applySections(sections) {
    if (!Array.isArray(sections) || !sections.length) return;
    const resolved = sections.map((item, index) => {
      let el = null;
      try { el = document.querySelector(item.selector); } catch (_) {}
      return el ? { item, el, index } : null;
    }).filter(Boolean);

    resolved.forEach(({item, el}) => {
      if (item.visible === false) el.setAttribute('data-esc-cms-hidden','1');
      else el.removeAttribute('data-esc-cms-hidden');
    });

    const byParent = new Map();
    resolved.forEach(x => {
      if (!x.el.parentElement) return;
      if (!byParent.has(x.el.parentElement)) byParent.set(x.el.parentElement, []);
      byParent.get(x.el.parentElement).push(x);
    });
    byParent.forEach(group => {
      group.sort((a,b) => (a.item.order ?? a.index) - (b.item.order ?? b.index));
      group.forEach(({el}) => el.parentElement?.appendChild(el));
    });
  }

  function applySeo(seo) {
    if (!seo || typeof seo !== 'object') return;
    if (seo.title) document.title = seo.title;
    if (seo.description !== undefined) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.name='description'; document.head.appendChild(meta); }
      meta.content = seo.description || '';
    }
    if (seo.og_title) {
      let meta = document.querySelector('meta[property="og:title"]');
      if (!meta) { meta=document.createElement('meta'); meta.setAttribute('property','og:title'); document.head.appendChild(meta); }
      meta.content=seo.og_title;
    }
    if (seo.og_description) {
      let meta = document.querySelector('meta[property="og:description"]');
      if (!meta) { meta=document.createElement('meta'); meta.setAttribute('property','og:description'); document.head.appendChild(meta); }
      meta.content=seo.og_description;
    }
    if (seo.og_image) {
      let meta = document.querySelector('meta[property="og:image"]');
      if (!meta) { meta=document.createElement('meta'); meta.setAttribute('property','og:image'); document.head.appendChild(meta); }
      meta.content=seo.og_image;
    }
  }

  function injectBaseStyle() {
    if (document.getElementById('escCmsRuntimeStyle')) return;
    const style = document.createElement('style');
    style.id = 'escCmsRuntimeStyle';
    style.textContent = '[data-esc-cms-hidden="1"]{display:none!important}';
    document.head.appendChild(style);
  }

  async function run() {
    const params = new URLSearchParams(location.search);
    if (params.get('cms_skip') === '1') return;
    injectBaseStyle();
    const db = await client();
    if (!db) return;
    const path = normalizePath(location.pathname);
    try {
      const { data, error } = await db
        .from('esc_cms_published_pages')
        .select('published_data,published_seo,version')
        .eq('path', path)
        .maybeSingle();
      if (error || !data) return;
      const content = data.published_data || {};
      (content.patches || []).forEach(applyPatch);
      applySections(content.sections || []);
      applySeo(data.published_seo || {});
      document.documentElement.dataset.escCmsVersion = String(data.version || 0);
      window.dispatchEvent(new CustomEvent('esc:cms:applied',{detail:{path,version:data.version||0}}));
    } catch (_) {}
  }

  window.ESCCMSRuntime = { normalizePath, applyPatch, applySections, applySeo, run };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
})();