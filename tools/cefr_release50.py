#!/usr/bin/env python3
"""Idempotent release: direct level buttons, expanded banks and filter-safe edits.
Runs AFTER the original CEFR integration and its guarded refinements.
"""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
VERSION='20261007-level50-2'
EXTRA=['cefr50-conversation.js','cefr50-interpersonal.js','cefr50-activities.js','cefr50-structured.js']
def once(s,old,new):
    if new in s:return s
    if s.count(old)!=1:raise RuntimeError('Release50 anchor missing: '+old[:100])
    return s.replace(old,new,1)
def between(s,start,end,new):
    a=s.index(start); b=s.index(end,a+len(start)); return s[:a]+new+s[b:]
# Normalize every page, even pages that already had a partial/deferred bootstrap.
slugs=re.findall(r"'([a-z-]+)':'[a-zA-Z]+'",(ROOT/'cefr-bank.js').read_text().split('const types={',1)[1].split('};',1)[0])
for slug in slugs+['games','admin']:
    p=ROOT/slug/'index.html';s=p.read_text()
    s=re.sub(r'<!-- reviewed-cefr-20261007(?:-direct)? -->\s*','',s)
    s=re.sub(r'<link\b[^>]*href=["\'][^"\']*/cefr\.css[^"\']*["\'][^>]*>\s*','',s)
    s=re.sub(r'<script\b[^>]*src=["\'][^"\']*/(?:cefr-(?:source|bank|runtime)|cefr50-[a-z-]+)\.js[^"\']*["\'][^>]*></script>\s*','',s)
    s=re.sub(r'<script\b[^>]*src=["\'][^"\']*game-content-v2\.js[^"\']*["\'][^>]*></script>','',s)
    tags='\n<!-- reviewed-cefr-20261007 -->\n<link rel="stylesheet" href="/cefr.css?v='+VERSION+'">\n'
    for f in ['cefr-source.js','cefr-bank.js']+EXTRA+['cefr-runtime.js']:
        tags+='<script src="/'+f+'?v='+VERSION+'"></script>\n'
    s=once(s,'</head>',tags+'</head>')
    for f in ['esc-content-editor.js','esc-new-games.js','esc-game-controls.js','esc-depth-pass.js','admin-data.js','app.js']:
        s=re.sub(r'('+re.escape(f)+r')\?[^"\']+',r'\1?v='+VERSION,s)
    if 'data-speaking-release=' in s:
        s=re.sub(r'data-speaking-release="[^"]+"','data-speaking-release="'+VERSION+'"',s)
    else:
        s=s.replace('<html lang="en">','<html lang="en" data-speaking-release="'+VERSION+'">')
    p.write_text(s)
