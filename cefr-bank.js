/* Explicit, reviewed vocabulary and scenario sets. Related games share suitable tasks,
   but no topic/template cross-products or artificial 1,000-item expansion are used. */
(function(){
'use strict';
const {levels,source,lines,rows}=window.ESCCefrSource;
const words={
A1:rows(`coffee|drink,cup,morning,hot
tea|drink,cup,hot,water
water|drink,glass,rain,clear
milk|drink,white,cow,bottle
bread|eat,sandwich,food,bakery
apple|fruit,red,tree,eat
banana|fruit,yellow,monkey,eat
pizza|food,cheese,round,Italian
egg|food,chicken,breakfast,shell
cat|animal,pet,meow,mouse
dog|animal,pet,bark,walk
bird|animal,fly,wings,sky
fish|animal,water,swim,sea
car|drive,road,wheels,travel
bus|travel,driver,people,stop
bike|ride,wheels,pedals,road
train|travel,station,ticket,rail
book|read,pages,story,library
pen|write,ink,paper,pencil
bag|carry,things,school,handle
phone|call,screen,message,mobile
chair|sit,legs,seat,table
table|eat,legs,desk,wood
bed|sleep,room,pillow,night
door|open,close,room,handle
window|glass,look,wall,open
house|home,live,rooms,building
school|learn,students,teacher,class
shop|buy,sell,money,store
park|trees,walk,grass,play
teacher|school,learn,class,students
doctor|hospital,help,sick,health
mother|family,parent,child,woman
friend|person,like,together,help
shoe|foot,wear,walk,pair
shirt|wear,clothes,buttons,top
hat|head,wear,clothes,cap
sun|sky,hot,day,light
rain|water,weather,cloud,wet
ball|round,play,sport,kick`),
A2:rows(`umbrella|rain,wet,carry,open
wallet|money,cards,pocket,bag
ticket|travel,paper,buy,train
passport|travel,country,identity,airport
suitcase|travel,clothes,bag,pack
airport|plane,flight,travel,terminal
hotel|room,sleep,holiday,stay
restaurant|food,eat,waiter,menu
waiter|restaurant,serve,food,table
menu|food,restaurant,choose,list
receipt|buy,paper,shop,payment
supermarket|food,shop,buy,trolley
library|books,read,quiet,borrow
museum|history,visit,old,exhibition
station|train,bus,ticket,platform
bridge|river,cross,road,over
kitchen|cook,food,room,oven
balcony|outside,flat,railing,view
fridge|cold,food,kitchen,milk
washing machine|clothes,clean,laundry,water
headphones|music,ears,listen,sound
charger|battery,phone,electricity,cable
calendar|date,month,day,year
alarm|wake,morning,clock,sound
mirror|look,face,reflection,glass
neighbour|next,house,live,street
colleague|work,office,job,person
mechanic|car,repair,engine,garage
driver|car,bus,road,wheel
cashier|shop,pay,money,till
appointment|time,doctor,meeting,book
invitation|party,come,ask,event
recipe|cook,food,instructions,ingredients
ingredient|food,cook,recipe,part
leftovers|food,remaining,meal,yesterday
picnic|outside,food,park,blanket
campsite|tent,holiday,outside,sleep
traffic|cars,road,busy,vehicles
queue|wait,line,people,turn
holiday|travel,rest,work,break`),
B1:rows(`deadline|finish,date,time,work
interview|job,questions,meeting,employer
promotion|job,higher,salary,position
teamwork|together,group,cooperate,project
feedback|comments,improve,opinion,work
routine|daily,habit,regular,schedule
habit|often,behaviour,repeat,routine
confidence|believe,ability,sure,self
patience|wait,calm,time,annoyed
promise|say,will,keep,commitment
advice|suggest,help,should,recommend
choice|choose,options,decision,select
mistake|wrong,error,accident,correct
solution|problem,answer,solve,fix
goal|aim,achieve,target,future
budget|money,spend,plan,cost
discount|price,cheap,sale,less
refund|money,return,pay,shop
warranty|repair,guarantee,product,period
subscription|pay,regular,service,monthly
delivery|bring,package,order,address
reservation|book,table,hotel,save
commute|work,travel,daily,journey
detour|route,road,longer,avoid
shortcut|route,quick,shorter,path
volunteer|help,free,work,community
neighbourhood|area,live,streets,local
recycling|waste,reuse,materials,bins
pollution|dirty,environment,air,waste
privacy|personal,secret,information,alone
rumour|story,unconfirmed,people,gossip
headline|news,title,newspaper,article
review|opinion,product,rating,write
reputation|known,opinion,people,image
opportunity|chance,possible,advantage,future
experience|event,learn,do,knowledge
achievement|success,goal,effort,complete
challenge|difficult,task,test,try
competition|win,contest,opponents,prize
compromise|agree,both,give,solution`),
B2:rows(`negotiation|agreement,discuss,deal,bargain
sustainability|future,environment,resources,long-term
transparency|open,information,clear,secret
assumption|believe,evidence,suppose,unproven
bias|unfair,preference,judgement,partial
evidence|proof,facts,support,claim
trade-off|balance,benefit,cost,choice
boundary|limit,personal,respect,line
consent|permission,agree,allow,choice
independence|alone,freedom,rely,self
adaptability|change,adjust,flexible,situation
resilience|recover,difficulty,strong,setback
incentive|reward,motivate,encourage,benefit
productivity|output,work,results,time
efficiency|resources,time,waste,results
inclusion|everyone,belong,participate,exclude
accessibility|use,barriers,access,everyone
credibility|trust,believable,reliable,source
reliability|depend,consistent,trust,perform
priority|important,first,order,focus
perspective|view,angle,opinion,understand
obligation|duty,must,responsibility,required
expectation|anticipate,believe,hope,future
consequence|result,effect,action,outcome
innovation|new,idea,improve,invent
automation|machine,automatic,work,human
flexibility|change,adapt,rigid,options
consistency|same,regular,stable,behaviour
uncertainty|unknown,doubt,sure,predict
criticism|judgement,fault,opinion,negative
constructive feedback|comments,improve,helpful,criticism
work-life balance|job,personal,time,rest
carbon footprint|emissions,environment,climate,impact
digital literacy|online,skills,technology,information
misinformation|false,information,share,incorrect
corporate responsibility|company,ethics,society,business
peer pressure|group,influence,friends,fit
consumer rights|buyer,protection,law,product
public interest|society,benefit,people,common
cultural awareness|differences,customs,understand,respect`),
C1:rows(`nuance|subtle,difference,meaning,detail
ambiguity|unclear,meaning,interpretation,doubt
proportionality|response,scale,appropriate,excessive
reciprocity|mutual,exchange,return,both
integrity|honesty,principles,consistent,ethics
impartiality|neutral,fair,bias,sides
legitimacy|accepted,authority,justified,valid
scrutiny|examine,careful,inspection,attention
rationalisation|justify,excuse,reason,decision
oversight|supervision,monitoring,review,control
plausibility|believable,possible,reasonable,explanation
coherence|logical,connected,consistent,clear
arbitrariness|random,reason,unfair,choice
discretion|judgement,choice,authority,decide
precedent|previous,example,decision,guide
inference|conclusion,evidence,deduce,reasoning
qualification|limit,statement,condition,reservation
concession|admit,point,argument,accept
counterargument|opposing,reason,respond,claim
framing|present,angle,interpretation,context
synthesis|combine,ideas,whole,integrate
accountability|answer,responsibility,explain,actions
contingency|possible,plan,unexpected,alternative
interdependence|mutual,rely,connected,relationship
equity|fairness,needs,justice,equality
autonomy|independence,choice,control,self
alignment|agree,consistent,goals,direction
robustness|strong,reliable,test,conditions
viability|workable,practical,survive,possible
opportunity cost|choice,alternative,forgo,value
reconciliation|resolve,difference,restore,agreement
unintended consequence|unexpected,result,action,effect
conflict of interest|personal,duty,benefit,impartial
confirmation bias|belief,evidence,selective,support
burden of proof|claim,evidence,responsibility,demonstrate
institutional memory|organisation,knowledge,past,experience
procedural fairness|process,justice,rules,impartial
diminishing returns|effort,benefit,less,increase
caveat|warning,condition,limitation,reservation
inconsistency|contradiction,different,conflict,pattern`)
};
const triples={
A1:rows(`cat|chair|milk
bus|bag|book
friend|park|ball
tea|cup|cake
dog|shoe|door
rain|car|house
school|pen|table
sun|hat|water
shop|apple|money
phone|bed|music
mother|kitchen|pizza
bird|window|bread`),
A2:rows(`ticket|station|late
umbrella|wind|cafe
birthday|cake|wrong address
hotel|key|surprise
recipe|salt|dinner
library|note|friend
suitcase|holiday|rain
alarm|Monday|bus
picnic|dog|sandwich
museum|photo|visitor
mirror|haircut|hat
wallet|shop|kind stranger`),
B1:rows(`deadline|message|solution
recipe|mistake|prize
journey|stranger|advice
delivery|fifty spoons|surprise
hobby|practice|confidence
meeting|cat filter|apology
promise|delay|friendship
picnic|storm|new plan
interview|wrong name|second chance
notebook|old goal|decision
competition|unexpected talent|celebration
phone|directions|wrong cafe`),
B2:rows(`feedback|disagreement|compromise
survey|dinner|impatience
privacy|convenience|choice
productivity app|notifications|irony
assumption|evidence|revision
holiday plan|committee|escape
inclusion|budget|creative solution
review|expectation|disappointment
boundary|friendship|respect
purchase|justification|regret
priority|deadline|negotiation
quiz|competition|peace offering`),
C1:rows(`uncertainty|recommendation|accountability
sandwich|complaint|proportionality
precedent|exception|fairness
picnic|procedure|bureaucracy
assumption|scrutiny|concession
toaster|rationalisation|regret
transparency|exclusion|legitimacy
alarm clock|apology|credibility
convenience|hidden cost|reconsideration
quiz rules|appeal|compromise
confidence|weak evidence|qualification
spontaneity|itinerary|contradiction`)
};
const ranking={
A1:rows(`Your breakfast|bread,eggs,fruit,yogurt,cereal
A happy cat|food,water,toy,bed,box
A day in the park|water,food,book,ball,hat
Funny birthday presents|big socks,tiny hat,banana toy,cat cup,yellow bag
Your new room|bed,chair,table,lamp,bookcase
A very long bus trip|music,book,food,water,pillow
A good evening|dinner,music,film,walk,book
Things in a giant pocket|phone,apple,pen,book,socks
A small party|food,music,friends,games,cake
A rainy Sunday|sleep,read,cook,draw,watch a film`),
A2:rows(`A good hotel|clean room,good breakfast,quiet nights,low price,friendly staff
The best small reward after housework|cake,nap,music,coffee,one TV episode
A weekend trip|train tickets,hotel,food budget,weather check,places to visit
A funny but useful gift|colourful socks,animal mug,giant notebook,funny umbrella,small desk fan
A new flat|location,rent,sunlight,space,transport
The worst things to forget on a rainy picnic|umbrella,food,plates,blanket,water
A useful English class|speaking,reading,listening,writing,new words
A very lazy holiday|sleep,short walks,good food,films,swimming
A good cafe|coffee,seats,music,price,location
The best reason to leave a boring party politely|early start,last bus,tiredness,another plan,work tomorrow`),
B1:rows(`Qualities of a good teammate|reliability,kindness,clear communication,creativity,patience
Small problems that annoy people most|lost keys,slow Wi-Fi,cold tea,long queues,noisy neighbours
Priorities for a first trip abroad|budget,safety,local food,language practice,free time
Unnecessary things people pack|extra shoes,too many books,large towel,formal clothes,five chargers
What makes a hobby worth keeping|enjoyment,progress,friends,low cost,relaxation
The most harmlessly dramatic group decision|pizza toppings,film choice,photo choice,restaurant choice,quiz team name
Ways to make a new member comfortable|introductions,clear rules,pair work,easy first question,patient listening
Small wins that deserve a celebration|finding lost keys,catching the bus,finishing laundry,remembering a password,cooking a good egg
Things to consider before accepting a job|salary,learning,commute,team,working hours
The least useful excuse for being late|my cat looked sad,I chose socks slowly,my tea was too hot,I forgot the day,I watched one more video`),
B2:rows(`Criteria for evaluating an online source|evidence,expertise,transparency,date,independent agreement
Signs a meeting should have been an email|no discussion,no decision,repeated updates,unclear purpose,mostly reading slides
Priorities in designing a public service|accessibility,reliability,cost,efficiency,privacy
What makes a review unhelpful|irrelevant complaint,unrealistic expectations,no product experience,unclear evidence,excessive exaggeration
What makes feedback constructive|specificity,timing,respect,actionable advice,opportunity to respond
Things a relaxed holiday does not need|minute-by-minute plan,performance targets,mandatory photos,daily review meeting,formal dress code
What a fair compromise should protect|basic needs,participation,clarity,proportional effort,long-term trust
The most over-researched everyday purchase|toaster,water bottle,pillow,notebook,socks
Priorities when improving a team process|clear roles,realistic workload,feedback,shared information,measurable outcomes
Useful awards for ordinary office life|shortest helpful meeting,clearest email,best quiet problem-solving,kindest explanation,fewest needless notifications`),
C1:rows(`Criteria for a defensible recommendation under uncertainty|quality of evidence,explicit assumptions,proportional risk,reversibility,affected perspectives
Signs a casual activity has acquired too much bureaucracy|approval chain,formal appeals,mandatory reports,unclear authority,procedures without purpose
What lends legitimacy to a decision|participation,transparency,consistent standards,accountability,attention to consequences
What weakens an elaborate defence of a trivial purchase|selective evidence,changing criteria,irrelevant expertise,exaggerated benefits,ignored alternatives
Priorities when reviewing a long-standing rule|original purpose,current effects,fairness,practicality,unintended costs
Everyday disputes most in need of proportionality|pizza toppings,playlist choices,quiz wording,parking etiquette,group-photo selection
Features of a credible public apology|specific accountability,recognition of harm,proportionate explanation,commitment to change,follow-through
What an overcomplicated productivity system forgets|actual output,rest,flexibility,maintenance cost,enjoyment
Considerations in balancing efficiency and equity|unequal starting points,total benefit,distribution of costs,feasible alternatives,long-term effects
Least convincing appeals to authority in daily life|a cousin said so,one viral video,my toaster review,an anonymous comment,everyone in my group chat`)
};
const scenarios={
A1:rows(`At the cafe|Two friends are at a cafe. There are three cups on the table.|Where are they?,How many cups are there?,What do they drink?|table,window,three cups
The small hat|A man is in a park. His hat is very small.|Where is he?,What colour is the hat?,Is the hat big or small?|park,small hat,bench
At the bus stop|A woman has a blue bag. A bus is near her.|Where is she?,What is in her bag?,Where does she want to go?|blue bag,bus,street
The dog and the shoe|A dog has a shoe. A woman is at the door.|What does the dog have?,Where is the woman?,Is she happy?|dog,shoe,door
In the kitchen|Two friends are in a kitchen. They have bread and cheese.|What food is there?,How many people are there?,What can they make?|bread,cheese,kitchen
The big cake|Three friends have a very big cake on a small table.|How many friends are there?,Is the cake big?,Who eats the cake?|three friends,big cake,small table
At the library|A student has two books and a red pen.|What does the student have?,What colour is the pen?,Where are the books?|student,two books,red pen
The cat's chair|A cat is on a chair. A man wants to sit down.|Where is the cat?,What does the man want?,What does he say?|cat,chair,man
A rainy day|Two people have one umbrella at a bus stop.|What is the weather like?,How many umbrellas are there?,Where can they go?|rain,umbrella,bus stop
The yellow bag|A woman opens a yellow bag. There are five bananas inside.|What colour is the bag?,What is in it?,How many bananas are there?|woman,yellow bag,five bananas`),
A2:rows(`A delayed train|Two friends are at the station. Their train is thirty minutes late.|What can they do while they wait?,Who should they call?,How do they feel?|station,tickets,thirty-minute delay
The wrong cafe|Two friends waited in different cafes on the same street.|How did this happen?,What message can they send?,Where can they meet now?|two cafes,same street,messages
A new neighbour|A neighbour arrived yesterday with many boxes and no table.|What help can you offer?,What should you ask first?,What can they do tonight?|boxes,new flat,no table
A noisy shoe|A person bought new shoes. One shoe makes a noise at every step.|What should they check?,Where did they buy the shoes?,What can they say in the shop?|new shoes,receipt,one noisy shoe
A missing library book|A student cannot find a borrowed book. They used it at a cafe yesterday.|Where should they look?,Who can they ask?,What should they tell the library?|library book,cafe,yesterday
The giant order|A cafe receives ten cakes, but the owner ordered only one.|Who should the owner call?,What should they check?,Where can they put the cakes?|ten cakes,order form,delivery
A changed picnic plan|Rain starts just before a group leaves for a picnic.|Where else can they meet?,What can they do with the food?,Who should send a message?|rain,picnic food,group message
The surprise photo|A woman finds a funny photo of her cat on every screen in the house.|Who may have changed the screens?,How can she change them back?,Does she want to keep one?|cat photo,laptop,television
A visitor in town|A visitor has two hours before their bus leaves.|Where can they go?,What can they eat?,How can they get back on time?|two hours,city map,bus station
The wrong birthday|A man arrives with a cake a week before his friend's birthday.|What should he say?,What can they do with the cake?,How can he remember the right date?|cake,calendar,one week early`),
B1:rows(`An unexpected free afternoon|A cancelled train gives a traveller four hours in an unfamiliar town.|What would be a sensible first step?,How could they use the time?,What should they check before leaving the station?|cancelled train,four hours,unfamiliar town
A mysterious delivery|A person receives fifty spoons instead of one. The label has their correct name.|What might have gone wrong?,What evidence should they check?,How would you explain the mistake to customer service?|fifty spoons,correct label,order confirmation
A quiet new member|A new club member listens carefully but has not spoken yet.|What might help them join in?,What should the host avoid assuming?,How could a partner activity help?|new member,group conversation,patient host
The wrong online name|A job applicant joins an interview using a funny nickname from a game.|What should they do first?,How could they apologise briefly?,Could humour help or make it worse?|interview,funny nickname,video call
A shared deadline|Two friends promised to prepare an event, but one is much busier this week.|How could they divide the work?,What should they say clearly?,What would be a fair backup plan?|event,shared task,busy week
An overpacked weekend|A traveller brings a huge suitcase for one night, but forgets their charger.|Why might they have packed so much?,What can they do now?,What would you pack differently?|huge suitcase,one night,no charger
An old goal|Someone finds a notebook with a language-learning goal from three years ago.|Why might the goal have stopped?,What is a realistic first step now?,How could a friend help?|notebook,old goal,new chance
A collapsed cake|A homemade cake falls apart on the way to a friend's dinner.|What could the cook do?,How could they explain it?,Would the appearance matter to you?|cake,journey,dinner invitation
A useful misunderstanding|Two classmates misunderstand a task but discover a better way to practise.|What might they have misunderstood?,How could they explain their new idea?,What should they keep from the original task?|class task,two classmates,new method
A very serious quiz|A friendly quiz stops because two players disagree about one answer.|How could the host decide fairly?,How could the group keep it friendly?,What rule would help next time?|quiz,disputed answer,host`),
B2:rows(`Convenience and privacy|An app saves users time but asks for more personal information than its main task needs.|What would you need to know before using it?,Which trade-off matters most?,How could the service reduce the concern?|time saving,extra data,unclear purpose
The picnic committee|A group creates a budget team, seating plan and review meeting for a casual picnic.|Which parts might be useful?,When does planning become a burden?,How would you simplify it without dismissing the organiser?|picnic,budget team,seating plan
Unequal contributions|A team finishes a project, but some members feel the workload was unfair.|What information is missing?,How could they discuss it constructively?,What would you change for the next project?|completed project,unequal workload,team discussion
The perfect schedule|A holiday itinerary includes so many activities that nobody has time to relax.|What competing preferences are involved?,Which activities would you remove?,How could the planner avoid taking criticism personally?|detailed itinerary,tired travellers,no breaks
An inaccessible event|A popular venue is convenient for most members but difficult for one member to access.|How should the group evaluate alternatives?,Who should be consulted?,What would a fair compromise protect?|popular venue,access barrier,group decision
A questionable review|A reviewer gives a product one star because it did not do something the seller never promised.|What makes the review misleading?,How should the seller respond?,What should future buyers check?|one-star review,advertised features,expectations
A rule with side effects|A new office rule reduces interruptions but makes new staff reluctant to ask questions.|How would you assess its overall effect?,What exception could help?,How should the change be communicated?|fewer interruptions,new staff,unasked questions
The expensive gadget|A friend lists many reasons to keep an appliance they have used only once.|Which reasons are convincing?,How can regret affect judgement?,What practical test would help them decide?|new appliance,one use,long explanation
A disputed recommendation|Two reliable sources recommend different options for a community project.|How could both sources be reasonable?,Which criteria would you compare?,What information would reduce uncertainty?|two sources,community project,different priorities
The meeting award|A team rewards the person who attends the most meetings, regardless of results.|What behaviour does this encourage?,What would be a better measure?,How would you propose a change tactfully?|award,meeting count,unclear results`),
C1:rows(`A transparent but disputed decision|A committee publishes its reasoning, but people affected by the decision say their priorities were excluded.|What does transparency resolve and what does it not?,What would lend the process legitimacy?,When would reopening the decision be proportionate?|published reasoning,excluded perspectives,disputed outcome
The constitutional picnic|A casual outing develops formal appeals, voting rules and an approval process for sandwiches.|Which underlying concerns might be legitimate?,Where does procedure become disproportionate?,How could the group preserve fairness without bureaucracy?|casual outing,formal appeals,sandwich approval
A qualified recommendation|An adviser recommends a reversible option while openly acknowledging gaps in the evidence.|Does qualification strengthen or weaken credibility here?,What assumptions should be explicit?,What would justify changing course?|reversible decision,evidence gaps,clear recommendation
The authoritative toaster review|A review makes sweeping claims about modern society based on one disappointing toaster.|Where does observation become overgeneralisation?,What rhetorical choices make it persuasive?,How could its useful point be stated proportionately?|one toaster,sweeping claims,confident tone
Hidden costs of efficiency|A service becomes faster for most users by transferring extra work to a smaller group.|How should success be measured?,Who should bear the additional cost?,What alternatives could improve both efficiency and equity?|faster service,transferred work,unequal burden
A productivity paradox|A person tracks every routine so carefully that maintaining the system takes more time than it saves.|Which assumptions support the system?,How could they test its real value?,What would a proportionate alternative look like?|detailed tracking,maintenance time,claimed efficiency
A contextual apology|An organisation explains why a mistake occurred but says little about responsibility or future changes.|When does explanation become evasion?,What would make the apology credible?,How should context be included without weakening accountability?|explanation,limited accountability,no clear commitment
The objective pizza debate|Friends describe their preferred toppings as objectively correct and challenge each other's judgement.|Which claims are factual and which express values or taste?,Why might the framing escalate disagreement?,How could humour restore perspective?|pizza preferences,claims of objectivity,escalating debate
A rule without its original problem|A respected procedure remains in place long after the situation it addressed has changed.|What evidence should a review consider?,Who might benefit from keeping it?,How should consistency be weighed against adaptation?|old procedure,changed conditions,unclear purpose
The quiz appeals board|A friendly quiz introduces formal hearings for disputed answers, extending a short event by an hour.|What kind of fairness is being pursued?,What are the unintended costs?,What simpler process would be defensible?|friendly quiz,formal hearings,one-hour delay`)
};
const packing={
A1:rows(`A short day at the park. Choose three things.|water,hat,ball,book,apple,blanket
A cat visits your home. Choose three things for it.|water,food,toy,small bed,box,brush
A day at school. Choose three things.|book,pen,water,notebook,bag,apple
A funny photo with friends. Choose three things.|big hat,yellow bag,red shirt,toy cat,ball,blue glasses
A picnic near your home. Choose three things.|bread,cheese,water,fruit,blanket,cups
A very rainy walk. Choose three things.|umbrella,coat,boots,hat,bag,water
A night at a friend's home. Choose three things.|shirt,toothbrush,phone,book,socks,small bag
A small birthday party. Choose three things.|cake,music,balloons,cups,game,food
A quiet evening at home. Choose three things.|book,tea,blanket,music,fruit,lamp
A long bus trip. Choose three things.|water,food,book,music,pillow,phone`),
A2:rows(`One afternoon at the beach near a cafe. Choose three items to carry.|water,sun cream,towel,book,hat,swimming clothes
A sleepover with friends. Choose three items.|toothbrush,pyjamas,board game,snacks,phone charger,book
A day trip to a new city. Choose three items.|map,water,phone charger,umbrella,guidebook,snacks
A rainy picnic moved into a friend's living room. Choose three items.|blanket,sandwiches,board game,music speaker,drinks,plates
An overnight train journey. Choose three items.|water,pillow,book,headphones,snacks,eye mask
A funny but useful gift box. Choose three items.|colourful socks,animal mug,small notebook,tea,funny pen,chocolate
A first cooking lesson. Choose three items.|recipe,apron,notebook,container,water bottle,kitchen towel
A weekend with no television. Choose three items.|board game,book,football,recipe cards,sketchbook,headphones
An outdoor concert near town. Choose three items.|water,light jacket,portable charger,small blanket,hat,snacks
A one-night trip with only a small bag. Choose three items.|clean shirt,toothbrush,phone charger,book,pyjamas,extra shoes`),
B1:rows(`You have a long train delay in a station with shops. Choose three things to buy.|water,sandwich,phone charger,magazine,notebook,small travel pillow
A weekend cabin trip with cooking facilities but no internet. Choose three extras.|board game,downloaded music,recipe book,walking map,novel,sketchbook
A new speaking club has a very small budget. Choose three useful supplies.|name labels,question cards,timer,whiteboard,pens,small speaker
A friend wants a relaxing birthday, not a large party. Choose three activities.|shared meal,board game,short walk,film,home-made cake,music session
You move into a furnished flat and can buy only three extras this week.|desk lamp,kettle,pan,clothes rack,toolkit,small shelf
Your group has an unplanned afternoon in a new town. Choose three activities.|walking tour,local cafe,museum,park,street market,photo walk
You are preparing a welcoming event for new members. Choose three priorities.|clear directions,pair activities,name tags,simple first questions,refreshments,feedback cards
Your luggage allowance is small for a relaxed weekend. Choose three non-essential extras.|novel,extra shoes,board game,camera,travel pillow,sketchbook
You want an enjoyable phone-free evening. Choose three options.|cooking,board game,walk,reading,painting,music practice
A picnic forecast says light rain is possible and shelter is nearby. Choose three extras.|waterproof blanket,umbrella,board game,thermos,spare bag,towel`),
B2:rows(`A community event budget covers only three improvements. Choose priorities.|accessible venue,clear signage,quiet space,refreshments,better sound,printed materials
A team wants fewer meetings without losing useful communication. Choose three practices.|written updates,clear agendas,decision records,office hours,shared task board,short check-ins
A group holiday has become exhausting. Keep only three daily commitments.|one shared meal,one main activity,free time,travel check-in,photo stop,evening review
An online service can improve only three features this quarter. Choose priorities.|accessibility,privacy controls,human support,speed,clear pricing,offline access
A new club wants genuine inclusion rather than a busy appearance. Choose three actions.|ask about barriers,offer varied formats,train hosts,reduce noise,advertise more,collect feedback
Your productivity routine takes too long to maintain. Keep only three tools.|weekly priorities,one calendar,short task list,habit tracker,time reports,colour-coded notes
A public workshop needs to build trust. Choose three commitments.|explain evidence,acknowledge uncertainty,invite questions,publish costs,offer examples,collect criticism
Friends want a relaxed picnic but propose six planning documents. Keep three useful items.|location details,food allergies list,weather backup,seating chart,photo plan,post-picnic survey
A small business wants to reduce unnecessary waste. Choose three changes.|repair equipment,reuse packaging,improve ordering,offer refills,track waste,redesign deliveries
A speaking group wants disagreement to remain constructive. Choose three habits.|ask for examples,summarise fairly,allow pauses,challenge assumptions,avoid interruptions,acknowledge good points`),
C1:rows(`A decision review has limited resources. Choose three forms of evidence to prioritise.|affected users' accounts,outcome data,original assumptions,independent evaluation,implementation costs,unintended effects
A casual club has accumulated excessive procedures. Preserve three safeguards.|clear responsibilities,basic consent,transparent costs,formal appeals,mandatory reports,attendance rankings
An uncertain recommendation needs three explicit qualifications. Choose the most useful.|evidence limits,key assumptions,reversal criteria,worst-case scenario,affected groups,alternative options
A detailed productivity system needs simplification. Keep three principles.|meaningful outcomes,low maintenance,adaptability,constant measurement,visual complexity,public progress reports
A public apology should commit to three concrete actions. Choose priorities.|identify responsibility,repair avoidable harm,change the process,explain context,publish a review,invite feedback
A group disputes the fairness of a quiz. Choose three proportionate safeguards.|clear rules,one neutral review,consistent scoring,formal hearings,written appeals,independent witnesses
A service faces tension between efficiency and equity. Examine three factors first.|distribution of benefits,distribution of costs,access barriers,average speed,implementation burden,reversibility
Friends disagree about a minor etiquette rule. Choose three useful discussion moves.|state the purpose,consider exceptions,compare actual effects,invoke tradition,take a formal vote,assign blame
A long-standing policy may have lost its purpose. Choose three review questions.|what problem remains,who bears the cost,what alternatives exist,who first proposed it,how familiar it feels,how complex it sounds
A persuasive claim rests on weak evidence. Choose three responsible responses.|qualify the claim,check assumptions,seek independent evidence,repeat confidently,appeal to popularity,change the subject`)
};
const selling={
A1:rows(`a blue pen|Say its colour and one use.
a very big hat|Say its colour and who can wear it.
a water bottle|Say what is inside and where you use it.
a cup with a cat picture|Say two things about the cup.
a small bag|Say what you can put in it.
a banana|Say its colour and when you eat it.
a chair|Say where it goes and who can use it.
a pair of yellow socks|Say two nice things about them.
a notebook|Say what you write in it.
a toy dog|Say its name and colour.`),
A2:rows(`a small umbrella|Sell it to a person who walks to work.
a giant mug|Explain why a tea lover might like it.
a lunch box|Describe two useful features for a student.
a funny alarm clock|Explain how it helps a sleepy friend.
a reusable shopping bag|Compare it with a small paper bag.
a pen with a very large top|Give one useful reason to choose it.
a phone charger|Sell it to someone going on a trip.
a colourful raincoat|Describe when it is useful, not only how it looks.
a travel pillow|Explain how to use it on a long bus trip.
a tiny notebook|Explain why smaller can be better.`),
B1:rows(`a reusable water bottle|Explain a real problem it solves and one benefit.
a slightly bent spoon|Be honest about its shape and suggest a reasonable use.
a desk lamp|Recommend it to someone studying in the evening.
a mug with an unfortunate slogan|Find a harmless audience who might enjoy it.
a simple calendar|Sell it to someone who forgets appointments.
a single bright sock|Suggest an honest use other than pretending it is a pair.
a basic toolkit|Explain why a beginner might want it.
a very ordinary cardboard box|Describe three genuinely useful things it can do.
a compact board game|Sell it to friends taking a train trip.
a notebook labelled "Great Ideas"|Sell it without promising that it creates ideas.`),
B2:rows(`a repairable desk lamp|Compare long-term value with a cheaper disposable model.
a very plain notebook|Argue for simplicity without pretending missing features are always advantages.
a privacy-focused calendar app|Acknowledge one inconvenience while explaining its benefit.
a deliberately ordinary coffee mug|Respond to a customer who expects every product to be innovative.
a quiet shared workspace|Explain who would benefit and who might not.
a sturdy but unattractive bag|Balance appearance, durability and practical use.
a refillable cleaning bottle|Use realistic claims and acknowledge that users must refill it.
a timer with only one button|Explain when fewer options are useful.
a small-group speaking session|Describe likely benefits without guaranteeing fluency.
a comfortable but unfashionable chair|Respond respectfully to a style-conscious customer.`),
C1:rows(`a transparent subscription service|Explain the value of clear pricing while acknowledging a genuine limitation.
a notebook without productivity slogans|Challenge the assumption that motivation must be built into a product.
an accessible event-planning service|Balance inclusion, cost and the limits of what can be promised.
a one-button kitchen timer|Distinguish purposeful simplicity from inadequate design.
a repair service|Make a qualified case for repair without claiming it is always the best option.
a deliberately unremarkable mug|Defend reliable usefulness against pressure to appear innovative.
a privacy-respecting booking tool|State the trade-off clearly and identify the users it suits.
a holiday planner that leaves free time|Sell restraint without presenting a lack of planning as universal wisdom.
a source-checking workshop|Explain what it improves without promising immunity to error.
a chair with no smart features|Question unnecessary complexity while acknowledging useful technology.`)
};
const emojiSequences=[['sun','walking','coffee'],['cat','box','surprise'],['bus','rain','home'],['cake','party','laughter'],['book','idea','pen'],['dog','shoe','running'],['train','map','camera'],['alarm','sleep','late'],['food','friends','music'],['phone','wrong message','apology'],['bag','ticket','journey'],['recipe','mistake','new idea']];
const emojiMap={sun:'\u2600\ufe0f',walking:'\ud83d\udeb6',coffee:'\u2615',cat:'\ud83d\udc31',box:'\ud83d\udce6',surprise:'\ud83d\ude32',bus:'\ud83d\ude8c',rain:'\ud83c\udf27\ufe0f',home:'\ud83c\udfe0',cake:'\ud83c\udf82',party:'\ud83c\udf89',laughter:'\ud83d\ude02',book:'\ud83d\udcd6',idea:'\ud83d\udca1',pen:'\u270f\ufe0f',dog:'\ud83d\udc36',shoe:'\ud83d\udc5f',running:'\ud83c\udfc3',train:'\ud83d\ude86',map:'\ud83d\uddfa\ufe0f',camera:'\ud83d\udcf7',alarm:'\u23f0',sleep:'\ud83d\ude34',late:'\ud83d\udca8',food:'\ud83c\udf7d\ufe0f',friends:'\ud83d\udc65',music:'\ud83c\udfb5',phone:'\ud83d\udcf1','wrong message':'\u2757',apology:'\ud83d\ude4f',bag:'\ud83c\udf92',ticket:'\ud83c\udf9f\ufe0f',journey:'\ud83d\udee3\ufe0f',recipe:'\ud83d\udcdd',mistake:'\ud83d\ude05','new idea':'\ud83d\udca1'};

/* restored-game-categories-20261007 */
const categorySets={
 "one-for-me-one-for-you":["Everyday","Fun","Personal","Deep","Spicy"],
 "last-thing-you-did":["Everyday","Funny","Personal","Spicy"],
 "what-would-you-do-if":["Everyday","Chaos","Social","Money","Deep","Spicy"],
 "would-you-rather":["Everyday","Funny","Deep","Impossible","Spicy"],
 "most-likely-to":["Funny","Chaos","Social","Future","Spicy"],
 "hot-seat":["Mixed","Funny","Personal","Spicy"],
 "five-second-challenge":["Easy","Funny","Hard","Spicy"],
 "red-flag-green-flag":["Dating","Friendship","Work","Personality","Everyday"],
 "debate-roulette":["Everyday","Fun","Social","Deep","Spicy"],
 "never-have-i-ever":["Funny","Travel","Work","Social","Spicy"],
 "two-truths-one-lie":["Daily Life","Travel","Childhood","Work & Study","Social","Fun","Future","Random"],
 "story-chain":["Everyday","Travel","Mystery","Funny","Future","Social","Adventure","Challenge"],
 "opinion-line":["Daily Life","Work","Social","Technology","Deep","Relationships"],
 "question-roulette":["Everyday","Fun","Social","Deep","Spicy"],
 "finish-the-sentence":["Easy","Personal","Social","Future","Opinion","Fun"],
 "would-i-lie-to-you":["Travel","Childhood","Work & Study","Social","Food","Funny","Personal","Spicy"],
 "worst-advice-only":["Daily Life","Work","Study","Social","Travel","Money","Relationships"],
 "hot-take":["Everyday","Food","Work","Travel","Social","Technology","Relationships","Deep"]
};
const includesAny=(t,words)=>words.some(w=>t.includes(w));
function categoryFor(game,text,i=0){
 const t=String(text||"").toLowerCase();
 const sets=categorySets[game];
 if(!sets)return i%2?"Light-hearted":"Everyday";
 const has=(...w)=>includesAny(t,w);
 const relationship=()=>has("date","dating","partner","relationship","crush","romantic","chemistry","jealous","ex ","ex-","love","flirt","first move","couple");
 const money=()=>has("money","salary","budget","bank","pay","price","cost","cheap","expensive","buy","bought","purchase","spend","save","refund","business");
 const work=()=>has("work","job","office","manager","colleague","team","meeting","deadline","career","salary","promotion","employee","employer","project");
 const travel=()=>has("travel","trip","holiday","hotel","train","bus","flight","airport","station","journey","city","town","abroad","camp","museum","map");
 const tech=()=>has("phone","app","online","internet","technology","digital","ai ","social media","data","privacy","screen","message","email","notification");
 const social=()=>has("friend","group","people","person","someone","conversation","talk","neighbour","visitor","member","teammate","colleague","community");
 const fun=()=>has("funny","cat","dog","cake","pizza","hat","dance","sing","banana","robot","zombie","alien","karaoke","sock","meme","movie","film","song","party");
 const deep=()=>has("success","failure","value","principle","meaning","fair","future","fear","regret","life","decision","assumption","evidence","uncertainty","autonomy","accountability","trade-off","boundary","confidence");
 switch(game){
  case "what-would-you-do-if":
   if(relationship())return "Spicy"; if(money())return "Money"; if(has("alien","zombie","invisible","cat suddenly","dog","robot","secret door","future self","reality show","one percent","wrong date","two plans"))return "Chaos"; if(deep())return "Deep"; if(social())return "Social"; return "Everyday";
  case "last-thing-you-did":
   if(relationship())return "Spicy"; if(has("mistake","wrong","laugh","forgot","inside out","dropped","lost"))return "Funny"; if(deep()||has("goal","learn","opinion","habit"))return "Personal"; return "Everyday";
  case "would-you-rather":
   if(relationship())return "Spicy"; if(deep())return "Deep"; if(has("robot","pet","cat","dog","giant","tiny","famous","future self","invisible","fly"))return "Impossible"; if(fun())return "Funny"; return "Everyday";
  case "most-likely-to":
   if(relationship())return "Spicy"; if(has("future","career","job","goal","learn","plan"))return "Future"; if(has("forget","wrong","alarm","overpack","board game","spreadsheet","dramatic","cat","dog"))return "Chaos"; if(social())return "Social"; return "Funny";
  case "hot-seat":
   if(relationship())return "Spicy"; if(deep()||has("habit","goal","learn","feel","proud","decision"))return "Personal"; if(fun()||has("mistake","wrong","weird"))return "Funny"; return "Mixed";
  case "five-second-challenge":
   if(relationship())return "Spicy"; if(has("assumption","evidence","trade-off","boundary","feedback","decision","reasons","qualities","ways to"))return "Hard"; if(fun())return "Funny"; return "Easy";
  case "red-flag-green-flag":
   if(work())return "Work"; if(relationship())return "Dating"; if(has("friend","friendship"))return "Friendship"; if(has("habit","always","never","person","someone"))return "Personality"; return "Everyday";
  case "debate-roulette":
   if(relationship())return "Spicy"; if(deep())return "Deep"; if(social())return "Social"; if(fun())return "Fun"; return "Everyday";
  case "never-have-i-ever":
   if(relationship())return "Spicy"; if(work())return "Work"; if(travel())return "Travel"; if(social()||tech())return "Social"; return "Funny";
  case "opinion-line":
   if(relationship())return "Relationships"; if(tech())return "Technology"; if(work())return "Work"; if(deep())return "Deep"; if(social())return "Social"; return "Daily Life";
  case "hot-take":
   if(relationship())return "Relationships"; if(has("food","pizza","coffee","tea","restaurant","breakfast","dessert","cafe"))return "Food"; if(work())return "Work"; if(travel())return "Travel"; if(tech())return "Technology"; if(deep())return "Deep"; if(social())return "Social"; return "Everyday";
  case "finish-the-sentence":
   if(has("next year","five years","future","want to","hope","project"))return "Future"; if(social())return "Social"; if(deep()||has("feel","habit","confident","proud","learn"))return "Personal"; if(has("technology","successful","city","money","free time","social media"))return "Opinion"; if(fun())return "Fun"; return "Easy";
  case "question-roulette":
   if(relationship())return "Spicy"; if(deep())return "Deep"; if(social())return "Social"; if(fun()||has("trend","fictional","animal"))return "Fun"; return "Everyday";
  case "worst-advice-only":
   if(relationship())return "Relationships"; if(money())return "Money"; if(work())return "Work"; if(has("study","school","class","learn","exam","course"))return "Study"; if(travel())return "Travel"; if(social())return "Social"; return "Daily Life";
  case "two-truths-one-lie":
   if(travel())return "Travel"; if(has("child","school","young","family"))return "Childhood"; if(work()||has("study","course","class"))return "Work & Study"; if(social())return "Social"; if(has("future","next year","goal","want to"))return "Future"; if(fun())return "Fun"; if(deep())return "Random"; return "Daily Life";
  case "story-chain":
   if(travel())return "Travel"; if(has("myster","secret","note","missing","door"))return "Mystery"; if(has("future","tomorrow","year later"))return "Future"; if(social())return "Social"; if(has("challenge","problem","deadline"))return "Challenge"; if(fun())return "Funny"; if(has("adventure","mountain","forest","island"))return "Adventure"; return "Everyday";
  case "would-i-lie-to-you":
   if(relationship())return "Spicy"; if(travel())return "Travel"; if(has("child","school","young","family"))return "Childhood"; if(work()||has("study","class","course"))return "Work & Study"; if(has("food","cook","meal","restaurant","cake","pizza"))return "Food"; if(deep()||has("boundary","decision","opinion"))return "Personal"; if(social())return "Social"; return "Funny";
  case "one-for-me-one-for-you":
   if(relationship())return "Spicy"; if(deep())return "Deep"; if(has("feel","habit","goal","learn","decision","proud"))return "Personal"; if(fun())return "Fun"; return "Everyday";
  default:return sets[0];
 }
}
const taggedFor=(game,a)=>a.map((text,i)=>[categoryFor(game,text,i),text]);

const games={};
const types={
 'truth-or-dare':'truth','one-for-me-one-for-you':'paired','last-thing-you-did':'past','what-would-you-do-if':'problem','would-you-rather':'choice','most-likely-to':'social','hot-seat':'open','five-second-challenge':'challenge','red-flag-green-flag':'flag','taboo':'taboo','debate-roulette':'motion','never-have-i-ever':'experience','two-truths-one-lie':'twoTruths','who-am-i':'word','story-chain':'story','explain-it-badly':'word','opinion-line':'motion','ranking-room':'ranking','question-roulette':'open','detective-alibi':'detective','finish-the-sentence':'finish','three-clues':'word','secret-mission':'mission','one-minute-story':'triples','would-i-lie-to-you':'personal','desert-island':'packing','conversation-bingo':'bingo','emoji-story':'emoji','worst-advice-only':'problem','sell-me-this':'sell','hot-take':'motion','photo-talk':'photo'};
const label=i=>i%2?'Light-hearted':'Everyday';
const tagged=a=>a.map((text,i)=>[label(i),text]);
const split=s=>s.split(',').map(x=>x.trim());
const follow={A1:'Use one short sentence. You can say: "I ..."',A2:'Add a simple detail: where, when or who.',B1:'Explain what happened and why. Give an example.',B2:'Compare two reasonable views and explain your choice.',C1:'Qualify your view, consider an exception and respond to another perspective.'};
for(const [slug,type] of Object.entries(types)){
 games[slug]={};
 for(const [li,level] of levels.entries()){
  const s=source[level];let out;
  switch(type){
   case 'truth':out={truths:s.open.map(x=>x[0]),dares:s.dare.slice()};break;
   case 'paired':out=s.open.map((x,i)=>({id:'cefr-'+level+'-'+(i+1),q:x[0],f:x[1],category:categoryFor(slug,x[0],i),level}));break;
   case 'open':out=taggedFor(slug,s.open.map(x=>x[0]));break;
   case 'past':out=s.past.map((q,i)=>({c:categoryFor(slug,q,i),q}));break;
   case 'problem':out=slug==='what-would-you-do-if'?s.problem.map((q,i)=>({c:categoryFor(slug,q,i),q})):taggedFor(slug,s.problem);break;
   case 'choice':out=s.choice.map((x,i)=>[categoryFor(slug,x.join(' '),i),...x]);break;
   case 'social':out=taggedFor(slug,s.social.map(x=>(level==='A1'?'Who in the group ':'Who is most likely to ')+(level==='A1'?x:x.replace(/^(\w+?)s\b/,'$1').replace(/^get /,'get '))+'?'));break;
   case 'challenge':out=taggedFor(slug,s.challenge.map(x=>'Name three '+x+'.'));break;
   case 'flag':out=taggedFor(slug,s.flag);break;
   case 'motion':out=taggedFor(slug,s.motion);break;
   case 'experience':out=taggedFor(slug,s.experience);break;
   case 'taboo':out=words[level].map((x,i)=>['Vocabulary',x[0].toUpperCase(),split(x[1]).slice(0,Math.min(4,li+1)).map(w=>w.toUpperCase())]);break;
   case 'word':out=words[level].map(x=>['Vocabulary',x[0]]);break;
   case 'twoTruths':out=s.personal.map((x,i)=>[categoryFor(slug,x,i),'Talk about '+x+'.',level==='A1'?'Say three short sentences: two true, one not true.':follow[level]]);break;
   case 'story':out=taggedFor(slug,s.story);break;
   case 'personal':out=taggedFor(slug,s.personal.map(x=>(level==='A1'?'Say three short sentences about ':'Tell a true or invented story about ')+x+'.'));break;
   case 'finish':out=taggedFor(slug,s.finish);break;
   case 'mission':out=s.mission.slice();break;
   case 'bingo':out=s.bingo.slice();break;
   case 'triples':out=triples[level];break;
   case 'ranking':out=ranking[level].map((x,i)=>({cat:label(i),title:x[0],items:split(x[1])}));break;
   case 'packing':out=packing[level].map((x,i)=>({cat:label(i),title:x[0],items:split(x[1])}));break;
   case 'sell':out=selling[level].map(x=>({item:x[0],twist:x[1]}));break;
   case 'photo':out=scenarios[level].map((x,i)=>({cat:label(i),title:x[0],desc:x[1],icons:['\ud83d\udcac','\ud83d\udd0e','\ud83d\udca1'],questions:split(x[2])}));break;
   case 'detective':out=scenarios[level].map((x,i)=>({cat:label(i),title:x[0],setup:x[1]+(level==='A1'?' Talk together. Choose the same answers. Then one person asks each of you questions.':level==='A2'?' Talk together about the details. Then one person asks each of you questions. Are your answers the same?':' This is a consistency game, not a crime puzzle. Agree on the missing details; the detective asks each player separately.'),facts:(level==='A1'?['Use the place on this card.','Choose one time together.','Say what each person does.']:level==='A2'?['Agree where everyone was.','Agree what time it happened.','Agree what each person did.']:['Agree on the order of events.','Agree on who saw or did each important thing.','Agree on one detail the detective can check.'])}));break;
   case 'emoji':out=emojiSequences.map((x,i)=>[label(i),x.map(v=>emojiMap[v])]);break;
  }
  games[slug][level]=out;
 }
}
// Social prompts use explicit base verbs instead of a morphological guess.
const socialVerbs={plans:'plan',helps:'help',remembers:'remember',tries:'try',brings:'bring',finds:'find',organises:'organise',makes:'make',keeps:'keep',gets:'get',buys:'buy',takes:'take',packs:'pack',laughs:'laugh',sets:'set',turns:'turn',starts:'start',forgets:'forget',builds:'build',questions:'question',becomes:'become',has:'have',protects:'protect',writes:'write',notices:'notice',researches:'research',checks:'check',distinguishes:'distinguish',changes:'change',requests:'request',communicates:'communicate',creates:'create',spots:'spot',asks:'ask',presents:'present',explains:'explain'};
for(const level of levels.slice(1)) games['most-likely-to'][level]=taggedFor('most-likely-to',source[level].social.map(s=>{const m=s.match(/^(\S+) (.*)$/);return 'Who is most likely to '+(socialVerbs[m[1]]||m[1])+' '+m[2]+'?'}));
// A1 recency prompts need only familiar words and a short answer, not a past-tense story.
games['last-thing-you-did'].A1=taggedFor('last-thing-you-did',lines(`Your last drink: tea, coffee or water?
Your last meal: what food?
Your last photo: a person, a place or food?
Your last shop visit: what shop?
Your last bus or car trip: where?
Your last song today: what song?
Your last book: what is its name?
Your last phone call: family or a friend?
Your last walk: where?
Your last TV show: what show?
Your last class: what subject?
Your last snack: sweet or salty?`)).map(x=>({c:x[0],q:x[1]}));
window.ESCCefrBank={version:'20261007-2',levels,games,types,follow,categorySets,categoryFor,sourceUrl:'https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale/'};
})();
