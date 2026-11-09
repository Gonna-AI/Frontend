The first agent bug that really scared me did not throw an error. Nothing crashed, every unit test passed, and the deploy went green. A small prompt change had made our manual agent slightly more willing to accept "close enough" matches, and in staging it started citing the maintenance manual for the right machine family but the wrong variant. The torque value it quoted was real. It just belonged to a different spindle.

If a human had acted on that, they would have trusted it, because it came with a citation. That is the uncomfortable part of putting agents into factories: the failure modes look like answers.

I work on the platform side at ClerkTree, which mostly means I spend my time on the question of how we change these systems safely. This post is a walk through what DevOps looks like when the thing you ship is an agent system instead of a web service, and why a plant floor makes every one of those decisions sharper. It is fairly technical in places. I have tried to keep it concrete.

## What we actually ship

When people hear "AI agent" they often imagine one big model with a long prompt. What runs in a plant is closer to a small distributed system:

- **Connectors** that read from the plant's systems: the historian or OPC UA server for signals, the CMMS (often SAP PM) for work orders, the ERP for parts and stock, and the document store for manuals and drawings. These are read-only by default.
- **An evidence layer** that turns raw data into things an agent can cite: a vibration trend with its baseline, a manual passage with its revision and machine variant, a past work order with its outcome.
- **A set of narrow agents.** One reads signals, one searches manuals, one looks through maintenance history, one checks parts. A planner combines their findings into a recommendation and a draft work order.
- **A tool gateway** that every agent call goes through, which decides what each agent is allowed to touch.
- **A human approval step** before anything is written back to the plant's systems.

![ClerkTree runtime: read-only connectors feed an evidence layer; narrow agents call tools through a gateway; drafts go to a human for approval before anything reaches the CMMS.](/journal/devops-agents/architecture.svg)

*Figure 1. The runtime inside a plant. Arrows into the runtime are reads; the only write path goes through a person.*

Every box in that picture can change independently. The model can be upgraded, a prompt can be edited, a tool schema can gain a field, the manual index can be rebuilt because a new revision arrived, a connector can be patched because the historian vendor changed an endpoint. Any of those can change an answer. So the first rule we adopted was simple to say and annoying to implement: **everything that can change an answer is a versioned artifact.**

## The agent bundle

We package a deployable agent system as a bundle. A bundle is a manifest that pins every input to the reasoning, not just the code:

```yaml
bundle: maintenance-rca
version: 2026.11.2
model:
  planner: provider/model@2026-10-14      # pinned, never "latest"
  extractor: local/small-instruct@q4-v3
prompts:
  manual_agent: prompts/manual_agent.md#a41c9e
  planner: prompts/planner.md#77f02d
tools:
  query_historian: schemas/query_historian.json#v5
  search_manuals: schemas/search_manuals.json#v7
  draft_work_order: schemas/draft_work_order.json#v3   # write tool, approval required
retrieval:
  manuals_index: snapshots/manuals/2026-11-01T02:00Z
  chunking: by-section, keep-revision-header
policy: policies/plant-default.rego#v12
eval_gate: evals/maintenance-rca/golden-v9
```

Two things fall out of this. First, any answer the system has ever given can be replayed: given the bundle version and the input snapshot, we can reproduce the reasoning, which is the first thing you want when a technician says "why did it say that?". Second, a change to a prompt is now a change to a file with a hash, which means it goes through the same review and release path as code. That alone removed a whole category of "someone tweaked the prompt in production" surprises.

## Evaluations are the test suite

Unit tests still matter. Schemas, parsers, connectors and the tool gateway are ordinary software and get ordinary tests. But unit tests cannot tell you whether the system still finds the right root cause. For that we keep a golden set of historical incidents, each one rebuilt with the signals, documents and history that were available at the time, and the outcome that the maintenance team later confirmed.

Every candidate bundle runs against the full set before it can go anywhere near a plant. We do not look at one score. We look at a handful of measures, and each one has a gate:

