(() => {
  'use strict';

  const topics = {
    'daily life': ['morning routine', 'evening routine', 'weekends', 'housework', 'shopping', 'commuting', 'free time', 'sleep', 'exercise', 'phone use'],
    'preferences': ['music', 'films', 'books', 'clothes', 'weather', 'seasons', 'cafes', 'restaurants', 'sports and hobbies', 'games'],
    'food': ['breakfast', 'street food', 'home cooking', 'desserts', 'coffee', 'tea', 'healthy food', 'fast food', 'family recipes', 'trying new dishes'],
    'travel': ['city breaks', 'beach holidays', 'road trips', 'travelling alone', 'travelling with friends', 'packing', 'airports', 'hotels', 'local food abroad', 'dream destinations'],
    'friends': ['close friendships', 'meeting new people', 'trust', 'honesty in friendships', 'group plans', 'arguments', 'support', 'funny memories', 'keeping in touch', 'different interests'],
    'work': ['teamwork', 'deadlines', 'work-life balance', 'leadership', 'working from home', 'motivation', 'career changes', 'job interviews', 'learning at work', 'an ideal workplace'],
    'study': ['exams', 'homework', 'group projects', 'teachers', 'online learning', 'languages', 'note-taking', 'concentration', 'school memories', 'learning from mistakes'],
    'future': ['next year', 'five-year plans', 'future technology', 'future cities', 'future jobs', 'future travel', 'future skills', 'personal goals', 'saving money', 'a dream lifestyle'],
    'past': ['childhood games', 'school days', 'family holidays', 'a first job', 'a first trip alone', 'old friendships', 'past mistakes', 'favourite memories', 'things you used to believe', 'a day you would repeat'],
    'personality': ['patience', 'confidence', 'curiosity', 'kindness', 'humour', 'discipline', 'independence', 'creativity', 'being honest', 'adaptability'],
    'communication': ['small talk', 'text messages', 'phone calls', 'voice messages', 'giving advice', 'asking for help', 'disagreeing politely', 'public speaking', 'listening', 'first impressions'],
    'technology': ['social media', 'artificial intelligence', 'smartphones', 'online shopping', 'streaming', 'video calls', 'digital privacy', 'online news', 'apps', 'technology at work'],
    'society': ['public transport', 'city life', 'small towns', 'education', 'healthcare', 'the environment', 'community events', 'volunteering', 'rules', 'public spaces'],
    'money': ['saving', 'spending', 'budgeting', 'expensive hobbies', 'cheap pleasures', 'gifts', 'shopping habits', 'financial goals', 'sharing costs', 'buying experiences'],
    'health': ['healthy routines', 'sleep habits', 'stress', 'walking', 'doing sports', 'mental rest', 'screen time', 'healthy eating', 'taking breaks', 'staying motivated'],
    'culture': ['traditions', 'festivals', 'weddings', 'music culture', 'food culture', 'national holidays', 'family customs', 'local history', 'museums', 'language and culture'],
    'choices': ['comfort or adventure', 'city or countryside', 'planning or spontaneity', 'money or free time', 'career or travel', 'online or face-to-face communication', 'being an early bird or a night owl', 'saving or spending', 'stability or excitement', 'quality or quantity'],
    'problem solving': ['missing a bus', 'losing your phone', 'being late', 'a cancelled trip', 'a difficult customer', 'a disagreement', 'a broken plan', 'forgetting something important', 'a bad purchase', 'getting lost'],
    'imagination': ['a free year', 'a new public holiday', 'a dream business', 'living abroad', 'a superpower', 'a new app', 'a perfect city', 'a time machine', 'a dream home', 'meeting a famous person'],
    'opinions': ['success', 'happiness', 'good manners', 'privacy', 'fame', 'competition', 'failure', 'luck', 'talent', 'responsibility']
  };

  const patterns = {
    'daily life': [
      ['How does {x} usually fit into your day or week?', 'Describe what normally happens and how it affects you.'],
      ['What would make your {x} better?', 'Give one realistic change and explain why it would help.'],
      ['Do you prefer to plan {x} or decide naturally?', 'Explain your choice with a recent example.'],
      ['What is one small problem connected with {x}?', 'How do you normally solve it?'],
      ['If you could change one habit about {x}, what would you change?', 'Why would that change improve your daily life?']
    ],
    'preferences': [
      ['What do you enjoy most about {x}?', 'Explain what makes it interesting or enjoyable for you.'],
      ['How has your taste in {x} changed over time?', 'Compare what you liked before with what you like now.'],
      ['What makes something related to {x} really good in your opinion?', 'Give an example and explain your standards.'],
      ['Would you recommend your favourite kind of {x} to a friend?', 'What would you choose and why?'],
      ['What is one popular thing about {x} that you do not really enjoy?', 'Why do you think other people like it?']
    ],
    'food': [
      ['What makes {x} enjoyable for you?', 'Talk about taste, place, people, or memories.'],
      ['What is your best memory connected with {x}?', 'Where were you and what made the moment memorable?'],
      ['How would you introduce {x} to someone who has never tried it?', 'Describe what you would choose and why.'],
      ['Do you think people should spend more or less time on {x}?', 'Explain your opinion with an example.'],
      ['If you could improve one thing about {x}, what would it be?', 'How would your ideal version be different?']
    ],
    'travel': [
      ['What do you enjoy or dislike about {x}?', 'Explain your answer with a travel experience or example.'],
      ['How would you plan {x} for a three-day trip?', 'What would be your first priority and why?'],
      ['What can go wrong with {x}, and how can people prepare?', 'Give practical advice.'],
      ['Would {x} make a trip more relaxing or more exciting for you?', 'Explain why.'],
      ['What have you learned from experiences with {x}?', 'Describe one lesson you would remember next time.']
    ],
    'friends': [
      ['Why is {x} important in friendship?', 'Give an example from a friendship or situation you know.'],
      ['What can make {x} difficult between friends?', 'How should people deal with the problem?'],
      ['Have your ideas about {x} changed as you got older?', 'Explain what changed and why.'],
      ['What would you do if a close friend had a problem with {x}?', 'Describe how you would react.'],
      ['What is one lesson you have learned about {x}?', 'How did you learn it?']
    ],
    'work': [
      ['How important is {x} at work?', 'Explain how it can affect people or results.'],
      ['What is one challenge connected with {x}?', 'How would you deal with it in a professional way?'],
      ['What makes someone good at {x}?', 'Name the skills or attitudes that matter most.'],
      ['Would you like more or less {x} in your working life?', 'Explain what your ideal situation would look like.'],
      ['What advice would you give a new employee about {x}?', 'Why would that advice be useful?']
    ],
    'study': [
      ['What is your experience with {x}?', 'Describe what worked well or badly for you.'],
      ['What makes {x} easier for students?', 'Give two practical ideas.'],
      ['Do you think {x} is necessary for effective learning?', 'Explain your opinion with an example.'],
      ['What would you change about {x} in schools or universities?', 'Why would your change help students?'],
      ['What is one thing you have learned about {x}?', 'How would you use that lesson in the future?']
    ],
    'future': [
      ['How do you imagine {x} will look in the future?', 'What changes do you expect and why?'],
      ['What would be a realistic goal connected with {x}?', 'What first step could you take?'],
      ['What could make {x} easier to achieve?', 'Think about time, money, skills, or support.'],
      ['What worries or excites you most about {x}?', 'Explain why that part matters to you.'],
      ['If everything went well, what would you like {x} to look like?', 'Describe your ideal result in detail.']
    ],
    'past': [
      ['What do you remember most clearly about {x}?', 'Why has that memory stayed with you?'],
      ['How did {x} influence the person you are now?', 'Give one example.'],
      ['If you could change one thing about {x}, what would you change?', 'What difference might it have made?'],
      ['What did you learn from {x}?', 'Explain how that lesson helped you later.'],
      ['Would you like to experience {x} again?', 'Why or why not?']
    ],
    'personality': [
      ['How important is {x} in a person?', 'Explain when this quality is especially useful.'],
      ['Do you think you have enough {x}?', 'Give an example that shows your answer.'],
      ['Can people improve their {x}?', 'How could someone practise it?'],
      ['When can too much {x} become a problem?', 'Give a situation where balance is important.'],
      ['Who do you know who shows strong {x}?', 'What can you learn from that person?']
    ],
    'communication': [
      ['What makes {x} effective?', 'Give an example of good communication.'],
      ['What problems can happen with {x}?', 'How can people avoid misunderstandings?'],
      ['How confident are you with {x}?', 'What would help you become better at it?'],
      ['Has technology changed the way people use {x}?', 'Explain one positive and one negative change.'],
      ['What rule or habit would improve {x}?', 'Why would it make communication better?']
    ],
    'technology': [
      ['How has {x} changed everyday life?', 'Give one positive and one negative example.'],
      ['Do people depend too much on {x}?', 'Explain your opinion.'],
      ['What is one useful way to use {x}?', 'Describe when it saves time or solves a problem.'],
      ['What problem can {x} create?', 'How should people protect themselves or use it better?'],
      ['How do you think {x} will change in the next five years?', 'What would you like to see happen?']
    ],
    'society': [
      ['How well does {x} work where you live?', 'What is good and what could improve?'],
      ['Why does {x} matter to a community?', 'Give a practical example.'],
      ['What responsibility do individuals have regarding {x}?', 'What should people do themselves?'],
      ['What should governments or local authorities do about {x}?', 'Choose one realistic action and explain it.'],
      ['How could {x} be better in ten years?', 'Describe one change you would like to see.']
    ],
    'money': [
      ['What is your attitude toward {x}?', 'Explain where that attitude comes from.'],
      ['What is one good habit connected with {x}?', 'Why is it useful?'],
      ['What mistake do people often make with {x}?', 'How can they avoid it?'],
      ['How does {x} affect happiness or stress?', 'Give an example.'],
      ['What advice would you give a younger person about {x}?', 'Explain why that advice matters.']
    ],
    'health': [
      ['How does {x} affect your energy or mood?', 'Describe what you notice in your own life.'],
      ['What makes it difficult to maintain {x}?', 'How could people make it easier?'],
      ['What is one realistic improvement you could make to {x}?', 'When would you start and how?'],
      ['Do people talk enough about {x}?', 'Why or why not?'],
      ['What advice would you give someone struggling with {x}?', 'Keep the advice practical and realistic.']
    ],
    'culture': [
      ['What does {x} tell us about a culture?', 'Give an example from Türkiye or another country.'],
      ['How important is it to protect {x}?', 'Explain what could be lost if it disappeared.'],
      ['How has {x} changed between generations?', 'Compare older and younger people.'],
      ['What would you like a visitor to understand about {x}?', 'What example would you show them?'],
      ['Can {x} bring people together?', 'Explain when it works well and when it may not.']
    ],
    'choices': [
      ['Which do you prefer: {x}?', 'Explain your choice and give an example.'],
      ['When might you choose differently about {x}?', 'Describe a situation that could change your answer.'],
      ['What are the biggest advantages of each side of {x}?', 'Which advantage matters most to you?'],
      ['Do you think your choice about {x} will change as you get older?', 'Why or why not?'],
      ['What does your choice about {x} say about your personality?', 'Explain with a real example.']
    ],
    'problem solving': [
      ['What would you do first if you faced {x}?', 'Explain your first three steps.'],
      ['What is the worst way to react to {x}?', 'Why would that make the situation worse?'],
      ['Have you ever dealt with something like {x}?', 'What happened and what did you learn?'],
      ['Who would you ask for help with {x}?', 'Why would that person be useful?'],
      ['How could you prevent {x} from becoming a bigger problem?', 'Give practical advice.']
    ],
    'imagination': [
      ['If you could have {x}, what would it be like?', 'Describe it in enough detail for the group to imagine it.'],
      ['What would be the best part of {x}?', 'What might be surprisingly difficult about it?'],
      ['Who would you include in {x}?', 'Why would you choose those people?'],
      ['How would your daily life change because of {x}?', 'Give two specific examples.'],
      ['Would you still want {x} after one year?', 'Explain what might change your mind.']
    ],
    'opinions': [
      ['What does {x} mean to you?', 'Give your own definition and an example.'],
      ['Do people think too much or too little about {x}?', 'Explain your opinion.'],
      ['Can {x} be measured fairly?', 'Why or why not?'],
      ['How has your opinion about {x} changed over time?', 'What experience influenced you?'],
      ['What is one common belief about {x} that you disagree with?', 'Explain your reason respectfully.']
    ]
  };

  const fill = (template, topic) => template.replace('{x}', topic);
  const cards = [];
  let index = 1;
  Object.entries(topics).forEach(([category, values]) => {
    values.forEach((topic) => {
      patterns[category].forEach(([q, f]) => {
        cards.push({ id: `b-${index++}`, q: fill(q, topic), f: fill(f, topic), category, level: 'B' });
      });
    });
  });

  if (cards.length !== 1000) throw new Error(`Expected exactly 1000 B-level questions, got ${cards.length}`);
  window.ESC_QUESTIONS = cards;
})();
