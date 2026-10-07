/* Authored CEFR practice tasks, not certified test items. No quota-filling generator. */
(function(){
'use strict';
const levels=['A1','A2','B1','B2','C1'];
const lines=s=>s.trim().split('\n').map(x=>x.trim()).filter(Boolean);
const rows=s=>lines(s).map(x=>x.split('|').map(v=>v.trim()));
const source={};
source.A1={
open:rows(`What do you eat for breakfast?|I eat ...
Do you sing at home?|Yes, I do. / No, I don't.
Where do you live?|I live in ...
Do you talk to your cat or dog?|I say ...
What do you do on Sundays?|I ... on Sundays.
Is your bag big or small?|My bag is ...
What music do you like?|I like ...
Do you dance in the kitchen?|Yes, I do. / No, I don't.
What is your favourite place in your town?|My favourite place is ...
Are you happy before breakfast?|Yes, I am. / No, I'm not.
Who do you eat dinner with?|I eat with ...
How many alarms do you use in the morning?|I use ... alarms.
What do you drink in the evening?|I drink ...
Can you draw a good cat?|Yes, I can. / No, I can't.
What is in your room?|There is a ...
Do you like cold pizza?|Yes, I do. / No, I don't.
How do you go to work or school?|I go by ... / I walk.
Do you have a favourite cup?|It is ...
What can you cook?|I can cook ...
Is your phone near you now?|It is ...`),
choice:rows(`tea|coffee
big pizza|two small pizzas
bus|train
a blue hat|a yellow hat
read a book|watch a film
sing at home|dance at home
summer|winter
a very small car|a very big bicycle
breakfast at home|breakfast in a cafe
cake for breakfast|eggs for dinner
cats|dogs
a red phone|a green phone`),
motion:lines(`Tea is better than coffee.
Pizza is a good breakfast.
Walking is better than taking a bus.
Socks are a good birthday present.
Summer is better than winter.
Cats are good teachers.
Small homes are better than big homes.
Monday is a good day.
Cooking at home is fun.
Every room needs a big sofa.
Books are good presents.
A very big hat is useful.`),
past:lines(`What is the last thing in your bag? Name it.
What is on your phone screen now?
What food is on your table today?
What colour are your socks today?
Who is next to you now?
What is in your cup now?
What is your last class today?
Is your room clean today?
What is your last meal of the day?
What song is on your phone now?
What is your last activity before bed?
Is your bag heavy today?`),
problem:lines(`You are thirsty. What do you ask for?
Your tea is cold. What do you say?
You need a pen. What do you ask?
Your friend has two hats on. What do you say?
You are in a shop. You need bread. What do you say?
Your bag is full. Where do you put your banana?
You do not understand a word. What do you ask?
Your dog is on your chair. What do you say?
You are cold. What do you need?
Your friend sings very loudly. What do you say?
You cannot find your book. What do you ask?
Your cake is very big. Who do you share it with?`),
social:lines(`helps a new person
sings in the kitchen
brings a book to a cafe
eats the last biscuit
gets up early
takes ten photos of a cat
remembers names
wears two different socks
makes good tea
has three pens but no notebook
walks to the shops
dances when a good song starts`),
flag:lines(`A friend says thank you.
A friend eats your cake without asking.
A person listens when you speak.
A friend sends ten cat photos every day.
A person helps you find a seat.
A friend sings loudly on the bus.
A friend asks before using your pen.
A friend talks to a plant every morning.
A person says sorry.
A friend brings a very big bag to a short meeting.
A friend waits for you.
A friend gives every chair a name.`),
challenge:lines(`colours
things in a bag
foods
things a cat likes
rooms in a home
things on a pizza
places in a town
things you cannot eat
family words
things in a very big pocket
drinks
things that are yellow
things you wear
things on a birthday cake
animals
things a dog cannot use
days of the week
things you can draw
things in a kitchen
things that make a loud sound`),
experience:lines(`Do you drink tea every day?
Do you sing in the shower?
Do you walk to the shops?
Do you talk to your phone?
Do you cook dinner?
Do you eat pizza in bed?
Do you read books?
Do you dance when you are alone?
Do you take photos?
Do you give names to your plants?
Do you use an alarm?
Do you look for your glasses on your head?`),
personal:lines(`food you like
things in your bag
your family
things you can draw
your home
songs you sing
your daily routine
food you do not like
your town
colours in your room
your hobbies
things on your desk`),
story:lines(`I am at a cafe. My friend is here.
There is a cat on my chair.
I have a new book in my bag.
My phone is in the fridge.
I am at the bus stop with my sister.
There are five cakes on the table.
It is Sunday. I am at home.
My dog has my shoe.
I am in a shop. I need a pen.
My friend has a very small umbrella.
The park is near my house.
There is a banana in my coat.`),
finish:lines(`In the morning, I ...
My phone is always ...
My favourite place is ...
My cat or dog likes ...
After work or school, I ...
In my very big bag, there is ...
I can ...
For a funny photo, I ...
At the weekend, I ...
My perfect pizza has ...
I feel happy when ...
Before breakfast, I am ...`),
dare:lines(`Name three things in this room.
Say hello like a very happy robot.
Ask a person their favourite food.
Give your pen a funny name.
Describe your bag in two sentences.
Say "I love tea" in a very sleepy voice.
Ask someone how they are today.
Draw a cat and say two things about it.
Say three things you can do.
Introduce your shoe: "This is ... It is ..."
Tell the group what you eat for breakfast.
Say three nice things about a banana.`),
mission:lines(`Ask someone their name.
Ask someone about their favourite food.
Ask someone what music they like.
Say thank you to someone.
Ask someone about their town.
Ask someone if they like tea.
Give someone a simple compliment.
Ask someone what is in their bag.
Ask someone about a pet.
Ask someone what they do on Sundays.
Ask someone if they can cook.
Ask someone about their favourite colour.
Ask someone about their room.
Tell someone your favourite drink.
Ask someone if they like pizza.
Ask someone how they come here.
Tell someone one thing you can do.
Ask someone if they read books.
Ask someone about their breakfast.
Tell someone the name of a song you like.`),
bingo:lines(`likes tea
has a cat
can cook
likes rainy days
reads books
sings at home
has a bicycle
likes cold pizza
gets up before seven
has a favourite cup
likes football
has a plant with a name
walks to work or school
likes yellow clothes
has a brother
likes very hot food
plays a musical instrument
uses more than one alarm
speaks two languages
has a funny phone photo
likes the sea
likes dancing in the kitchen
has a pet
likes socks with pictures`)
};
source.A2={
open:rows(`What did you do last weekend?|First I ... Then I ...
When did you last buy something you did not need?|I bought ... because ...
Describe a place you visited recently.|It was ... There were ...
What food did you dislike as a child?|I didn't like ... but now ...
What are you going to do next holiday?|I'm going to ...
When did you last forget why you entered a room?|I wanted to ... but ...
How is your town different from five years ago?|There are more ... now.
What is the strangest thing in your bag today?|It is ... I use it for ...
What do you do when a friend visits your home?|We usually ...
What simple thing are you bad at?|I find ... difficult.
Tell us about a meal you enjoyed.|I ate ... with ...
When did you last laugh at a spelling mistake?|I wrote ... instead of ...
What would you like to learn this year?|I'd like to learn ...
Which job at home do you avoid?|I don't like ... because ...
What is a useful gift you received?|Someone gave me ...
Did you ever wave at the wrong person?|I thought ... but ...
How do you choose a restaurant?|I look for ...
What did you believe about adults when you were a child?|I thought ...
What helps you remember new English words?|I ... to remember them.
When did a small cooking mistake make you laugh?|I tried to ... but ...`),
choice:rows(`cook dinner|wash the dishes
a free cake every Friday|a free coffee every morning
travel by train|travel by plane
wear the same hat for a week|carry a giant umbrella for a week
learn to cook|learn to play guitar
have a very loud doorbell|have a very quiet alarm
live near a park|live near the shops
name a cafe after your pet|name a sandwich after yourself
visit a museum|take a long walk
sing your order in a cafe|draw your order in a cafe
plan your weekend|decide on Saturday morning
have ten small birthday cakes|have one enormous birthday cake`),
motion:lines(`It is easier to learn with a friend.
Breakfast should be available all day.
Weekends should be three days long.
Every office needs a nap room.
People should buy fewer new clothes.
Bad films are more fun with friends.
A small holiday is better than no holiday.
Adults should have stickers for good work.
Everyone should learn to cook a few meals.
Choosing a group photo takes too long.
Walking is the best way to see a new town.
A sandwich tastes better when someone else makes it.`),
past:lines(`What was the last meal you cooked?
When did you last forget someone's name?
Where did you go last Sunday?
What was the last thing you dropped?
Who did you last help?
When did you last laugh at your own mistake?
What was the last thing you bought?
When did you last wear something inside out?
What was the last film you watched?
When did you last open the wrong door?
What did you do after work yesterday?
When did you last take a photo of your food?`),
problem:lines(`You ordered tea but received coffee. What do you say?
You arrive at a party one day early. What do you do?
Your bus is late and your friend is waiting. What message do you send?
You put salt in your tea by mistake. What do you do?
Your hotel room is too noisy. What do you ask for?
You and a stranger are wearing the same unusual hat. What do you say?
You cannot find a book in the library. How do you ask for help?
Your friend sends a message with ten spelling mistakes. What do you reply?
You need to change a meeting time. What do you suggest?
You bring two different shoes on holiday. What do you do?
A visitor asks for directions to the station. What do you say?
Your friend brings a huge cake for three people. What is your plan?`),
social:lines(`plans a weekend trip
forgets why they opened the fridge
helps a visitor find the bus stop
buys a notebook and never uses it
remembers a friend's birthday
takes longer to choose a film than to watch it
tries a new hobby
packs six pairs of shoes for two days
brings snacks to a meeting
laughs before finishing a joke
finds a quiet place to study
sets five alarms and sleeps through them`),
flag:lines(`A friend tells you they will be late.
A friend sends a photo of every meal.
A colleague offers help when you are busy.
A person uses a funny voice in every voice message.
A friend asks before posting your photo.
A friend brings their own spoon to every cafe.
Someone returns a book in good condition.
A friend spends ten minutes choosing a sandwich.
A friend remembers something important you told them.
A person gives names to all their house plants.
Someone apologises and fixes a mistake.
A friend treats a board game like a world final.`),
challenge:lines(`things you pack for a weekend
excuses for being late to breakfast
places you can buy food
things that disappear in your room
ways to travel to work
bad places to sing loudly
things you did yesterday
things you should not put in a microwave
things you do before a trip
reasons a cat might look angry
jobs in a restaurant
things you can forget at a hotel
ways to relax after work
unusual birthday presents
things you buy at a supermarket
things that make a bad alarm sound
things you can borrow from a friend
things you should not wear to bed
places to visit on a rainy day
things people do while waiting for a bus`),
experience:lines(`Did you visit another town last year?
Did you ever arrive at the wrong meeting?
Did you learn a new recipe recently?
Did you ever send a message to the wrong person?
Did you help a neighbour recently?
Did you ever laugh during a serious film?
Did you go camping as a child?
Did you ever forget where you put your phone?
Did you make a new friend this year?
Did you ever cook something that looked nothing like the photo?
Did you try a new sport last year?
Did you ever push a door that said "Pull"?`),
personal:lines(`a place you visited
an unusual thing you bought
a meal you cooked
a funny mistake at school
a skill you learned
a surprising thing in your bag
a journey with a friend
a bad haircut
a hobby you tried
a time you got the day wrong
a gift you received
a funny thing your pet did`),
story:lines(`Yesterday I met an old friend at the bus stop.
I opened my bag and found three bananas.
We arrived at the hotel after lunch.
My new shoes made a noise with every step.
I was making dinner when my friend called.
We went to the wrong birthday party.
I found a book with a note inside.
My dog took my bus ticket.
We wanted to have a picnic, but it started raining.
I ordered one cake. The waiter brought ten.
I lost my umbrella on the train.
My phone rang during a very quiet meeting.`),
finish:lines(`Last weekend, I ...
The funniest thing in my kitchen is ...
This year, I want to ...
I knew dinner was going wrong when ...
When I visit a new town, I ...
My alarm clock and I ...
I started learning English because ...
A very bad present for me is ...
My favourite childhood memory is ...
I once thought I was good at ...
A good way to save time is ...
I bought it because it looked ...`),
dare:lines(`Describe your last weekend in four sentences.
Advertise an ordinary spoon as a wonderful gift.
Ask a partner two questions about their town.
Explain how to make tea in a very serious voice.
Give directions from your home to a nearby shop.
Tell a short story about losing one sock.
Describe a meal you know how to cook.
Introduce this room as a very expensive hotel.
Invite a friend to a weekend activity.
Make a polite complaint about a cake that is too big.
Tell us two plans for next month.
Describe a normal bus journey as an exciting holiday.`),
mission:lines(`Ask someone what they did last weekend.
Ask someone to recommend a cafe.
Find out what someone is going to do on Sunday.
Give someone a compliment and a reason.
Ask a follow-up question about a hobby.
Invite someone to describe their favourite meal.
Find out how someone travels to work.
Ask someone about a place they visited.
Use "because" to explain a preference.
Ask someone for a useful English word.
Tell someone about a small mistake you made.
Ask someone what they liked as a child.
Ask someone which season they prefer and why.
Recommend a simple activity for a rainy day.
Ask someone to compare two places.
Find a food that you both like.
Politely ask someone to repeat a sentence.
Ask someone about a gift they received.
Tell someone a plan for next week.
Ask someone about something they can cook.`),
bingo:lines(`visited another town last month
bought something they did not need
cooked dinner yesterday
waved at the wrong person
learned a new skill this year
forgot why they opened an app
travelled by train recently
put on a T-shirt inside out
has a weekend plan
owns a mug with a funny picture
helped a neighbour recently
laughed at a cooking mistake
started a new hobby
lost one sock in the washing
visited a museum this year
has more than one alarm
can recommend a local cafe
arrived at a place on the wrong day
received a useful gift
has a funny story about a pet
walked somewhere new recently
sang while cooking
changed their usual travel route
ordered something by pointing at a picture`)
};
source.B1={
open:rows(`What habit has made your week easier?|Describe the habit and give one example.
What small mistake became a good story?|Explain what happened and how it ended.
What would make your neighbourhood better?|Give a reason and a realistic first step.
What purchase seemed useful but was not?|Explain what you expected and what happened.
When has a friend helped you make a decision?|Describe the choice and the advice.
What simple task do you make unnecessarily complicated?|Give an example from daily life.
What skill would you like to learn from someone here?|Explain why it interests you.
What is your funniest misunderstanding in English?|Explain what you meant to say.
How do you decide what to do on a free day?|Describe how you choose.
What harmless habit would your friends recognise immediately?|Explain when you do it.
What changed your opinion about a place?|Compare your first idea with your experience.
When did you follow instructions and still get it wrong?|Tell us what happened.
What makes someone a good teammate?|Give a specific example.
What popular activity do you secretly find boring?|Explain your view without judging other people.
What did you learn from a difficult journey?|Describe one problem and one lesson.
What is a tiny problem you complain about too much?|Explain why it annoys you.
What helps you keep a promise to yourself?|Describe something that has worked.
What do you always overpack for a trip?|Explain what you think might happen.
What advice would you give a new club member?|Suggest one useful action.
When did your phone make a normal day more confusing?|Explain the situation and the result.`),
choice:rows(`have more free time|earn more money
let a friend choose your haircut|let a friend choose your clothes for a month
work from home|work close to home
always forget film endings|always guess film endings
learn a language through travel|learn it through regular local practice
be famous for a great cake|be famous for a terrible dance
plan every detail of a trip|leave most decisions until you arrive
have a polite alarm that gives up|have a loud alarm that tells jokes
live near family|live near your dream job
have your pet choose your weekend plans|have a five-year-old choose your dinner
be very good at one hobby|be reasonably good at several hobbies
arrive early at the wrong place|arrive late at the right place`),
motion:lines(`Good habits matter more than motivation.
Group chats need opening hours.
Everyone should learn basic cooking at school.
Choosing a film should have a five-minute time limit.
Working from home makes it easier to concentrate.
Adults deserve a small prize for finishing housework.
Travelling alone is a useful experience.
People take board games too seriously.
Public libraries are still important.
The person who says "It is easy" should demonstrate it.
It is better to repair things than replace them.
A holiday needs at least one completely unplanned day.`),
past:lines(`When did you last learn something useful from a mistake?
When did a simple plan last become unexpectedly complicated?
What was the last book or film you recommended?
When did you last pretend to recognise someone?
When did you last ask for help and feel glad you did?
What was the last online purchase that surprised you?
When did you last change your mind after a conversation?
When did you last spend longer choosing food than eating it?
When did you last try something outside your usual routine?
What was the last thing you confidently got wrong?
When did you last make time for a friend?
When did you last realise you were in the wrong queue?`),
problem:lines(`You find a wallet in a cafe. How would you try to return it?
You book a table for two but twelve friends want to come. What would you do?
A friend cancels a shared plan at the last minute. How would you respond?
Your online order contains twenty notebooks instead of two. What would you do?
Your group cannot agree on a weekend activity. How would you decide?
You accidentally send a voice message with loud singing to your work group. What would you say?
You are offered a new role but need to learn a skill. What would your first step be?
You bring a homemade cake that has completely fallen apart. How would you present it?
A visitor has only three hours in your town. What would you suggest?
You discover your camera was off during your best online presentation. How would you react?
A friend wants help practising English but feels nervous. What would you suggest?
You confidently give directions and then realise they are wrong. What would you do?`),
social:lines(`organises a successful trip
gets lost while explaining the route
makes a new member feel welcome
buys equipment before trying a hobby
finds a practical solution
turns a short story into a ten-minute performance
remembers everyone's preferences
packs for every possible weather condition
keeps a group project on schedule
starts laughing before reaching the funny part
tries something new first
forgets the password immediately after changing it`),
flag:lines(`A friend says clearly when they need time alone.
A friend creates a spreadsheet for a one-day picnic.
A teammate admits a mistake before anyone notices.
A friend rehearses how to order coffee.
A person asks whether you want advice before giving it.
A friend sends voice messages with dramatic sound effects.
A friend respects your decision not to join an activity.
A person treats a friendly quiz like a professional competition.
A colleague shares credit for a successful task.
A friend rates every sandwich they eat.
A person checks whether everyone understands the plan.
A friend gives their robot vacuum a job title.`),
challenge:lines(`ways to make a new member feel welcome
things people buy and never use
reasons a journey might be delayed
small problems that feel dramatic when you are hungry
qualities of a good teammate
things that disappear just before you leave home
ways to practise English outside class
harmless excuses for avoiding karaoke
things you should check before booking a hotel
signs someone is taking a board game too seriously
ways to reduce food waste
things that make an online meeting awkward
questions to ask a new colleague
things you should not trust an alarm clock to do
ways to spend a phone-free evening
reasons someone might take twenty photos of one meal
things you can learn from a hobby
objects that make surprisingly bad gifts
ways to make a long queue less boring
things that turn a five-minute task into an hour`),
experience:lines(`Have you ever changed your opinion after meeting someone?
Have you ever acted confident while completely lost?
Have you ever helped organise an event?
Have you ever laughed at a joke before understanding it?
Have you ever learned a skill from a friend?
Have you ever bought a kitchen tool you used only once?
Have you ever travelled without a detailed plan?
Have you ever rehearsed a conversation that never happened?
Have you ever made a friend through a hobby?
Have you ever searched for something you were already holding?
Have you ever fixed something instead of replacing it?
Have you ever clicked "Reply all" by mistake?`),
personal:lines(`a journey that changed your plans
a harmless misunderstanding
a skill you taught yourself
a purchase you regret
a time you helped a stranger
a cooking experiment
a useful lesson from a hobby
a time you looked confident but felt lost
a difficult decision that worked out
a surprising online delivery
a friendship that started unexpectedly
a plan that failed in a funny way`),
story:lines(`I agreed to help organise a small event, but nobody had chosen a place.
The package arrived with my name on it, but I had ordered only one spoon, not fifty.
On the train, I met someone who had done the job I wanted.
I practised my introduction all morning and then forgot my own job title.
Our group had one afternoon to show a visitor around town.
My friend and I were waiting for each other in two different cafes.
I found an old notebook containing a plan I had never started.
The recipe said it served four. My cake could feed twenty.
A cancelled train gave me an unexpected free afternoon.
I joined an online meeting and discovered I was using a cat filter.
The new person in our class offered a solution none of us had considered.
I won a small prize in a competition I did not remember entering.`),
finish:lines(`A habit that has helped me recently is ...
My most unnecessary strong opinion is ...
I changed my mind about ... when ...
I knew my plan was too complicated when ...
If I had a free afternoon, I would ...
One thing my phone knows about me is ...
A good friend should ...
I bought the equipment, but I never ...
I feel more confident when ...
My greatest success in the kitchen was ...
Something I learned the hard way is ...
It seemed like a five-minute job until ...`),
dare:lines(`Give a new club member three practical tips.
Sell a slightly bent spoon without making false claims.
Describe a familiar place without naming it.
Give a serious award speech for remembering your umbrella.
Tell a short story with a clear beginning and ending.
Explain why one missing sock deserves a search team.
Politely disagree with the idea that everyone should wake up at five.
Give a weather report for your mood this week.
Explain a skill you have in three clear steps.
Introduce the nearest chair as a famous guest.
Recommend a local activity and explain who would enjoy it.
Give a motivational speech to someone washing a mountain of dishes.`),
mission:lines(`Ask a follow-up question that begins with "What happened next?"
Find a hobby you and another person both enjoy.
Summarise someone's story in one sentence and check it.
Ask someone for an example of their opinion.
Explain a useful mistake without blaming yourself.
Invite a quieter person into a conversation politely.
Ask what helped someone learn a skill.
Recommend an activity and give a reason.
Use "although" to explain two sides of a preference.
Ask someone how their routine has changed.
Disagree politely with a minor opinion.
Ask someone what they would do differently next time.
Check a detail you did not understand.
Thank someone for a specific useful idea.
Ask what surprised someone on a journey.
Explain one realistic goal for the next month.
Ask a person to recommend a book or film.
Connect your experience to something another person said.
Find out why someone chose a hobby.
End a conversation politely and introduce someone else.`),
bingo:lines(`has learned a skill from a friend
has searched for a phone while holding it
has helped organise an event
has laughed before understanding a joke
has travelled without a fixed plan
has bought equipment for a hobby they never started
has changed an opinion after a conversation
has practised an imaginary conversation
has repaired something instead of replacing it
has mixed up two people's names
has made a friend through a hobby
has sent a message to the wrong group
has tried a phone-free evening
has taken too much luggage for a short trip
has cooked for a group
has followed a recipe with surprising results
has helped a visitor in their town
has waited in the wrong queue
has taught someone an English word
has fallen asleep during a film they chose
has kept a useful daily habit
has forgotten why they opened an app
has completed a personal challenge
has arrived too early because they read the time incorrectly`)
};
source.B2={
open:rows(`When should a group compromise rather than vote?|Compare the benefits and risks of both approaches.
Why do minor inconveniences sometimes feel like major events?|Use an everyday example rather than a general complaint.
Can a useful habit become too rigid?|Explain where you would draw the line.
What makes advice sound confident even when it is unhelpful?|Describe an example and how you would evaluate it.
Should employers judge results more than working hours?|Consider a role where this works and one where it may not.
Why do people defend purchases they regret?|Suggest an explanation and an alternative response.
What makes feedback constructive rather than discouraging?|Explain how timing and wording affect it.
Why can choosing a restaurant become harder with more people?|Suggest a fair decision method.
What responsibilities come with recommending something online?|Consider the audience and possible consequences.
When does careful preparation turn into avoiding the task?|Give a realistic sign that it is time to act.
How can a city encourage people to use public spaces?|Discuss one benefit and one limitation of your idea.
What does a friendly competition reveal about people?|Distinguish playful behaviour from a genuine problem.
Should every hobby involve measurable progress?|Compare enjoyment with improvement.
Why do we remember embarrassing moments that others forget?|Offer a possible explanation, not a diagnosis.
How should a group handle unequal contributions?|Balance fairness with individual circumstances.
Can being very organised make a holiday less enjoyable?|Explain which decisions you would leave open.
What makes a source trustworthy enough to share?|Give practical checks you would use.
When is a tiny convenience worth paying extra for?|Compare a reasonable example with an unnecessary one.
How should people balance availability with personal boundaries?|Give an example of a respectful agreement.
Why do simple instructions sometimes create complicated results?|Explain how you would improve one set of instructions.`),
choice:rows(`a predictable job with less freedom|a flexible job with more uncertainty
have all your shopping decisions reviewed by friends|have all your holiday plans reviewed by relatives
live in a walkable small town|live in a large city with more opportunities
have a robot organise your home too strictly|have a robot leave cheerful but useless reminders
receive direct feedback immediately|receive detailed feedback after time to reflect
be responsible for every group restaurant choice|be responsible for every group holiday playlist
have fewer high-quality possessions|have more inexpensive options
explain every online purchase to your past self|explain every unfinished hobby to your future self
use a convenient service that collects more data|use a slower service that collects less data
have your calendar reject unnecessary meetings|have your phone question unnecessary purchases
work in a small specialist team|work across several different teams
win a cooking contest with an ugly dish|lose with a beautiful dish everyone photographs`),
motion:lines(`Workplaces should evaluate outcomes rather than visible busyness.
Every meeting invitation should explain why an email is not enough.
Public transport should receive priority over additional city parking.
The person who creates a group chat should manage its unnecessary notifications.
Schools should teach people how to evaluate online claims.
Adults should be allowed to retire from hobbies they bought equipment for.
A four-day working week can improve productivity.
Holiday photos should include at least one honest picture of the queue.
Companies should make repair easier than replacement.
Reviews written while hungry should carry a warning.
A good service should offer a way to speak to a person.
The best part of a planned holiday is often the unplanned hour.`),
past:lines(`When did you last reconsider a decision after hearing another perspective?
When did a minor inconvenience last reveal how dependent you are on a device?
What was the last piece of feedback you acted on?
When did you last defend a purchase you knew was unnecessary?
When did you last balance two reasonable but competing priorities?
When did you last spend more effort optimising a task than doing it?
When did you last challenge an assumption in a group?
When did you last become unexpectedly competitive over something trivial?
What was the last source you checked before sharing a claim?
When did you last prepare a perfect plan that reality ignored?
When did you last set a boundary that improved a relationship?
When did you last misunderstand instructions that seemed obvious?`),
problem:lines(`A team deadline is approaching and contributions are uneven. How would you address it fairly?
Your friends create a thirty-question survey to choose dinner. How would you simplify the decision?
A service is convenient but requests unnecessary personal information. How would you evaluate it?
Your productivity app sends more reminders than you have tasks. What would you change?
A colleague gives useful feedback in a rude way. How would you respond?
You win a contest for a dish you cooked by accident. How would you explain the recipe?
Your group wants a cheap holiday, but one plan excludes a member. How would you handle it?
Your detailed travel schedule leaves no time to enjoy anything. How would you revise it?
A friend shares an exciting claim from an unreliable source. How would you discuss it respectfully?
An online review praises everything except the product. How would you decide whether it is useful?
A new rule improves efficiency but makes life harder for some users. How would you assess it?
Your office invents an award for attending the most meetings. What alternative award would you propose?`),
social:lines(`finds a compromise that both sides accept
builds a spreadsheet to avoid making one small decision
questions an assumption respectfully
becomes the unofficial referee of a board game
turns feedback into a useful change
has a backup plan for the backup plan
protects time for a meaningful hobby
writes a restaurant review longer than their work report
notices when a group decision excludes someone
researches a toaster as carefully as a house
checks a source before sharing a claim
turns an ordinary delay into a highly entertaining story`),
flag:lines(`A teammate challenges an idea but listens to the explanation.
A friend has a colour-coded plan for a relaxed afternoon.
A person changes their view when better evidence appears.
A friend writes detailed notes after every board game.
A manager explains why a decision was made.
A friend compares cafe chairs as if buying a house.
Someone asks permission before sharing a personal story.
A person gives every household task a project name.
A colleague admits the limits of their knowledge.
A friend rehearses spontaneous conversation topics.
A group organiser asks who might be excluded by a plan.
A friend has a formal complaint about the shape of their pasta.`),
challenge:lines(`ways to make feedback more constructive
signs a simple task is being overplanned
advantages of a walkable neighbourhood
things people research more carefully than necessary
ways to check an online claim
small luxuries people defend passionately
reasons a team might miss a deadline
unnecessary features for a basic toaster
ways to set a respectful boundary
signs a friendly game is becoming too serious
factors to consider before changing jobs
things a productivity app should not remind you about
ways to include quieter people in a discussion
minor problems that inspire long group-chat debates
benefits of repairing rather than replacing
things that do not need a committee
reasons direct feedback can be misunderstood
objects that attract surprisingly strong opinions
ways to reduce meeting time
things that turn a relaxing holiday into work`),
experience:lines(`Have you ever changed a decision because you questioned your own assumption?
Have you ever spent longer comparing products than using the one you bought?
Have you ever negotiated a compromise between friends?
Have you ever become too competitive in a friendly game?
Have you ever given feedback that improved a project?
Have you ever made a plan so detailed that it became unhelpful?
Have you ever stopped sharing something after checking its source?
Have you ever defended an unnecessary purchase with impressive logic?
Have you ever chosen convenience over a personal principle?
Have you ever organised your to-do list instead of doing a task?
Have you ever helped make an activity more inclusive?
Have you ever written a long complaint about a very small problem?`),
personal:lines(`a compromise that worked better than expected
a purchase you tried hard to justify
a decision made with incomplete information
a friendly competition that became too serious
a useful piece of difficult feedback
a carefully planned day that went off schedule
a moment you questioned a popular assumption
a surprisingly strong opinion about an ordinary object
a boundary you explained respectfully
a productivity method that created extra work
a project where different perspectives helped
a small inconvenience you described dramatically`),
story:lines(`Our team could finish on time only if we changed a process everyone was used to.
The app designed to save me time asked me to attend a daily planning meeting with myself.
Two friends wanted different holidays, but both had good reasons.
Our relaxed picnic now had a budget committee and a seating plan.
I was asked to review a service I had used only once.
The cheapest item on the menu had become the subject of a passionate debate.
A new group member noticed a problem the rest of us had overlooked.
I had written a detailed complaint before realising I had assembled the chair backwards.
The quickest solution would help most users but exclude a few.
My friend announced a six-stage method for choosing a sandwich.
We had to make a decision before all the information was available.
The winner of our friendly quiz requested a formal certificate.`),
finish:lines(`A useful rule becomes unreasonable when ...
The most overcomplicated way to choose dinner is ...
Convenience is worth the cost when ...
My imaginary award for daily life would recognise ...
A fair compromise should ...
The phrase "a quick meeting" makes me think ...
Before sharing an online claim, I ...
A purchase I could defend in a long speech is ...
Constructive criticism needs ...
My plan was perfect except for ...
A genuinely inclusive activity should ...
A small problem that deserves less attention is ...`),
dare:lines(`Argue for a four-day working week, then acknowledge one practical difficulty.
Give a balanced review of an ordinary spoon as if it were a major purchase.
Explain how to give useful feedback without embarrassing someone.
Propose rules for a group chat that has become too dramatic.
Describe a compromise that protects two different priorities.
Defend a comfortable chair against an unfair one-star review.
Explain a complicated idea without specialist vocabulary.
Give a formal apology on behalf of an unreliable alarm clock.
Summarise two sides of a discussion without choosing a winner.
Pitch an award for successfully cancelling an unnecessary meeting.
Suggest a fair way to choose a group activity.
Present three reasons a simple picnic does not need a committee.`),
mission:lines(`Ask someone what evidence would change their mind.
Summarise two contrasting opinions fairly.
Invite someone to explain a limitation of their idea.
Give feedback on an idea without judging its speaker.
Ask who might be excluded by a proposed solution.
Build on someone else's point with a concrete example.
Distinguish a personal preference from a general claim.
Ask a neutral question about a disagreement.
Offer a realistic compromise between two suggestions.
Explain a benefit and a drawback of your preference.
Ask someone to clarify an ambiguous word.
Acknowledge a strong point in an opinion you disagree with.
Politely redirect a discussion that has drifted away.
Ask about the practical consequences of an idea.
Check whether two speakers mean the same thing.
Give a short summary before offering your view.
Ask someone why their opinion has changed over time.
Use an example to make an abstract point concrete.
Suggest one small test of a proposed solution.
Invite a quieter participant to add a different perspective.`),
bingo:lines(`has negotiated a compromise between friends
has over-researched a small purchase
has changed their view after checking evidence
has become too competitive during a board game
has given feedback that improved a project
has made a holiday plan that was too detailed
has chosen a less convenient but more responsible option
has used an app that created more work than it saved
has helped make an activity more inclusive
has defended an unnecessary purchase
has set a boundary respectfully
has complained dramatically about a tiny inconvenience
has compared different sources before sharing a claim
has spent too long choosing a restaurant
has improved an inefficient process
has given a household object a name
has spoken up when a group overlooked someone
has created a spreadsheet for a personal decision
has admitted uncertainty during a discussion
has written a surprisingly long product review
has changed a plan after constructive criticism
has planned a supposedly spontaneous activity
has learned from a teammate with a different perspective
has treated a hobby like a serious research project`)
};
source.C1={
open:rows(`When does helpful advice become interference?|Define the boundary, then consider a reasonable exception.
Why can the appearance of productivity be more rewarding than productivity itself?|Distinguish personal habits from institutional incentives.
Can a transparent decision still be unfair?|Separate the process, the outcome and the information available.
What does our need to justify trivial purchases reveal about consistency?|Offer an interpretation and acknowledge its limits.
When should expertise outweigh a group's preference?|Compare a technical decision with a value-based decision.
Why do minor etiquette disputes sometimes become moral arguments?|Use a concrete case and avoid assuming motives.
How should uncertainty be communicated without undermining trust?|Compare useful qualification with evasiveness.
Can excessive preparation become a socially acceptable form of avoidance?|Explain how you would tell the difference.
What makes a compromise principled rather than merely convenient?|Consider what each side gives up and why.
Why might people defend a procedure after forgetting its purpose?|Propose a plausible explanation and a practical response.
Who should bear the cost of making a service accessible?|Balance responsibility, feasibility and the needs of users.
When does a personal preference get presented as common sense?|Give an everyday example and examine the hidden assumption.
Can incentives improve behaviour while weakening motivation?|Discuss a context where both effects might occur.
What makes a harmless complaint surprisingly persuasive?|Consider framing, exaggeration and the listener's expectations.
How should a public apology balance accountability and explanation?|Distinguish context from an excuse.
Why can small group decisions consume more effort than important ones?|Compare the stakes with the social dynamics.
When is consistency less valuable than changing course?|Explain how new evidence should affect commitment.
Can humour make criticism easier to accept while also making it less clear?|Discuss a useful case and a risky one.
What distinguishes an informed judgement from a polished guess?|Consider evidence, reasoning and appropriate confidence.
Why do people sometimes prefer a complicated explanation to a simple one?|Evaluate the appeal without assuming it is always irrational.`),
choice:rows(`a transparent decision process with an outcome you dislike|an opaque process with an outcome you prefer
have every minor complaint politely fact-checked|have every unnecessary purchase receive a formal peer review
optimise a service for the average user|accept lower average efficiency to accommodate more users
let a committee name your pet|let your pet's habits determine your job title
be consistently reliable within a narrow role|be highly adaptable with a less predictable record
publish the assumptions behind your shopping list|publish the reasoning behind your holiday packing
receive a clear recommendation with acknowledged uncertainty|receive several qualified options without a recommendation
have your calendar demand evidence for every meeting|have your fridge ask you to justify every snack
preserve a fair procedure despite an unpopular outcome|adapt the procedure to respond to an exceptional case
defend an ugly but excellent cake before a panel|defend a beautiful but disappointing cake before hungry friends
reward individual excellence|reward contributions that improve the whole team
have an editor remove exaggeration from your complaints|have a statistician assess your claims about always being late`),
motion:lines(`Decision-makers should state what evidence would make them reverse a policy.
Unnecessary meetings should have to justify their continued existence annually.
A fair process matters even when it produces an unpopular result.
Consumer reviews should distinguish a defective product from an unrealistic expectation.
Public services should prioritise accessibility even at some cost to average efficiency.
The phrase "common sense" should trigger a request for an explanation.
Institutions should reward the prevention of problems, not only visible problem-solving.
A complicated personal productivity system should demonstrate that it saves time.
Acknowledging uncertainty strengthens trustworthy communication.
A group holiday planner deserves thanks, not an endless appeals process.
A sincere apology should identify a change in behaviour, not merely express regret.
Strong opinions about trivial matters are acceptable until they become rules for everyone.`),
past:lines(`When did you last distinguish a convincing presentation from a well-supported argument?
When did a small disagreement last expose an assumption nobody had stated?
When did you last revise a position without abandoning its underlying principle?
When did you last notice yourself defending a process that no longer served its purpose?
When did you last communicate uncertainty while still making a recommendation?
When did you last turn a minor inconvenience into a persuasive but exaggerated complaint?
When did you last question whether a fair procedure produced a fair outcome?
When did you last use an impressive explanation for a very ordinary preference?
When did you last balance efficiency against the needs of an overlooked person?
When did you last spend effort demonstrating organisation rather than achieving a result?
When did you last acknowledge a strong argument against your own view?
When did you last realise that "everyone knows" actually meant "I assume"?`),
problem:lines(`A widely supported decision disadvantages a small group. How would you assess whether revising it is justified?
A committee has created rules for a casual lunch. How would you challenge the process without dismissing its members?
You must recommend an option while important evidence remains uncertain. How would you communicate your judgement?
A friend has written a manifesto defending an unnecessary appliance. How would you separate genuine benefits from rationalisation?
A service is efficient for most users but inaccessible to some. How would you allocate responsibility for improvement?
Your team measures productivity by the number of planning documents. How would you propose a better measure tactfully?
An apology offers a detailed explanation but no commitment to change. How would you evaluate it fairly?
A one-star review blames an umbrella for not stopping sideways rain. How would you respond on behalf of the shop?
A group confuses a technical disagreement with a disagreement about values. How would you clarify the discussion?
Two friends both call their preferred pizza topping "objectively correct". How would you expose the assumption without spoiling the fun?
A successful policy has benefits now but uncertain long-term costs. How would you frame a responsible review?
Your club proposes a formal appeals process for quiz answers. How would you distinguish fairness from overengineering?`),
social:lines(`distinguishes disagreement about facts from disagreement about values
writes a formal defence of an ordinary kitchen purchase
changes course while explaining the principle that remains constant
requests a transparent process for choosing pizza toppings
communicates uncertainty without avoiding a recommendation
turns a delayed coffee into a compelling speech about civilisation
spots an assumption hidden inside a confident claim
creates a review process for a supposedly spontaneous outing
helps a group weigh efficiency against inclusion
asks whether a board-game rule still serves its original purpose
presents an opposing position fairly before responding
explains a missing sock using an unnecessarily sophisticated theory`),
flag:lines(`A leader explains both the evidence and the uncertainty behind a recommendation.
A friend asks for a written justification of the restaurant choice.
Someone corrects a misleading claim even when it supports their own position.
A person gives a household routine an elaborate management framework.
A colleague distinguishes what they know from what they infer.
A friend asks whether your snack choice reflects your stated values.
A group revisits a rule when its effects differ from its purpose.
Someone conducts a detailed post-event review of a casual picnic.
A speaker acknowledges a strong objection rather than changing the subject.
A friend presents their preferred pillow as an ethical commitment.
A person asks how a decision affects those who were not consulted.
Someone writes a formal farewell to an unreliable toaster.`),
challenge:lines(`ways to qualify a claim without making it meaningless
ordinary decisions that rarely need a formal review process
reasons a transparent process might still be unfair
signs that a preference is being presented as a universal truth
ways to distinguish an explanation from an excuse
trivial matters that inspire disproportionate confidence
questions that reveal an unstated assumption
household tasks that do not need performance indicators
ways to acknowledge a strong counterargument
products people defend more passionately than necessary
factors that make a compromise principled
phrases that make a minor complaint sound official
ways to communicate the limits of evidence
signs a hobby has acquired too much administration
reasons short-term efficiency can create long-term costs
minor inconveniences that attract grand theories
ways to evaluate whether a rule still serves its purpose
things that become less relaxing when measured constantly
questions to separate factual and value disagreements
objects that deserve fewer online comparison videos`),
experience:lines(`Have you ever supported a decision you disliked because you trusted the process?
Have you ever constructed an elaborate justification for a trivial preference?
Have you ever changed course while keeping the same underlying principle?
Have you ever realised that organising a task had become a way to avoid it?
Have you ever challenged a claim that supported your own position?
Have you ever seen a casual event develop unnecessary bureaucracy?
Have you ever made a recommendation while openly acknowledging uncertainty?
Have you ever used humour to soften criticism and accidentally obscured the point?
Have you ever helped distinguish a disagreement about values from one about facts?
Have you ever defended a purchase more enthusiastically after regretting it?
Have you ever reconsidered who should bear the cost of a convenient service?
Have you ever turned an ordinary household failure into a grand theory?`),
personal:lines(`a judgement you revised after recognising an unstated assumption
an elaborate justification for a trivial decision
a principled compromise
a process that became more important than its purpose
a recommendation made under uncertainty
a small disagreement that acquired unnecessary formality
a moment you questioned a convenient conclusion
a confident explanation that turned out to be guesswork
a decision that balanced efficiency with inclusion
a harmless complaint made with excessive seriousness
a strong objection that improved your own argument
a personal routine that developed its own bureaucracy`),
story:lines(`The decision had been made transparently, yet those most affected had never been consulted.
Our informal lunch group now required three approvals to change the restaurant.
The recommendation was sensible, but the confidence with which it was presented exceeded the evidence.
My review of a disappointing sandwich had somehow become a debate about personal responsibility.
We discovered that the rule everyone defended had been introduced for a problem that no longer existed.
The app congratulated me on spending an hour designing a five-minute routine.
Two colleagues appeared to disagree about the facts, but their real disagreement concerned priorities.
A friendly quiz required a mediator after someone proposed a constitutional amendment.
The most efficient option saved time by transferring the difficult work to someone else.
I realised that my argument for buying a third coffee maker was more polished than my work presentation.
An apology changed the atmosphere only after it included a specific commitment.
Our supposedly spontaneous weekend developed a version-controlled itinerary.`),
finish:lines(`A claim deserves confidence in proportion to ...
The unnecessary committee I would abolish is ...
A transparent process still needs ...
My most sophisticated excuse for a simple preference is ...
A principled compromise differs from surrender because ...
The phrase "just a quick question" sometimes conceals ...
An apology becomes credible when ...
A household object I could overanalyse is ...
When evidence is incomplete, a responsible recommendation ...
My personal bureaucracy begins when ...
A rule should be reconsidered if ...
A minor inconvenience sounds historic when ...`),
dare:lines(`Make a qualified recommendation, stating one uncertainty and what would change your view.
Deliver a measured public apology on behalf of a toaster that burns only one side.
Present the strongest reasonable objection to a view you hold, then respond fairly.
Evaluate a missing sock as if reviewing an institution, without blaming anyone.
Explain the difference between an efficient process and a fair one using a simple example.
Defend the right to enjoy an unproductive hobby before an imaginary efficiency committee.
Reframe an emotionally worded complaint as a specific, actionable request.
Give a balanced closing statement in a dispute about the correct pizza topping.
Distinguish a factual disagreement from a value disagreement in an everyday example.
Argue for retiring a household rule whose original purpose nobody remembers.
Summarise a trade-off without suggesting there is a perfect solution.
Review an overcomplicated picnic plan and propose a proportionate alternative.`),
mission:lines(`Ask a speaker to distinguish evidence from interpretation.
Identify a hidden assumption as a question, not an accusation.
Offer the strongest reasonable version of an opposing view.
Ask what would justify an exception to a proposed rule.
Summarise the values underlying two conflicting preferences.
State an uncertainty while still making a clear recommendation.
Ask who bears the costs of a convenient solution.
Reframe an absolute claim as a testable, qualified one.
Distinguish disagreement about means from disagreement about ends.
Acknowledge a counterargument and revise one part of your position.
Ask whether a procedure still serves its stated purpose.
Clarify the difference between an explanation and a justification.
Identify a short-term benefit and a possible long-term cost.
Ask a neutral question about an emotionally worded claim.
Suggest a proportionate response to a minor problem.
Use a concrete example to test a general principle.
Invite someone to explain a perspective that has been overlooked.
Point out a limitation of your own example.
Summarise an unresolved trade-off without forcing agreement.
Close a discussion by stating what is agreed and what remains uncertain.`),
bingo:lines(`has revised a judgement after identifying an unstated assumption
has overengineered a simple personal routine
has supported a process despite disliking its outcome
has given a grand explanation for a trivial preference
has communicated uncertainty while making a recommendation
has watched a casual event acquire unnecessary bureaucracy
has challenged a convenient but weak argument
has written an unusually formal complaint about a small problem
has distinguished a factual disagreement from a value disagreement
has justified a regretted purchase with impressive confidence
has reconsidered who bears the cost of a decision
has treated a minor group decision like a major negotiation
has changed course without abandoning a core principle
has spent more time planning a hobby than enjoying it
has helped make an efficient process more inclusive
has defended a board-game rule after forgetting its purpose
has acknowledged a strong counterargument publicly
has described a household failure in unnecessarily technical language
has turned an apology into a specific commitment to change
has given an ordinary object an important-sounding title
has qualified a claim after checking its evidence
has proposed rules for a supposedly spontaneous activity
has accepted that a trade-off has no perfect solution
has used humour to soften a criticism that was then misunderstood`)
};
window.ESCCefrSource={levels,source,lines,rows};
})();
