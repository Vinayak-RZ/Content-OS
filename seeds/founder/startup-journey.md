# startup-journey.md — The Stamped Story

> This file covers the full arc of Stamped: where it started, how it evolved,
> what was learned, where it is now, and where it's going.
> Use this to write content about the startup journey, founder decisions, and market positioning.
> It is honest and confident — the real story, told clearly.

---

## The Company (Current State)

**Stamped** is fraud prevention infrastructure for insurance companies that operates across the entire claims lifecycle.

Fraud costs insurers globally roughly 10–15% of total premiums annually. The core problem is structural: most fraud tools analyze evidence after it's been submitted, by which point the damage is already done. And those tools are all single-step — document verification, OCR, vehicle inspection, risk scoring — each solving one isolated piece. Fraud doesn't work that way. It operates across entities, across time, across the entire lifecycle.

Stamped operates across four layers:
1. **Capture-time verification** — device integrity, GPS, and timestamp binding at the moment evidence is created. Evidence can't be faked at source.
2. **Claim intelligence** — AI-based anomaly detection, cost benchmarking against regional norms, bill verification to catch inflation, phantom procedures, and FWA (Fraud, Waste, and Abuse).
3. **Network-level fraud detection** — cross-entity pattern detection across garages, hospitals, agents, and policyholders. Sees the collusion that no single-claim tool can see.
4. **Investigation and audit layer** — AI agent-powered case creation, full evidence chain of custody, compliance-ready reporting.

The real moat: the entity intelligence graph. The more claims processed, the better the system gets at detecting patterns that don't exist in any single claim. That network effect compounds. No post-hoc analytics vendor can replicate it — you have to be at the point of capture, processing at volume, to build it.

Starting with motor insurance (image-based claims, frequent, fraud-dense). Expanding into health, life, home, travel over time.

Main market gap being there is no single platform that works end-to-end, that sees across all the different insurances like health, motor, and life, that integrates into how claims actually flow. Everyone is stitching together 3–5 vendors and still losing 10–15% of premiums.

**Business model:** B2B SaaS + usage-based. Large insurers pay an annual platform license ($1M–$3.5M depending on scale) plus per-claim fees (~$0.5–$2). One-time integration fee. TPA partners on outcome-based revenue share.

**Current status:** 2 active pilots with real insurers on live claims data. Both currently free — validating performance in production, building real-world stats. Conversion to paid is the natural next step post-validation.

---

## The Co-Founders

**Utso Sarkar** — the person Vinayak has built almost everything with. Backend systems, core infrastructure, overall architecture. They've been collaborating since sophomore year across more projects than either can count — Astrikos, Chrono, Chronicle, Merge Conflict, and now Stamped. The dynamic is close, complementary, and tested. When they decided to go all-in in January, it was a joint decision made with full clarity.

**Vinayak Raizada** — product thinking, business strategy, system design, implementation. The one who holds the full picture: what's being built, why it matters, how it reaches customers, what it should cost, what it should feel like. Technical enough to build anything. Founder-minded enough to ask whether it should be built that way at all.

**Dhanraj Kumar** — came in about two months after Vinayak and Utso had already started. Purely technical focus — engineering and system development. In practice, Vinayak defines what needs to be built and distributes tasks; Dhanraj executes on the technical side. Equal equity split: 33/33/33.

All three have met and worked together in person. They've been in the same ecosystem — IIT Roorkee, MDG Space — for over two years.

---

## Where It Started — The B2C Idea (January 2025)

The original idea: let users cryptographically verify that their photos and videos were real at the point of capture, not AI-generated.

The timing felt right. AI-generated content was everywhere. Misinformation was a real and growing problem. The technical core — verified evidence at capture, invisible watermarking that survives compression and screenshots — was something Vinayak had already been researching and building. He'd built a v1 watermarking library that worked across WhatsApp compression and a range of transformations. This was not a vague idea — it was a worked problem with a working prototype.

The problem was real. The product was real. Consumer willingness to pay was not there.

Nobody was going to pay a subscription to prove their photos were authentic. The urgency wasn't felt by the end user. The pain wasn't financial in a direct enough way. B2C was killed fast — not after months of hoping it would work, but after honest conversations and pattern recognition. They moved to B2B.

---

## First B2B Pivot — Image Authenticity Infrastructure

The same core capability — verified evidence at point of capture — has direct financial consequences in business contexts when it fails. That reframe opened everything.

They targeted logistics, insurance, and construction: industries where images are used operationally and where bad evidence has real costs.

The positioning: "image authenticity infrastructure." A layer that verified captures were tamper-proof before they entered any system. The hypothesis was that the capture layer was the product.

That hypothesis broke down fast. They talked to 30+ customers across markets. The feedback was consistent: yes, this is useful. No, this is not a burning problem. And also — fraud isn't just coming from images. It's coming from everywhere. They wanted fraud to stop. Not a better capture SDK.

---

## The Real Turning Point — YC Startup School, Bangalore

This is where the idea found its final shape.

At YC Startup School India in Bangalore, they spent serious time in direct conversations with operators across insurance, logistics, and construction. Not pitching. Listening.

What came through in every conversation: the fraud problem is not a technology problem. It's a systems problem. Evidence, decisions, and enforcement are unreliable at every step. A garage colludes with a surveyor. A hospital inflates bills systematically. A repeat offender files across multiple insurers. No single tool sees any of this because everyone operates in silos.

