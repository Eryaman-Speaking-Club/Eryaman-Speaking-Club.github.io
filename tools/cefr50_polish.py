#!/usr/bin/env python3
"""Keep legacy decorative level labels in sync with the active buttons."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'cefr-runtime.js';s=p.read_text()
old='function paint(){'
new="function paint(){\n if(slug==='one-for-me-one-for-you'){const badge=document.getElementById('level');if(badge)badge.textContent=level+' LEVEL';}"
if new not in s:
    if s.count(old)!=1:raise RuntimeError('Missing paint entrypoint')
    p.write_text(s.replace(old,new,1))
p=ROOT/'cefr.css';s=p.read_text()
extra='\n[data-cefr-loading] #scenarioCard{visibility:hidden}\n'
if extra not in s:p.write_text(s+extra)
p=ROOT/'tests/cefr-buttons.cjs';s=p.read_text()
old="assert.equal(state.level,level);assert.deepEqual(state.pressed,[level]);"
new="assert.equal(state.level,level);if(slug==='one-for-me-one-for-you')assert.equal(await page.locator('#level').textContent(),level+' LEVEL');assert.deepEqual(state.pressed,[level]);"
if new not in s:
    if s.count(old)!=1:raise RuntimeError('Missing level assertion')
    s=s.replace(old,new,1)
old="await page.screenshot({path:'cefr50-'+slug+'-desktop.png',fullPage:true});"
new="await page.mouse.move(0,0);await page.waitForTimeout(250);await page.screenshot({path:'cefr50-'+slug+'-desktop.png',fullPage:true});"
if new not in s:
    if s.count(old)!=1:raise RuntimeError('Missing screenshot assertion')
    s=s.replace(old,new,1)
p.write_text(s)
print('Release50 visible level labels verified.')
