# Product strategy and product-fit thesis

**Status:** Research-backed hypothesis; not yet validated with design partners  
**Owner:** Product  
**Last updated:** 2026-07-11

## 1. Executive decision

Build a **human-led pricing strategy engagement system** for the work before price execution: framing an ambiguous decision, designing and conducting research, consolidating evidence, creating and challenging strategic alternatives, modelling them reproducibly, and producing an approval-ready decision package.

The first buyer should be a **fixed-fee or capacity-constrained boutique pricing/commercial-strategy consultancy with repeated engagement types and explicit knowledge-reuse pain**. The first use case is narrower:

> New-offer monetisation under sparse historical data, where the team must combine market, customer, competitor, company and implementation evidence to choose a pricing model and produce a client decision package.

Market entry, portfolio architecture, contract transformation and structural repricing are adjacent engagement types to test later, not v0 claims.

This is a problem-space wedge, not an industry claim. The consultancy supplies sector expertise; the product supplies research discipline, traceability, strategy co-creation, modelling linkage and reviewable assets.

## 2. Problem space

Pricing strategy engagements combine heterogeneous work that is usually spread across email, interviews, spreadsheets, browser tabs, slide decks and consultant memory:

- The client's stated dilemma is often not yet a decision-ready problem.
- Market, customer, competitor, company and regulatory evidence must be actively sought.
- Evidence differs in quality, date, geography, unit, confidentiality and applicability.
- Important contradictions and gaps are easily lost during document summarisation.
- Strategy requires creative human judgment, not a fixed menu of interventions.
- Financial conclusions require reproducible calculations and explicit behavioural assumptions.
- Client decisions are made through memos, decks, models, workshops and formal approvals.
- The reasoning that connects evidence to a recommendation is rarely stored as one durable object.

The cost is not only analyst time. It is weak traceability, inconsistent methodology, repeated research, avoidable review cycles and recommendations that are difficult to defend or adapt when an assumption changes.

## 3. Why existing categories do not fully solve it

### Enterprise pricing platforms

Pricefx, Vendavo, Zilliant, Conga and Competera already provide combinations of price analytics, optimisation, scenarios, rules, approvals, competitive monitoring and downstream execution. Competing on margin-leak detection, recommended prices, scenario comparison, human approval or ERP/CPQ publishing would enter a crowded market.

Their public product narratives are strongest once relevant data, pricing objects, objectives and constraints are sufficiently configured, but several are already moving upstream into diagnosis and strategy/rule generation. The narrower proposed wedge is **multi-source qualitative evidence synthesis, consultant co-authorship and linked client decision assets for sparse-data, non-routine pricing cases**.

### Generic AI research and productivity tools

General-purpose AI can search, summarise, brainstorm and draft slides. It does not by default provide:

- A pricing-specific evidence protocol
- Claim-level admissibility and applicability review
- Contradiction-aware consolidation
- Structured, branchable pricing strategy objects
- Deterministic model lineage
- Consistency across memo, deck, model and evidence appendix
- Pricing-specific competition controls
- Named decision rights and stage gates

### Traditional consulting delivery

Specialist consultancies already perform the complete job through expert labour, proprietary methods and tacit knowledge. The product should not claim to replace that expertise. It should make the engagement system faster, more consistent, inspectable and reusable.

## 4. Target users

### Primary ICP: boutique pricing and commercial-strategy consultancies

Provisional qualifying characteristics:

- Run several pricing or monetisation engagements per year
- Deliver a meaningful share of work on fixed-fee, capped-fee or otherwise capacity-constrained terms
- Repeat at least one engagement archetype often enough to benefit from method reuse
- Use mixed teams of partner/lead, consultant and analyst
- Produce client-facing memos, decks and financial models
- Work across more than one sector or client business model
- Do not have a mature internal pricing software platform
- Feel pain from repeated research, manual synthesis and artifact reconciliation
- Want to reuse methodology without exposing proprietary methods or client evidence
- Are willing to use the product in parallel with their existing process before relying on it

Why start here:

