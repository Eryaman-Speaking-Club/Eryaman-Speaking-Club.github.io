#!/usr/bin/env python3
"""Apply the reviewed CEFR layer to the static site without altering archived data.
Run from the repository root before preview or the GitHub Pages upload.
Guarded transformations fail visibly if upstream source structure changes.
"""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
VERSION = '20261007-cefr1'
MARKER = '<!-- reviewed-cefr-20261007 -->'
def edit(path, fn):
    p = ROOT / path
    old = p.read_text()
    if '/* CEFR build applied */' in old:
        return
    p.write_text('/* CEFR build applied */\n' + fn(old))
def once(s, old, new):
    if s.count(old) != 1:
        raise RuntimeError(f'Expected one anchor ({s.count(old)}): {old[:100]!r}')
    return s.replace(old, new, 1)
def section(s, start, end, replacement):
    a = s.index(start)
    b = s.index(end, a + len(start))
    return s[:a] + replacement + s[b:]
slugs = re.findall(r"'([a-z-]+)':'[a-zA-Z]+'", (ROOT/'cefr-bank.js').read_text().split('const types={',1)[1].split('};',1)[0])
assert len(slugs) == 32, slugs
for slug in slugs + ['games', 'admin']:
    p = ROOT / slug / 'index.html'
    s = p.read_text()
    if MARKER in s:
        continue
    tags = '\n' + MARKER + '\n<link rel="stylesheet" href="/cefr.css?v='+VERSION+'">\n'
    tags += ''.join('<script src="/'+name+'?v='+VERSION+'"></script>\n' for name in ['cefr-source.js','cefr-bank.js','cefr-runtime.js'])
    s = once(s, '</head>', tags+'</head>')
    s = re.sub(r'<script\b[^>]*\bsrc=["\'][^"\']*game-content-v2\.js[^"\']*["\'][^>]*></script>', '', s)
    if slug in ['truth-or-dare','one-for-me-one-for-you']:
        s, n = re.subn(r'<script\b[^>]*\bsrc=["\']\./questions\.js[^"\']*["\'][^>]*></script>', '<script>window.ESCCEFR.installDefaults();</script>', s)
        assert n == 1, slug
        s = s.replace('</script>\\n', '</script>\n')
    if slug == 'never-have-i-ever':
        s = s.replace('Never have I ever...</div>', 'Your experience</div>')
        s = s.replace('I HAVE', 'YES').replace('NEVER:', 'NO:').replace('>\U0001f607 NEVER<', '>\U0001f607 NO<')
        s = s.replace('Choose YES or NEVER. If you have done it, you may have to tell the story.', 'Read a question and choose YES or NO. Sharing a story is optional.')
        s = s.replace('Next statement', 'Next question')
    changed = ['esc-content-editor.js','esc-new-games.js','esc-game-controls.js','esc-depth-pass.js','admin-data.js']
    if slug in ['truth-or-dare','one-for-me-one-for-you']: changed.append('app.js')
    for name in changed:
        s = re.sub(r'('+re.escape(name)+r')\?[^"\']+', r'\1?v='+VERSION, s)
    p.write_text(s)
edit('esc-content-editor.js', lambda s: once(s, '(function(){', '(function(){\n  if(window.ESCCEFR?.supported){window.ESCCEFR.bindLegacy();return;}'))
def new_engine(s):
    s = section(s, 'function ensureExpandedContent(){', 'const builtInItems=', 'cfg.items=window.ESCCEFR.get(cfg.slug);\n')
    s = s.replace('JSON.parse(JSON.stringify(builtInItems))', 'window.ESCCEFR.get(cfg.slug)')
    s = section(s, 'async function syncRemote(){', 'function resetToBuiltIns()', 'async function syncRemote(){await window.ESCCEFR.sync(cfg.slug)}\n')
    s = once(s, '\n }\n}\nasync function syncRemote', '\n }\n window.ESCCEFR.afterNewRender(cfg.type);\n}\nasync function syncRemote')
    s = once(s, 'function init(){', '''function init(){
 window.ESCCEFR.onChange(()=>{stopTimer();cfg.items=window.ESCCEFR.get(cfg.slug);deck=[];pos=-1;history=[];historyCursor=-1;nextItem()});''')
    s = s.replace("'<span>'+v+'</span>'", "'<span>'+esc(v)+'</span>'")
    s = s.replace("x.icons.join(' ')", "x.icons.map(esc).join(' ')")
    s = s.replace('Reveal identity','Reveal target').replace('Hide identity','Hide target').replace('Next identity','Next target')
    return s