| Measure | What it checks | Gate |
|---|---|---|
| Root cause correct | Named cause matches the confirmed cause | No drop vs. current release |
| Citation validity | Every number and claim traces to a real source span | 100%, no exceptions |
| Variant match | Cited documents apply to this exact machine and revision | 100% |
| Abstention | Says "not enough evidence" on incidents built to be ambiguous | Within 2 points of baseline |
| Tool-call validity | Calls match schemas and policy | 100% |
| Latency p95 | Time to a full recommendation | Under the agreed budget |

The citation and variant gates are binary on purpose. A model that is 2% better at root causes but occasionally quotes the wrong variant is not an upgrade, it is a liability. The bug from the start of this post would have been caught by the variant check, which is exactly why that check exists now.

One thing I would tell anyone building evals for industrial agents: put the hard, boring cases in. Work orders that just say "fixed". Sensors that were mounted loose for a year. Two machines with almost identical names. The model rarely fails on the clean textbook failure. It fails where the plant is messy, and every plant is messy somewhere.

## The release path

![Release path: commit, static checks, offline evaluation on the golden set, shadow mode on live data, canary on one line with approvals, then rollout. Each stage has a gate and a rollback.](/journal/devops-agents/release-pipeline.svg)

*Figure 2. How a bundle reaches a plant. Nothing skips shadow mode.*

Static checks and the offline eval run on every change. If a bundle passes, it moves to shadow mode, and this is the stage I think matters most.

### Shadow mode is our staging environment

You cannot build a realistic staging copy of a factory. The data is too specific, the edge cases too local, and half of the context lives in the heads of people on the night shift. So instead of a fake plant, we use the real one, read-only.

In shadow mode the new bundle runs alongside the current one, on live data, and produces findings that nobody acts on. We compare its output against two things: the current release, and what the maintenance team actually did. When the new version disagrees with the team, that is not automatically a failure. Sometimes the team was right and we learn something; sometimes the agent spotted something earlier. Either way the disagreement is reviewed by a person before the bundle moves on.

There is a detail here that is specific to German plants and that I did not appreciate until we worked with them: anything that compares what an agent recommended with what a technician did can look like performance monitoring of individuals. We record shadow comparisons per asset and per incident, not per person, and that is agreed with the works council up front. It is a design constraint, not a footnote.

### Canary, then rollout

After shadow mode, a bundle goes live on one line or one group of assets, with approvals required for every draft it produces. We watch override rates (how often a planner rejects or edits a draft), abstention rates, and latency. If any of those move outside their bands, the rollback is a single version pin, and because bundles are immutable, rolling back really does restore the previous behaviour, including the retrieval snapshot it was evaluated against.

## Tool access is the blast radius

In a normal service, the blast radius of a bad release is usually bad responses. With agents, it is whatever the agent is allowed to do. So the tool gateway is the part of the system I am most conservative about.

The default for a plant is read-only. Write tools exist, but they produce drafts, not actions, and they are gated by policy:

```rego
# policies/plant-default.rego (excerpt)
allow {
  input.tool.access == "read"
  input.site in data.sites[input.agent.site_scope]
}

allow {
  input.tool.name == "draft_work_order"
  input.agent.role == "planner"
  input.request.requires_approval == true      # always a draft first
  input.request.idempotency_key != ""         # retries never duplicate
}

deny[msg] {
  input.tool.name == "write_setpoint"          # never, in any plant
  msg := "control-system writes are not available to agents"
}
```

A few rules we hold firmly. Agents never write to control systems. Every write carries an idempotency key, because agents retry and a duplicated work order is a real cost. Every call, allowed or denied, is logged with the bundle version that made it. And the scope is per site: an agent deployed for one plant cannot read another plant's historian even if the credentials would technically allow it.

## Observability for reasoning

Logs and CPU graphs tell you whether the system is up. They do not tell you whether it is thinking well. For that, every recommendation is a trace: a tree of spans, one per agent step and tool call, with the retrieval hits, the evidence each step produced, token counts and timings.

