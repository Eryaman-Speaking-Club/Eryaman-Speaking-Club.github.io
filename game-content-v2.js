(() => {
  'use strict';

  const path = location.pathname;
  const appendUnique = (target, additions, keyFn = (x) => JSON.stringify(x)) => {
    if (!Array.isArray(target)) return 0;
    const seen = new Set(target.map(keyFn));
    let added = 0;
    additions.forEach((item) => {
      const key = keyFn(item);
      if (seen.has(key)) return;
      target.push(item);
      seen.add(key);
      added += 1;
    });
    return added;
  };
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };
  const addNote = (value) => {
    const panel = document.querySelector('.game-panel');
    if (!panel || panel.querySelector('.esc-extra-rule')) return;
    const note = document.createElement('div');
    note.className = 'game-note esc-extra-rule';
    note.textContent = value;
    panel.appendChild(note);
  };

  if (path.includes('/truth-or-dare/')) {
    const defaults = window.ESC_TRUTH_DARE_DEFAULTS;
    if (defaults) {
      const extraTruths = [
        'What is one habit you are genuinely trying to improve?',
        'What is something you used to care about but no longer do?',
        'What is a small decision you made recently that turned out well?',
        'What is one thing people often assume about you that is wrong?',
        'What is a compliment you still remember, and why?',
        'When was the last time you changed your opinion about something important?',
        'What is one social situation that makes you feel awkward?',
        'What is a goal you are working on quietly?',
        'What is one mistake that taught you a useful lesson?',
        'What is something you wish you had started earlier?',
        'What makes you trust someone quickly?',
        'What makes you lose trust in someone?',
        'What is one thing you are better at than most people think?',
        'What is a harmless lie you have told to avoid an awkward situation?',
        'What is one purchase you regret?',
        'What is one risk you are glad you took?',
        'What is a friendship lesson you learned the hard way?',
        'What is something you are currently excited about?',
        'What is one thing you overthink too much?',
        'What is a small thing that can instantly improve your mood?',
        'What is one rule you follow even when nobody is watching?',
        'What is a moment from this year that made you proud?',
        'What is one thing you would do differently if you could repeat last year?',
        'What is something you want to become more confident about?'
      ].map((text, i) => ({ id: `t-curated-${i + 1}`, text }));
      const extraDares = [
        'Tell a 30-second story that starts with “I knew this was a bad idea when…”',
        'Sell the chair nearest to you as if it costs one million dollars.',
        'Give a weather forecast for your week using at least three weather words.',
        'Explain how to make tea as if you are giving instructions to an alien.',
        'Give someone in the group a sincere compliment in English.',
        'Describe your phone without using the words phone, screen, app or call.',
        'Pretend you are a tour guide and introduce this room as a famous attraction.',
        'Create a short slogan for Eryaman Speaking Club in ten seconds.',
        'Speak for 30 seconds about your weekend without using the word “and”.',
        'Act out an emotion without speaking and let the group guess it.',
        'Make up a ridiculous new law and defend it for 20 seconds.',
        'Tell a short story using these three words: coffee, taxi, surprise.',
        'Explain your job or studies to a five-year-old.',
        'Give a one-sentence life lesson in your most serious voice.',
        'Pretend you are accepting an award for something completely ordinary.',
        'Name five things that start with the same letter in ten seconds.',
        'Describe your dream holiday like a dramatic movie trailer.',
        'Give a 20-second motivational speech to someone who missed the bus.',
        'Invent a new English word, define it, and use it in a sentence.',
        'Tell the group three statements about yourself; one must be false.'
      ].map((text, i) => ({ id: `d-curated-${i + 1}`, text }));
      appendUnique(defaults.truths, extraTruths, (x) => x.text);
      appendUnique(defaults.dares, extraDares, (x) => x.text);
    }
    setText('#playerScreen .screen-copy p', 'Spin a player. They choose Truth or Dare, complete one card, then the turn moves on.');
  }

  if (path.includes('/one-for-me-one-for-you/')) {
    const extra = [
      ['What makes a conversation feel comfortable for you?', 'Give one example of something a good listener does.'],
      ['What is one small habit that makes your week easier?', 'When did you start doing it?'],
      ['What is something you enjoy more now than you did five years ago?', 'What changed your opinion?'],
      ['What is one place in Ankara you would recommend to a visitor?', 'What should they do there?'],
      ['What makes someone easy to become friends with?', 'Which quality matters most to you?'],
      ['What is one skill everyone should learn before age 30?', 'Why is it useful in real life?'],
      ['What is one thing you would change about your daily routine?', 'What would be the first realistic step?'],
      ['What is one decision you are happy you made this year?', 'What happened because of it?'],
      ['What makes a weekend feel successful to you?', 'Describe your ideal Saturday or Sunday.'],
      ['What is something people spend too much money on?', 'What would you spend that money on instead?'],
      ['Would you rather have more free time or more money?', 'What would you do with your choice?'],
      ['What is one technology you could live without?', 'What would become harder without it?'],
      ['What is one thing that makes a workplace enjoyable?', 'Give an example from a real or ideal job.'],
      ['What is one lesson school did not teach you?', 'How did you learn it instead?'],
      ['What is one country you would like to live in for a year?', 'What would you want to learn there?'],
      ['What is one thing that helps you stay calm under pressure?', 'When did it help you recently?'],
      ['What is one popular opinion you disagree with?', 'Explain your view without trying to win the argument.'],
      ['What is one thing you would like to be more disciplined about?', 'What usually gets in the way?'],
      ['What makes someone a good teammate?', 'Which quality is hardest to find?'],
      ['What is one mistake people often make when learning English?', 'What would you suggest instead?'],
      ['What is one experience that changed the way you think?', 'What did you believe before?'],
      ['What is one small pleasure you never get bored of?', 'Why does it work for you?'],
      ['What is one thing you would keep if you had to simplify your life?', 'Why is it important?'],
      ['What is one thing you wish people communicated more directly about?', 'How would clearer communication help?']
    ].map((x, i) => ({ id: `b-curated-${i + 1}`, q: x[0], f: x[1], category: 'curated', level: 'B' }));
    if (Array.isArray(window.ESC_QUESTIONS)) appendUnique(window.ESC_QUESTIONS, extra, (x) => x.q);
    setText('#home p', 'Draw a question and answer it in a few sentences. The next card goes to someone else, who answers and can get one follow-up question.');
  }

  if (path.includes('/debate-roulette/') && typeof motions !== 'undefined') {
    appendUnique(motions, [
      ['Everyday','People should have one phone-free evening every week.'],
      ['Everyday','Cities should create more car-free areas.'],
      ['Everyday','Online shopping makes everyday life better.'],
      ['Everyday','People should cook at home more often.'],
      ['Fun','Board games are better than video games.'],
      ['Fun','Every adult should learn how to dance.'],
      ['Fun','A holiday is better when you take fewer photos.'],
      ['Fun','Watching a bad movie with friends is better than watching a great movie alone.'],
      ['Social','It is better to have a few close friends than many friends.'],
      ['Social','Friends should tell you when you are making a bad decision.'],
      ['Social','Group chats create more stress than connection.'],
      ['Social','Meeting people face to face is still better than meeting online.'],
      ['Deep','A meaningful job is more important than a high salary.'],
      ['Deep','Confidence can be learned.'],
      ['Deep','People need boredom in order to be creative.'],
      ['Deep','Having enough is more important than having more.'],
      ['Spicy','A healthy relationship needs some independence.'],
      ['Spicy','People should not share relationship problems on social media.'],
      ['Spicy','Being friends before dating can create a stronger relationship.'],
      ['Spicy','Good communication matters more than romantic chemistry.']
    ]);
    if (typeof build === 'function') build();
    setText('.game-note', 'Read the motion → pick FOR or AGAINST → take up to 10 seconds to think → speak for 45 seconds. Give at least one reason or example.');
  }

  if (path.includes('/five-second-challenge/') && typeof items !== 'undefined') {
    appendUnique(items, [
      ['Easy','Name 3 things you can order in a café.'],
      ['Easy','Name 3 ways to travel.'],
      ['Easy','Name 3 things you keep in a bathroom.'],
      ['Easy','Name 3 things people do on weekends.'],
      ['Easy','Name 3 things you can find in a classroom.'],
      ['Funny','Name 3 bad excuses for not answering your phone.'],
      ['Funny','Name 3 things an alien might misunderstand about Earth.'],
      ['Funny','Name 3 terrible superhero names.'],
      ['Funny','Name 3 things you should not bring to a job interview.'],
      ['Funny','Name 3 strange things to say to a taxi driver.'],
      ['Hard','Name 3 ways to solve a disagreement.'],
      ['Hard','Name 3 qualities a good team needs.'],
      ['Hard','Name 3 reasons people avoid making decisions.'],
      ['Hard','Name 3 ways to practise English outside class.'],
      ['Hard','Name 3 things that can damage trust.'],
      ['Spicy','Name 3 signs two people have good chemistry.'],
      ['Spicy','Name 3 reasons to stop texting someone.'],
      ['Spicy','Name 3 things that can make a date memorable.'],
      ['Spicy','Name 3 healthy boundaries in a relationship.'],
      ['Spicy','Name 3 things people should discuss before becoming serious.']
    ]);
    if (typeof build === 'function') build();
    addNote('Say three different answers before the timer reaches 0. Repeated answers do not count.');
  }

  if (path.includes('/hot-seat/') && typeof prompts !== 'undefined') {
    appendUnique(prompts, [
      ['Mixed','Your ideal breakfast?'],['Mixed','One thing you would change about Ankara?'],['Mixed','A place you want to visit twice?'],['Mixed','One habit that saves you time?'],['Mixed','Your favourite way to spend one free hour?'],
      ['Funny','A food combination you would never try?'],['Funny','The worst possible name for a café?'],['Funny','A useless invention you would still buy?'],['Funny','A movie title for your week?'],['Funny','A silly rule you would create for one day?'],
      ['Personal','What helps you trust someone?'],['Personal','What makes you feel productive?'],['Personal','What are you trying to improve right now?'],['Personal','What kind of person gives good advice?'],['Personal','What is one boundary you value?'],
      ['Spicy','What is a green flag people underestimate?'],['Spicy','What is a first-date question you actually like?'],['Spicy','What makes communication attractive?'],['Spicy','Would you rather make the first move or be approached?'],['Spicy','What is one dating rule you do not believe in?']
    ]);
    if (typeof build === 'function') build();
    setText('.game-note', 'One player answers as many short prompts as possible in 60 seconds. Tap “Got it” after a complete answer; skip if you get stuck.');
  }

  if (path.includes('/last-thing-you-did/') && typeof prompts !== 'undefined') {
    appendUnique(prompts, [
      {c:'Everyday',q:'What was the last thing you cooked for yourself?'},{c:'Everyday',q:'What was the last thing you bought that was actually useful?'},{c:'Everyday',q:'What was the last app you opened today?'},{c:'Everyday',q:'What was the last small problem you solved?'},{c:'Everyday',q:'What was the last place you walked to?'},
      {c:'Funny',q:'What was the last thing that made you laugh unexpectedly?'},{c:'Funny',q:'What was the last silly mistake you made?'},{c:'Funny',q:'What was the last strange thing you searched online?'},{c:'Funny',q:'What was the last bad joke you heard?'},{c:'Funny',q:'What was the last thing you did because you were bored?'},
      {c:'Personal',q:'What was the last thing you felt proud of?'},{c:'Personal',q:'What was the last difficult decision you made?'},{c:'Personal',q:'What was the last compliment you received?'},{c:'Personal',q:'What was the last thing you learned about yourself?'},{c:'Personal',q:'What was the last habit you tried to improve?'},
      {c:'Spicy',q:'What was the last green flag you noticed in someone?'},{c:'Spicy',q:'What was the last message that made you smile?'},{c:'Spicy',q:'What was the last first impression that surprised you?'},{c:'Spicy',q:'What was the last dating opinion you changed your mind about?'},{c:'Spicy',q:'What was the last romantic situation that taught you something?'}
    ], (x) => x.q);
    if (typeof buildDeck === 'function') buildDeck();
    setText('.subtitle', 'Pick a category and answer with the most recent example you can remember. Keep it short, then let someone ask one follow-up question.');
  }

  if (path.includes('/most-likely-to/') && typeof items !== 'undefined') {
    appendUnique(items, [
      ['Funny','forget where they parked?'],['Funny','become best friends with a stranger on a flight?'],['Funny','order dessert before the main meal?'],['Funny','laugh during a serious moment?'],
      ['Chaos','book a trip without planning anything?'],['Chaos','say yes to a ridiculous challenge?'],['Chaos','turn a small problem into a big adventure?'],['Chaos','move to a new city on short notice?'],
      ['Social','notice first when someone feels left out?'],['Social','bring the group back together after an argument?'],['Social','start a conversation with someone new?'],['Social','organise a surprise for a friend?'],
      ['Future','learn a completely new skill this year?'],['Future','work from another country?'],['Future','start a side project that becomes successful?'],['Future','change their lifestyle completely?'],
      ['Spicy','develop feelings for a friend?'],['Spicy','send the first message after a date?'],['Spicy','notice a red flag but give one more chance?'],['Spicy','choose stability over chemistry?']
    ]);
    if (typeof build === 'function') build();
    setText('.game-note', 'On 3–2–1, everyone points to exactly one person. The person with the most votes gets a short chance to defend themselves.');
  }

  if (path.includes('/never-have-i-ever/') && typeof items !== 'undefined') {
    appendUnique(items, [
      ['Funny','pretended my camera was broken in an online meeting.'],['Funny','used a completely wrong word in English and realised later.'],['Funny','opened the fridge and forgotten why.'],['Funny','rehearsed an argument in my head.'],
      ['Travel','taken the wrong train, bus or metro.'],['Travel','changed a trip because of bad weather.'],['Travel','made a travel plan mainly because of food.'],['Travel','returned from a trip needing another holiday.'],
      ['Work','sent an email and immediately noticed a mistake.'],['Work','pretended to understand a task before asking for help later.'],['Work','had a meeting that could have been an email.'],['Work','worked on something at the very last minute.'],
      ['Social','ignored a group chat because there were too many messages.'],['Social','cancelled plans because I wanted a quiet night.'],['Social','made a new friend through another friend.'],['Social','forgotten an important date and had to apologise.'],
      ['Spicy','had a crush on someone I did not expect.'],['Spicy','overthought a short message for more than an hour.'],['Spicy','decided not to send a risky message at the last second.'],['Spicy','changed my opinion about someone after one conversation.']
    ]);
    if (typeof build === 'function') build();
    setText('.game-hero p', 'Choose I HAVE or NEVER. If you have done it, share the short version only if you want to.');
    setText('.game-note', 'No pressure to explain. If someone shares a story, the group gets one respectful follow-up question.');
  }

  if (path.includes('/red-flag-green-flag/') && typeof items !== 'undefined') {
    appendUnique(items, [
      ['Dating','They ask questions and remember your answers on the next date.'],['Dating','They want to spend every free hour together from the first week.'],['Dating','They disagree with you calmly instead of trying to win.'],['Dating','They avoid talking about what they want from dating.'],
      ['Friendship','A friend is happy when you succeed, even when they are struggling.'],['Friendship','A friend expects an immediate reply to every message.'],['Friendship','A friend can apologise without adding excuses.'],['Friendship','A friend shares your personal news before you do.'],
      ['Work','A manager says clearly what “good work” looks like.'],['Work','A coworker constantly works while sick.'],['Work','A colleague asks for feedback after finishing a project.'],['Work','A manager changes priorities every day without explanation.'],
      ['Personality','They can disagree without becoming disrespectful.'],['Personality','They never ask for help, even when they need it.'],['Personality','They are curious about people who are different from them.'],['Personality','They turn every conversation back to themselves.'],
      ['Everyday','Someone always puts their phone away during a conversation.'],['Everyday','Someone arrives early but complains when others are exactly on time.'],['Everyday','Someone reads restaurant reviews for an hour before choosing.'],['Everyday','Someone always returns borrowed things without being reminded.']
    ]);
    if (typeof build === 'function') build();
    setText('.game-note', 'Choose your flag first. Then give one short reason. Someone who disagrees may give one counterargument.');
  }

  if (path.includes('/taboo/') && typeof cards !== 'undefined') {
    appendUnique(cards, [
      ['Everyday','HEADPHONES',['MUSIC','EAR','LISTEN','SOUND']],['Everyday','KEYS',['DOOR','LOCK','HOUSE','CAR']],['Everyday','QUEUE',['WAIT','LINE','PEOPLE','TURN']],['Everyday','RECEIPT',['SHOP','PAPER','PAY','PRICE']],
      ['Travel','BOARDING PASS',['PLANE','AIRPORT','FLIGHT','GATE']],['Travel','BACKPACK',['BAG','CARRY','TRAVEL','SHOULDER']],['Travel','GUIDEBOOK',['TRAVEL','BOOK','CITY','INFORMATION']],['Travel','DELAY',['LATE','WAIT','FLIGHT','TIME']],
      ['Food','LEFTOVERS',['FOOD','FRIDGE','YESTERDAY','EAT']],['Food','TAKEAWAY',['FOOD','ORDER','DELIVERY','RESTAURANT']],['Food','INGREDIENT',['RECIPE','FOOD','COOK','ITEM']],['Food','RESERVATION',['RESTAURANT','TABLE','BOOK','CALL']],
      ['Work','FEEDBACK',['COMMENT','WORK','IMPROVE','OPINION']],['Work','TEAMWORK',['GROUP','WORK','TOGETHER','PEOPLE']],['Work','OVERTIME',['WORK','LATE','HOURS','EXTRA']],['Work','TRAINING',['LEARN','WORK','COURSE','SKILL']],
      ['Entertainment','TRAILER',['MOVIE','VIDEO','WATCH','PREVIEW']],['Entertainment','SUBTITLE',['MOVIE','TEXT','LANGUAGE','SCREEN']],['Entertainment','AUDIENCE',['PEOPLE','WATCH','SHOW','CROWD']],['Entertainment','EPISODE',['SERIES','TV','WATCH','PART']]
    ], (x) => x[1]);
    if (typeof build === 'function') build();
    setText('#gameNote', 'One speaker describes the main word. Do not say the forbidden words, spell the answer, translate it, or use gestures. Everyone else guesses.');
  }

  if (path.includes('/what-would-you-do-if/') && typeof situations !== 'undefined') {
    appendUnique(situations, [
      {c:'Everyday',q:'you arrived at an important meeting one hour early?'},{c:'Everyday',q:'your internet stopped working during an important video call?'},{c:'Everyday',q:'you realised at the checkout that you had forgotten your wallet?'},{c:'Everyday',q:'you had one completely free evening every week?'},
      {c:'Chaos',q:'you could only tell the truth for one week?'},{c:'Chaos',q:'you woke up and nobody could recognise you?'},{c:'Chaos',q:'you could pause one conversation and continue it a year later?'},{c:'Chaos',q:'you discovered that animals understood everything you said?'},
      {c:'Social',q:'a friend kept making jokes that made you uncomfortable?'},{c:'Social',q:'two close friends stopped speaking and both wanted you to take a side?'},{c:'Social',q:'someone new joined your group and seemed left out?'},{c:'Social',q:'a friend gave you advice you strongly disagreed with?'},
      {c:'Money',q:'you received a bonus equal to one month of salary?'},{c:'Money',q:'you had to choose between saving for a home and travelling for a year?'},{c:'Money',q:'a close friend asked you to invest in their new business?'},{c:'Money',q:'you could have free housing or free food for ten years?'},
      {c:'Deep',q:'you could remove one bad habit instantly?'},{c:'Deep',q:'you had to choose one value that would guide every big decision?'},{c:'Deep',q:'you could know what people remember most about you?'},{c:'Deep',q:'you could relive one ordinary day from your past?'},
      {c:'Spicy',q:'someone you liked had very different plans for the future?'},{c:'Spicy',q:'your partner wanted much more personal space than you did?'},{c:'Spicy',q:'you felt strong chemistry but communication was difficult?'},{c:'Spicy',q:'an ex sent a sincere apology years later?'}
    ], (x) => x.q);
    if (typeof buildDeck === 'function') buildDeck();
    setText('.subtitle', 'Read the situation, say what you would do first, and explain why. The group can ask one follow-up question.');
  }

  if (path.includes('/would-you-rather/') && typeof items !== 'undefined') {
    appendUnique(items, [
      ['Everyday','have a cleaner home with less free time','have more free time with a messier home'],['Everyday','always cook at home','never cook and always eat out'],['Everyday','live close to work in a small home','live far from work in a large home'],['Everyday','have perfect public transport','have free parking everywhere'],
      ['Funny','have background music follow you everywhere','have a laugh track after everything you say'],['Funny','only be able to whisper','only be able to shout'],['Funny','have a pet that gives bad advice','have a phone that reads your messages aloud'],['Funny','wear one ridiculous hat forever','wear one ridiculous pair of shoes forever'],
      ['Deep','know your biggest future success','know your biggest future mistake'],['Deep','have more confidence','have more patience'],['Deep','be excellent at starting things','be excellent at finishing things'],['Deep','always get honest feedback','always feel completely confident'],
      ['Impossible','pause time for five minutes a day','rewind time by five minutes a day'],['Impossible','understand every animal','speak every human language'],['Impossible','visit the past once','visit the future once'],['Impossible','never forget a face','never forget a name'],
      ['Spicy','have strong chemistry with someone very different from you','have steady compatibility with someone similar to you'],['Spicy','know exactly what your date thinks of you','let your date know exactly what you think of them'],['Spicy','talk through conflict immediately','take a few hours before discussing conflict'],['Spicy','date someone very spontaneous','date someone who plans everything']
    ]);
    if (typeof build === 'function') build();
    setText('.game-note', 'Choose A or B first. Then give one reason. Someone who chose the other side may respond once.');
  }
})();