# Avoid substring false positives such as 'hat' inside 'what', or 'app' inside 'happy'.
p=ROOT/'cefr-bank.js';s=p.read_text()
s=once(s,'const includesAny=(t,words)=>words.some(w=>t.includes(w));',r'''const includesAny=(t,words)=>words.some(w=>{
 const term=w.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return new RegExp('(^|[^a-z])'+term+'(?:s|es|ed|ing)?(?=$|[^a-z])','i').test(t);
});''')
s=once(s,'const t=String(text||"").toLowerCase();','const t=String(text||"").toLowerCase().replace(/^who (?:in the group|is most likely to)\\s+/, "");')
s=once(s,"const socialVerbs={plans:","const socialVerbs={knows:'know',gives:'give',chooses:'choose',identifies:'identify',frames:'frame',answers:'answer',shares:'share',sends:'send',plans:")
p.write_text(s)
p=ROOT/'cefr-runtime.js';s=p.read_text()
if '/* direct-level-buttons-release50 */' not in s:
    s=s.replace("'use strict';","'use strict';\n/* direct-level-buttons-release50 */",1)
    s=once(s,"let category='All';","let category=new URLSearchParams(location.search).get('category')||'All';")
    s=once(s,"function get(game=slug,l=level,cat=(game===slug?category:'All'))", "function get(game=slug,l=level,cat=(game===slug&&l===level?category:'All'))")
    s=once(s,"function notify(reason){revision++;", "function notify(reason){if(category!=='All'&&!categoryCounts(slug,level)[category])category='All';revision++;")
    s=between(s,'function setLevel(l){','function onChange(fn)',r'''function updateLocation(){
 try{localStorage.setItem(KEY,level);const u=new URL(location.href);u.searchParams.set('level',level);if(category==='All')u.searchParams.delete('category');else u.searchParams.set('category',category);window.history.replaceState(null,'',u)}catch(_){}
}
function setLevel(l){
 if(!LEVELS.includes(l)||l===level)return false;
 level=l;if(category!=='All'&&!categoryCounts(slug,level)[category])category='All';
 updateLocation();notify('level');return true;
}
function setCategory(c){
 const allowed=['All',...categories(slug,level)],counts=categoryCounts(slug,level);
 if(!allowed.includes(c)||c===category||(c!=='All'&&!counts[c]))return false;
 category=c;updateLocation();notify('category');return true;
}
function renderCategories(host){
 if(!host)return;
 const counts=categoryCounts(slug,level),names=['All',...categories(slug,level)];
 const signature=JSON.stringify([level,names,counts]);
 if(host.dataset.pool!==signature){
  host.replaceChildren();host.dataset.pool=signature;
  for(const c of names){const b=element('button',{type:'button','data-cat':c},c);b.disabled=c!=='All'&&!counts[c];b.title=b.disabled?'Bu seviyede kart yok / No cards at this level':(c==='All'?count(raw()):counts[c])+' kart / cards';b.onclick=()=>setCategory(c);host.append(b)}
 }
 host.querySelectorAll('button').forEach(b=>{const active=b.dataset.cat===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
''')
    s=once(s," const select=document.getElementById('cefrLevel');if(select)select.value=level;", " const group=document.getElementById('cefrLevel');if(group){group.dataset.level=level;group.querySelectorAll('[data-cefr-level]').forEach(b=>{const active=b.dataset.cefrLevel===level;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}")
    s=once(s," const categoryBar=document.getElementById('cefrCategories');if(categoryBar){categoryBar.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.cat===category));}"," renderCategories(document.getElementById('cefrCategories'));")
    s=once(s,"function mount(){\n if(!supported&&slug!=='games')return;", "function mount(){\n if(!supported&&slug!=='games')return;\n if(document.getElementById('cefrLevel'))return;")
    s=once(s,"label=element('label',{for:'cefrLevel'},'Seviye / Level'),sel=element('select',{id:'cefrLevel'})", "label=element('span',{id:'cefrLevelLabel',class:'cefr-level-label'},'Seviye / Level'),sel=element('div',{id:'cefrLevel',class:'cefr-level-buttons',role:'group','aria-labelledby':'cefrLevelLabel'})")
    s=once(s," for(const l of LEVELS)sel.append(element('option',{value:l},l+' \\u00b7 '+description[l][0]));sel.value=level;sel.onchange=()=>setLevel(sel.value);bar.append(label,sel,total,note);", " for(const l of LEVELS){const b=element('button',{type:'button','data-cefr-level':l,'aria-pressed':String(l===level),title:l+' / '+description[l][0]},l);b.className='cefr-level-button'+(l===level?' active':'');b.onclick=e=>{e.stopPropagation();setLevel(l)};sel.append(b)}bar.append(label,sel,total,note);")
    s=once(s," if(supported&&window.ESC_NEW_GAME&&categories(slug,level).length){", " if(supported&&(window.ESC_NEW_GAME||slug==='one-for-me-one-for-you')&&categories(slug,level).length){")
    a=s.index('  const catBar=element(');b=s.index('\n }\n if(supported){',a)
    s=s[:a]+"  const catBar=element('nav',{class:'cefr-category-bar',id:'cefrCategories','aria-label':'Question categories'});bar.after(catBar);renderCategories(catBar);"+s[b:]
    # Editing a filtered deck must NEVER replace the complete saved level with that subset.
    a=s.index('async function editor(){');b=s.index('function mount(){',a)
    part=s[a:b].replace('count(get(slug,l))','count(raw(slug,l))').replace('get(slug,editing)','raw(slug,editing)')
    s=s[:a]+part+s[b:]
    s=once(s,"const lower=()=>level==='A1'||level==='A2';",r'''const lower=()=>level==='A1'||level==='A2';
function storySupport(){return level==='A1'?'Use short sentences and familiar words.':level==='A2'?'Tell events in order using simple sentences.':level==='B1'?'Connect events with a clear beginning, change and ending.':level==='B2'?'Explain causes, consequences and a character\'s reasons.':'Include a change of perspective; distinguish what a character knows from what they assume.';}
''')
    s=s.replace("'Continue the same story. '+base", "'Continue the same story. '+storySupport()")
    s=s.replace("'Use all three words in a connected story. The timer is optional. '+base", "'Use all three words in a connected story. The timer is optional. '+storySupport()")
    s=s.replace("'Connect all pictures in a story. '+base", "'Connect all pictures in a story. '+storySupport()")
    s=once(s,"window.ESCCEFR={get,raw,stats,count,validate,", "if(category!=='All'&&!categoryCounts(slug,level)[category])category='All';\nwindow.ESCCEFR={get,raw,stats,count,validate,categoryOf,")
    p.write_text(s)
