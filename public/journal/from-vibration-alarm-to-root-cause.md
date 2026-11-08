A vibration alarm is the least useful thing a maintenance team receives all week. Not because it is wrong, but because it answers the easy question. Something changed on CNC-07. Fine. The questions that cost money come right after: what is actually failing, how long do we have, has this happened before, which part do we need, and who should do the work.

The answers to those questions already exist inside most plants. They are spread across a 400-page machine manual, a CMMS full of free-text work orders, a parts catalogue, a historian with years of sensor data, and the memory of the two technicians who have been on that line the longest. What is missing is the work of connecting them, quickly, every time.

This post is about how we build the agents that do that connecting. It is not a model announcement. Almost everything that makes the difference sits in the plumbing around the model: how a signal becomes evidence, how a manual becomes searchable, how work-order history becomes memory, and how an answer is forced to show where every claim came from. We will walk through each part with the same example: a spindle bearing on a machining centre.

## The four facts behind every root cause

When an experienced reliability engineer explains a failure, the explanation almost always contains four things:

1. **Signal evidence.** What was measured, how far it moved from normal, and in which pattern.
2. **A mechanism.** Which physical failure produces that pattern, and why the alternatives fit worse.
3. **History.** Whether this asset, or one like it, has failed this way before, and what fixed it.
4. **An action.** The part, the procedure, the people and the time window to fix it.

A general-purpose language model can write all four in fluent prose without having any of them. That is the core problem. The model has read about bearings, but it has not read your manual, your work orders or your sensor data. So the design goal is simple to state: every one of the four facts must come from a source inside the plant, and the answer must say which source.

We split the work across small agents, each responsible for one kind of evidence, and a planner that assembles the answer only from what they return.

| Agent | Reads | Returns |
|---|---|---|
| Signal agent | Historian, live OPC UA tags | Features, deviations, matched fault frequencies |
| Manual agent | Manuals, drawings, service bulletins | Passages with section, page and revision |
| History agent | CMMS work orders, failure codes | Similar past incidents and their fixes |
| Parts agent | ERP stock, bill of materials | Part numbers, stock, lead time |
| Planner | Only the outputs above | Root cause, confidence, draft work order |

The planner never sees the raw world. It sees typed evidence objects, each with an id it must cite. That one constraint removes most hallucinated detail before it starts.

## Step 1: Turning a signal into evidence

Raw vibration is not evidence. A single RMS value of 7.8 mm/s means nothing until you know the machine, the speed, the load and what normal looks like for that combination.

### Baselines per operating state

The most common source of false alarms is comparing a reading against one global threshold. A spindle running at 6,000 rpm under heavy cut vibrates differently from the same spindle idling. So the signal agent learns a baseline per operating state, keyed on the variables that change vibration legitimately: speed band, load band and, where available, the tool or program running.

A deviation is then reported relative to the matching baseline, not to a fixed limit. "7.8 mm/s, 3.7 times the baseline for this speed and load band, rising over six hours" is evidence. "7.8 mm/s, above 7.1" is just a number.

### Features that point to mechanisms

Overall RMS tells you that energy increased. It does not tell you where it came from. For rotating equipment we compute a small set of features that separate failure modes:

- **RMS velocity** for overall severity, comparable with ISO 10816 / ISO 20816 zones.
- **Crest factor and kurtosis** of acceleration, which rise early with impacting faults such as bearing defects, often before RMS moves.
- **Envelope spectrum**, which demodulates the high-frequency ringing caused by a defect striking a rolling element and exposes the repetition rate of the impacts.
- **Orders of running speed** (1×, 2×, harmonics), which separate imbalance and misalignment from bearing faults.

### Matching bearing defect frequencies

The envelope spectrum is where the mechanism starts to show. Each bearing defect produces impacts at a predictable rate that depends only on geometry and shaft speed. For a bearing with `n` rolling elements, ball diameter `d`, pitch diameter `D`, contact angle `φ` and shaft frequency `fr`:

- Outer race (BPFO) = (n / 2) × fr × (1 − (d / D) × cos φ)
- Inner race (BPFI) = (n / 2) × fr × (1 + (d / D) × cos φ)
- Ball spin (BSF) = (D / 2d) × fr × (1 − ((d / D) × cos φ)²)
- Cage (FTF) = (fr / 2) × (1 − (d / D) × cos φ)

Take a 6205-2RS deep groove ball bearing: 9 balls, ball diameter about 7.94 mm, pitch diameter about 39.0 mm, contact angle close to zero. With the spindle at 2,460 rpm, the shaft frequency is 41 Hz and the geometry ratio d / D is about 0.203:

- BPFO ≈ 4.5 × 41 × 0.797 ≈ **147 Hz**
- BPFI ≈ 4.5 × 41 × 1.203 ≈ 222 Hz

