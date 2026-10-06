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

  /* Answer helper: optional speaking scaffolds for every public game. */
  const ANSWER_COACH={
    'truth-or-dare':'For Truth, give one honest detail and one reason. For Dare, keep it simple and commit to the task — no perfect English needed.',
    'one-for-me-one-for-you':'Answer first, add why, then give one small real example. Leave one detail for the other person to ask about.',
    'last-thing-you-did':'Use a real recent memory: what happened, where, and one small detail.',
    'what-would-you-do-if':'Say your first move, explain why, then add what you would do next.',
    'would-you-rather':'Choose A or B immediately. Give one reason, then admit one downside of your choice.',
    'most-likely-to':'Pick one person and give a playful reason. Keep it friendly, not personal or insulting.',
    'hot-seat':'Speed beats perfection: short answer + one reason. Do not translate the whole sentence in your head.',
    'five-second-challenge':'Use the simplest words you know. Three quick answers are better than one perfect answer.',
    'red-flag-green-flag':'Choose the flag first, then explain the behaviour that made you choose it.',
    'taboo':'Think category → function → place → shape → comparison. Describe around the word without saying it.',
    'debate-roulette':'State your side first. Give one reason, one example, then answer the strongest objection you can think of.',
    'never-have-i-ever':'Choose HAVE or NEVER first. Add a 10-second story only if you are comfortable sharing it.',
    'two-truths-one-lie':'Use believable details. Make the lie close enough to real life that people have to think.',
    'who-am-i':'Ask broad yes/no questions first: person, place, job, era, country — then narrow it down.',
    'story-chain':'Connect to the previous sentence. Add one new detail, not five, and move the story forward.',
    'explain-it-badly':'Use purpose, location, shape, comparison or a ridiculous analogy without naming the target.',
    'question-roulette':'Answer + reason + example. A short personal story is usually enough to keep the conversation moving.',
    'opinion-line':'Say where you stand first. Then give a reason, an example and one sentence showing you understand the other side.',
    'ranking-room':'Choose your #1 first, then explain the criterion you used before defending the rest of the order.',
    'detective-alibi':'Keep your details consistent: time, place, people and sequence. Specific details make the alibi believable.',
    'finish-the-sentence':'Finish the sentence naturally, then add why or one quick example.',
    'three-clues':'Start broad, then get more specific. Use category, function and one distinctive feature.',
    'secret-mission':'Keep it natural. Do not force the mission into the conversation too early.',
    'one-minute-story':'Use a simple structure: beginning → problem → twist → ending. Do not waste time searching for perfect vocabulary.',
    'would-i-lie-to-you':'Tell the story confidently and add one oddly specific detail. Specific details sound believable.',
    'desert-island':'Pick the three items first. Explain what problem each item solves.',
    'conversation-bingo':'Use natural follow-ups: “Really?”, “Why?”, “When was that?” or “How did that happen?” before marking a square.',
    'emoji-story':'Give each emoji a job in the story. Connect them with “then”, “but”, “because” and “so”.',
    'worst-advice-only':'Make the bad advice obviously silly and safe. In the useful round, give one realistic action.',
    'sell-me-this':'Use problem → benefit → proof → call to action. Sell the result, not just the object.',
    'hot-take':'State the hot take clearly, then give one strong reason and one example. You can change your mind after the counterargument.',
    'photo-talk':'Describe what you can actually see first, then infer what happened before and predict what happens next.'
  };
  const ANSWER_FUN={
    choice:[
      'My sensible answer is ___, but my chaotic answer is ___.',
      'I’m choosing ___ and I’m prepared to defend this questionable decision.',
      'I’ll go with ___ — future me can deal with the consequences.',
      'Team ___ for me. I have no evidence, only confidence.'
    ],
    past:[
      'Yes, this happened. My dignity recovered eventually.',
      'The short version is ___. The long version needs coffee.',
      'I remember ___ very clearly, unfortunately.',
      'It started normally, and then ___ happened. Excellent decision-making.'
    ],
    hypothetical:[
      'My first move would be ___. Panic can be scheduled for later.',
      'I’d probably ___, assuming my brain decides to cooperate.',
      'Plan A: ___. Plan B: pretend Plan A was intentional.',
      'I’d choose ___ and hope the universe respects the effort.'
    ],
    opinion:[
      'My official answer is ___. My group-chat answer is more dramatic.',
      'I’ll defend ___ today. Tomorrow I reserve the right to change teams.',
      'I think ___. Please hold all tomatoes until the end.',
      'My hot take is ___ — politely, but with unnecessary confidence.'
    ],
    explain:[
      'It’s basically ___, but explaining it badly is part of the experience.',
      'Imagine ___ and ___ had a very confusing baby.',
      'You use it when ___; saying more might accidentally make me good at this game.',
      'It is definitely not ___, which is suspiciously useful information.'
    ],
    quick:[
      'First answer in my head: ___. I’m trusting it.',
      '___! No time to overthink — next question.',
      'My brain says ___. We are not holding a meeting about it.',
      '___ — final answer before my vocabulary loads.'
    ],
    story:[
      'It began with ___. This was the moment everything became unnecessarily complicated.',
      'First ___ happened, then things got weird.',
      'The hero wanted ___. The universe had other plans.',
      'Everything was fine until ___. Classic.'
    ],
    generic:[
      'My safe answer is ___. My honest answer after midnight might be different.',
      'The first thing that came to mind is ___. I’m going to trust my brain for once.',
      'I’d say ___, mostly because coffee has not given me a better idea yet.',
      'My answer is ___. I can explain, but I cannot promise it will help.'
    ]
  };
  const ANSWER_THEMES={
    navy:{bg:'#123a6b',fg:'#ffffff',border:'#123a6b',hover:'#0b2f5b'},
    teal:{bg:'#167f83',fg:'#ffffff',border:'#167f83',hover:'#11696d'},
    purple:{bg:'#6b5fb5',fg:'#ffffff',border:'#6b5fb5',hover:'#564a9b'},
    green:{bg:'#2f7d67',fg:'#ffffff',border:'#2f7d67',hover:'#276956'},
    rose:{bg:'#a95f78',fg:'#ffffff',border:'#a95f78',hover:'#8f4e65'},
    light:{bg:'#f4f7fa',fg:'#123a6b',border:'#d8e4ee',hover:'#e8eff5'}
  };
  const ANSWER_ICONS={question:'?',info:'i',spark:'✦'};
  function applyAnswerTheme(theme={}){
    const color=ANSWER_THEMES[theme.color]||ANSWER_THEMES.navy;
    const button=document.querySelector('.esc-answer-help-btn');
    document.documentElement.style.setProperty('--esc-answer-help-bg',color.bg);
    document.documentElement.style.setProperty('--esc-answer-help-fg',color.fg);
    document.documentElement.style.setProperty('--esc-answer-help-border',color.border);
    document.documentElement.style.setProperty('--esc-answer-help-hover',color.hover);
    if(button){
      button.textContent=ANSWER_ICONS[theme.icon]||ANSWER_ICONS.question;
      button.dataset.shape=['circle','square','rounded'].includes(theme.shape)?theme.shape:'rounded';
    }
  }
  async function loadAnswerTheme(){
    applyAnswerTheme({color:'navy',icon:'question',shape:'rounded'});
    try{
      await window.ESCGameKit?.ensurePlatform?.();
      let db=null;
      for(let i=0;i<30&&!db;i++){
        if(window.ESCSupabase?.getClient) db=await window.ESCSupabase.getClient();
        if(!db) await new Promise(r=>setTimeout(r,80));
      }
      if(!db)return;
      const {data,error}=await db.from('esc_cms_public_settings').select('published_data').eq('key','site_identity').maybeSingle();
      if(error)return;
      applyAnswerTheme(data?.published_data?.answer_helper||{});
    }catch(_){}
  }
  function answerSlug(){return (location.pathname.split('/').filter(Boolean).pop()||'').toLowerCase()}
  function answerHash(value){let h=0;for(let i=0;i<value.length;i++)h=((h<<5)-h+value.charCodeAt(i))|0;return Math.abs(h)}
  function visiblePrompt(){
    const selectors=['#prompt','#question','#questionText','#cardText','#truthText','#dareText','.new-game-prompt','.game-prompt','.question-text','.card-question','.prompt-text','.main-question'];
    for(const selector of selectors){
      for(const node of document.querySelectorAll(selector)){
        const text=(node.textContent||'').replace(/\s+/g,' ').trim();
        if(text&&node.getClientRects().length)return {node,text};
      }
    }
    return {node:null,text:''};
  }
  function answerMode(prompt,slug){
    if(['would-you-rather','red-flag-green-flag','most-likely-to','ranking-room','desert-island'].includes(slug))return 'choice';
    if(['debate-roulette','opinion-line','hot-take'].includes(slug))return 'opinion';
    if(['taboo','who-am-i','explain-it-badly','three-clues'].includes(slug))return 'explain';
    if(['hot-seat','five-second-challenge'].includes(slug))return 'quick';
    if(['story-chain','emoji-story','one-minute-story','would-i-lie-to-you','two-truths-one-lie'].includes(slug))return 'story';
    const q=(prompt||'').toLowerCase();
    if(/would you rather|\bchoose\b|\bwhich\b.*\bor\b/.test(q))return 'choice';
    if(/have you|did you|last time|ever |remember|what happened|when was|when did/.test(q))return 'past';
    if(/what would|would you|could you|if you|imagine|suppose/.test(q))return 'hypothetical';
    if(/should |do you think|agree|disagree|better than|worse than|red flag|green flag|your opinion/.test(q))return 'opinion';
    return 'generic';
  }
  function answerExamples(mode,prompt){
    const sets={
      choice:[
        ['A2 · Easy','I choose ___ because ___.'],
        ['B1 · Natural','I’d probably go with ___, mainly because ___.'],
        ['B2 · Strong','I can see the case for both, but I’d lean toward ___ because ___. One downside is ___.']
      ],
      past:[
        ['A2 · Easy','Yes, I did. It happened when ___.'],
        ['B1 · Natural','The first thing that comes to mind is ___. It happened when ___.'],
        ['B2 · Strong','Looking back, ___ stands out because ___. What made it memorable was ___.']
      ],
      hypothetical:[
        ['A2 · Easy','I would ___ because ___.'],
        ['B1 · Natural','My first move would probably be ___. After that, I’d ___.'],
        ['B2 · Strong','I’d probably start by ___. The trade-off is ___, but I’d still choose it because ___.']
      ],
      opinion:[
        ['A2 · Easy','I think ___ because ___.'],
        ['B1 · Natural','My short answer is ___. The main reason is ___.'],
        ['B2 · Strong','I can see both sides, but I’d argue that ___, especially when ___.']
      ],
      explain:[
        ['A2 · Easy','It is a kind of ___. You use it for ___.'],
        ['B1 · Natural','You usually find it ___. It is useful when ___, and it looks/feels like ___.'],
        ['B2 · Strong','Think of something similar to ___, except it ___. Its main purpose is ___.']
      ],
      quick:[
        ['A2 · Easy','My answer is ___.'],
        ['B1 · Natural','Probably ___, because ___.'],
        ['B2 · Strong','The first thing that comes to mind is ___; mainly because ___.']
      ],
      story:[
        ['A2 · Easy','First ___. Then ___. Finally ___.'],
        ['B1 · Natural','It started when ___. Then ___ happened, so I ___.'],
        ['B2 · Strong','At first ___. The turning point was ___. In the end, ___.']
      ],
      generic:[
        ['A2 · Easy','I think / I like / I prefer ___ because ___.'],
        ['B1 · Natural','For me, it’s probably ___. A good example is ___.'],
        ['B2 · Strong','My instinctive answer is ___. If I think about it more carefully, it comes down to ___.']
      ]
    };
    const base=sets[mode]||sets.generic;
    const funPool=ANSWER_FUN[mode]||ANSWER_FUN.generic;
    const fun=funPool[answerHash(prompt||mode)%funPool.length];
    return [...base,['😄 Fun',fun]];
  }
  function mountAnswerHelp(){
    if(document.querySelector('.esc-answer-help-btn'))return;
    const first=visiblePrompt();
    const host=document.querySelector('.game-actions,.new-game-actions,.header-actions,.esc-display-actions')||document.querySelector('header.topbar,header.site-header,header');
    if(!host)return;

    const button=document.createElement('button');
    button.type='button';button.className='esc-answer-help-btn';button.textContent='?';
    button.title='Need help answering?';button.setAttribute('aria-label','Open answer tips and example starters');
    const sound=host.querySelector('[data-esc-sound]');
    const textAction=host.querySelector('a,.game-action-btn,.new-game-back');
    if(sound)sound.insertAdjacentElement('afterend',button);else if(textAction)host.insertBefore(button,textAction);else host.appendChild(button);

    const layer=document.createElement('div');
    layer.className='esc-answer-help-layer';layer.setAttribute('aria-hidden','true');
    layer.innerHTML='<section class="esc-answer-help-dialog" role="dialog" aria-modal="true" aria-labelledby="escAnswerHelpTitle"><button type="button" class="esc-answer-help-close" aria-label="Close answer help">×</button><div class="esc-answer-help-kicker">SPEAKING CHEAT SHEET</div><h2 id="escAnswerHelpTitle">Stuck? Steal a starter.</h2><p class="esc-answer-help-prompt" data-answer-prompt></p><div class="esc-answer-help-tip" data-answer-tip></div><div class="esc-answer-help-grid" data-answer-grid></div><div class="esc-answer-help-rescue"><strong>Emergency trick:</strong> Answer in one sentence → add <em>because</em> → give one example. That is already a complete speaking answer.</div></section>';
    document.body.appendChild(layer);
    const dialog=layer.querySelector('.esc-answer-help-dialog'),close=layer.querySelector('.esc-answer-help-close');

    function fill(){
      const current=visiblePrompt(),prompt=current.text,slug=answerSlug(),mode=answerMode(prompt,slug);
      const promptBox=layer.querySelector('[data-answer-prompt]');
      promptBox.textContent=prompt?'Current prompt: '+(prompt.length>180?prompt.slice(0,177)+'…':prompt):'Use one of these starters for the current card.';
      const tip=ANSWER_COACH[slug]||'Do not search for a perfect answer. Pick one idea, say why, then add one example or mini-story.';
      layer.querySelector('[data-answer-tip]').textContent='💡 '+tip;
      const grid=layer.querySelector('[data-answer-grid]');grid.textContent='';
      answerExamples(mode,prompt||slug).forEach(([label,text])=>{
        const card=document.createElement('div');card.className='esc-answer-help-example';
        const tag=document.createElement('span');tag.textContent=label;
        const copy=document.createElement('p');copy.textContent=text;
        card.append(tag,copy);grid.appendChild(card);
      });
    }
    function open(){
      fill();layer.classList.add('open');layer.setAttribute('aria-hidden','false');
      document.documentElement.classList.add('esc-answer-help-open');close.focus();
    }
    function shut(){
      layer.classList.remove('open');layer.setAttribute('aria-hidden','true');
      document.documentElement.classList.remove('esc-answer-help-open');button.focus();
    }
    button.addEventListener('click',e=>{e.stopPropagation();open()});
    button.addEventListener('keydown',e=>e.stopPropagation());
    close.addEventListener('click',shut);
    layer.addEventListener('click',e=>{if(e.target===layer)shut()});
    dialog.addEventListener('click',e=>e.stopPropagation());
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&layer.classList.contains('open')){e.preventDefault();e.stopPropagation();shut()}},true);
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { mount(); mountHowToPlay(); mountAnswerHelp(); void loadAnswerTheme(); }); else { mount(); mountHowToPlay(); mountAnswerHelp(); void loadAnswerTheme(); }
})();
