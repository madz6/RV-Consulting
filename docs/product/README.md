# Product documentation index

**Product:** Pricing Strategy Workbench (working title)  
**Status:** Discovery / specification  
**Last updated:** 2026-07-11  
**Audience:** Product, design, engineering, pricing specialists, reviewers and Codex agents

## Read this first

Pricing Strategy Workbench is a vendor-neutral engagement and decision layer for non-routine pricing strategy work. It connects research questions, retrieved evidence, human interpretation, strategy alternatives, reproducible models with deterministic financial arithmetic, review decisions and circulatable client assets.

It is explicitly **not** a live-price optimiser, CPQ system, generic research chatbot or autonomous consultant.

## Canonical documents

| Document | Purpose | Source of truth for |
|---|---|---|
| [`PRD.md`](PRD.md) | Product requirements | Scope, users, workflows, requirements, acceptance criteria and success metrics |
| [`PRODUCT_STRATEGY.md`](PRODUCT_STRATEGY.md) | Product and market thesis | Problem space, ICP, positioning, alternatives and product-fit hypotheses |
| [`EVIDENCE_SYSTEM.md`](EVIDENCE_SYSTEM.md) | Research and evidence design | Retrieval, consolidation, provenance, evidence gates and research quality |
| [`WORKFLOW_AND_OVERSIGHT.md`](WORKFLOW_AND_OVERSIGHT.md) | Human-led engagement process | Stage transitions, human participation, roles, review and approval |
| [`GOVERNANCE_AND_COMPLIANCE.md`](GOVERNANCE_AND_COMPLIANCE.md) | Product guardrails | Competition, consumer, privacy, AI, IP and launch-gate requirements |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Technical concept | Components, data objects, reproducible modelling, AI boundaries and security |
| [`MVP_VALIDATION.md`](MVP_VALIDATION.md) | Build and learning plan | Hackathon slice, pilot scope, experiments, evaluation and kill criteria |
| [`RESEARCH_SOURCES.md`](RESEARCH_SOURCES.md) | Research register | External sources, what they support and important limitations |

If documents conflict, precedence is:

1. `PRD.md` for committed product scope.
2. `WORKFLOW_AND_OVERSIGHT.md` for authority and approval rules.
3. `EVIDENCE_SYSTEM.md` for evidence admissibility and provenance.
4. `GOVERNANCE_AND_COMPLIANCE.md` for guardrails and launch gates.
5. `ARCHITECTURE.md` for implementation intent.
6. `PRODUCT_STRATEGY.md` and `MVP_VALIDATION.md` for hypotheses still being tested.

## Product spine

```text
Ambiguous pricing dilemma
→ approved decision charter
→ hypothesis-led decomposition and pricing-context assessment
→ approved research plan
→ internal/external/customer evidence retrieval
→ contradiction-aware evidence consolidation
→ human strategy co-creation
→ reproducible modelling and challenge
→ human recommendation and approval
→ memo + deck + model + evidence book
```

## Non-negotiable principles

1. No recommendation without traceable evidence.
2. No numerical conclusion without a reproducible model.
3. No recommended strategy without meaningful human authorship; exploratory hypotheses may begin before research and must remain labelled until supported or tested.
4. No client-facing asset without named human approval.
5. No cross-client use of confidential or competitively sensitive information.
6. Uncertainty and disagreement remain visible; the system must not average them into false confidence.
7. New evidence can reopen earlier stages; the workflow is governed but not linear.

## Instructions for future Codex work

Before proposing or implementing a product change:

1. Read this index and the relevant canonical document.
2. Preserve the distinction between **retrieved fact**, **calculated result**, **human assumption**, **AI inference** and **recommendation**.
3. Add scope only by updating the PRD and explicitly changing a non-goal or phase boundary.
4. Treat legal and regulatory checks as routing and review controls, not automated legal conclusions.
5. Do not add autonomous live-price execution to the MVP.
6. Record unresolved design decisions under the relevant document's open-questions section.
