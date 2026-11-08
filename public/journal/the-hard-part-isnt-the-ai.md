*This is an edited conversation between Katharina Krüger and Animesh Mishra. Katharina joined ClerkTree from a strategy background, and she asked the questions she kept hearing from operations leaders in her first months. We trimmed it for length and kept the parts where we disagreed.*

## How this started

**Katharina:** Let's start with the question everyone asks me at dinner. Why factories? You could build AI for almost anything right now. Why pick an industry where the customer's computer is sometimes older than the person running it?

**Animesh:** Because that is exactly where the gap is. Most software that gets called AI today is built for people who already live in software: marketers, analysts, developers. A maintenance technician spends most of the day with a machine, not a screen. The information they need exists, but it is scattered across a manual, a maintenance system, a parts list and the head of the colleague who has been on the line for twenty years.

**Katharina:** So the pitch is "we put it all in one place"? People have been promising that for decades.

**Animesh:** They have, and that's the part that usually fails. Putting things in one place is a data warehouse project. Nobody on the shop floor asked for a data warehouse. What they want is an answer to a specific question at the moment it matters: the spindle on CNC-07 is vibrating, what is it, how bad is it, and what do I do. If we can answer that well, the "one place" happens as a side effect.

**Katharina:** That sounds tidy. Was it that tidy at the start?

**Animesh:** Not at all. Early on we built far too much dashboard. Charts, trends, colour-coded health scores. It looked impressive in a demo and nobody opened it twice. The lesson was that a screen full of information is not the same as an answer.

## What a maintenance team actually wants

**Katharina:** When I talk to plant managers, they usually describe the problem in money: downtime, overtime, emergency parts. When I talk to technicians, they describe it completely differently. Which one do you build for?

**Animesh:** Both, but you design for the technician. If the technician doesn't trust it, the plant manager never sees the savings, because nothing changes on the floor.

**Katharina:** What does a technician want, in your experience?

**Animesh:** Less searching. The thing we hear most often is some version of "I know how to fix it, I just spend half my time finding out what it is and whether we have the part." Finding the right page in a 400-page manual. Digging through old work orders to see if this happened before. Calling the stores to check if the bearing is actually on the shelf or only in the system.

**Katharina:** And they don't want to be told how to do their job.

**Animesh:** No, and they're right. They know the machines better than any model does. So the product has to behave like a very fast colleague who did the reading, not like a supervisor. "Here is what the vibration shows, here is the page in the manual that matches it, here's what was done last time, here's the part and where it is." Then the technician decides.

**Katharina:** I'll be honest, when I joined I thought that framing was mostly marketing.

**Animesh:** What changed your mind?

**Katharina:** Watching how people react to it. When a recommendation shows its sources, people argue with the sources, not with us. "That manual revision is out of date" is a useful sentence. "The AI is wrong" is not.

## Why every answer shows its sources

**Katharina:** That brings me to the thing engineers ask me about most. Why do you insist that every claim is cited? Isn't that slower?

**Animesh:** It's slower to build and faster to use. A language model on its own will happily write a fluent explanation of a bearing failure with a torque value that sounds right and isn't from your machine. In a factory, a confident wrong number is worse than no answer, because someone might act on it.

**Katharina:** So the citation is a safety feature, not a nice-to-have.

**Animesh:** It's the core of the product. We built the system so that every number in an answer has to come from a source: a sensor reading, a manual passage, a work order, a stock record. If it can't point to one, it doesn't say it. And if the evidence is thin, the right answer is "not enough to say yet, please take one more measurement here".

**Katharina:** I remember the first time I saw it refuse to answer. My instinct was that it looked broken.

**Animesh:** Everyone's instinct is that. Then you talk to a reliability engineer, and they tell you that "I don't know yet" is the most trustworthy thing a junior colleague can say. The tools that never say it are the ones people stop believing.

**Katharina:** Is there a version of this where you trust the model enough to drop the citations?

**Animesh:** I don't think so, and I don't think customers want that. Even when the model is right, the technician needs to see why to feel comfortable acting on it. And when it's wrong, the citation is how you find out fast.

## Building trust is slower than building software

**Katharina:** Here's where I see the biggest gap between what technology people expect and what actually happens. You can build a working system in weeks. Getting a team to use it takes months. Why?

**Animesh:** Because trust is built one finding at a time. A technician with fifteen years on a line won't act on a recommendation from software they've never seen be right. They might act on one they've watched be right ten times.

**Katharina:** Which is why the rollouts start with the system just watching.

**Animesh:** Exactly. For the first weeks it runs alongside the team without changing anything. Every finding gets a quick rating: useful, not useful, already knew. Those ratings are the most valuable data we collect, more valuable than the sensor data in some ways, because they tell us what this specific team considers worth their time.

