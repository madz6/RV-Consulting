# Engagement workflow and human oversight

**Status:** Canonical authority and stage-transition design  
**Owner:** Product / Pricing methodology  
**Last updated:** 2026-07-11  
**Related:** [PRD](PRD.md) · [Evidence system](EVIDENCE_SYSTEM.md) · [Architecture](ARCHITECTURE.md)

## 1. Purpose

This document defines how work moves through the system, where humans participate in strategy creation, which decisions AI may assist with, and what must be true before an engagement advances.

The workflow is not a sequence of prompts. It is a versioned state machine with inspectable inputs, outputs, owners and return paths.

## 2. Oversight principle

> Meaningful human involvement means the person has context, competence, authority and practical ability to inspect, alter, reject or request more evidence—not merely click “approve.”

Humans own the commercial decision. AI performs bounded research, synthesis, ideation, challenge and drafting. Deterministic components own arithmetic and mandatory validation. Rules enforce access and stage boundaries.

## 3. Workflow at a glance

| Stage | Primary output | Human activity | Gate owner |
|---|---|---|---|
| 0. Qualify and set up | Engagement record and restrictions | Accept scope, data use and conflicts | Engagement lead |
| 1. Frame | Decision charter and context profile | Correct problem, priorities and boundaries | Engagement lead + client sponsor |
| 2. Decompose and orient | Issue tree, hypotheses and pricing-context/method assessment | Direct research without pretending hypotheses are facts | Pricing lead + client contributors |
| 3. Plan research | Research protocol | Choose questions, methods, sources and sufficiency | Research/pricing lead |
| 4. Retrieve | Source register and corpus | Authorise, curate and refine retrieval | Researcher/data owner |
| 5. Consolidate | Evidence map, analytical findings and gaps | Assess applicability, resolve or retain conflicts | Research/pricing lead |
| 6. Create strategies | Thesis-led options and branches | Originate, edit and challenge strategies | Strategy team |
| 7. Shortlist | Feasibility-screened shortlist and rejection log | Define criteria and make trade-offs | Engagement lead + client team |
| 8. Model | Validated scenarios | Own assumptions and validate formulas | Model owner + independent reviewer |
| 9. Recommend | Conditional recommendation | Select course, conditions and decision request | Engagement lead |
| 10. Package and review | Memo, deck, model, evidence book and pilot charter | Comment, revise and approve | Reviewer + client decision owner |
| 11. Handoff | Approved decision package | Authorise pilot, implementation or stop | Client decision owner |

Implementation execution and outcome monitoring are P1/P2, not part of the MVP's operational authority.

### Demonstrator simplification

The synthetic hackathon demonstrator collapses the full workflow into three substantive human decisions:

1. Approve decision framing and research direction.
2. Author/branch and select a strategy for modelling.
3. Validate the model and release a **ready-for-review** decision pack.

It uses one author and one reviewer. The full role and gate structure below applies to the native product pilot, not the demonstrator.

## 4. Roles and decision rights

| Action | System/AI | Analyst/researcher | Strategy consultant | Model owner | Engagement lead | Independent reviewer | Client owner |
|---|---|---|---|---|---|---|---|
| Draft decision interpretation | Propose | Contribute | Contribute | Consulted | **Approve** | Challenge | **Approve client intent** |
| Design research plan | Propose | **Author/edit** | Edit | Consulted | Approve scope | Challenge | Supply access/context |
| Retrieve sources | Assist | **Operate/curate** | Request | — | Oversee | Audit sample | Authorise client data |
| Approve evidence | Summarise/flag | Review | **Assess applicability** | Review model inputs | Resolve material disputes | Challenge | Confirm internal context |
| Create strategy | Diverge/challenge | Contribute | **Originate/edit/combine** | Assess modelability | **Own shortlist** | Challenge | Contribute priorities |
| Set assumptions | Suggest ranges only | Source evidence | Explain thesis | **Own numeric assumptions** | Accept commercial assumptions | **Validate** | Accept business risk |
| Calculate scenarios | Explain only | Prepare inputs | Interpret | **Validate deterministic run** | Use in decision | Review | Review impact |
| Recommend | Draft/challenge | Contribute | Author | Validate economics | **Own and approve** | Challenge | Decide/approve |
| Generate artifacts | Draft/reconcile | Verify citations | Edit narrative | Verify numbers | Approve release | Review | Approve/return |
| Publish/implement price | Not permitted in MVP | Not permitted | Not permitted | Not permitted | Not permitted | Not permitted | Outside product |

Bold denotes decision ownership, not exclusive participation.

### Cross-functional client participation

Client involvement is continuous rather than limited to initial framing and final approval:

- Functional/data owners validate internal facts and analytical baselines.
- Sales, product, customer/service and relevant research owners contribute to strategy creation.
- Client leadership sets option trade-offs and non-negotiable constraints.
- Finance reconciles the baseline and approves material business assumptions.
- Sales, operations, IT/billing and legal confirm feasibility before detailed modelling or recommendation.
- The P&L owner accepts final commercial risk and any recorded non-legal residual risk.

## 5. Stage definitions and transition criteria

### Stage 0 — Qualify and set up

#### Required inputs

- Client and engagement identity
- Initial request
- Proposed team and roles
- Jurisdiction, sector and B2B/B2C context
- Data types expected
- Known conflicts or competitor relationships

#### System assistance

- Classify likely engagement archetype
- Surface restricted or high-risk use cases
- Suggest required reviewers
- Create preliminary data and research checklist

#### Human work

- Accept or reject the engagement scope
- Confirm authority to process data
- Identify conflicts of interest
- Set confidentiality, retention and access
- Determine whether specialist legal, sector or research support is required

#### Pass criteria

- Named engagement lead
- Defined client decision owner
- Permitted-use and confidentiality recorded
- No unresolved blocking conflict
- Initial jurisdiction/use-case classification complete

#### Return/stop conditions

- Prohibited data use
- Unmanageable conflict
- Expectation of autonomous live pricing
- Required expertise unavailable

### Stage 1 — Frame the decision

#### Interaction pattern

The system interviews the engagement team conversationally, then produces a structured charter. The human can edit any field, add context and reject the system's framing.

#### Required output

- Presented dilemma
- Diagnosed decision question
- Objectives and success measures
- Scope and exclusions
- Decision horizon
- Market/customer boundaries
- Financial and organisational constraints
- Risk appetite
- Stakeholders and decision rights
- Known beliefs and uncertainties

#### Human strategy involvement

This is the first strategic act. The team decides what problem deserves to be solved and which trade-offs matter. AI cannot freeze the decision charter.

#### Pass criteria

- Engagement lead and client sponsor accept the decision question
- Hard constraints and evaluation priorities are explicit
- Unknowns are represented as unknowns
- The decision remains open to “no pricing change” where appropriate

### Stage 2 — Decompose the problem and select pricing context/methods

Consultants begin with hypotheses to direct research; they do not wait for research to finish before thinking strategically.

#### Required output

- Issue tree and decision sub-questions
- Initial diagnostic hypotheses
- Early, explicitly unvalidated option space
- Pricing-context assessment covering buyer/seller concentration, customer heterogeneity, offer differentiation, capacity/perishability, sales model, regulation and data availability
- Human rationale for pricing and research methods that appear applicable, inappropriate or still uncertain

#### Human work

- Rewrite the issue tree
- Add or reject hypotheses
- Identify which beliefs are client assertions rather than evidence
- Choose the initial analytical and research methods
- Decide which uncertainty deserves research first

#### Pass criteria

- Hypotheses are labelled unvalidated
- Issue tree covers the material drivers of the decision
- Context assessment explains cross-industry method fit without claiming universal expertise
- Research priorities reflect decision impact and uncertainty

### Stage 3 — Design the research programme

#### Interaction pattern

AI proposes a question tree and source plan. Researcher and pricing lead edit it in a research-planning board.

#### Human work

- Add or remove hypotheses
- Choose relevant evidence domains
- Define inclusion/exclusion criteria
- Select customer-research methods
- Set evidence-sufficiency thresholds
- Rank questions by decision impact, uncertainty and expected value of more evidence
- Allocate owner, deadline and research effort, with explicit stopping rules
- Approve any interview guide, sample and primary-research method

#### Pass criteria

- Every question links to a decision or hypothesis
- Market, customer, competitor, company and regulatory domains are addressed or explicitly not applicable
- Use of internal and external sources is authorised
- High-risk methods have qualified reviewers
- Research budget and stop/escalation criteria are explicit

### Stage 4 — Retrieve evidence

#### Interaction pattern

The system executes bounded searches and parses approved material. Researchers curate results, refine queries and add direct research.

#### Human work

- Select source candidates
- Provide licensed and internal materials
- Reject irrelevant or unusable sources
- Refine search queries
- Authorise deeper retrieval
- Identify missing organisational knowledge or interviews

#### Pass criteria

- Planned source classes attempted
- Retrieval errors and inaccessible sources visible
- Source provenance and use permissions recorded
- Suspected competitor-confidential information quarantined

Retrieval completion does not imply evidence sufficiency.

### Stage 5 — Consolidate and review evidence

#### Interaction pattern

AI clusters claims by question, proposes support/conflict relationships and surfaces gaps. Humans assess source quality and applicability.

#### Human work

- Accept, qualify, reject or supersede claims
- Validate data quality, definitions and baseline reconciliation
- Review analytical findings, their methods and limitations
- Resolve entity/unit mismatches
- Decide whether conflicts can be reconciled
- Add tacit context with named ownership
- Request further research
- Decide sufficiency by question
- Ask client functional/data owners to confirm internal facts in their area