The financial framing was clarifying. Insurance is a business defined by the tension between premiums collected and claims paid out. Every dollar lost to fraud, bill inflation, or wasteful payouts directly compresses margins. The companies they spoke to weren't treating this as a compliance checkbox — they were treating it as an existential cost problem with no good solution in sight. Every percentage point improvement in claims integrity falls directly to the bottom line.

And when they looked at what existed in the market: fragmented point solutions. Document verification. Vehicle inspection. OCR. Risk scoring. Each solving one step in isolation. No unified platform that works end-to-end, that sees across entities and time, that integrates into how claims actually flow. Everyone stitching together 3–5 vendors and still losing 10–15% of premiums.

That's the gap. Not a feature gap. A category gap.

---

## What Stamped Actually Is — The Full Realization

The pivot from "image authenticity infrastructure" to "fraud prevention infrastructure" is not just a positioning change. It's a fundamental expansion of what the product does and what moat it builds.

Image authenticity tools are single-layer. They check one thing at one moment. Fraud prevention infrastructure is multi-layer, cross-entity, time-aware. The product sees patterns across thousands of claims, across multiple garages, across multiple time periods. The intelligence compounds with every claim processed.

That network effect is the moat. FRISS and Shift Technology exist globally but aren't built for how Indian insurance (or emerging market insurance broadly) actually works — the workflows, the fraud patterns, the regulatory environment. Local solutions are all point tools. The unified, lifecycle-level platform doesn't exist.

The lesson from every conversation, distilled: **companies don't buy features, they buy outcomes.** The outcome they want is fraud prevention across the whole claims lifecycle. That's what Stamped is.

---

## The Decision to Go All-In (January 17, 2025)

Around January 17th, Vinayak and Utso made a formal decision: no intern season. All-in on Stamped.

Intern season at IIT Roorkee is the primary career track. CP, DSA, placements — this is what most students optimize for. Opting out means opting out of the conventional safety net. Pretty much everyone Vinayak talked to told him to take the job first, start the startup after, keep a fallback.

He disagreed. Not because the argument wasn't logical — it was. But because that's not the kind of accountability he wanted to hold. If there's a fallback, there's always a reason not to push hard enough. He wanted the weight of it. All of it.

That decision was made clearly, without drama, and hasn't been second-guessed.

---

## Where Things Are Now

- Core architecture defined across all four layers
- Working prototypes for evidence capture and verification built
- 2 active pilots with real insurers on live claims data, with agreed success metrics
- Both pilots currently free — in production validation phase, building real-world performance data
- Conversion to paid is the next milestone
- Motor insurance is the current build focus
- Team: three technical co-founders, all building, no outsourced work

The goal: get to a production-ready, sellable product. Acquire first paying customers. Build distribution. Raise funding.

---

## What They Believe That Others Don't

1. **Fraud is a lifecycle problem, not a detection problem.** Every competitor works after submission — analyzing data that may already have been manipulated. That's too late.

2. **The entity intelligence graph is the real product.** Not the capture layer. Not the anomaly detection. The network of entities and patterns that builds with every claim processed. That's what no point solution can replicate.

3. **India is the right place to build this first.** High fraud rates, inefficient workflows, a large and growing insurance market, and regulatory pressure now mandating systematic fraud prevention. The problem is acute and the timing is right. International expansion (Southeast Asia, Middle East, US) is the natural second chapter.

4. **Technical founders building infra-level products have a genuine edge here.** The incumbents are legacy SaaS companies. The local players are thin tools. A systems-oriented team that thinks in infrastructure, not features, and that builds from first principles — that's actually rare in this market.

---

## The Hard Parts (Honest Version)

The pivots sound clean in retrospect. They weren't.

The B2C idea had real technical work behind it — the watermarking library, the image processing, the mobile app, the C++ work. Letting that go wasn't trivial. It felt like abandoning something that was genuinely working technically because the market didn't care enough. That's a specific kind of frustration.

The 30+ customer conversations in B2B before finding the right framing were not all good conversations. Most of them weren't going anywhere. The feedback was polite and vague. The signal only became clear in aggregate, and only after the Bangalore trip gave sharper, more direct feedback from more senior people.

The pilots being free is both a validation and a reminder that they haven't sold anything yet. Two real insurers using the product is real. Zero revenue is also real. The gap between those two facts is where they're operating right now.

Opting out of intern season was the right call — Vinayak is clear on that. But it's also a one-way door. There's no going back to that track now. That's not a complaint. It's just the weight of the decision, which is worth acknowledging.

The hardest ongoing thing: knowing what to build versus what to learn versus what to sell, all at the same time, with a small team and no external capital yet. The bandwidth required is real. The uncertainty is permanent. That's the job.


- Indian insurance fraud: ~$5B annually, ~10–15% of total premiums
- Global fraud detection market: $300M+ in India alone, growing at 26%+ CAGR
- Unit economics example: mid-size insurer, 500K motor claims annually → $1M+ annual revenue for Stamped, 4–8x ROI for them
- 5-year target: ₹200–350 crore ARR from Indian market, with international upside beyond

---

## Competitive Landscape (Brief)

**Global:** FRISS, Shift Technology, Tractable — not built for emerging market workflows, fraud patterns, or regulatory environments.

**India:** Fragmented internal tools, TPAs with limited fraud capabilities, single-step OCR/risk vendors.

**The gap they all share:** post-submission analysis, claim-level isolation, no lifecycle view, no entity intelligence. They see individual claims. Stamped sees the network.