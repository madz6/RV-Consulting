# Evidence retrieval and consolidation system

**Status:** Canonical methodology for MVP evidence handling  
**Owner:** Research / Product  
**Last updated:** 2026-07-11  
**Related:** [PRD](PRD.md) · [Workflow and oversight](WORKFLOW_AND_OVERSIGHT.md) · [Architecture](ARCHITECTURE.md)

## 1. Purpose

The evidence system converts a decision charter into a reviewed body of internal and external evidence that can legitimately inform strategy creation.

It is not a document summariser. It must:

1. Determine what needs to be known.
2. Plan how that knowledge will be acquired.
3. Retrieve evidence from permitted internal and external sources.
4. Extract inspectable claims with provenance.
5. Consolidate claims around research questions.
6. Preserve contradictions, limitations and missing evidence.
7. Require qualified human judgment before evidence supports a recommendation.

## 2. Governing rule

> Retrieval starts from an approved research question. Exploratory strategy hypotheses may originate at any time, but no claim or recommendation may be presented as supported without reviewed evidence, a reviewed analytical finding, or an explicit human-owned testable assumption.

No volume of sources compensates for poor applicability. The system must prefer a small, relevant and inspectable evidence base over a large corpus that creates false authority.

## 3. Evidence domains

Every engagement considers five domains. A domain may be marked not applicable only with human rationale.

### 3.1 Market evidence

Potential questions and variables:

- Market definition, boundaries and credible adjacent markets
- Size, growth, lifecycle and cyclicality
- Buyer and seller concentration
- Substitution and differentiation
- Capacity, scarcity, perishability and inventory constraints
- Demand volatility and seasonality
- Channel structure and bargaining power
- Input costs, commodities, transport and exchange rates
- Regulation, taxation and public policy
- Innovation, commoditisation and consolidation

The purpose is not to produce a generic market overview. Each observation must connect to a pricing implication or explicitly remain context only.

### 3.2 Customer evidence

Potential questions and variables:

- Segments, jobs, use cases and purchasing processes
- Functional, economic, emotional and reputational value
- Usage, transaction, renewal, churn and switching behaviour
- Win/loss reasons and alternatives considered
- Customer economics and cost of alternatives
- Budget owner, procurement process and contracting constraints
- Willingness to pay and price sensitivity
- Fairness perceptions and service expectations
- Migration and communication risk
- Frontline sales, service and account-management knowledge

Internal beliefs about customer value remain hypotheses until supported. Customer research and observed behaviour may contradict leadership or sales narratives; both remain visible.

### 3.3 Competitor and substitute evidence

Potential questions and variables:

- Public list prices and advertised ranges
- Packages, inclusions, exclusions and service levels
- Price metric and revenue model
- Promotions, fees, rebates and contract terms
- Normalised effective price where comparability is defensible
- Positioning, target segment and value claims
- Product and market momentum
- Public historical responses to market or price changes
- Credible non-obvious substitutes, including internal workarounds

Competitor data is never assumed comparable. Advertised/list price is not the same as realised price. The system records unit, currency, geography, date, package, volume, contract length, tax/fee treatment and other material conditions before comparison.

### 3.4 Company and organisational evidence

Potential questions and variables:

- Corporate, portfolio and commercial strategy
- Ownership, funding, runway, capital structure and covenants
- Investor expectations and exit horizon
- Growth, margin, cash, share and retention objectives
- Unit economics and full cost-to-serve
- Product portfolio, capacity and cannibalisation
- Brand position and risk appetite
- Sales model, incentives and discount authority
- Contract terms and negotiation behaviour
- Billing, ERP, CRM, CPQ and data maturity
- Culture, change readiness and decision rights
- Relevant tax, legal and regulatory constraints
- Tacit knowledge held by experienced employees

This domain is required to avoid recommending a theoretically attractive strategy the organisation cannot finance, sell, bill, govern or implement.

### 3.5 Regulatory, legal and ethical evidence

Potential questions and variables:

- Competition-law boundaries
- B2B/B2C status and price-transparency duties
- Personalised or dynamic pricing implications
- Data-protection roles, lawful basis and profiling
- Equality and vulnerable-customer effects
- Sector-specific price controls or conduct rules
- Contract, tax and accounting requirements
- Intellectual-property and source-use permissions

Legal research must use current legislation, regulator guidance or other authoritative primary sources and record the date last verified. The system routes issues; it does not issue legal conclusions.

## 4. Research-question object

Each question must contain:

