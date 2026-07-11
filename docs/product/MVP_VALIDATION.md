# MVP and product-validation plan

**Status:** Proposed learning plan  
**Owner:** Product  
**Last updated:** 2026-07-11  
**Related:** [PRD](PRD.md) · [Product strategy](PRODUCT_STRATEGY.md)

## 1. Objective

Prove or disprove that expert pricing consultants obtain meaningful value from one connected loop:

```text
Ambiguous brief
→ active research and reviewed evidence
→ human/AI strategy co-creation
→ reproducible comparison
→ approved decision package
```

The demonstrator is successful only if practitioners judge the resulting strategy process and assets useful—not because the UI looks complete or the model produces fluent prose.

## 2. Recommended demonstrator case

Use one synthetic but realistic consulting case:

> A mid-sized industrial-equipment company is launching a predictive-maintenance digital service through one direct channel. Management must choose between bundling it with equipment, selling a subscription, charging per connected machine, or using a bounded performance-linked element. Two customer segments, implementation cost, data quality and the company's near-term cash requirements matter.

Why this case:

- The decision is genuinely open, not “increase price by X.”
- Transaction analysis alone cannot answer it.
- Market, customer, competitor, company and regulatory evidence are all relevant.
- Humans must define value, channel and organisational constraints.
- Several materially different strategies are credible.
- A deterministic scenario model is possible without claiming price optimisation.
- It demonstrates contextual adaptation without requiring superficial agriculture, dealer-network or sector-regulatory claims.

Use an agriculture version only if an agriculture pricing specialist supplies and reviews the case pack.

## 3. Demonstrator inputs

Create a controlled case pack containing:

- Client brief or board memo
- Product and service description
- Simplified customer/segment data
- Simplified cost and forecast data
- Interview excerpts from sales, operations, finance and customers
- Public competitor pages and market sources
- One deliberate contradiction
- One outdated source
- One unsupported management assertion
- One competition/privacy or regulatory review trigger

Synthetic content must be labelled. Do not use real confidential client data in the hackathon demonstrator.

## 4. Demonstrator scope

### Must demonstrate

1. Turn a curated brief into a decision framing and a small question-led evidence synthesis, using uploaded sources plus saved results from an approved search capability.
2. Preserve one deliberate contradiction and let the human qualify the resulting finding.
3. Let the consultant author one strategy thesis and create one AI-assisted branch or challenge linked to evidence and assumptions.
4. Run one case-specific deterministic financial model with transparent inputs and one sensitivity/switching insight.
5. Generate one circulatable HTML/PDF decision pack containing executive pages plus evidence/model appendices, with one downloadable editable model workbook or faithful model fixture.
6. Change one assumption and update every affected number and narrative consistently.

### May be simulated behind the interface

- User authentication
- Asynchronous job orchestration
- Sophisticated tenant administration
- Firm branding
- Full legal policy engine
- Native office-file export if reliable PDF/HTML views demonstrate the contract
- General web-retrieval infrastructure; use an existing approved search capability and saved provenance
- Granular comments, multi-role permissions and full audit infrastructure

The simulation boundary must be disclosed.

### Must not be implied

- Production security
- Legal compliance certification
- Validated willingness-to-pay estimates
- Real client performance improvement
- Autonomous pricing authority
- Universal industry coverage
- Formal client approval; the demonstrator stops at “ready for review”

## 5. Smallest viable interface

Four connected work areas are sufficient:

### A. Case and research

- Brief
- Decision charter
- Context profile
- Human framing confirmation
- Research questions
- Curated search/upload results
- Source register
- Evidence synthesis with conflicts and gaps
- Human finding review

### B. Strategy Studio

- Human-authored thesis and one branch/challenge
- Evidence and assumption links
- Human choice

### C. Model and decision

- Scenario assumptions
- Deterministic outputs
- Sensitivity/switching point
- Recommendation and counter-case
- Human choice

### D. Decision package

- Executive memo/slide views in one pack
- Model/evidence appendices
- Ready-for-review state

Avoid building dashboards or administration screens that do not strengthen this loop.

## 6. Build sequence

### Step 1 — Canonical case state

Implement one versioned case schema covering charter, questions, sources, claims, strategies, assumptions, model outputs, recommendation and artifact references.

Exit test: one fixture can be loaded, edited and versioned without relying on chat history.

### Step 2 — Evidence loop

Use uploaded files and an existing approved search capability to capture source URLs/excerpts, then implement question-led consolidation and human finding review. Do not build a general crawler/indexing platform for D0.

Exit test: the seeded contradiction and stale source remain visible and traceable.

### Step 3 — Strategy Studio

Implement human-originated strategies plus AI branch/combine/challenge operations.

Exit test: a practitioner can materially reshape a strategy without fighting a rigid form or losing provenance.

### Step 4 — Deterministic model

Implement one tested scenario contract and model-to-strategy links.

Exit test: identical inputs reproduce results; changing an assumption changes only expected dependent outputs.

### Step 5 — Assets and review

Generate one linked decision pack plus editable model fixture and run consistency checks.

Exit test: a modelled number and factual claim in the memo and deck both resolve to their canonical origins.

## 7. Product-discovery plan

### 7.1 Practitioner interviews