#### Pass criteria

- Material claims have inspectable provenance
- Material analytical findings have reproducible methods and approved inputs
- Contrary evidence is represented
- Applicability limits are explicit
- Critical gaps are closed, accepted conditionally or block strategy recommendation
- Research/pricing lead approves the evidence map

### Stage 6 — Human-led Strategy Studio

This is the product's centre. It must feel like a facilitated strategy workshop, not a recommendation form.

#### Thesis first

Freeform strategic reasoning comes before fields. Each strategy starts with:

- Strategic thesis
- Value-creation and value-capture mechanism
- Why it fits the pricing context
- Causal chain from action to customer/business outcome
- Conditions required
- Failure modes
- Smallest credible test

Pricing dimensions then help make the thesis complete; they are optional structure, not a mandatory ideation form.

#### Strategy dimensions

- Target market, segment or cohort
- Customer problem and value proposition
- Offer, service and packaging
- Price metric
- Pricing/revenue model
- Price level and architecture
- Segmentation and legitimate price fences
- Terms, discount, rebate and promotion logic
- Geography and channel
- Contract and indexation
- Existing-customer migration
- Sales authority and governance
- Pilot/test design
- Implementation dependencies

#### Human interactions

Users can:

- Start from a blank strategy
- Write a strategic thesis in their own words
- Ask AI to expand, critique or find missing dimensions
- Create a conservative, ambitious or pilot-first branch
- Manually incorporate ideas from another strategy; a formal component-combine operation is P1 until validated
- Protect or exclude specified cohorts
- Change company priorities and regenerate implications
- Add a strategy proposed in a workshop
- Challenge from customer, sales, finance, operations, competitor or regulator perspectives
- Return to research when evidence is insufficient
- Record why an idea was rejected

#### AI responsibilities

- Generate evidence-grounded option components
- Identify analogous mechanisms for exploration
- Detect incoherent combinations
- Expose new assumptions
- Link support, contradiction and gaps
- Challenge second-order effects
- Preserve human edits

#### AI prohibitions

- Selecting the final strategy
- Inventing willingness to pay or elasticity
- Replacing rejected human content on regeneration
- Presenting an unsupported idea as evidence-backed
- Hiding commercially inconvenient evidence

#### Pass criteria

- Strategy set is materially diverse, not cosmetic wording variants
- Every shortlisted component is evidence-linked, calculated or explicitly assumed
- Human authorship is material and visible
- Business-as-usual or a justified baseline is considered
- Implementation dependencies and decision tests are described

### Stage 7 — Shortlist and appraise options

#### Human work

- Define critical success factors
- Identify non-negotiable constraints
- Decide qualitative evaluation criteria
- Discuss trade-offs and weighting
- Estimate indicative economic ranges without false precision
- Screen billing, contracts, capacity, channels, sales behaviour, systems, regulation and change effort with relevant client owners
- Shortlist, retain for research or reject

The system may calculate a transparent option matrix, but it does not turn subjective weights into an authoritative answer. Sensitivity to criteria and weights remains visible.

#### Pass criteria

- Shortlist rationale recorded
- Hard-constraint failures separated from preferences
- Options that cannot plausibly be implemented or modelled are revised/rejected before detailed modelling
- Rejected options and reasons retained
- Model requirements defined for each shortlisted option

### Stage 8 — Model and stress-test

#### Human work

- Approve data mapping
- Own behavioural assumptions
- Select scenario ranges
- Validate base-case reconciliation
- Review formula/model specification
- Interpret sensitivities and switching values

#### Reproducible-model responsibilities

- Execute calculations
- Reproduce results from identical inputs/version
- Run scenarios and sensitivities
- Flag invalid ranges, units and missing values
- Supply output lineage to artifacts

Financial arithmetic is deterministic in P0. Any statistical, causal, forecasting, optimisation or simulation method has its own validation, uncertainty and reviewer requirements; it is not treated as deterministic merely because software executes it.

#### AI responsibilities

- Propose model structure for review
- Explain results
- Identify possible omitted effects
- Draft limitations

#### Pass criteria

- Base case reconciled
- Material assumptions owned and ranged
- Directional and boundary tests passed
- Independent reviewer signs off model behaviour
- Narrative interpretation matches calculated results

### Stage 9 — Recommend and challenge

#### Interaction pattern

The system drafts a decision argument and strongest counter-case. The engagement lead edits, selects and owns the recommendation.

#### Human work

- Choose preferred course or decide evidence is insufficient
- Define scope, timing and conditions
- Decide whether to pilot, proceed, maintain status quo or stop
- State why credible alternatives were rejected
- Accept or mitigate residual risk

