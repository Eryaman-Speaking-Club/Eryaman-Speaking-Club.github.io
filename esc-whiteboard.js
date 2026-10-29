/* ESC Whiteboard - a shared, local-first drawing surface for the Game Hub and games. */
(() => {
  'use strict';
  if (window.ESCWhiteboard) return;

  const VERSION = '20261029-whiteboard1';
  const STORAGE_KEY = 'esc-whiteboard-v1';
  const MAX_ITEMS = 300;
  const COLORS = [
    ['Navy', '#24466b'], ['Teal', '#198b83'], ['Coral', '#e36c6a'],
    ['Gold', '#e6aa36'], ['Purple', '#8468c9'], ['Green', '#49a66e'],
    ['Black', '#202a37'], ['White', '#ffffff']
  ];
  const TOOLS = [
    ['pen', '✎', 'Pen'], ['highlighter', '▰', 'Highlight'],
    ['eraser', '◇', 'Eraser'], ['text', 'T', 'Text'],
    ['sticky', '▤', 'Sticky note'], ['line', '╱', 'Line'],
    ['rectangle', '▭', 'Rectangle'], ['circle', '◯', 'Circle'],
    ['stamp', '★', 'Sticker']
  ];
  const STAMPS = ['⭐', '💡', '❤️', '😂', '🎯', '🚀'];
  const CHALLENGES = [
    'Draw your dream holiday. Let others guess the destination.',
    'Draw a silly animal. Describe it using three adjectives.',
    'Sketch a mystery object without writing its name.',
    'Draw your perfect weekend in just 30 seconds.',
    'Sketch three clues about your favourite food.',
    'Invent a new gadget. Explain what it does in English.',
    'Draw an emotion. Ask the group to guess it.',
    'Make a tiny comic with a surprising ending.'
  ];

  const state = {
    open: false, tool: 'pen', color: '#24466b', size: 7, stamp: '⭐',
    paper: 'dots', items: [], redo: [], active: null, pointerId: null,
    editing: null, challengeIndex: -1, lastFocused: null, previousOverflow: '',
    width: 0, height: 0, ratio: 1, frame: 0, warningShown: false
  };
  let layer, launch, canvas, stage, editor, textInput, toastTimer;
  let resizeObserver;

  const $ = (selector, root = layer) => root.querySelector(selector);
  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
  const round = number => Math.round(number * 10000) / 10000;
  const finite = number => typeof number === 'number' && Number.isFinite(number);
  const validColor = color => typeof color === 'string' && /^#[\da-f]{6}$/i.test(color);

  function sanitizeItem(item) {
    if (!item || typeof item !== 'object') return null;
    if (!TOOLS.some(tool => tool[0] === item.tool)) return null;
    const clean = {
      tool: item.tool,
      color: validColor(item.color) ? item.color : '#24466b',
      size: clamp(Number(item.size) || 7, 2, 42),
      points: Array.isArray(item.points)
        ? item.points.slice(0, 650).filter(p => p && finite(p.x) && finite(p.y))
          .map(p => ({ x: clamp(p.x, 0, 1), y: clamp(p.y, 0, 1) }))
        : []
    };
    if (!clean.points.length) return null;
    if (item.tool === 'text' || item.tool === 'sticky') {
      clean.text = String(item.text || '').slice(0, 220);
      if (!clean.text.trim()) return null;
    }
    if (item.tool === 'stamp') clean.stamp = STAMPS.includes(item.stamp) ? item.stamp : STAMPS[0];
    return clean;
  }

  function restore() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!stored || typeof stored !== 'object') return;
      state.items = Array.isArray(stored.items)
        ? stored.items.slice(-MAX_ITEMS).map(sanitizeItem).filter(Boolean) : [];
      if (['dots', 'grid', 'plain', 'chalk'].includes(stored.paper)) state.paper = stored.paper;
    } catch (_) { /* Storage is optional; no sign-in required. */ }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items.slice(-MAX_ITEMS), paper: state.paper }));
    } catch (_) {
      if (!state.warningShown) {
        state.warningShown = true;
        notify('Storage is full. Download a PNG to keep your drawing.');
      }
    }
  }

  function create(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function makeButton(label, action, className, title) {
    const button = create('button', className, label);
    button.type = 'button';
    button.dataset.action = action;
    if (title) button.title = title;
    return button;
  }

  function buildUI() {
    const css = create('link');
    css.rel = 'stylesheet';
    css.href = `/esc-whiteboard.css?v=${VERSION}`;
    document.head.appendChild(css);

    layer = create('div', 'esc-wb-overlay');
    layer.hidden = true;
    layer.innerHTML = `
      <section class="esc-wb-dialog" role="dialog" aria-modal="true" aria-labelledby="escWbTitle" tabindex="-1">
        <header class="esc-wb-header">
          <div class="esc-wb-heading">
            <span class="esc-wb-mark" aria-hidden="true">✎</span>
            <div><p>ERYAMAN SPEAKING CLUB · PLAY SPACE</p><h2 id="escWbTitle">Whiteboard <span class="esc-wb-sparkle" aria-hidden="true">✦</span></h2></div>
          </div>
          <div class="esc-wb-header-actions">
            <button type="button" class="esc-wb-header-button" data-action="download" aria-label="Save Whiteboard as PNG" title="Save a picture of your board">↓ <span>Save PNG</span></button>
            <button type="button" class="esc-wb-close" data-action="close" aria-label="Close Whiteboard">×</button>
          </div>
        </header>
        <div class="esc-wb-tools" aria-label="Whiteboard drawing tools">
          <div class="esc-wb-toolset" data-toolset role="group" aria-label="Choose a tool"></div>
          <div class="esc-wb-tool-extra">
            <div class="esc-wb-colors" data-colors role="group" aria-label="Choose a color"></div>
            <label class="esc-wb-size" title="Brush size"><span>Size</span><input type="range" min="2" max="32" step="1" value="7" data-size aria-label="Brush size"><output data-size-label>7</output></label>
          </div>
          <div class="esc-wb-options">
            <label class="esc-wb-paper-label">Paper <select data-paper aria-label="Whiteboard background"><option value="dots">Dotted</option><option value="plain">Plain</option><option value="grid">Grid</option><option value="chalk">Chalkboard</option></select></label>
            <button type="button" class="esc-wb-small" data-action="undo" title="Undo (Ctrl/⌘+Z)" aria-label="Undo">↶</button>
            <button type="button" class="esc-wb-small" data-action="redo" title="Redo (Ctrl/⌘+Shift+Z)" aria-label="Redo">↷</button>
            <button type="button" class="esc-wb-clear" data-action="clear">Clear</button>
          </div>
        </div>
        <div class="esc-wb-stamp-row" data-stamps hidden><span>Pick a sticker</span><div data-stamp-list></div></div>
        <div class="esc-wb-challenge">
          <span class="esc-wb-challenge-label">DRAW &amp; GUESS</span>
          <p data-challenge>Try a quick sketch. Can your friends guess it in English?</p>
          <button type="button" data-action="challenge">Surprise me <span aria-hidden="true">↻</span></button>
        </div>
        <div class="esc-wb-board-wrap">
          <div class="esc-wb-board" data-paper="dots">
            <canvas aria-label="Whiteboard drawing surface. Choose a tool then draw with mouse, touch, or stylus."></canvas>
            <div class="esc-wb-editor" data-editor hidden>
              <label for="escWbInput" data-editor-label>Add text</label>
              <textarea id="escWbInput" maxlength="220" rows="3" placeholder="Write something in English..."></textarea>
              <div><button type="button" data-action="cancel-text">Cancel</button><button type="button" data-action="save-text">Add to board</button></div>
            </div>
          </div>
        </div>
        <footer class="esc-wb-footer">
          <span><span class="esc-wb-saved-dot" aria-hidden="true"></span> Auto-saved in this browser · Use screen sharing for group play</span>
          <span>Tip: Text &amp; sticky notes work with a tap or click.</span>
        </footer>
        <div class="esc-wb-toast" data-toast role="status" aria-live="polite" hidden></div>
      </section>`;

    document.body.appendChild(layer);
    canvas = $('canvas');
    stage = $('.esc-wb-board');
    editor = $('[data-editor]');
    textInput = $('#escWbInput');
    $('[data-paper]').value = state.paper;
    stage.dataset.paper = state.paper;

    for (const [tool, symbol, name] of TOOLS) {
      const btn = makeButton(symbol, `tool:${tool}`, 'esc-wb-tool', name);
      btn.setAttribute('aria-label', name);
      btn.setAttribute('aria-pressed', tool === state.tool ? 'true' : 'false');
      btn.dataset.tool = tool;
      $('[data-toolset]').appendChild(btn);
    }
    for (const [name, color] of COLORS) {
      const btn = makeButton('', `color:${color}`, 'esc-wb-color', name);
      btn.style.setProperty('--swatch', color);
      btn.setAttribute('aria-label', name);
      btn.setAttribute('aria-pressed', String(color === state.color));
      btn.dataset.color = color;
      $('[data-colors]').appendChild(btn);
    }
    for (const emoji of STAMPS) {
      const btn = makeButton(emoji, `stamp:${emoji}`, 'esc-wb-stamp', `Stamp ${emoji}`);
      btn.setAttribute('aria-pressed', String(state.stamp === emoji));
      $('[data-stamp-list]').appendChild(btn);
    }

    layer.addEventListener('click', onButtonClick);
    layer.addEventListener('change', onChange);
    $('[data-size]').addEventListener('input', event => {
      state.size = Number(event.target.value);
      $('[data-size-label]').textContent = state.size;
    });
    textInput.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault(); saveText();
      }
    });
    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', moveDrawing);
    canvas.addEventListener('pointerup', endDrawing);
    canvas.addEventListener('pointercancel', endDrawing);
    layer.addEventListener('pointerdown', event => {
      if (event.target === layer) close();
    });
    document.addEventListener('keydown', onKeydown, true);

    resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(stage);
    refreshControls();
  }

  function mountLaunch() {
    if (document.querySelector('.esc-wb-launch')) return;
    const header = document.querySelector('.game-actions, .new-game-actions, .header-actions, .esc-display-actions, .game-topbar, .new-game-topbar');
    if (!header) return;
    launch = create('button', 'esc-wb-launch');
    launch.type = 'button';
    launch.innerHTML = '<span aria-hidden="true">✎</span><span class="esc-wb-launch-label">Whiteboard</span>';
    launch.setAttribute('aria-label', 'Open Whiteboard');
    launch.title = 'Draw, write and play together';
    launch.addEventListener('click', open);
    header.appendChild(launch);

    const hubHero = document.querySelector('.hub-hero');
    if (hubHero && !document.querySelector('.esc-wb-hub-banner')) {
      const banner = create('div', 'esc-wb-hub-banner');
      const info = create('div');
      info.innerHTML = '<strong>Whiteboard is ready.</strong><span>Draw clues, write words and play together — available inside every game.</span>';
      const btn = makeButton('Open Whiteboard ↗', 'open', 'esc-wb-hub-open');
      btn.addEventListener('click', open);
      banner.append(info, btn);
      hubHero.insertAdjacentElement('afterend', banner);
    }
  }

  function open() {
    if (!layer) return;
    state.lastFocused = document.activeElement;
    state.previousOverflow = document.body.style.overflow;
    layer.hidden = false;
    document.body.style.overflow = 'hidden';
    state.open = true;
    refreshControls();
    requestAnimationFrame(() => {
      resizeCanvas();
      $('.esc-wb-dialog').focus();
    });
  }

  function close() {
    if (!state.open) return;
    if (state.active) endDrawing();
    cancelText();
    layer.hidden = true;
    state.open = false;
    document.body.style.overflow = state.previousOverflow;
    state.lastFocused?.focus?.();
  }

  function onButtonClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button || !layer.contains(button)) return;
    const action = button.dataset.action;
    if (action.startsWith('tool:')) {
      cancelText();
      state.tool = action.split(':')[1];
      refreshControls();
    } else if (action.startsWith('color:')) {
      state.color = action.split(':')[1];
      refreshControls();
    } else if (action.startsWith('stamp:')) {
      state.stamp = action.split(':')[1];
      state.tool = 'stamp';
      refreshControls();
    } else if (action === 'undo') undo();
    else if (action === 'redo') redo();
    else if (action === 'clear') clear();
    else if (action === 'download') download();
    else if (action === 'challenge') nextChallenge();
    else if (action === 'close') close();
    else if (action === 'save-text') saveText();
    else if (action === 'cancel-text') cancelText();
  }

  function onChange(event) {
    if (!event.target.matches('[data-paper]')) return;
    state.paper = ['dots', 'grid', 'plain', 'chalk'].includes(event.target.value) ? event.target.value : 'dots';
    stage.dataset.paper = state.paper;
    if (state.paper === 'chalk' && state.color === '#24466b') state.color = '#ffffff';
    else if (state.paper !== 'chalk' && state.color === '#ffffff') state.color = '#24466b';
    persist();
    refreshControls();
  }

  function onKeydown(event) {
    if (!state.open) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!editor.hidden) cancelText(); else close();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [...layer.querySelectorAll('button:not(:disabled), select, input, textarea, [tabindex="0"]')]
        .filter(el => el.getClientRects().length);
      if (focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    if (!editor.hidden || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault(); event.stopPropagation();
      if (event.shiftKey) redo(); else undo();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault(); event.stopPropagation(); redo();
    }
  }

  function refreshControls() {
    if (!layer) return;
    layer.querySelectorAll('[data-tool]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.tool === state.tool));
    });
    layer.querySelectorAll('[data-color]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.color === state.color));
    });
    layer.querySelectorAll('[data-stamp-list] button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.action === `stamp:${state.stamp}`));
    });
    $('[data-stamps]').hidden = state.tool !== 'stamp';
    $('[data-action="undo"]').disabled = state.items.length === 0;
    $('[data-action="redo"]').disabled = state.redo.length === 0;
    $('[data-action="clear"]').disabled = state.items.length === 0;
    $('[data-paper]').value = state.paper;
    stage.dataset.paper = state.paper;
    canvas.style.cursor = ['text', 'sticky'].includes(state.tool) ? 'text' : 'crosshair';
  }

  function resizeCanvas() {
    if (!state.open || !canvas) return;
    const bounds = stage.getBoundingClientRect();
    const width = Math.round(bounds.width), height = Math.round(bounds.height);
    if (width < 10 || height < 10) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (width !== state.width || height !== state.height || ratio !== state.ratio) {
      state.width = width; state.height = height; state.ratio = ratio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    schedulePaint();
  }

  function pointFrom(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: round(clamp((event.clientX - bounds.left) / bounds.width, 0, 1)),
      y: round(clamp((event.clientY - bounds.top) / bounds.height, 0, 1))
    };
  }

  function startDrawing(event) {
    if (event.button !== 0 && event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    if (state.active || !editor.hidden) return;
    event.preventDefault();
    const point = pointFrom(event);
    if (state.tool === 'text' || state.tool === 'sticky') {
      openEditor(point);
      return;
    }
    if (state.tool === 'stamp') {
      commit({ tool: 'stamp', stamp: state.stamp, color: state.color, size: state.size, points: [point] });
      return;
    }
    state.pointerId = event.pointerId;
    canvas.setPointerCapture?.(event.pointerId);
    state.active = { tool: state.tool, color: state.color, size: state.size, points: [point] };
    schedulePaint();
  }

  function moveDrawing(event) {
    if (!state.active || event.pointerId !== state.pointerId) return;
    event.preventDefault();
    const point = pointFrom(event);
    const points = state.active.points;
    const last = points[points.length - 1];
    if (['pen', 'highlighter', 'eraser'].includes(state.active.tool)) {
      const distance = Math.hypot((point.x - last.x) * 1.3, point.y - last.y);
      if (distance > 0.0018 && points.length < 650) points.push(point);
      else if (points.length >= 650) points[points.length - 1] = point;
    } else {
      if (points.length === 1) points.push(point); else points[1] = point;
    }
    schedulePaint();
  }

  function endDrawing(event) {
    if (!state.active || (event && event.pointerId !== state.pointerId)) return;
    if (event) {
      event.preventDefault();
      try { canvas.releasePointerCapture?.(event.pointerId); } catch (_) {}
    }
    const item = state.active;
    state.active = null;
    state.pointerId = null;
    commit(item);
  }

  function commit(item) {
    const clean = sanitizeItem(item);
    if (!clean) return;
    state.items.push(clean);
    if (state.items.length > MAX_ITEMS) state.items.shift();
    state.redo.length = 0;
    persist(); refreshControls(); schedulePaint();
  }

  function undo() {
    if (!state.items.length) return;
    state.redo.push(state.items.pop());
    persist(); refreshControls(); schedulePaint();
  }
  function redo() {
    if (!state.redo.length) return;
    state.items.push(state.redo.pop());
    persist(); refreshControls(); schedulePaint();
  }
  function clear() {
    if (!state.items.length) return;
    if (!window.confirm('Clear everything on this whiteboard? This cannot be undone.')) return;
    state.items = []; state.redo = [];
    persist(); refreshControls(); schedulePaint(); notify('Clean slate!');
  }

  function openEditor(point) {
    state.editing = { point, tool: state.tool, color: state.color, size: state.size };
    const w = stage.clientWidth, h = stage.clientHeight;
    editor.style.left = `${clamp(point.x * w, 8, Math.max(8, w - 260))}px`;
    editor.style.top = `${clamp(point.y * h, 8, Math.max(8, h - 215))}px`;
    $('[data-editor-label]').textContent = state.tool === 'sticky' ? 'Write a sticky note' : 'Add text';
    textInput.placeholder = state.tool === 'sticky' ? 'A clue, a challenge, or an idea...' : 'Write something in English...';
    textInput.value = '';
    editor.hidden = false;
    textInput.focus();
  }

  function saveText() {
    if (!state.editing) return;
    const text = textInput.value.trim();
    if (!text) { textInput.focus(); return; }
    const item = {
      tool: state.editing.tool, color: state.editing.color, size: state.editing.size,
      points: [state.editing.point], text
    };
    cancelText();
    commit(item);
  }
  function cancelText() {
    if (!editor) return;
    state.editing = null;
    editor.hidden = true;
    if (state.open) canvas.focus?.();
  }

  function nextChallenge() {
    let index = Math.floor(Math.random() * CHALLENGES.length);
    if (CHALLENGES.length > 1 && index === state.challengeIndex) index = (index + 1) % CHALLENGES.length;
    state.challengeIndex = index;
    $('[data-challenge]').textContent = CHALLENGES[index];
  }

  function notify(message) {
    if (!layer) return;
    const toast = $('[data-toast]');
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3000);
  }

  function schedulePaint() {
    if (state.frame) return;
    state.frame = requestAnimationFrame(() => {
      state.frame = 0;
      if (!canvas || !state.open || !state.width || !state.height) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawItems(ctx, state.width, state.height, state.ratio);
    });
  }

  function drawItems(ctx, width, height, ratio = 1) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    for (const item of state.items) drawItem(ctx, width, height, item);
    if (state.active) drawItem(ctx, width, height, state.active);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawItem(ctx, width, height, item) {
    if (!item.points?.length) return;
    ctx.save();
    const points = item.points.map(p => ({ x: p.x * width, y: p.y * height }));
    const first = points[0], last = points[points.length - 1];
    const scale = Math.max(0.62, Math.min(width / 950, height / 540));
    const thickness = Math.max(1.5, item.size * scale);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = thickness;
    const inkColor = state.paper === 'chalk' && ['#24466b', '#202a37'].includes(item.color) ? '#f4fbff' : item.color;
    ctx.strokeStyle = inkColor;
    ctx.fillStyle = inkColor;

    if (item.tool === 'pen' || item.tool === 'highlighter' || item.tool === 'eraser') {
      if (item.tool === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = thickness * 2.4; }
      if (item.tool === 'highlighter') { ctx.globalAlpha = 0.3; ctx.lineWidth = thickness * 3.3; }
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      if (points.length === 1) {
        ctx.lineTo(first.x + 0.01, first.y + 0.01);
      } else {
        for (let i = 1; i < points.length - 1; i++) {
          const centerX = (points[i].x + points[i + 1].x) / 2;
          const centerY = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, centerX, centerY);
        }
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();
    } else if (item.tool === 'line') {
      ctx.beginPath(); ctx.moveTo(first.x, first.y); ctx.lineTo(last.x, last.y); ctx.stroke();
    } else if (item.tool === 'rectangle') {
      ctx.strokeRect(first.x, first.y, last.x - first.x, last.y - first.y);
    } else if (item.tool === 'circle') {
      ctx.beginPath();
      ctx.ellipse((first.x + last.x) / 2, (first.y + last.y) / 2,
        Math.max(0.5, Math.abs(last.x - first.x) / 2), Math.max(0.5, Math.abs(last.y - first.y) / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (item.tool === 'stamp') {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(52 * scale + item.size * scale)}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.fillText(item.stamp || STAMPS[0], first.x, first.y);
    } else if (item.tool === 'text' || item.tool === 'sticky') {
      const sticky = item.tool === 'sticky';
      const fontSize = Math.max(14, (sticky ? 21 : 27) * scale);
      const lineHeight = fontSize * 1.4;
      const maxWidth = Math.min(width * (sticky ? 0.31 : 0.55), 350 * scale);
      const padding = 14 * scale;
      ctx.font = `${sticky ? '600' : '700'} ${fontSize}px system-ui, -apple-system, sans-serif`;
      const lines = wrapText(ctx, item.text || '', maxWidth, sticky ? 6 : 9);
      if (sticky) {
        const boxWidth = maxWidth + padding * 2;
        const boxHeight = Math.max(lineHeight + padding * 2, lines.length * lineHeight + padding * 2);
        ctx.shadowColor = 'rgba(16, 38, 60, .14)'; ctx.shadowBlur = 12 * scale; ctx.shadowOffsetY = 4 * scale;
        ctx.fillStyle = '#fff1ad';
        ctx.fillRect(first.x, first.y, boxWidth, boxHeight);
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = '#e6cf7f'; ctx.lineWidth = 1.5 * scale;
        ctx.strokeRect(first.x, first.y, boxWidth, boxHeight);
        ctx.fillStyle = '#4b422e';
      }
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], first.x + (sticky ? padding : 0),
          first.y + (sticky ? padding : 0) + i * lineHeight);
      }
    }
    ctx.restore();
  }

  function wrapText(ctx, value, maxWidth, maxLines) {
    const lines = [];
    const rawLines = String(value).replace(/\r/g, '').split('\n');
    for (const raw of rawLines) {
      let line = '';
      for (const word of raw.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line); line = word;
        } else line = candidate;
        if (lines.length >= maxLines) return lines;
      }
      if (line) lines.push(line);
      else if (!raw) lines.push(' ');
      if (lines.length >= maxLines) return lines;
    }
    return lines;
  }

  function drawPaper(ctx, width, height) {
    const dark = state.paper === 'chalk';
    ctx.fillStyle = dark ? '#192d3d' : '#fffefb';
    ctx.fillRect(0, 0, width, height);
    const step = Math.max(16, width / 48);
    if (state.paper === 'dots' || state.paper === 'chalk') {
      ctx.fillStyle = dark ? '#3e5565' : '#d4e2eb';
      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          ctx.beginPath(); ctx.arc(x, y, Math.max(1.4, width / 1050), 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (state.paper === 'grid') {
      ctx.strokeStyle = '#e6ecf3'; ctx.lineWidth = Math.max(1, width / 1600);
      for (let x = 0; x < width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y < height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    }
  }

  function download() {
    try {
      const width = 1600, height = 1000;
      const output = document.createElement('canvas'); output.width = width; output.height = height;
      const ctx = output.getContext('2d');
      drawPaper(ctx, width, height);
      const ink = document.createElement('canvas'); ink.width = width; ink.height = height;
      drawItems(ink.getContext('2d'), width, height, 1);
      ctx.drawImage(ink, 0, 0);
      output.toBlob(blob => {
        if (!blob) { notify('Could not export this drawing.'); return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `esc-whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = url; document.body.appendChild(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
        notify('Whiteboard saved as PNG.');
      }, 'image/png');
    } catch (_) { notify('Could not export this drawing.'); }
  }

  function mount() {
    if (!document.body) return;
    restore(); buildUI(); mountLaunch();
    window.ESCWhiteboard = { open, close };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
