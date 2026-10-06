(() => {
'use strict';
const cfg=window.ESC_NEW_GAME||{};

function ensureExpandedContent(){
 const MIN=1000;
 const cats=['Everyday','Social','Travel','Work','Food','Fun','Personal','Deep','Technology','Spicy'];
 const topics=[
  'daily routines','free time','sleep','exercise','money','shopping','cooking','travel','public transport','friendship',
  'family','work','career plans','education','English learning','technology','social media','music','movies','sports',
  'health','stress','confidence','patience','honesty','trust','teamwork','communication','motivation','habits',
  'decision making','time management','creativity','goals','memories','the future','weekends','holidays','restaurants','cafés',
  'city life','remote work','meetings','job interviews','relationships','first impressions','personal space','good manners','online communication','phone use',
  'news','weather','fashion','books','gaming','photography','learning new skills','saving money','healthy food','home life',
  'neighbours','commuting','customer service','leadership','feedback','problem solving','risk taking','success','failure','change',
  'comfort zones','planning','productivity','public speaking','listening','language mistakes','culture','food habits','work-life balance','travel planning',
  'online meetings','group projects','housework','morning energy','evening habits','weekend plans','local places','environment','public spaces','personal goals',
  'learning from mistakes','trying new things','asking for help','giving advice','making friends','staying organised','healthy boundaries','digital habits','small talk','making choices'
 ];
 const baseTargets=[
  'phone','wallet','umbrella','elevator','mirror','password','traffic','alarm','battery','neighbour','toothbrush','fridge','microwave','balcony','receipt','queue','headphones','keys','doorbell','vacuum cleaner',
  'laundry','supermarket','pharmacy','suitcase','passport','airport','boarding pass','hotel','hostel','beach','map','tourist','ticket','platform','taxi','train','bus','bicycle','backpack','guidebook',
  'delay','coffee','pizza','chocolate','burger','salad','breakfast','spicy food','recipe','dessert','restaurant','takeaway','leftovers','ingredient','reservation','waiter','menu','soup','popcorn','lemon','avocado',
  'meeting','deadline','boss','email','salary','interview','promotion','colleague','presentation','remote work','feedback','teamwork','overtime','training','office','printer','spreadsheet','calendar','microphone','podcast',
  'concert','karaoke','meme','gaming console','cinema','playlist','selfie','trailer','subtitle','audience','episode','board game','camera','book','newspaper','guitar','piano','football','basketball','tennis','gym',
  'doctor','nurse','teacher','engineer','designer','chef','driver','pilot','lawyer','manager','student','cashier','photographer','musician','actor','writer','dentist','mechanic','farmer','programmer','firefighter',
  'police officer','architect','scientist','receptionist','accountant','translator','barber','baker','coach','journalist','electrician','plumber','artist','shopkeeper','delivery driver','language teacher','tour guide','barista','pharmacist',
  'librarian','entrepreneur','best friend','roommate','cousin','partner','teammate','stranger','customer','client','visitor','passenger','city centre','bus stop','train station','shopping mall','coffee shop','park','library',
  'hospital','school','university','airport gate','hotel lobby','restaurant table','kitchen','bedroom','living room','bathroom','garden','mountain','village','museum','stadium','market','bank','post office','classroom','meeting room',
  'parking lot','traffic light','bridge','tunnel','city square','metro station','rain','snow','sunshine','wind','storm','birthday','wedding','exam','trip','vacation','commute','morning routine','evening routine','lunch break',
  'video call','group chat','online class','delivery order','shopping list','coffee break','weekend plan','flight delay','train journey','road trip','job offer','team project','workshop','language course','fitness class','doctor appointment','family dinner',
  'house party','first date','museum visit','concert ticket','movie night','football match','book club','picnic','camping trip','hotel booking','restaurant booking','online order','lost luggage','phone charger','power bank','water bottle','notebook',
  'office chair','coffee machine','washing machine','dishwasher','remote control','shopping cart','credit card','cash machine','street market','city map','travel insurance','seat belt','traffic jam','weather forecast','alarm clock','birthday cake','wedding invitation',
  'job application','school project','presentation slide','voice message','email attachment','video game','fitness tracker','smart watch'
 ];
 const extraTargets=[
  'air conditioner','electric fan','space heater','hair dryer','electric toothbrush','coffee grinder','rice cooker','pressure cooker','slow cooker','air fryer','food processor','electric kettle','toaster','blender','vacuum robot','iron','ironing board','clothes hanger','laundry basket',
  'dish rack','cutting board','frying pan','saucepan','baking tray','oven glove','measuring cup','kitchen scale','water filter','ice tray','lunch box','thermos','travel mug','reusable bottle','paper towel','shopping bag','storage box','toolbox','flashlight','extension cable',
  'USB cable','wireless charger','computer mouse','keyboard','webcam','monitor','laptop stand','desk lamp','office desk','filing cabinet','name badge','business card','sticky note','paper clip','stapler','scanner','photocopier','projector','whiteboard','flip chart',
  'conference badge','meeting agenda','meeting notes','action list','sales report','monthly report','budget plan','marketing plan','training session','performance review','job description','work schedule','annual leave','sick leave','expense report','customer complaint','support ticket','sales call','client meeting','team lunch',
  'airport lounge','airport shuttle','baggage claim','security check','passport control','departure board','arrival hall','window seat','aisle seat','seat belt','life jacket','travel adapter','luggage tag','carry-on bag','check-in desk','hotel reception','room key','hotel breakfast','city tour','guided tour',
  'walking tour','travel brochure','tourist information','currency exchange','train ticket','bus ticket','metro card','taxi rank','rental car','fuel station','road sign','motorway','pedestrian crossing','bike lane','ferry terminal','cruise ship','campsite','hiking trail','viewpoint','souvenir shop',
  'sandwich','cheeseburger','vegetable soup','tomato soup','chicken soup','fruit salad','green salad','pasta salad','grilled chicken','fried chicken','roast chicken','baked potato','mashed potato','french fries','scrambled eggs','fried eggs','boiled eggs','pancakes','waffles','toast',
  'cheesecake','apple pie','chocolate cake','ice cream','yogurt','cereal','oatmeal','rice','noodles','pasta','spaghetti','steak','fish and chips','sushi','kebab','wrap','taco','burrito','curry','sandwich shop',
  'coffee beans','espresso','cappuccino','latte','tea bag','green tea','black tea','orange juice','lemonade','mineral water','soft drink','milkshake','smoothie','hot chocolate','restaurant bill','service charge','tip jar','table reservation','food delivery','grocery store',
  'flight attendant','airport security officer','gate agent','baggage handler','train conductor','bus driver','taxi driver','tour guide','hotel receptionist','hotel manager','housekeeper','restaurant manager','head chef','kitchen assistant','waiter','waitress','bartender','delivery rider','shop assistant','store manager',
  'primary school teacher','high school teacher','university lecturer','private tutor','English teacher','math teacher','football coach','fitness trainer','personal trainer','yoga instructor','swimming instructor','driving instructor','career coach','team leader','project manager','sales manager','marketing manager','HR specialist','customer support agent','recruiter',
  'software developer','web designer','graphic designer','product designer','civil engineer','electrical engineer','mechanical engineer','data analyst','data scientist','lab technician','research assistant','medical doctor','family doctor','surgeon','dentist','pharmacist','physiotherapist','veterinarian','paramedic','caregiver',
  'wedding photographer','sports photographer','news reporter','radio host','TV presenter','content creator','video editor','film director','camera operator','sound engineer','DJ','singer','guitarist','pianist','drummer','actor','comedian','novelist','poet','illustrator',
  'bakery','butcher shop','bookstore','clothing store','shoe store','electronics store','furniture store','toy store','sports shop','department store','shopping centre','street café','rooftop café','fast-food restaurant','family restaurant','hotel restaurant','school cafeteria','food court','farmers market','night market',
  'public library','university library','art museum','history museum','science museum','city park','playground','sports centre','football stadium','basketball court','tennis court','swimming pool','fitness centre','community centre','concert hall','theatre','cinema hall','art gallery','exhibition centre','conference centre',
  'police station','fire station','health centre','dental clinic','pharmacy counter','bank branch','cash machine','post office','courier office','car park','car wash','repair shop','petrol station','bus terminal','train platform','metro entrance','airport terminal','hotel room','hostel room','holiday apartment',
  'smartphone','tablet','laptop','desktop computer','smart speaker','Bluetooth speaker','wireless headphones','earbuds','smart television','remote control','games console','game controller','digital camera','action camera','drone','smart watch','fitness watch','e-book reader','portable charger','memory card',
  'video conference','online meeting','online course','language app','messaging app','social media account','email inbox','calendar reminder','online shopping cart','delivery tracking','QR code','Wi-Fi password','mobile data','screen time','voice assistant','cloud storage','online banking','digital payment','password manager','two-factor authentication',
  'morning commute','rush hour','lunch break','coffee break','weekend trip','business trip','family holiday','city break','beach holiday','camping holiday','road trip','train journey','long flight','short flight','delayed flight','missed bus','lost wallet','lost phone','lost key','flat tyre',
  'birthday party','graduation party','wedding party','office party','housewarming party','surprise party','family dinner','team dinner','picnic','barbecue','movie night','game night','karaoke night','concert night','book club meeting','study group','team meeting','staff meeting','parent meeting','job interview',
  'first day at work','first day at school','first date','blind date','doctor visit','dentist appointment','haircut appointment','bank appointment','visa appointment','passport application','job application','university application','course registration','hotel check-in','hotel check-out','airport check-in','restaurant reservation','online order','product return','customer refund',
  'sunrise','sunset','rainbow','thunderstorm','snowstorm','fog','heatwave','cold wave','forest','river','lake','waterfall','island','desert','beach','cliff','cave','valley','hill','mountain peak',
  'cat','dog','rabbit','hamster','parrot','goldfish','horse','cow','sheep','goat','chicken','duck','eagle','owl','pigeon','seagull','dolphin','whale','shark','octopus',
  'lion','tiger','elephant','giraffe','zebra','monkey','bear','wolf','fox','deer','snake','turtle','frog','bee','butterfly','ant','spider','penguin','camel','kangaroo',
  'honesty','confidence','patience','curiosity','creativity','motivation','discipline','teamwork','leadership','friendship','trust','respect','kindness','empathy','independence','responsibility','success','failure','risk','change',
  'time management','work-life balance','customer service','public speaking','active listening','problem solving','decision making','critical thinking','healthy habits','sleep quality','personal space','first impression','body language','small talk','online privacy','digital safety','climate change','recycling','public transport','city traffic',
  'morning person','night owl','early bird','coffee lover','book lover','movie fan','football fan','music fan','dog owner','cat owner','frequent traveller','remote worker','university student','new employee','team captain','party host','wedding guest','tourist','commuter','volunteer',
  'birthday gift','wedding gift','gift card','shopping voucher','concert poster','movie poster','restaurant menu','coffee menu','train timetable','bus timetable','flight schedule','weather app','city guide','travel blog','recipe book','cookbook','school textbook','workbook','dictionary','notepad',
  'door key','car key','house key','hotel key card','bank card','identity card','student card','membership card','boarding pass','parking ticket','speed ticket','shopping receipt','restaurant receipt','invoice','contract','certificate','diploma','passport photo','profile picture','selfie stick',
  'raincoat','winter coat','leather jacket','hoodie','sweater','T-shirt','jeans','shorts','dress','suit','tie','scarf','gloves','hat','baseball cap','sunglasses','running shoes','boots','slippers','backpack',
  'football boots','tennis racket','basketball hoop','football goal','gym bag','yoga mat','dumbbell','treadmill','exercise bike','swimming goggles','swimming cap','helmet','bicycle lock','skateboard','roller skates','camping tent','sleeping bag','hiking boots','walking stick','sports bottle',
  'birthday card','wedding invitation','thank-you note','apology message','voice note','text message','group message','email subject','email signature','video message','phone call','missed call','conference call','online chat','customer review','product rating','social media post','photo caption','news headline','weather alert'
 ];
 const moreTargets=["desk calendar","wall clock","bedside table","coffee table","dining table","bookshelf","shoe rack","coat rack","floor lamp","ceiling light","curtain","window blind","door handle","door mat","bath towel","hand towel","soap dispenser","shampoo bottle","laundry detergent","washing powder","recycling bin","rubbish bin","kitchen sink","bathroom sink","shower curtain","bath mat","pillow case","bed sheet","duvet","blanket","mattress","alarm app","grocery list","meal plan","weekly planner","appointment reminder","parking meter","bus card","library card","loyalty card","travel pillow","neck pillow","eye mask","ear plugs","hand luggage","checked luggage","baggage trolley","airport café","airport hotel","hotel lift","hotel corridor","hotel pool","hotel gym","hotel breakfast buffet","tour bus","city bus","night bus","express train","local train","high-speed train","tram","metro train","ferry boat","boat tour","walking route","bike tour","cycle path","hiking route","mountain cabin","beach umbrella","sun cream","swimming costume","beach bag","travel wallet","passport holder","travel document","booking confirmation","flight confirmation","train reservation","seat reservation","coffee cup","paper cup","glass bottle","plastic bottle","water glass","wine glass","tea cup","coffee spoon","dessert spoon","bread knife","chef knife","kitchen towel","napkin","table cloth","salt shaker","pepper shaker","sugar bowl","jam jar","honey jar","olive oil","tomato sauce","salad dressing","sandwich bread","whole wheat bread","white bread","cheese sandwich","chicken wrap","vegetable wrap","fruit juice","apple juice","iced coffee","iced tea","herbal tea","bottled water","sparkling water","fruit bowl","snack bar","chocolate bar","birthday candle","cake slice","office kitchen","break room","reception desk","help desk","customer desk","sales desk","training room","conference call","video interview","job fair","career fair","team workshop","brainstorming session","project deadline","weekly meeting","monthly meeting","annual meeting","progress report","sales target","customer feedback","online form","registration form","application form","survey form","feedback form","presentation screen","presentation remote","conference microphone","office phone","work laptop","company car","staff badge","visitor badge","security badge","name tag","uniform","work boots","safety helmet","protective gloves","first-aid box","language exchange","speaking club","conversation class","grammar lesson","vocabulary lesson","listening exercise","reading exercise","writing task","speaking task","group activity","pair work","role play","discussion question","icebreaker","warm-up activity","homework task","quiz question","exam question","study plan","learning goal"];
 const targets=[...new Set([...baseTargets,...extraTargets,...moreTargets])];
 const places=['a café','an airport','a train station','a hotel','an office','a classroom','a supermarket','a restaurant','a park','a museum','a hospital','a library','a shopping mall','a bus stop','a beach','a mountain village','a city centre','a gym','a cinema','a meeting room','a hotel lobby','a university campus','a busy street','a quiet neighbourhood','a sports centre','a bank','a pharmacy','a bookstore','a market','a concert hall'];
 const emojis=['☕','📱','🌧️','🚕','✈️','🧳','😱','😂','🎉','🍕','🏠','🚪','🔑','💼','📧','⏰','💸','❤️','🤔','🎵','🎬','⚽','🚲','🌙','☀️','🔥','🎁','🚌','🚆','📚','💻','🗺️'];
 const survival=['Fresh water filter','Knife','Tent','Fishing line','Solar charger','First-aid kit','Mirror','Blanket','Rope','Flashlight','Compass','Cooking pot','Rain jacket','Water bottle','Radio','Map','Multi-tool','Insect repellent','Notebook','Emergency whistle'];
 const customers=['a university student','a busy parent','a frequent traveller','a remote worker','a small business owner','a teacher','a tourist','a fitness beginner','a budget-conscious customer','a luxury customer','a first-time buyer','a café owner','a hotel manager','a commuter','a new employee','a retiree','a content creator','an office worker','a family with children','someone who hates wasting time'];
 const sellProducts=['phone','wallet','umbrella','headphones','backpack','suitcase','water bottle','notebook','camera','book','guitar','laptop','tablet','phone charger','power bank','coffee cup','shopping bag','jacket','hat','glasses','watch','bicycle','skateboard','gift box','travel guide','city map','travel adapter','travel pillow','thermos','lunch box','desk lamp','alarm clock','smart watch','fitness tracker','wireless headphones','Bluetooth speaker','keyboard','computer mouse','webcam','monitor','laptop stand','office chair','printer','projector','whiteboard','coffee machine','electric kettle','toaster','blender','air fryer','rice cooker','vacuum cleaner','vacuum robot','hair dryer','electric toothbrush','reusable bottle','food container','storage box','toolbox','flashlight','blanket','tent','first-aid box','yoga mat','dumbbell','sports bag','running shoes','swimming goggles','helmet','raincoat','sunglasses','portable charger','memory card','action camera','drone','e-book reader','games console','game controller','microphone','portable speaker','photo album','cookbook','dictionary','workbook','planner','calendar','business card holder','travel wallet','passport holder','luggage tag','carry-on bag','beach bag','beach umbrella','camping chair','sleeping bag','hiking boots','walking stick','fitness watch','meal planner','language course','online course','fitness class','guided city tour','museum pass','concert ticket','gift card','coffee subscription'];
 const storyThings=['phone','wallet','umbrella','keys','headphones','backpack','suitcase','passport','ticket','water bottle','notebook','camera','book','newspaper','guitar','football','basketball','laptop','tablet','charger','power bank','coffee cup','shopping bag','jacket','hat','glasses','watch','bicycle','skateboard','gift box','birthday cake','letter','photo album','map','travel guide','train ticket','bus ticket','hotel key card','boarding pass','credit card','library card','name badge','business card','calendar','microphone','speaker','flashlight','blanket','tent','first-aid box','coffee machine','printer','projector','remote control','smart watch','fitness tracker','toy','balloon','flower bouquet','sandwich','pizza box','takeaway bag','shopping list','recipe book','toolbox','helmet','sports bag','yoga mat','swimming goggles','raincoat','travel pillow','eye mask','luggage tag','passport holder','travel adapter','souvenir','postcard','concert ticket','movie ticket','restaurant bill','receipt','menu','dictionary','workbook','presentation slide','voice recorder','USB cable','memory card','office phone','desk lamp','alarm clock','thermos','lunch box','grocery bag','shopping cart','parcel','delivery box','invitation','certificate','diploma','profile picture','selfie stick'];
 const detectiveObjects=['phone','wallet','keys','headphones','backpack','suitcase','passport','ticket','water bottle','notebook','camera','book','laptop','tablet','charger','power bank','credit card','library card','name badge','business card','microphone','flashlight','gift box','letter','map','train ticket','bus ticket','hotel key card','boarding pass','travel adapter','souvenir','postcard','concert ticket','movie ticket','restaurant bill','receipt','dictionary','workbook','voice recorder','USB cable','memory card','office phone','desk lamp','alarm clock','thermos','lunch box','parcel','delivery box','invitation','certificate','diploma','glasses','watch','jacket','hat','umbrella','shopping bag','recipe book','toolbox','helmet','sports bag','yoga mat','swimming goggles','travel pillow','eye mask','luggage tag','passport holder','coffee cup','restaurant menu','presentation remote','wireless mouse','keyboard','staff badge','visitor badge','parking ticket','shopping receipt','invoice','contract','photo album','newspaper','guitar','football','basketball','smart watch','fitness tracker','camera lens','projector remote','tablet pen','earbuds','portable speaker','travel wallet','city map','booking confirmation','flight confirmation','seat reservation','appointment card','gift card','loyalty card','student card','identity card','phone charger'];
 const socialTopics=new Set(['friendship','family','relationships','first impressions','personal space','good manners','communication','honesty','trust','teamwork','confidence','patience','leadership','feedback','healthy boundaries','small talk','making friends','giving advice','asking for help','empathy','respect']);
 const socialRanks=[
  ['Trust','Communication','Respect','Reliability','Humour'],
  ['Honesty','Kindness','Patience','Empathy','Independence'],
  ['Listening','Support','Boundaries','Shared interests','Consistency'],
  ['Confidence','Warmth','Curiosity','Manners','Sense of humour'],
  ['Clear communication','Respect for time','Reliability','Flexibility','Encouragement'],
  ['Openness','Loyalty','Personal space','Fun','Emotional support'],
  ['Listening','Asking questions','Giving examples','Staying calm','Being direct'],
  ['Respect','Fairness','Responsibility','Patience','Team spirit'],
  ['Shared goals','Trust','Communication','Compromise','Independence'],
  ['Kindness','Honesty','Consistency','Self-awareness','Humour']
 ];
 const decisionTopics=new Set(['decision making','making choices','problem solving','goals','personal goals','planning','time management','productivity','habits','learning from mistakes','trying new things','asking for help','giving advice','risk taking','change','comfort zones']);
 const decisionRanks=[
  ['Clarity','Time','Information','Confidence','Advice'],
  ['Short-term benefit','Long-term benefit','Risk','Cost','Effort'],
  ['Facts','Experience','Advice','Instinct','Timing'],
  ['Urgency','Importance','Reversibility','Cost','Impact on others'],
  ['Simplicity','Flexibility','Risk','Learning value','Long-term value'],
  ['Preparation','Confidence','Information','Support','Time'],
  ['Personal goals','Responsibilities','Money','Time','Well-being'],
  ['Possible benefits','Possible problems','Effort','Timing','Alternatives'],
  ['Experience','Evidence','Advice','Values','Practical limits'],
  ['Immediate result','Long-term effect','Cost','Stress','Opportunity']
 ];
 const practicalRanks=[
  ['Cost','Time','Quality','Convenience','Flexibility'],
  ['Safety','Comfort','Price','Reliability','Simplicity'],
  ['Speed','Quality','Effort','Value','Long-term benefit'],
  ['Location','Cost','Comfort','Availability','Service'],
  ['Time saved','Money saved','Ease of use','Quality','Durability'],
  ['Preparation','Skill','Experience','Confidence','Luck'],
  ['Practicality','Enjoyment','Cost','Time','Learning value'],
  ['Privacy','Convenience','Speed','Security','Price'],
  ['Health','Time','Money','Enjoyment','Long-term value'],
  ['Quality','Simplicity','Flexibility','Reliability','Support']
 ];
 const survivalSettings=['a remote beach','a forest campsite','a snowy mountain road','a desert road','a small island','a mountain cabin','a quiet hiking trail','a rural train station','a closed campsite','a lakeside camp','a coastal village','an isolated farm','a broken-down tour bus','a remote picnic area','a national park','a rocky coastline','a mountain valley','a countryside road','a remote hostel','a ferry terminal after closing','an empty beach town','a storm-damaged campsite','a remote viewpoint','a forest road','a small harbour'];
 const survivalProblems=['after losing phone signal','during a power cut','with very limited drinking water','after heavy rain','during unusually cold weather','during extreme heat','after transport is cancelled','with one injured group member','after losing the main bag','with no shops open nearby','after getting separated from the main route','when night is approaching','with only one working phone','after a sudden storm','with no internet connection','with very little food','after the group gets lost','while waiting for help','with a damaged tent','after the car breaks down','with wet clothes and equipment','with only basic supplies','when the weather changes suddenly','with no safe place to sleep','after missing the last bus','with a dead phone battery','after losing the map','with a long wait before rescue','when one person cannot walk far','with strong wind','with limited cash','after the water supply stops','with no cooking equipment','after the flashlight breaks','with an unexpected medical problem','with poor visibility','with only one warm blanket','after the road closes','with limited daylight remaining','when the group must move to a safer place'];
 const arr=Array.isArray(cfg.items)?cfg.items:(cfg.items=[]);
 const seen=new Set(arr.map(x=>JSON.stringify(x)));
 const add=x=>{const k=JSON.stringify(x);if(!seen.has(k)){arr.push(x);seen.add(k)}};
 const cap=s=>String(s).replace(/\b\w/g,m=>m.toUpperCase());
 const withArticle=s=>(/^[aeiou]/i.test(String(s).trim())?'an ':'a ')+s;
 const cat=i=>cats[i%cats.length],topic=i=>topics[i%topics.length],target=i=>targets[i%targets.length],place=i=>places[i%places.length];
 const funTopics=[
  'daily routines','free time','sleep','exercise','money','shopping','cooking','travel','public transport','friendship',
  'family','work','education','English learning','technology','social media','music','movies','sports','stress',
  'confidence','habits','time management','weekends','holidays','restaurants','cafés','city life','remote work','meetings',
  'job interviews','relationships','first impressions','phone use','weather','fashion','gaming','photography','home life','commuting',
  'productivity','public speaking','language mistakes','online meetings','housework','weekend plans','small talk','making choices','customer service','group projects'
 ];
 const funTopic=i=>funTopics[i%funTopics.length];
 const bankPick=(normal,funny,i)=>{
  const useFunny=i%2===0;
  const slot=Math.floor(i/2);
  if(useFunny){
    const t=funTopics[slot%funTopics.length];
    const fn=funny[Math.floor(slot/funTopics.length)%funny.length];
    return fn(t);
  }
  const t=topics[slot%topics.length];
  const fn=normal[Math.floor(slot/topics.length)%normal.length];
  return fn(t);
 };
 const banks={
  twoTruths:{
   normal:[
    t=>'A real experience you had related to '+t,
    t=>'A preference or opinion you have about '+t,
    t=>'Something you learned about '+t,
    t=>'A recent example from your life related to '+t,
    t=>'Something you would like to understand or improve about '+t
   ],
   funny:[
    t=>'A tiny disaster you survived involving '+t,
    t=>'A moment when '+t+' became much more dramatic than it needed to be',
    t=>'A time you looked confident about '+t+' while improvising completely',
    t=>'A strangely specific opinion you have about '+t,
    t=>'A harmless habit involving '+t+' that your friends could tease you about',
    t=>'A moment when your plan for '+t+' failed in a funny way',
    t=>'Something about '+t+' you pretended to understand at first',
    t=>'A situation involving '+t+' that would make a good sitcom scene',
    t=>'A ridiculous but believable excuse connected to '+t,
    t=>'A time when '+t+' made you question your life choices for five minutes'
   ]
  },
  roulette:{
   normal:[
    t=>'What has your experience with '+t+' been like?',
    t=>'What have you learned recently about '+t+'?',
    t=>'What do you like or dislike about '+t+'?',
    t=>'What is one thing people often misunderstand about '+t+'?',
    t=>'What is one real example from your life related to '+t+'?'
   ],
   funny:[
    t=>'If '+t+' had a customer-service desk, what would you complain about first?',
    t=>'What is a terrible piece of advice about '+t+' that sounds confident?',
    t=>'If you became weirdly famous for '+t+', what would your interview headline be?',
    t=>'What harmless thing about '+t+' could start an unnecessary argument?',
    t=>'If '+t+' were a person at a party, what kind of person would it be?',
    t=>'What part of '+t+' deserves dramatic background music?',
    t=>'If you had to give a TED Talk about '+t+' with zero preparation, what would your opening line be?',
    t=>'What is something people pretend to understand about '+t+'?',
    t=>'If '+t+' came with a warning label, what should it say?',
    t=>'If you could add one completely unnecessary luxury feature to '+t+', what would it be?'
   ]
  },
  opinion:{
   normal:[
    t=>'People underestimate how much '+t+' affects everyday life.',
    t=>'Schools should discuss '+t+' more practically.',
    t=>'Real-life experience changes how people think about '+t+'.',
    t=>'Technology has changed the way people experience '+t+'.',
    t=>'People often have stronger opinions about '+t+' than they realise.'
   ],
   funny:[
    t=>'People should need a licence before giving confident advice about '+t+'.',
    t=>'A group chat about '+t+' would create more problems than it solves.',
    t=>'People make '+t+' sound much more complicated than it really is.',
    t=>'A two-minute voice message about '+t+' should require permission.',
    t=>'Anyone who starts a serious discussion about '+t+' before 8 a.m. owes everyone coffee.',
    t=>'There should be an emergency button for awkward situations involving '+t+'.',
    t=>'People become experts in '+t+' suspiciously fast after watching one video.',
    t=>'Every family has one person who takes '+t+' far too seriously.',
    t=>'The internet has made arguments about '+t+' at least 40% more dramatic.',
    t=>'There should be a socially acceptable way to say “I have no idea” during conversations about '+t+'.'
   ]
  },
  finish:{
   normal:[
    t=>'One thing I have learned about '+t+' is...',
    t=>'One thing I find interesting about '+t+' is...',
    t=>'One thing I would change about '+t+' is...',
    t=>'A real example of '+t+' from my life is...',
    t=>'The advice I would give about '+t+' is...'
   ],
   funny:[
    t=>'If '+t+' could complain about humans, it would say...',
    t=>'The most ridiculous thing about '+t+' is...',
    t=>'If I had to give a dramatic TED Talk about '+t+', my opening line would be...',
    t=>'If '+t+' had a warning label, it would say...',
    t=>'The fastest way to make '+t+' unnecessarily dramatic is...',
    t=>'If '+t+' were a reality TV show, the title would be...',
    t=>'My completely unnecessary strong opinion about '+t+' is...',
    t=>'If aliens asked me to explain '+t+', I would start by saying...',
    t=>'The one rule about '+t+' that nobody follows is...',
    t=>'If my friends described my relationship with '+t+', they would say...'
   ]
  },
  mission:{
   normal:[
    t=>'Ask someone about '+t+' and ask one natural follow-up question.',
    t=>'Find someone with a different opinion about '+t+' and ask why.',
    t=>'Ask someone for a real example related to '+t+'.',
    t=>'Invite a quieter person to share an opinion about '+t+'.',
    t=>'Summarise someone’s idea about '+t+' before adding your own view.'
   ],
   funny:[
    t=>'Bring up '+t+' naturally and make it sound slightly more dramatic than it really is.',
    t=>'Ask about '+t+' as if you are a serious detective investigating a very normal situation.',
    t=>'Ask someone about '+t+' and use the phrase “This is more serious than I expected” naturally.',
    t=>'Convince someone that one harmless thing about '+t+' is secretly a luxury.',
    t=>'Ask someone for an unpopular opinion about '+t+' without laughing.',
    t=>'Make a completely normal question about '+t+' sound like breaking news.',
    t=>'Ask someone to rank two things about '+t+' as if the decision will change history.',
    t=>'Find a way to connect '+t+' to coffee, traffic or Monday morning.',
    t=>'Ask someone what warning label they would put on '+t+'.',
    t=>'Ask someone what would make '+t+' 20% more ridiculous but still believable.'
   ]
  },
  lie:{
   normal:[
    t=>'A time when '+t+' surprised you.',
    t=>'A situation involving '+t+' that did not go as planned.',
    t=>'A decision related to '+t+' that had an unexpected result.',
    t=>'A time you changed your mind about '+t+'.',
    t=>'A real experience involving '+t+' that taught you something.'
   ],
   funny:[
    t=>'A moment involving '+t+' where you looked confident but had no idea what you were doing.',
    t=>'A tiny problem involving '+t+' that somehow became a dramatic story.',
    t=>'An embarrassing moment involving '+t+' that is funny now.',
    t=>'A time when '+t+' made you give a ridiculous excuse.',
    t=>'A story about '+t+' that sounds fake even if it is true.',
    t=>'A moment when you tried to impress someone with '+t+' and it went wrong.',
    t=>'A strange coincidence involving '+t+'.',
    t=>'A time you misunderstood something about '+t+' in a funny way.',
    t=>'A harmless disaster involving '+t+' that you would happily tell again.',
    t=>'A moment when '+t+' made you think “Nobody needs to know about this.”'
   ]
  },
  bingo:{
   normal:[
    t=>'Has recently talked about '+t,
    t=>'Has learned something useful about '+t,
    t=>'Has a clear opinion about '+t,
    t=>'Can give a real example related to '+t,
    t=>'Would like to know more about '+t
   ],
   funny:[
    t=>'Has a strangely strong opinion about '+t,
    t=>'Can tell an embarrassing-but-funny story about '+t,
    t=>'Has pretended to understand something about '+t,
    t=>'Has complained about '+t+' more than once this month',
    t=>'Could give terrible advice about '+t+' with great confidence',
    t=>'Has had a tiny disaster involving '+t,
    t=>'Would defend one unpopular opinion about '+t,
    t=>'Has a friend who takes '+t+' far too seriously',
    t=>'Has changed plans because '+t+' became unnecessarily complicated',
    t=>'Could make a funny warning label for '+t
   ]
  },
  hot:{
   normal:[
    t=>'People underestimate how much '+t+' affects everyday life.',
    t=>'Schools should discuss '+t+' more practically.',
    t=>'Real-life experience matters when people form opinions about '+t+'.',
    t=>'Technology will change the way people experience '+t+' within ten years.',
    t=>'People often have stronger opinions about '+t+' than they admit.'
   ],
   funny:[
    t=>'People take '+t+' so seriously that it sometimes becomes comedy.',
    t=>'A two-minute voice message about '+t+' should require permission.',
    t=>'People become experts on '+t+' far too quickly after one internet search.',
    t=>'There should be a warning label for people who give unrequested advice about '+t+'.',
    t=>'A family group chat can make '+t+' at least twice as complicated.',
    t=>'People should be allowed one dramatic complaint about '+t+' per week.',
    t=>'Anyone who says “It is easy” about '+t+' should be required to demonstrate it immediately.',
    t=>'The internet has made '+t+' unnecessarily dramatic.',
    t=>'There should be a five-minute emergency break during difficult conversations about '+t+'.',
    t=>'Most problems involving '+t+' could be improved with snacks and better communication.'
   ]
  },
  worstAdvice:{
   normal:[
    t=>'I keep having problems with '+t+' and I do not know what to change.',
    t=>'I need to make a decision about '+t+' but I keep delaying it.',
    t=>'Someone gave me confusing advice about '+t+'.',
    t=>'I want better results with '+t+' without making my routine too complicated.',
    t=>'I need a simple first step to deal with '+t+'.'
   ],
   funny:[
    t=>'I keep making the same mistake with '+t+' and at this point the mistake probably recognises me.',
    t=>'I started working on '+t+', got distracted by snacks, and now need a new plan.',
    t=>'I watched one video about '+t+' and now I am dangerously overconfident.',
    t=>'My plan for '+t+' has reached the “pretend everything is fine” stage.',
    t=>'I have turned a tiny problem with '+t+' into a full committee meeting.',
    t=>'I need help with '+t+', but please give me advice as if you are the world’s worst life coach.',
    t=>'I tried to organise '+t+' and somehow created three new problems.',
    t=>'I keep saying “I will deal with '+t+' tomorrow” and tomorrow is getting suspicious.',
    t=>'I need a solution for '+t+' that requires maximum confidence and minimum common sense.',
    t=>'I made '+t+' more complicated than necessary. Please make it even worse before we fix it.'
   ]
  }
 };
 function generate(i){
  const funny=i%2===0;
  const t=funny?funTopic(Math.floor(i/2)):topic(Math.floor(i/2));
  switch(cfg.type){
   case 'twoTruths': return [cat(i),cap(bankPick(banks.twoTruths.normal,banks.twoTruths.funny,i)),'Say three believable statements about this prompt. Two must be true and one must be false.'];
   case 'whoAmI': return [cat(i),cap(target(i))];
   case 'storyChain': {
    if(funny){
      const starts=[
       (t,thing,place)=>'You arrive at '+place+' and realise your bag contains '+thing+' instead of your own things.',
       t=>'Your phone sends a message about '+t+' to the completely wrong group chat.',
       t=>'You enter a meeting about '+t+' and everyone thinks you are the expert.',
       t=>'A normal day involving '+t+' suddenly starts feeling like a low-budget action movie.',
       t=>'You are trying to explain '+t+' when a stranger confidently gives completely wrong information.',
       t=>'A small misunderstanding about '+t+' causes an unnecessarily serious emergency meeting.',
       t=>'You wake up and discover your friends have made you responsible for everything related to '+t+'.',
       t=>'Someone leaves a mysterious note about '+t+' on your table with no explanation.',
       t=>'You are five minutes late because of '+t+', but your excuse sounds completely unbelievable.',
       t=>'A perfectly normal plan involving '+t+' becomes a story nobody will believe tomorrow.'
      ];
      const slot=Math.floor(i/2);
      const storyTopic=funTopics[slot%funTopics.length];
      const storyFn=starts[Math.floor(slot/funTopics.length)%starts.length];
      const storyThing=storyThings[slot%storyThings.length];
      const storyPlace=places[Math.floor(slot/storyThings.length)%places.length];
      return [cat(i),storyFn(storyTopic,storyThing,storyPlace),'Keep the story connected. Each player adds 1–2 sentences and the group should reach an ending.'];
    }
    const thing=storyThings[Math.floor(i/2)%storyThings.length],storyPlace=places[Math.floor(i/2/storyThings.length)%places.length];
    return [cat(i),'When I arrived at '+storyPlace+', I found '+withArticle(thing)+' waiting for me.','Keep the story connected. Each player adds 1–2 sentences and the group should reach an ending.'];
   }
   case 'explainBadly': return [cat(i),cap(target(i)),'Describe it indirectly without saying the target, spelling it or translating it.'];
   case 'roulette': return [cat(i),bankPick(banks.roulette.normal,banks.roulette.funny,i),'Give one specific example, then let someone ask one follow-up question.'];
   case 'opinion': return [cat(i),bankPick(banks.opinion.normal,banks.opinion.funny,i)];
   case 'ranking': {
    const sets=decisionTopics.has(t)?decisionRanks:(socialTopics.has(t)?socialRanks:practicalRanks);
    const angle=Math.floor(i/2/topics.length)%sets.length;
    return {cat:cat(i),title:'Rank what matters most when thinking about '+t,items:sets[angle]};
   }
   case 'detective': {
    const obj=detectiveObjects[i%detectiveObjects.length],detectivePlace=places[Math.floor(i/detectiveObjects.length)%places.length];
    const subject=withArticle(obj);
    return {cat:cat(i),title:'The Missing '+cap(obj),setup:subject.charAt(0).toUpperCase()+subject.slice(1)+' disappeared at '+detectivePlace+' between '+(9+i%10)+':10 and '+(9+i%10)+':20. Your group says you were together the whole time.',facts:['Agree where everyone was standing or sitting.','Agree what each person was doing five minutes earlier.','Agree on one detail the detective can verify.']};
   }
   case 'finish': return [cat(i),bankPick(banks.finish.normal,banks.finish.funny,i)];
   case 'threeClues': return [cat(i),cap(target(i))];
   case 'mission': return bankPick(banks.mission.normal,banks.mission.funny,i);
   case 'minuteStory': return [target(i),target(i+137),target(i+419)];
   case 'wouldILie': return [cat(i),bankPick(banks.lie.normal,banks.lie.funny,i)];
   case 'desert': {
    const setting=survivalSettings[i%survivalSettings.length],problem=survivalProblems[Math.floor(i/survivalSettings.length)%survivalProblems.length];
    return {cat:cat(i),title:'Stranded at '+setting+' '+problem,items:Array.from({length:8},(_,j)=>survival[(i+j*3)%survival.length])};
   }
   case 'bingo': return bankPick(banks.bingo.normal,banks.bingo.funny,i);
   case 'emoji': {
    const picked=[],g=Math.floor(i/emojis.length);
    const seeds=[i,i+5+g,i+11+g*2,i+19+g*3,i+23+g*5,i+29+g*7];
    for(const seed of seeds){const e=emojis[((seed%emojis.length)+emojis.length)%emojis.length];if(!picked.includes(e))picked.push(e);if(picked.length===4)break}
    for(const e of emojis){if(picked.length===4)break;if(!picked.includes(e))picked.push(e)}
    return [cat(i),picked];
   }
   case 'worstAdvice': return [cat(i),bankPick(banks.worstAdvice.normal,banks.worstAdvice.funny,i)];
   case 'sell': {
    const product=sellProducts[i%sellProducts.length],customer=customers[Math.floor(i/sellProducts.length)%customers.length];
    return {item:cap(product),twist:'Sell it to '+customer+'. Make it sound more exciting than it really is, but keep the benefits believable.'};
   }
   case 'hotTake': return [cat(i),bankPick(banks.hot.normal,banks.hot.funny,i)];
   case 'photoTalk': {
    const normalSituations=['waiting for important news','meeting someone for the first time','making an important decision','waiting for transport','helping another person'];
    const funnySituations=['pretending everything is under control','realising they entered the wrong place','holding the wrong bag','trying to hide an embarrassing mistake','acting confident after clearly getting lost','receiving a very confusing message','realising the meeting started an hour ago','trying to look normal after dropping something','discovering their phone battery is at one percent','trying to explain something nobody understands'];
    const slot=Math.floor(i/2);
    const situations=funny?funnySituations:normalSituations;
    const situation=situations[Math.floor(slot/storyThings.length)%situations.length];
    const sceneThing=storyThings[slot%storyThings.length];
    const photoPlace=places[Math.floor(slot/(storyThings.length*situations.length))%places.length];
    return {cat:cat(i),title:cap(photoPlace)+' · '+cap(situation),desc:'A person is in or near '+photoPlace+' with '+withArticle(sceneThing)+' and is '+situation+'. Use the icons as extra clues.',icons:[emojis[i%emojis.length],emojis[(i+3)%emojis.length],emojis[(i+9)%emojis.length]],questions:['What probably happened just before this moment?','How does the person feel and why?','What is the most likely thing to happen next?']};
   }
   default:return null;
  }
 }
 for(let i=0;arr.length<MIN&&i<12000;i++){const x=generate(i);if(x!==null)add(x)}
}
ensureExpandedContent();
const builtInItems=Array.isArray(cfg.items)?JSON.parse(JSON.stringify(cfg.items)):[];
const $=s=>document.querySelector(s);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s==null?'':s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const aud=()=>window.ESCGameKit&&window.ESCGameKit.audio?window.ESCGameKit.audio:{soft(){},select(){},success(){},fail(){},count(){},timeup(){}};
let deck=[],pos=-1,history=[],historyCursor=-1,timer=null,time=0,rank=[],phase=0;
let timerInitial=0,timerDeadline=0,timerPaused=false,timerDone=null,userInteracted=false;
const card=()=>$('#gameCard'),prompt=()=>$('#prompt'),sub=()=>$('#sub'),badge=()=>$('#badge'),controls=()=>$('#controls');
function clearDynamic(){card().querySelectorAll('.dynamic').forEach(n=>n.remove());prompt().classList.remove('hidden-target','revealed');}
function stopTimer(){
 clearInterval(timer);timer=null;timerPaused=false;timerInitial=0;timerDone=null;
 ['timer','timerPause','timerReset'].forEach(id=>{const el=$('#'+id);if(el)el.remove()});
 const start=$('#start');if(start)start.disabled=false;
}
function paintTimer(){
 const el=$('#timer');if(el){el.textContent=String(time);el.classList.toggle('danger',time<=5&&time>0);el.setAttribute('aria-label',time+' seconds remaining')}
 const pause=$('#timerPause');if(pause){pause.textContent=timerPaused?'Resume':'Pause';pause.disabled=time<=0}
 const start=$('#start');if(start)start.disabled=time>0;
}
function tickTimer(){
 const previous=time;time=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));paintTimer();
 if(time!==previous&&time<=5&&time>0)aud().count(time);
 if(time<=0){clearInterval(timer);timer=null;timerPaused=false;paintTimer();aud().timeup();const done=timerDone;timerDone=null;if(done)done()}
}
function toggleTimer(){
 if(time<=0)return;
 if(timerPaused){timerPaused=false;timerDeadline=Date.now()+time*1000;timer=setInterval(tickTimer,200)}
 else{time=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));clearInterval(timer);timer=null;timerPaused=true}
 paintTimer();
}
function startTimer(seconds,onEnd){
 stopTimer();timerInitial=seconds;time=seconds;timerDone=onEnd||null;
 const el=document.createElement('div');el.id='timer';el.className='timer-big dynamic';card().appendChild(el);
 const pause=document.createElement('button');pause.id='timerPause';pause.type='button';pause.className='new-btn';pause.onclick=toggleTimer;
 const reset=document.createElement('button');reset.id='timerReset';reset.type='button';reset.className='new-btn';reset.textContent='Restart timer';reset.onclick=()=>startTimer(seconds,onEnd);
 controls().append(pause,reset);timerDeadline=Date.now()+seconds*1000;paintTimer();aud().select();timer=setInterval(tickTimer,200);
}
function setCard(title,desc,tag){badge().textContent=tag||cfg.badge||'SPEAKING GAME';prompt().textContent=title||'';sub().textContent=desc||'';}
function validItem(x){
  if(x===null||x===undefined)return false;
  switch(cfg.type){
    case 'twoTruths': return Array.isArray(x)&&x.length>=3&&String(x[1]||'').trim()&&String(x[2]||'').trim();
    case 'whoAmI':
    case 'storyChain':
    case 'explainBadly':
    case 'roulette':
    case 'finish':
    case 'threeClues':
    case 'wouldILie':
    case 'worstAdvice':
    case 'hotTake': return Array.isArray(x)&&x.length>=2&&String(x[1]||'').trim();
    case 'opinion': return Array.isArray(x)&&x.length>=2&&String(x[1]||'').trim();
    case 'ranking':
    case 'desert': return x&&typeof x==='object'&&String(x.title||'').trim()&&Array.isArray(x.items)&&x.items.length>=3;
    case 'detective': return x&&typeof x==='object'&&String(x.title||'').trim()&&String(x.setup||'').trim()&&Array.isArray(x.facts)&&x.facts.length>=2;
    case 'mission': return typeof x==='string'&&x.trim().length>3;
    case 'minuteStory': return Array.isArray(x)&&x.length>=3&&x.every(v=>String(v||'').trim());
    case 'bingo': return typeof x==='string'&&x.trim().length>2;
    case 'emoji': return Array.isArray(x)&&x.length>=2&&Array.isArray(x[1])&&x[1].length>=3;
    case 'sell': return x&&typeof x==='object'&&String(x.item||'').trim()&&String(x.twist||'').trim();
    case 'photoTalk': return x&&typeof x==='object'&&String(x.title||'').trim()&&Array.isArray(x.questions)&&x.questions.length>=1;
    default: return true;
  }
}
function playableItem(x){return cfg.type==='bingo' ? Array.isArray(x)&&x.length===16&&x.every(v=>typeof v==='string'&&v.trim()) : validItem(x)}
function usableItems(){return Array.isArray(cfg.items)?cfg.items.filter(validItem):[]}
function showEmpty(){
  stopTimer();clearDynamic();
  setCard('Content is being prepared','This game does not have any active cards yet. Please choose another game or try again later.','GAME LIBRARY');
  controls().innerHTML='<a class="new-btn primary" href="/games/" style="text-decoration:none;display:inline-flex;align-items:center">← All games</a>';
}
function btn(label,cls,id){return '<button class="'+(cls||'new-btn')+'" '+(id?'id="'+id+'"':'')+' type="button">'+label+'</button>'}
function nextItem(){
  const items=usableItems();
  if(!items.length || (cfg.type==='bingo'&&items.length<16)){showEmpty();return}
  if(historyCursor<history.length-1){historyCursor++;renderItem(history[historyCursor]);aud().soft();return}
  if(!deck.length||pos>=deck.length-1){
    deck=cfg.type==='bingo'?Array.from({length:30},()=>shuffle(items).slice(0,Math.min(16,items.length))):shuffle(items);
    pos=-1;
  }
  const x=deck[++pos];
  if(x===undefined||!playableItem(x)){showEmpty();return}
  history.push(x);historyCursor=history.length-1;
  try{renderItem(x);aud().soft()}
  catch(e){
    console.warn('Invalid game card skipped.',e);
    const safe=JSON.parse(JSON.stringify(builtInItems)).filter(validItem);
    if(safe.length){cfg.items=safe;deck=[];pos=-1;history=[];historyCursor=-1;nextItem()}
    else showEmpty();
  }
}
function prevItem(){if(historyCursor<1)return;historyCursor--;renderItem(history[historyCursor]);aud().soft()}
function shuffleDeck(){deck=[];pos=-1;history=[];historyCursor=-1;nextItem();if(window.ESCGameKit)window.ESCGameKit.toast('Shuffled')}
function baseButtons(extra){controls().innerHTML=btn('↩ Previous','new-btn','prev')+btn('Next →','new-btn primary','next')+btn('↻ Shuffle','new-btn','shuffle')+(extra||'');$('#prev').onclick=prevItem;$('#prev').disabled=historyCursor<1;$('#next').onclick=nextItem;$('#shuffle').onclick=shuffleDeck}
function addOptions(items,mode){
 const g=document.createElement('div');g.className='option-grid dynamic';
 g.innerHTML=items.map(v=>'<button type="button" class="option-card" aria-pressed="false">'+esc(v)+'</button>').join('');card().appendChild(g);
 const status=document.createElement('p');status.className='selection-status dynamic';status.setAttribute('role','status');card().appendChild(status);
 function update(){
  if(mode==='rank'){
   g.querySelectorAll('button').forEach(b=>{const idx=rank.indexOf(b.textContent);b.classList.toggle('rank-selected',idx>=0);b.setAttribute('aria-pressed',String(idx>=0));if(idx>=0)b.dataset.rank=String(idx+1);else delete b.dataset.rank});
   status.textContent=rank.length?rank.map((v,i)=>(i+1)+'. '+v).join(' / '):'Choose your first item. Click a ranked item again to undo it.';
  }else{status.textContent=g.querySelectorAll('.selected').length+' / 3 selected';}
 }
 g.querySelectorAll('button').forEach(b=>b.onclick=()=>{
  if(mode==='limit3'){
   if(b.classList.contains('selected'))b.classList.remove('selected');
   else if(g.querySelectorAll('.selected').length<3)b.classList.add('selected');
   else{window.ESCGameKit?.toast('Choose only 3. Deselect an item to change your choice.');return}
   b.setAttribute('aria-pressed',String(b.classList.contains('selected')));
  }else if(mode==='rank'){const i=rank.indexOf(b.textContent);if(i>=0)rank.splice(i,1);else rank.push(b.textContent)}
  aud().select();update();
 });update();
}
function renderBingo(items){
 const g=document.createElement('div');g.className='bingo-grid dynamic';
 g.innerHTML=items.map(v=>'<button type="button" class="bingo-cell" aria-pressed="false">'+esc(v)+'</button>').join('');card().appendChild(g);
 const status=document.createElement('p');status.id='bingoStatus';status.className='dynamic';status.setAttribute('role','status');card().appendChild(status);
 function update(){
  const cells=[...g.querySelectorAll('button')],marked=cells.map(b=>b.classList.contains('done'));let lines=0;
  for(let i=0;i<4;i++){if([0,1,2,3].every(j=>marked[i*4+j]))lines++;if([0,1,2,3].every(j=>marked[j*4+i]))lines++}
  if([0,5,10,15].every(i=>marked[i]))lines++;if([3,6,9,12].every(i=>marked[i]))lines++;
  const count=marked.filter(Boolean).length;status.textContent=count===16?'Full card completed!':count+' / 16 marked'+(lines?' - Bingo! '+lines+' complete line'+(lines>1?'s':''):'');status.classList.toggle('complete',lines>0);
 }
 g.querySelectorAll('button').forEach(b=>b.onclick=()=>{b.classList.toggle('done');b.setAttribute('aria-pressed',String(b.classList.contains('done')));aud().select();update()});update();
}
function renderItem(x){
 stopTimer();clearDynamic();rank=[];phase=0;baseButtons();
 switch(cfg.type){
  case 'twoTruths':
   setCard(x[1],x[2],x[0]);
   break;
  case 'whoAmI':
   setCard(x[1],'One player privately sees the identity. Everyone else asks yes/no questions until they guess it.',x[0]);
   prompt().classList.add('hidden-target');
   controls().innerHTML=btn('Reveal identity','new-btn good','reveal')+btn('Next identity →','new-btn primary','next')+btn('↻ Shuffle','new-btn','shuffle');
   $('#reveal').onclick=()=>{prompt().classList.toggle('revealed');$('#reveal').textContent=prompt().classList.contains('revealed')?'Hide identity':'Reveal identity'};
   $('#next').onclick=nextItem;$('#shuffle').onclick=shuffleDeck;
   break;
  case 'storyChain':
   setCard(x[1],x[2],x[0]);
   break;
  case 'explainBadly':
   setCard(x[1],x[2],x[0]);prompt().classList.add('hidden-target');
   controls().innerHTML=btn('Reveal to speaker','new-btn good','reveal')+btn('Next target →','new-btn primary','next');
   $('#reveal').onclick=()=>{const visible=prompt().classList.toggle('revealed');$('#reveal').textContent=visible?'Hide word':'Reveal word';$('#reveal').setAttribute('aria-pressed',String(visible))};$('#next').onclick=nextItem;
   break;
  case 'roulette':
   setCard(x[1],x[2],x[0]);
   break;
  case 'opinion':
   setCard(x[1],'Choose your position first. Then explain your reason and give one example.',x[0]);
   {const d=document.createElement('div');d.className='scale-row dynamic';d.innerHTML=['Strongly disagree','Disagree','Not sure','Agree','Strongly agree'].map(v=>'<button class="scale-btn">'+v+'</button>').join('');card().appendChild(d);d.querySelectorAll('button').forEach(b=>b.onclick=()=>{d.querySelectorAll('button').forEach(y=>y.classList.remove('selected'));b.classList.add('selected');aud().select()})}
   break;
  case 'ranking':
   setCard(x.title,'Click the items in your preferred order: #1 first, then #2, #3, #4 and #5.',x.cat);addOptions(x.items,'rank');
   break;
  case 'detective':
   setCard(x.title,x.setup,x.cat);
   {const d=document.createElement('div');d.className='truth-list dynamic';d.innerHTML=x.facts.map((v,i)=>'<div class="truth-line"><small>'+(i+1)+'</small>'+esc(v)+'</div>').join('');card().appendChild(d)}
   break;
  case 'finish':
   setCard(x[1],'Finish the sentence, then add one reason or example.',x[0]);
   break;
  case 'threeClues':
   setCard(x[1],'Speaker: give exactly three clues. Do not say the word itself. The group gets one guess after each clue.',x[0]);prompt().classList.add('hidden-target');
   controls().innerHTML=btn('Reveal word','new-btn good','reveal')+btn('Next word →','new-btn primary','next');$('#reveal').onclick=()=>{const visible=prompt().classList.toggle('revealed');$('#reveal').textContent=visible?'Hide word':'Reveal word';$('#reveal').setAttribute('aria-pressed',String(visible))};$('#next').onclick=nextItem;
   break;
  case 'mission':
   setCard('Secret Mission','Read your mission privately, hide it, then pass the screen. Complete it naturally during the meetup.','PRIVATE');
   {const m=document.createElement('div');m.className='mission-box dynamic';m.innerHTML='<strong id="missionText" class="hidden-target">'+esc(x)+'</strong><small>Do not announce the mission. Try to complete it naturally in conversation.</small>';card().appendChild(m)}
   controls().innerHTML=btn('Reveal mission','new-btn good','reveal')+btn('Hide & pass','new-btn','hide')+btn('Next mission →','new-btn primary','next');$('#reveal').onclick=()=>$('#missionText').classList.add('revealed');$('#hide').onclick=()=>$('#missionText').classList.remove('revealed');$('#next').onclick=nextItem;
   break;
  case 'minuteStory':
   setCard('Use all three words','You have 60 seconds to tell one connected story. The story can be true or invented.','60-SECOND STORY');
   {const d=document.createElement('div');d.className='word-row dynamic';d.innerHTML=x.map(v=>'<span class="word-pill">'+esc(v)+'</span>').join('');card().appendChild(d)}
   controls().innerHTML=btn('Start 60s','new-btn good','start')+btn('New words →','new-btn primary','next');$('#start').onclick=()=>startTimer(60);$('#next').onclick=nextItem;
   break;
  case 'wouldILie':
   setCard(x[1],'Tell a short story based on this topic. It may be true or invented. The group can ask up to two questions, then votes: TRUE or LIE?',x[0]);
   break;
  case 'desert':
   setCard(x.title,'Choose exactly three items. Then explain why your group would keep them.',x.cat);addOptions(x.items,'limit3');
   break;
  case 'bingo':
   setCard('Conversation Bingo','Find different people who match the squares. Ask a real follow-up question before marking a square.','MINGLE');
   renderBingo(x);
   controls().innerHTML=btn('New bingo card','new-btn primary','next');$('#next').onclick=nextItem;
   break;
  case 'emoji':
   setCard('Build a story','Use every emoji in one connected story. Add a beginning, a problem and an ending.',x[0]);
   {const d=document.createElement('div');d.className='emoji-row dynamic';d.innerHTML=x[1].map(v=>'<span>'+v+'</span>').join('');card().appendChild(d)}
   break;
  case 'worstAdvice':
   setCard(x[1],'Round 1: give the worst possible advice. Then switch to Round 2 and give genuinely useful advice.',x[0]);
   {const p=document.createElement('div');p.className='phase-pill dynamic';p.id='phase';p.textContent='ROUND 1 · WORST ADVICE ONLY';card().appendChild(p)}
   controls().innerHTML=btn('Show good-advice round','new-btn good','phaseBtn')+btn('Next problem →','new-btn primary','next');$('#phaseBtn').onclick=()=>{phase=1-phase;$('#phase').classList.toggle('good',phase===1);$('#phase').textContent=phase?'ROUND 2 · REAL ADVICE':'ROUND 1 · WORST ADVICE ONLY';aud().select()};$('#next').onclick=nextItem;
   break;
  case 'sell':
   setCard(x.item,'Sell this in 30 seconds. Twist: '+x.twist,'SALES PITCH');
   controls().innerHTML=btn('Start 30s','new-btn good','start')+btn('Next product →','new-btn primary','next');$('#start').onclick=()=>startTimer(30);$('#next').onclick=nextItem;
   break;
  case 'hotTake':
   setCard(x[1],'Take a position and defend it for 30 seconds. Then let one person give a counterargument.',x[0]);
   controls().innerHTML=btn('Start 30s','new-btn good','start')+btn('Next take →','new-btn primary','next');$('#start').onclick=()=>startTimer(30);$('#next').onclick=nextItem;
   break;
  case 'photoTalk':
   setCard(x.title,x.desc,x.cat);
   {const d=document.createElement('div');d.className='scene-box dynamic';d.innerHTML='<div class="scene-icons">'+x.icons.join(' ')+'</div><div class="scene-title">'+esc(x.title)+'</div><ul class="scene-questions">'+x.questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>';card().appendChild(d)}
   break;
 }
}
async function syncRemote(){
  try{
    if(window.ESCGameKit?.ensurePlatform)await window.ESCGameKit.ensurePlatform();
    for(let i=0;i<40&&!window.ESCSupabase;i++)await new Promise(r=>setTimeout(r,50));
    if(!window.ESCSupabase?.getGameSettings||!cfg.slug)return;
    const settings=await window.ESCSupabase.getGameSettings(cfg.slug);
    if(settings&&Array.isArray(settings.content)){
      const remote=JSON.parse(JSON.stringify(settings.content)).filter(validItem);
      if(remote.length){
        cfg.items=remote;
        ensureExpandedContent();
        if(!userInteracted){deck=[];pos=-1;history=[];historyCursor=-1;nextItem()}
      }else{
        console.warn('Remote game content was empty or invalid; keeping built-in cards.');
      }
    }
  }catch(e){console.warn('Shared game content unavailable; using built-in cards.',e)}
}
function resetToBuiltIns(){cfg.items=JSON.parse(JSON.stringify(builtInItems));deck=[];pos=-1;history=[];historyCursor=-1;nextItem()}
function init(){
 document.addEventListener('click',e=>{if(e.target.closest('.new-game-controls, .new-game-card button'))userInteracted=true});
 $('#gameTitle').textContent=cfg.title||'Speaking Game';$('#gameDesc').textContent=cfg.desc||'';$('#gameEyebrow').textContent=cfg.eyebrow||'SPEAKING GAME';document.title=(cfg.title||'Game')+' · Eryaman Speaking Club';
 (cfg.rules||[]).forEach(r=>{const s=document.createElement('span');s.textContent=r;$('#gameRules').appendChild(s)});
 const items=usableItems();
 if(cfg.type==='bingo')deck=Array.from({length:30},()=>shuffle(items).slice(0,Math.min(16,items.length)));else deck=shuffle(items);
 nextItem();
 void syncRemote();
 window.EryamanSpeakingGame={refresh(){deck=[];pos=-1;history=[];historyCursor=-1;nextItem()},resetToBuiltIns,config:cfg};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();