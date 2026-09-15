(() => {
  'use strict';

  const topicGroups = {
    'daily life': ['morning routine','evening routine','weekends','housework','shopping','commuting','free time','sleep','exercise','phone use'],
    'preferences': ['music','films','books','clothes','weather','seasons','cafes','restaurants','sports and hobbies','games'],
    'food': ['breakfast','street food','home cooking','desserts','coffee','tea','healthy food','fast food','family recipes','trying new dishes'],
    'travel': ['city breaks','beach holidays','road trips','travelling alone','travelling with friends','packing','airports','hotels','local food abroad','dream destinations'],
    'friends': ['close friendships','meeting new people','trust','honesty in friendships','group plans','arguments','support','funny memories','keeping in touch','different interests'],
    'work': ['teamwork','deadlines','work-life balance','leadership','working from home','motivation','career changes','job interviews','learning at work','an ideal workplace'],
    'study': ['exams','homework','group projects','teachers','online learning','languages','note-taking','concentration','school memories','learning from mistakes'],
    'future': ['next year','five-year plans','future technology','future cities','future jobs','future travel','future skills','personal goals','saving money','a dream lifestyle'],
    'past': ['childhood games','school days','family holidays','a first job','a first trip alone','old friendships','past mistakes','favourite memories','things you used to believe','a day you would repeat'],
    'personality': ['patience','confidence','curiosity','kindness','humour','discipline','independence','creativity','being honest','adaptability'],
    'communication': ['small talk','text messages','phone calls','voice messages','giving advice','asking for help','disagreeing politely','public speaking','listening','first impressions'],
    'technology': ['social media','artificial intelligence','smartphones','online shopping','streaming','video calls','digital privacy','online news','apps','technology at work'],
    'society': ['public transport','city life','small towns','education','healthcare','the environment','community events','volunteering','rules','public spaces'],
    'money': ['saving','spending','budgeting','expensive hobbies','cheap pleasures','gifts','shopping habits','financial goals','sharing costs','buying experiences'],
    'health': ['healthy routines','sleep habits','stress','walking','doing sports','mental rest','screen time','healthy eating','taking breaks','staying motivated'],
    'culture': ['traditions','festivals','weddings','music culture','food culture','national holidays','family customs','local history','museums','language and culture'],
    'choices': ['comfort or adventure','city or countryside','planning or spontaneity','money or free time','career or travel','online or face-to-face communication','being an early bird or a night owl','saving or spending','stability or excitement','quality or quantity'],
    'problem solving': ['missing a bus','losing your phone','being late','a cancelled trip','a difficult customer','a disagreement','a broken plan','forgetting something important','a bad purchase','getting lost'],
    'imagination': ['a free year','a new public holiday','a dream business','living abroad','a superpower','a new app','a perfect city','a time machine','a dream home','meeting a famous person'],
    'opinions': ['success','happiness','good manners','privacy','fame','competition','failure','luck','talent','responsibility']
  };

  const patterns = [
    ['What do you think about {x}?','Explain your opinion and give one example.'],
    ['How has {x} affected your life or the people around you?','Describe a real or possible situation.'],
    ['What is one advantage and one disadvantage of {x}?','Which side matters more to you, and why?'],
    ['If you could change one thing about {x}, what would you change?','How would that change improve the situation?'],
    ['What advice would you give someone about {x}?','Explain why your advice could be useful.']
  ];

  const cards = [];
  let n = 1;
  Object.values(topicGroups).flat().forEach((topic) => {
    patterns.forEach(([q, f]) => {
      cards.push({
        id: `b-${n}`,
        q: q.replace('{x}', topic),
        f: f.replace('{x}', topic)
      });
      n += 1;
    });
  });

  if (cards.length !== 1000) console.error('Expected 1000 B-level cards, got', cards.length);
  window.ESC_QUESTIONS = cards;
})();