edit('esc-new-games.js', new_engine)
edit('esc-game-controls.js', lambda s: once(s, '    function open(){\n      fill();', '    function open(){\n      if(window.ESCCEFR?.supported){window.ESCCEFR.help();return;}\n      fill();'))
def depth(s):
    s = s.replace("'This round \u00b7 I HAVE: '", "'This round \u00b7 YES: '").replace("' \u00b7 NEVER: '", "' \u00b7 NO: '")
    return once(s, '  function attachReset(ids,fn){', "  function attachReset(ids,fn){\n    window.ESCCEFR?.onChange(fn);")
edit('esc-depth-pass.js', depth)
def paired(s):
    s = section(s, '  async function hydrateCloudConfig()', '  function allCards()', '  async function hydrateCloudConfig(){await window.ESCCEFR.sync();}\n\n')
    s = section(s, '  function allCards()', '  function cardById(', '  function allCards(){return window.ESCCEFR.get();}\n  function activeDeck(){return allCards();}\n\n')
    s = section(s, '  function openAdmin() {', '  function closeAdmin()', '  function openAdmin(){void window.ESCCEFR.editor();}\n\n')
    s = once(s, '  function drawCard() {', '  function drawCard() {\n    const levelRevision=window.ESCCEFR.revision;')
    s = once(s, '      currentId = selected.id;', '      if(levelRevision!==window.ESCCEFR.revision)return;\n      currentId = selected.id;')
    s = once(s, '    await hydrateCloudConfig();', '''    window.ESCCEFR.onChange(()=>{usedIds.clear();resetQuestionCard();$('draw').disabled=false;window.ESCCEFR.ready()});
    void hydrateCloudConfig();
    window.ESCCEFR.ready();''')
    s = once(s, '  async function saveCloudConfig() {', '  async function saveCloudConfig() {\n    if(window.ESCCEFR?.supported)return;')
    return s
edit('one-for-me-one-for-you/app.js', paired)
def truth(s):
    s = once(s, "const STORAGE_KEY = 'esc-truth-dare-v1';", "const STORAGE_KEY = 'esc-truth-dare-cefr-v1';")
    s = once(s, 'const raw = localStorage.getItem(STORAGE_KEY);', "const raw = localStorage.getItem(STORAGE_KEY)||localStorage.getItem('esc-truth-dare-v1');")
    s = s.replace('defaults.truths.map((item) => item.text)', 'window.ESCCEFR.get().truths').replace('defaults.dares.map((item) => item.text)', 'window.ESCCEFR.get().dares')
    s = once(s, 'truths: Array.isArray(source.truths) ? uniqueLines(source.truths) : base.truths,', 'truths: base.truths,')
    s = once(s, 'dares: Array.isArray(source.dares) ? uniqueLines(source.dares) : base.dares,', 'dares: base.dares,')
    s = once(s, 'truths: Array.isArray(history.truths) ? uniqueLines(history.truths) : [],', 'truths: Array.isArray(history.truths) ? uniqueLines(history.truths).filter(x=>base.truths.includes(x)) : [],')
    s = once(s, 'dares: Array.isArray(history.dares) ? uniqueLines(history.dares) : []', 'dares: Array.isArray(history.dares) ? uniqueLines(history.dares).filter(x=>base.dares.includes(x)) : []')
    s = once(s, "await window.ESCSupabase.saveGameSettings('truth-or-dare', {\n        truths: state.truths,\n        dares: state.dares,", "const latest=await window.ESCSupabase.getGameSettings('truth-or-dare')||{};\n      await window.ESCSupabase.saveGameSettings('truth-or-dare', {\n        ...latest,")
    s = once(s, '  function spinPlayer() {', '  function spinPlayer() {\n    const levelRevision=window.ESCCEFR.revision;')
    s = once(s, "      setTimeout(() => {\n        $('selectedPlayer')", "      setTimeout(() => {\n        if(levelRevision!==window.ESCCEFR.revision)return;\n        $('selectedPlayer')")
    s = once(s, '  function spinQuestion(type) {', '  function spinQuestion(type) {\n    const levelRevision=window.ESCCEFR.revision;')
    s = once(s, '    const preview = setInterval(() => {', '    const preview = setInterval(() => {\n      if(levelRevision!==window.ESCCEFR.revision){clearInterval(preview);return;}')
    s = once(s, '      clearInterval(preview);\n      const picked', '      clearInterval(preview);\n      if(levelRevision!==window.ESCCEFR.revision)return;\n      const picked')
    s = once(s, '    setTimeout(() => spinQuestion(type), 120);', '    const levelRevision=window.ESCCEFR.revision;\n    setTimeout(()=>{if(levelRevision===window.ESCCEFR.revision)spinQuestion(type)},120);')
    s = once(s, "  function openAdmin(tab = 'names') {", "  function openAdmin(tab = 'names') {\n    if(tab==='truths'||tab==='dares'){void window.ESCCEFR.editor();return;}")
    s = once(s, '  function selectAdminTab(tab) {', "  function selectAdminTab(tab) {\n    if(tab==='truths'||tab==='dares'){$('adminPanel').close();void window.ESCCEFR.editor();return;}")
    s = once(s, '  function saveEditor(kind) {', "  function saveEditor(kind) {\n    if(kind!=='names'){void window.ESCCEFR.editor();return;}")
    s = once(s, '    await hydrateCloudState();', '''    window.ESCCEFR.onChange(()=>{
      const pool=window.ESCCEFR.get();state.truths=pool.truths;state.dares=pool.dares;
      state.history.truths=[];state.history.dares=[];
      clearInterval(spinTimer);if(wheelAnimation){wheelAnimation.onfinish=null;wheelAnimation.cancel();wheelAnimation=null;}
      labelAnimations.forEach(a=>a.cancel());labelAnimations=[];
      selectedPlayer='';$('questionText').textContent='';$('questionWheel').classList.remove('spinning-question','revealed');
      $('wheelLabel').textContent='READY';$('playerWheel').classList.remove('winner');
      showScreen('player');updateControls();updateAdminCounts();window.ESCCEFR.ready();
    });
    void hydrateCloudState();
    window.ESCCEFR.ready();''')
    return s
