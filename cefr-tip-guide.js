/* Contextual, CEFR-aware answer hints. Examples only: never give away hidden words. */
(function(){
'use strict';
if(window.ESCSpeakingTipGuide)return;
const empty=s=>String(s||'').replace(/\s+/g,' ').trim();
const config={
 choice:{
 focus:'Choose one option first. Explain your choice in a natural sentence.',
 cards:[
 ['1 · Choose / Seç','I would go with the first option.'],
 ['2 · Reason / Neden','The main reason is that it fits my needs better.'],
 ['3 · Example / Örnek','For example, I could actually use it this weekend.'],
 ['4 · Ask back / Devam','Which option would you choose, and why?']
 ]},
 past:{
 focus:'Remember one specific moment. Say what happened, then add one detail.',
 cards:[
 ['1 · Start / Başla','Yes, I remember something like that happening.'],
 ['2 · When / Ne zaman','It happened a few weeks ago, when I was with friends.'],
 ['3 · Detail / Ayrıntı','At first I was surprised, but we laughed about it later.'],
 ['4 · Ask back / Devam','Has anything similar ever happened to you?']
 ]},
 scenario:{
 focus:'Imagine the situation. Say what you would do first, then explain why.',
 cards:[
 ['1 · First move / İlk adım','I would start by talking to the people involved.'],
 ['2 · Reason / Neden','That would help me understand what went wrong.'],
 ['3 · Next step / Sonra','If that did not work, I would try a simpler solution.'],
 ['4 · Ask back / Devam','What would you try first?']
 ]},
 opinion:{
 focus:'Agree, disagree or partly agree. A clear opinion is better than a long introduction.',
 cards:[
 ['1 · Opinion / Fikir','I partly agree with that statement.'],
 ['2 · Reason / Neden','It makes sense in some situations, but not in every case.'],
 ['3 · Example / Örnek','For example, one person might benefit while another loses out.'],
 ['4 · Challenge / Devam','Can you think of a situation where the opposite is true?']
 ]},
 quick:{
 focus:'Respond quickly. Short, clear answers are better than complicated ones.',
 cards:[
 ['1 · Start / Başla','My first answer is the simplest one.'],
 ['2 · Add / Ekle','I can think of a second example as well.'],
 ['3 · Finish / Bitir','Finally, I would add one more idea.'],
 ['4 · Keep talking / Devam','Can anyone think of a different answer?']
 ]},
 story:{
 focus:'Build a story with a beginning, a change and an ending.',
 cards:[
 ['1 · Beginning / Başlangıç','One ordinary day, something unexpected happened.'],
 ['2 · Action / Olay','At first nobody understood what was going on.'],
 ['3 · Ending / Sonuç','In the end, it turned into a story we still laugh about.'],
 ['4 · Pass on / Devam','What happened next?']
 ]},
 general:{
 focus:'Answer the main question directly. Then add one reason, example or short story.',
 cards:[
 ['1 · Direct answer / Kısa','My first thought is that it depends on the situation.'],
 ['2 · Why / Neden','One reason is that people have different experiences.'],
 ['3 · Example / Örnek','For example, something similar happened to a friend of mine.'],
 ['4 · Ask back / Devam','How would you look at it?']
 ]}
};
const specific=[
 {re:/animal.*bus driver/i,mode:'choice',focus:'Name an animal and say why it would be an especially bad driver.',cards:[
 ['1 · Answer','A giraffe would make a terrible bus driver.'],['2 · Why','Its neck would probably hit the roof.'],
 ['3 · Detail','Imagine it trying to fit behind the steering wheel!'],['4 · Ask back','Which animal would be even worse?']]},
 {re:/fridge.*talk|talking fridge|fridge.*personality/i,mode:'scenario',focus:'Imagine the fridge as a person and describe what it would say or do.',cards:[
 ['1 · Answer','My fridge would complain about the door being left open.'],['2 · Why','It would be tired of people checking for snacks every five minutes.'],
 ['3 · Detail','It might say, "Nothing new has appeared since your last visit."'],['4 · Ask back','Would your fridge be strict or friendly?']]},
 {re:/coffee.*tea|tea.*coffee/i,mode:'choice',focus:'Choose tea or coffee and give a personal reason.',cards:[
 ['1 · Answer','I would choose coffee today.'],['2 · Why','It helps me feel ready for the morning.'],
 ['3 · Detail','I usually drink it while talking with friends.'],['4 · Ask back','Would you choose something different?']]},
 {re:/first date|on a date|dating|partner|romantic/i,mode:'opinion',focus:'Give an opinion about relationships without feeling required to share private experiences.',cards:[
 ['1 · Answer','For me, feeling comfortable matters most.'],['2 · Why','It is easier to get to know someone when nobody feels pressured.'],
 ['3 · Example','A simple walk can be better than an expensive restaurant.'],['4 · Ask back','What would make the situation comfortable for you?']]},
 {re:/app |apps |phone|smart device|technology/i,mode:'opinion',focus:'Explain how the technology affects everyday life.',cards:[
 ['1 · Answer','I would prefer something simple and reliable.'],['2 · Why','Extra features are not useful if they slow everything down.'],
 ['3 · Example','For example, I do not need an app to remind me to drink tea.'],['4 · Ask back','Which feature would you remove first?']]},
 {re:/group|friend|club|someone new/i,mode:'opinion',focus:'Think about how other people might feel, then explain one helpful action.',cards:[
 ['1 · Answer','I would try to make everyone feel included.'],['2 · Why','A group works better when people feel comfortable speaking.'],
 ['3 · Example','For example, I might invite a quiet person to share an idea.'],['4 · Ask back','What would you do in the same situation?']]},
 {re:/birthday|gift|present/i,mode:'choice',focus:'Choose something thoughtful and give a practical reason.',cards:[
 ['1 · Answer','I would choose a small personal gift.'],['2 · Why','It shows that I remembered what the person likes.'],
 ['3 · Example','For example, a funny mug could be more memorable than something expensive.'],['4 · Ask back','What is the best gift you have ever received?']]}
];
function build(question,slug,level,mode,hidden){
 const q=empty(question);
 if(hidden||!q||/^(ready\?|start|new round|secret mission|build a story|use all three words)$/i.test(q))return null;
 if(slug==='never-have-i-ever'&&/^Have you ever [a-z]/i.test(q)){
  const action=q.replace(/^Have you ever /i,'').replace(/\?$/,'').replace(/\byour\b/gi,'my').replace(/\byou\b/gi,'I');
  return {
   focus:'Choose I HAVE or NEVER first. Then share one short detail only if you want to. You can also pass.',
   cards:[
    ['1 · I HAVE','Yes, I have. I have '+action+'.'],
    ['2 · NEVER',"No, I haven't. I have never done that."],
    ['3 · One detail','It happened last year, and I remember it clearly.'],
    ['4 · Ask back','What about you? Have you ever done that?']
   ]
  };
 }
 const override=specific.find(x=>x.re.test(q));
 if(override)return {focus:override.focus,cards:override.cards};
 const lower=q.toLowerCase();
 let type=mode||'general';
 if(/^name three|^list three|^give three/.test(lower)||slug==='five-second-challenge')type='quick';
 else if(/^when did|^what was the last|^have you ever|^did you ever|^tell (us )?about a time|^when was the last/.test(lower))type='past';
 else if(/^which would you prefer|^would you rather|^which (one|would)|^do you prefer/.test(lower))type='choice';
 else if(/^what would you do|^your friend|^imagine |^suppose |^you (are|have|find|see|forgot|lost|miss)/.test(lower))type='scenario';
 else if(/debate|opinion-line|hot-take/.test(slug)||/\bshould\b|better than|more important than|^can |^is it (fair|better|okay|right)/.test(lower))type='opinion';
 else if(/story-chain|one-minute-story|emoji-story|would-i-lie|two-truths/.test(slug))type='story';
 else if(/^do you |^are you |^would you /.test(lower)){
  return {focus:'Say yes or no first. Add a reason or a small personal example.',cards:[
   ['1 · Direct answer','Yes, I do. It is something I enjoy.'],
   ['2 · Reason','I like it because it makes my day more interesting.'],
   ['3 · Example','For example, I often do it with a friend on weekends.'],
   ['4 · Ask back','What about you? Is your answer the same?']
  ]};
 }else if(/^what |^why |^how |^who |^where /.test(lower))type='general';
 const chosen=config[type]||config.general;
 const cards=chosen.cards.map(row=>row.slice());
 if(level==='A1-A2'){
  // Shorter language, but keep a complete example in each card.
  if(type==='opinion'){cards[0][1]='I agree with this idea.';cards[1][1]='I think it is good because it helps people.'}
  if(type==='past'){cards[0][1]='Yes, it happened last week.';cards[1][1]='I was with my friends.'}
 }
 if(level==='C1-C2'){
  // Higher-level answers get nuance without making the original prompt harder.
  if(type==='opinion'){cards[0][1]='I agree in principle, but it depends on the situation.';cards[2][1]='One exception might be a case where someone else bears the cost.'}
  if(type==='scenario')cards[2][1]='I would also consider who might be affected by that choice.';
 }
 return {focus:chosen.focus,cards};
}
window.ESCSpeakingTipGuide={build};
})();