If the envelope spectrum shows a clear peak at 147 Hz with harmonics at 294 and 441 Hz, and kurtosis has been climbing for days, that is a strong, specific pattern: an outer race defect. If the peak instead sits at 222 Hz with sidebands spaced at 41 Hz, the inner race is the better fit, because an inner race defect rotates with the shaft and is modulated by it.

None of this is new. Vibration analysts have done it by hand for decades. The point is to do it automatically, for every alarm, with the bearing geometry pulled from the plant's own bill of materials rather than assumed.

### What the signal agent returns

The output is a structured object, not prose. The planner can cite it, and a technician can check it.

```json
{
  "id": "sig-cnc07-0412",
  "asset": "CNC-07 / spindle / drive end",
  "state": { "speed_rpm": 2460, "load_band": "medium" },
  "rms_velocity_mm_s": { "value": 7.8, "baseline": 2.1, "ratio": 3.7, "trend": "rising_6h" },
  "kurtosis": { "value": 6.4, "baseline": 3.1 },
  "envelope_peaks_hz": [147.2, 294.1, 441.0],
  "matched_frequencies": [
    { "name": "BPFO", "expected_hz": 147.0, "bearing": "6205-2RS", "match": 0.98 }
  ],
  "data_quality": { "gaps": false, "sensor": "accelerometer, drive end, 2 kHz" }
}
```

Two fields matter more than they look. `data_quality` lets the planner lower its confidence when the sensor dropped out or was mounted in a poor location. And `matched_frequencies` carries the bearing designation, which becomes the key that the manual, history and parts agents all search on.

## Step 2: Making manuals retrievable

Machine manuals are not essays. They are hierarchies of sections, tables of tolerances, exploded drawings with item numbers, part lists, warnings and revision notes. Most of the value sits in tables and short numbered steps. Treating a manual as a long string and cutting it into fixed 500-token chunks destroys exactly that structure.

### Chunk by structure, not by length

We parse manuals into their own hierarchy first: chapter, section, subsection, procedure step, table. A chunk is a meaningful unit, such as one procedure, one table or one subsection, and it carries its full path as context. A step that says "tighten to 45 Nm" is useless on its own. Stored as "Section 4.3 Spindle bearing replacement › Step 7 › Tighten clamping nut to 45 Nm", it can be found and cited.

Tables stay whole. A tolerance table split across two chunks produces answers that pair the right parameter with the wrong value. If a table is too large, we split it by rows and repeat the header in every piece.

Every chunk keeps its metadata: machine model, manual title, **revision**, section number and page. Revision matters more than people expect. Plants often hold three versions of the same manual, and the older one may specify a different bearing or torque. The retrieval layer prefers the revision that matches the installed machine, and the answer states which revision it used.

### Part numbers break pure vector search

Embedding-based search is good at meaning. Ask about "bearing noise at high speed" and it will find passages about "running noise in the spindle bearings" even with no shared words. It is bad at identifiers. To an embedding model, "6205-2RS", "6205-2RSH" and "6206-2RS" look almost identical, yet they are different parts.

So retrieval is hybrid:

- **Keyword search (BM25)** over normalised identifiers: part numbers, error codes, drawing item numbers, section numbers.
- **Vector search** over the text for symptoms, procedures and explanations.
- **A reranker** that scores the merged candidates against the full question and the evidence object, not just the query text.

Normalisation does a lot of quiet work. "6205 2RS", "6205-2RS1", "6205-2RSH/C3" and a manufacturer's internal code may all refer to the same or interchangeable bearings. We maintain a mapping from the plant's bill of materials so that the manual agent searches every alias, and so the parts agent can tell the difference between "same part" and "compatible part".

### Scanned PDFs and drawings

A surprising share of manuals are scanned. OCR gets most body text right and gets tables and small print wrong. We run layout-aware OCR, keep page images alongside the extracted text, and flag low-confidence regions. When the manual agent cites a low-confidence passage, the answer links to the page image so a technician can read the original instead of trusting the extraction.

## Step 3: Work order history as memory

The CMMS is the plant's memory, and it is messy. A typical closed work order reads something like "spdl laut, Lager getauscht, i.O." Short, mixed German and English, abbreviations that only make sense to the team that wrote them. Yet that line says the spindle was loud, the bearing was replaced, and the result was fine. That is exactly the precedent a new incident needs.

### Normalising free text

We extract a small, consistent structure from each work order: asset, component, failure mode, cause where stated, action taken and outcome. The taxonomy follows the spirit of ISO 14224, which defines equipment hierarchies and failure modes for maintenance data, simplified to what a given plant actually records. Abbreviations and local terms are mapped once with the maintenance team, and the mapping is reused.

The extraction is not perfect, so every normalised field keeps a pointer to the original text. When the history agent cites "bearing replaced on CNC-07 in March, no repeat for 14 months", the technician can open the original work order and see the words the colleague actually wrote.

### Finding similar incidents

Similarity is not only text similarity. Two incidents are similar when they share asset class, component and failure mode, and when their signal signatures look alike. The history agent searches on all of these:

