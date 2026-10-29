'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');
const sources=['esc-game-master.js','esc-game-controls.js','esc-game-extras.js','esc-whiteboard.js','esc-supabase.js'];
for(const file of sources){
  assert(fs.existsSync(file),'Missing '+file);
  new vm.Script(read(file),{filename:file});
}
for(const file of ['esc-game-master.css','esc-game-extras.css','esc-whiteboard.css','esc-game-controls.css']){
  assert(fs.existsSync(file),'Missing stylesheet '+file);
}
const gm=read('esc-game-master.js');
const match=gm.match(/const GAMES=(\[[^;]+\]);/);
assert(match,'Missing Game Master game list');
const games=JSON.parse(match[1]);
assert.equal(games.length,32,'Exactly 32 game pages should be supported');
assert.equal(new Set(games).size,32,'No duplicate games');
const controls=read('esc-game-controls.js');
assert(controls.includes('esc-game-master.js?v=20261029-mvp3'),'Outdated Game Master script');
assert(controls.includes('esc-game-extras.js'),'Missing shared controls');
assert(controls.includes('esc-whiteboard.js'),'Missing Whiteboard loader');
assert(gm.includes('function viewSignature()'),'Live render stability protection missing');
assert(gm.includes('boardPainting||isEditing'),'Input or drawing protection missing');
for(const action of ['esc_live_create','esc_live_join','esc_live_snapshot','esc_live_action','mix_start','mix_next','mix_stop','board_add','kick','leave']){
  assert(gm.includes(action),'Missing action '+action);
}
assert(read('play/index.html').includes('esc-game-master.js?v=20261029-mvp3'),'Join page running old script');
for(const slug of games){
  const page=slug+'/index.html';
  assert(fs.existsSync(page),'Missing game: '+slug);
  const html=read(page);
  const refs=html.match(/esc-game-controls\.js\?v=20261029-gm3/g)||[];
  assert.equal(refs.length,1,'Missing or duplicated current controls in '+slug);
  assert(html.includes('esc-supabase.js'),'Missing Supabase client in '+slug);
  assert(html.includes('esc-supabase-config.js'),'Missing Supabase config in '+slug);
  assert(/<header\b/i.test(html),'Missing toolbar host in '+slug);
}
const tracks=read('esc-game-extras.js');
const trackSection=tracks.slice(tracks.indexOf('const TRACKS ='),tracks.indexOf('const state ='));
assert.equal((trackSection.match(/mode:\s*'/g)||[]).length,10,'Expected 10 music tracks');
console.log('ESC smoke checks passed: 32 routes, shared scripts, live controls, 10 tracks.');
