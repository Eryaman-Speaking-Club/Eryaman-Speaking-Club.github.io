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
  let lastPagePayload = null;
  let lastPagePath = null;

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
      if (el.closest?.('[data-esc-managed]')) return;
      if (kind === 'attr' && patch.attr === 'href' && el.closest?.('[data-esc-managed-href]')) return;
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

  function ensureMeta(selector,attrs) {
    let el=document.querySelector(selector);
    if(!el){el=document.createElement('meta');Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,v));document.head.appendChild(el)}
    return el;
  }
  function ensureLink(selector,attrs) {
    let el=document.querySelector(selector);
    if(!el){el=document.createElement('link');Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,v));document.head.appendChild(el)}
    return el;
  }
  function currentCanonical() {
    const existing=document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    if(existing)return existing;
    const path=normalizePath(location.pathname);
    return location.origin+path;
  }
  function applySeo(seo) {
    if (!seo || typeof seo !== 'object') seo={};
    const title=seo.title||document.title||'';
    const description=seo.description!==undefined?seo.description:(document.querySelector('meta[name="description"]')?.getAttribute('content')||'');
    const canonical=seo.canonical||currentCanonical();
    const ogTitle=seo.og_title||title;
    const ogDescription=seo.og_description||description;
    const ogImage=seo.og_image||document.querySelector('meta[property="og:image"]')?.getAttribute('content')||'https://eryamanspeakingclub.com/og-card.jpg';
    const ogType=seo.og_type||'website';
    const lang=document.documentElement.lang==='en'?'en_US':'tr_TR';

    if (title) document.title=title;
    const desc=ensureMeta('meta[name="description"]',{name:'description'});desc.content=description||'';
    const canonicalEl=ensureLink('link[rel="canonical"]',{rel:'canonical'});canonicalEl.href=canonical;
    const robots=ensureMeta('meta[name="robots"]',{name:'robots'});
    const existingRobots=robots.getAttribute('content')||'';
    const indexable=seo.indexable!==undefined?seo.indexable:!/\bnoindex\b/i.test(existingRobots);
    robots.content=indexable===false?'noindex,nofollow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

    const ogTypeEl=ensureMeta('meta[property="og:type"]',{property:'og:type'});ogTypeEl.content=ogType;
    const ogSite=ensureMeta('meta[property="og:site_name"]',{property:'og:site_name'});ogSite.content='Eryaman Speaking Club';
    const ogLocale=ensureMeta('meta[property="og:locale"]',{property:'og:locale'});ogLocale.content=lang;
    const ogTitleEl=ensureMeta('meta[property="og:title"]',{property:'og:title'});ogTitleEl.content=ogTitle;
    const ogDescEl=ensureMeta('meta[property="og:description"]',{property:'og:description'});ogDescEl.content=ogDescription;
    const ogUrl=ensureMeta('meta[property="og:url"]',{property:'og:url'});ogUrl.content=canonical;
    const ogImageEl=ensureMeta('meta[property="og:image"]',{property:'og:image'});ogImageEl.content=ogImage;

    const twCard=ensureMeta('meta[name="twitter:card"]',{name:'twitter:card'});twCard.content='summary_large_image';
    const twTitle=ensureMeta('meta[name="twitter:title"]',{name:'twitter:title'});twTitle.content=ogTitle;
    const twDesc=ensureMeta('meta[name="twitter:description"]',{name:'twitter:description'});twDesc.content=ogDescription;
    const twImage=ensureMeta('meta[name="twitter:image"]',{name:'twitter:image'});twImage.content=ogImage;
  }

  function injectBaseStyle() {
    if (document.getElementById('escCmsRuntimeStyle')) return;
    const style = document.createElement('style');
    style.id = 'escCmsRuntimeStyle';
    style.textContent = '[data-esc-cms-hidden="1"]{display:none!important}';
    document.head.appendChild(style);
  }

  function applyPublishedPage(data,path,reason='load') {
    if (!data) return;
    const content = data.published_data || {};
    (content.patches || []).forEach(applyPatch);
    applySections(content.sections || []);
    applySeo(data.published_seo || {});
    document.documentElement.dataset.escCmsVersion = String(data.version || 0);
    window.dispatchEvent(new CustomEvent('esc:cms:applied',{detail:{path,version:data.version||0,reason}}));
  }

  function reapplyPublishedPage(reason='dynamic-content') {
    if (!lastPagePayload || !lastPagePath) return;
    applyPublishedPage(lastPagePayload,lastPagePath,reason);
  }

  async function run() {
    const params = new URLSearchParams(location.search);
    if (params.get('cms_skip') === '1') return;
    injectBaseStyle();
    const db = await client();
    if (!db) return;
    const path = normalizePath(location.pathname);
    try {
      const [{data,error},{data:settings,error:settingsError}] = await Promise.all([
        db.from('esc_cms_public_pages').select('published_data,published_seo,version').eq('path', path).maybeSingle(),
        db.from('esc_cms_public_settings').select('key,published_data').in('key',['site_identity','social_links','navigation','footer'])
      ]);
      if (!settingsError && Array.isArray(settings)) {
        const map = Object.fromEntries(settings.map(x => [x.key, x.published_data || {}]));
        const identity = map.site_identity || {};
        const social = map.social_links || {};
        if (identity.site_name) document.querySelectorAll('.esc-brand-title').forEach(el => el.textContent = identity.site_name);
        if (identity.contact_email) {
          document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.href = 'mailto:' + identity.contact_email);
        }
        if (social.instagram) document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = social.instagram);
        if (social.tiktok) document.querySelectorAll('a[href*="tiktok.com"]').forEach(a => a.href = social.tiktok);

        const lang = document.documentElement.lang === 'en' ? 'en' : 'tr';
        const nav = map.navigation || {};
        const navHost = document.querySelector('.nav-links');
        if (navHost && Array.isArray(nav.items)) {
          navHost.innerHTML = nav.items.filter(x => x.visible !== false).map(x => {
            const label = x.label?.[lang] || x.label?.tr || x.label?.en || '';
            return '<a href="' + String(x.href || '#').replace(/"/g,'&quot;') + '">' + String(label).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</a>';
          }).join('');
        }
        const cta = nav.cta || {};
        const ctaEl = document.querySelector('.nav-cta');
        if (ctaEl && cta.visible !== false) {
          ctaEl.href = cta.href || '#';
          ctaEl.innerHTML = String(cta.label?.[lang] || cta.label?.tr || cta.label?.en || '') + ' <span>↗</span>';
        } else if (ctaEl && cta.visible === false) {
          ctaEl.style.display = 'none';
        }

        const footer = map.footer || {};
        const footerLinks = document.querySelector('.footer-links');
        if (footerLinks && Array.isArray(footer.links)) {
          footerLinks.innerHTML = footer.links.filter(x => x.visible !== false).map(x => {
            const label = x.label?.[lang] || x.label?.tr || x.label?.en || '';
            return '<a href="' + String(x.href || '#').replace(/"/g,'&quot;') + '">' + String(label).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</a>';
          }).join('');
        }
        const footerCopy = document.querySelector('footer > p');
        if (footerCopy && (footer.tagline || footer.location)) {
          const tagline = footer.tagline?.[lang] || footer.tagline?.tr || footer.tagline?.en || '';
          const locationText = footer.location?.[lang] || footer.location?.tr || footer.location?.en || '';
          footerCopy.innerHTML = String(tagline).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') +
            (locationText ? '<br><span>' + String(locationText).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>' : '');
        }
      }
      if (error || !data) return;
      lastPagePayload = data;
      lastPagePath = path;
      applyPublishedPage(data,path,'load');
    } catch (_) {}
  }

  window.addEventListener('esc:event-config:applied',() => {
    if (!lastPagePayload) return;
    requestAnimationFrame(() => reapplyPublishedPage('event-config'));
  });

  window.ESCCMSRuntime = { normalizePath, applyPatch, applySections, applySeo, run, reapplyPublishedPage };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
})();