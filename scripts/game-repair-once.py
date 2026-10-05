"""One-time, checksum-locked transport of the locally tested public-game repairs."""
import base64
import hashlib
import json
import subprocess
import zlib
from pathlib import Path

ROOT = Path.cwd()
expected_parts = [
    '035a328b5420ae5a8dbeda6571c2a316f2a97679bd7ed11eb28ea2d82ac05f48',
    'ef8b9eeeb4c3f9eda0790ab39514213c2fc3719221941739c52941d233d3cb18',
    'ec4f32dbdbba94968b5a561949f701d3d9f116947f76c0f044bdb938d8c7e6b7',
]
parts = []
for i, expected in enumerate(expected_parts):
    part = ''.join((ROOT / ('scripts/game-repair-payload.' + str(i))).read_text().split())
    # Repair transcription-only transport errors; no source edits before all hashes pass.
    part = part.replace('ByNmRhyGGMcM3dmagZF', 'ByNmRhyLcM3dmagZF')
    part = part.replace('Ff0ye80jHbbg', 'Ff0ye80Hbbg')
    actual = hashlib.sha256(part.encode()).hexdigest()
    if actual != expected:
        print('Transport mismatch in part', i, 'sha256', actual, flush=True)
        print('RECEIVED_PART_BEGIN\n' + part + '\nRECEIVED_PART_END', flush=True)
        raise SystemExit('No source changes applied: repair bundle hash mismatch.')
    parts.append(part)
DATA = ''.join(parts)
assert hashlib.sha256(DATA.encode()).hexdigest() == '40da43eaf2f0943b0c9c3c3c028eb231e9e677df2f7afc32324f80369843fb6b'
payload = json.loads(zlib.decompress(base64.b64decode(DATA)))
for name, expected in payload['old'].items():
    path = ROOT / name
    actual = hashlib.sha256(path.read_bytes()).hexdigest() if path.exists() else None
    if actual != expected:
        raise SystemExit('Base file changed; refusing to overwrite: ' + name)
for name, content in payload['new_files'].items():
    path = ROOT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
exec(compile(payload['engine'], 'repair_engine', 'exec'), {'ROOT': ROOT})
exec(compile(payload['public'], 'repair_public', 'exec'), {'ROOT': ROOT, 'INVENTORY': payload['inventory']})
for name, expected in payload['new'].items():
    if hashlib.sha256((ROOT / name).read_bytes()).hexdigest() != expected:
        raise SystemExit('Output verification failed: ' + name)
for name in ['esc-game-controls.js', 'esc-game-kit.js', 'esc-new-games.js', 'taboo/round.js']:
    subprocess.run(['node', '--check', str(ROOT / name)], check=True)
qa = ROOT / '_game_audit'
qa.mkdir(exist_ok=True)
(qa / 'inventory.json').write_text(json.dumps(payload['inventory']))
(qa / 'harness.py').write_text(payload['qa_harness'])
(qa / 'test_games.py').write_text(payload['qa_tests'])
(qa / 'test_mobile.py').write_text(payload['qa_mobile'])
(qa / 'changed_paths.json').write_text(json.dumps(list(payload['new'])))
print('Verified exactly', len(payload['new']), 'updated files for', len(payload['inventory']), 'games.')
subprocess.run(['python', 'scripts/game-repair-followup.py'], check=True)
subprocess.run(['node', '--check', 'esc-depth-pass.js'], check=True)
