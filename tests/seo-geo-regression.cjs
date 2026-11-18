#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');
const panel=read('admin/index.html');
const audit=read('admin/admin-seo-audit-v2.js');
const editor=read('admin/admin-editor.js');
const sitemap=read('sitemap.xml');
const join=read('join/index.html');
const tr=read('tr/index.html');
const events=read('events/index.html');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);

assert(panel.includes('<script src="./admin-seo-audit-v2.js?'), 'V2 audit script must be loaded');
assert(panel.indexOf('admin-seo-audit-v2.js')>panel.indexOf('admin-editor.js'), 'V2 must register after editor');
assert(audit.includes("A.register('seo', seoCenterV2)"), 'SEO V2 register missing');
assert(audit.includes('res.ok'), 'HTTP errors must not receive success points');
assert(audit.includes('text\\/html'), 'Response must be HTML');
assert(audit.includes("if (report.error || !report.indexable) return;"), 'Sitemap exclusion check absent');
assert(audit.includes("path:'/events/'"), 'Events page missing from audit');
assert(audit.includes("deliberatelyExcluded"), 'Intentional noindex handling absent');
assert(audit.includes('exportCsv(reports)'), 'CSV report missing');
assert(editor.includes('A.openSeoEditor=renderEditor'), 'Editor deep link missing');
assert(editor.includes('/\\bnoindex\\b/i'), 'Noindex detection missing');
assert(!editor.includes('/\\\\bnoindex\\\\b/i'), 'Incorrect noindex regex reintroduced');
assert(/name="robots" content="noindex,nofollow"/.test(join), 'Private join page must not be indexed');
assert(/name="robots" content="noindex,follow/.test(tr), 'Turkish alias must be excluded');
assert(/rel="canonical" href="https:\/\/eryamanspeakingclub.com\/"/.test(tr), 'Turkish alias should point to root');
assert(!urls.some(u=>/\/(join|tr)\/$/.test(u)), 'Noindex pages must not be in sitemap');
assert(urls.includes('https://eryamanspeakingclub.com/events/'), 'Events must appear in sitemap');
assert(new Set(urls).size===urls.length, 'Duplicate sitemap URLs');
assert(/<meta name="robots" content="index,follow/.test(events), 'Events page should remain indexable');
assert(!urls.some(u=>u.startsWith('http://')), 'Sitemap must use HTTPS');

new Function(audit);new Function(editor);
console.log('SEO/GEO regression checks passed: scripts, robots, canonical, sitemap, filters, editor and events');
