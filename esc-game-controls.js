/* Shared display control for every public game. No game state is reset. */
(() => {
  'use strict';
  if (window.ESCFullscreen) return;
  let button = null, busy = false, fallback = false;
  const HOW_TO_PLAY={
    'truth-or-dare':'Spin a player → choose Truth or Dare → complete one card → move to the next player.',
    'one-for-me-one-for-you':'Draw a question → answer in a few sentences → another player asks one follow-up → pass the next card.',
    'last-thing-you-did':'Read the prompt → answer with the most recent real example you remember → add one short detail.',
    'what-would-you-do-if':'Read the situation → say what you would do first → explain why → let someone ask one follow-up.',
    'would-you-rather':'Choose A or B first → give one reason → someone on the other side may respond once.',
    'most-likely-to':'Read the prompt → count 3–2–1 → everyone points to one person → the most-voted person can defend themselves.',
    'hot-seat':'One player answers quick prompts for 60 seconds → tap Got it after a complete answer → skip if stuck.',
    'five-second-challenge':'Start the 5-second timer → give three different answers before time runs out → record made or missed.',
    'red-flag-green-flag':'Read the situation → choose Red Flag or Green Flag → explain one reason → compare different opinions.',
    'taboo':'Set teams and players → start 60s → +1 correct, −1 Taboo, maximum 3 passes → when time ends, give the device to the next named player.',
    'debate-roulette':'Read the motion → choose FOR or AGAINST → think for 10 seconds → speak for 45 seconds with at least one reason.',
    'never-have-i-ever':'Read the statement → choose I HAVE or NEVER → share a short story only if you want to.',
    'two-truths-one-lie':'Use the topic to say three believable statements → exactly two are true → the group asks one question and votes on the lie.',
    'who-am-i':'One player privately sees the target → everyone else asks yes/no questions → guess it within 15 questions.',
    'story-chain':'Read the opening → each player adds 1–2 connected sentences → keep earlier details → try to reach an ending.',
    'explain-it-badly':'Privately read the target → explain it indirectly without naming, spelling or translating it → group guesses.',
    'question-roulette':'Draw a question → answer with a reason or example → use the follow-up → pass to someone new.',
    'opinion-line':'Choose your position first → explain why → give one example → compare reasons without trying to win.',
    'ranking-room':'Rank all five options → explain your #1 choice → compare rankings → try to agree on one group order.',
    'detective-alibi':'Choose one Detective → group gets 30 seconds to agree on the alibi → Detective questions each player and looks for contradictions.',
    'finish-the-sentence':'Complete the sentence naturally → add one reason, example or short story → pass the next card.',
    'three-clues':'One player privately sees the word → give exactly three English clues → group gets one guess after each clue.',
    'secret-mission':'Read one mission privately → hide it and pass the screen → complete it naturally during conversation → reveal it later.',
    'one-minute-story':'Use all three words in one connected story → include a beginning, problem and ending → finish within 60 seconds.',
    'would-i-lie-to-you':'Use the topic to tell a true or invented story → group asks up to two questions → everyone votes TRUE or LIE.',
    'desert-island':'Read the survival situation → choose exactly three items → explain why each matters → compare strategies.',
    'conversation-bingo':'Find people who match the squares → ask a real follow-up before marking → complete a row, column or full card.',
    'emoji-story':'Use every emoji in one connected story → give it a beginning, problem and ending.',
    'worst-advice-only':'Round 1: give obviously bad but safe advice → switch to Round 2 → give genuinely useful advice.',
    'sell-me-this':'Read the product and customer → prepare quickly → sell it in 30 seconds using benefits → finish with a call to action.',
    'hot-take':'Choose a side → defend it for 30 seconds → one person gives a short counterargument → you may change your mind.',
    'photo-talk':'Describe what you see first → imagine what happened before → predict what happens next → add one character thought.'
  };
  function mountHowToPlay(){
    if(document.querySelector('.esc-how-to-play'))return;
    const slug=(location.pathname.split('/').filter(Boolean).pop()||'').toLowerCase();
    const text=HOW_TO_PLAY[slug];
    if(!text)return;
    const hero=document.querySelector('.game-hero,.new-game-hero');
    if(!hero)return;
    const box=document.createElement('div');
    box.className='esc-how-to-play';
    box.innerHTML='<strong>How to play</strong><span>'+text+'</span>';
    hero.insertAdjacentElement('afterend',box);
  }
  const current = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  function notice(message) {
    let el = document.getElementById('escDisplayStatus');
    if (!el) {
      el = document.createElement('div'); el.id = 'escDisplayStatus';
      el.className = 'esc-display-status'; el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message; el.hidden = false;
    clearTimeout(el._hide); el._hide = setTimeout(() => { el.hidden = true; }, 5500);
  }
  function sync() {
    const active = Boolean(current()) || fallback;
    document.documentElement.classList.toggle('esc-game-presenting', active);
    if (!button) return;
    const label = active ? 'Exit fullscreen' : 'Fullscreen';
    button.title = label; button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('active', active);
    button.innerHTML = '<span aria-hidden="true">\u26f6</span>';
  }
  async function toggle() {
    if (busy) return;
    busy = true; button.disabled = true;
    try {
      if (current()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) await exit.call(document);
      } else if (fallback) {
        fallback = false;
      } else {
        const root = document.documentElement;
        const request = root.requestFullscreen || root.webkitRequestFullscreen;
        if (!request) throw new Error('FULLSCREEN_UNAVAILABLE');
        await request.call(root);
      }
    } catch (error) {
      if (!current()) {
        fallback = !fallback;
        notice('Browser fullscreen is unavailable. In-page presentation mode is on; use \u26f6 to exit.');
      } else {
        notice('Press Esc to exit fullscreen.');
      }
    } finally { busy = false; button.disabled = false; sync(); }
  }
  function mount() {
    if (button?.isConnected) return;
    let host = document.querySelector('.game-actions, .new-game-actions, .header-actions');
    if (!host) {
      const header = document.querySelector('header.topbar, header.site-header, header');
      if (!header) return;
      host = document.createElement('div'); host.className = 'esc-display-actions';
      const sound = header.querySelector('#soundBtn, #sound, [data-esc-sound]');
      if (sound) host.appendChild(sound);
      header.appendChild(host);
    }
    // Replace legacy controls so cached versions cannot attach duplicate listeners.
    const old = document.querySelector('#fullscreenGame, [data-esc-fullscreen]');
    button = document.createElement('button'); button.type = 'button';
    button.id = old?.id || 'escFullscreen'; button.className = 'esc-fullscreen-btn';
    button.setAttribute('data-esc-fullscreen', '1');
    if (old) old.replaceWith(button); else host.prepend(button);
    document.querySelectorAll('[data-esc-fullscreen]').forEach(el => { if (el !== button) el.remove(); });
    button.addEventListener('click', toggle);
    button.addEventListener('keydown', e => { if (e.code === 'Space' || e.key === 'Enter') e.stopPropagation(); });
    sync();
  }
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && fallback) { fallback = false; sync(); } });
  window.addEventListener('esc:languagechange', sync);
  window.ESCFullscreen = { mount, toggle };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { mount(); mountHowToPlay(); }); else { mount(); mountHowToPlay(); }
})();
