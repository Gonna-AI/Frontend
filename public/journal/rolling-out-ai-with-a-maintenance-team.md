Most industrial AI pilots do not fail because the model is weak. They fail in week six, in a meeting where the maintenance lead says the alerts are noisy, nobody has looked at the dashboard since the kickoff, and the plant manager asks what the project has actually changed. By then the budget is spent and the technicians have quietly decided the tool is for management, not for them.

We have seen this pattern often enough that we now run every rollout with the same 90-day structure. It is not complicated. It is mostly about doing things in the right order: choosing the right first machines, measuring before changing anything, earning the technicians' trust before asking them to act on a recommendation, and deciding at the end on evidence rather than enthusiasm.

This is that playbook. It is written for maintenance leads, plant managers and operations directors who are considering AI for maintenance, and it applies whether you work with us or not.

## Before day one: choose the first assets carefully

The single biggest decision in a rollout is which machines go first. Teams tend to pick either the whole plant, which is too much to learn from, or the newest, best-instrumented line, which rarely has the problems that justify the project.

We score candidate assets on three things.

| Factor | Question to ask | What good looks like |
|---|---|---|
| Criticality | What does an hour of unplanned downtime cost here? | A bottleneck or a machine with no redundancy |
| Data readiness | Are there signals, a manual and a work order history? | Sensors or a PLC with readable tags, at least a year of CMMS records |
| Pain | Does the team already complain about this asset? | Repeat failures, long diagnosis times, frequent emergency parts orders |

A machine that scores high on all three is the right place to start. One that is critical but has no data needs instrumentation first, which is a separate project. One with perfect data but no pain will produce a pilot nobody cares about.

Keep the first scope small: typically three to eight assets on one line or in one area, looked after by the same team. That is enough to see patterns and small enough that every finding gets discussed.

Write down the questions you want answered at day 90 before you start. For example: does the system flag developing faults early enough to plan the repair? Does it shorten diagnosis? Do technicians use it without being reminded? Questions written later tend to be the ones the results happen to answer.

## Days 1–15: baseline and access

### Measure where you are

You cannot show improvement against a number you never recorded. Before anything changes, pull a baseline from the CMMS for the chosen assets, ideally over the last 12 months so seasonal effects show up:

- **Mean time between failures (MTBF)**: operating time divided by the number of failures.
- **Mean time to repair (MTTR)**: total repair time divided by the number of repairs, ideally split into diagnosis, waiting for parts, and the repair itself.
- **Planned versus unplanned work**: the share of maintenance hours that were scheduled in advance. Mature teams aim for most work to be planned; many plants are well below that.
- **Preventive maintenance compliance**: the share of scheduled PM tasks completed on time.
- **Emergency parts orders**: how often a repair waited for a part that was not in stock.

The data will be imperfect. Failure codes will be missing, repair times will be rounded, and some work will never have been logged. That is fine. Note the gaps, agree on how to count, and use the same method at day 90. A consistent imperfect baseline is far more useful than a perfect one that never gets finished.

Talk to the people as well as the database. Ask the two or three most experienced technicians which failures they dread, how they diagnose them today, and where they lose time. Their answers will shape what the system needs to show them, and they are usually right about where the problems are.

### Get data access right the first time

Access is where weeks disappear. Three groups need to agree, and it is faster to bring them together in one meeting than to collect approvals one by one.

- **OT / automation** owns the machines and the network they sit on. The standard approach is read-only access to an existing historian or an OPC UA server, so nothing writes to a controller. Many plants organise their networks into zones and conduits along the lines of IEC 62443; the connection should fit that structure rather than punch a hole through it.
- **IT and security** will ask where data goes, who can see it, and how it is encrypted. Have answers ready for deployment options: cloud, private cloud, or on-premises for plants that cannot send data out at all.
- **Data protection** comes in as soon as work orders contain names, which they almost always do. In the EU that means a data processing agreement and clarity about what personal data is processed and why.

### Involve the works council early

In Germany, and in similar forms elsewhere in Europe, systems that are capable of monitoring employee behaviour or performance are subject to co-determination by the works council (Betriebsrat), under section 87(1) no. 6 of the Works Constitution Act. A maintenance system that logs who did which repair, how long it took, and whether a recommendation was followed can fall into that category even if nobody intends to use it that way.

Bring the works council in at the start, explain what is and is not recorded, and agree in writing how the data may be used. It is far better than having the project paused at day 40. In our experience works councils are not opposed to tools that make technicians' work easier; they are opposed to surprises.

## Days 16–45: shadow mode

For the first month of operation the system runs alongside the team without changing how work is done. It watches the signals, reads the history and produces findings, but nobody is asked to act on them.

This stage exists for one reason: trust. A technician who has spent fifteen years listening to a spindle will not act on a recommendation from software he has never seen be right. They might act on one they have watched be right ten times.

### Review every finding

Every finding the system raises gets a quick rating from the technician who knows the asset: useful, not useful, or already known, with a sentence on why. This takes seconds per finding and produces the most valuable data in the whole project.

- "Not useful, the vibration rises every time we run program 14" tells you the system needs to learn that operating state.
- "Already known, we planned that bearing change last week" tells you the system needs to read the planned work orders.
- "Useful, we would have missed that" is the sentence you are looking for.

### Hold a short weekly review

Thirty minutes, same time every week, with the maintenance lead, one or two technicians, and whoever is configuring the system. Look at the findings from the week, the ratings, and anything that was missed. Adjust thresholds and operating states. Fix the data problems that the reviews uncover; there will be several.

### Make every finding explain itself

