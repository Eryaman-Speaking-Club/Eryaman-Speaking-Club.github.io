#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const paths=[...sitemap.matchAll(/<loc>https:\/\/eryamanspeakingclub\.com\/([^<]+)<\/loc>/g)]
 .map(m=>m[1]).filter(p=>!['en/','events/','ozel-dersler/','educators/','games/','kvkk/','en/kvkk/','gizlilik-ve-cerezler/'].includes(p));
assert.equal(paths.length,32,'Expected 32 speaking game URLs');
const descriptions=new Map();
for(const path of paths){
 const html=fs.readFileSync(path+'index.html','utf8');
 const clean=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 const h1=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
 assert(h1 && clean(h1[1]).length>=3,path+' must have readable initial H1');
 assert(html.includes('esc-game-seo-guide.css'),path+' SEO guide CSS missing');
 const guide=html.match(/<section class="esc-game-guide"[\s\S]*?<\/section>/);
 assert(guide && guide[0].includes('Eryaman Speaking Club'),path+' visible game guide missing');
 assert(clean(guide[0]).length>=200,path+' guide not informative enough');
 assert(!/Free browser-based English speaking game by Eryaman\./.test(guide[0]),path+' contains broken marketing copy');
 const json=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
 assert(json,path+' JSON-LD missing');
 const structured=JSON.parse(json[1]);
 assert.equal(structured['@type'],'WebPage',path+' schema type mismatch');
 assert.equal(structured.url,'https://eryamanspeakingclub.com/'+path,path+' schema URL mismatch');
 assert(structured.name && structured.description,path+' schema lacks name/description');
 assert(!descriptions.has(structured.description),path+' duplicate structured description');
 descriptions.set(structured.description,path);
}
assert(fs.existsSync('esc-game-seo-guide.css'),'Shared guide styles missing');
console.log('SEO/GEO content QA passed for '+paths.length+' unique game pages.');