```yaml
research_question:
  id: RQ-001
  question: "Which customer outcomes create differentiated value in the target segment?"
  decision_link: "Choice of price metric and packaging"
  hypothesis: "Operational uptime is a stronger value driver than units consumed"
  owner: "research-lead-user-id"
  domains: [customer, market]
  geography: ["United Kingdom"]
  valid_period: "2024-01-01 to 2026-07-11"
  source_plan:
    internal: [usage_data, win_loss_notes, account_interviews]
    external: [official_statistics, public_customer_material]
    primary_research: [customer_interviews]
  inclusion_criteria: "Evidence relates to target segment and current offer"
  exclusion_criteria: "Legacy product discontinued before 2024"
  sufficiency_rule: "At least two independent evidence types, including one behavioural or direct-customer source"
  priority:
    decision_impact: high
    current_uncertainty: high
    expected_value_of_more_evidence: high
  effort_budget: "2 researcher-days"
  stop_rule: "Stop after two independent evidence types agree or budget expires; escalate unresolved conflict"
  reviewer: "pricing-lead-user-id"
  status: approved
```

The schema is illustrative, not a promise of a YAML interface.

Research plans must rank questions using decision impact, current uncertainty, expected value of additional evidence and effort. Retrieval stops when the stated sufficiency/stop rule is met, the budget expires, or further evidence is unlikely to change the decision. A human decides whether the remaining uncertainty is acceptable for exploration, requires a test, or blocks recommendation.

## 5. Source hierarchy and use

Source authority is contextual rather than absolute. Use the following default hierarchy, then assess applicability.

| Tier | Source type | Typical use | Main limitation |
|---|---|---|---|
| A | Reconciled client transactions, contracts, invoices and controlled experiments | Actual economics and behaviour | Data quality and historical confounding |
| B | Properly designed customer research, win/loss studies and observed usage | Value, choice and segmentation | Sampling and method quality |
| C | Official statistics, law, regulator guidance and public filings | Market, legal and company facts | May be aggregated or lagged |
| D | Public competitor websites, tariffs, tenders and product materials | Observable positioning and advertised offers | Not realised price; comparability issues |
| E | Reputable industry or analyst research | Directional context and benchmarks | Transferability, access and methodology |
| F | Expert and frontline judgment | Hypothesis formation and applicability | Bias and limited generalisability |
| G | AI inference | Questions, hypotheses and challenge prompts | Not evidence |

AI inference cannot become a fact through repetition. It must be supported by retrieved evidence or remain an explicit hypothesis.

## 6. Retrieval workflow

### 6.1 Plan

The system proposes queries, target sources, retrieval depth, date/geography bounds and a research budget. The researcher edits and approves them.

### 6.2 Acquire internal evidence

Supported initial routes:

- File upload
- Structured spreadsheet import
- Interview or workshop transcript upload
- Human-authored research note

Future routes may include approved document stores, CRM, data warehouse, ERP and billing connectors.

Every internal source stores:

- Client and engagement
- Owner and uploader
- Origin and author where known
- Creation and retrieval dates
- Confidentiality and competition sensitivity
- Personal-data classification
- Permitted use and retention
- Extraction status and errors

Internal origin does not imply quality. Before quantitative analysis, the team reviews completeness, definitions, master-data consistency, currencies/units, time coverage, reconciliation, missing values and known collection bias.

### 6.3 Acquire external evidence

The MVP supports controlled public-web search and retrieval.

Every search stores:

- Research question
- Query and filters
- Domains searched or excluded
- Operator
- Search time
- Results returned and selected
- Retrieval outcome
- An authorised snapshot or content hash where legally and technically permitted, plus change/staleness status; a mutable URL alone is insufficient for an approval record

Priority order:

1. Current legislation, regulators and official statistics
2. Company filings and first-party product/price materials
3. Primary research publications
4. Reputable secondary research with disclosed method
5. Commentary or aggregation used only for discovery

Paid reports, databases and restricted sources require a licence or approved connector. Public availability does not by itself authorise wholesale commercial ingestion.

### 6.4 Treat retrieved content as untrusted

Files and webpages may contain malicious or irrelevant instructions. Retrieved content must never change system policy, permissions, workflow gates or tool authority.

Controls:

- Separate content from instructions
- Constrain extraction to declared schemas
- Use least-privilege tools
- Validate source type and origin
- Scan for suspicious embedded instructions
- Require human approval for consequential actions
- Test poisoned documents and indirect prompt injection

## 7. Atomic evidence claims

The system extracts atomic propositions rather than treating a document summary as evidence.

Minimum claim fields:

| Field | Description |
|---|---|
| Claim ID | Stable engagement-scoped identifier |
| Proposition | One checkable statement |
| Source ID | Exact source record |
| Location | Page, section, cell, timestamp or URL fragment where available |
| Supporting excerpt | Minimum text needed for inspection within permitted quotation limits |
| Paraphrase status | Verbatim, normalised or paraphrased |
| Source class | Internal data, official, competitor-public, research, expert note, etc. |
| Date and freshness | Publication/observation date and retrieval date |
| Scope | Geography, segment, population, product and period |
| Method/sample | Where relevant |
| Confidentiality | Public, client-confidential, restricted or quarantined |
| Reliability assessment | Method/source quality with rationale |
| Applicability assessment | Relevance to this client and decision with rationale |
| Relationship | Supports, contradicts, qualifies or contextualises another claim/hypothesis |
| State | Extracted, reviewed, approved, rejected or superseded |
| Reviewer | Human reviewer and timestamp |

