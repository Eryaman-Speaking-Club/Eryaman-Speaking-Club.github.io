from pathlib import Path
import hashlib, json
ROOT=Path.cwd()
p=ROOT/'esc-depth-pass.js'
s=p.read_text()
assert hashlib.sha256(p.read_bytes()).hexdigest()=='c954c4922aa82a0e175f0c1d5e48d27e29d653d1101b32f4c1f16ee5092e4cbe'
s=s.replace("startBtn.textContent='Prep 10s + Speak 45s';$id('phase').textContent=", "startBtn.textContent='Prep 10s + Speak 45s';startBtn.disabled=!['FOR','AGAINST'].includes($id('side').textContent);$id('phase').textContent=")
s=s.replace("if(!['FOR','AGAINST'].includes($id('side').textContent))pick();", "if(!['FOR','AGAINST'].includes($id('side').textContent))return;")
s=s.replace("const restore=()=>{startBtn.disabled=false;", "const restore=()=>{startBtn.disabled=!['FOR','AGAINST'].includes($id('side').textContent);")
s=s.replace("const $id=id=>document.getElementById(id);", "const $id=id=>document.getElementById(id);\n  const escapeName=value=>String(value).replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[ch]));")
s=s.replace("'<span class=\"esc-score-pill\">'+n+': '", "'<span class=\"esc-score-pill\">'+escapeName(n)+': '")
assert hashlib.sha256(s.encode()).hexdigest()=='17a63e66a0fe23a29ce84f53e96ea44d820f72675add216437ad4501130c8ccb'
p.write_text(s)
changed=['esc-depth-pass.js']
for p in ROOT.glob('*/index.html'):
 s=p.read_text()
 if 'esc-depth-pass.js?v=20260916-1720' in s:
  p.write_text(s.replace('esc-depth-pass.js?v=20260916-1720','esc-depth-pass.js?v=20261005-games-audit4'))
  changed.append(str(p.relative_to(ROOT)))
qa=ROOT/'_game_audit'
p=qa/'changed_paths.json';paths=json.loads(p.read_text());p.write_text(json.dumps(sorted(set(paths+changed))))
p=qa/'test_games.py';s=p.read_text()
# Fullscreen transitions are asynchronous: await both API state and the enabled button.
s=s.replace("fs.click(force=True);assert_true(page.evaluate('!!document.fullscreenElement'),'native fullscreen entered');", "fs.click();page.wait_for_function(\"!!document.fullscreenElement && !document.querySelector('[data-esc-fullscreen]').disabled\");assert_true(page.evaluate('!!document.fullscreenElement'),'native fullscreen entered');")
s=s.replace("fs.click(force=True);assert_true(page.evaluate('!document.fullscreenElement'),'native fullscreen exited');", "fs.click();page.wait_for_function(\"!document.fullscreenElement && !document.querySelector('[data-esc-fullscreen]').disabled\");assert_true(page.evaluate('!document.fullscreenElement'),'native fullscreen exited');")
# Actual public URL uses the existing 10-second preparation stage before speaking.
s=s.replace("page.clock.run_for(46000);assert_true(text(page,'#timer')=='0','debate ends');", "page.clock.run_for(11000);assert_true('Speak now' in text(page,'#phase'),'preparation advances to speaking');page.clock.run_for(46000);assert_true(text(page,'#timer')=='0','debate ends');")
s=s.replace("  page.clock.install();assert_true(page.locator('#start').is_disabled(),'pick side before start');", "  page.wait_for_timeout(50);page.clock.install();assert_true(page.locator('#start').is_disabled(),'pick side before start');")
p.write_text(s)
print('Verified legacy enhancement repair and preserved all functional assertions.')
