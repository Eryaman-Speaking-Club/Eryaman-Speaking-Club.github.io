#!/usr/bin/env python3
"""Guarded usability refinements after build_cefr.py."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def change(path, old, new):
    p=ROOT/path
    s=p.read_text()
    if new in s:return
    if s.count(old)!=1:raise RuntimeError(f'CEFR refinement anchor missing: {path}: {old[:60]}')
    p.write_text(s.replace(old,new,1))
change('cefr-runtime.js',"if(slug==='hot-seat'&&typeof nextPrompt==='function')nextPrompt();else if(['taboo','debate-roulette'].includes(slug)&&typeof show==='function')show();", "if(slug==='hot-seat'&&typeof resetRound==='function')resetRound();else if(slug==='taboo'&&typeof prepareRound==='function')prepareRound();else if(slug==='debate-roulette'&&typeof show==='function')show();")
change('cefr-runtime.js',"if(type==='paired')return x&&text(x.q)&&text(x.f)&&text(x.id);", "if(type==='paired')return x&&text(x.q)&&text(x.f)&&text(x.id)&&(!x.level||LEVELS.includes(x.level));")
change('cefr-runtime.js',"if(!payload.every(x=>validItem(game,x)))return false;", "if(!payload.every(x=>validItem(game,x)))return false;\n if(bank.types[game]==='paired'&&new Set(payload.map(x=>x.id)).size!==payload.length)return false;")
change('cefr-source.js','Cats are good teachers.','Cats are funny pets.')
print('CEFR round resets, item validation and wording refinements applied.')
