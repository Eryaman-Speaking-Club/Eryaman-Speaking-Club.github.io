/* Additional interpersonal, experience and reflection cards. Each row is an
   authored task. Personal answers are optional; imagined examples are welcome. */
(function(){
'use strict';
const B=window.ESCCefrBank,H=window.ESCCefr50,{rows,add,cat}=H;
const past={
A1:rows(`Everyday|Your last breakfast: eggs, bread or something else?
Everyday|Your last cold drink: what was it?
Everyday|Your last dinner: at home or outside?
Everyday|Your last shopping bag: what was in it?
Everyday|Your last morning at home: quiet or busy?
Everyday|Your last kitchen job: cooking or cleaning?
Everyday|Your last ticket: for a bus, train or event?
Everyday|Your last day off: at home or in another place?
Funny|Your last big laugh: with whom?
Funny|Your last silly photo: what was in it?
Funny|Your last lost sock: what colour was it?
Funny|Your last song in the shower: what song?
Funny|Your last bad drawing: what was it?
Funny|Your last very big meal: what food?
Funny|Your last funny animal video: what animal?
Funny|Your last small surprise: what was it?
Personal|Your last happy day: where were you?
Personal|Your last good idea: what was it?
Personal|Your last time helping someone: who?
Personal|Your last new English word: what word?
Personal|Your last quiet hour: where were you?
Personal|Your last good book: why did you like it?
Personal|Your last walk alone: where did you go?
Personal|Your last nice gift: who gave it to you?
Spicy|Your last film with someone you like: what film?
Spicy|Your last kind message: who sent it?
Spicy|Your last gift of flowers: what colour were they?
Spicy|Your last date, real or imagined: at a cafe or in a park?
Spicy|Your last nice compliment: what did the person say?
Spicy|Your last song for someone special: what song?`),
A2:rows(`Everyday|What did you last put on your shopping list?
Everyday|When did you last have a quiet breakfast?
Everyday|What was the last thing you washed by hand?
Everyday|When did you last borrow a book?
Everyday|What did you last prepare for the next day?
Everyday|When did you last take a different route home?
Everyday|What was the last drink you made for someone?
Everyday|When did you last eat outside in good weather?
Funny|When did you last say the wrong word and laugh?
Funny|What was the last funny video someone sent you?
Funny|When did you last forget the name of a food?
Funny|What was the last thing that fell out of your bag?
Funny|When did you last hear someone sing badly but happily?
Funny|What was the last game you took too seriously?
Funny|When did you last get a simple instruction wrong?
Funny|What was the last surprising thing you found while cleaning?
Personal|When did you last feel pleased with your English?
Personal|What was the last activity that helped you rest?
Personal|When did you last finish something you had delayed?
Personal|What was the last thing you learned from a family member?
Personal|When did you last try to change a daily habit?
Personal|What was the last small problem you solved yourself?
Personal|When did you last feel brave about trying something?
Personal|What was the last good choice you made for yourself?
Spicy|When did you last watch a romantic film? You can choose an imagined example.
Spicy|What was the last thoughtful compliment you heard?
Spicy|When did you last help a friend choose a gift for a date?
Spicy|What was the last place you thought would be good for a date?
Spicy|When did you last hear a nice story about how two people met?
Spicy|What was the last kind message that made someone smile?`),
B1:rows(`Everyday|When did you last improve an ordinary part of your morning?
Everyday|What was the last thing you repaired rather than replaced?
Everyday|When did you last use a local service for the first time?
Everyday|What was the last household task you shared with someone?
Everyday|When did you last manage without a device you usually use?
Everyday|What was the last meal you made from things already at home?
Everyday|When did you last find a better way to travel somewhere familiar?
Everyday|What was the last useful recommendation you passed on?
Funny|When did you last tell a story and forget the important part?
Funny|What was the last serious conversation interrupted by something funny?
Funny|When did you last confuse two words with very different meanings?
Funny|What was the last harmless excuse you heard that sounded unbelievable?
Funny|When did you last make a task more dramatic than necessary?
Funny|What was the last ordinary object that caused a surprisingly strong opinion?
Funny|When did you last laugh at a plan that had seemed perfect?
Funny|What was the last funny thing someone noticed about your routine?
Personal|When did you last realise you had improved at a skill?
Personal|What was the last goal you made smaller so you could start it?
Personal|When did you last ask someone to teach you something?
Personal|What was the last time you enjoyed doing something slowly?
Personal|When did you last choose rest without feeling you needed an excuse?
Personal|What was the last useful lesson from something you stopped doing?
Personal|When did you last recognise a strength you usually overlook?
Personal|What was the last moment that changed your idea of a good day?
Spicy|What was the last romantic gesture in a film that you found thoughtful?
Spicy|When did you last hear useful advice about a first date?
Spicy|What was the last conversation you heard about partners having different hobbies?
Spicy|When did a story about how a couple met last surprise you?
Spicy|What was the last gift idea you thought would suit a particular person well?
Spicy|When did you last see a fictional couple solve a disagreement well?`),
B2:rows(`Everyday|When did you last compare a service's price with the time it saved?
Everyday|What was the last routine you adapted to a change in circumstances?
Everyday|When did you last decide that a useful feature was not worth its complexity?
Everyday|What was the last everyday choice where reliability mattered more than appearance?
Everyday|When did you last find that a cheaper option involved more effort?
Everyday|What was the last practical instruction you rewrote for someone else?
Everyday|When did you last replace a complicated plan with a simple agreement?
Everyday|What was the last local improvement you noticed and appreciated?
Funny|When did you last notice a small problem receiving an absurd amount of attention?
Funny|What was the last confident prediction about dinner that went wrong?
Funny|When did you last hear a review that said more about the reviewer than the product?
Funny|What was the last ordinary task described as though it were a major achievement?
Funny|When did you last become the unexpected expert on a trivial subject?
Funny|What was the last situation in which a joke helped people relax?
Funny|When did you last recognise your own habits in a harmless parody?
Funny|What was the last group decision that would have benefited from a time limit?
Personal|When did you last revise a goal without abandoning what mattered about it?
Personal|What was the last achievement you valued without telling many people?
Personal|When did you last accept useful criticism despite disliking its delivery?
Personal|What was the last decision where you consciously accepted an imperfection?
Personal|When did you last distinguish an obligation from a habit of saying yes?
Personal|What was the last situation where patience changed your interpretation?
Personal|When did you last notice that your priorities had changed?
Personal|What was the last exception that made you reconsider a personal rule?
Spicy|What was the last fictional relationship that challenged your assumptions about compatibility?
Spicy|When did you last hear a fair discussion of different expectations between partners?
Spicy|What was the last romantic surprise you thought might not suit its recipient?
Spicy|When did you last see privacy wrongly confused with secrecy in a story?
Spicy|What was the last example of a couple balancing shared and separate interests?
Spicy|When did a discussion about a thoughtful gift last change your view of generosity?`),
C1:rows(`Everyday|When did you last notice that a convenient arrangement shifted effort onto somebody less visible?
Everyday|What was the last routine whose emotional value differed from its practical purpose?
Everyday|When did you last question whether more information would actually improve an ordinary decision?
Everyday|What was the last claim of good value that depended on an unstated assumption?
Everyday|When did you last distinguish a clear procedure from a genuinely usable service?
Everyday|What was the last modest improvement whose importance was easy to underestimate?
Everyday|When did you last notice that a familiar solution was being preferred mainly because it was familiar?
Everyday|What was the last everyday decision where reversibility mattered?
Funny|When did you last hear an elaborate defence of something that was simply a personal preference?
Funny|What was the last minor inconvenience presented as evidence of a much larger social problem?
Funny|When did you last see unnecessary formality make a friendly activity less enjoyable?
Funny|What was the last joke whose exaggeration depended on a recognisable truth?
Funny|When did you last notice that your explanation for a purchase was improving faster than the purchase's usefulness?
Funny|What was the last harmless rule that sounded important until somebody asked why it existed?
Funny|When did you last hear an apology for a tiny mistake that was impressively disproportionate?
Funny|What was the last light-hearted disagreement that exposed genuinely different expectations?
Personal|When did you last separate a principle you wanted to preserve from a method you could change?
Personal|What was the last judgement you qualified because your example was not representative?
Personal|When did you last accept that a responsible decision still involved an unavoidable loss?
Personal|What was the last piece of recognition that failed to capture what you valued about your work?
Personal|When did you last recognise the limits of a useful personal story?
Personal|What was the last occasion on which changing course required more commitment than continuing?
Personal|When did you last distinguish an informed preference from an inherited expectation?
Personal|What was the last disagreement that helped you express your own position more accurately?
Spicy|What was the last fictional couple whose disagreement involved two individually reasonable expectations?
Spicy|When did a discussion of romantic gestures last raise a question about the freedom to decline?
Spicy|What was the last example you encountered of an old relationship agreement needing review?
Spicy|When did you last hear a useful distinction between reassurance and control in a discussion of dating?
Spicy|What was the last relationship story in which context changed the apparent fairness of a decision?
Spicy|When did you last notice a romantic storyline treating compatibility as something simpler than it is?`)
};
for(const l of B.levels)add('last-thing-you-did',l,past[l].map(([c,q])=>({c,q})));
const experiences={
A1:rows(`Funny|Do you sometimes look for a pen in the wrong bag?
Funny|Do you laugh at your own jokes?
Funny|Do you like very big birthday cakes?
Funny|Do you say hello to animals?
Funny|Do you sometimes forget the day of the week?
Funny|Do you make funny faces in photos?
Travel|Do you like long train trips?
Travel|Do you visit your family by bus?
Travel|Do you take food on a trip?
Travel|Do you like a seat by the window?
Travel|Do you use a map in a new town?
Travel|Do you visit parks when you travel?
Work|Do you study or work in the morning?
Work|Do you take lunch to work or class?
Work|Do you use a notebook at work or school?
Work|Do you ask questions in class?
Work|Do you help people at work or school?
Work|Do you take a walk during a break?
Social|Do you invite friends to your home?
Social|Do you play games with your family?
Social|Do you share food with friends?
Social|Do you say hello to your neighbours?
Social|Do you enjoy meeting new people?
Social|Do you help friends learn English words?
Spicy|Do you like romantic films?
Spicy|Do you think a walk is a nice date?
Spicy|Do you like giving small gifts?
Spicy|Do you like kind messages in the morning?
Spicy|Do you like surprises from someone special?
Spicy|Do you think flowers are a nice gift?`),
A2:rows(`Funny|Did you ever call someone by the wrong name?
Funny|Did you ever find something in a strange place at home?
Funny|Did you ever laugh so much that you could not finish a sentence?
Funny|Did you ever take a photo with your finger over the camera?
Funny|Did you ever buy food because the picture looked funny?
Funny|Did you ever forget the words of a song you knew well?
Travel|Did you ever take food on a long train trip?
Travel|Did you ever visit a town just for one day?
Travel|Did you ever change seats to sit with a friend?
Travel|Did you ever use a paper map on a trip?
Travel|Did you ever learn a local word while travelling?
Travel|Did you ever take a trip without a suitcase?
Work|Did you ever bring lunch for a classmate or colleague?
Work|Did you ever ask someone to explain a task again?
Work|Did you ever join a class where you knew nobody?
Work|Did you ever help someone on their first day?
Work|Did you ever practise a presentation with a friend?
Work|Did you ever learn a useful skill during a break?
Social|Did you ever invite a new neighbour for tea?
Social|Did you ever introduce two friends to each other?
Social|Did you ever organise a small picnic?
Social|Did you ever make a friend while waiting somewhere?
Social|Did you ever learn a game from another person?
Social|Did you ever send a message just to say thank you?
Spicy|Did you ever recommend a place for a first date?
Spicy|Did you ever help a friend choose flowers?
Spicy|Did you ever enjoy a romantic film you expected to dislike?
Spicy|Did you ever make a small gift by hand?
Spicy|Did you ever hear a funny story about a first date?
Spicy|Did you ever plan a nice surprise for someone special?`),
B1:rows(`Funny|Have you ever confidently explained a rule and then discovered you remembered it wrong?
Funny|Have you ever spent longer naming a group than planning its activity?
Funny|Have you ever dressed too formally for an ordinary event?
Funny|Have you ever taken a very serious photo of a very ordinary meal?
Funny|Have you ever given an object a name because it kept causing problems?
Funny|Have you ever prepared a funny reply and then lost the chance to use it?
Travel|Have you ever returned to a place because of a person you met there?
Travel|Have you ever chosen a longer route for a better view?
Travel|Have you ever learned something useful from a travel delay?
Travel|Have you ever visited a familiar town with a new visitor?
Travel|Have you ever changed accommodation after seeing the room?
Travel|Have you ever enjoyed a holiday more after cancelling an activity?
Work|Have you ever helped someone understand confusing instructions?
Work|Have you ever discovered a faster way to do a shared task?
Work|Have you ever taken responsibility for a small team activity?
Work|Have you ever asked for a clearer deadline?
Work|Have you ever practised a difficult conversation before work or class?
Work|Have you ever learned more from a classmate than from the lesson?
Social|Have you ever made a group plan simpler so more people could join?
Social|Have you ever invited someone quiet to speak and received a surprising answer?
Social|Have you ever reconnected with an old friend through a shared memory?
Social|Have you ever changed the subject to make a conversation more comfortable?
Social|Have you ever realised that listening was more useful than advice?
Social|Have you ever become interested in a hobby because of a friend's enthusiasm?
Spicy|Have you ever changed your opinion about a fictional couple after a discussion?
Spicy|Have you ever thought a simple date idea was better than an expensive one?
Spicy|Have you ever helped someone write a polite message declining a date?
Spicy|Have you ever heard a story about a romantic surprise that went wrong?
Spicy|Have you ever learned something useful from a discussion of relationship expectations?
Spicy|Have you ever noticed that two people showed affection in different ways?`),
B2:rows(`Funny|Have you ever treated a harmless personal preference as if you had to defend it in court?
Funny|Have you ever noticed that the planning meeting took longer than the activity?
Funny|Have you ever written a review whose enthusiasm surprised you later?
Funny|Have you ever realised that your backup plans were causing most of your stress?
Funny|Have you ever turned a household chore into a friendly competition?
Funny|Have you ever found humour in instructions that were technically correct but practically useless?
Travel|Have you ever changed a trip to make it more comfortable for another person?
Travel|Have you ever questioned whether a popular attraction suited your own interests?
Travel|Have you ever paid more for a journey because the cheaper option had hidden costs?
Travel|Have you ever balanced the wishes of visitors with the needs of residents?
Travel|Have you ever returned from a trip with a more complicated view of the place?
Travel|Have you ever revised a travel plan after considering access needs?
Work|Have you ever helped replace a complicated process with a simpler one?
Work|Have you ever questioned a deadline without refusing responsibility?
Work|Have you ever acknowledged a colleague's useful but invisible contribution?
Work|Have you ever distinguished a misunderstanding from poor performance?
Work|Have you ever suggested a small experiment instead of a large permanent change?
Work|Have you ever improved feedback by changing when it was given?
Social|Have you ever summarised both sides of a disagreement before giving your opinion?
Social|Have you ever noticed that a group was agreeing mainly to avoid more discussion?
Social|Have you ever reconsidered a helpful gesture after hearing how it was received?
Social|Have you ever made space for someone without putting them under pressure to speak?
Social|Have you ever discussed unequal effort in a friendship?
Social|Have you ever apologised for your delivery without pretending your concern was unimportant?
Spicy|Have you ever discussed whether a romantic gesture suited the recipient rather than the giver?
Spicy|Have you ever heard a useful distinction between privacy and secrecy in a relationship?
Spicy|Have you ever noticed a couple negotiate different routines successfully?
Spicy|Have you ever changed your view of compatibility after hearing someone else's experience?
Spicy|Have you ever seen a fictional relationship improve after clearer expectations?
Spicy|Have you ever thought a relationship disagreement had more than one reasonable solution?`),
C1:rows(`Funny|Have you ever realised that an elaborate explanation was protecting a very ordinary preference?
Funny|Have you ever seen a friendly activity acquire a procedure nobody could justify?
Funny|Have you ever heard a miniature household failure presented as a theory of society?
Funny|Have you ever noticed that an attempt to measure relaxation made it less relaxing?
Funny|Have you ever used a deliberately formal tone to expose how trivial a disagreement was?
Funny|Have you ever revised a dramatic complaint after considering what had actually been promised?
Travel|Have you ever reconsidered who benefits from a tourism policy and who bears its costs?
Travel|Have you ever distinguished a memorable encounter from a representative view of a country?
Travel|Have you ever questioned a travel recommendation because its assumptions did not apply to you?
Travel|Have you ever accepted a less convenient itinerary to preserve someone else's meaningful choice?
Travel|Have you ever revised your interpretation of a place after learning more about its residents?
Travel|Have you ever questioned whether a carefully documented trip was actually being enjoyed?
Work|Have you ever identified a conflict between a team's measure of success and its real purpose?
Work|Have you ever explained why a reasonable exception did not amount to favouritism?
Work|Have you ever recommended action while clearly stating the limits of the available evidence?
Work|Have you ever argued that preventing a problem deserved recognition despite the lack of a visible crisis?
Work|Have you ever helped distinguish disagreement about goals from disagreement about methods?
Work|Have you ever challenged a familiar procedure without dismissing the people who created it?
Social|Have you ever noticed that apparent consensus depended on some people staying silent?
Social|Have you ever expressed an opposing view in a way its supporters recognised as fair?
Social|Have you ever distinguished a person's intention from the effect of their actions during a disagreement?
Social|Have you ever helped make a discussion proportionate to the stakes involved?
Social|Have you ever revised a general principle after considering a relevant exception?
Social|Have you ever explained why equal effort and fair effort were not the same in a shared arrangement?
Spicy|Have you ever discussed whether two reasonable relationship expectations could still be incompatible?
Spicy|Have you ever seen a romantic storyline overlook the recipient's ability to decline a gesture?
Spicy|Have you ever heard a useful argument for reviewing an old agreement between partners?
Spicy|Have you ever distinguished emotional reassurance from an expectation of constant availability?
Spicy|Have you ever noticed a relationship story blaming one person for a genuinely shared trade-off?
Spicy|Have you ever questioned whether a couple's public image was helping or limiting honest communication?`)
};
for(const l of B.levels)add('never-have-i-ever',l,experiences[l]);
const flags={
A1:rows(`Dating|Your date asks what food you like.
Dating|Your date looks at their phone all the time.
Dating|Your date says sorry for being late.
Dating|Your date chooses your drink without asking.
Dating|Your date listens to your answer.
Dating|Your date is rude to a waiter.
Friendship|A friend helps you carry a heavy bag.
Friendship|A friend calls only when they need money.
Friendship|A friend remembers you do not like loud music.
Friendship|A friend says you must like the same films.
Friendship|A friend brings you a book you asked for.
Friendship|A friend never asks how you are.
Work|A teacher speaks slowly when you ask.
Work|A colleague takes your food without asking.
Work|A classmate shares their notes with you.
Work|A colleague leaves all the cleaning to you.
Work|A teacher says mistakes are okay.
Work|A classmate laughs at a new student's name.
Personality|Someone is kind when they lose a game.
Personality|Someone always says they are right.
Personality|Someone says they do not know an answer.
Personality|Someone never lets other people choose.
Personality|Someone asks before opening a window.
Personality|Someone is nice only when they want help.
Everyday|A person holds a door for someone with bags.
Everyday|A person leaves rubbish on a park bench.
Everyday|A visitor takes their dirty shoes off at the door.
Everyday|A person plays loud music on a quiet bus.
Everyday|A person gives a seat to someone who needs it.
Everyday|A person leaves a shopping basket in the doorway.`),
A2:rows(`Dating|Your date checks that the meeting place is easy for you to reach.
Dating|Your date talks only about themselves.
Dating|Your date asks before sharing a photo of you.
Dating|Your date gets angry when you do not answer immediately.
Dating|Your date is honest about not liking an activity.
Dating|Your date makes fun of the way you speak.
Friendship|A friend suggests a cheaper plan when you need to save money.
Friendship|A friend invites more people to your home without asking.
Friendship|A friend returns something they borrowed on time.
Friendship|A friend tells everyone a story you wanted to keep private.
Friendship|A friend checks the time before calling late at night.
Friendship|A friend expects you to organise every meeting.
Work|A colleague explains where new people can find information.
Work|A classmate takes credit for your answer.
Work|A teacher gives you time to finish a sentence.
Work|A colleague changes a meeting time without telling you.
Work|A teammate asks what help you need.
Work|A classmate interrupts whenever you ask a question.
Personality|Someone can laugh at a harmless mistake they made.
Personality|Someone turns every game into an argument.
Personality|Someone says clearly when they are tired.
Personality|Someone says yes to everything and then complains.
Personality|Someone listens to a different opinion.
Personality|Someone judges a place before visiting it.
Everyday|A neighbour tells you before doing noisy work.
Everyday|A customer shouts at a cashier for a small delay.
Everyday|A visitor helps put away the cups after tea.
Everyday|A bus passenger uses two seats for their bags on a full bus.
Everyday|A shop explains the price before you buy.
Everyday|A person blocks a queue to finish a phone call.`),
B1:rows(`Dating|Your date suggests a plan but is comfortable changing it together.
Dating|Your date treats a different hobby as a personal fault.
Dating|Your date accepts a polite no without demanding an explanation.
Dating|Your date expects you to cancel other friendships for them.
Dating|Your date talks about expectations without pretending you already agree.
Dating|Your date posts a personal story about you without checking.
Friendship|A friend tells you honestly when a plan is too expensive.
Friendship|A friend asks for advice but gets annoyed if it differs from their view.
Friendship|A friend makes room for your changing responsibilities.
Friendship|A friend keeps bringing up old mistakes during small disagreements.
Friendship|A friend asks how you want to celebrate rather than guessing.
Friendship|A friend assumes you are available because you work from home.
Work|A teammate tells you early when they cannot meet a deadline.
Work|A colleague presents your shared idea as their own.
Work|A manager explains a change before asking people to follow it.
Work|A teacher answers a simple question by calling it obvious.
Work|A classmate notices when someone has not had a turn.
Work|A teammate agrees to work but waits until the last minute to say they cannot.
Personality|Someone changes their opinion after hearing a useful example.
Personality|Someone gives advice about a situation they have not listened to.
Personality|Someone can enjoy an activity without being the best at it.
Personality|Someone uses jokes to avoid every serious conversation.
Personality|Someone asks for clarification instead of guessing your meaning.
Personality|Someone describes everyone who disagrees with them as difficult.
Everyday|A neighbour offers help but accepts that you may not need it.
Everyday|A service makes its cancellation conditions hard to find.
Everyday|A shop admits that a cheaper product would suit you better.
Everyday|A visitor changes your home arrangements without permission.
Everyday|A group checks access details before choosing a venue.
Everyday|A customer writes a review of a product they have never used.`),
B2:rows(`Dating|A partner explains a need for time alone without presenting it as punishment.
Dating|A partner treats every request for privacy as evidence of dishonesty.
Dating|A date responds thoughtfully when you explain a limit.
Dating|A date uses an expensive gift to create an expectation you did not agree to.
Dating|Partners discuss how different incomes affect shared spending.
Dating|A partner expects instant replies while reserving unlimited time for their own replies.
Friendship|A friend checks whether you want help, advice or simply someone to listen.
Friendship|A friend presents their preference as the only reasonable way to live.
Friendship|Friends review an arrangement when one person's circumstances change.
Friendship|A friend treats disagreement about one topic as rejection of the whole friendship.
Friendship|A friend acknowledges the effort involved in organising a group plan.
Friendship|A friend keeps asking for exceptions to a boundary they claim to respect.
Work|A manager explains the constraints behind a difficult decision.
Work|A colleague confidently recommends a method while hiding that they have not tried it.
Work|A team recognises quiet work that prevented a problem.
Work|A workplace rewards visible busyness more than useful results.
Work|A teacher adjusts instructions after noticing the same confusion in several students.
Work|A colleague asks for feedback only after the decision can no longer change.
Personality|Someone distinguishes a preference from a factual claim.
Personality|Someone demands certainty from others while keeping their own claims vague.
Personality|Someone acknowledges a strong point in an opposing view.
Personality|Someone changes the subject whenever an example challenges their argument.
Personality|Someone recognises that good intentions can still have an unwelcome effect.
Personality|Someone uses politeness to avoid answering a reasonable question.
Everyday|A business explains which advertised features cost extra.
Everyday|A service quietly shifts the work of correcting its mistake to the customer.
Everyday|A community group checks who cannot use its proposed venue.
Everyday|A review blames staff for something clearly outside their control.
Everyday|An organiser offers a practical way to decline without embarrassment.
Everyday|A simple activity requires increasingly complicated approval steps.`),
C1:rows(`Dating|Partners revisit an agreement after a substantial change in circumstances.
Dating|One partner labels every preference a boundary to avoid negotiation.
Dating|A partner recognises that reassurance and constant monitoring are not equivalent.
Dating|A romantic gesture is presented publicly in a way that makes refusal difficult.
Dating|Partners discuss unequal burdens without reducing affection to a score.
Dating|A partner treats an earlier agreement as permanent regardless of changed responsibilities.
Friendship|A friend distinguishes the impact of a comment from the intention behind it.
Friendship|A friend makes an invitation technically open but practically inaccessible.
Friendship|A friendship allows each person to question familiar arrangements without threatening the relationship.
Friendship|A friend invokes loyalty to prevent discussion of a reasonable disagreement.
Friendship|A friend acknowledges that support can sometimes mean accepting an unwanted answer.
Friendship|A friend treats their own interpretation of events as neutral fact.
Work|A decision-maker explains which observations would trigger a review.
Work|A team presents compliance with a procedure as sufficient proof of fairness.
Work|A workplace examines the behaviour its rewards actually encourage.
Work|An adviser uses technical qualifications so heavily that no practical recommendation remains.
Work|A team records unresolved disagreement rather than presenting artificial unanimity.
Work|A manager shifts responsibility to individuals while preserving the incentives that produced the problem.
Personality|Someone states the limits of an example that supports their own argument.
Personality|Someone changes the standard of evidence depending on which conclusion they prefer.
Personality|Someone recognises when a proportionate exception protects the purpose of a rule.
Personality|Someone interprets every change of mind as weakness rather than possible learning.
Personality|Someone represents an opposing view in terms its supporters recognise.
Personality|Someone uses appeals to common sense to avoid making assumptions explicit.
Everyday|A public service evaluates the distribution of its burdens as well as average performance.
Everyday|A company treats a technically disclosed but unavoidable charge as evidence of fully informed choice.
Everyday|A community group reviews whether a long-standing rule still serves its purpose.
Everyday|An organisation measures participation without asking whose voices influenced the result.
Everyday|A service keeps a human review route for unusual but legitimate needs.
Everyday|A supposedly efficient system transfers most of its difficult work to users with fewer alternatives.`)
};
for(const l of B.levels)add('red-flag-green-flag',l,flags[l]);
const likely={
A1:rows(`Funny|makes funny faces in photos
Funny|laughs at their own joke
Funny|gives a funny name to a cup
Funny|eats dessert first
Funny|talks to the television
Funny|draws a cat that looks like a dog
Chaos|loses a pen in a very small bag
Chaos|looks for a phone in the wrong room
Chaos|brings a winter coat on a hot day
Chaos|buys food but forgets the shopping bag
Chaos|takes a bus in the wrong direction
Chaos|forgets where they put a cup of tea
Social|says hello to everyone in the cafe
Social|helps a new student find a seat
Social|asks a quiet person a simple question
Social|shares a book with a friend
Social|remembers what drink you like
Social|invites friends for a walk
Future|wants to learn a new language
Future|plans to visit a new town
Future|wants to have a garden
Future|hopes to work near home
Future|wants to learn to swim
Future|plans a nice birthday party
Spicy|chooses a park for a date
Spicy|gives someone a small gift
Spicy|sends a kind morning message
Spicy|likes a romantic film
Spicy|brings flowers on a date
Spicy|asks someone to get coffee`),
A2:rows(`Funny|tell a joke and forget the ending
Funny|take a serious photo of a sandwich
Funny|give an old chair a name
Funny|sing a song without knowing the words
Funny|buy socks with a funny picture
Funny|celebrate finishing the washing-up
Chaos|arrive at a restaurant on the wrong street
Chaos|pack a book but forget clean socks
Chaos|make tea and leave it in another room
Chaos|read the meeting time incorrectly
Chaos|leave an umbrella at the place where they bought it
Chaos|write a shopping list and forget to take it
Social|introduce two friends at a party
Social|help a new person learn the rules
Social|remember to ask about a friend's exam
Social|invite a neighbour for tea
Social|find a quiet place for a group chat
Social|send clear directions before a meeting
Future|start a new hobby this winter
Future|learn to cook a meal from another country
Future|save for a useful course
Future|plan a weekend with no phone
Future|visit an old friend in another city
Future|grow vegetables on a balcony
Spicy|choose a simple first date
Spicy|remember a date's favourite song
Spicy|make a small gift by hand
Spicy|ask a friend for a date idea
Spicy|send the first message after a nice date
Spicy|prefer a walk to an expensive dinner`),
B1:rows(`Funny|give an ordinary household object a dramatic introduction
Funny|write a serious review of a packet of biscuits
Funny|prepare a victory speech before a friendly quiz
Funny|turn a small cooking mistake into a memorable story
Funny|invent an award for arriving on time
Funny|defend an unpopular pizza topping enthusiastically
Chaos|research a trip carefully but misread the departure time
Chaos|start three hobbies in the same week
Chaos|bring everything for a picnic except the food
Chaos|forget the punchline after building up a long joke
Chaos|join the correct meeting with the wrong notebook
Chaos|buy a useful gadget and lose its instructions
Social|notice when the group's plans are too expensive for someone
Social|ask a follow-up that keeps a conversation going
Social|help two friends find a compromise
Social|introduce a new person without putting them under pressure
Social|remember to thank the person who organised the event
Social|change a topic when the group looks uncomfortable
Future|turn a hobby into a small community activity
Future|learn a practical skill just for enjoyment
Future|try living in a new city for a while
Future|keep a realistic language-learning routine
Future|organise a trip around a shared interest
Future|return to a goal they put aside years ago
Spicy|plan a date around something the other person mentioned
Spicy|discuss expectations clearly early in dating
Spicy|choose a thoughtful inexpensive gift
Spicy|suggest separate hobbies as a positive thing
Spicy|write a kind but clear message declining another date
Spicy|remember a small detail from a first conversation`),
B2:rows(`Funny|give a balanced assessment of a very disappointing sandwich
Funny|create an award for avoiding an unnecessary meeting
Funny|defend a comfortable but unfashionable chair
Funny|explain why a picnic does not need a review committee
Funny|make a persuasive speech about the value of a good nap
Funny|notice the humour in an overcomplicated set of instructions
Chaos|make a backup plan that is harder than the original plan
Chaos|compare so many options that the event sells out
Chaos|spend more time configuring a planning app than using it
Chaos|prepare for every travel problem except an ordinary delay
Chaos|create a group survey that nobody wants to finish
Chaos|turn a minor quiz disagreement into a detailed investigation
Social|summarise both sides of a disagreement fairly
Social|notice who has not had a meaningful choice in a group plan
Social|ask whether someone wants advice before giving it
Social|raise a concern without making it personal
Social|offer a practical compromise without claiming it is perfect
Social|give useful feedback at a considerate time
Future|change a routine after testing a small improvement
Future|choose a course for its usefulness rather than its image
Future|build a hobby around enjoyment rather than competition
Future|plan a project with realistic time for setbacks
Future|review a goal when circumstances change
Future|help make a local activity more accessible
Spicy|discuss differences in communication without blaming a partner
Spicy|plan a romantic gesture that is easy to accept or decline
Spicy|negotiate time together and time apart calmly
Spicy|distinguish privacy from secrecy in a relationship discussion
Spicy|consider both incomes when planning shared expenses
Spicy|ask about expectations rather than assume compatibility`),
C1:rows(`Funny|present an impressively qualified argument about the last biscuit
Funny|identify the hidden assumptions in a ranking of cafe chairs
Funny|explain a kettle's failure without proposing a theory of civilisation
Funny|defend an unnecessary gadget while admitting the limits of the defence
Funny|propose a proportionate appeals process for a friendly quiz
Funny|use a mock formal speech to restore perspective to a trivial dispute
Chaos|design a productivity measure that mainly measures the design process
Chaos|make spontaneity the subject of a detailed itinerary
Chaos|add exceptions to a rule until nobody remembers its purpose
Chaos|turn a shared lunch into a negotiation about precedent
Chaos|request so much evidence for a small purchase that the choice becomes irrelevant
Chaos|overestimate how many decisions a supposedly relaxing day can contain
Social|distinguish a disagreement about evidence from a disagreement about priorities
Social|identify whose perspective is missing from apparent consensus
Social|state a limitation of their own persuasive example
Social|represent an opposing position before criticising it
Social|explain why equal treatment and equitable treatment can differ
Social|recognise when an exception protects the purpose of a rule
Future|revise a public commitment without abandoning its underlying value
Future|test whether a familiar measure still represents the intended goal
Future|design a project with explicit criteria for changing course
Future|choose a modest improvement whose benefits are widely shared
Future|question a popular method while preserving what it does well
Future|make a clear recommendation under acknowledged uncertainty
Spicy|distinguish a legitimate boundary from a preference being used to stop negotiation
Spicy|notice when a romantic gesture makes refusal difficult
Spicy|discuss unequal contributions without reducing a relationship to a transaction
Spicy|recognise when changed circumstances justify reviewing an agreement
Spicy|frame incompatible expectations without assuming one person is unreasonable
Spicy|balance emotional reassurance with respect for autonomy`)
};
for(const l of B.levels)add('most-likely-to',l,likely[l].map(([c,v])=>[c,(l==='A1'?'Who in the group ':'Who is most likely to ')+v+'?']));
const finish={
A1:rows(`Easy|My favourite room at home is ...
Easy|I go to the park to ...
Easy|A good breakfast has ...
Easy|I keep my keys ...
Easy|In a cafe, I usually order ...
Personal|I am good at ...
Personal|I need help with ...
Personal|I feel calm in ...
Personal|I like my town because ...
Personal|One important person in my life is ...
Social|With my friends, I like to ...
Social|When I meet a new person, I say ...
Social|I can help a friend with ...
Social|At a party, I talk about ...
Social|I share my ... with friends.
Future|Tomorrow, I want to ...
Future|Next summer, I want to visit ...
Future|I want to learn to make ...
Future|My next small gift is for ...
Future|This weekend, I want to see ...
Opinion|A good teacher is ...
Opinion|A good place to read is ...
Opinion|A useful thing in my bag is ...
Opinion|A happy home needs ...
Opinion|The best time for a walk is ...
Fun|A funny name for a cat is ...
Fun|A pizza with too much ... is not for me.
Fun|My dancing is ...
Fun|My bag is small, but ...
Fun|A bad place for a very big hat is ...`),
A2:rows(`Easy|Before a long journey, I always ...
Easy|The last thing I bought for my home was ...
Easy|A meal I want to cook again is ...
Easy|When my bus is late, I ...
Easy|A useful thing to take on a short trip is ...
Personal|I felt pleased with myself when ...
Personal|I learn new words better when ...
Personal|A small thing I want to change is ...
Personal|I need a break when ...
Personal|I feel comfortable with people who ...
Social|A visitor to my town should ...
Social|When a friend is late, I ...
Social|I start a conversation by ...
Social|It is easier to make friends when ...
Social|A kind way to say no is ...
Future|By next month, I want to ...
Future|For my next birthday, I would like ...
Future|A class I want to try is ...
Future|On my next free day, I am going to ...
Future|One place I want to show a friend is ...
Opinion|A good cafe should have ...
Opinion|A useful class gives people time to ...
Opinion|The best way to remember a date is ...
Opinion|A cheap gift can be special when ...
Opinion|People enjoy a party more when ...
Fun|I knew my cooking needed help when ...
Fun|My funniest photo shows ...
Fun|A surprising thing to find in a coat pocket is ...
Fun|A bad name for a restaurant is ...
Fun|I thought I could sing until ...`),
B1:rows(`Easy|An ordinary task became easier after I ...
Easy|A local place I would recommend is ...
Easy|I prepare for a busy week by ...
Easy|A useful thing I learned outside school was ...
Easy|I choose a new restaurant by ...
Personal|I became more patient when ...
Personal|I find it easier to start a goal if ...
Personal|Something I no longer worry so much about is ...
Personal|I feel most independent when ...
Personal|An achievement other people might not notice is ...
Social|I know someone is listening when ...
Social|A group plan should always consider ...
Social|An old friendship is easier to restart if ...
Social|A useful follow-up question is ...
Social|When I disagree politely, I usually ...
Future|A project I would like to finish this year is ...
Future|I would like my next holiday to include ...
Future|A skill I hope to use more often is ...
Future|A habit I want to keep for a long time is ...
Future|In a future job, I would value ...
Opinion|Honesty is helpful when ...
Opinion|A good instruction should ...
Opinion|A useful review includes ...
Opinion|A fair group decision needs ...
Opinion|A goal is realistic if ...
Fun|My least impressive talent is ...
Fun|A friendly competition became dramatic when ...
Fun|My fridge would probably complain that ...
Fun|A very ordinary task deserves an award when ...
Fun|The name of a film about my last Monday would be ...`),
B2:rows(`Easy|A service is genuinely useful to me when ...
Easy|A small change improved my routine by ...
Easy|I compare the real value of two options by ...
Easy|A clear plan leaves room for ...
Easy|An instruction becomes easier to follow when ...
Personal|I recognise that my priorities have changed when ...
Personal|A goal stops being useful if ...
Personal|I distinguish rest from avoidance by ...
Personal|I am prepared to accept an imperfect result when ...
Personal|I know that feedback has helped me when ...
Social|A quieter participant may contribute more if ...
Social|A good host makes it easy to ...
Social|A disagreement goes in circles when ...
Social|A considerate boundary includes ...
Social|A fair division of effort should consider ...
Future|Before committing to a long-term course, I would ...
Future|A future project should include a way to ...
Future|I would change a plan if new information showed ...
Future|A useful next step is one that ...
Future|I would like my future routine to protect time for ...
Opinion|A decision can be reasonable even if ...
Opinion|Transparency matters most when ...
Opinion|Confidence becomes misleading if ...
Opinion|A useful exception should ...
Opinion|A fair invitation must consider ...
Fun|A review of my most ordinary possession would say ...
Fun|A committee for choosing dinner would fail because ...
Fun|The most unnecessary feature for a kettle is ...
Fun|My unofficial award for avoiding extra work would go to ...
Fun|A small inconvenience sounds dramatic when I describe it as ...`),
C1:rows(`Easy|An apparently simple service may conceal ...
Easy|The value of a familiar routine depends partly on ...
Easy|A practical comparison becomes misleading if ...
Easy|Good instructions preserve necessary detail while ...
Easy|An everyday convenience is harder to justify when ...
Personal|A commitment remains meaningful after a change of plan if ...
Personal|I distinguish a considered preference from an inherited expectation by ...
Personal|A persuasive personal example needs qualification when ...
Personal|A responsible decision may still involve ...
Personal|I recognise the limits of my own judgement when ...
Social|Apparent consensus deserves scrutiny if ...
Social|A genuinely open question leaves room for ...
Social|Representing an opposing view fairly requires ...
Social|A proportionate response to disagreement should ...
Social|Equal participation is not necessarily meaningful participation because ...
Future|Before scaling a promising idea, I would want evidence that ...
Future|A long-term agreement should be reviewed when ...
Future|A reversible experiment is preferable to a permanent change if ...
Future|An explicit reason for changing course would be ...
Future|A future measure of success should not overlook ...
Opinion|Procedural fairness is insufficient on its own when ...
Opinion|An explanation becomes a justification only if ...
Opinion|Acknowledging uncertainty strengthens a recommendation when ...
Opinion|A principled exception preserves ...
Opinion|An efficiency claim should specify ...
Fun|A formal defence of my favourite biscuit would have to admit ...
Fun|The hidden cost of my perfect productivity system is ...
Fun|A constitutional rule for a picnic becomes absurd when ...
Fun|My most disproportionate complaint would sound more reasonable if ...
Fun|A peer review of my holiday packing would probably conclude ...`)
};
for(const l of B.levels)add('finish-the-sentence',l,finish[l]);
const topics=rows(`Everyday|your favourite lunch|a lunch you prepared|a meal that improved an ordinary day|a meal that changed your view of convenience|a meal whose social value mattered more than its cost
Everyday|your walk to a shop|a walk on a new route|a route you changed for a practical reason|a familiar journey you made more useful|a routine journey whose hidden costs you reconsidered
Everyday|a useful cup|a useful thing you borrowed|an item that saved you time|a purchase where reliability mattered most|a purchase whose apparent value depended on an assumption
Everyday|your morning at home|a morning that went well|a morning routine you simplified|a routine you adjusted after your circumstances changed|a routine you kept for emotional rather than practical reasons
Everyday|things near your bed|a change you made to your room|a small change that made home more comfortable|a home arrangement that balanced different needs|a shared arrangement whose fairness depended on context
Travel|a place near your home|a short visit to another town|a short trip that taught you something|a journey where you chose time over a lower price|a journey where convenience shifted a cost to someone else
Travel|a bus you use|a bus trip you remember|a useful conversation during a journey|a travel recommendation you decided not to follow|a travel experience you avoided treating as representative
Travel|your favourite park|a park you visited with someone|a place you enjoyed more on a second visit|a familiar place you saw from a visitor's perspective|a place whose meaning changed after you heard a different perspective
Travel|food for a trip|something you packed for a journey|something you learned not to pack|a packing choice that revealed your priorities|a travel plan you simplified after questioning its assumptions
Childhood|a game you like|a game you played as a child|a childhood game that taught you a skill|a childhood rule you understand differently now|an early lesson whose meaning changed as you gained experience
Childhood|a person in your family|a family activity you remember|a family habit you chose to keep|a family expectation you discussed respectfully|an inherited expectation you distinguished from a personal value
Childhood|a toy you like|a favourite childhood toy|a toy or object with a story|an old possession you kept for reasons beyond usefulness|an object whose personal value could not be captured by its price
Childhood|your first school|something you remember from school|a useful lesson outside a classroom|a school experience that changed your view of feedback|an educational experience where the measure of success missed the point
Work & Study|things in your school bag|a class you enjoyed|a class where you learned through practice|a learning method you adapted to your own needs|a learning method you evaluated beyond its popularity
Work & Study|a teacher you like|someone who explained a task clearly|a clear explanation you gave someone|instructions you improved for a beginner|an explanation that balanced clarity with necessary qualifications
Work & Study|a quiet place to study|a place you used for studying|a study routine that lasted|a realistic compromise between study and rest|a study goal you revised without abandoning its purpose
Work & Study|a person who helps you|a classmate or colleague who helped|a teammate whose contribution you appreciated|useful work that other people did not notice|invisible work whose value became clear only later
Social|a friend you see often|a friend you met through an activity|a friendship that began unexpectedly|a friendship that adapted to changed circumstances|a friendship where fairness required more than equal effort
Social|a small party|a party where you met someone new|a group activity that welcomed a newcomer|a group decision that became more inclusive|a group decision that improved after an absent perspective was considered
Social|a kind message|a message that made you smile|a message that cleared up a misunderstanding|a difficult message you worded carefully|a message whose interpretation depended on unspoken expectations
Social|a person you listen to|a conversation you enjoyed|a conversation improved by a follow-up question|a disagreement made useful by careful listening|a disagreement clarified by separating evidence from values
Funny|a funny animal|a funny animal video you remember|a pet's habit that made a normal day entertaining|a harmless inconvenience you described dramatically|an exaggerated complaint that revealed a recognisable everyday truth
Funny|a silly drawing|a drawing that surprised you|an attempt to be creative that went unexpectedly|an ordinary task you treated like a major performance|a trivial preference you defended with unnecessary formality
Funny|a very big sandwich|a meal that was bigger than expected|a cooking plan that needed a quick rescue|a confident prediction about dinner that proved wrong|a food review that said more about its assumptions than the meal
Funny|a strange hat|a time your clothes surprised someone|a time you were dressed for a different occasion|a harmless mismatch between preparation and reality|a carefully justified plan that reality made gently ridiculous
Future|a place you want to see|a trip you would like to plan|a future journey you are saving for|a future plan with a realistic fallback|a future commitment with explicit reasons for reviewing it
Future|a skill you want to learn|a class you want to try|a skill you hope to use for other people|a future goal that balances ambition and available time|a future goal whose success should be measured in more than one way
Future|a thing you want to make|something you want to repair or build|a small project you want to finish|a project you would test before committing more resources|a project where reversibility changes the acceptable level of uncertainty
Personal|a time you feel happy|a small thing you felt proud of|an achievement you valued privately|an achievement that changed your own expectations|an achievement whose recognition differed from its personal meaning
Personal|a thing you can do well|a skill that became easier|a difficulty that became manageable with practice|a challenge that led you to reconsider your priorities|a challenge that helped you distinguish a principle from a method`);
for(const [li,l]of B.levels.entries()){
 add('two-truths-one-lie',l,topics.map(r=>[cat('two-truths-one-lie',r[0]),'Talk about '+r[li+1]+'.',l==='A1'?'Say three short sentences: two true, one not true.':B.follow[l]]));
 add('would-i-lie-to-you',l,topics.map(r=>[cat('would-i-lie-to-you',r[0]),(l==='A1'?'Say three short sentences about ':'Tell a true or invented story about ')+r[li+1]+'.']));
}
})();
