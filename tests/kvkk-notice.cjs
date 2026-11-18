#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const home=read('index.html'),en=read('en/index.html'),events=read('events/index.html');
const privacy=read('kvkk/index.html'),privacyEn=read('en/kvkk/index.html');
const cookies=read('gizlilik-ve-cerezler/index.html'),contact=read('floating-contact.js');
for(const html of [home,en]) {
  assert(html.includes('class="esc-kvkk-notice"'),'Homepage notice missing');
  assert(html.includes('esc-kvkk-home.css'),'Homepage styles missing');
  assert(/<footer>[\s\S]*?<a href="\/(?:en\/)?kvkk\/">/.test(html),'Footer privacy link missing');
}
assert(home.includes('href="/kvkk/"'),'Turkish KVKK link missing');
assert(en.includes('href="/en/kvkk/"'),'English privacy link missing');
assert(events.includes('href="/kvkk/"'),'Events registration privacy link missing');
assert(events.includes('name="consent"') && events.includes('type="checkbox" required'),'Event consent checkbox broken');
assert(events.includes('id="signupDialog"') && events.includes("form.onsubmit=async"),'Event registration modified');
assert(events.includes('Bu onay reklam veya tanıtım izni değildir'),'Consent purpose separation missing');
assert(cookies.includes('href="/kvkk/"'),'Cookie policy privacy cross-link missing');
assert(contact.includes('href="/kvkk/"') && contact.includes('href="/en/kvkk/"'),'Contact links missing');
for(const [html,locale] of [[privacy,'tr'],[privacyEn,'en']]) {
  assert(html.includes('lang="'+locale+'"'),'Incorrect policy language');
  assert((html.match(/<h1\b/g)||[]).length===1,'Policy needs one H1');
  assert(html.includes('eryamanspeakingclub@gmail.com'),'Verified contact missing');
  assert(/<h2>1\./.test(html) && /<h2>8\./.test(html),'Policy missing sections');
  assert(html.includes('KVKK'),'Legal basis missing');
}
assert(home.includes('class="esc-kvkk-hero-note"') && en.includes('class="esc-kvkk-hero-note"'),'Pre-registration notice missing');
assert(read('sitemap.xml').includes('https://eryamanspeakingclub.com/kvkk/') && read('sitemap.xml').includes('https://eryamanspeakingclub.com/en/kvkk/'),'Privacy sitemap URLs missing');
assert(read('esc-kvkk-home.css').includes('@media'),'Missing mobile styles');
console.log('KVKK notices, footers, event consent, contact links and bilingual policy validation passed.');