Recruit 8–12 people across:

- Boutique pricing consultancies
- Independent pricing specialists
- Commercial-strategy consultancies
- Internal pricing-transformation leaders

Ask them to reconstruct a recent non-routine engagement:

- What triggered the work?
- Which decisions were genuinely open?
- What evidence was needed and hardest to obtain?
- How was evidence consolidated?
- Where did senior judgment enter?
- Which models were built?
- Which assets were circulated and approved?
- Where did reviews create rework?
- What would they never delegate to AI?
- What security or methodological condition would block adoption?

Do not pitch the product until the current workflow is understood.

### 7.2 Concierge prototype

Run two past or synthetic cases manually through the proposed workflow. Use existing AI and office tools behind the scenes, but present the canonical objects and gates.

Measure:

- Time by stage
- Number of research iterations
- Number and quality of human strategy edits
- Reviewer issues found
- Asset update time after changed assumptions
- Points at which users leave the system

### 7.3 Comparative evaluation

For the same case, compare:

- Current practitioner workflow
- General-purpose AI plus spreadsheet/slides
- Pricing Strategy Workbench prototype

Blind reviewers should score the decision package without knowing the workflow used.

## 8. Expert-review rubrics

### 8.1 Evidence rubric

Score 1–5 with written rationale:

- Research questions are decision-relevant
- Retrieval covers appropriate evidence domains
- Sources are authoritative and applicable
- Material claims are accurately cited
- Conflicts and limitations remain visible
- Missing evidence causes appropriate abstention or conditions
- No restricted information is used improperly

### 8.2 Strategy rubric

- Alternatives are materially distinct
- Strategies respond to actual evidence and context
- Human judgment is visible
- Strategic logic is coherent across segment, offer, metric, model and transition
- At least one alternative challenges the obvious framing
- Assumptions are explicit
- Risks and second-order effects are credible
- Implementation dependencies are realistic
- Recommendation could withstand senior client scrutiny

### 8.3 Model rubric

- Base case reconciles
- Formula logic is inspectable
- Assumptions have owners and ranges
- Scenario behaviour is directionally sensible
- Switching values identify decision sensitivity
- Model and narrative agree
- Precision is proportional to evidence quality

### 8.4 Asset rubric

- Decision request is clear
- Evidence, analysis and recommendation are distinguishable
- Memo and deck tell the same story
- Numbers are consistent
- Contrary evidence and conditions are not buried
- Reviewer can trace claims without searching chat logs
- Package is suitable for internal circulation after human editing

## 9. Evaluation thresholds

### Non-negotiable quality gates

- Zero cross-client retrieval in normal and adversarial tests
- Zero material uncited factual claims in an approved package
- Zero material quantitative claims without model lineage
- 100% retention of expert-seeded critical contradictions through the evidence gate
- Deterministic model reproduces outputs for identical inputs/version
- No package marked approved without a named human approver

### Pilot success signals

- Blinded expert review judges decision quality at least non-inferior to a comparable current-process package before speed is credited
- Median expert usefulness and meaningful-control ratings are at least 4/5 with written rationale
- At least 3 of 5 target practitioners voluntarily choose the structured workflow for a second case
- Reviewers find evidence, assumption and model issues with less reconstruction effort than current materials
- One approved assumption change produces zero material cross-output inconsistencies
- At least one qualified firm commits a real upcoming engagement and pays for a concierge pilot; LOIs are tracked separately as weaker evidence

Treat these as decision thresholds, not established benchmarks.

## 10. Kill, pivot and proceed criteria

### Proceed

- Experts use the Strategy Studio rather than immediately exporting work elsewhere.
- Evidence lineage catches real review issues or reduces reconstruction effort.
- Linked assets materially reduce revision time.
- At least one buyer sees the system as engagement infrastructure worth paying for.

### Pivot

- Users value the evidence system but not strategy creation: consider an evidence-to-decision infrastructure product.
- Users value strategy and assets but reject structured evidence review: simplify the research UX while preserving provenance.
- One engagement archetype shows strong value but generality fails: create a focused method pack rather than claiming broad coverage.
- Internal pricing teams show stronger pull than consultancies: shift ICP after confirming integration economics.

### Stop

- Expert reviewers see no material advantage over general AI plus familiar tools.
- Structured workflow consistently adds more work than it saves.
- Consultants refuse to keep strategy creation inside the product.
- Useful modelling requires building a full vertical optimiser before any value is realised.
- Security and data-isolation requirements are economically incompatible with the target buyer.

## 11. Scope-change rule

During the hackathon, a feature can be added only if it improves one of:

- Evidence quality or traceability
- Meaningful human strategy creation
- Deterministic decision quality
- Review/approval of tangible assets
- Demonstration of the complete loop

Otherwise it goes to P1/P2. Any new P0 should replace another P0 or explicitly extend the delivery window.

## 12. Immediate next actions

1. Confirm the demonstrator case and decision question.
2. Create the controlled source/client pack with seeded quality issues.
3. Define the case JSON/schema and one deterministic model fixture.
4. Sketch the four demonstrator work areas and stage transitions.
5. Recruit at least two expert reviewers before polishing the interface.
6. Build the evidence loop first, then Strategy Studio, model and assets.
