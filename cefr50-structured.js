/* Coherent structured activities. Visual/story seeds may be shared across
   levels; the communicative task and response support change with the level. */
(function(){
'use strict';
const B=window.ESCCefrBank,{rows,add,clone}=window.ESCCefr50;
const split=s=>s.split(',').map(s=>s.trim());
const ranks=rows(`Food|Food for a train trip|sandwich,apple,water,biscuits,cheese|Priorities for food on a long journey|easy storage,low cost,limited waste,nutrition,enjoyment
Travel|Places for a short holiday|beach,town,mountains,lake,village|What makes a short holiday worthwhile|travel time,rest,new experiences,cost,good company
Friendship|Things to do with a friend|walk,cook,read,play a game,watch a film|What keeps an ordinary friendship enjoyable|shared time,interest in differences,reliability,space,humour
Work|A comfortable work room|chair,light,window,table,quiet|Conditions for sustainable focused work|comfort,quiet,clear priorities,breaks,access to help
Life|A good morning|breakfast,shower,walk,music,quiet|What makes a morning routine useful|predictability,flexibility,rest,time saved,enjoyment
City|Places near your home|shop,park,school,bus stop,library|Priorities in a liveable neighbourhood|essential services,public space,transport,quiet,affordability
Learning|Ways to learn a new word|picture,song,book,friend,game|Ways to make vocabulary learning useful|context,retrieval practice,feedback,personal relevance,regular use
Technology|Useful things on a phone|clock,map,camera,messages,music|What matters in a genuinely useful app|simplicity,reliability,privacy,clear cost,accessibility
Social|A friendly meeting|hello,names,tea,chairs,a simple game|What makes a meeting welcoming|clear expectations,choice,patient listening,introductions,accessible venue
Weekend|A quiet Saturday|book,walk,music,cooking,film|Priorities for a restorative weekend|rest,connection,freedom,small responsibilities,enjoyment
Future|Things to learn next|cooking,swimming,drawing,music,English|Criteria for a worthwhile learning goal|personal meaning,practical use,available time,support,enjoyment
Home|Things for a small kitchen|pan,plates,cups,table,fridge|Priorities in a small shared kitchen|safety,storage,ease of cleaning,fair access,cost
Dating|Places for a first date|cafe,park,museum,restaurant,bookshop|What makes a first date comfortable|easy conversation,ability to leave,shared choice,reasonable cost,considerate timing
Health|Things that help you rest|sleep,quiet,walk,music,time at home|Priorities for a manageable daily routine|adequate rest,realistic workload,social support,flexibility,regular breaks
Entertainment|Fun with no phone|cards,book,drawing,walking,music|What makes a phone-free evening enjoyable|choice,company,variety,low effort,room for boredom
Personal|A nice small gift|book,cup,flowers,photo,notebook|What makes a gift thoughtful|knowledge of the recipient,usefulness,freedom to decline,personal meaning,appropriate cost
Food|Things for a soup lunch|soup,bread,water,fruit,cheese|What matters in a shared simple meal|dietary needs,affordability,ease of preparation,company,limited waste
Travel|A comfortable bus ride|seat,window,water,book,music|Priorities in accessible transport|reliability,affordability,clear information,physical access,reasonable journey time
Friendship|Ways to say thank you|message,card,small gift,help,a phone call|Ways to recognise a friend's effort|specific thanks,reciprocal help,respecting limits,shared time,thoughtful gesture
Work|Help on a first day|names,map,notes,questions,a kind person|What new colleagues need first|clear role,access to information,permission to ask,time to practise,feedback
Life|Things for a free hour|walk,tea,book,music,a friend|What makes free time genuinely free|choice,absence of pressure,rest,privacy,room to change plans
City|A nice town square|trees,seats,cafe,water,space to walk|Priorities for an inclusive public square|shade,seating,access,safe movement,opportunities to meet
Learning|A good study place|chair,table,light,quiet,books|Criteria for a useful learning environment|focus,access to help,comfort,clear materials,flexibility
Technology|Things to take photos of|friends,food,trees,buildings,pets|What makes a photo worth keeping|personal meaning,context,quality,respect for privacy,story behind it
Social|Things to ask a new person|name,town,music,food,hobbies|Qualities of a good first conversation|curiosity,comfort,reciprocity,listening,freedom to pass
Weekend|A day with family|meal,walk,game,film,visit|What helps a family day work well|shared choice,realistic timing,space for rest,affordability,respect for differences
Future|A small project|garden,photo book,painting,recipe book,language diary|What makes a project feasible|clear purpose,manageable scope,available time,feedback,resources
Home|A nice reading corner|chair,lamp,book,table,blanket|What makes a home improvement worthwhile|regular use,comfort,maintenance cost,shared needs,flexibility
Dating|Small kind things on a date|listen,say thank you,ask a question,be on time,smile|What communicates genuine interest|attention,respect for boundaries,clear communication,curiosity,consideration
Health|A good break|water,walk,quiet,fresh air,a chat|What makes a work break restorative|autonomy,rest from the task,reasonable duration,comfort,no pressure to perform
Entertainment|Games for a rainy day|cards,word game,quiz,drawing game,story game|What makes a group game suitable|clear rules,appropriate challenge,inclusion,pacing,room for humour
Personal|Things you like about home|people,room,food,garden,quiet|What creates a sense of belonging|relationships,familiarity,choice,safety,participation
Food|Food for a small picnic|bread,fruit,cheese,water,salad|What matters when planning shared food|allergies,storage,affordability,preferences,ease of serving
Travel|Things to see in a town|park,museum,market,river,old street|How to choose a short visit's priorities|visitor interests,travel distance,access,local impact,time to enjoy
Friendship|Things friends can share|books,food,games,music,time|What makes sharing fair|consent,clear expectations,unequal needs,care for possessions,reciprocity
Work|Ways to explain a task|show it,draw it,write it,say it,practise it|What makes instructions effective|clarity,sequence,context,opportunity to ask,appropriate detail
Learning|Things to practise in English|names,food,places,questions,stories|What makes speaking practice useful|relevant language,safe mistakes,turn-taking,feedback,appropriate challenge
Technology|Ways to use less phone time|walk,book,cooking,game,music|Criteria for a useful digital boundary|clear purpose,feasibility,flexibility,shared expectations,actual benefit
Social|A small birthday|cake,friends,music,game,photos|Priorities in a considerate celebration|recipient preferences,accessible plan,reasonable cost,freedom to decline,shared enjoyment
Future|A good next month|rest,learning,friends,work,fun|Criteria for realistic monthly priorities|importance,available capacity,trade-offs,small next steps,room for setbacks`);
for(const [li,l]of B.levels.entries())add('ranking-room',l,ranks.map(r=>({cat:r[0],title:li<2?r[1]:li===2?r[1]+': rank what matters to you.':r[3],items:split(li<3?r[2]:r[4])})));
const packing=rows(`Food|Lunch in the park|sandwich,water,apple,blanket,cup,book|A small picnic with limited carrying space
Travel|A short train trip|water,ticket,book,phone,sandwich,coat|A train journey where you can take only three items from this list
Home|A quiet night at home|book,tea,blanket,music,notebook,fruit|An evening intended for genuine rest rather than productivity
Learning|A new English class|notebook,pen,water,dictionary,phone,small bag|A first class where you want to participate without overpreparing
Social|Tea with a new neighbour|tea,cups,biscuits,chairs,music,flowers|Welcoming a neighbour without making the meeting too formal
Food|A small cooking lesson|pan,spoon,recipe,apron,notebook,container|A practical lesson in a kitchen that already has basic facilities
Travel|An afternoon near a lake|water,hat,book,camera,food,coat|A relaxed afternoon outdoors with shops and shelter nearby
Home|A reading corner|chair,lamp,table,blanket,cup,bookcase|Improving one small corner of a shared room
Learning|Studying at a cafe|notebook,pen,book,headphones,water,phone charger|Studying away from home without carrying everything you own
Social|A birthday for four people|cake,game,music,drinks,flowers,camera|A low-pressure birthday for someone who dislikes large parties
Work|A short class presentation|notes,photos,pen,timer,water,example object|Making a short presentation clear without unnecessary equipment
Travel|Waiting for a late bus|water,book,coat,phone,snack,headphones|A long wait at a bus station with basic services available
Food|Breakfast for a guest|bread,eggs,fruit,tea,yogurt,cheese|A simple guest breakfast with limited preparation time
Home|Cleaning one small room|cloth,box,brush,bag,water,music|A small cleaning task that should not become a whole-day project
Learning|Learning a song|words,music,notebook,pen,phone,headphones|Practising a song without turning the hobby into a technical project
Social|A simple game night|cards,paper,pens,snacks,drinks,music|A game night for people who do not all know each other
Work|A new shared desk|lamp,notebook,pen,small box,calendar,water bottle|Making a shared workspace useful with only three additions
Travel|A town walk with a friend|map,water,camera,coat,snack,phone|Showing someone around town without rushing between attractions
Food|A cold lunch from home|salad,bread,fruit,cheese,water,yogurt|Preparing a lunch that is affordable and easy to carry
Home|A comfortable guest room|blanket,pillow,lamp,chair,water,towel|Helping an overnight guest feel comfortable without buying everything new
Learning|A drawing afternoon|paper,pencils,coloured pens,book,water,music|A beginner-friendly creative session with limited materials
Social|A welcome table at a club|name cards,pens,water,question cards,map,timer|Welcoming newcomers while keeping the event informal
Work|A short outdoor break|water,coat,book,phone,snack,headphones|Taking a break that actually interrupts the working routine
Travel|A museum afternoon|ticket,water,notebook,pen,camera,small bag|Visiting a museum without trying to record every exhibit
Food|A small cake party|cake,plates,forks,tea,music,flowers|A celebration with limited space on the table
Home|A phone-free hour|book,cards,notebook,pencils,tea,music|Making a short period offline enjoyable rather than compulsory self-improvement
Learning|Practising English with a friend|question cards,notebook,pen,timer,pictures,dictionary|A speaking session that balances support with natural conversation
Social|Meeting a visitor at a station|sign,map,water,phone,umbrella,snack|Making a visitor's arrival easy without overcomplicating the plan
Work|Organising a small meeting|agenda,timer,notebook,pen,water,whiteboard|A meeting that needs one decision rather than a long discussion
Travel|A short visit to a village|water,coat,camera,map,food,notebook|A local trip where free time matters as much as sightseeing
Food|A warm drink outside|tea,cups,blanket,biscuits,water,small table|A simple outdoor gathering close to home
Home|A place for shoes and coats|shoe rack,hooks,small chair,box,mat,mirror|Improving a crowded entrance shared by several people
Learning|Remembering new words|pictures,cards,notebook,songs,short stories,voice recorder|Choosing three learning supports you will realistically use
Social|A kind thank-you visit|card,flowers,biscuits,tea,photo,small gift|Showing appreciation without creating pressure to reciprocate
Work|Helping a new classmate|map,notes,example task,timetable,pen,contact name|Prioritising what a beginner needs before giving too much information
Travel|A rainy city afternoon|umbrella,coat,museum ticket,book,water,map|A weather backup that does not turn a relaxed trip into a race
Food|Sharing snacks at a meeting|fruit,biscuits,water,tea,nuts,cheese|Choosing shared food after checking participants' dietary needs
Home|A tiny balcony|chair,plant,small table,lamp,cushion,watering can|Making a limited outdoor space usable without overcrowding it
Learning|A simple story activity|pictures,three words,timer,notebook,pens,question cards|Supporting a story task without scripting the story for participants
Social|A quiet first date|cafe,park,bookshop,museum,short walk,small exhibition|Choosing three suitable options to discuss rather than planning everything for someone else`);
for(const [li,l]of B.levels.entries())add('desert-island',l,packing.map(r=>({cat:r[0],title:(li<2?r[1]:r[3])+'. Choose three.',items:split(r[2])})));
const selling=rows(`a pair of gloves|They keep your hands warm.|A person who walks to work in winter. Discuss comfort and practicality.
a small mirror|You can put it in a bag.|A traveller with limited luggage. Acknowledge what a small mirror cannot do.
a pair of walking shoes|You can wear them in the park.|A person comparing appearance with everyday comfort.
a white plate|You can use it for lunch.|A customer who wants useful tableware rather than decorative features.
a blue bowl|You can eat soup from it.|A student furnishing a small kitchen on a budget.
a wooden spoon|You can use it when you cook.|A beginner who wants simple tools they will actually use.
a fork|You can use it for dinner.|A customer choosing a durable everyday item rather than a novelty.
a glass|You can drink water from it.|A cafe owner comparing simplicity with an unusual design.
a warm blanket|You can use it on a cold evening.|A person choosing between warmth and easy storage.
a small pillow|You can put it on your chair.|A traveller who values comfort but has little space.
a red scarf|You can wear it in winter.|Someone who wants one versatile item rather than several fashionable ones.
a rain hat|It helps keep your head dry.|A walker who dislikes carrying too much equipment.
a simple clock|You can see the time.|Someone who wants to check the time without opening a phone.
a school bag|You can carry books in it.|A learner who needs comfort and durability more than extra pockets.
a large towel|You can use it after swimming.|A swimmer balancing comfort with the size of their bag.
a photo book|You can keep family photos in it.|Someone choosing a meaningful gift without extravagant cost.
a picture frame|You can put a photo in it.|A customer who values a personal memory more than new technology.
a plant|You can put it near a window.|A beginner who needs realistic care instructions rather than promises of effortless success.
a watering can|You can give water to plants.|Someone with a small balcony rather than a large garden.
a pair of slippers|You can wear them at home.|A person comparing comfort with how easy an item is to clean.
a small lamp|You can read at night.|Someone sharing a room who needs to consider another person's comfort.
a pencil|You can write and draw.|A customer who assumes simple products must be improved by adding features.
a set of coloured pens|You can draw pictures.|A beginner choosing a manageable creative hobby.
a pack of cards|You can play games with friends.|A group with different ages and different experience of games.
a paper calendar|You can write important dates.|Someone who wants fewer reminders rather than another digital system.
a shopping basket|You can carry food in it.|A shopper comparing convenience with storage space at home.
a door mat|You can clean your shoes on it.|Someone making a small practical improvement to a shared entrance.
a small table|You can put a cup and a book on it.|A person furnishing a very limited living space.
a bookcase|You can put your books on it.|Someone who wants to use their existing possessions rather than buy more.
a lunch bag|You can carry your lunch.|A commuter comparing ongoing usefulness with the initial price.
a coat|You can wear it on cold days.|A buyer who wants one reliable item for several situations.
a pair of sunglasses|You can wear them on a sunny day.|A traveller who wants a practical everyday accessory without exaggerated claims.
a ball|You can play with friends.|A club organiser choosing a simple shared activity.
a book about your town|You can read about places near you.|A visitor who has limited time and wants a useful selection rather than an exhaustive list.
a music notebook|You can write songs in it.|A hobbyist who wants to enjoy creating rather than track every result.
a tea pot|You can make tea for friends.|A host who values shared time more than impressive equipment.
a small box|You can keep keys and coins in it.|Someone trying to make an ordinary routine easier with a low-cost change.
a reusable food box|You can take food from home.|A buyer who needs to weigh practical use against cleaning and storage effort.
a toy car|You can give it as a small gift.|Someone seeking an appropriate modest gift rather than an expensive gesture.
a simple puzzle|You can do it with a friend.|A person choosing an activity for enjoyment rather than competition.`);
for(const [li,l]of B.levels.entries())add('sell-me-this',l,selling.map(r=>({item:r[0],twist:li===0?r[1]+' Say two short sentences.':li===1?r[1]+' Explain who can use it.':li===2?r[2]+' Give a realistic benefit.':li===3?r[2]+' Acknowledge one limitation.':r[2]+' Distinguish a supported benefit from an assumption; explain who should not buy it.'})));
const scenes=rows(`Travel|The crowded platform|Two friends are at a station. There is one free seat.|Where are they? Who can sit down?|What can the friends do while they wait?|How would they decide who takes the seat?|What should they consider besides who arrived first?|How would you distinguish a simple queue rule from a proportionate exception?
Food|The empty bread basket|Four friends have soup. The bread basket is empty.|What food is on the table?|What could someone ask the waiter for?|How would the group share the next basket fairly?|Would equal portions always be the fairest choice?|Which assumptions about needs would affect a fair division?
Social|The new name card|A new student has a name card. Two people say the name differently.|What is on the card?|What can the student say?|How can the group correct the mistake kindly?|How can the host correct others without embarrassing the newcomer?|How can a well-intended correction balance accuracy and the person's preferred way of handling it?
Home|The shared window|Two people are in one room. One feels cold. The other feels hot.|How do the people feel?|What simple change can they try?|How would they agree on a comfortable arrangement?|Which different needs should the arrangement protect?|What would distinguish an equal rule from a fair response to unequal needs?
Work|The small whiteboard|A team has ten jobs on a small board. They have time for only three.|How many jobs can they do?|What should they choose first?|How would the team explain its priorities?|What criteria would make the choice defensible?|How should the team account for important work that is less visible on the board?
Funny|The biscuit certificate|A friend wins a game. Another friend gives them a certificate and one biscuit.|What is the prize?|What can the winner say?|How could the winner give a funny thank-you speech?|What makes a mock award enjoyable rather than insulting?|How can humorous formality recognise real effort while keeping the stakes in perspective?
Travel|The heavy souvenir|A visitor buys a big cup. There is no room in their bag.|What did the visitor buy?|What can they carry differently?|How would they decide what to take home?|How should usefulness and personal meaning affect the choice?|What does this choice show about the limits of judging value only by practical use?
Food|The two menus|Two friends look at a menu. One wants soup. One wants a sandwich.|What do the friends want?|What can each person order?|How can they make a shared lunch work with different tastes?|When do different preferences need agreement and when do they not?|How can a group avoid treating every preference difference as a collective decision problem?
Social|The quiet player|A person watches a game and smiles. They do not want a turn yet.|What is the person doing?|What can the host ask?|How can the group offer a turn without pressure?|How would you distinguish inclusion from compulsory participation?|What makes participation meaningful when declining is also a legitimate choice?
Home|The borrowed lamp|A student lends a lamp to a friend. Now both need it to read.|What do they need the lamp for?|What simple plan can they make?|How would they discuss returning the lamp?|Which expectations should have been clear when it was borrowed?|How should generosity and continuing practical need affect an informal agreement?
Work|The late instructions|A class starts a task. The instructions arrive five minutes later.|What arrived late?|What can the students ask?|How should the teacher adjust the task?|How can a teacher take responsibility without making the delay the whole lesson?|What would a proportionate correction preserve while acknowledging the mistake?
Funny|The formal sandwich|A person puts a small sandwich on a large plate and announces it like a famous dish.|What is on the plate?|How can the person describe it?|What would a funny but honest menu description say?|Where is the line between playful presentation and misleading a customer?|How would context change whether the same exaggerated description counts as humour or a deceptive claim?
Travel|The familiar visitor|A visitor knows a town from pictures. The streets feel different when they arrive.|Where did the visitor see the town before?|What can they explore first?|What might surprise them about the real place?|How can images create expectations that a visit changes?|How should a memorable set of images be distinguished from representative evidence about a place?
Food|The extra lunch|A person brings two lunches to work by mistake. A colleague has no lunch.|How many lunches are there?|What can the person offer?|How should they offer food without making assumptions?|What should they check before sharing a meal?|How can generosity respect the other person's needs and ability to decline?
Social|The moving chairs|Friends move chairs into a circle. One person needs more space.|What are the friends moving?|How can they change the circle?|How can the host ask what arrangement works?|What makes a seating plan genuinely inclusive?|How should the group assess access beyond simply providing the same chair to everyone?
Home|The favourite old mug|A person has a new mug but still uses an old one with a faded picture.|Which mug do they use?|Why might they like the old mug?|Tell a possible story behind the picture.|How can personal meaning outweigh appearance or price?|How does this case illustrate the limits of measuring value through easily compared features?
Work|The repeated question|Three new people ask the same question about a task.|How many people ask the question?|What can the teacher explain again?|What might need changing in the instructions?|How should repeated confusion affect the way a team evaluates its process?|When does treating confusion as an individual problem hide a flaw in the design of instructions?
Funny|The calendar's day off|A person writes 'do nothing' in a calendar, then adds six activities under it.|What did the person write first?|Which activities can wait?|How could they make the day less busy?|When does organising rest become another obligation?|What assumptions about worthwhile time might make an unstructured day difficult to accept?
Travel|The short route|A map shows a short route with stairs and a longer flat route.|Which route has stairs?|Who might prefer the flat route?|What should a person ask before recommending a route?|How should advice about the best route account for different needs?|Why can technically correct shortest-route advice still be inaccessible or misleading?
Food|The different cups|At a cafe, one friend gets a small coffee and another gets a large tea.|What drinks do they have?|Which drink do you prefer?|How can both people enjoy the cafe without agreeing on the best drink?|What would make a comparison useful rather than purely personal?|How can a discussion distinguish a preference, a quality criterion and a universal claim?
Social|The missing invitation|Friends plan a walk. One friend did not receive the message.|Who missed the message?|What can the friends send now?|How can the group include the person without blame?|What should change if the same person often misses information?|How should an organiser distinguish accidental omission from a communication system that predictably excludes people?
Home|The small bookshelf|Two people have one small bookshelf and many books.|What do they need space for?|What can they keep somewhere else?|How would they choose which books stay nearby?|Which criteria should a fair storage arrangement include?|How can unequal use and different personal meanings affect a shared-space agreement?
Work|The finished task|A team finishes a task early. One person suggests starting more work; another wants the agreed break.|What did the team finish?|What can they discuss?|How should they decide what to do next?|How do earlier expectations affect what is fair?|What incentives might be created if finishing efficiently always produces an extra workload?
Funny|The serious spoon review|A person writes a very long review of a plain spoon.|What object is the review about?|What could a spoon review say?|Give a funny but useful review in three sentences.|What separates useful detail from unnecessary analysis here?|How can an exaggerated review expose the mismatch between the stakes of a choice and the effort devoted to it?
Travel|The unexpected free morning|A museum opens later than two visitors expected. There is a park nearby.|What place is closed?|Where can the visitors go now?|How could this delay improve their day?|How much flexibility should a good itinerary preserve?|When should a plan be treated as a support for an experience rather than a standard the experience must satisfy?
Food|The shared recipe|Two people use the same recipe. Their cakes look different.|What did they make?|What ingredients or steps can they compare?|How could they find a useful explanation without blaming the cook?|Which differences would matter before judging either result?|How would you distinguish an uncontrolled variation from evidence that the recipe is unreliable?
Social|The good listener|A person starts telling a story. Their friend puts a phone away.|What does the friend put away?|What can the listener ask next?|How can a follow-up show real interest?|When does a follow-up become intrusive rather than helpful?|What makes curiosity genuine rather than an attempt to direct the speaker towards a preferred answer?
Home|The quiet hour|Two people share a home. One wants music while the other wants to read quietly.|What does each person want?|What simple options do they have?|How can they make an arrangement for the evening?|How should the arrangement respond to changing needs?|What would make a recurring agreement fair without requiring every evening to become a negotiation?
Work|The useful mistake|A student makes a mistake that helps the class understand a rule.|What helps the class learn?|What can the teacher say kindly?|How can the class discuss the mistake without embarrassing the student?|How should a teacher balance useful feedback with psychological comfort?|How can an institution encourage learning from mistakes without making individuals bear a disproportionate social cost?
Funny|The trophy shelf|A person proudly shows a trophy for finishing the washing-up.|What is the trophy for?|What other small job could get a prize?|Give a funny acceptance speech for an ordinary task.|Why might recognising ordinary effort be useful even as a joke?|When can playful recognition make invisible work visible without turning every activity into a performance?
Travel|The group photo pause|A group takes many photos at a viewpoint. One person wants time to look at the view.|What does one person want to do?|What can the group agree to do next?|How can the group balance pictures with enjoying the place?|When does documenting an experience reduce the experience itself?|How might the way an experience will be presented to others change the choices made during it?
Food|The honest waiter|A waiter says a cheaper dish may suit a customer's request better.|What does the waiter suggest?|What can the customer ask?|Why could this advice make the customer trust the cafe?|What distinguishes useful advice from a sales tactic here?|What evidence beyond a single helpful recommendation would justify confidence in a business's incentives?
Social|The different hobbies|Two friends enjoy spending time together but like different hobbies.|What is different about the friends?|What can they do together?|How can they show interest without pretending to share a hobby?|Which differences enrich friendship and which require an agreement?|How can a relationship accommodate differences without treating either total similarity or total independence as an ideal?
Home|The reminder on the door|A person puts a note on the door to remember their keys. There are already many notes.|What should the note help them remember?|What can they remove or change?|When do reminders stop helping?|How would you assess whether the reminder system reduces mistakes or adds clutter?|How can a measure intended to improve attention become part of the problem it is meant to solve?
Work|The quiet solution|A teammate fixes a small problem before anyone notices it.|What did the teammate do?|How can the team say thank you?|Why is this contribution easy to miss?|How should teams recognise problem prevention as well as visible problem solving?|What kinds of measurement tend to undervalue work whose success is the absence of a problem?
Funny|The picnic agenda|A group brings an agenda to a very small picnic.|What is the meeting about?|What can they leave unplanned?|Which parts of a picnic really need planning?|How would you preserve useful preparation without losing the relaxed purpose?|When does a procedure stop serving an activity and start defining what counts as doing it properly?
Dating|The agreed first date|Two people choose a short walk near a cafe for a first date.|Where will they meet?|What can they talk about?|Why might a simple plan make a first date comfortable?|What features make a date easy to accept, change or decline?|How does meaningful choice affect whether a plan is considerate rather than merely impressive?
Dating|The small gift|Someone remembers a favourite snack and brings it as a gift.|What is the gift?|Why might the person like it?|What makes this gesture thoughtful without much expense?|How can a gift show attention without creating an obligation?|How should the recipient's freedom to respond affect the evaluation of a generous gesture?
Dating|The different weekends|Two partners want different weekend activities. One wants a quiet day; one wants to go out.|What does each person want?|What can they do separately or together?|How would they discuss a fair weekend plan?|Which expectations need negotiation and which can remain individual preferences?|How can two individually reasonable preferences become incompatible without either person being unreasonable?
Dating|The changed plan|A date is moved to another day because one person has a family responsibility.|Why did the plan change?|What message can the person send?|How can they show interest while changing the plan?|How should an earlier commitment be balanced with a new responsibility?|What distinguishes a justified revision of an agreement from simply disregarding it?`);
const icons={Travel:['🚌','🎫','🗺️'],Food:['🍽️','☕','🧺'],Social:['👥','💬','🪑'],Home:['🏠','📚','💡'],Work:['📝','💬','🕒'],Funny:['🏆','🥄','😄'],Dating:['☕','🌷','💬']};
for(const [li,l]of B.levels.entries()){
 add('photo-talk',l,scenes.map(r=>({cat:r[0],title:r[1],desc:r[2],icons:icons[r[0]],questions:[r[3+li]]})));
 add('detective-alibi',l,scenes.map(r=>({cat:r[0],title:r[1],setup:r[2]+' '+(li<2?'Agree on the missing details. Then answer the same questions separately.':'Agree on a consistent account, then answer the interviewer separately. This is a memory-and-consistency game, not a crime puzzle.'),facts:li<2?['Choose one place together.','Choose one time together.','Say what each person does.']:['Agree on the place and order of events.','Agree who noticed the important detail.','Agree what happened immediately afterwards.']})));
 add('story-chain',l,scenes.slice(0,38).map(r=>[r[0],r[2],li<2?'Add one short sentence that continues the scene.':li===2?'Continue the scene with a clear beginning, change and ending.':li===3?'Continue the scene; explain a character\'s reason and one consequence.':'Continue the scene with a change of perspective; distinguish what a character knows from what they assume.']));
}
const triples=rows(`market,bag,apple
kitchen,radio,dance
park,bench,friend
school,book,rain
phone,message,smile
train,window,tree
garden,chair,cat
shop,hat,mirror
cake,candle,friend
library,pen,note
bus,ticket,coat
home,door,flowers
sea,boat,sun
table,cup,biscuit
room,lamp,book
dog,ball,park
breakfast,clock,bus
rain,coat,cafe
music,window,neighbour
bag,keys,door
school,photo,friend
garden,water,plant
shop,box,gift
town,map,river
bed,clock,morning
tea,chair,visitor
book,picture,memory
train,bag,sandwich
party,photo,laugh
kitchen,spoon,soup
park,ball,rain
phone,photo,cat
table,card,game
door,note,keys
bus,seat,friend
home,music,quiet
gift,card,smile
cake,recipe,surprise`);
for(const l of B.levels){
 const pool=B.games['one-minute-story'][l],seen=new Set(pool.map(x=>x.join('|')));for(const r of triples){const w=split(r[0]);if(!seen.has(w.join('|'))){pool.push(w);seen.add(w.join('|'));}}
}
const emoji=rows(`Food|🍞,🧀,🧺,🌳
Travel|🎫,🚌,🪟,🌳
Home|🏠,💡,📖,🌙
Social|👋,☕,💬,🙂
Funny|🥄,🏆,👏,😄
Travel|🗺️,🚶,🌉,📷
Food|🥣,🍞,👥,😊
Home|🐈,🪑,📚,😴
Work|📝,❓,💬,💡
Funny|🎂,🕯️,🌬️,😅
Travel|🌧️,🏛️,🎫,🙂
Food|🧑‍🍳,📖,🥚,🍳
Social|📱,💬,👋,☕
Home|🪴,💧,☀️,🌱
Work|📅,🕒,👥,✅
Funny|🧦,🛋️,🔎,🎉
Travel|🚆,🧳,🥪,🌄
Food|🍎,🧺,👥,🌳
Social|🎲,❓,💬,😄
Home|🚪,📝,🔑,🙂
Work|📚,🖊️,❓,💡
Funny|🧢,🪞,📷,😂
Travel|🛶,🌊,☀️,📷
Food|☕,🫖,👥,💬
Social|🎁,💌,😊,🙏
Home|📦,📚,🪑,🏠
Work|🧑‍🏫,📝,👥,👏
Funny|⏰,🛌,☀️,🏃
Travel|🏡,🗺️,🚶,🌳
Food|🥪,🐕,😲,😅
Social|🌷,🚶,☕,🙂
Home|🎵,📖,🎧,😊
Work|💻,🔇,💬,😅
Funny|🏆,🧽,🍽️,👏
Travel|📷,👥,🌄,🚶
Food|🥘,📋,❓,👍
Social|💬,🤔,🤝,😊
Home|🌧️,🪟,🫖,📚`);
for(const l of B.levels)add('emoji-story',l,emoji.map(([c,s])=>[c,split(s)]));

/* vocabulary-50-release */
const vocabExtras={
 A1:rows(`clock|time,hour,wall,morning
cup|drink,tea,coffee,handle
spoon|eat,soup,kitchen,metal
plate|food,table,eat,round
key|door,open,lock,pocket
jacket|wear,coat,cold,clothes
tree|green,leaves,park,tall
river|water,bridge,flow,bank
flower|plant,garden,beautiful,smell
baby|child,small,cry,family`),
 A2:rows(`backpack|bag,school,carry,shoulders
bakery|bread,cake,shop,buy
pharmacy|medicine,health,shop,chemist
platform|train,station,wait,number
timetable|times,schedule,bus,train
toothbrush|teeth,bathroom,clean,paste
blanket|bed,warm,sleep,cover
pillow|bed,head,sleep,soft
elevator|lift,building,up,floor
entrance|door,enter,building,inside`),
 B1:rows(`priority|important,first,order,focus
schedule|plan,time,calendar,appointment
responsibility|duty,job,task,accountable
recommendation|suggestion,advice,choose,review
complaint|problem,unhappy,customer,report
improvement|better,change,progress,develop
decision|choose,choice,make,option
support|help,assist,encourage,back
agreement|agree,deal,contract,understanding
progress|improve,forward,development,goal`),
 B2:rows(`workload|work,tasks,amount,busy
leadership|leader,manage,team,direct
collaboration|together,team,cooperate,project
strategy|plan,goal,approach,long-term
evaluation|assess,judge,measure,result
regulation|rule,law,control,official
diversity|different,people,variety,inclusion
equality|equal,fair,same,rights
implementation|practice,plan,apply,execute
stakeholder|affected,project,interest,organisation`),
 C1:rows(`externality|side effect,cost,third party,economics
deliberation|discussion,consider,decision,reasoning
causality|cause,effect,relationship,evidence
correlation|relationship,variables,association,statistics
counterfactual|alternative,hypothetical,past,if
asymmetry|unequal,difference,imbalance,sides
path dependence|history,choices,trajectory,lock-in
moral hazard|risk,incentive,insurance,behaviour
institutional inertia|organisation,change,resistance,habit
marginal benefit|additional,gain,extra,value`)
};
for(const [li,l] of B.levels.entries()){
 const n=Math.min(4,li+1);
 for(const [word,banned] of vocabExtras[l]){
  const forbidden=split(banned).slice(0,n).map(x=>x.toUpperCase());
  add('taboo',l,[['Vocabulary',word.toUpperCase(),forbidden]]);
  for(const game of ['who-am-i','explain-it-badly','three-clues'])add(game,l,[['Vocabulary',word]]);
 }
}

B.categorySets['story-chain']=[...new Set([...B.categorySets['story-chain'],'Food','Home','Work','Dating'])];
B.version='20261007-level50-2';
B.expandedSpeakingGames=Object.keys(B.games);
B.taskAdaptedGames=['story-chain','ranking-room','detective-alibi','one-minute-story','desert-island','emoji-story','sell-me-this','photo-talk'];
})();