edit('truth-or-dare/app.js', truth)
def admin(s):
    s = once(s, '  function gameContentStats(slug,config){', '''  function gameContentStats(slug,config){
    if(window.ESCCefrBank?.games[slug]){const stats=window.ESCCEFR.stats(slug,config);return {count:stats.reduce((n,x)=>n+x.count,0),label:stats.map(x=>x.level+': '+x.count).join(' / '),mode:'cefr'};}''')
    s = once(s, '    delete metaConfig.dares;', '    delete metaConfig.dares;\n    delete metaConfig.cefr;')
    s = once(s, "    let libraryHtml='';\n    if(info.mode==='content'){", '''    let libraryHtml='';
    if(info.mode==='cefr'){
      libraryHtml='<div class="card"><h2>A1 / A2 / B1 / B2 / C1 soru k\u00fct\u00fcphanesi</h2><p>Eski kar\u0131\u015f\u0131k havuz ar\u015fivde korunur; seviyeli oyunlara eklenmez. Say\u0131lar oyun/level kart say\u0131lar\u0131d\u0131r; benzer oyunlar uygun kartlar\u0131 payla\u015fabilir.</p><div class="row-actions">'+window.ESCCEFR.stats(game.slug,config).map(x=>'<a class="btn secondary" href="../'+esc(game.slug)+'/?studio=1&level='+x.level+'" target="_blank" rel="noopener">'+x.level+' / '+x.count+' kart / D\u00fczenle</a>').join('')+'</div></div>';
    }else if(info.mode==='content'){''')
    s = once(s, '        const nextCfg=Object.assign({},config||{},meta||{});', '''        const current=await A.state.db.from('game_settings').select('config').eq('game_slug',game.slug).maybeSingle();
        if(current.error)throw current.error;
        if(info.mode==='cefr')delete meta.cefr;
        const nextCfg=Object.assign({},current.data?.config||config||{},meta||{});''')
    return s
edit('admin/admin-data.js', admin)
def runtime(s):
    return once(s, "if(supported)document.documentElement.setAttribute('data-cefr-loading','');", "if(supported){document.documentElement.setAttribute('data-cefr-loading','');setTimeout(()=>{if(document.documentElement.hasAttribute('data-cefr-loading')){const n=document.createElement('p');n.className='cefr-load-error';n.textContent='Oyun y\u00fcklenemedi. Sayfay\u0131 yenileyin / Please reload this game.';document.body.prepend(n)}},10000);}")
edit('cefr-runtime.js', runtime)
print('CEFR integration applied to 32 games, Game Hub and administration.')