p=ROOT/'cefr.css';s=p.read_text()
if '/* direct-level-buttons-release50 */' not in s:
    s+='''
/* direct-level-buttons-release50 */
.cefr-bar{align-items:center;gap:10px 16px;background:rgba(255,255,255,.82);border-color:#dce5ed;border-radius:22px;padding:16px 20px}
.cefr-level-label{font-weight:850;color:#16324f;white-space:nowrap}
.cefr-level-buttons{display:flex;gap:8px;align-items:center;flex:1 1 300px;min-width:0;max-width:460px}
.cefr-level-buttons .cefr-level-button{flex:1;min-width:44px;min-height:46px;margin:0;border-radius:999px;padding:10px 14px;border:1px solid #c7d7e7;background:#fff;color:#53697c;font:850 15px/1.2 system-ui,sans-serif;box-shadow:none;cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.cefr-level-buttons .cefr-level-button.active{background:#0b2f5b;color:#fff;border-color:#0b2f5b;box-shadow:0 6px 18px #0b2f5b20}
.cefr-level-buttons .cefr-level-button:hover:not(.active){background:#edf4fb;border-color:#91afd0}
.cefr-level-buttons .cefr-level-button:focus-visible{outline:3px solid #367eb6;outline-offset:3px}
.cefr-bar #cefrPoolCount{font-variant-numeric:tabular-nums;white-space:normal}
.cefr-category-bar{max-width:100%;box-sizing:border-box}
@media(max-width:650px){.cefr-bar{padding:12px;margin:12px 0;gap:10px}.cefr-level-buttons{flex-basis:100%;max-width:none;gap:6px}.cefr-level-buttons .cefr-level-button{padding:10px 6px;min-height:44px;font-size:14px}.cefr-bar #cefrPoolCount{margin-left:0;flex-basis:100%}.cefr-bar p{font-size:12px}}
'''
    p.write_text(s)
# Update existing regressions to operate the REAL buttons rather than a hidden select.
for path in ['tests/cefr-browser.cjs','tests/cefr-edits.cjs']:
    p=ROOT/path;s=p.read_text()
    s=re.sub(r"await page\.selectOption\('#cefrLevel',([^\)]+)\)",r'''await page.locator('#cefrLevel [data-cefr-level="'+\1+'"]') .click()''',s)
    s=s.replace("await page.locator('#cefrLevel').inputValue()", "await page.locator('#cefrLevel').getAttribute('data-level')")
    s=s.replace("await page.selectOption('#cefrLevel',level)","await page.locator('#cefrLevel [data-cefr-level=\"'+level+'\"]').click()")
    s=s.replace("await page.evaluate(()=>ESCCEFR.category),'All'", "await page.evaluate(()=>ESCCEFR.category),'Money'")
    p.write_text(s)
p=ROOT/'tests/cefr-check.cjs';s=p.read_text()
s=s.replace("['cefr-source.js','cefr-bank.js','cefr-runtime.js']",repr(['cefr-source.js','cefr-bank.js']+EXTRA+['cefr-runtime.js']))
s=once(s,"assert(n>=10&&n<=40,`${slug}/${level}: ${n}`);", "assert(n===(slug==='truth-or-dare'?100:context.ESCCefrBank.expandedSpeakingGames.includes(slug)?50:40),`${slug}/${level}: ${n}`);")
s=s.replace("context.ESCCEFR.count(context.ESCCEFR.raw(game,level))>=20", "context.ESCCEFR.count(context.ESCCEFR.raw(game,level))>=50")
p.write_text(s)
# Emoji identity must keep its pictograms; stripping to ASCII collapses every card.
p=ROOT/'cefr50-conversation.js';s=p.read_text()
s=once(s,"function key(game,x){if(typeof x==='string')", "function key(game,x){if(B.types[game]==='emoji')return JSON.stringify(x[1]);if(typeof x==='string')")
p.write_text(s)
p=ROOT/'cefr50-structured.js';s=p.read_text()
s=once(s,"B.version='20261007-level50-2';", "B.categorySets['story-chain']=[...new Set([...B.categorySets['story-chain'],'Food','Home','Work','Dating'])];\nB.version='20261007-level50-2';")
p.write_text(s)
print('Release50: direct level buttons, complete-page bootstraps and filter-safe editing applied.')