- One organisation can supply multiple engagements and feedback cycles.
- Users possess the expertise required to challenge weak AI outputs.
- The product solves cross-industry adaptation through human expertise rather than pretending to contain every sector model.
- Exportable assets fit the consultancy delivery model.
- Procurement and integration requirements are generally lighter than for large enterprises, though confidentiality remains demanding.

Important commercial counter-hypothesis: a time-and-materials consultancy may not value labour reduction, and firms may resist placing proprietary methodology in a third-party system. Discovery must test fee model, utilisation pressure, method ownership and deployment expectations explicitly.

### Secondary ICP: internal pricing-transformation teams

Potentially stronger recurring data access and implementation ownership, but likely to require deeper integrations, security review and change management. Treat as a later pilot segment.

### Not an initial user

- A small-business owner seeking an autonomous price answer
- A trader requiring live market-making or execution
- A retailer requiring high-frequency SKU repricing
- A sales representative needing real-time quote guidance
- A client expecting legal, tax or competition advice from software

## 5. Jobs to be done

### Functional job

> When I receive an ambiguous pricing dilemma, help my team build a defensible recommendation from internal and external evidence, quantify the alternatives, and produce the assets required for review and client decision.

### Emotional job

> Help me feel confident that the recommendation can withstand scrutiny from a CFO, commercial leader, subject-matter expert and client board.

### Social job

> Help my consultancy appear rigorous, responsive and internally consistent without presenting AI-generated material as expert judgment.

## 6. Product positioning

> Pricing Strategy Workbench is the evidence-to-decision workspace for pricing consultants. It turns a client dilemma and fragmented research into human-authored, model-tested and approval-ready pricing strategy assets.

### Positioning boundaries

The product is:

- An engagement and decision layer
- Human-led and AI-assisted
- Research-active rather than upload-only
- Vendor-neutral with respect to downstream pricing platforms
- Designed around traceability and controlled iteration

The product is not:

- A price optimiser
- A CPQ, billing or contract-execution system
- A generic market-research assistant
- An autonomous management consultant
- A substitute for customer research, legal review or model validation

## 7. Core differentiation

The differentiating unit is an inspectable lineage chain:

```text
Research question
→ retrieved source
→ atomic evidence claim
→ human interpretation
→ strategy component
→ model assumption/transformation
→ recommendation claim
→ reviewer decision
→ circulated asset
```

The product only becomes defensible if it preserves and evaluates this chain better than general AI tools and earlier-stage features added by pricing-platform incumbents.

## 8. Cross-industry adaptability

The product will not contain one universal pricing playbook. It adapts through three layers:

1. **Universal engagement method:** decision framing, research, evidence review, option creation, modelling, challenge and approval.
2. **Case context:** market mechanics, buyer/seller concentration, customer heterogeneity, offer complexity, cost structure, regulation, company objectives, capital constraints, culture and implementation capability.
3. **Human expertise and approved methods:** consultants select relevant research methods, strategy dimensions, models and policy checks.

Future industry or engagement-method packs may supply reusable questions, source maps, model adapters and rubrics. The initial product makes **no universal-expertise claim** and is validated only for the selected engagement archetype.

## 9. Consultancy operating-model fit

The product should enter the engagement without requiring a firm to replace its existing document, spreadsheet or presentation ecosystem.

### Initial entry points

- Client brief, memo, proposal or meeting transcript
- Existing research and prior client-approved materials
- Financial/transaction spreadsheets and existing model extracts
- Consultant-authored methodology, interview notes and workshop decisions

### System-owned work

- Canonical decision charter and context
- Research protocol, retrieval history and evidence map
- Strategy branches, authorship and rejection log
- Assumptions, model linkage and review state
- Recommendation lineage and package version

### Exit points

- PowerPoint/PDF executive presentation
- Word/PDF decision memo
- Excel model or validated model snapshot
- Evidence book and source register
- Structured handoff for later implementation or pricing platforms

### Adoption path

1. **Shadow mode:** run a completed or live engagement in parallel; nothing is sent to a client from the product.
2. **Assisted delivery:** use the research/evidence and asset-reconciliation workflow while consultants retain existing workshops and models.
3. **Standard engagement system:** use the canonical workflow and review gates across qualifying projects.