Claims produced from calculations must be typed **calculated result**, not evidence claim, and linked to the model version.

Lifecycle states are deliberately separate:

- **Source:** discovered → retrieved → selected → cleared or excluded
- **Claim:** extracted → reviewed → approved, rejected or superseded
- **Analytical finding:** draft → reviewed → approved, rejected or superseded

“Extraction confidence” describes parsing/extraction uncertainty only. It is not a factual-reliability or approval score.

## 8. Analytical findings

An evidence claim states what a source says. An **analytical finding** records what an analyst or reproducible method derives from one or more sources.

Examples include:

- Price waterfall
- Segment definition
- Margin-leakage analysis
- Value map
- Normalised competitor comparison
- Cohort or contract analysis

Minimum fields:

- Finding ID and version
- Question/decision link
- Source and dataset versions
- Method, formula, query or code reference
- Analyst owner
- Result and units
- Uncertainty and sensitivity
- Limitations and known bias
- Reviewer and state

Findings do not become facts merely because a calculation exists. Reconciliation, method and assumptions remain inspectable.

## 9. Consolidation by question

The system must not simply produce one summary per source. It consolidates claims around the research question:

| Research question | Supporting evidence | Contrary evidence | Applicability limitations | Gap | Human conclusion |
|---|---|---|---|---|---|
| Can the target segment support an outcome-based metric? | Customers measure downtime cost; procurement accepts service KPIs | Historical contracts are input-based; two customers reject performance risk | Interview sample overrepresents large accounts | No evidence from mid-market buyers | Pilot only in enterprise segment |

### Consolidation operations

- Semantic clustering and near-duplicate detection
- Entity resolution for companies, products and segments
- Currency, unit, time and package normalisation
- Support/contradiction/qualification relationship detection
- Chronology and supersession handling
- Source independence assessment
- Coverage mapping against the research plan
- Gap identification and follow-up query generation

Original claims remain accessible. A consolidated finding never destroys provenance.

## 10. Contradiction handling

The system must preserve material disagreement.

When claims conflict, it proposes possible explanations:

- Different time periods
- Different markets or customer segments
- Different definitions or units
- Public list price versus negotiated realisation
- Method or sample differences
- Strategic versus operational perspective
- Source bias or outdated evidence
- Genuine unresolved uncertainty

The researcher chooses whether to reconcile, scope, investigate or leave unresolved. AI cannot silently select the claim that best supports a strategy.

## 11. Evidence-quality rubric

Each reviewed claim is assessed across separate dimensions:

| Dimension | Review question |
|---|---|
| Authority | Is the source competent and close to the underlying fact? |
| Method | Is the evidence-generation method described and credible? |
| Directness | Does it answer this question or require a large inferential jump? |
| Applicability | Does it match client, segment, geography, product and decision? |
| Freshness | Is it current enough for the market and decision? |
| Independence | Is it corroborated by genuinely independent evidence? |
| Completeness | Are important conditions, fees, units or limitations present? |
| Legal usability | Is the information authorised and safe to use? |

Do not collapse these into one opaque score for final review. A compact label may aid sorting, but material weaknesses remain visible.

## 12. Evidence sufficiency gate

A **material claim** could affect option design or ordering, financial outcome, risk, approval or external interpretation. Human review centres on consolidated findings plus material, disputed or high-risk claims; every claim used in a final asset must be approved or explicitly labelled as an assertion/assumption. Atomic low-materiality candidates may remain machine-extracted until needed.

A research question may be:

- **Sufficient:** evidence supports strategy work within documented limits.
- **Conditionally sufficient:** work may proceed using an explicit assumption, pilot or documented acceptance of non-legal evidential/commercial uncertainty. Suspected legal non-compliance cannot be accepted as residual risk.
- **Insufficient:** further research is required before the relevant strategy can be recommended.
- **Not applicable:** approved rationale shows the question does not affect the decision.

Minimum gate checks:

- Research protocol approved
- Required source classes attempted
- Material claims reviewed
- Contrary evidence considered
- Scope and applicability documented
- Gaps and uncertainty visible
- Restricted evidence quarantined or cleared
- Reviewer named

## 13. Willingness-to-pay and behavioural evidence

The system must never invent elasticity, churn response or willingness to pay.

Default evidence hierarchy:

1. Controlled price experiments
2. Actual transactions and observed customer behaviour
3. Historical win/loss, renewal, churn and switching response
4. Properly designed conjoint or discrete-choice research
5. Customer interviews and other stated-preference research
6. Transferable external benchmarks
7. Bounded expert assumption
8. AI inference, used only to formulate a question

Where only an assumption exists:

- Store an interval, not false precision
- Name its owner
- Show source/rationale
- Test sensitivity and switching value
- Require a pilot if the decision is highly sensitive

The system may assist with research design, but a human research specialist must approve study purpose, attributes, levels, sample, instrument, analysis and interpretation before the output is called validated willingness-to-pay evidence.

## 14. Competitor-research controls

### Permitted default

- Public websites and tariffs
- Public filings and official announcements
- Published tenders and awards
- Properly licensed research
- Client-owned observations that legal/competition review permits

### Quarantine triggers

- A rival's future pricing intention
- Non-public discounts, capacity, stock, cost or strategic plans
- Trade-association or shared-platform data of uncertain provenance
- Information originating from another client
- Material received under unclear confidentiality

UK competition guidance explicitly warns that a consultant or pricing-software provider may be accountable when recommendations to rivals rely on one another's confidential information. The product therefore prohibits cross-client retrieval and defaults competitor research to public sources. All non-public rival information is quarantined; ordinary user or client authorisation does not clear it, and any exceptional handling requires documented specialist competition review. See [CMA: AI and collusion](https://competitionandmarkets.blog.gov.uk/2026/03/04/ai-and-collusion-frontiers-opportunities-and-challenges/).

## 15. RAG and retrieval architecture requirements

RAG is a retrieval mechanism inside the evidence system, not a substitute for research methodology.

These are native product-pilot requirements. The hackathon demonstrator may use an approved existing search/retrieval capability with saved provenance rather than building this infrastructure.

Required controls:

- Engagement- and tenant-scoped indexes
- Permission-aware retrieval at query time
- Source metadata inherited by chunks and embeddings
- Hybrid search where useful, followed by reranking
- Retrieval logs linked to research questions
- Exact source-location return with every evidence candidate
- No answer-generation fallback that hides empty retrieval
- Source deletion cascading to chunks, embeddings, caches and derived drafts
- Citation validation after generation
- Evaluation against known source sets

Client data is not used for cross-client recommendations, benchmarking, model training or product improvement in the MVP.

## 16. Evidence-to-strategy rules

Every material strategy component must resolve to one or more of:

- Approved supporting evidence
- Approved calculated result
- Explicit human assumption
- Explicit hypothesis requiring a test

The product must show:

- Evidence supporting the component
- Evidence contradicting or limiting it
- Missing information
- Assumptions introduced
- Human author/editor

Unsupported components may remain in the longlist for exploration but cannot be presented as established conclusions.

## 17. Evidence-book artifact

The generated evidence book contains:

1. Decision charter and research scope
2. Research questions and protocols
3. Source register
4. Claim register
5. Evidence synthesis by question
6. Contradictions and resolution decisions
7. Gaps and limitations
8. Assumptions promoted into modelling
9. Citations used in memo and deck
10. Reviewer and approval record

It cites and summarises sources rather than reproducing extensive copyrighted content.

## 18. Evaluation

Minimum evidence-system evaluations:

- Retrieval recall against an expert-curated relevant-source set
- Precision of retrieved passages
- Citation correctness and claim entailment
- Source-authority and freshness classification
- Duplicate clustering accuracy
- Critical contradiction recall
- Applicability assessment quality
- Appropriate abstention when evidence is absent
- Prompt-injection and poisoned-source resistance
- Cross-client retrieval leakage, with a target of zero
- Deletion propagation

An eloquent synthesis with a wrong or missing source is a failed result.

## 19. Standards and authoritative guidance

The design draws on:

- [HM Treasury Magenta Book](https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html) for question-led evidence review, source quality, synthesis, triangulation, uncertainty and peer review.
- [HM Treasury Green Book 2026](https://www.gov.uk/government/publications/the-green-book-appraisal-and-evaluation-in-central-government/the-green-book-2026) for evidence, options, uncertainty, sensitivity and switching values.
- [NIST Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence) for provenance, testing, governance and content-integrity controls.
- [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) for govern–map–measure–manage lifecycle practice.
- [OWASP prompt-injection guidance](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) and [vector/embedding guidance](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/) for untrusted retrieval and isolation controls.

These are methodological and voluntary controls unless separately required by applicable law or contract.

## 20. Open questions

- What exact source formats can preserve page/cell/timestamp provenance in the demonstrator?
- How much of source-quality assessment should be automated versus researcher-entered?
- What evidence-sufficiency templates are needed for the first engagement archetype?
- How will licensed research providers permit storage of excerpts and embeddings?
- Should public competitor webpages be snapshotted, hashed or only referenced?
- Which primary-research artifacts belong in P1 rather than the initial corpus?