#### Pass criteria

- Recommendation is conditional where uncertainty warrants it
- Supporting and contrary evidence are visible
- Economics and sensitivity are current
- Required implementation dependencies are credible
- Recommendation owner is named

### Stage 10 — Package, review and approve

#### Required linked assets

- Decision memo
- Executive deck
- Model snapshot/export
- Evidence book
- Review and decision log
- Pilot/implementation charter
- Circulation note with exact approvals requested

#### Review workflow

```text
Draft
→ Internal review
→ Revisions requested or internally approved
→ Client review
→ Revisions requested, approved, pilot-only, deferred or rejected
```

#### Human work

- Comment on specific claims, assumptions, strategy components and model outputs
- Resolve inconsistencies
- Approve the exact package version
- Record conditions or dissent

#### Pass criteria

- Citation and numerical-lineage checks pass
- Required legal/sector reviews cleared
- Draft labels removed only after approval
- Named approver and version recorded
- Material dissent, unresolved objections and the person accepting non-legal residual risk remain visible

### Stage 11 — Handoff

MVP output is an approved decision package and structured handoff, not price execution.

Possible decisions:

- Proceed to implementation planning
- Run a defined pilot
- Conduct more research
- Revise the strategy
- Maintain business as usual
- Stop

## 6. Return paths and branching

The workflow deliberately supports:

- New evidence → reopen consolidation or framing
- Evidence insufficiency → return to research plan/retrieval
- Incoherent strategy → return to Strategy Studio
- Model failure → revise strategy or assumptions, not hide the result
- Reviewer challenge → branch a new strategy/recommendation version
- Client rejection → preserve the rejected version and rationale

Approved versions are immutable. New work creates a branch with lineage.

## 7. Review states

| State | Meaning |
|---|---|
| Draft | Work may change; not suitable for circulation |
| Ready for internal review | Author believes required checks are complete |
| Revisions requested | Named reviewer identified blocking changes |
| Internally approved | Consultancy accepts content for client review |
| Client review | Package is with authorised client stakeholders |
| Approved | Named decision owner accepted the exact version |
| Pilot only | Strategy authorised only for bounded experiment |
| Deferred | No decision; assumptions and evidence may expire |
| Rejected | Decision owner declined the recommendation |
| Superseded | A later approved version replaces it |

## 8. Human-review quality rubric

A review is meaningful only if the reviewer:

- Is identified and acting in a defined role
- Has relevant competence or routes to a specialist
- Can inspect underlying evidence and model lineage
- Can alter assumptions, strategy and recommendation
- Can request further evidence
- Can reject or stop progression
- Records rationale for material overrides
- Is given adequate time and is not incentivised to rubber-stamp

## 9. Mandatory escalation triggers

Route to qualified legal/compliance or sector review when any of the following is present:

- Non-public competitor pricing, cost, capacity, stock or future intention
- Concentrated markets or competitors sharing the same pricing provider
- Personalised pricing affecting natural persons
- Consumer-facing dynamic pricing or mandatory-fee design
- Life/health insurance or creditworthiness pricing
- Protected-characteristic or vulnerable-customer concerns
- Material personal data, profiling or significant automated decisions
- Sector price controls or unclear jurisdiction
- Unlicensed paid research or uncertain source rights
- Model output highly sensitive to an unsupported assumption

## 10. Approval matrix for MVP

| Deliverable | Author | Required reviewer | Required approver |
|---|---|---|---|
| Decision charter | Strategy consultant | Engagement lead | Engagement lead + client sponsor |
| Research protocol | Researcher | Pricing lead | Pricing/engagement lead |
| Evidence map | Researcher | Pricing specialist | Pricing/engagement lead |
| Strategy shortlist | Strategy team | Model/implementation consulted | Engagement lead |
| Model | Model owner | Independent model reviewer | Engagement lead accepts for decision use |
| Recommendation | Engagement lead | Independent reviewer; legal where triggered | Engagement lead internally; client owner externally |
| Client package | Consultant | Evidence and model reviewers | Engagement lead before sending; client owner for decision |

## 11. Audit requirements

Record:

- Actor, role and time
- Object and version changed
- AI or tool version where material
- Source retrieval query and result IDs
- Human edit and rationale for material overrides
- Assumption changes
- Model runs and outputs
- Review comments and resolutions
- Approval/rejection and conditions
- Generated artifact version

The audit trail supports accountability; it is not designed as employee surveillance.

## 12. Open workflow questions

- Can the MVP support controlled shortcuts without weakening evidence gates?
- Which review actions require two people in a very small consultancy?
- Should clients interact directly or initially respond through the engagement lead?
- What constitutes a “material human edit” for the authorship metric?
- How should dissent be represented in the final decision package?
- When does evidence become stale enough to invalidate an approval?
