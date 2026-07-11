# Governance and compliance requirements

**Status:** Product guardrails for UK-first discovery; requires qualified legal review before production  
**Owner:** Product / Legal / Security  
**Last verified:** 2026-07-11  
**Related:** [PRD](PRD.md) · [Evidence system](EVIDENCE_SYSTEM.md) · [Workflow and oversight](WORKFLOW_AND_OVERSIGHT.md) · [Research sources](RESEARCH_SOURCES.md)

## 1. Scope and disclaimer

This document translates current authoritative sources into product requirements. It is not legal advice and does not guarantee compliance. Applicability depends on jurisdiction, sector, B2B/B2C context, data, customer type and whether the system advises, communicates or implements prices.

Requirements are labelled:

- **Legal:** binding where applicable.
- **Regulatory guidance:** regulator interpretation and recommended practice.
- **Voluntary control:** NIST/OWASP or internal good practice.

The MVP is advisory and artifact-generating. It does not publish prices, negotiate with customers or execute live changes.

## 2. Engagement risk classification

Before retrieval begins, record:

- Client and legal entities
- Jurisdictions
- Industry/sector
- B2B, B2C or mixed
- Pricing decision type: uniform, segmented, dynamic, personalised or other
- Intended asset audience: internal, client decision-makers or customer-facing
- Whether natural persons are profiled or materially affected
- Data categories, including personal and special-category data
- Competitors and potential conflicts
- Downstream use: advice, pilot, customer communication or execution
- AI operator role where relevant: provider, downstream provider or deployer

The result determines required reviewers, policy version and whether the use case is allowed.

## 3. Competition-law controls

Competition risk is the product's highest-priority legal design issue.

### COMP-01 — No cross-client confidential information `[INTERNAL MANDATORY CONTROL derived from LEGAL risk]`

**Legal/control basis:** UK/EU prohibitions on anti-competitive coordination and indirect information exchange.

The product must not use one client's non-public prices, discounts, costs, capacity, stock, commercial strategy or future intentions in another client's:

- Retrieval
- Prompt context
- Recommendations
- Benchmarks
- Fine-tuning
- Evaluation examples exposed to users
- Product learning

### COMP-02 — Isolation is technical `[INTERNAL MANDATORY CONTROL]`

The canonical database, object store, indexes, proposal store, caches, generated context, telemetry/audit, exports, backups, model-provider calls and evaluation data must be separately authorised server-side at every service boundary. Prompts and UI filters are insufficient.

### COMP-03 — Competition-sensitive source classification `[INTERNAL MANDATORY CONTROL]`

Every source records:

- Client/owner
- Origin
- Public/non-public status
- Confidentiality
- Whether it concerns a competitor
- Whether it includes current/future prices, discounts, cost, capacity, stock or strategy
- Human/legal clearance state

### COMP-04 — Public competitor evidence by default `[INTERNAL MANDATORY CONTROL derived from LEGAL risk]`

Default external competitor retrieval is limited to public sources. The record shows URL/origin, public status and retrieval time. Non-public rival information always enters quarantine; ordinary client/user authorisation is not sufficient to clear it. Any exceptional handling requires documented specialist competition review.

### COMP-05 — Quarantine and review `[INTERNAL MANDATORY CONTROL]`

Suspected rival-confidential or cross-client information is unavailable to retrieval and generation until a qualified reviewer clears it.

### COMP-06 — Prohibited recommendation patterns `[LEGAL boundary implemented by INTERNAL MANDATORY CONTROL]`

Block and escalate strategies intended to:

- Coordinate future pricing with competitors
- Signal pricing intentions to rivals
- Enforce or monitor a collusive arrangement
- Punish deviations from coordinated behaviour
- Use a shared data hub to reduce competitive uncertainty improperly

### COMP-07 — Mandatory specialist review `[INTERNAL MANDATORY CONTROL]`

Require competition review for:

- Concentrated markets
- Shared pricing algorithms/platforms among competitors
- Trade-association or consortium data
- Real-time competitor-response strategies
- Cross-company benchmarks
- Ambiguous competitor-information provenance

### Acceptance tests

- Cross-tenant query and adversarial retrieval tests return zero foreign-client content.
- A seeded competitor-confidential document enters quarantine and cannot influence a strategy.
- A public competitor claim displays source and retrieval time.
- An anti-collusion test prompt is refused and escalated.

