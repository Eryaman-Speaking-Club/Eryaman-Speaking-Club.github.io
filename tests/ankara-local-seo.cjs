#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const root=fs.readFileSync('index.html','utf8');
const en=fs.readFileSync('en/index.html','utf8');
const events=fs.readFileSync('events/index.html','utf8');
const css=fs.readFileSync('esc-local-search.css','utf8');
for(const [name,html] of [['root',root],['en',en],['events',events]]){
 assert(html.includes('/esc-local-search.css?v='),name+' shared styles not linked');
 assert((html.match(/<h1\b/g)||[]).length===1,name+' should keep exactly one H1');
 assert(html.includes('https://eryamanspeakingclub.com/'),name+' domain identity missing');
 assert(html.includes('href="/events/"')||name==='events',name+' event link missing');
}
assert(root.includes('Ankara\'da İngilizce konuşma kulübü'), 'TR local intent missing');
assert(en.includes('Looking for a speaking club in Ankara?'), 'EN local intent missing');
assert(events.includes('id="eventGrid"'), 'Dynamic events grid must remain');
assert(events.includes('id="signupDialog"'), 'Registration must remain');
assert(root.includes('id="next-event"') && en.includes('id="next-event"'), 'Event integration removed');
assert(root.includes('İlk buluşman ücretsiz') && en.includes('first meetup is free'), 'Free trial must be accurately qualified');
assert(!root.includes('Bütün buluşmalar ücretsiz') && !en.includes('All meetups are free'), 'False blanket free claim');
assert(css.includes('@media'), 'Mobile styles missing');
console.log('Ankara local SEO content regression checks passed.');