Firm methodology can later be encoded as reusable research protocols, strategy prompts, model adapters and rubrics. Reuse concerns the **method**, not confidential client evidence.

## 10. Product-fit hypotheses

| ID | Hypothesis | Risk if false | Cheapest credible test |
|---|---|---|---|
| H1 | Consultants experience material pain stitching research, strategy, models and client assets together | Product is a novelty rather than workflow infrastructure | Interview 8–12 practitioners and reconstruct two recent engagements |
| H2 | Claim-level provenance and contradiction handling improve review quality enough to justify workflow change | Evidence system becomes expensive overhead | Run the same case with current tools and the prototype; compare reviewer findings and confidence |
| H3 | Consultants will actively co-create strategies in a structured workspace rather than export to slides immediately | Strategy Studio is bypassed | Facilitated prototype test with editable/branchable strategy objects |
| H4 | A useful deterministic comparison can be produced for the selected new-offer monetisation archetype without building a vertical optimiser | Product cannot quantify even its initial case credibly | Reconcile one transparent model contract against an expert-built model for the same case |
| H5 | Generating linked memo, deck, model and evidence book materially reduces rework | Asset generation is cosmetic | Change one approved assumption and compare time/errors required to update all assets |
| H6 | Boutique consultancies will trust client-isolated cloud processing under acceptable controls | Adoption blocked by confidentiality | Security and data-handling review with three prospective design partners |
| H7 | Users will pay for an engagement system before implementation integrations exist | Product is viewed as a feature, not a system | Concierge pilot with paid or letter-of-intent conversion criterion |

## 11. Riskiest assumptions

The greatest product risk is not whether an LLM can draft strategies or presentations. It is whether expert users judge the connected evidence-to-strategy workflow sufficiently better than a combination of browser, spreadsheets, general AI and PowerPoint to change how they work.

The second risk is competitive convergence. Pricing platforms are moving upstream into AI-assisted diagnosis and strategy/rule generation. A shallow experience—chat, three options and an approval button—will not remain differentiated.

## 12. Strategic alternatives considered

### A. Margin-leak analytics tool

Rejected as the core wedge. Valuable and demonstrable, but crowded and stops before strategy creation.

### B. Autonomous pricing consultancy

Rejected. It overclaims domain coverage, creates serious trust and governance problems, and removes the professional judgment clients are paying for.

### C. Vertical price optimiser

Deferred. It can be valuable in a chosen industry but requires specialised data, models, integrations and validation. It is a different product category.

### D. Generic strategy workspace

Rejected. Adjacent decision-management and AI productivity tools already cover broad planning and scenario collaboration.

### E. Evidence-to-approved-pricing-decision workspace

Selected for discovery. It preserves actual strategy creation, creates tangible assets, accommodates multiple industries through expert users, and occupies a plausible upstream position relative to execution platforms.

## 13. Business-model hypotheses

Do not optimise pricing before validating value. Candidate models:

- Per-user subscription plus engagement usage
- Consultancy workspace licence with client-engagement allowances
- Paid design-partner pilot credited toward annual licence

Avoid outcome-based fees initially because attribution, risk allocation and competition concerns complicate an unvalidated product.

## 14. Defensibility path

Potential defensibility comes from:

- Consultant-authored, tested engagement methods
- A high-quality evidence and strategy data model
- Expert review and evaluation datasets
- Reusable but client-safe methodological knowledge
- Evidence-to-model-to-asset lineage
- Integration neutrality across execution platforms
- Trust earned through consistent review performance

It does not come from the underlying language model or slide generation.

## 15. Open product-strategy questions

- **Blocking — Product:** Does new-offer monetisation under sparse historical data occur often enough, with sufficient repeatability, to anchor the first model and demo?
- **Blocking — Research:** Do consultants perceive evidence consolidation as acute pain or accepted project labour?
- **Blocking — Commercial:** Who owns budget: consultancy partner, knowledge-management lead or pricing practice lead?
- **Blocking — Security:** What deployment and data-retention model will design partners accept?
- **Non-blocking — Product:** Should client reviewers interact in the application or initially receive exports only?
- **Non-blocking — Commercial:** Is vendor-neutral downstream handoff valuable before native integrations exist?