Authoritative basis: [UK Competition Act 1998, section 2](https://www.legislation.gov.uk/ukpga/1998/41/section/2), [TFEU Article 101](https://eur-lex.europa.eu/eli/treaty/tfeu_2016/art_101/oj/eng), [EU Horizontal Guidelines](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52023XC0721%2801%29), [CMA AI and collusion guidance](https://competitionandmarkets.blog.gov.uk/2026/03/04/ai-and-collusion-frontiers-opportunities-and-challenges/).

## 4. Consumer pricing and equality controls

Applicable when a recommendation or generated asset affects consumer pricing or customer communication.

Authority must remain separate by jurisdiction:

| Topic | Classification |
|---|---|
| UK total mandatory charges and non-misleading/attainable prices | Legal duties interpreted through CMA guidance |
| UK dynamic-pricing transparency and avoiding checkout changes | CMA regulatory guidance; facts may also produce a legal violation |
| EU personalised-price disclosure | Legal duty for applicable automated personalisation in distance/off-premises transactions; not ordinary dynamic pricing |
| EU prior-price rule | Legal rule generally concerning goods, subject to national implementation/exceptions |
| Protected-characteristic discrimination | Legal equality duties where applicable |
| Vulnerability/explainability beyond specific duties | Regulatory guidance or voluntary good practice depending on context |

### CONS-01 — Context classification `[INTERNAL MANDATORY CONTROL]`

Record consumer/business audience, country, channel and whether the asset is internal or customer-facing.

### CONS-02 — Price-transparency review `[INTERNAL MANDATORY CONTROL applying LEGAL and REGULATORY GUIDANCE by jurisdiction]`

Before a consumer-facing asset is approved, check applicable requirements for:

- Mandatory fees, taxes and charges
- Realistic and attainable advertised prices
- “From” price substantiation
- Drip or partitioned pricing
- Price-change timing during checkout
- Dynamic-pricing disclosure
- Personalised-price disclosure
- Prior-price claims for reductions

### CONS-03 — Pricing-type tags `[INTERNAL MANDATORY CONTROL]`

Strategies must be tagged uniform, segmented, dynamic, personalised or mixed. Personalised pricing triggers privacy, disclosure and fairness review.

### CONS-04 — Fairness and protected characteristics `[LEGAL where applicable; INTERNAL MANDATORY CONTROL]`

Where natural persons are affected, assess direct and proxy use of protected characteristics, indirect discrimination, vulnerable-customer impact and explainability.

### CONS-05 — No automatic customer publication `[INTERNAL MANDATORY CONTROL]`

All customer-facing price or explanatory copy requires named human approval. MVP outputs cannot publish directly.

Authoritative basis: [CMA209 price transparency](https://www.gov.uk/government/publications/price-transparency-cma209), [CMA dynamic-pricing guidance](https://www.gov.uk/government/publications/dynamic-pricing-tips-for-businesses/tips-for-businesses-using-dynamic-pricing), [EU consumer-rights guidance](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A52021XC1229%2804%29), [EU Price Indication Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A01998L0006-20220528), [EHRC business guidance](https://www.equalityhumanrights.com/guidance/business/guidance-businesses).

## 5. Privacy and automated-decision controls

### PRIV-01 — Processing record `[LEGAL where personal data applies; INTERNAL MANDATORY CONTROL]`

At engagement setup, record processing purpose, controller/processor roles, lawful basis where personal data is involved, data categories, authorised roles, retention and subprocessors.

### PRIV-02 — Minimisation and isolation `[LEGAL where personal data applies; INTERNAL MANDATORY CONTROL]`

- Collect only information needed for approved research questions.
- Segregate tenant/engagement data.
- Apply permissions to original sources, chunks, embeddings and generated artifacts.
- Do not train on client content by default.

### PRIV-03 — Deletion and return `[LEGAL/CONTRACTUAL where applicable; INTERNAL MANDATORY CONTROL]`

Source deletion or retention expiry must propagate to derived chunks, embeddings, caches, unapproved claims, evaluation traces and regenerable drafts, subject to documented legal-hold or approved-artifact retention.

### PRIV-04 — DPIA screening and assessment `[LEGAL where threshold met; INTERNAL MANDATORY CONTROL]`

Require DPIA screening whenever personal data is used. A DPIA is mandatory where the proposed processing is likely to create high risk, including relevant cases involving:

- Large-scale profiling
- Willingness-to-pay inference about identifiable people
- Vulnerable or protected groups
- Special-category data
- Solely automated or similarly significant decisions
- New high-risk data combination

### PRIV-05 — Vendor and data-processing terms `[LEGAL/CONTRACTUAL where applicable; INTERNAL MANDATORY CONTROL]`

Before real-client ingestion, document and approve:

- Controller, processor or joint-controller determination by purpose
- Article 28-compliant processor terms where applicable
- Subprocessor list/authorisation
- Contractual no-training and no-secondary-use configuration
- Provider retention and deletion behaviour
- Security, audit and breach-assistance commitments
- Data location and international-transfer mechanism

If these are not complete, restrict the system to synthetic data.

### HITL-01 — Meaningful human review `[LEGAL for applicable automated decisions; otherwise INTERNAL MANDATORY CONTROL]`

Where human review is a safeguard, the reviewer must:

- Be competent and authorised
- Have the evidence and model context
- Be able to change assumptions and outcomes
- Be able to reject or stop the decision
- Record rationale and overrides

### HITL-02 — Contestability `[LEGAL where applicable]`

If the system is later used for significant automated decisions affecting people, implementation must support applicable information, representation, intervention and contest rights. This is outside MVP scope and requires reclassification.

The regimes must remain distinct:

- **UK post-DUAA:** broader bases may be available for significant solely automated decisions, but information, representation, human intervention and contest safeguards remain, with additional restrictions for special-category data.
- **EU GDPR Article 22:** stricter permitted grounds apply, plus safeguards including human intervention and contest.

Authoritative basis: [ICO privacy by design](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/), [ICO DPIA guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/what-is-a-dpia/), [ICO human review](https://ico.org.uk/for-organisations/advice-and-services/audits/data-protection-audit-framework/toolkits/artificial-intelligence/human-review/), [ICO DUAA summary](https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-duaa-summary-of-the-changes/data-protection/), [EU GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng).

## 6. EU AI Act routing

The general workbench is not automatically high-risk; classification depends on intended use.

### AI-01 — Operator/use-case classification `[INTERNAL MANDATORY CONTROL supporting LEGAL classification]`

Determine role and intended use for each deployment.

### AI-02 — Initial high-risk blocks `[INTERNAL MANDATORY CONTROL]`

Do not configure the MVP to assess creditworthiness/credit scores of natural persons or price life/health insurance for natural persons. These can fall within high-risk categories and require a separate compliance programme.

### AI-03 — AI literacy `[LEGAL for in-scope providers/deployers since 2025-02-02]`

Record appropriate training for people operating or reviewing the system where EU AI Act obligations apply.

### AI-04 — Disclosure-ready design `[INTERNAL MANDATORY CONTROL anticipating applicable LEGAL duties]`

Maintain metadata needed to support applicable disclosure and marking. Distinguish disclosure when a person directly interacts with AI from provider-side machine-readable marking of synthetic content. Do not assume every AI-assisted deck needs a visible label; applicability and editorial-control exceptions require review. Under the enacted text Article 50 is scheduled to apply from 2026-08-02, but reverify the timetable and any amendments before launch.

Authoritative basis: [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng), [European Commission implementation timeline](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), [AI literacy FAQ](https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers).

## 7. Copyright and database-right controls

Rights, licensing, contract terms and statutory exceptions are fact-specific. Public accessibility and `robots.txt` do not by themselves establish permission. Treat access-control/contract compliance, copyright/database rights and voluntary robots policies as separate checks.

### IP-01 — Source-use classification `[INTERNAL MANDATORY CONTROL supporting fact-specific LEGAL review]`

Store access/licence terms and permitted-use classification with externally retrieved sources.

### IP-02 — Upload authority `[CONTRACTUAL/INTERNAL MANDATORY CONTROL]`

Client/user terms must require authority to process uploaded material.

### IP-03 — Restricted sources `[INTERNAL MANDATORY CONTROL]`

Do not ingest entire paid reports, databases or restricted sites merely because a user can access them. Use licensed connectors, permitted extracts and metadata.

### IP-04 — Limited reproduction `[INTERNAL MANDATORY CONTROL]`

Evidence books cite and summarise. Store/display only the excerpts necessary for review under permitted use.

Authoritative basis: [UK IPO copyright exceptions](https://www.gov.uk/guidance/exceptions-to-copyright), [UK database-right guidance](https://www.gov.uk/guidance/sui-generis-database-rights).

## 8. AI/RAG governance controls

These are voluntary controls supporting reliability and accountability.

### EVID-01 — Provenance `[VOLUNTARY GOOD PRACTICE implemented as INTERNAL MANDATORY CONTROL]`

Every material external claim stores source, publisher, publication/access dates, exact location/excerpt, jurisdiction/scope, source class and reviewer status.

### EVID-02 — Typed content `[VOLUNTARY GOOD PRACTICE implemented as INTERNAL MANDATORY CONTROL]`

Facts, client assertions, calculations, human assumptions, AI inferences, human interpretations and recommendations are separate objects.

### EVID-03 — Conflict preservation `[VOLUNTARY GOOD PRACTICE implemented as INTERNAL MANDATORY CONTROL]`

Consolidation retains support, contradiction, applicability limitations and unresolved gaps.

### EVID-04 — Current authoritative legal sources `[INTERNAL MANDATORY CONTROL]`

Legal claims require current primary/regulator sources and last-verified dates.

### EVAL-01 — Separate quality measures `[VOLUNTARY GOOD PRACTICE implemented as INTERNAL MANDATORY CONTROL]`

Evaluate citation entailment, source authority, retrieval recall, freshness, numerical consistency and abstention separately.

### EVAL-02 — Adversarial retrieval tests `[VOLUNTARY GOOD PRACTICE implemented as INTERNAL MANDATORY CONTROL]`

Test poisoned uploads, hidden webpage instructions, stale sources, conflicting sources, misleading citations and cross-tenant leakage.

### AUD-01 — Recommendation lineage `[VOLUNTARY GOOD PRACTICE implemented as INTERNAL MANDATORY CONTROL]`

Store retrieval query, selected source IDs, AI/workflow version, human edits, model version and artifact version for approved recommendations.

Audit records are tamper-evident, minimised, access-controlled and retained for a defined period; they are not exempt from deletion obligations. Prefer source IDs/hashes over copied content. Where a source must be deleted but an audit fact must remain, store an appropriate tombstone and mark any historic asset whose support is no longer inspectable.

Voluntary basis: [NIST Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence), [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/), [OWASP prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/), [OWASP vector/embedding weaknesses](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/).

## 9. Versioned policy packs

Do not scatter regulatory prose across prompts. Represent policy packs with:

- Jurisdiction and sector
- Applicability conditions
- Effective, expiry/review and last-verified dates
- Authoritative source
- Mandatory metadata
- Prohibited actions
- Required checks
- Required reviewer
- Test cases
- Version history

The system derives and activates mandatory packs from the engagement profile. Users may confirm or add packs; ordinary users cannot remove a mandatory pack. A qualified reviewer may determine a pack is inapplicable only with recorded rationale. Precedence is applicable law → classified regulatory requirements/guidance → client mandatory policy → firm methodology; conflicts are escalated rather than silently resolved. The workflow service enforces gates, while retrieval supplies supporting guidance.

## 10. Non-negotiable pilot/launch gates

1. Jurisdiction, sector, B2B/B2C, personal-data and AI-risk classification complete.
2. Permitted data use and retention recorded.
3. Controller/processor roles, provider/subprocessor terms, no-training setting, location/transfers and deletion configuration approved for real data.
4. Authenticated identity, server-enforced RBAC and unauthorised access tests passed.
5. Competition-sensitive ingestion scan passed.
6. Client-corpus and query-time isolation verified across every storage/service boundary.
7. Evidence provenance, contradictions and limitations reviewed.
8. Reproducible model reconciled and independently reviewed.
9. Competent human can materially alter/reject the strategy and records rationale.
10. Consumer, equality, privacy and sector checks passed where applicable.
11. No output is sent to customers or implemented as a price without explicit authorisation.
12. Policy versions and source dates are recorded.
13. High-risk or unclear cases route to qualified competition, privacy or sector counsel.

## 11. Governance acceptance suite

Before any real-client pilot:

- Cross-client leakage tests pass with zero exposure.
- Deletion propagates through retrieval and draft derivatives.
- Prompt-injection tests cannot change workflow authority or access.
- Upload parsing is sandboxed with malware scanning, type/size limits, macros/formulas disabled and sanitised rendering.
- External fetching is credential-free/allowlisted with SSRF and egress controls.
- Competitor-confidential test sources are quarantined.
- Draft assets cannot be marked approved through AI or unauthorised roles.
- All factual and numeric material claims resolve to evidence/model lineage.
- Reviewer override and rejection paths work and are audited.
- Stale policy sources trigger review.
- Customer-facing export remains disabled unless explicit scoped controls are enabled.

## 12. Open governance questions

- Which initial jurisdictions will the pilot permit?
- What tenancy, encryption and hosting evidence will design partners require?
- Will the provider act only as processor, or will any product-improvement purpose create a controller role?
- What approved retention applies to source material, model logs and artifacts?
- How should approved historic packages behave after source deletion?
- Which specialist review partners are available for competition and sector escalation?
- What disclosures should appear inside exported client assets?