![A trace for one question, "Why did CNC-07 alarm at 06:12?": signal, manual, history and parts agents run in parallel, then the planner drafts a work order. Each span lists its sources.](/journal/devops-agents/trace.svg)

*Figure 3. One question as a trace. The parallel spans are where most of the latency budget goes.*

Traces are what make the "why did it say that?" question answerable in minutes instead of days. They are also where we found most of our performance wins. In the trace above, the history agent was the slowest step for a long time, not because of the model, but because free-text work orders were being re-embedded on every query. Caching that by work-order revision cut the p95 noticeably and did not change a single answer, which the eval set confirmed.

On top of traces we track a small set of signals over time, per site:

- **Citation coverage**: share of claims in final answers that carry a source. Should be flat at 100%.
- **Abstention rate**: how often the system says it does not have enough evidence. A sudden drop is suspicious, not good news.
- **Override rate**: how often planners edit or reject drafts, broken down by asset class.
- **Drift**: when a retrofit, a new sensor or a firmware update changes what normal looks like, findings for that asset get flagged for review instead of trusted silently.

## Running where the data lives

Most of the plants we talk to will not send machine data to a public cloud, and some cannot have outbound internet at all on the production network. So "deploy" can mean very different things: a private cloud tenant, a server in the plant's own data centre, or a small machine next to the line.

That changes the DevOps story in practical ways. Bundles are signed and can be moved as a single file, so an air-gapped site can update from a verified artifact without pulling anything. We keep a mirror of the model registry for sites that run models locally. Smaller models handle extraction and classification on CPU; larger reasoning runs where a GPU is available or in the customer's private cloud. And update windows follow the plant, not us: we schedule releases around planned maintenance shutdowns, because a factory's calendar is not going to rearrange itself for our sprint.

## Where ClerkTree and industrial teams meet

Everything above exists to serve a fairly specific set of problems. When we work with industrial companies, these are the areas where agents earn their place, and each one puts slightly different demands on the platform:

| Area | What the agents do | Systems involved | What the platform must guarantee |
|---|---|---|---|
| Fault diagnosis and root cause | Turn alarms into cited explanations | Historian, OPC UA, manuals, CMMS | Variant-correct citations, abstention on thin evidence |
| Maintenance planning | Draft work orders with parts, people and timing | CMMS, ERP stock, shift plans | Draft-only writes, idempotency, approval trail |
| Spare parts and suppliers | Compare stock, alternates and quotes | ERP, supplier portals, quality records | Read scopes per supplier, no auto-ordering |
| Production performance | Explain OEE drops across shifts and lines | MES, quality systems, shift logs | Aggregation by line, not by person |
| Knowledge capture | Keep manuals, revisions and fixes findable | Document stores, past work orders | Fresh retrieval snapshots, revision awareness |
| Sovereign deployment | Run all of the above inside the plant's boundary | On-prem, private cloud, edge | Signed bundles, offline updates, fast rollback |

The pattern across all of them is the same. The model is the least plant-specific part. What makes a deployment work is how carefully the data is tied to the exact asset, how narrowly each agent is allowed to act, and how quickly we can prove what happened when someone asks.

## What I would tell my earlier self

- **Version the reasoning, not just the code.** Prompts, tool schemas and retrieval snapshots change answers. Pin them.
- **Make the important gates binary.** Accuracy can trade off. Citation validity and variant matching cannot.
- **Use the real plant for staging, read-only.** Shadow mode found more problems than any synthetic test we wrote.
- **Treat tool permissions as the blast radius.** Read-only by default, drafts instead of actions, never touch control systems.
- **Trace every answer.** The first time a technician asks "why?", you want the answer in minutes.
- **Respect the plant's calendar.** Releases fit around shutdowns, not the other way round.

None of this is glamorous. Most of it is the same discipline good platform teams already apply to services, adjusted for systems that reason and for environments where a wrong answer has a physical cost. If you run a maintenance or operations team and want to see how this looks on your own assets, or if you are an engineer who finds this kind of problem interesting, we would be glad to talk.
