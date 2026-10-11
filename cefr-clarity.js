/* Reviewed, plain-language cards for all Eryaman Speaking Club games.
   Executed after the 3-band CEFR decks have been assembled. */
(function(){
'use strict';
const B=window.ESCCefrBank;
if(!B||!B.grouped||B.clarityVersion)return;
const EDITS={
'Name three objects people defend with surprising passion.':'Name three everyday things people get strangely excited about.',
'The cheapest item on the menu had become the subject of a passionate debate.':'Two friends argue about which item on the menu is the best deal.',
'What is important to you: friends or free time?':'Would you rather spend your free evening with friends or alone?',
'What makes a disagreement productive rather than repetitive?':'How can people stop repeating themselves and find a solution during an argument?',
'What makes a personal achievement meaningful without outside recognition?':'What achievement would still make you proud even if nobody praised you?',
'When did you last recognise that your first assumption was incomplete?':'When did you realise you were missing an important detail?',
'What was the last ordinary object that caused a surprisingly strong opinion?':'What everyday object have you argued about more than you expected?',
'What was the last fictional relationship that challenged your assumptions about compatibility?':'Which film or TV couple made you think differently about relationships?',
'When did you last see privacy wrongly confused with secrecy in a story?':'When did you see someone in a story mistake privacy for hiding a secret?',
'What makes a recommendation intellectually honest?':'How can someone give advice without hiding its drawbacks?',
'What would count as enough evidence to abandon a trusted learning method?':'When should you stop using a learning method that used to work for you?',
'How would you separate the quality of a decision from the luck involved in its outcome?':'How can you judge a decision fairly when luck affects the result?',
'Which differences between partners need agreement and which can remain differences?':'What should couples agree on, and what is okay to disagree about?',
"How should someone respond when a date's values differ from their first impression?":'What would you do if a date had very different values from you?',
'How can partners distinguish a negotiable preference from a boundary without using labels to end discussion?':'How can couples tell the difference between a preference and a firm boundary?',
'What does a fair compromise between privacy and reassurance need to preserve?':'How can couples respect privacy while helping each other feel secure?',
'When does flexibility become inconsistency?':'When does making an exception to a rule become unfair?',
'What makes a question genuinely open rather than an argument disguised as curiosity?':'How can you tell if someone is asking a real question or trying to win an argument?',
'When does helpful advice become interference?':'When does giving advice start to feel like controlling someone?',
'Who should bear the cost of making a service accessible?':'Who should pay to make a service easier for everyone to use?',
'A personal principle should leave room for relevant exceptions.':'Even a good personal rule sometimes needs an exception.',
'Being included means having meaningful options, not just receiving an invitation.':'A real invitation means people can actually take part.',
'Reliable public spaces matter more than impressive one-off events.':'Good public spaces matter more than occasional big events.',
'A justified boundary can still require a considerate explanation.':'You can set a firm boundary and still explain it kindly.',
'A useful disagreement is better than artificial agreement.':'A respectful disagreement can be better than pretending to agree.',
'A respectful question can be more helpful than immediate reassurance.':'Asking a thoughtful question can help more than saying everything is fine.',
'An evening intended for genuine rest rather than productivity. Choose three.':'Plan a relaxing evening without work or chores. Choose three.',
'A financially efficient decision transfers most of its hidden costs to people with less influence. How would you evaluate it?':'A decision saves money but makes life harder for people with less power. Is it fair?',
'A service should explain the practical consequences of its privacy options.':'Apps should clearly explain what happens when you change privacy settings.',
'Privacy should not automatically be interpreted as dishonesty.':'Wanting privacy does not mean someone is hiding something.',
'A popular productivity tool saves time but collects more data than you expected. How would you decide whether to keep using it?':'An app saves time but collects too much personal data. Would you keep using it?',
'A successful goal no longer feels meaningful. How would you decide what to pursue next?':'You reached a goal, but it no longer matters to you. What would you do next?',
'A rule you supported produces an exception you had not considered. What would justify revising it?':'A rule you supported turns out to be unfair in one situation. Would you change it?',
'A helpful app adds so many features that it becomes hard to use. How would you decide whether to replace it?':'An app you liked has become too complicated. Would you switch to another one?'
};
const RECENT=[
'What did you drink most recently: tea, coffee or water?',
'What did you eat at your last meal?',
'What was in your last photo: a person, a place or food?',
'Which shop did you visit most recently?',
'Where did you go on your last bus or car trip?',
'What was the last song you listened to today?',
'What is the name of the last book you read?',
'Was your last phone call with family or a friend?',
'Where did you go on your last walk?',
'What was the last TV show you watched?',
'What subject was your last class about?',
'Was your last snack sweet or salty?',
'What did you drink on your last visit to a cafe?',
'Who did you send your last message to?',
'What did you do on the last rainy day?',
'What small mistake did you make recently?',
'What was the last new place you visited?',
'What made you laugh most recently?',
'What did you do the last time you met a friend?',
'What is the last new thing you learned?',
'What did you have for breakfast most recently?',
'What was the last cold drink you had?',
'Did you eat your last dinner at home or outside?',
'What was in your most recent shopping bag?',
'Was your last morning at home quiet or busy?',
'Did you last cook or clean in the kitchen?',
'Was your last ticket for transport or an event?',
'Did you spend your last day off at home or outside?',
'Who were you with the last time you laughed a lot?',
'What was in the last funny photo you took?',
'Have you lost a sock recently? What colour was it?',
'What was the last song you sang in the shower?',
'What did you try to draw most recently?',
'What did you eat the last time you had a big meal?',
'What animal was in the last funny animal video you saw?',
'What was the last small surprise you had?',
'Where were you the last time you felt very happy?',
'What was the last good idea you had?',
'Who did you help most recently?',
'What new English word did you learn recently?',
'Where were you the last time you had a quiet hour?',
'What was the last good book you read, and why did you like it?',
'Where did you go the last time you walked alone?',
'Who gave you the last nice gift you received?',
'What was the last film you watched with someone you like?',
'Who sent you the last kind message you received?',
'When did you last see or receive flowers? What colour were they?',
'For an imaginary date, would you choose a cafe or a park?',
'What did someone say the last time they gave you a compliment?',
'Is there a song that reminds you of someone special?'
];
const FOLLOW={
'What assumption behind your answer could reasonably be challenged?':['Can you give a real example?','What could change your mind?','When might another answer make sense?','How might someone else see this?'],
'How has your interpretation of that experience changed since then?':['Would you see it differently now?','What did you learn from it?'],
'Which principle would guide you, and what exception would you allow?':['What matters most in your decision?','What is one possible risk?'],
'What would make that choice fair rather than merely entertaining?':['Why did you pick that person?','What makes you think so?'],
'What context could reverse your judgement?':['What detail could change your vote?','Would you feel differently in another situation?'],
'What did that experience change about your later judgement?':['Did it change your opinion?','What did you learn from it?'],
'Include what you assumed at the time and how you would interpret it now.':['Include one believable detail.','Explain what happened next.'],
'Then add one qualification or exception.':['Use a clear example.'],
'Before concluding, state the strongest reasonable objection.':['What might someone on the other side say?']
};
function clear(s,game,band,index){
 if(typeof s!=='string')return s;
 let text=EDITS[s]||s;
 // C2 questions include a follow-up; simplify the original question too.
 if(text===s)for(const [original,plain] of Object.entries(EDITS)){
  if(text.startsWith(original+' ')){text=plain+text.slice(original.length);break;}
 }
 text=text.replace(/ after the first plan fails and the group has to reconsider/g,', and an unexpected problem makes the situation harder');
 if(text.includes('Give a different example.')){
  const additional=game==='story-chain'?'Then a surprise changes the plan.':
    game==='detective-alibi'?'One person remembers an important detail differently.':
    game==='ranking-room'?'Rank these according to your own priorities.':
    game==='desert-island'?'Which of your three choices matters most?':
    game==='photo-talk'?'One detail in the picture changes the story.':
    game==='sell-me-this'?'Mention a realistic drawback.':'Give one clear example.';
  text=text.replace(/\.? Give a different example\./g,'. '+additional);
 }
 text=text.replace(/\. Consider a different interpretation\./g,'. What else could it mean?');
 if(text.includes('Then rank your answers and defend the ranking.')){
  text=text.replace(/^Name three /,'Name three less obvious ').replace(/ Then rank your answers and defend the ranking\./g,'');
 }
 text=text.replace(/ — accepting its strongest downside/g,'');
 text=text.replace(/ What assumption or exception matters most\?/g,' Give one clear example.');
 text=text.replace(/ Add one qualification or counterpoint before you finish\./g,' Tell us why.');
 text=text.replace(/ Continue by revealing that one important assumption was incomplete\./g,' Then something unexpected changes the situation.');
 text=text.replace(/^Complete this advanced mission: /,'');
 text=text.replace(/ Paraphrase the other person’s response before adding your own view\./g,' Briefly repeat their answer in your own words.');
 text=text.replace(/ and can explain one complication or exception/g,' and can give a clear example');
 text=text.replace(/ — rank by long-term importance and defend your top two/g,' — which matters most over time?');
 text=text.replace(/ Defend your three choices and identify the opportunity cost of leaving out the fourth-best option\./g,' What would you leave out first?');
 text=text.replace(/ Include one detail that could reasonably be interpreted in two ways; explain the ambiguity after the reveal\./g,' One clue may have two meanings.');
 text=text.replace(/ State one genuine limitation and identify who should not choose this product\./g,' Mention one honest drawback.');
 text=text.replace(/What assumption would most change your interpretation of this scene\?/g,'What detail could change your guess?');
 for(const [suffix,alternatives] of Object.entries(FOLLOW)){
  if(!text.endsWith(suffix))continue;
  if(suffix==='Before concluding, state the strongest reasonable objection.')text='Discuss this claim: '+text.slice(0,-suffix.length).trim();
  else if(suffix==='Then add one qualification or exception.')text='Finish this sentence using a real example: '+text.slice(0,-suffix.length).trim();
  else text=text.slice(0,-suffix.length)+alternatives[index%alternatives.length];
  break;
 }
 // Short, natural game prompts replace awkward automatically generated scenarios.
 if(game==='would-i-lie-to-you'){
  const changed=text.includes('an unexpected problem makes the situation harder');
  if(text.startsWith('Tell a true or invented story about a time when friends need to choose a meal')){
   text=changed?'Tell a true or invented story about friends whose restaurant plan goes wrong.':'Tell a true or invented story about friends choosing an affordable place to eat.';
  }
  if(text.startsWith('Tell a true or invented story about a time when two people like each other')){
   text=changed?'Tell a true or invented story about two people whose date is interrupted by a change of plans.':'Tell a true or invented story about two people who disagree on how often to meet.';
  }
 }
 if(game==='worst-advice-only'){
  if(text.startsWith('A friend is dealing with this situation: a team has too much to do')){
   text='Your friend has too many tasks at work. Give silly but harmless advice, then give useful advice.';
  }
  if(text.startsWith('A friend is dealing with this situation: a traveller has one free afternoon')){
   text=text.includes('an unexpected problem makes the situation harder')
    ?'Your friend is lost in an unfamiliar city. Give silly advice first, then useful advice.'
    :'Your friend has one free afternoon in a new city. Give silly advice first, then useful advice.';
  }
 }
 if(game==='story-chain'&&text.includes('an unexpected problem makes the situation harder')){
  text=text.replace(/, and an unexpected problem makes the situation harder/g,'. Then the group needs a new plan.');
 }
 if(game==='what-would-you-do-if'&&text.startsWith('Your deliberately exaggerated complaint about a kettle')){
  text=index>=50&&band==='C1-C2'?'Your joking complaint about a kettle is taken seriously. How would you correct it without embarrassing anyone?':'Your funny complaint about a kettle is shared as serious advice. How would you explain the misunderstanding?';
 }
 return text.replace(/\?\./g,'?').replace(/\.\./g,'.');
}
for(const [game,pools] of Object.entries(B.games)){
 const type=B.types[game];
 for(const band of B.levels){
  if(type==='truth'){
   pools[band].truths=pools[band].truths.map((s,i)=>clear(s,game,band,i));
   pools[band].dares=pools[band].dares.map((s,i)=>clear(s,game,band,100+i));
   continue;
  }
  pools[band]=pools[band].map((item,i)=>{
   if(typeof item==='string')return clear(item,game,band,i);
   if(Array.isArray(item)){
    const x=item.slice();
    if(type==='choice'&&String(x[1]).includes('accepting its strongest downside'))return [x[0],clear(x[2],game,band,i),clear(x[1],game,band,i)];
    if(['word','taboo','emoji'].includes(type))return x;
    if(type==='triples'){
     if(band==='C1-C2'&&i>=50){const endings=['promise','secret','surprise','regret','choice','trust','mistake','rumour','decision','hope'];x[2]=endings[i%endings.length];}
     return x;
    }
    if(type==='twoTruths'){x[1]=clear(x[1],game,band,i);x[2]=clear(x[2],game,band,i);return x;}
    if(typeof x[1]==='string')x[1]=clear(x[1],game,band,i);
    if(type==='story'&&typeof x[2]==='string')x[2]=clear(x[2],game,band,i);
    return x;
   }
   const x={...item};
   for(const key of ['q','title','setup','desc','twist'])if(typeof x[key]==='string')x[key]=clear(x[key],game,band,i);
   if(Array.isArray(x.questions))x.questions=x.questions.map((s,j)=>clear(s,game,band,i+j));
   return x;
  });
 }
}
if(RECENT.length!==50)throw Error('The easy recency deck requires 50 reviewed questions');
for(let i=0;i<50;i++){
 const card=B.games['last-thing-you-did']['A1-A2'][i];
 if(!card?.q?.startsWith('Your last '))throw Error('Recency card order changed at '+i);
 card.q=RECENT[i];
}

/* Replace obscure specialist jargon in word games with useful advanced
   everyday language. Taboo restrictions stay paired to the new words. */
const WORDS=[
['overthinking','worry,thoughts,too much,decisions'],
['first impression','meeting,opinion,appearance,early'],
['mixed signals','confusing,message,romance,interest'],
['unspoken rule','hidden,expectation,behaviour,agreement'],
['personal boundary','limit,comfort,relationship,no'],
['social pressure','group,approval,choice,friends'],
['fear of missing out','events,miss,friends,anxiety'],
['people-pleasing','approval,agree,others,happy'],
['burnout','work,stress,energy,exhaustion'],
['emotional intelligence','feelings,understand,empathy,react'],
['active listening','attention,conversation,questions,understand'],
['constructive disagreement','respect,argument,opinions,discussion'],
['personal growth','change,learn,improve,self'],
['self-doubt','confidence,worry,decision,uncertain'],
['self-respect','values,confidence,dignity,limits'],
['dilemma','difficult,choice,options,decision'],
['peer influence','friends,choice,pressure,group'],
['impulse purchase','buy,quick,shopping,regret'],
['delayed gratification','wait,reward,patience,later'],
['conflicting priorities','goals,time,choose,important'],
['hidden agenda','motive,secret,plan,intention'],
['false confidence','sure,wrong,belief,certainty'],
['social awkwardness','shy,uncomfortable,conversation,group'],
['being misunderstood','words,wrong,meaning,communication'],
['miscommunication','message,confused,understand,wrong'],
['unrealistic expectations','hopes,impossible,too much,goals'],
['missed opportunity','chance,late,regret,choice'],
['second chance','again,mistake,opportunity,try'],
['unfair advantage','benefit,competition,rules,others'],
['social battery','energy,party,people,rest'],
['decision fatigue','choice,tired,many,thinking'],
['comfort zone','familiar,safe,new,risk'],
['impulsive decision','quick,thought,action,risk'],
['emotional distance','feelings,relationship,close,far'],
['mutual respect','both,people,kindness,values'],
['mixed emotions','happy,sad,feelings,together'],
['personal values','important,beliefs,principles,life'],
['conflict avoidance','argument,avoid,fear,silence'],
['benefit of the doubt','trust,assume,intention,uncertainty'],
['turning point','change,moment,life,decision'],
['sense of belonging','group,accepted,home,people'],
['empathy gap','understand,feelings,other,experience'],
['online persona','profile,identity,social,media'],
['selective memory','remember,forget,past,details'],
['hidden cost','price,extra,decision,money'],
['short-term thinking','now,future,benefit,consequence'],
['long-term commitment','promise,time,effort,relationship'],
['healthy compromise','agreement,fair,both,needs'],
['misplaced loyalty','friend,trust,wrong,side'],
['fear of failure','risk,mistake,success,worry']
];
if(WORDS.length!==50)throw Error('Advanced word replacement list must have 50 entries');
for(const game of ['taboo','who-am-i','explain-it-badly','three-clues']){
 const original=B.games[game]['C1-C2'].slice(0,50);
 const extras=WORDS.map(([word,banned])=>game==='taboo'?['Vocabulary',word.toUpperCase(),banned.split(',').map(s=>s.toUpperCase())]:['Vocabulary',word]);
 if(new Set([...original,...extras].map(x=>x[1].toLowerCase())).size!==100)throw Error('Duplicate vocabulary in '+game);
 B.games[game]['C1-C2']=[...original,...extras];
}

B.clarityVersion='20261011-clear2';
B.version=B.clarityVersion;
})();