**Katharina:** What do the "not useful" ratings usually say?

**Animesh:** Things no manual will tell you. "That machine always runs hot for an hour after a weekend restart." "That sensor has been mounted loose for years." "We already planned that repair." Every one of those makes the next finding better.

**Katharina:** From the business side, the hard part is that this phase doesn't produce a headline number. Nobody's downtime goes down in week three.

**Animesh:** No. And that's where a lot of projects die. Someone wants a result before the team trusts the tool, so the tool gets pushed into decisions too early, makes a visible mistake, and that's the end of it.

**Katharina:** So the advice to a plant manager is…

**Animesh:** Measure before you start, protect the shadow phase, and judge it at the end on evidence. Not in week three, and not on impressions.

## Germany, data and the works council

**Katharina:** Let's talk about the part that surprised you most when we started working with German plants.

**Animesh:** The works council. Coming from a pure engineering background, I hadn't thought about it at all.

**Katharina:** Most founders haven't. In Germany, if a system is capable of monitoring how employees work, the works council has a say in how it's introduced and used. A maintenance tool that logs who did which repair, how long it took and whether they followed a recommendation can fall into that category, even if nobody intends to use it that way.

**Animesh:** And my first reaction, honestly, was that this would slow everything down.

**Katharina:** And now?

**Animesh:** Now I think it's one of the best things that can happen early in a project. When the works council is in the room at the start, you have to say clearly what is recorded and what it may be used for. That clarity helps everyone, including the technicians who are wondering whether this thing is secretly a performance tracker.

**Katharina:** It isn't, and saying so in writing is much more convincing than saying so in a demo.

**Animesh:** The same goes for data. A lot of plants can't send machine data outside their network at all. So the system has to be able to run where the data lives: in a private cloud, on premises, or on hardware next to the machines. Being flexible there isn't a feature, it's the entry ticket.

## What "agents" means on a shop floor

**Katharina:** "Agents" is probably the most overused word in our industry this year. What do you actually mean by it?

**Animesh:** Something quite boring, which I think is a good sign. An agent is a piece of software with one job and access to one kind of information. One reads the sensor data and turns it into evidence. One searches the manuals. One looks through past work orders. One checks parts and stock. Then a planner puts their findings together into a recommendation and a draft work order.

**Katharina:** Why split it up? Why not one big model that does everything?

**Animesh:** Because each job needs different checks. The sensor agent has to care about units and operating conditions. The manual agent has to care about which revision of the document applies to this machine. If you give all of that to one model, you lose the ability to test each part properly, and you lose the ability to show the technician where each piece came from.

**Katharina:** And none of them act on their own.

**Animesh:** Not in the sense of changing anything in the plant. They prepare. A person approves. A draft work order still goes to a planner who can accept, edit or reject it. Maybe that changes over time for low-risk tasks, but it should be the team's decision when, not ours.

## What we got wrong

**Katharina:** You promised we'd keep the parts where we disagreed. So: what did we get wrong?

**Animesh:** The dashboards, which I mentioned. We also underestimated how messy maintenance records are. Work orders that just say "fixed" or a three-word mix of German and English. We assumed we'd be able to learn a lot from history automatically, and in practice the first weeks are often spent sitting with the team and agreeing what their abbreviations mean.

**Katharina:** I'd add one from my side. Early on we talked too much about the technology and not enough about the workflow. Customers didn't need to hear about retrieval or model choices. They needed to hear who approves a work order, how it reaches their maintenance system, and what happens when the recommendation is wrong.

**Animesh:** That's fair. I still think the technology matters.

**Katharina:** It does. It just isn't the first thing anyone buys.

**Animesh:** Agreed. People buy the outcome and stay for the details.

**Katharina:** And what are you still unsure about?

**Animesh:** How far to automate. There's real pressure in the industry to let agents do more on their own, and some of it makes sense for simple, reversible tasks. But in a plant, a wrong action can stop a line or hurt someone. I'd rather we be the company that's a bit too careful than the one that has to explain an incident.

## What comes next

**Katharina:** Last question. If a plant manager reads this and wants to try it, what should they do first?

**Animesh:** Pick a small number of machines that matter, ideally ones the team already complains about. Make sure there's some data and some history. Write down what success would look like before starting. And make sure one person from maintenance owns it, not someone from IT and not us.

**Katharina:** And if they're not ready?

**Animesh:** Then start by getting the basics in order: readable signals, a maintenance system people actually use, manuals that are findable. None of that is wasted, with or without us.

**Katharina:** That's a very un-salesy answer.

**Animesh:** It's the honest one. The plants that get the most from this are the ones that were already taking their maintenance data seriously. We just make that data answer questions faster.

*If you run a maintenance or operations team and want to continue this conversation with us, we'd be glad to talk.*
