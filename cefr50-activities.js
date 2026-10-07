/* Authored quick-response, mission, bingo and performance tasks. */
(function(){
'use strict';
const B=window.ESCCefrBank,{rows,add}=window.ESCCefr50;
const challenge={
A1:rows(`Easy|things in a bedroom
Easy|things you can drink from
Easy|animals on a farm
Easy|things you can see in a park
Easy|things you eat with bread
Easy|things you take to school
Easy|places near your home
Easy|words for people in a family
Easy|things that are cold
Easy|things you can open
Funny|foods you do not put in a shoe
Funny|things too big for a pocket
Funny|animals that cannot drive a bus
Funny|things you can give a toy bear
Funny|things that look funny on a cat
Funny|places where you do not put a bed
Funny|things a dog cannot buy
Funny|foods that make your hands dirty
Funny|things a very small hat cannot cover
Funny|things that are not good birthday cakes
Hard|things you can do without a phone
Hard|things you need on a rainy walk
Hard|things you can say to a new friend
Hard|things you do before dinner
Hard|things you can carry in one hand
Hard|things you can share with a friend
Spicy|places for a simple date
Spicy|small gifts for someone you like
Spicy|nice words about a person
Spicy|things you can do on a date in a park`),
A2:rows(`Easy|things you check before a bus trip
Easy|foods you can make for a picnic
Easy|things you borrow from a library
Easy|places to meet a friend after work
Easy|things you keep in a bathroom
Easy|things you can do in a small garden
Easy|ways to get to a nearby town
Easy|things you need for a class
Easy|jobs people do outdoors
Easy|things you can buy in a bakery
Funny|things that can fall out of a full bag
Funny|bad names for a cafe
Funny|things you should not bring to a quiet library
Funny|unusual shapes for a birthday cake
Funny|reasons a pet might interrupt a video call
Funny|things that look strange in a fridge
Funny|places where a loud alarm is annoying
Funny|things you might find under a sofa
Funny|bad times to start singing
Funny|things a robot waiter might get wrong
Hard|ways to practise English on a bus
Hard|questions to ask before borrowing something
Hard|things to do when a plan changes
Hard|ways to help a new classmate
Hard|things to compare before buying a bag
Hard|ways to thank someone for help
Spicy|questions for a first date
Spicy|ideas for an inexpensive date
Spicy|small gifts you can make yourself
Spicy|polite ways to invite someone for coffee`),
B1:rows(`Easy|things to compare when choosing a course
Easy|ways to make a morning less rushed
Easy|skills you can learn from a relative
Easy|things you can repair at home
Easy|places a visitor could enjoy for free
Easy|ways to make a picnic easier to organise
Easy|things to consider before sharing a flat
Easy|ways to remember a new person's name
Easy|questions to ask about a new job
Easy|things to check before a group trip
Funny|ordinary chores that could become competitions
Funny|things people name even though they are not pets
Funny|bad topics for a speech before breakfast
Funny|harmless reasons a group photo takes too long
Funny|objects that could give a funny farewell speech
Funny|unnecessary features for a mug
Funny|things people forget after writing a reminder
Funny|reasons a simple recipe might go wrong
Funny|bad awards for a very ordinary achievement
Funny|ways a fancy plan can meet ordinary reality
Hard|ways to disagree without being rude
Hard|signs a plan is unrealistic
Hard|reasons to ask for clearer instructions
Hard|ways to include a person who feels nervous
Hard|questions that keep a story going
Hard|things that make advice useful
Spicy|qualities that make a first date comfortable
Spicy|ways to show interest without pressure
Spicy|topics partners should discuss before a trip
Spicy|ways to decline a second date kindly`),
B2:rows(`Easy|criteria for choosing a reliable service
Easy|ways to reduce unnecessary notifications
Easy|things to check in a product review
Easy|benefits of leaving free time in a holiday plan
Easy|ways to recognise a teammate's contribution
Easy|questions to clarify a task's purpose
Easy|signs a learning method is useful
Easy|reasons a cheap purchase can cost more later
Easy|ways to make a shared decision clearer
Easy|features of a considerate invitation
Funny|ordinary decisions people overanalyse
Funny|unnecessary rules for a casual picnic
Funny|objects people defend with surprising passion
Funny|things a calendar might complain about
Funny|awards for preventing unnecessary office work
Funny|signs a friendly quiz needs a break
Funny|ways a gadget can create extra work
Funny|small inconveniences that deserve smaller complaints
Funny|things that make a product review unintentionally funny
Funny|reasons a group chat needs fewer messages
Hard|factors that make a compromise fair
Hard|signs a claim needs checking
Hard|ways to qualify a strong opinion
Hard|questions that reveal a missing perspective
Hard|reasons to review an old rule
Hard|ways to make criticism actionable
Spicy|issues partners can negotiate about time together
Spicy|features of a thoughtful romantic gesture
Spicy|questions to clarify different expectations
Spicy|ways to respect a partner's privacy`),
C1:rows(`Easy|questions that clarify a recommendation's assumptions
Easy|factors that make an exception defensible
Easy|ways to acknowledge the limits of an example
Easy|signs a metric no longer represents its goal
Easy|questions about who bears a decision's costs
Easy|ways to distinguish a preference from a factual claim
Easy|conditions that might justify reviewing an agreement
Easy|features of a proportionate complaint
Easy|reasons consensus can be misleading
Easy|ways to preserve clarity while expressing uncertainty
Funny|trivial choices that do not need an appeals board
Funny|signs a hobby has become an administrative project
Funny|ordinary products with overambitious advertising
Funny|household rules whose purpose is easily forgotten
Funny|ways a sandwich dispute can sound like public policy
Funny|unnecessary measures of success for a relaxing holiday
Funny|minor inconveniences that do not justify a grand theory
Funny|objects that could receive a mock lifetime-achievement award
Funny|ways to make a formal complaint about a biscuit
Funny|claims a productivity app should be able to support
Hard|distinctions between an explanation and a justification
Hard|questions that separate factual disputes from value disputes
Hard|reasons equal treatment can have unequal effects
Hard|ways to present a strong counterargument fairly
Hard|factors that affect meaningful consent
Hard|criteria for reversing a decision under uncertainty
Spicy|considerations in reviewing an agreement between partners
Spicy|differences between reassurance and control
Spicy|features of a sustainable relationship compromise
Spicy|questions that distinguish a boundary from an unexamined preference`)
};
for(const l of B.levels)add('five-second-challenge',l,challenge[l].map(([c,q])=>[c,'Name three '+q+'.']));
const missions={
A1:rows(`Ask someone if they like mornings.
Tell someone one thing in your bag.
Ask someone the colour of their bag.
Ask someone if they like quiet places.
Tell someone a place near your home.
Ask someone if they like long bus trips.
Tell someone your favourite day of the week.
Ask someone what they have for lunch.
Ask someone if they have a favourite song.
Tell someone one thing you do after dinner.
Ask someone if they like the sea or the mountains.
Ask someone if they like small parties.
Tell someone a thing you want to buy.
Ask someone if they like fruit.
Ask someone if they can draw.
Tell someone one thing you do with friends.
Ask someone if their home is near a park.
Ask someone if they like reading at home.
Tell someone the name of a place you like.
Ask someone if they use a notebook.
Ask someone if they like taking photos.
Tell someone one food you can make.
Ask someone if they have a favourite chair.
Ask someone if they like walking in the morning.
Tell someone a word you know in English.
Ask someone if they like birthday cake.
Ask someone if they have a small or a big family.
Tell someone one thing that makes you happy.
Ask someone if they prefer a bus or a train.
Ask someone if they like games with friends.`),
A2:rows(`Ask someone what they usually prepare before work.
Find out which room someone likes best at home.
Ask someone what they bought last time they went shopping.
Ask someone how they remember important dates.
Tell someone about a place you went to this week.
Ask someone what they do when their bus is late.
Find out what someone learned from a family member.
Ask someone what they like to cook for other people.
Tell someone about a simple game you enjoy.
Ask someone what they take on a short trip.
Find out what someone does when a plan changes.
Ask someone what they enjoy about their neighbourhood.
Tell someone one useful thing you bought recently.
Ask someone which household job they find easy.
Find out when someone last tried a new food.
Ask someone how they choose a film to watch.
Tell someone a small plan you have for next month.
Ask someone what kind of weather they prefer for a walk.
Find out where someone likes to sit in a cafe.
Ask someone about something they repaired or cleaned recently.
Tell someone a kind thing another person did for you.
Ask someone what they usually do during a break.
Find out what someone likes about learning with other people.
Ask someone what they do before leaving home.
Tell someone one thing that was different when you were a child.
Ask someone what they would bring to a picnic.
Find out which local place someone would show a visitor.
Ask someone what helps them feel ready for a busy day.
Tell someone about a photo you like.
Ask someone what they would like more time for.`),
B1:rows(`Ask someone about a routine they have made simpler.
Find out why someone keeps returning to a particular place.
Ask someone to describe advice that did not suit them.
Tell someone about a decision you are glad you did not rush.
Ask someone which part of a trip they would change next time.
Find out how someone makes a group plan easier to join.
Ask someone what they learned by teaching another person.
Give an example that supports another speaker's point.
Ask someone what made an ordinary day memorable.
Find out how someone handles a small disagreement with friends.
Ask someone what made them stop buying a product.
Tell someone about a skill you use more than you expected.
Ask someone what makes instructions easy to follow.
Find out how someone chooses between two attractive plans.
Ask someone what they appreciate about a quiet friend.
Offer an alternative plan and explain one advantage.
Ask someone what made a new class feel comfortable.
Find out how someone keeps in touch across distance.
Ask someone what they changed after arriving late once.
Tell someone about a realistic way to save time.
Ask someone which responsibility helped them grow.
Find out when someone prefers practical help to advice.
Ask someone how they decide whether a goal is worth continuing.
Describe a small improvement without exaggerating its effect.
Ask someone what they learned from a misunderstood message.
Find out how someone politely declines a plan.
Ask someone what they value about time alone.
Connect two different speakers' ideas with a short explanation.
Ask someone how they would welcome a visitor to this group.
Finish a conversation by thanking the person for a specific story.`),
B2:rows(`Ask someone which trade-off matters most in an ordinary purchase.
Find out how someone distinguishes a useful feature from extra complexity.
Ask a speaker to describe a case where their recommendation would not work.
Offer a counterexample respectfully and invite a response.
Ask someone what would make a group decision fairer.
Find out how someone balances independence with accepting help.
Ask someone which part of a rule they would preserve while changing the rest.
Summarise a disagreement without presenting either side as unreasonable.
Ask someone how they would measure the usefulness of a learning method.
Find out how someone decides whether an exception is fair.
Ask someone whose needs a plan might overlook.
Give a qualified opinion using a clear concrete example.
Ask a speaker to distinguish intention from effect in their example.
Find out how someone notices that a routine no longer works.
Ask someone how timing changes the usefulness of feedback.
Offer a small reversible experiment instead of a permanent solution.
Ask someone to compare short-term comfort with long-term benefit.
Find out how someone makes it easy for others to disagree.
Ask a speaker which detail would most affect their decision.
Clarify an uncertain point before you give advice.
Ask someone how they would explain a boundary without blame.
Find out what makes a service genuinely accessible to different users.
Ask a speaker to give a practical example of an abstract idea.
Acknowledge one limitation of the option you prefer.
Ask someone how they would divide an unequal workload fairly.
Find out how someone checks whether a review applies to their needs.
Ask a speaker to explain why a different conclusion might still be reasonable.
Invite someone to add an example that has not been considered.
Ask someone what they would simplify in an overplanned activity.
Close a discussion by naming one practical point of agreement.`),
C1:rows(`Ask which assumption is carrying the most weight in a recommendation.
Invite a speaker to distinguish a defensible exception from an arbitrary one.
Ask how an apparent improvement distributes benefits and burdens.
State the strongest objection to your own recommendation before defending it.
Ask whether a measure of success still represents the intended outcome.
Invite someone to describe a case in which their principle should not apply.
Ask what makes the proposed consent practically meaningful.
Distinguish what your example demonstrates from what it merely suggests.
Ask whether apparent consensus reflects agreement or reluctance to object.
Invite a speaker to separate their preferred outcome from their preferred process.
Ask who was not consulted before a proposed decision.
Reformulate an absolute claim so that its limits are explicit.
Ask whether new evidence would justify revision or only further investigation.
Invite someone to compare the costs of acting with the costs of waiting.
Ask what an explanation would need in order to become a justification.
Offer a principled compromise and identify the cost it cannot remove.
Ask whether efficiency in an example depends on transferring work to someone else.
Invite someone to explain how context changes the fairness of an arrangement.
Ask what kind of accountability would change future behaviour.
Distinguish a disagreement about a definition from a disagreement about evidence.
Ask what would make a long-standing precedent no longer relevant.
Invite a speaker to state how confident they are and why.
Ask whether a convenient option leaves a realistic alternative.
Qualify a persuasive story by noting why it may not be representative.
Ask what should remain constant when a policy changes.
Invite someone to identify an unintended incentive in a proposed reward.
Ask what a proportionate response would look like in a low-stakes dispute.
Acknowledge an unresolved objection without pretending it defeats every option.
Ask what evidence a reversible experiment could reasonably provide.
End a discussion by distinguishing agreement on facts from agreement on values.`)
};
for(const l of B.levels)add('secret-mission',l,missions[l].map(r=>r[0]));
const bingo={
A1:rows(`likes orange juice
has a blue bag
can draw a house
likes early mornings
has a favourite song
likes small parties
has a book near their bed
likes soup
can ride a bike
likes train trips
has a red shirt
likes cooking with friends
has a quiet place at home
likes apples
can make a sandwich
likes birthday cake
has a favourite park
likes rainy walks
has a notebook in their bag
likes taking pictures of places
can name three English songs
likes a seat near a window
has a favourite breakfast
likes visiting family
can say hello in three languages
likes playing games after dinner`),
A2:rows(`made breakfast for someone recently
borrowed a book this month
took a different route home recently
helped someone carry a bag
went for a walk before breakfast
bought a second-hand item
tried a new cafe this month
made a shopping list this week
visited a relative recently
watched a film with a friend recently
learned a recipe from a family member
forgot to take an umbrella recently
helped a new classmate or colleague
made a small gift by hand
used a paper map on a trip
prepared lunch to take from home
arranged a meeting with an old friend
took a photo they are proud of
asked someone to explain a game
changed a plan because of rain
tried studying in a different place
fixed a small thing at home
shared a useful recommendation
bought flowers for someone
joined an activity without knowing anyone
spent a day without a fixed plan`),
B1:rows(`has made an ordinary routine simpler
has learned something by teaching a friend
has changed a plan to include someone else
has chosen a longer journey for a better view
has politely disagreed with a recommendation
has stopped buying something they can make
has found practical help more useful than advice
has reconnected with an old friend
has improved instructions for a beginner
has chosen rest over an extra activity
has kept a goal realistic by making it smaller
has enjoyed a hobby without trying to be the best
has appreciated a quiet teammate's contribution
has solved a misunderstanding with a short message
has tried a class based on a friend's suggestion
has made a newcomer feel comfortable
has admitted not understanding a joke
has laughed at an overambitious cooking plan
has used a cancelled plan as a chance to rest
has changed their mind about a local place
has asked for a clearer deadline
has declined a plan without inventing an excuse
has shared a skill with a neighbour
has chosen a useful gift based on a small detail
has helped a group choose an inexpensive activity
has learned that a popular hobby did not suit them`),
B2:rows(`has revised a routine when circumstances changed
has compared a service's price with its hidden costs
has qualified a recommendation after considering an exception
has given feedback at a more considerate time
has distinguished a personal preference from a factual claim
has supported a quieter person's contribution
has recognised the value of invisible work
has chosen a reversible experiment over a permanent change
has changed an invitation to remove an access barrier
has admitted a limitation in their own argument
has balanced rest with a useful opportunity
has reconsidered a helpful gesture after hearing its effect
has questioned whether a review applied to their needs
has explained a boundary without blaming someone
has accepted an imperfect but reasonable result
has reduced unnecessary digital reminders
has made an unequal division of work feel fairer
has summarised both sides of a disagreement
has kept a discussion from becoming repetitive
has rejected a discount because it encouraged unnecessary spending
has revisited a shared plan after priorities changed
has noticed that a confident claim lacked support
has used humour to restore proportion to a minor problem
has paid more for a service with clearer terms
has distinguished an unfortunate outcome from a poor decision
has chosen a modest improvement over an impressive-looking change`),
C1:rows(`has distinguished a principle from a method used to pursue it
has questioned a metric that encouraged the wrong behaviour
has recognised an important limitation in a persuasive personal story
has considered who carries the hidden costs of convenience
has supported a proportionate exception to a familiar rule
has represented an opposing position in terms its supporters accepted
has made uncertainty explicit in a practical recommendation
has questioned whether apparent consensus included meaningful participation
has separated a disagreement about definitions from one about evidence
has recognised that equal treatment can produce unequal burdens
has reviewed an old agreement after circumstances changed
has distinguished an explanation from a justification
has considered whether a supposedly voluntary choice had a realistic alternative
has identified an unintended incentive in a reward
has revised a view without dismissing the reasoning behind the earlier view
has questioned a procedure whose original purpose no longer applied
has balanced short-term efficiency with long-term flexibility
has acknowledged a counterargument without abandoning every part of their position
has noticed costs transferred to a less visible group
has preserved a core value while changing a public commitment
has asked what evidence would justify reversing a decision
has distinguished a representative example from a memorable exception
has recognised excessive formality in a low-stakes disagreement
has compared the risks of acting with those of waiting
has considered both process and outcome when judging fairness
has accepted that a principled compromise still leaves a real cost`)
};
for(const l of B.levels)add('conversation-bingo',l,bingo[l].map(r=>r[0]));
// One coherent communicative task at five levels, rather than random dares.
const dares=rows(`Name two things near the door.|Describe the things near the door.|Explain which object near you is most useful.|Compare the uses of two nearby objects.|Defend a choice between two nearby objects while acknowledging a limitation.
Ask a person if they like mornings.|Ask about someone's morning and ask one more question.|Ask about a morning routine and summarise the answer.|Ask which part of a routine no longer works and why.|Ask what assumptions support a routine and summarise a qualified recommendation.
Say what is in your pocket.|Describe something small you carry.|Explain why you keep an ordinary item with you.|Give an honest review of an ordinary item you carry.|Assess an ordinary possession without confusing personal attachment with general value.
Say three words about a park.|Describe a park you know.|Recommend a park for a visitor with limited time.|Compare a park's value for two different users.|Explain how a park's value might escape a simple visitor-count measure.
Ask someone if they like bread.|Ask about someone's favourite breakfast.|Ask how someone's breakfast routine has changed.|Compare convenience and enjoyment in a breakfast routine.|Make a qualified argument about the value of an unhurried breakfast.
Say hello to an imaginary new student.|Welcome a new student and explain one simple rule.|Welcome a newcomer and suggest a comfortable first activity.|Give a welcome that offers participation without pressure.|Explain how a welcome can be inclusive without assuming everyone's needs are identical.
Name three things that are blue.|Describe three blue objects in this room or your imagination.|Connect three blue objects in a short believable story.|Use three ordinary objects in a story with an unexpected but plausible ending.|Tell a short story in which three ordinary objects support two different interpretations.
Say one thing you like about your town.|Tell a visitor two things to do in your town.|Recommend an afternoon in your neighbourhood.|Design a local afternoon for two people with different preferences.|Justify a local plan while acknowledging whose preferences it does not fully satisfy.
Ask someone if they have a notebook.|Ask how someone uses a notebook.|Explain a simple way to organise a busy week.|Compare a simple planning method with a more detailed one.|Assess a planning method by its real benefit rather than the appearance of organisation.
Say what you do before bed.|Describe a quiet evening at home.|Explain a routine that helps you relax.|Compare rest with avoiding an unfinished task.|Distinguish legitimate rest from avoidance without assuming you can judge another person's motives.
Name three foods for a picnic.|Choose picnic food and explain a simple reason.|Suggest a picnic plan with a weather backup.|Make a picnic plan that respects different budgets and access needs.|Defend a proportionate picnic plan without creating unnecessary administration.
Say thank you for an imaginary gift.|Thank someone for a gift and say how you will use it.|Thank someone for a thoughtful gesture with a specific detail.|Respond kindly to a gift that does not suit you.|Explain gratitude without pretending every well-intended gift is useful or appropriate.
Ask a person where they live.|Ask about a place near someone's home.|Ask what makes someone's neighbourhood comfortable.|Ask which local improvement would help overlooked residents.|Ask who would benefit and who would carry the costs of a proposed local improvement.
Say two things you can do well.|Explain a simple skill you have.|Teach a familiar skill in four clear steps.|Adapt an explanation of a skill for a complete beginner.|Explain a skill clearly while identifying a condition under which your method may not apply.
Name three things in a shop.|Describe an imaginary small shop.|Recommend one practical improvement for a small shop.|Evaluate a shop from the perspective of two different customers.|Compare commercial success with the less measurable community value of a small shop.
Say a kind thing about a friend.|Describe a friend without naming them.|Explain a quality you appreciate in a friend.|Discuss how the same friendly behaviour can be helpful in one context and intrusive in another.|Distinguish intention from effect in an example of friendship.
Ask someone if they like rainy days.|Ask what someone does when a plan changes because of rain.|Suggest two realistic alternatives to a cancelled outdoor plan.|Negotiate a weather backup that protects different priorities.|Explain what should remain fixed and what can change when a shared plan needs revision.
Say what you want to learn.|Explain why you want to learn a skill.|Describe a realistic first step towards a learning goal.|Choose a way to measure progress without making learning unpleasant.|Critique a learning metric and propose a better but still limited alternative.
Name three places to sit.|Describe a comfortable chair.|Give an honest recommendation for a chair.|Review a comfortable but unattractive chair fairly.|Defend an unfashionable chair without redefining every criterion to suit your preference.
Say what is in an imaginary big bag.|Describe a bag packed for one night.|Explain what you would leave out of an overpacked bag.|Prioritise luggage for travellers with different needs.|Explain how uncertainty influences overpacking and where preparation becomes disproportionate.
Ask someone if they prefer tea or water.|Ask someone to choose between two drinks and explain why.|Ask about a preference and use a follow-up rather than giving your own answer.|Distinguish a personal drink preference from a general quality claim.|Expose the unstated assumption in a claim that one ordinary drink is objectively best.
Say one sentence about a photo you like.|Describe a photo and when it was taken.|Tell the story behind a memorable photo.|Explain how a photo can leave out important context.|Use a hypothetical photo to distinguish a memorable image from representative evidence.
Name three things you can share.|Describe something you share with another person.|Explain a fair rule for sharing an ordinary item.|Negotiate a rule for an item used unequally by two people.|Distinguish equal access from equitable use in a shared arrangement.
Say that you cannot come to a party.|Politely decline an invitation with a simple reason.|Decline an invitation without inventing an excuse and suggest another time.|Decline an invitation while respecting both your boundary and the host's effort.|Explain why a considerate refusal need not become a detailed justification of one's private life.
Ask where an imaginary bus stop is.|Ask for directions and repeat the important detail.|Explain a familiar route to a visitor.|Give directions that account for an unfamiliar traveller's needs.|Explain why technically correct directions can still be inaccessible to the intended user.
Say two things about an imaginary cat.|Describe a cat that thinks it owns your chair.|Tell a believable story about a pet interrupting a plan.|Use a pet's interruption to tell a story with two possible reactions.|Tell a light-hearted story that distinguishes a person's intentions from their interpretation of an animal's behaviour.
Say what you eat at a small party.|Describe a menu for a small party.|Plan food for friends with different preferences.|Explain how to ask about food needs without making assumptions.|Distinguish thoughtful accommodation from assuming all members of a group have the same needs.
Name three words you know in English.|Explain how you remember a new word.|Teach the group one useful expression and give a natural example.|Explain two meanings of a familiar word using context.|Show how two people can disagree while using the same word with different definitions.
Ask a person if they like games.|Explain a game you know in simple steps.|Teach a game without assuming previous knowledge.|Revise a confusing game rule without changing the game's purpose.|Defend a rule change by distinguishing consistency from preserving an outdated procedure.
Say one thing you need for a trip.|Explain what you check before leaving home.|Give practical advice for a short trip.|Compare a cheap journey with one that costs more but has fewer risks.|Give a travel recommendation that makes assumptions and uncertainty explicit.
Say sorry for being late.|Explain a small delay politely.|Apologise for a delay and offer one useful next action.|Apologise while distinguishing context from an excuse.|Give an apology that includes accountability and a credible change in behaviour.
Name three things you like to hear.|Describe sounds in a place you like.|Explain what makes a public place pleasant for you.|Compare different people's needs in a shared noisy space.|Propose a defensible noise rule that acknowledges unequal impacts and relevant exceptions.
Say one thing you do with family.|Describe an ordinary family activity.|Explain a family habit you chose to keep.|Discuss how a family routine can adapt to changed circumstances.|Distinguish the value behind a family tradition from the particular method of keeping it.
Ask someone if they can make tea.|Ask someone how they learned a simple skill.|Ask about a skill and summarise the answer accurately.|Ask what feedback helped a person improve and why.|Ask how someone distinguished useful evidence of improvement from reassuring praise.
Say what you like about a small gift.|Describe a gift that is useful every day.|Recommend a gift for someone with a specific interest.|Compare a practical gift with an experience without assuming price equals thoughtfulness.|Explain how the ability to decline affects whether a generous gesture is considerate.
Name three things in a quiet library.|Describe the kind of place where you like reading.|Recommend a study place and explain a possible drawback.|Balance quiet study with the need to ask questions.|Assess whether a rule intended to protect concentration creates unintended barriers for beginners.
Say a short goodbye to the group.|End a conversation politely and thank the other person.|Summarise one thing you learned from a conversation before ending it.|End a disagreement by stating one genuine point of agreement.|Close a discussion by separating agreed facts, shared values and unresolved uncertainty.
Say a nice name for an imaginary cafe.|Describe a cafe with one unusual but useful feature.|Pitch a small cafe without making unrealistic promises.|Pitch a cafe while acknowledging one practical limitation.|Make a credible recommendation for a cafe while distinguishing evidence, expectations and personal taste.`);
for(const [li,l]of B.levels.entries()){
 const target=B.games['truth-or-dare'][l].dares;for(const row of dares){const q=row[li];if(!target.includes(q))target.push(q);}
}
})();