- Same asset first, then same model, then same component type across the plant.
- Same failure mode or symptom.
- Signal signatures with matched fault frequencies, where historical data exists.
- Recency, with older incidents weighted down but not ignored.

The output is a short list of precedents with what was done and what happened next. A precedent where the bearing was replaced and the vibration returned within a month is as important as one where the fix held. It suggests the cause was upstream, such as misalignment or lubrication, and that replacing the bearing alone will not be enough.

## Step 4: Reasoning with citations, and knowing when to stop

With evidence in hand, the planner writes the answer. Three rules govern it.

### Every claim cites a source

The planner may only state facts that appear in an evidence object, and it must cite the object's id. A post-check verifies this mechanically: every number in the answer, whether a frequency, a torque, a part number or a date, must appear in a cited source. If it does not, the sentence is removed or the answer is regenerated. This is crude and it works. Most hallucinated detail in technical answers takes the form of plausible numbers, and plausible numbers are easy to check.

### Alternatives are named and ruled out

A useful root cause explains why the other candidates fit worse. If the evidence shows a BPFO match with no significant 1× component, the answer says that imbalance is unlikely because there is no peak at running speed. Engineers trust answers that show their elimination, because that is how they reason themselves.

### Abstaining is a feature

When the evidence is thin or contradictory, the right answer is "not enough evidence yet", together with the one measurement that would settle it. If the vibration pattern fits both an outer race defect and looseness, and there is no temperature data, the planner asks for a temperature reading or a second vibration measurement on the non-drive end, instead of guessing.

A finished answer for our example reads like this:

> **Likely cause:** outer race wear on bearing 6205-2RS, spindle drive end (confidence: high).
>
> **Evidence:** envelope peak at 147 Hz with harmonics, matching BPFO for this bearing at 2,460 rpm [sig-cnc07-0412]. Kurtosis doubled over six hours [sig-cnc07-0412]. Manual §4.3 (rev. C) lists outer race wear as the cause of this pattern with rising temperature [man-4.3-c].
>
> **History:** same bearing replaced on this spindle 14 months ago, rated for 12 months under this duty cycle [wo-1874].
>
> **Ruled out:** imbalance (no significant 1× component), misalignment (no 2× peak or axial increase) [sig-cnc07-0412].
>
> **Action:** replace bearing 6205-2RS following §4.3 steps 1–12, clamping nut at 45 Nm [man-4.3-c]. Four in stock in bay B-12 [erp-stock]. Suggested window: Tuesday 06:00 shift, about 1.5 hours.

Everything in that answer can be clicked and checked. That is the bar.

## Step 5: Evaluating it honestly

It is easy to build a demo that looks right on three hand-picked incidents. It is harder to know how a system performs on the incidents a plant actually has. We evaluate against history.

### Build the test set from closed work orders

The best test cases are past incidents where the root cause was confirmed: the part was replaced, the failure was inspected, and the work order says what was found. We replay the data that was available before the fix, sensor history, the manual revision in use and work orders up to that date, and ask the system for a root cause. No information from after the event is allowed in, which is the most common way such evaluations accidentally cheat.

### Measure more than accuracy

- **Root-cause accuracy**, top-1 and top-3, against the confirmed cause.
- **Citation precision**: the share of claims that are actually supported by the passage they cite. We sample and check these by hand, because a judge model will happily approve a fluent but unsupported sentence.
- **Abstention quality**: when the system says "not enough evidence", was it right to? An abstention on a case a technician solved from the same data counts against it.
- **Time to answer**, because an answer that arrives after the technician has already opened the machine is worth less.

We report results per asset class rather than one average. A system can be excellent on spindle bearings and weak on hydraulic presses, and a single number hides that.

## What still goes wrong

Some failure modes are worth naming because every team building this will meet them.

- **Unit and scale mismatches.** Velocity in mm/s versus in/s, acceleration in g versus m/s², peak versus RMS. One wrong conversion produces a confident, wrong severity. Units are validated at ingestion, not at answer time.
- **Stale bills of materials.** If the BOM still lists the bearing that was swapped for a different model two years ago, the defect frequencies are computed for the wrong geometry. We flag frequency matches that rely on BOM entries older than the last related work order.
- **One snapshot is not a trend.** A single high reading after a tool change or a crash is not a bearing fault. The signal agent requires persistence across operating states before it calls a degradation.
- **Language.** Manuals in English, work orders in German, technicians speaking both. Retrieval and extraction run in both languages, and the answer is written in the language of the person asking.
- **Over-trusting the history.** "We always replace the bearing" can encode a habit, not a cause. Precedents where the same fix was repeated several times are surfaced as a warning, not as reassurance.

## Closing

The model matters less than people think, and the evidence pipeline matters more. A plant that already has a historian, a CMMS and its manuals has most of what it needs to get specific, checkable answers to "what is failing and what do we do". The work is in making those sources speak to each other, and in refusing to let the answer say anything they do not support.

If you run a maintenance team and want to see this on your own machines and documents, we would be glad to walk through it with your data.
