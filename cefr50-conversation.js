/* Reviewed additions for the 50-card speaking release. Explicit cards, not a
   topic/template cross-product. Related game formats intentionally share tasks. */
(function(){
'use strict';
const B=window.ESCCefrBank;if(!B)throw Error('CEFR bank must load first');
const rows=s=>s.trim().split('\n').map(s=>s.trim()).filter(Boolean).map(s=>s.split('|').map(s=>s.trim()));
const clone=x=>JSON.parse(JSON.stringify(x));
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function key(game,x){if(B.types[game]==='emoji')return JSON.stringify(x[1]);if(typeof x==='string')return norm(x);if(Array.isArray(x))return norm(x.slice(1).join(' '));return norm(x.q||x.title||x.item||JSON.stringify(x));}
function add(game,level,items){const pool=B.games[game][level],seen=new Set(pool.map(x=>key(game,x)));for(const x of items){const k=key(game,x);if(!seen.has(k)){seen.add(k);pool.push(clone(x));}}}
function cat(game,c){
 const aliases={
 'hot-seat':{Everyday:'Mixed',Fun:'Funny',Social:'Personal',Deep:'Personal',Spicy:'Spicy'},
 'one-for-me-one-for-you':{Social:'Personal'},
 'debate-roulette':{Food:'Fun',Work:'Everyday',Travel:'Everyday',Technology:'Everyday',Relationships:'Spicy'},
 'opinion-line':{Everyday:'Daily Life',Food:'Daily Life',Travel:'Daily Life',Fun:'Daily Life'},
 'hot-take':{Fun:'Everyday'},
 'worst-advice-only':{Everyday:'Daily Life',Chaos:'Daily Life',Deep:'Study',Spicy:'Relationships'},
 'two-truths-one-lie':{Everyday:'Daily Life',Funny:'Fun',Personal:'Random',Spicy:'Social',Food:'Daily Life'},
 'would-i-lie-to-you':{Everyday:'Personal',Fun:'Funny',Future:'Personal',Random:'Funny'}
 };
 return aliases[game]?.[c]||c;
}
const open={
A1:rows(`Everyday|What time do you have dinner?
Everyday|What do you keep next to your bed?
Everyday|Which shop is near your home?
Everyday|Do you like quiet mornings or busy mornings?
Fun|Can you make a funny face?
Fun|What is a funny name for a dog?
Fun|Do you eat the small chips or the big chips first?
Fun|Is your bedroom tidy now?
Social|What do you say to a new neighbour?
Social|Who do you play games with?
Social|Do you like small parties or big parties?
Social|What do you bring to a picnic with friends?
Deep|What is important to you: friends or free time?
Deep|Where do you feel safe and happy?
Deep|Who helps you when you are sad?
Deep|What is one thing you are good at?
Spicy|Is coffee a good idea for a first date?
Spicy|Do you like flowers as a gift?
Spicy|What is a nice place for a date?
Spicy|Do you like a quiet or a funny person?
Spicy|What is a nice message to someone you like?
Spicy|Is a walk or a film better for a date?`),
A2:rows(`Everyday|What do you usually prepare before a busy day?
Everyday|Which room at home do you spend the most time in?
Everyday|What do you check before buying a train ticket?
Everyday|How do you choose clothes for a rainy day?
Fun|What did you think was expensive when you were a child?
Fun|What is a silly rule for a party game?
Fun|What happens when you try to take a group photo?
Fun|What was a funny name you gave to an object or a pet?
Social|How do you start talking to someone at a new class?
Social|What do you and your friends disagree about in a friendly way?
Social|What could you show a visitor in your neighbourhood?
Social|How do you tell a friend that you will be late?
Deep|What is something you can do now that you could not do last year?
Deep|What do you want more time for in your week?
Deep|What did a teacher help you understand?
Deep|What makes you feel proud after a normal day?
Spicy|What would you like to ask someone on a first date?
Spicy|Would you prefer a surprise date or a plan you choose together?
Spicy|What makes a small gift feel special?
Spicy|How do you politely say you do not want a second date?
Spicy|Is it easier to meet someone through friends or at a hobby group?
Spicy|What is more important on a date: the place or the conversation?`),
B1:rows(`Everyday|What is something you stopped buying because you could make it yourself?
Everyday|How do you recover when your morning does not go as planned?
Everyday|What would you recommend to someone spending a month in your town?
Everyday|What is a practical skill schools should give more time to?
Fun|What would your friends put on the cover of a magazine about you?
Fun|Which ordinary chore would be funniest as an Olympic sport?
Fun|What would a review of your usual bus journey say?
Fun|What is a completely harmless thing you get competitive about?
Social|When does a group conversation need a change of topic?
Social|What makes it easy to reconnect with an old friend?
Social|How do you show interest in a hobby you do not share?
Social|What is a kind way to disagree with a restaurant recommendation?
Deep|Which small responsibility taught you something important?
Deep|How do you know whether a goal is yours or someone else's expectation?
Deep|What does being independent mean in your daily life?
Deep|When can asking for help be more useful than trying alone?
Spicy|What makes a first date comfortable rather than impressive?
Spicy|How important is it for partners to have separate friends?
Spicy|How would you discuss different ideas about spending money with a partner?
Spicy|Can very different daily routines work well in a relationship?
Spicy|What is a thoughtful way to show interest without putting pressure on someone?
Spicy|Which matters more early in dating: shared interests or shared manners?`),
B2:rows(`Everyday|What would persuade you to change a routine that currently works reasonably well?
Everyday|How would you decide whether a local service is good value for everyone?
Everyday|What makes a learning goal realistic without making it too comfortable?
Everyday|When is paying for a service better than learning to do it yourself?
Fun|What would be a fair scoring system for a competition in household chores?
Fun|Which everyday object would give the most entertaining farewell speech?
Fun|What is the strongest reasonable defence of an unfashionable item you own?
Fun|When does a harmless personal rule become funny to other people?
Social|How can a group disagree openly without making quieter people withdraw?
Social|When should a host change a plan that most guests seem to enjoy?
Social|What distinguishes a helpful follow-up question from an intrusive one?
Social|How should friends divide the effort of staying in touch?
Deep|Can a decision be sensible even when you regret its outcome?
Deep|What makes a personal achievement meaningful without outside recognition?
Deep|When should someone stop improving a skill and simply enjoy using it?
Deep|How can a person be open-minded without accepting every claim equally?
Spicy|How should partners negotiate different expectations about time together?
Spicy|Can a relationship be private without being secretive?
Spicy|How can people discuss disappointment without making a partner feel tested?
Spicy|When does a romantic gesture create an obligation the other person did not choose?
Spicy|How should someone respond when a date's values differ from their first impression?
Spicy|Which differences between partners need agreement and which can remain differences?`),
C1:rows(`Everyday|When does maintaining a useful routine become attachment to familiarity?
Everyday|How should a city assess a service whose benefits are unevenly distributed?
Everyday|What would count as enough evidence to abandon a trusted learning method?
Everyday|How can consumers compare value when important benefits are difficult to measure?
Fun|What could a mock awards ceremony reveal about work that usually goes unnoticed?
Fun|How would you defend a deeply unfashionable chair without redefining good design to suit it?
Fun|Why can a mildly inconvenient kitchen appliance inspire a remarkably elaborate complaint?
Fun|What makes a parody of expert advice recognisable without making genuine expertise seem worthless?
Social|When can the appearance of consensus conceal a lack of meaningful participation?
Social|How can hospitality respect both a host's limits and a guest's different needs?
Social|What makes a question genuinely open rather than an argument disguised as curiosity?
Social|How should long-standing friendships adapt when the effort of maintaining them becomes unequal?
Deep|How would you separate the quality of a decision from the luck involved in its outcome?
Deep|Can privately defined success coexist with responsibilities to other people?
Deep|When does perseverance reflect commitment and when does it reflect reluctance to accept loss?
Deep|What is the difference between revising a belief and changing standards to protect it?
Spicy|How can partners distinguish a negotiable preference from a boundary without using labels to end discussion?
Spicy|When might a gesture intended as romantic overlook the recipient's autonomy?
Spicy|How should couples discuss unequal sacrifices without reducing the relationship to a transaction?
Spicy|Can expectations be reasonable individually but incompatible as a shared arrangement?
Spicy|How might the wish to avoid conflict prevent an honest discussion of compatibility?
Spicy|What does a fair compromise between privacy and reassurance need to preserve?`)
};
for(const l of B.levels){
 for(const game of ['hot-seat','question-roulette'])add(game,l,open[l].map(([c,q])=>[cat(game,c),q]));
 add('one-for-me-one-for-you',l,open[l].map(([c,q],i)=>({id:'l50-open-'+l+'-'+i,q,f:B.follow[l],category:cat('one-for-me-one-for-you',c),level:l})));
 const pool=B.games['truth-or-dare'][l];for(const [,q]of open[l])if(!pool.truths.includes(q))pool.truths.push(q);
}
const situations={
A1:rows(`Everyday|Your pen does not work. What do you use?
Everyday|Your room is very hot. What do you do?
Everyday|The shop has no bread. What do you buy?
Everyday|Your friend cannot find your house. What do you say?
Chaos|A dog takes your sandwich at the park. What do you do?
Chaos|You have ten cups but no tea. What do you give your guests?
Chaos|You hear your own voice on the radio. Who do you call?
Chaos|Your friend wears a coat in a very hot room. What do you ask?
Social|Someone says your name wrong. What do you say?
Social|You meet a new student. What do you ask first?
Social|Your friend cannot carry two bags. How do you help?
Social|Two friends want your last biscuit. What do you do?
Money|A book costs too much. What do you do?
Money|You have money for one drink. What do you choose?
Money|Your friend pays for your tea. What do you say?
Money|You need to buy a small gift. What do you buy?
Deep|You have one free hour today. How do you use it?
Deep|You feel sad at home. Who do you talk to?
Deep|You can help one person today. Who do you choose?
Deep|You can visit one new place. Where do you go?
Spicy|A person you like says hello. What do you say next?
Spicy|Your date likes tea, but you like coffee. Where do you go?
Spicy|You are early for a date. What do you do while you wait?
Spicy|You want to give someone a nice compliment. What do you say?`),
A2:rows(`Everyday|Your usual shop is closed today. Where else can you go?
Everyday|You cannot hear the teacher in an online class. What do you say?
Everyday|Your jacket is still wet before work. What can you wear?
Everyday|The cafe has no free tables. What do you suggest to your friend?
Chaos|A birthday balloon gets stuck on a very low ceiling. How do you get it down?
Chaos|You and your friend bring the same gift to a party. What do you do?
Chaos|Your shopping bag breaks outside your home. What do you do first?
Chaos|A voice assistant plays loud music instead of setting an alarm. What do you do?
Social|A new classmate cannot understand the game. How do you help?
Social|A friend brings someone you do not know to lunch. What do you ask them?
Social|Your friend wants to borrow a book you are still reading. What do you say?
Social|Someone talks during a film you both chose. What do you say politely?
Money|You find a cheaper version of something you want. What do you compare?
Money|Your friends choose a restaurant you cannot afford. What do you suggest?
Money|You buy a shirt, but it is the wrong size. What do you ask in the shop?
Money|You want to save for a bicycle. What can you spend less money on?
Deep|You have a day with no work and no plans. What is important to do?
Deep|You feel nervous before trying a new activity. What can help you?
Deep|You want to thank someone who helped you last year. What do you do?
Deep|You can spend an afternoon learning from a relative. What do you ask them to teach you?
Spicy|You do not like the food your date suggests. What do you say?
Spicy|Your date is twenty minutes late. What message do you send?
Spicy|Someone asks for your number, but you do not want to share it. What do you say?
Spicy|You enjoy a first date and want to meet again. How do you ask?`),
B1:rows(`Everyday|You have a free evening but several unfinished chores. How would you organise your time?
Everyday|A shop sells you a product with one missing part. How would you explain the problem?
Everyday|Your usual study place becomes too noisy. What alternatives would you try?
Everyday|Your internet fails just before a class. How would you let people know and catch up?
Chaos|A printer produces thirty copies of your shopping list during a meeting. How would you react?
Chaos|You practise a song on mute, then discover the call microphone was on. What would you say?
Chaos|At a fancy-dress party, you are the only person in costume. How would you handle it?
Chaos|A bakery puts your name on somebody else's birthday cake. How would you sort it out?
Social|A friend regularly changes the topic when you speak. How would you bring it up?
Social|Your group wants to play a game one person dislikes. How would you decide what to do?
Social|A neighbour offers help you do not need. How would you respond kindly?
Social|You realise a joke confused rather than amused a new friend. What would you say?
Money|You have saved for a holiday but your laptop needs repair. How would you set priorities?
Money|Your friends want to split a bill equally, but you ordered much less. What would you say?
Money|A free trial is ending tomorrow. What would you check before keeping the service?
Money|A useful second-hand item has no guarantee. What questions would you ask the seller?
Deep|You discover that a hobby you admire is not enjoyable for you. Would you continue?
Deep|A friend achieves a goal you are still working towards. How would you respond to them and to yourself?
Deep|You have the chance to repeat a recent conversation. What would you change?
Deep|You are good at something you do not enjoy. How would you decide whether to keep doing it?
Spicy|You and your date disagree about what counts as a late reply. How would you discuss it?
Spicy|You like someone but do not enjoy their favourite hobby. How would you show interest honestly?
Spicy|A friend wants to arrange a date for you without asking first. What would you say?
Spicy|You receive an expensive gift early in dating and feel uncomfortable. How would you respond?`),
B2:rows(`Everyday|A helpful app adds so many features that it becomes hard to use. How would you decide whether to replace it?
Everyday|An evening class is excellent but its homework is affecting your rest. What change would you negotiate?
Everyday|Your neighbourhood wants a quieter street but also more evening businesses. What compromise would you suggest?
Everyday|A delivery service repeatedly misses a promised time window. What would be a proportionate complaint?
Chaos|Your joke about a boring meeting appears in the official meeting notes. How would you correct it tactfully?
Chaos|A friendly quiz awards you points for an answer you know was wrong. What would you do?
Chaos|An automated caption turns your ordinary introduction into a ridiculous claim. How would you recover?
Chaos|An event organiser announces you as an expert in a hobby you only started last week. What would you say?
Social|A confident speaker dominates a useful discussion. How would you make more room without dismissing their contribution?
Social|A group is tired of planning, but the decision affects an absent member. How would you proceed?
Social|A friend asks you to keep a harmless surprise secret, but the intended guest dislikes surprises. What would you do?
Social|Someone gives an accurate correction in an embarrassing way. How would you address both the fact and the delivery?
Money|A membership saves money only if you use it frequently. How would you test whether it fits your routine?
Money|A shared purchase is useful to some friends more than others. How would you divide the cost fairly?
Money|A discount encourages you to buy more than you need. What criteria would you use before accepting it?
Money|A cheaper trip includes inconvenient connections. How would you compare price with the cost of your time?
Deep|A successful goal no longer feels meaningful. How would you decide what to pursue next?
Deep|Changing a familiar routine would help you but inconvenience someone else. How would you handle that tension?
Deep|A rule you supported produces an exception you had not considered. What would justify revising it?
Deep|Someone praises you for a result that depended mostly on luck. How would you respond?
Spicy|Two partners have different expectations about sharing location information. How would you start the conversation?
Spicy|A romantic surprise creates practical problems for the recipient. How should the giver respond?
Spicy|Your partner interprets time alone as rejection. How would you explain your needs without dismissing theirs?
Spicy|A couple wants to save together but has different incomes. What would a fair arrangement consider?`),
C1:rows(`Everyday|A supposedly convenient service saves your time by making its workers' schedules unpredictable. How would you evaluate the convenience?
Everyday|An adult course measures attendance closely but ignores what participants can actually do. What would you change?
Everyday|Residents support a quiet neighbourhood but disagree on whose activities count as noise. How would you establish a defensible standard?
Everyday|A familiar routine is reassuring but no longer serves its stated purpose. How would you distinguish its emotional value from practical value?
Chaos|Your deliberately exaggerated complaint about a kettle is circulated as serious consumer advice. How would you correct the misunderstanding without losing the useful point?
Chaos|A friendly contest develops more rules than any participant can remember. How would you restore proportion without dismissing fairness?
Chaos|An event presents you as an authority based on a joke in your biography. How would you correct the claim while keeping the atmosphere comfortable?
Chaos|A light-hearted ranking of office biscuits turns into a dispute about whose preferences count. How would you separate humour from the underlying concern?
Social|A group welcomes disagreement in theory but rewards agreement in practice. How would you identify and address the contradiction?
Social|A decision must be made before an affected person can contribute. What safeguards would make proceeding defensible?
Social|A well-intended act of help leaves its recipient feeling less capable. How would you reassess the approach?
Social|An apology is sincere but the speaker rejects every proposed change. How would you judge whether trust can be rebuilt?
Money|A low advertised price excludes costs most customers cannot realistically avoid. How would you evaluate the seller's transparency?
Money|An equal division of shared expenses creates very unequal burdens. How would you distinguish equality from fairness here?
Money|A service rewards frequent use in a way that encourages unnecessary consumption. How would you assess its apparent value?
Money|A purchase looks economical only because you ignore the time required to maintain it. How would you compare alternatives more honestly?
Deep|A major achievement changes how others see you but not how you see yourself. How would you interpret the mismatch?
Deep|A principle you value conflicts with a responsibility you voluntarily accepted. How would you reason through the conflict?
Deep|You are praised for consistency after the evidence has changed. How would you explain the case for changing course?
Deep|A useful personal story makes your argument persuasive but is not representative. How would you qualify the argument without dismissing the experience?
Spicy|One partner treats a negotiated agreement as permanent while the other sees it as open to review. How could they discuss the difference fairly?
Spicy|A couple's public image makes it harder to admit private disagreement. How would you frame a constructive conversation?
Spicy|Reassurance helps one partner but becomes an ongoing burden for the other. What would a sustainable arrangement need?
Spicy|Partners disagree on whether a past promise still applies after a major change in circumstances. How would you assess their responsibilities?`)
};
for(const l of B.levels){
 // The six already-authored category examples are also suitable advice situations.
 const examples=B.games['what-would-you-do-if'][l].slice(-6);
 add('worst-advice-only',l,examples.map(x=>[cat('worst-advice-only',x.c),x.q]));
 add('what-would-you-do-if',l,situations[l].map(([c,q])=>({c,q})));
 add('worst-advice-only',l,situations[l].map(([c,q])=>[cat('worst-advice-only',c),q]));
}
const choices={
A1:rows(`Everyday|breakfast early|breakfast late
Everyday|a quiet street|a busy street
Everyday|a small room near your friends|a big room far from your friends
Everyday|fresh bread|hot soup
Everyday|a window seat|a seat near the door
Everyday|a morning walk|an evening walk
Funny|a cup with your face on it|a shirt with your cat on it
Funny|one very long noodle|many very small noodles
Funny|a doorbell that says hello|an alarm that says good morning
Funny|a cake shaped like a shoe|a cake shaped like a phone
Funny|a hat for your dog|a bed for your toy bear
Funny|eat with a very big spoon|drink from a very small cup
Deep|more time with family|more time for a hobby
Deep|learn to swim|learn to read music
Deep|help at a school|help at an animal home
Deep|a quiet day|an exciting day
Deep|a new skill|a new place to visit
Deep|a home near the sea|a home near your family
Impossible|fly like a bird|swim like a fish
Impossible|talk to cats|talk to birds
Impossible|live in a house in a tree|live in a house under the sea
Impossible|a bag with no weight|a cup that is never empty
Impossible|a robot that cooks|a robot that cleans
Impossible|a bicycle that flies|a boat that walks
Spicy|coffee for a first date|a walk for a first date
Spicy|give flowers|give chocolate
Spicy|a funny message|a kind message
Spicy|a date in the morning|a date in the evening
Spicy|choose a date together|get a small surprise
Spicy|listen to music together|cook together`),
A2:rows(`Everyday|take lunch from home|buy lunch near work
Everyday|shop once a week|buy a few things every day
Everyday|study for twenty minutes daily|study for two hours on Saturday
Everyday|repair an old bag|buy a new bag
Everyday|get to work early|leave work later
Everyday|borrow books|buy books to keep
Funny|receive a birthday card from your pet|receive a birthday card from your fridge
Funny|wear party clothes to the supermarket|wear a raincoat on a sunny picnic
Funny|have a doorbell that sings your name|have a kettle that tells a joke
Funny|win a prize for the messiest desk|win a prize for the loudest laugh
Funny|eat a beautiful but boring cake|eat an ugly but delicious cake
Funny|have your old school photo on a mug|have your worst drawing on a T-shirt
Deep|learn a skill slowly with friends|learn it quickly alone
Deep|spend a day helping someone|spend a day learning something
Deep|live in a familiar town|try living in a new town
Deep|have more time to rest|have more time to travel
Deep|keep a useful old habit|start an exciting new hobby
Deep|receive good advice|receive practical help
Impossible|understand every animal|understand every language
Impossible|visit the past for one afternoon|visit the future for one afternoon
Impossible|have a bus stop at your door|have a small train in your garden
Impossible|make the rain stop for an hour|make the sun less hot for an hour
Impossible|have a suitcase that packs itself|have shoes that clean themselves
Impossible|find every lost key|remember every forgotten name
Spicy|meet someone through a friend|meet someone at a class
Spicy|plan a simple first date|plan an unusual first date
Spicy|receive a small handmade gift|receive a ticket to an event
Spicy|have the same hobbies|try different hobbies together
Spicy|talk by phone before meeting|meet for a short coffee first
Spicy|say clearly that you like someone|wait for them to ask you out`),
B1:rows(`Everyday|have a shorter working day|have one extra day off each month
Everyday|share a large kitchen|have a small kitchen to yourself
Everyday|use public transport with a longer journey|pay more for a shorter journey
Everyday|learn cooking from videos|learn cooking from a relative
Everyday|live above a quiet shop|live next to a busy park
Everyday|buy fewer things of better quality|have more inexpensive choices
Funny|be interviewed about your terrible singing|be interviewed about your excellent sandwich
Funny|let friends write your party introduction|let colleagues choose your karaoke song
Funny|have an alarm that negotiates with you|have a calendar that complains about your plans
Funny|be famous for collecting teaspoons|be famous for rating bus-stop benches
Funny|have a pet that criticises your clothes|have a plant that comments on your cooking
Funny|give a serious speech about socks|give an emotional speech about toast
Deep|be better at starting projects|be better at finishing projects
Deep|have a comfortable routine|have frequent new experiences
Deep|learn from one serious mistake|learn from many small mistakes
Deep|have a respected job you partly enjoy|have an ordinary job you really enjoy
Deep|receive honest feedback privately|receive enthusiastic praise publicly
Deep|keep a goal for ten years|change your goals as you learn more
Impossible|know when a bus will arrive anywhere|always find a free seat anywhere
Impossible|pause a busy day for thirty minutes|repeat a good hour once a week
Impossible|understand a pet's complaints|understand a baby's opinions
Impossible|instantly remember names|instantly remember directions
Impossible|visit a fictional city for a day|invite a fictional character to dinner
Impossible|see tomorrow's weather perfectly|remember yesterday's conversations perfectly
Spicy|date someone who plans carefully|date someone who enjoys last-minute plans
Spicy|discuss a disagreement immediately|take a short break before discussing it
Spicy|celebrate with a private dinner|celebrate with a group of friends
Spicy|share one hobby deeply|keep mostly separate hobbies
Spicy|receive a clear rejection|receive no answer at all
Spicy|date someone who texts often|date someone who prefers regular phone calls`),
B2:rows(`Everyday|accept a predictable routine with fewer options|accept more choice with more decisions to make
Everyday|pay a transparent fixed price|pay a lower price that varies with demand
Everyday|take a course with useful feedback|take a course with a well-known certificate
Everyday|use a repairable older device|use a faster device that is difficult to repair
Everyday|have a local service that is basic and reliable|have a feature-rich service that changes often
Everyday|receive fewer detailed updates|receive frequent short updates
Funny|have a committee approve your biscuit choices|have a consultant review your sock collection
Funny|defend a one-star review of your cooking|defend a five-star review of your terrible singing
Funny|write a formal report on a failed picnic|give a press conference about a burnt cake
Funny|have your phone question your screen time|have your sofa question your exercise plans
Funny|win an award for the shortest useful email|win an award for the least dramatic complaint
Funny|have your holiday reviewed by your luggage|have your working week reviewed by your chair
Deep|pursue a meaningful goal with uncertain results|choose a reliable goal with less personal meaning
Deep|protect a minority's needs at some cost to the group|maximise benefits for the majority
Deep|be trusted for admitting uncertainty|be admired for quick confident answers
Deep|have time to reconsider most decisions|be able to act decisively under pressure
Deep|improve one community service substantially|improve several services slightly
Deep|choose a reversible experiment|commit fully to a well-supported plan
Impossible|hear an honest review of your jokes from your pet|hear an honest review of your habits from your phone
Impossible|preview one consequence of a decision|undo one minor decision each week
Impossible|translate the tone of every message accurately|remember the exact wording of every conversation
Impossible|see how a city looked a century ago|see one plausible version of its future
Impossible|remove unnecessary queues|remove unnecessary meetings
Impossible|know when advice is unsupported|know when an advertisement is exaggerated
Spicy|share spending decisions but keep separate accounts|combine money with a clear personal budget
Spicy|have a partner who needs more time alone|have a partner who wants more shared activities
Spicy|discuss expectations early|let expectations develop and review them later
Spicy|receive a thoughtful practical gift|receive a carefully planned experience
Spicy|have a partner who challenges your views|have a partner who mainly supports your current views
Spicy|keep a relationship private online|share occasional updates by agreement`),
C1:rows(`Everyday|choose a simple service with clear limitations|choose a sophisticated service with less transparent limitations
Everyday|pay for reliability you rarely notice|pay for visible features you occasionally use
Everyday|follow a routine whose benefits are modest but demonstrated|test an appealing alternative with uncertain benefits
Everyday|receive an explanation of a decision's assumptions|receive a detailed description of its procedure
Everyday|prioritise predictable access to a service|prioritise maximum efficiency when the service is available
Everyday|trust a flexible policy with accountable judgement|trust a precise policy with limited discretion
Funny|submit your holiday packing list to peer review|defend your coffee routine before a budget committee
Funny|publish corrections to exaggerated complaints|publish limitations under enthusiastic recommendations
Funny|let your kettle evaluate your patience|let your calendar evaluate your realism
Funny|negotiate a constitution for a picnic|draft a code of conduct for choosing a film
Funny|receive an award for invisible problem prevention|receive an award for elegantly cancelling pointless work
Funny|explain a bad haircut without making excuses|justify an unnecessary gadget without changing your criteria
Deep|preserve a fair procedure with a disappointing outcome|adjust the procedure for a compelling exceptional case
Deep|make uncertainty explicit despite a less persuasive message|give a clear message while leaving qualifications for questions
Deep|reward an excellent individual result|reward work that makes other people's results possible
Deep|revise a public position promptly|wait for stronger evidence before changing it publicly
Deep|pursue broad agreement that takes longer|make a timely decision with a documented unresolved objection
Deep|accept some inefficiency to protect meaningful choice|reduce choice to make a system consistently usable
Impossible|see the hidden assumptions in any argument|see the hidden costs in any purchase
Impossible|preview how advice will be misunderstood|preview which part of an explanation people will remember
Impossible|read the intentions behind one message a day|see the consequences of one reply a day
Impossible|ask a future city one question about today's planning|ask a past city one question about its lost customs
Impossible|remove false certainty from public claims|remove unnecessary complexity from ordinary procedures
Impossible|remember every exception to your rules|notice every contradiction between your goals and habits
Spicy|negotiate shared routines in detail|allow flexibility and accept occasional misunderstandings
Spicy|keep an old agreement until both agree to revise it|review agreements automatically when circumstances change
Spicy|prioritise emotional reassurance through openness|prioritise autonomy through protected private space
Spicy|make unequal contributions explicit and discuss them|avoid keeping score but review growing resentment
Spicy|address incompatibility early with incomplete information|allow more time while acknowledging uncertainty
Spicy|share long-term goals but differ on daily habits|share daily habits but differ on long-term priorities`)
};
for(const l of B.levels)add('would-you-rather',l,choices[l]);
const motions={
A1:rows(`Everyday|A clean table is important.
Everyday|A quiet morning is a good morning.
Everyday|Everyone needs a day with no plans.
Everyday|Small shops are nice places to shop.
Food|Soup is good in summer too.
Food|A birthday needs a cake.
Food|Fruit is a good snack.
Food|The last biscuit is for the guest.
Work|Work near home is better.
Work|A good teacher listens.
Work|A work break needs fresh air.
Work|A desk does not need many things.
Travel|A train trip is fun.
Travel|A holiday at home can be good.
Travel|A map is useful in a new town.
Social|A kind hello is important.
Social|Friends do not need the same hobbies.
Social|It is good to ask for help.
Social|People should say thank you more.
Technology|Phones should be quiet in class.
Technology|A phone is not a good dinner guest.
Technology|Pictures help people learn words.
Relationships|A first date can be a short walk.
Relationships|Small gifts can be very nice.
Relationships|Kind words are better than big gifts.
Relationships|A date does not need to cost much.
Deep|A good friend is better than a new phone.
Deep|Learning one new word is a success.
Deep|A quiet life can be a happy life.
Deep|Helping people is important.`),
A2:rows(`Everyday|People should leave some free time in their weekend plans.
Everyday|Borrowing a book is often better than buying it.
Everyday|A tidy room makes mornings easier.
Everyday|It is useful to try a different route sometimes.
Food|A simple meal can be the best part of a holiday.
Food|People should learn to cook one meal without a recipe.
Food|A cafe's chairs matter as much as its coffee.
Food|The last slice of cake should be shared.
Work|Work messages can usually wait until the next morning.
Work|A helpful colleague makes a difficult day easier.
Work|Learning a job takes more than watching someone once.
Work|Meetings need a clear finishing time.
Travel|A short trip can be as enjoyable as a long holiday.
Travel|Visitors should learn a few local words.
Travel|One good photo is better than fifty quick photos.
Social|Friends can enjoy a quiet afternoon together.
Social|It is polite to check before bringing an extra guest.
Social|People should introduce a new person to the group.
Social|A late reply does not always mean someone is rude.
Technology|People should check the date before sharing old news.
Technology|Phones make it too easy to change plans at the last minute.
Technology|Paper notes can still be useful.
Relationships|Planning a date together is better than guessing what someone likes.
Relationships|Partners do not need to watch every film together.
Relationships|A clear no is kinder than a confusing maybe.
Relationships|Thoughtful gifts do not need to be expensive.
Deep|Doing a little every day is better than waiting for a perfect day.
Deep|Rest is part of a good plan.
Deep|Making mistakes is normal when learning something new.
Deep|People can feel successful in different ways.`),
B1:rows(`Everyday|People should leave one evening a week without commitments.
Everyday|Learning to repair one useful thing is worth the effort.
Everyday|A routine should make life easier, not become another task.
Everyday|A useful service is better than a fashionable service.
Food|Restaurants should explain extra charges before people order.
Food|Cooking together is a better group activity than watching a film.
Food|A favourite cafe becomes part of a neighbourhood's identity.
Food|People should try food before giving a strong opinion about it.
Work|Asking a clear question can save more time than working faster.
Work|A reliable teammate matters more than a very confident teammate.
Work|Good instructions should make sense to a beginner.
Work|People should be allowed to say they do not understand a task.
Travel|A traveller should not treat every delay as a disaster.
Travel|Returning to a familiar place can teach you something new.
Travel|A good holiday does not need to look impressive in photos.
Social|A good host notices who has not had a chance to speak.
Social|Friendship does not require agreeing about everything.
Social|Being honest does not mean saying every thought immediately.
Social|People should ask before giving advice about personal choices.
Technology|Notification settings are as important as app features.
Technology|An easy cancellation process is a sign of a good service.
Technology|A useful online review needs a specific example.
Relationships|A date is not a test that one person has to pass.
Relationships|Partners should discuss different habits before blaming each other.
Relationships|Time alone can be good for a relationship.
Relationships|Shared humour cannot replace respectful communication.
Deep|Changing a goal is not always giving up.
Deep|You can be proud of progress that other people do not notice.
Deep|Being busy is not the same as doing something meaningful.
Deep|The best choice depends on the life you want, not only on the reward.`),
B2:rows(`Everyday|Simplicity is a feature when it reduces the effort of using a service.
Everyday|A routine should be reviewed when circumstances change.
Everyday|Reliable public spaces matter more than impressive one-off events.
Everyday|The cheapest option is not necessarily the best value.
Food|Restaurant reviews should separate personal taste from poor service.
Food|Food-waste reduction should not depend only on consumer effort.
Food|A cafe can contribute to a community without being a large business.
Food|An ordinary meal does not need an online rating.
Work|Clear responsibilities are more useful than constant progress meetings.
Work|Preventing a problem deserves as much recognition as fixing it visibly.
Work|Employers should distinguish availability from actual contribution.
Work|Feedback should include a realistic opportunity to act on it.
Travel|A tourist's convenience should not automatically override residents' needs.
Travel|Travel planning should account for rest, not only activities.
Travel|Visiting fewer places can produce a richer experience.
Social|A group should make it easy to disagree before a decision is final.
Social|Being included means having meaningful options, not just receiving an invitation.
Social|A respectful question can be more helpful than immediate reassurance.
Social|Friendships need room for changing circumstances.
Technology|A service should explain the practical consequences of its privacy options.
Technology|More data does not always produce a better decision.
Technology|An app that creates constant reminders may be solving the wrong problem.
Relationships|Partners should negotiate expectations rather than assume they share them.
Relationships|A surprise is thoughtful only when it suits the recipient.
Relationships|Privacy should not automatically be interpreted as dishonesty.
Relationships|Fair contributions do not always have to be equal contributions.
Deep|A reasonable decision can lead to an unfortunate result.
Deep|Changing your mind requires more than simply hearing a confident opposing view.
Deep|Not every worthwhile activity needs a measurable outcome.
Deep|A personal principle should leave room for relevant exceptions.`),
C1:rows(`Everyday|A service can be transparent without offering users a meaningful choice.
Everyday|Practical convenience should be assessed together with the costs it transfers to others.
Everyday|Familiarity is a legitimate benefit but not sufficient justification for preserving every routine.
Everyday|A good rule should be understandable without requiring an expert to explain every exception.
Food|A persuasive restaurant review should distinguish evidence from expectations that were never agreed.
Food|Food-waste policy should consider how incentives are distributed along the supply chain.
Food|The value of a neighbourhood cafe cannot be captured entirely by its sales.
Food|The right to hold a strong opinion about pizza does not imply the right to regulate everyone else's dinner.
Work|An institution should test whether its measures of success still represent its stated purpose.
Work|Accountability should include the design of incentives, not only individual conduct.
Work|A request for certainty can sometimes encourage less honest advice.
Work|Efficient communication should not erase information needed by less powerful participants.
Travel|A sustainable tourism policy must consider whose access is protected and whose access is restricted.
Travel|A well-planned holiday should preserve meaningful opportunities to change the plan.
Travel|Claims that travel broadens the mind need to account for how a person actually engages with a place.
Social|Consensus deserves less confidence when disagreement carries a social penalty.
Social|The strongest version of an opposing view should be addressed before its weakest example.
Social|An invitation is not genuinely inclusive when foreseeable participation barriers are ignored.
Social|A justified boundary can still require a considerate explanation.
Technology|Explicit permission is insufficient when the consequences are practically unintelligible to users.
Technology|Automating a flawed process can hide its assumptions rather than correct them.
Technology|A metric should remain open to scrutiny even after it has become an institutional target.
Relationships|A negotiated agreement may need review even when nobody has acted in bad faith.
Relationships|Emotional reassurance should not require the permanent surrender of personal autonomy.
Relationships|A fair relationship cannot be reduced either to strict accounting or to ignoring unequal burdens.
Relationships|A romantic gesture should be evaluated partly by whether the recipient was free to decline it.
Deep|Consistency is defensible only in relation to the principle being preserved.
Deep|A qualified recommendation can be more responsible than an apparently neutral list of options.
Deep|The credibility of a judgement depends partly on the speaker's willingness to state its limits.
Deep|A compromise is sustainable only if its burdens remain acceptable when circumstances change.`)
};
for(const l of B.levels)for(const g of ['debate-roulette','opinion-line','hot-take'])add(g,l,motions[l].map(([c,q])=>[cat(g,c),q]));
window.ESCCefr50={rows,add,cat,clone,norm,open,situations};
})();
