/* Three broad speaking bands: A1-A2, B1-B2, C1-C2.
   Existing reviewed A1-C1 libraries are preserved and combined. C2 adds
   advanced response demands and a separate advanced vocabulary set. */
(function(){
'use strict';
const B=window.ESCCefrBank;if(!B)throw Error('CEFR bank must load before grouped levels');
const BASE=['A1','A2','B1','B2','C1'];
if(!BASE.every(l=>B.levels.includes(l)))return;
const clone=x=>JSON.parse(JSON.stringify(x));
const split=s=>s.split(',').map(x=>x.trim());
const GROUPS={'A1-A2':['A1','A2'],'B1-B2':['B1','B2'],'C1-C2':['C1','C2']};
const GROUP_LEVELS=Object.keys(GROUPS);
const support={
 'A1-A2':'Use clear everyday English. A short answer is fine; add one simple detail if you can.',
 'B1-B2':'Explain your reason, give an example, and compare another reasonable option when useful.',
 'C1-C2':'Qualify your view, make assumptions explicit, and address a plausible counterargument or exception.'
};
const advancedTerms=[
 ['epistemic humility','certainty,knowledge,limits,confidence'],
 ['normative claim','value,should,judgement,standard'],
 ['causal inference','cause,effect,evidence,relationship'],
 ['selection bias','sample,choose,unrepresentative,data'],
 ['survivorship bias','success,failures,sample,visible'],
 ['base-rate neglect','probability,prior,statistics,frequency'],
 ['falsifiability','test,disprove,claim,evidence'],
 ['institutional capture','organisation,influence,interest,control'],
 ['regulatory arbitrage','rules,jurisdiction,avoid,compliance'],
 ['collective action','group,cooperate,shared,problem'],
 ['coordination failure','group,organise,misalign,outcome'],
 ['social desirability bias','answer,approval,truth,survey'],
 ['bounded rationality','limits,decision,information,thinking'],
 ['sunk-cost fallacy','past,investment,continue,loss'],
 ['moral luck','outcome,responsibility,chance,ethics'],
 ['double standard','different,rules,unfair,similar'],
 ['value conflict','principles,priorities,clash,choice'],
 ['incentive compatibility','reward,behaviour,design,motivation'],
 ['reversibility','undo,decision,change,return'],
 ['policy coherence','rules,consistent,goals,government'],
 ['distributive justice','fairness,resources,allocation,society'],
 ['procedural legitimacy','process,accepted,fair,authority'],
 ['substantive fairness','outcome,fairness,result,justice'],
 ['stakeholder salience','affected,priority,influence,attention'],
 ['information asymmetry','knowledge,unequal,market,parties'],
 ['adverse selection','risk,information,market,choice'],
 ['principal-agent problem','delegate,incentive,representative,interest'],
 ['collective responsibility','group,accountability,shared,duty'],
 ['diffuse accountability','responsibility,unclear,many,actors'],
 ['strategic ambiguity','unclear,deliberate,message,flexibility'],
 ['rhetorical framing','language,presentation,perspective,argument'],
 ['motivated reasoning','belief,evidence,preference,interpretation'],
 ['preference falsification','public,private,opinion,pressure'],
 ['social proof','others,behaviour,signal,choice'],
 ['pluralism','multiple,views,society,diversity'],
 ['paternalism','choice,protect,authority,individual'],
 ['subsidiarity','local,decision,authority,level'],
 ['path creation','new,trajectory,change,institution'],
 ['lock-in effect','difficult,change,system,choice'],
 ['second-order effect','indirect,consequence,later,impact'],
 ['threshold effect','point,change,level,trigger'],
 ['cumulative impact','combined,effects,time,total'],
 ['reputational risk','trust,image,damage,organisation'],
 ['institutional trust','public,confidence,organisation,reliability'],
 ['democratic mandate','voters,authority,election,decision'],
 ['consent fatigue','permission,repeated,choice,attention'],
 ['cognitive load','mental,effort,working memory,complexity'],
 ['moral licensing','good deed,justify,behaviour,ethics'],
 ['strategic patience','wait,timing,long-term,decision'],
 ['epistemic injustice','knowledge,credibility,unfair,voice']
];
const abstractWords=['assumption','trade-off','incentive','legitimacy','uncertainty','precedent','fairness','autonomy','evidence','responsibility'];
const extraEmoji=['⚖️','🧭','🔍','🧩','📊','🗣️','🪞','🔄','🎯','🧠'];

function c2Question(q,type,i){
 const text=String(q).trim();
 const add={
  open:' What assumption behind your answer could reasonably be challenged?',
  past:' How has your interpretation of that experience changed since then?',
  problem:' Which principle would guide you, and what exception would you allow?',
  social:' What would make that choice fair rather than merely entertaining?',
  challenge:' Then rank your answers and defend the ranking.',
  flag:' What context could reverse your judgement?',
  motion:' Before concluding, state the strongest reasonable objection.',
  experience:' What did that experience change about your later judgement?',
  personal:' Include what you assumed at the time and how you would interpret it now.',
  finish:' Then add one qualification or exception.'
 }[type]||' Explain the strongest alternative interpretation before you conclude.';
 return text+add;
}
function makeC2(game,pool){
 const type=B.types[game];
 if(type==='truth')return {
  truths:pool.truths.map(q=>String(q).trim()+' What assumption or exception matters most?'),
  dares:pool.dares.map(d=>String(d).trim()+' Add one qualification or counterpoint before you finish.')
 };
 if(type==='taboo')return advancedTerms.map(([w,b])=>['Vocabulary',w.toUpperCase(),split(b).slice(0,4).map(x=>x.toUpperCase())]);
 if(type==='word')return advancedTerms.map(([w])=>['Vocabulary',w]);
 return pool.map((x,i)=>{
  if(type==='paired')return {...clone(x),id:'c2-'+game+'-'+i,q:c2Question(x.q,'open',i),f:support['C1-C2'],level:'C1-C2'};
  if(type==='past')return {...clone(x),q:c2Question(x.q,'past',i)};
  if(type==='problem'&&game==='what-would-you-do-if')return {...clone(x),q:c2Question(x.q,'problem',i)};
  if(type==='choice')return [x[0],String(x[1])+' — accepting its strongest downside',String(x[2])+' — accepting its strongest downside'];
  if(type==='social')return [x[0],c2Question(x[1],'social',i)];
  if(type==='challenge')return [x[0],c2Question(x[1],'challenge',i)];
  if(type==='flag')return [x[0],c2Question(x[1],'flag',i)];
  if(type==='motion')return [x[0],c2Question(x[1],'motion',i)];
  if(type==='experience')return [x[0],c2Question(x[1],'experience',i)];
  if(type==='twoTruths')return [x[0],x[1],support['C1-C2']+' Make the false statement plausible enough to survive one follow-up question.'];
  if(type==='story')return [x[0],String(x[1])+' Continue by revealing that one important assumption was incomplete.',support['C1-C2']];
  if(type==='open')return [x[0],c2Question(x[1],'open',i)];
  if(type==='personal')return [x[0],c2Question(x[1],'personal',i)];
  if(type==='finish')return [x[0],c2Question(x[1],'finish',i)];
  if(type==='mission')return 'Complete this advanced mission: '+String(x).replace(/[.]+$/,'')+'. Paraphrase the other person’s response before adding your own view.';
  if(type==='bingo')return String(x).replace(/[.]+$/,'')+' and can explain one complication or exception';
  if(type==='triples')return [x[0],x[2],abstractWords[i%abstractWords.length]];
  if(type==='ranking')return {...clone(x),title:String(x.title)+' — rank by long-term importance and defend your top two'};
  if(type==='detective')return {...clone(x),setup:String(x.setup)+' Include one detail that could reasonably be interpreted in two ways; explain the ambiguity after the reveal.'};
  if(type==='packing')return {...clone(x),title:String(x.title)+' Defend your three choices and identify the opportunity cost of leaving out the fourth-best option.'};
  if(type==='emoji')return [x[0],[...x[1],extraEmoji[i%extraEmoji.length]]];
  if(type==='sell')return {...clone(x),twist:String(x.twist)+' State one genuine limitation and identify who should not choose this product.'};
  if(type==='photo')return {...clone(x),questions:[...x.questions,'What assumption would most change your interpretation of this scene?']};
  return clone(x);
 });
}
function merge(type,a,b){
 if(type==='truth')return {truths:[...clone(a.truths),...clone(b.truths)],dares:[...clone(a.dares),...clone(b.dares)]};
 return [...clone(a),...clone(b)];
}
function cardCategory(game,x){
 const type=B.types[game];
 if(type==='paired')return x?.category||null;
 if(type==='past'||(type==='problem'&&game==='what-would-you-do-if'))return x?.c||null;
 if(['ranking','packing','detective','photo'].includes(type))return x?.cat||null;
 if(['mission','bingo','triples','sell','truth'].includes(type))return null;
 if(Array.isArray(x))return x[0]||null;
 return null;
}
const topic={
 'Everyday':'an ordinary plan changes at the last minute',
 'Daily Life':'a normal routine suddenly stops working',
 'Fun':'friends turn a simple activity into a playful competition',
 'Funny':'a small mistake becomes a story everyone remembers',
 'Personal':'someone has to choose between comfort and a personal goal',
 'Deep':'a reasonable decision has an unexpected consequence',
 'Spicy':'two people like each other but expect different levels of contact',
 'Dating':'a first date goes well but both people want different next steps',
 'Relationships':'two partners have different expectations about time together',
 'Travel':'a traveller has one free afternoon in an unfamiliar place',
 'Work':'a team has too much to do and must set priorities',
 'Work & Study':'someone has to balance a deadline with learning something properly',
 'Study':'a learner has limited time before an important task',
 'Social':'a quiet person is being left out of a group decision',
 'Future':'friends meet again ten years later and discover their priorities changed',
 'Mystery':'a handwritten note with no name appears inside a borrowed book',
 'Adventure':'a group reaches a fork in a trail with two safe but very different routes',
 'Challenge':'a simple task becomes difficult because the original plan no longer works',
 'Food':'friends need to choose a meal that suits different preferences and budgets',
 'Home':'people sharing a home disagree about one everyday rule',
 'Technology':'a useful app becomes more convenient but asks for more personal data',
 'Money':'friends need to make a fair choice under a limited budget',
 'Friendship':'two close friends need different things from the same weekend',
 'Personality':'someone is reliable but handles social situations very differently from the group',
 'Easy':'a familiar everyday task needs three simple examples',
 'Hard':'a group must solve a problem with two competing priorities',
 'Impossible':'you can choose one unrealistic ability but it comes with a serious inconvenience',
 'Opinion':'people disagree about a common habit that has both benefits and costs',
 'Childhood':'an old childhood belief looks very different from an adult perspective',
 'Random':'an ordinary object unexpectedly becomes the centre of a serious discussion',
 'Mixed':'a normal question has both a practical answer and a funny answer'
};
function scene(cat){return topic[cat]||('a group has to make a fair decision about '+String(cat).toLowerCase());}
function coverage(game,cat,i,band){
 const type=B.types[game],baseScene=scene(cat),s=i===0?baseScene:baseScene+' after the first plan fails and the group has to reconsider',adv=band==='C1-C2',mid=band==='B1-B2';
 const reason=adv?' Explain the assumptions, trade-offs and one reasonable counterargument.':mid?' Explain your reason and give one example.':' Give a clear answer and one simple reason.';
 const prompt=(lead)=>lead+reason;
 if(type==='paired')return {id:'coverage-'+game+'-'+band+'-'+cat.replace(/\W+/g,'-')+'-'+i,q:prompt('How would you respond if '+s+'?'),f:support[band],category:cat,level:band};
 if(type==='past')return {c:cat,q:prompt('Think of a time when '+s+'. What happened?')};
 if(type==='problem'&&game==='what-would-you-do-if')return {c:cat,q:prompt('What would you do if '+s+'?')};
 if(type==='choice')return [cat,'decide quickly about '+s+' and adjust later','wait for more information about '+s+' before deciding'];
 if(type==='social')return [cat,prompt('Who is most likely to handle this well: '+s+'?')];
 if(type==='challenge')return [cat,prompt('Name three ways to respond when '+s+'.')];
 if(type==='flag')return [cat,prompt('Imagine '+s+'. Red flag, green flag, or depends?')];
 if(type==='motion')return [cat,prompt('People should prioritise fairness over convenience when '+s+'.')];
 if(type==='experience')return [cat,prompt('Have you ever been in a situation where '+s+'?')];
 if(type==='twoTruths')return [cat,'Talk about '+s+'.',support[band]+' Give two true statements and one believable false statement.'];
 if(type==='story')return [cat,'One day, '+s+'.',support[band]+' Continue the story with a clear change.'];
 if(type==='open')return [cat,prompt('What is the best way to respond when '+s+'?')];
 if(type==='personal')return [cat,prompt('Tell a true or invented story about a time when '+s+'.')];
 if(type==='finish')return [cat,'When '+s+', the most important thing is ...'];
 return null;
}
const original={};for(const game of Object.keys(B.games))original[game]=clone(B.games[game]);
for(const game of Object.keys(B.games)){
 const type=B.types[game],c2=makeC2(game,original[game].C1);
 const grouped={
  'A1-A2':merge(type,original[game].A1,original[game].A2),
  'B1-B2':merge(type,original[game].B1,original[game].B2),
  'C1-C2':merge(type,original[game].C1,c2)
 };
 for(const band of GROUP_LEVELS)if(type==='paired')grouped[band].forEach(x=>{x.level=band});
 const required=B.categorySets?.[game]||[];
 if(required.length&&type!=='truth'){
  for(const band of GROUP_LEVELS){
   const pool=grouped[band];
   if(!Array.isArray(pool))continue;
   for(const cat of required){
    let n=pool.filter(x=>cardCategory(game,x)===cat).length;
    for(let i=n;i<2;i++){const extra=coverage(game,cat,i,band);if(extra)pool.push(extra);}
   }
  }
 }
 B.games[game]=grouped;
}
B.baseLevels=BASE;
B.groupDefs=GROUPS;
B.levels=GROUP_LEVELS;
B.follow={'A1-A2':support['A1-A2'],'B1-B2':support['B1-B2'],'C1-C2':support['C1-C2']};
B.version='20261007-group3-c2-1';
B.grouped=true;
})();
