"""Build native pages; preserve source content, game code and real HTML language."""
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
            root_tag = re.search(r'<html\b[^>]*>', updated, re.IGNORECASE)
            if root_tag and re.search(r'''\blang=["']en["']''', root_tag[0]):
                if re.search(r'\bstyle=', root_tag[0]):
                    raise RuntimeError('Unexpected existing HTML root style; review before publishing.')
                # Inline BEFORE initial render-tree attachment. A later head or
                # body stylesheet is too late for WebKit's cold locale selection.
                # lang=en remains real; the helper preserves EN casing explicitly.
                tag = root_tag[0][:-1] + ' style="-webkit-locale: &quot;tr&quot;;">'
                updated = updated[:root_tag.start()] + tag + updated[root_tag.end():]
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
