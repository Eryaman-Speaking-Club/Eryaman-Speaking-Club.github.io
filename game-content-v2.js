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
  // Keep every public game at 1,000 sensible, unique playable items.
  const LEGACY_MIN=1000;
  const legacyTopics=["daily routines","free time","sleep","exercise","money","shopping","cooking","travel","public transport","friendship","family","work","career plans","education","English learning","technology","social media","music","movies","sports","health","stress","confidence","patience","honesty","trust","teamwork","communication","motivation","habits","decision making","time management","creativity","goals","memories","the future","weekends","holidays","restaurants","cafés","city life","remote work","meetings","job interviews","relationships","first impressions","personal space","good manners","online communication","phone use","news","weather","fashion","books","gaming","photography","learning new skills","saving money","healthy food","home life","neighbours","commuting","customer service","leadership","feedback","problem solving","risk taking","success","failure","change","comfort zones","planning","productivity","public speaking","listening","language mistakes","culture","food habits","work-life balance","travel planning","online meetings","group projects","housework","morning energy","evening habits","weekend plans","local places","environment","public spaces","personal goals","learning from mistakes","trying new things","asking for help","giving advice","making friends","staying organised","healthy boundaries","digital habits","small talk","making choices"];
  const legacyCats=['Everyday','Funny','Social','Deep','Spicy'];
  const legacyCat=i=>legacyCats[i%legacyCats.length];
  const legacyTopic=i=>legacyTopics[i%legacyTopics.length];
  const legacyCap=s=>String(s).replace(/\b\w/g,m=>m.toUpperCase());
  const legacyMoreTargets=["desk calendar","wall clock","bedside table","coffee table","dining table","bookshelf","shoe rack","coat rack","floor lamp","ceiling light","curtain","window blind","door handle","door mat","bath towel","hand towel","soap dispenser","shampoo bottle","laundry detergent","washing powder","recycling bin","rubbish bin","kitchen sink","bathroom sink","shower curtain","bath mat","pillow case","bed sheet","duvet","blanket","mattress","alarm app","grocery list","meal plan","weekly planner","appointment reminder","parking meter","bus card","library card","loyalty card","travel pillow","neck pillow","eye mask","ear plugs","hand luggage","checked luggage","baggage trolley","airport café","airport hotel","hotel lift","hotel corridor","hotel pool","hotel gym","hotel breakfast buffet","tour bus","city bus","night bus","express train","local train","high-speed train","tram","metro train","ferry boat","boat tour","walking route","bike tour","cycle path","hiking route","mountain cabin","beach umbrella","sun cream","swimming costume","beach bag","travel wallet","passport holder","travel document","booking confirmation","flight confirmation","train reservation","seat reservation","coffee cup","paper cup","glass bottle","plastic bottle","water glass","wine glass","tea cup","coffee spoon","dessert spoon","bread knife","chef knife","kitchen towel","napkin","table cloth","salt shaker","pepper shaker","sugar bowl","jam jar","honey jar","olive oil","tomato sauce","salad dressing","sandwich bread","whole wheat bread","white bread","cheese sandwich","chicken wrap","vegetable wrap","fruit juice","apple juice","iced coffee","iced tea","herbal tea","bottled water","sparkling water","fruit bowl","snack bar","chocolate bar","birthday candle","cake slice","office kitchen","break room","reception desk","help desk","customer desk","sales desk","training room","conference call","video interview","job fair","career fair","team workshop","brainstorming session","project deadline","weekly meeting","monthly meeting","annual meeting","progress report","sales target","customer feedback","online form","registration form","application form","survey form","feedback form","presentation screen","presentation remote","conference microphone","office phone","work laptop","company car","staff badge","visitor badge","security badge","name tag","uniform","work boots","safety helmet","protective gloves","first-aid box","language exchange","speaking club","conversation class","grammar lesson","vocabulary lesson","listening exercise","reading exercise","writing task","speaking task","group activity","pair work","role play","discussion question","icebreaker","warm-up activity","homework task","quiz question","exam question","study plan","learning goal"];
  const legacyTargets=[...new Set([...["phone","wallet","umbrella","elevator","mirror","password","traffic","alarm","battery","neighbour","toothbrush","fridge","microwave","balcony","receipt","queue","headphones","keys","doorbell","vacuum cleaner","laundry","supermarket","pharmacy","suitcase","passport","airport","boarding pass","hotel","hostel","beach","map","tourist","ticket","platform","taxi","train","bus","bicycle","backpack","guidebook","delay","coffee","pizza","chocolate","burger","salad","breakfast","spicy food","recipe","dessert","restaurant","takeaway","leftovers","ingredient","reservation","waiter","menu","soup","popcorn","lemon","avocado","meeting","deadline","boss","email","salary","interview","promotion","colleague","presentation","remote work","feedback","teamwork","overtime","training","office","printer","spreadsheet","calendar","microphone","podcast","concert","karaoke","meme","gaming console","cinema","playlist","selfie","trailer","subtitle","audience","episode","board game","camera","book","newspaper","guitar","piano","football","basketball","tennis","gym","doctor","nurse","teacher","engineer","designer","chef","driver","pilot","lawyer","manager","student","cashier","photographer","musician","actor","writer","dentist","mechanic","farmer","programmer","firefighter","police officer","architect","scientist","receptionist","accountant","translator","barber","baker","coach","journalist","electrician","plumber","artist","shopkeeper","delivery driver","language teacher","tour guide","barista","pharmacist","librarian","entrepreneur","best friend","roommate","cousin","partner","teammate","stranger","customer","client","visitor","passenger","city centre","bus stop","train station","shopping mall","coffee shop","park","library","hospital","school","university","airport gate","hotel lobby","restaurant table","kitchen","bedroom","living room","bathroom","garden","mountain","village","museum","stadium","market","bank","post office","classroom","meeting room","parking lot","traffic light","bridge","tunnel","city square","metro station","rain","snow","sunshine","wind","storm","birthday","wedding","exam","trip","vacation","commute","morning routine","evening routine","lunch break","video call","group chat","online class","delivery order","shopping list","coffee break","weekend plan","flight delay","train journey","road trip","job offer","team project","workshop","language course","fitness class","doctor appointment","family dinner","house party","first date","museum visit","concert ticket","movie night","football match","book club","picnic","camping trip","hotel booking","restaurant booking","online order","lost luggage","phone charger","power bank","water bottle","notebook","office chair","coffee machine","washing machine","dishwasher","remote control","shopping cart","credit card","cash machine","street market","city map","travel insurance","seat belt","traffic jam","weather forecast","alarm clock","birthday cake","wedding invitation","job application","school project","presentation slide","voice message","email attachment","video game","fitness tracker","smart watch"],...["air conditioner","electric fan","space heater","hair dryer","electric toothbrush","coffee grinder","rice cooker","pressure cooker","slow cooker","air fryer","food processor","electric kettle","toaster","blender","vacuum robot","iron","ironing board","clothes hanger","laundry basket","dish rack","cutting board","frying pan","saucepan","baking tray","oven glove","measuring cup","kitchen scale","water filter","ice tray","lunch box","thermos","travel mug","reusable bottle","paper towel","shopping bag","storage box","toolbox","flashlight","extension cable","USB cable","wireless charger","computer mouse","keyboard","webcam","monitor","laptop stand","desk lamp","office desk","filing cabinet","name badge","business card","sticky note","paper clip","stapler","scanner","photocopier","projector","whiteboard","flip chart","conference badge","meeting agenda","meeting notes","action list","sales report","monthly report","budget plan","marketing plan","training session","performance review","job description","work schedule","annual leave","sick leave","expense report","customer complaint","support ticket","sales call","client meeting","team lunch","airport lounge","airport shuttle","baggage claim","security check","passport control","departure board","arrival hall","window seat","aisle seat","seat belt","life jacket","travel adapter","luggage tag","carry-on bag","check-in desk","hotel reception","room key","hotel breakfast","city tour","guided tour","walking tour","travel brochure","tourist information","currency exchange","train ticket","bus ticket","metro card","taxi rank","rental car","fuel station","road sign","motorway","pedestrian crossing","bike lane","ferry terminal","cruise ship","campsite","hiking trail","viewpoint","souvenir shop","sandwich","cheeseburger","vegetable soup","tomato soup","chicken soup","fruit salad","green salad","pasta salad","grilled chicken","fried chicken","roast chicken","baked potato","mashed potato","french fries","scrambled eggs","fried eggs","boiled eggs","pancakes","waffles","toast","cheesecake","apple pie","chocolate cake","ice cream","yogurt","cereal","oatmeal","rice","noodles","pasta","spaghetti","steak","fish and chips","sushi","kebab","wrap","taco","burrito","curry","sandwich shop","coffee beans","espresso","cappuccino","latte","tea bag","green tea","black tea","orange juice","lemonade","mineral water","soft drink","milkshake","smoothie","hot chocolate","restaurant bill","service charge","tip jar","table reservation","food delivery","grocery store","flight attendant","airport security officer","gate agent","baggage handler","train conductor","bus driver","taxi driver","tour guide","hotel receptionist","hotel manager","housekeeper","restaurant manager","head chef","kitchen assistant","waiter","waitress","bartender","delivery rider","shop assistant","store manager","primary school teacher","high school teacher","university lecturer","private tutor","English teacher","math teacher","football coach","fitness trainer","personal trainer","yoga instructor","swimming instructor","driving instructor","career coach","team leader","project manager","sales manager","marketing manager","HR specialist","customer support agent","recruiter","software developer","web designer","graphic designer","product designer","civil engineer","electrical engineer","mechanical engineer","data analyst","data scientist","lab technician","research assistant","medical doctor","family doctor","surgeon","dentist","pharmacist","physiotherapist","veterinarian","paramedic","caregiver","wedding photographer","sports photographer","news reporter","radio host","TV presenter","content creator","video editor","film director","camera operator","sound engineer","DJ","singer","guitarist","pianist","drummer","actor","comedian","novelist","poet","illustrator","bakery","butcher shop","bookstore","clothing store","shoe store","electronics store","furniture store","toy store","sports shop","department store","shopping centre","street café","rooftop café","fast-food restaurant","family restaurant","hotel restaurant","school cafeteria","food court","farmers market","night market","public library","university library","art museum","history museum","science museum","city park","playground","sports centre","football stadium","basketball court","tennis court","swimming pool","fitness centre","community centre","concert hall","theatre","cinema hall","art gallery","exhibition centre","conference centre","police station","fire station","health centre","dental clinic","pharmacy counter","bank branch","cash machine","post office","courier office","car park","car wash","repair shop","petrol station","bus terminal","train platform","metro entrance","airport terminal","hotel room","hostel room","holiday apartment","smartphone","tablet","laptop","desktop computer","smart speaker","Bluetooth speaker","wireless headphones","earbuds","smart television","remote control","games console","game controller","digital camera","action camera","drone","smart watch","fitness watch","e-book reader","portable charger","memory card","video conference","online meeting","online course","language app","messaging app","social media account","email inbox","calendar reminder","online shopping cart","delivery tracking","QR code","Wi-Fi password","mobile data","screen time","voice assistant","cloud storage","online banking","digital payment","password manager","two-factor authentication","morning commute","rush hour","lunch break","coffee break","weekend trip","business trip","family holiday","city break","beach holiday","camping holiday","road trip","train journey","long flight","short flight","delayed flight","missed bus","lost wallet","lost phone","lost key","flat tyre","birthday party","graduation party","wedding party","office party","housewarming party","surprise party","family dinner","team dinner","picnic","barbecue","movie night","game night","karaoke night","concert night","book club meeting","study group","team meeting","staff meeting","parent meeting","job interview","first day at work","first day at school","first date","blind date","doctor visit","dentist appointment","haircut appointment","bank appointment","visa appointment","passport application","job application","university application","course registration","hotel check-in","hotel check-out","airport check-in","restaurant reservation","online order","product return","customer refund","sunrise","sunset","rainbow","thunderstorm","snowstorm","fog","heatwave","cold wave","forest","river","lake","waterfall","island","desert","beach","cliff","cave","valley","hill","mountain peak","cat","dog","rabbit","hamster","parrot","goldfish","horse","cow","sheep","goat","chicken","duck","eagle","owl","pigeon","seagull","dolphin","whale","shark","octopus","lion","tiger","elephant","giraffe","zebra","monkey","bear","wolf","fox","deer","snake","turtle","frog","bee","butterfly","ant","spider","penguin","camel","kangaroo","honesty","confidence","patience","curiosity","creativity","motivation","discipline","teamwork","leadership","friendship","trust","respect","kindness","empathy","independence","responsibility","success","failure","risk","change","time management","work-life balance","customer service","public speaking","active listening","problem solving","decision making","critical thinking","healthy habits","sleep quality","personal space","first impression","body language","small talk","online privacy","digital safety","climate change","recycling","public transport","city traffic","morning person","night owl","early bird","coffee lover","book lover","movie fan","football fan","music fan","dog owner","cat owner","frequent traveller","remote worker","university student","new employee","team captain","party host","wedding guest","tourist","commuter","volunteer","birthday gift","wedding gift","gift card","shopping voucher","concert poster","movie poster","restaurant menu","coffee menu","train timetable","bus timetable","flight schedule","weather app","city guide","travel blog","recipe book","cookbook","school textbook","workbook","dictionary","notepad","door key","car key","house key","hotel key card","bank card","identity card","student card","membership card","boarding pass","parking ticket","speed ticket","shopping receipt","restaurant receipt","invoice","contract","certificate","diploma","passport photo","profile picture","selfie stick","raincoat","winter coat","leather jacket","hoodie","sweater","T-shirt","jeans","shorts","dress","suit","tie","scarf","gloves","hat","baseball cap","sunglasses","running shoes","boots","slippers","backpack","football boots","tennis racket","basketball hoop","football goal","gym bag","yoga mat","dumbbell","treadmill","exercise bike","swimming goggles","swimming cap","helmet","bicycle lock","skateboard","roller skates","camping tent","sleeping bag","hiking boots","walking stick","sports bottle","birthday card","wedding invitation","thank-you note","apology message","voice note","text message","group message","email subject","email signature","video message","phone call","missed call","conference call","online chat","customer review","product rating","social media post","photo caption","news headline","weather alert"],...legacyMoreTargets])];

  function fillLegacy(target,make,keyFn=x=>JSON.stringify(x),limit=LEGACY_MIN){
    if(!Array.isArray(target))return;
    const seen=new Set(target.map(keyFn));
    for(let i=0;target.length<limit&&i<30000;i++){
      const item=make(i),key=keyFn(item);
      if(!seen.has(key)){target.push(item);seen.add(key)}
    }
  }

  const legacyFunTopics=[
    'daily routines','free time','sleep','exercise','money','shopping','cooking','travel','public transport','friendship',
    'family','work','education','English learning','technology','social media','music','movies','sports','stress',
    'confidence','habits','time management','weekends','holidays','restaurants','cafés','city life','remote work','meetings',
    'job interviews','relationships','first impressions','phone use','weather','fashion','gaming','photography','home life','commuting',
    'productivity','public speaking','language mistakes','online meetings','housework','weekend plans','small talk','making choices','customer service','group projects'
  ];
  const legacyChoiceTopics=[
    'daily routines','free time','exercise','money','shopping','cooking','travel','friendship','family','work',
    'career plans','education','English learning','technology','social media','music','movies','sports','health','stress',
    'confidence','patience','honesty','trust','teamwork','communication','motivation','habits','decision making','time management',
    'creativity','goals','weekends','holidays','city life','remote work','meetings','job interviews','relationships','first impressions',
    'phone use','gaming','learning new skills','saving money','home life','commuting','leadership','problem solving','risk taking','work-life balance'
  ];
  const legacyDebateTopics=[
    'remote work','public transport','social media','online privacy','artificial intelligence','school homework','university education','work-life balance','city traffic','recycling',
    'healthy eating','screen time','online shopping','cashless payments','public speaking','teamwork','career changes','job interviews','working from home','four-day work weeks',
    'school uniforms','phone use in class','social media for teenagers','online learning','face-to-face learning','public healthcare','city parks','tourism','international travel','local businesses',
    'customer reviews','influencers','online news','advertising','video games','streaming services','competitive sports','group projects','office meetings','flexible working hours',
    'saving money','buying experiences','digital privacy','self-driving cars','cash payments','public libraries','community events','volunteering','language learning','environmental rules'
  ];
  const legacyFunTopic=i=>legacyFunTopics[i%legacyFunTopics.length];
  const legacyPick=(normal,funny,i)=>{
    const isFunny=i%2===0;
    const slot=Math.floor(i/2);
    if(isFunny){
      const topic=legacyFunTopics[slot%legacyFunTopics.length];
      const fn=funny[Math.floor(slot/legacyFunTopics.length)%funny.length];
      return fn(topic);
    }
    const topic=legacyTopics[slot%legacyTopics.length];
    const fn=normal[Math.floor(slot/legacyTopics.length)%normal.length];
    return fn(topic);
  };

  const hotSeatNormal=[
    t=>'What has your experience with '+t+' been like?',
    t=>'What have you learned recently about '+t+'?',
    t=>'What do you like or dislike about '+t+'?',
    t=>'What is one thing people often misunderstand about '+t+'?',
    t=>'What is one real example from your life related to '+t+'?'
  ];
  const hotSeatFunny=[
    t=>'If '+t+' had a customer-service desk, what would you complain about first?',
    t=>'What terrible advice about '+t+' could you give with complete confidence?',
    t=>'If '+t+' had a warning label, what should it say?',
    t=>'What harmless thing about '+t+' could start an unnecessary argument?',
    t=>'If you became famous for '+t+', what embarrassing interview question would you hate?',
    t=>'What part of '+t+' deserves dramatic background music?',
    t=>'If aliens asked you to explain '+t+', what would confuse them most?',
    t=>'What do people pretend to understand about '+t+'?',
    t=>'If '+t+' were a reality show, what would the title be?',
    t=>'If you could add one completely unnecessary luxury feature to '+t+', what would it be?'
  ];

  if(path.includes('/truth-or-dare/')){
    const d=window.ESC_TRUTH_DARE_DEFAULTS;
    if(d&&Array.isArray(d.truths)&&Array.isArray(d.dares)){
      const truthNormal=[
        t=>'What is one honest opinion you have about '+t+'?',
        t=>'What is something you would like to improve about '+t+'?',
        t=>'What is one memory you have connected to '+t+'?',
        t=>'What is one lesson you learned about '+t+'?',
        t=>'What is one habit you have related to '+t+'?'
      ];
      const truthFunny=[
        t=>'What completely normal thing about '+t+' are you strangely bad at?',
        t=>'What mistake involving '+t+' is funny now but was not funny then?',
        t=>'When did you last look confident about '+t+' while having no idea what you were doing?',
        t=>'What harmless lie have you told to avoid dealing with '+t+'?',
        t=>'What is your most unnecessary strong opinion about '+t+'?',
        t=>'What embarrassing moment involving '+t+' would your friends happily retell?',
        t=>'What ridiculous excuse have you used because of '+t+'?',
        t=>'What about '+t+' would your phone history expose immediately?',
        t=>'What tiny problem involving '+t+' have you made much more dramatic than necessary?',
        t=>'If your friends gave you an award related to '+t+', what would it be for?'
      ];
      const dareNormal=[
        t=>'Speak for 30 seconds about '+t+' without using the word “and”.',
        t=>'Give one useful piece of advice about '+t+'.',
        t=>'Explain '+t+' in very simple English.',
        t=>'Give a 20-second mini-presentation about '+t+'.',
        t=>'Ask the group one good follow-up question about '+t+'.'
      ];
      const dareFunny=[
        t=>'Give a dramatic TED Talk about '+t+' as if humanity depends on it.',
        t=>'Explain '+t+' to a five-year-old who keeps asking “why?”.',
        t=>'Give the worst possible advice about '+t+' with total confidence.',
        t=>'Advertise '+t+' like a luxury product nobody can afford.',
        t=>'Describe '+t+' like a sports commentator during a final match.',
        t=>'Give a breaking-news report about '+t+'.',
        t=>'Explain '+t+' like you are an alien who learned English yesterday.',
        t=>'Create a ridiculous slogan for '+t+' and defend it seriously.',
        t=>'Give a one-sentence apology to the world for something involving '+t+'.',
        t=>'Pretend '+t+' is banned tomorrow and give a 20-second protest speech.'
      ];
      fillLegacy(d.truths,i=>({id:'t-1000-'+(i+1),text:legacyPick(truthNormal,truthFunny,i)}),x=>x.text,500);
      fillLegacy(d.dares,i=>({id:'d-1000-'+(i+1),text:legacyPick(dareNormal,dareFunny,i)}),x=>x.text,500);
    }
  }

  if(path.includes('/last-thing-you-did/')&&typeof prompts!=='undefined'){
    const normal=[
      t=>'When was the last time you talked about '+t+'?',
      t=>'What was the last new thing you learned about '+t+'?',
      t=>'When did '+t+' last affect one of your plans?',
      t=>'What was the last interesting thing you noticed about '+t+'?',
      t=>'When did you last change your opinion about '+t+'?'
    ];
    const funny=[
      t=>'What was the last conversation about '+t+' that became much more dramatic than necessary?',
      t=>'What was the last mistake involving '+t+' that is funny now?',
      t=>'When did '+t+' last make you think “this should not be this difficult”?',
      t=>'What was the last tiny problem with '+t+' that somehow needed three people to solve?',
      t=>'What was the last time you pretended to understand something about '+t+'?',
      t=>'What was the last bad excuse you heard involving '+t+'?',
      t=>'What was the last moment involving '+t+' that deserved background music?',
      t=>'When did '+t+' last ruin a perfectly normal plan?',
      t=>'What was the last unnecessary argument you heard about '+t+'?',
      t=>'What was the last time '+t+' made you laugh at yourself?'
    ];
    fillLegacy(prompts,i=>({c:legacyCat(i),q:legacyPick(normal,funny,i)}),x=>x.q);
    if(typeof buildDeck==='function')buildDeck();
  }

  if(path.includes('/what-would-you-do-if/')&&typeof situations!=='undefined'){
    const normal=[
      t=>'you had to make one decision about '+t+' today?',
      t=>'a friend asked what you really think about '+t+'?',
      t=>'something related to '+t+' did not go as planned?',
      t=>'you had to explain your experience with '+t+' to a stranger?',
      t=>'you could instantly make one part of '+t+' easier for a week?'
    ];
    const funny=[
      t=>'you suddenly became famous for your opinions about '+t+'?',
      t=>'you had to explain '+t+' to your grandmother, a five-year-old and an alien at the same time?',
      t=>'your phone started announcing your private opinions about '+t+' out loud?',
      t=>'you woke up as the world’s most confident expert on '+t+' for one day?',
      t=>'a TV crew asked you to defend your opinion about '+t+' with no preparation?',
      t=>'everyone in your group misunderstood the same thing about '+t+' except you?',
      t=>'a normal conversation about '+t+' suddenly turned into a serious debate?',
      t=>'you accidentally sent your opinion about '+t+' to the wrong group chat?',
      t=>'someone offered you money to stop talking about '+t+' for one month?',
      t=>'you had to solve a problem involving '+t+' using only advice from strangers?'
    ];
    fillLegacy(situations,i=>({c:legacyCat(i),q:legacyPick(normal,funny,i)}),x=>x.q);
    if(typeof buildDeck==='function')buildDeck();
  }

  if(path.includes('/would-you-rather/')&&typeof items!=='undefined'){
    const normal=[
      t=>['understand '+t+' much better','have more real-life experience with '+t],
      t=>['get reliable expert advice about '+t,'learn about '+t+' through trial and error'],
      t=>['always feel prepared for '+t,'always stay calm when dealing with '+t],
      t=>['improve one important thing about '+t,'avoid one common problem related to '+t],
      t=>['be naturally confident discussing '+t,'always know one useful fact about '+t],
      t=>['have more time to learn about '+t,'have better guidance about '+t],
      t=>['make decisions about '+t+' quickly','take more time and rarely regret decisions about '+t],
      t=>['be very experienced with '+t,'be very creative when dealing with '+t],
      t=>['know what will change about '+t+' in five years','know what people misunderstand about '+t+' today'],
      t=>['be able to teach '+t+' clearly','be able to solve problems related to '+t+' quickly']
    ];
    const funny=[
      t=>['give a 10-minute speech about '+t+' with no preparation','answer 20 rapid-fire questions about '+t],
      t=>['have a personal assistant handle everything about '+t,'have your best friend make every decision about '+t],
      t=>['never have an awkward moment involving '+t+' again','always know exactly what to say about '+t],
      t=>['explain '+t+' on live television','explain '+t+' to ten curious children'],
      t=>['have a warning light whenever '+t+' is about to become complicated','have a mute button for conversations about '+t],
      t=>['become internet-famous because of '+t,'become the family expert on '+t],
      t=>['receive terrible advice about '+t+' from a celebrity','receive good advice about '+t+' from a stranger'],
      t=>['deal with '+t+' only on Mondays','deal with '+t+' only before 8 a.m.'],
      t=>['have every mistake involving '+t+' shown on a big screen','have every opinion about '+t+' read aloud'],
      t=>['get a dramatic warning siren whenever '+t+' is about to go wrong','get a calm voice saying “you have this” whenever '+t+' becomes stressful']
    ];
    fillLegacy(items,i=>{
      const isFunny=i%2===0;
      const slot=Math.floor(i/2);
      const t=legacyChoiceTopics[slot%legacyChoiceTopics.length];
      const bank=isFunny?funny:normal;
      const fn=bank[Math.floor(slot/legacyChoiceTopics.length)%bank.length];
      const opts=fn(t);
      return [legacyCat(i),opts[0],opts[1]];
    });
    if(typeof build==='function')build();
  }

  if(path.includes('/most-likely-to/')&&typeof items!=='undefined'){
    const normal=[
      t=>'give the best advice about '+t+'?',
      t=>'stay calm during a problem involving '+t+'?',
      t=>'learn something new about '+t+' first?',
      t=>'make a good plan related to '+t+'?',
      t=>'help someone else with '+t+'?'
    ];
    const funny=[
      t=>'watch one tutorial about '+t+' and immediately act like an expert?',
      t=>'turn a tiny problem with '+t+' into a three-day adventure?',
      t=>'become unexpectedly famous because of '+t+'?',
      t=>'make a last-minute decision about '+t+' and somehow make it work?',
      t=>'start an unnecessary group chat about '+t+'?',
      t=>'give very confident advice about '+t+' without being asked?',
      t=>'create a spreadsheet for '+t+' even when nobody needs one?',
      t=>'turn '+t+' into a competition for no reason?',
      t=>'arrive late because of '+t+' and have the least believable excuse?',
      t=>'convince everyone that a ridiculous idea about '+t+' is actually brilliant?'
    ];
    fillLegacy(items,i=>[legacyCat(i),legacyPick(normal,funny,i)]);
    if(typeof build==='function')build();
  }

  if(path.includes('/hot-seat/')&&typeof prompts!=='undefined'){
    fillLegacy(prompts,i=>[legacyCat(i),legacyPick(hotSeatNormal,hotSeatFunny,i)]);
    if(typeof build==='function')build();
  }

  if(path.includes('/five-second-challenge/')&&typeof items!=='undefined'){
    const normal=[
      t=>'Name 3 words connected with '+t+'.',
      t=>'Name 3 questions you could ask about '+t+'.',
      t=>'Name 3 situations where '+t+' could be important.',
      t=>'Name 3 things people might like or dislike about '+t+'.',
      t=>'Name 3 things people often talk about when discussing '+t+'.'
    ];
    const funny=[
      t=>'Name 3 terrible excuses involving '+t+'.',
      t=>'Name 3 things you should probably never say while talking about '+t+'.',
      t=>'Name 3 things people pretend to understand about '+t+'.',
      t=>'Name 3 funny situations involving '+t+'.',
      t=>'Name 3 ways '+t+' could ruin a perfectly normal Monday.',
      t=>'Name 3 warning labels for '+t+'.',
      t=>'Name 3 things that would make '+t+' unnecessarily dramatic.',
      t=>'Name 3 people you should not ask for advice about '+t+'.',
      t=>'Name 3 ridiculous products related to '+t+'.',
      t=>'Name 3 reasons someone might fake confidence about '+t+'.'
    ];
    fillLegacy(items,i=>[legacyCat(i),legacyPick(normal,funny,i)]);
    if(typeof build==='function')build();
  }

  if(path.includes('/red-flag-green-flag/')&&typeof items!=='undefined'){
    const socialTopics=['dating','friendship','group chats','workplace communication','first dates','roommates','teamwork','family plans','social media','meeting new people','personal space','giving advice','texting','voice messages','being late','borrowing things','sharing costs','making plans','apologising','disagreeing','work meetings','customer service','neighbours','parties','travel with friends','online dating','small talk','boundaries','trust','honesty','jealousy','support','humour','manners','punctuality','listening','privacy','money between friends','group projects','leadership','feedback','compliments','criticism','cancelled plans','phone use','work-life balance','housework','social events','communication','commitment'];
    const normal=[
      t=>'They listen carefully when you talk about '+t+'.',
      t=>'They can disagree respectfully about '+t+'.',
      t=>'They admit when they make a mistake involving '+t+'.',
      t=>'They respect other people’s boundaries around '+t+'.',
      t=>'They communicate clearly when there is a problem with '+t+'.',
      t=>'They remember important details related to '+t+'.',
      t=>'They ask before giving strong advice about '+t+'.',
      t=>'They can apologise without adding excuses about '+t+'.',
      t=>'They stay reliable when plans involving '+t+' change.',
      t=>'They can say “I do not know” when discussing '+t+'.'
    ];
    const funny=[
      t=>'They turn every conversation about '+t+' into a 12-minute voice message.',
      t=>'They say “trust me” before giving completely unrequested advice about '+t+'.',
      t=>'They create a spreadsheet for '+t+' before anyone asks.',
      t=>'They send “we need to talk” and then say it is about '+t+'.',
      t=>'They treat every small issue about '+t+' like a national emergency.',
      t=>'They start a group chat about '+t+' and immediately mute it.',
      t=>'They say “I am very chill about '+t+'” while clearly not being chill.',
      t=>'They arrive 30 minutes early for '+t+' and complain that everyone else is on time.',
      t=>'They watch one video about '+t+' and become the group expert.',
      t=>'They turn '+t+' into a competition even when there is no winner.'
    ];
    fillLegacy(items,i=>{
      const slot=Math.floor(i/2);
      const topic=socialTopics[slot%socialTopics.length];
      const bank=i%2===0?funny:normal;
      const fn=bank[Math.floor(slot/socialTopics.length)%bank.length];
      return [i%2===0?'Funny':'Social',fn(topic)];
    });
    if(typeof build==='function')build();
  }

  if(path.includes('/debate-roulette/')&&typeof motions!=='undefined'){
    const normal=[
      t=>'Society should take '+t+' more seriously.',
      t=>legacyCap(t)+' creates more benefits than problems.',
      t=>'Schools should spend more time teaching about '+t+'.',
      t=>'Technology is improving '+t+' overall.',
      t=>'People should have more personal choice when it comes to '+t+'.',
      t=>'Governments should do more about '+t+'.',
      t=>'There are too many rules around '+t+'.',
      t=>'The media exaggerates problems related to '+t+'.',
      t=>'Young people are better prepared for '+t+' than older generations.',
      t=>'Individual responsibility matters more than government action when it comes to '+t+'.'
    ];
    const funny=[
      t=>'People who start serious conversations about '+t+' before 8 a.m. owe everyone coffee.',
      t=>'A group chat about '+t+' would create more problems than it solves.',
      t=>'Voice messages longer than two minutes about '+t+' should require permission.',
      t=>'People become experts on '+t+' suspiciously fast after watching one video.',
      t=>'There should be a warning label for unrequested advice about '+t+'.',
      t=>'Anyone who says “It is easy” about '+t+' should demonstrate it immediately.',
      t=>'The internet has made arguments about '+t+' unnecessarily dramatic.',
      t=>'People should be allowed one dramatic complaint about '+t+' per week.',
      t=>'There should be an emergency snack break during arguments about '+t+'.',
      t=>'Every family has one person who takes '+t+' far too seriously.'
    ];
    fillLegacy(motions,i=>{
      const slot=Math.floor(i/2);
      const topic=legacyDebateTopics[slot%legacyDebateTopics.length];
      const bank=i%2===0?funny:normal;
      const fn=bank[Math.floor(slot/legacyDebateTopics.length)%bank.length];
      return [i%2===0?'Funny':'Debate',fn(topic)];
    });
    if(typeof build==='function')build();
  }

  if(path.includes('/never-have-i-ever/')&&typeof items!=='undefined'){
    const normal=[
      t=>'talked about '+t+' with someone recently.',
      t=>'learned something new about '+t+'.',
      t=>'asked someone for advice about '+t+'.',
      t=>'changed my opinion after learning more about '+t+'.',
      t=>'been pleasantly surprised by something related to '+t+'.'
    ];
    const funny=[
      t=>'nodded confidently about '+t+' while understanding almost nothing.',
      t=>'opened my phone to do something about '+t+' and completely forgot why.',
      t=>'pretended not to notice someone because a conversation about '+t+' felt inevitable.',
      t=>'had an embarrassing experience involving '+t+' that is funny now.',
      t=>'made a tiny problem involving '+t+' much more dramatic than necessary.',
      t=>'used a terrible excuse because of '+t+'.',
      t=>'pretended to be busy to avoid dealing with '+t+'.',
      t=>'watched one video about '+t+' and felt like an expert.',
      t=>'sent a message about '+t+' to the wrong person.',
      t=>'said “I know exactly what I am doing” about '+t+' when I absolutely did not.'
    ];
    fillLegacy(items,i=>[legacyCat(i),legacyPick(normal,funny,i)]);
    if(typeof build==='function')build();
  }

  if(path.includes('/taboo/')&&typeof cards!=='undefined'){
    const classify=term=>{
      const s=term.toLowerCase();
      if(/\bairport\b|\bflight\b|\btravel\b|\bhotel\b|\btrain\b|\bbus\b|\btaxi\b|\bpassport\b|\bticket\b|\btour\b|\bluggage\b|\broad\b|\bmetro\b|\bbeach\b|\bcamp\b|\bferry\b|\bcruise\b/.test(s))return'Travel';
      if(/coffee|pizza|food|restaurant|kitchen|soup|salad|cake|tea|juice|chicken|egg|pasta|sandwich|burger|cook|recipe|meal|breakfast|lunch|dinner/.test(s))return'Food';
      if(/work|office|manager|teacher|engineer|doctor|nurse|job|meeting|report|client|customer|project|training|salary|interview|email|business|receptionist|accountant|developer|designer|coach|instructor|assistant|agent/.test(s))return'Work';
      if(/movie|music|game|concert|cinema|football|basketball|tennis|karaoke|podcast|guitar|piano|actor|singer|photo|camera|party|book|creator|stream|theatre|festival/.test(s))return'Entertainment';
      return'Everyday';
    };
    const related={
      Everyday:['USE','HOME','DAILY','THING'],Travel:['TRIP','JOURNEY','PLACE','GO'],
      Food:['EAT','TASTE','MEAL','KITCHEN'],Work:['JOB','OFFICE','TEAM','WORK'],Entertainment:['FUN','WATCH','PLAY','SHOW']
    };
    const makeCard=term=>{
      const cat=classify(term),raw=String(term),upper=raw.toUpperCase();
      const tokens=upper.split(/\s+/).filter(x=>x.length>2);
      const isRole=/teacher|doctor|nurse|manager|driver|pilot|lawyer|chef|coach|agent|assistant|designer|engineer|developer|receptionist|creator|student|worker|instructor|photographer|musician|actor|writer|dentist|mechanic|farmer|scientist|cashier|barista|pharmacist/i.test(raw);
      const isPlace=/room|station|airport|hotel|restaurant|school|university|library|museum|park|centre|center|shop|store|office|hospital|clinic|market|hall|café|cafe|terminal|platform/i.test(raw);
      const semantic=isRole?['PERSON','JOB','WORK','CAREER']:(isPlace?['PLACE','BUILDING','VISIT','LOCATION']:related[cat]);
      const forbidden=[...new Set([...tokens,...semantic])].filter(x=>x!==upper).slice(0,4);
      while(forbidden.length<4)forbidden.push(semantic[forbidden.length%semantic.length]);
      return[cat,upper,forbidden];
    };
    fillLegacy(cards,i=>makeCard(legacyTargets[i%legacyTargets.length]),x=>x[1]);
    if(typeof build==='function')build();
  }

})();