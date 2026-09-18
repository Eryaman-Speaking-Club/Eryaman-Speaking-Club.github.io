"""Prepare existing native pages without changing editable content or games."""
from pathlib import Path
import hashlib
import re
import shutil

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / '_site'


def build() -> None:
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    excluded = {'.git', '.github', '_site', 'tests', 'test-results', '__pycache__', 'build_static.py'}
    OUTPUT.mkdir()
    for item in ROOT.iterdir():
        if item.name in excluded:
            continue
        dest = OUTPUT / item.name
        if item.is_dir():
            shutil.copytree(item, dest)
        elif item.is_file():
            shutil.copy2(item, dest)
    helper = (ROOT / 'native-language-navigation.js').read_text(encoding='utf-8')
    main_script = (ROOT / 'home.js').read_text(encoding='utf-8')
    bundled = helper + '\n;\n' + main_script
    (OUTPUT / 'home.js').write_text(bundled, encoding='utf-8')
    revision = hashlib.sha256(bundled.encode()).hexdigest()[:16]
    pattern = re.compile(r'''(src=["'])([^"']*\bhome\.js)(?:\?[^"']*)?(["'])''')
    count = 0
    for file in OUTPUT.rglob('*.html'):
        text = file.read_text(encoding='utf-8')
        updated, matches = pattern.subn(lambda m: m[1] + m[2] + '?v=' + revision + m[3], text)
        if matches:
            # Preserve real HTML language and all Turkish case behavior.
            # Apply only to the English body's Latin font selection.
            style = '<style data-native-language-font>html[lang="en"] body{-webkit-locale:auto}</style>'
            updated = updated.replace('<head>', '<head>\n  ' + style, 1)
            file.write_text(updated, encoding='utf-8')
            count += 1
    if count < 3:
        raise RuntimeError('Expected root, TR and EN homepage script references.')
    for path in ('index.html', 'tr/index.html', 'en/index.html'):
        if not (OUTPUT / path).is_file():
            raise RuntimeError('Required native page is missing: ' + path)
    print(f'Built {count} homepage script references at revision {revision}')


if __name__ == '__main__':
    build()
