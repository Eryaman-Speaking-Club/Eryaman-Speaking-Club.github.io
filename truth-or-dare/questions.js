(() => {
  'use strict';

  const sampleNames = ['İdris', 'Yağmur', 'Efe', 'Zeynep', 'Emir', 'Elif', 'Can', 'Duru'];

  const truthTopics = [
    'a habit you want to change','a moment you felt proud','a harmless lie you once told','your biggest pet peeve','a fear you have overcome','something you procrastinate on','a compliment you still remember','a skill you wish you had','a bad first impression you gave','a first impression that surprised you','a decision you would make differently','a small thing that instantly improves your mood','a food you pretend to like','a trend you do not understand','a childhood belief you had','a rule you secretly dislike','a time you changed your mind','a risk you are glad you took','a place you would move to tomorrow','a job you would never want','a famous person you would like to meet','a purchase you regret','something you spend too much money on','a message you almost sent but did not','a social situation you find awkward','a personality trait you value most','a personality trait you are working on','a friendship lesson you learned','something people often misunderstand about you','a goal you have not told many people about','a time you were unexpectedly brave','a time you were very lucky','a time you were very embarrassed','a teacher who affected you','a song connected to a memory','a film you can watch repeatedly','a hobby you would like to restart','a country you want to visit','a family tradition you like','a family tradition you would change','a thing you miss from childhood','a mistake that taught you something','a time you judged someone too quickly','a time you apologised first','a quality you admire in someone here','a situation where you struggle to say no','a time you broke a promise','something you are currently excited about','something you are currently worried about','a dream you remember clearly'
  ];

  const truthPatterns = [
    topic => `What is the real story behind ${topic}?`,
    topic => `How do you honestly feel about ${topic}?`,
    topic => `What have you learned from ${topic}?`,
    topic => `Would you tell the group about ${topic}? What happened?`
  ];

  const truths = [];
  truthTopics.forEach((topic, topicIndex) => {
    truthPatterns.forEach((pattern, patternIndex) => truths.push({ id: `t-${topicIndex + 1}-${patternIndex + 1}`, text: pattern(topic) }));
  });

  const dareSubjects = [
    'your last meal','your morning routine','your dream holiday','your favourite film','your phone','your job or studies','Ankara','your best friend','your weekend','your favourite food','your most-used app','your childhood','your dream home','your current mood','your last trip','coffee','English','a celebrity','the weather today','your next birthday'
  ];

  const dareTemplates = [
    subject => `Speak about ${subject} for 30 seconds without using the word “and”.`,
    subject => `Describe ${subject} like a dramatic movie trailer for 20 seconds.`,
    subject => `Explain ${subject} as if you were talking to a five-year-old.`,
    subject => `Give a one-minute sales pitch for ${subject}, even if it is impossible to sell.`,
    subject => `Talk about ${subject} using exactly five sentences.`,
    subject => `Describe ${subject} without naming it and let the group guess.`
  ];

  const dares = [];
  dareSubjects.forEach((subject, subjectIndex) => {
    dareTemplates.forEach((template, templateIndex) => dares.push({ id: `d-${subjectIndex + 1}-${templateIndex + 1}`, text: template(subject) }));
  });

  const bonusDares = [
    'Do your best news-presenter voice and announce what is happening in the room.',
    'Give someone in the group a sincere compliment in English.',
    'Make up a new English word and convince the group that it should exist.',
    'Tell a 20-second story that begins with “I knew this was a bad idea when…”',
    'Imitate a GPS giving directions from this room to the Moon.',
    'Say the alphabet backwards as far as you can in 20 seconds.',
    'Act out an emotion without speaking and let the group guess it.',
    'Use three random objects in the room to create a short story.',
    'Give a weather forecast for your life this week.',
    'Pretend you are accepting an award you definitely did not deserve.',
    'Speak like a robot until your next turn.',
    'Give a 30-second motivational speech to someone who lost a sock.',
    'Invent a ridiculous new law for Ankara and defend it.',
    'Explain how to make tea as if it were a dangerous scientific experiment.',
    'Tell the group three facts about yourself; one must be false. Let them guess.',
    'Make a slogan for Eryaman Speaking Club in ten seconds.',
    'Describe the person on your left using only positive adjectives.',
    'Pretend you are a tour guide and introduce this room as a famous landmark.',
    'Create a five-line dialogue between a cat and a taxi driver.',
    'Choose a word and speak for 30 seconds without using the letter “e”.',
    'Do a slow-motion celebration for five seconds.',
    'Make up a short commercial for water.',
    'Explain your day using only movie titles or imaginary movie titles.',
    'Tell a joke in English. If nobody laughs, explain why it was funny.',
    'Pretend your phone has feelings and apologise to it for something.',
    'Speak in a whisper until someone says your name.',
    'Create a new handshake with the person opposite you.',
    'Name five things in English that start with the same letter in ten seconds.',
    'Give a one-sentence life lesson in the style of a wise old person.',
    'Tell the group what superpower you have, then demonstrate it badly.'
  ];
  bonusDares.forEach((text, index) => dares.push({ id: `d-b-${index + 1}`, text }));

  window.ESC_TRUTH_DARE_DEFAULTS = {
    names: sampleNames,
    truths,
    dares
  };
})();