A finding that says "anomaly detected, score 0.87" is ignored by week two. A finding that says "vibration at 147 Hz on the drive-end bearing, three times the normal level for this speed, matching the outer race frequency of the installed 6205-2RS; the same bearing was replaced here 14 months ago" gets read, because a technician can check every part of it. Insist on findings that show their evidence and their sources. It is the difference between a tool the team argues with and one they argue for.

Shadow mode is also where tribal knowledge gets captured. When a technician explains why a finding is wrong, write it down and feed it back. Over a month the system learns things that are written in no manual, such as which machine always runs hot after a weekend restart, or which sensor has been mounted loose since 2021.

## Days 46–75: assisted work

Once findings are consistently rated useful, the system starts contributing to real work, with a person approving every step.

### From finding to draft work order

A useful finding becomes a draft work order in the CMMS: asset, suspected cause, recommended action, the procedure reference, the required parts and a suggested time window, with the evidence attached. A planner or the maintenance lead reviews it and approves, edits or rejects it. Nothing is scheduled automatically.

Define the approval rules explicitly. Who can approve what? Is there a threshold, such as cost, downtime or safety relevance, above which a second person signs off? What happens to drafts nobody looks at for three days? Writing these rules down early avoids both bottlenecks and accidental automation.

### Connect parts and planning

Much of the real value appears here, not in the diagnosis. A finding that arrives two weeks before failure is only useful if the part is in stock and the repair fits a planned stop. Check stock and lead time as part of the draft. If the part is not in stock, the draft should say so and suggest ordering it, because "we knew, but the part took nine days" is still unplanned downtime.

Align with production planning. A repair window that suits maintenance but stops the bottleneck during a rush order will be refused. Proposing windows inside existing planned stops, shift changes or low-load periods makes approval much easier.

### Keep the feedback loop running

Every completed work order closes the loop. Was the predicted cause what the technician found? Was the part right? How long did the repair actually take? These answers improve the next finding, and they become the evidence for the day-90 decision.

## Days 76–90: measure and decide

### Compare against the baseline, carefully

Recompute the baseline metrics for the same assets using the same method. Then be honest about what else changed. Production volume, product mix, staffing and season all move maintenance numbers. Ninety days is short; one avoided failure on a bottleneck can dominate the result, in either direction.

The quantitative picture usually includes:

- Failures that were flagged early and repaired in a planned window, with an estimate of the downtime that would otherwise have occurred.
- Changes in diagnosis time for incidents the system was involved in.
- Changes in emergency parts orders.
- The share of findings rated useful in the final weeks compared with the first.

The qualitative picture matters as much. Are technicians opening the system without being asked? Do they cite it in shift handovers? Did the weekly review become shorter because fewer findings needed discussion? These are the signals that a tool will survive after the project team moves on.

### Decide on evidence

At day 90 there are three honest outcomes:

1. **Scale.** The findings are trusted, the workflow is in place, and the numbers point the right way. Extend to the next line, using the same scoring to choose assets.
2. **Adjust.** Parts of it work. Perhaps diagnosis is useful but the early warnings are too noisy, or the data on one machine is too poor. Fix those specific issues and run another 45 days.
3. **Stop.** The data is not good enough, or the problems were not the kind the system addresses. Stopping is a valid result and much cheaper at day 90 than at day 400.

Agree on these criteria at the start, ideally in the same document as the day-90 questions. It prevents the decision from becoming a negotiation.

## The people part

Every successful rollout we have seen had one maintenance lead who owned it. Not an IT project manager and not a vendor, but the person whose team does the work. They set the tone in the weekly review, defend the time for ratings, and decide when the system has earned the next step.

Treat technicians as the experts they are. The system's job is to do the tedious part of the investigation: pulling the history, finding the manual page, checking stock. Their job is judgement. When a tool is framed that way, adoption follows. When it is framed as something that checks their work, it does not, and no model accuracy will fix that.

Training is short when the tool explains itself. A one-hour session at the start of shadow mode, and fifteen minutes at the start of assisted work, is usually enough. What helps more is a named person to ask when something looks wrong, and a visible record that their feedback changed something.

## Common pitfalls

- **Starting plant-wide.** Too many assets, too many people, no time to discuss any single finding properly.
- **Skipping the baseline.** Without it, day 90 becomes a debate about impressions.
- **Black-box alerts.** Scores without evidence are ignored within weeks.
- **Automating before trust.** Creating work orders automatically in month one teaches the team to reject them.
- **Forgetting parts and planning.** An early warning without a part in stock or a repair window is just an early worry.
- **Leaving the works council for later.** A paused project costs more than an early meeting.
- **No owner on the maintenance side.** Projects owned by IT or by a vendor end when the project plan ends.

## A one-page checklist

| Phase | Done when |
|---|---|
| Before day 1 | 3–8 assets scored and chosen, day-90 questions and decision criteria written down |
| Days 1–15 | Baseline metrics recorded, read-only data access live, data protection and works council agreements in place |
| Days 16–45 | Every finding rated, weekly review running, false-positive causes fixed |
| Days 46–75 | Draft work orders flowing into the CMMS with approval rules, parts and windows checked |
| Days 76–90 | Metrics recomputed with the same method, qualitative feedback collected, decision taken |

## Closing

None of this is specific to one vendor or one model. It is what we have learned about introducing any decision-support tool into a team that already knows its machines well. The technology has to earn its place on the shop floor, finding by finding, and the rollout should be designed to let it do that.

If you are planning a first rollout and want a second opinion on asset selection, baseline metrics or data access, we are happy to talk it through, whether or not you end up working with us.
