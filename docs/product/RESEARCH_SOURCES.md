# Research source register

**Verified:** 2026-07-11  
**Purpose:** Record the external basis for product and governance decisions  
**Important:** This is product research, not legal advice. Applicability depends on jurisdiction, sector, B2B/B2C context, data and intended use.

## 1. How to interpret this register

Sources are grouped as:

- **Law / regulator:** authoritative for legal and compliance design, subject to applicability and professional advice.
- **Official methodology / standard:** transferable or voluntary good practice.
- **Consultancy practice:** useful evidence of established pricing methods, but also commercial positioning.
- **Vendor first-party:** reliable evidence of advertised product capability, not independent performance validation.
- **Inference:** a product conclusion drawn from multiple sources and requiring customer validation.

No source below proves product-market fit. Demand, willingness to pay and workflow adoption must be tested directly with prospective users.

## 2. Competition and pricing law

| Source | Type | Supports |
|---|---|---|
| [UK Competition Act 1998, section 2](https://www.legislation.gov.uk/ukpga/1998/41/section/2) | Law | UK prohibition relevant to anti-competitive agreements and coordination |
| [TFEU Article 101](https://eur-lex.europa.eu/eli/treaty/tfeu_2016/art_101/oj/eng) | Law | EU prohibition relevant to anti-competitive agreements and concerted practices |
| [EU Horizontal Guidelines, information exchange](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52023XC0721%2801%29) | Regulatory guidance | Analysis of direct/indirect competitively sensitive information exchange |
| [CMA: AI and collusion—frontiers, opportunities and challenges](https://competitionandmarkets.blog.gov.uk/2026/03/04/ai-and-collusion-frontiers-opportunities-and-challenges/) | Regulator guidance, March 2026 | Third-party pricing providers can create information-exchange risk; scrutinise data/algorithms and use anti-collusion controls |
| [CMA: Pricing algorithms and competition law](https://competitionandmarkets.blog.gov.uk/2024/11/08/pricing-algorithms-and-competition-law-what-you-need-to-know/) | Regulator guidance | Providers and users must understand pricing systems and avoid competitor-confidential inputs |
| [CMA: Managing competitively sensitive information](https://www.gov.uk/government/publications/limiting-risk-in-relation-to-competitors-information/managing-competitively-sensitive-information) | Regulator guidance | Practical treatment of competitor information and third-party handling |
| [CMA209: Price transparency](https://www.gov.uk/government/publications/price-transparency-cma209) | Regulator guidance, updated 2026 | Mandatory fees, taxes, drip/partitioned pricing and clear consumer price presentation |
| [CMA dynamic-pricing guidance](https://www.gov.uk/government/publications/dynamic-pricing-tips-for-businesses/tips-for-businesses-using-dynamic-pricing) | Regulator guidance | Transparency, fairness, vulnerable consumers and checkout considerations |
| [CMA: Consumer law when using AI agents](https://www.gov.uk/government/publications/complying-with-consumer-law-when-using-ai-agents/complying-with-consumer-law-when-using-ai-agents) | Regulator guidance, March 2026 | Business responsibility, pre-deployment testing, monitoring, human checking and disclosure |
| [EU Price Indication Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A01998L0006-20220528) | Law | Prior-price rules relevant to announced reductions on goods |
| [European Commission Consumer Rights Directive guidance](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A52021XC1229%2804%29) | Regulatory guidance | Disclosure relevant to personalised pricing in distance/off-premises consumer transactions |
| [EHRC guidance for businesses](https://www.equalityhumanrights.com/guidance/business/guidance-businesses) | Regulator guidance | Equality risks in customer treatment and pricing/service terms |

### Product decisions supported

- Absolute MVP prohibition on using one client's confidential data in another client's retrieval, benchmarking or recommendations.
- Public/authorised competitor evidence as the default, with quarantine for uncertain information.
- Jurisdiction, sector, B2B/B2C and pricing-type classification at engagement setup.
- Human/legal review triggers for concentrated markets, personalised/dynamic pricing and consumer-facing assets.
- No automatic publication or price execution in the MVP.

## 3. Privacy, AI and information governance

| Source | Type | Supports |
|---|---|---|
| [UK ICO: Data protection by design and default](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/) | Regulator guidance | Purpose limitation, minimisation, access, retention and accountable design |
| [UK ICO: DPIA guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/what-is-a-dpia/) | Regulator guidance | Risk assessment for likely high-risk processing |
| [UK ICO: AI contracts and third parties](https://ico.org.uk/for-organisations/advice-and-services/audits/data-protection-audit-framework/toolkits/artificial-intelligence/contracts-and-third-parties/) | Regulator guidance | Controller/processor roles, supplier contracts and third-party risks |
| [UK ICO: Human review](https://ico.org.uk/for-organisations/advice-and-services/audits/data-protection-audit-framework/toolkits/artificial-intelligence/human-review/) | Regulator guidance | Competent, authorised and meaningful human review rather than rubber-stamping |
| [UK ICO: Data (Use and Access) Act 2025 summary](https://ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-duaa-summary-of-the-changes/data-protection/) | Regulator guidance | Current UK automated-decision safeguards; detailed guidance should be rechecked before production |
| [EU GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) | Law | EU data-protection duties and automated-decision safeguards |
| [European Commission: Automated decision-making restrictions](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/dealing-citizens/are-there-restrictions-use-automated-decision-making_en) | Official guidance | Article 22 conditions and safeguards |
| [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) | Law | AI literacy, high-risk use cases including certain credit/life-health insurance pricing, transparency and oversight duties where applicable |
| [European Commission AI Act timeline](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) | Official implementation guidance | Staged applicability; dates should be monitored rather than frozen in product prompts |
| [European Commission AI literacy FAQ](https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers) | Official guidance | Article 4 AI-literacy expectations |

### Product decisions supported

- Record processing purpose, roles, data classes, retention and permitted use.
- Do not train on or reuse client content across clients by default.
- Implement true tenant isolation and deletion propagation.
- Provide competent reviewers with context and authority to change/reject outputs.
- Classify and block unsupported high-risk use cases.
- Version policy sources and last-verified dates.

## 4. Evidence, evaluation and security methods

| Source | Type | Supports |
|---|---|---|
| [HM Treasury Magenta Book](https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html) | Official methodology | Question-led evidence gathering, inclusion criteria, source quality, triangulation, uncertainty and peer review |
| [HM Treasury Green Book 2026](https://www.gov.uk/government/publications/the-green-book-appraisal-and-evaluation-in-central-government/the-green-book-2026) | Official methodology | Broad option generation, business-as-usual, transparent shortlisting, costs/benefits/risks, scenarios, sensitivity and switching values |
| [HM Treasury MCDA guidance](https://www.gov.uk/government/publications/green-book-supplementary-guidance-use-of-multi-criteria-decision-analysis/use-of-multi-criteria-decision-analysis-in-options-appraisal-of-economic-cases) | Official methodology | Expert-led criteria/trade-offs and sensitivity to weights/performance |
| [NIST Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence) | Voluntary standard/guidance | Governance, pre-deployment testing, provenance, citation verification and monitoring |
| [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) | Voluntary standard/guidance | Govern–map–measure–manage lifecycle and explicit human/AI roles |
| [OWASP: Prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | Voluntary security guidance | Treat retrieved files/webpages as untrusted; least privilege and structured boundaries |
| [OWASP: Vector and embedding weaknesses](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/) | Voluntary security guidance | Cross-tenant leakage, poisoning, permission-aware retrieval and ingestion validation |
| [OWASP: Excessive agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | Voluntary security guidance | Minimise tools/permissions and require human approval for consequential actions |
| [UK IPO: Copyright exceptions](https://www.gov.uk/guidance/exceptions-to-copyright) | Official legal guidance | Public availability does not create a general commercial text/data-mining right |
| [UK IPO: Sui generis database rights](https://www.gov.uk/guidance/sui-generis-database-rights) | Official legal guidance | Database-right considerations for external retrieval |

### Product decisions supported

- Research questions and inclusion criteria precede retrieval.
- Claims preserve provenance, conflict, applicability and uncertainty.
- Human evidence review is mandatory before client-facing use.
- RAG is evaluated for retrieval, citation, security and abstention—not fluency alone.
- Search and ingestion respect licences, access controls and permitted use.

## 5. Pricing-consulting practice

These sources indicate established practice; they do not independently validate vendor results.

| Source | Supports |
|---|---|
| [BCG: The Unified Theory of Pricing](https://www.bcg.com/publications/2023/the-unified-theory-of-pricing) | Pricing methods vary with buyer/seller concentration, customer heterogeneity and offer differentiation; sectors should not share one default playbook |
| [BCG: AI can transform B2B pricing, but it is not plug and play](https://www.bcg.com/publications/2026/why-ai-in-b2b-pricing-isnt-plug-and-play) | Pricing AI must integrate customer/competitor/channel context, business priorities and tacit knowledge; AI proposes, deterministic tools constrain and humans supervise |
| [BCG: Are You Fluent in Pricing?](https://www.bcg.com/publications/2010/are-you-fluent-in-pricing) | Competitor intelligence should be consolidated and operationalised; pricing memos, governance, pilots and performance monitoring support implementation |
| [McKinsey: Setting value, not price](https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/setting-value-not-price) | Customer-perceived value, price and competitive position must be combined; internal beliefs about value may be wrong |
| [McKinsey: Digital pricing transformations](https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/digital-pricing-transformations-the-key-to-better-margins) | Strategy, price setting, execution and organisation form an end-to-end journey; process and scenario design should precede technology selection |
| [McKinsey: Pricing new products](https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/pricing-new-products) | New-offer pricing needs customer-value ceiling, cost floor, market size, competitive reaction, lifecycle and cannibalisation analysis |
| [McKinsey: B2B pricing and the AI revolution](https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/b2b-pricing-navigating-the-next-phase-of-the-ai-revolution) | Current practitioner signal that AI is moving across research, synthesis, pricing and execution, with escalation, oversight and audit requirements |
| [Simon-Kucher: Pricing strategy and revenue management](https://www.simon-kucher.com/en/consulting/commercial-strategy-pricing-consulting/pricing-strategy-revenue-management) | Pricing engagements span dynamic, value-based and monetisation strategy rather than one method |
| [Simon-Kucher: Value-based pricing](https://www.simon-kucher.com/en/consulting/commercial-strategy-pricing-consulting/pricing-strategy-revenue-management/value-based-pricing) | Customer research, value drivers and willingness to pay are central to strategy formation |
| [Simon-Kucher: Value-based pricing methods](https://www.simon-kucher.com/en/insights/value-based-pricing-definition-strategies-and-success-factors) | Conjoint, elasticity analysis, surveys, focus groups and real-world tests require appropriate use |
| [Bain: Clearing the roadblocks to better B2B pricing](https://www.bain.com/contentassets/a9f9bdcdd932455d91e06f1cce293672/bain_brief_clearing_the_roadblocks_to_better_b2b_pricing.pdf) | Pricing playbooks, competitor monitoring, standard discount criteria and clear decision rights |
| [ISPOR conjoint-analysis good-practice checklist](https://pubmed.ncbi.nlm.nih.gov/21669364/) | Human-specialist rubric for discrete-choice research design and reporting |

### Product decisions supported

- Start with non-routine strategy engagements rather than operational price optimisation.
- Retrieve market, customer, competitor, company and regulatory evidence.
- Keep strategy design open across target, offer, metric, model, architecture, terms, migration and governance.
- Put reproducible modelling downstream of strategy creation and distinguish deterministic financial arithmetic from statistical/causal methods.
- Preserve meaningful human authorship and review.
- Generate a linked decision package rather than one narrative answer.

## 6. Competitive landscape

The following are first-party descriptions of advertised capabilities as of the verification date.

| Product | Advertised strengths | Product implication / inference |
|---|---|---|
| [Pricefx platform](https://www.pricefx.com/software) and [pricing agents](https://www.pricefx.com/software/pricingai/agents) | Analytics, price management, optimisation, quoting, agreements, agents and margin/opportunity detection | Margin analysis and AI recommendations are not a sufficient wedge; focus upstream on evidence-to-strategy lineage |
| [Vendavo AI and intelligence](https://www.vendavo.com/platform/ai-and-intelligence/) and [2026 price-rules announcement](https://www.vendavo.com/company/press/vendavo-advances-ai-with-pricing-assistant-innovations-introduces-ml-driven-price-rules-generator/) | Root-cause assistance, action recommendations and human-reviewed strategy/rule generation for complex B2B pricing | Human-approved AI suggestions alone are not differentiated; evidence acquisition and strategy argument formation must be core |
| [Zilliant Price IQ](https://zilliant.com/products/price-iq) and [workflow documentation](https://docs.zilliant.com/docs/about-price-iq) | Configure strategies, optimise scenarios, review and publish to operational systems | Opportunity exists before a strategy is ready to express as objectives, constraints and parameters |
| [Conga Price Optimization Management](https://conga.com/platform/price-optimization-management) | Optimisation, strategy management, simulation, approvals and revenue-lifecycle integration | Generated assets alone are not enough; differentiate decision evidence and consulting narrative from commercial-document automation |
| [Competera price intelligence](https://competera.ai/solutions/by-need/price-intelligence) and [pricing automation](https://competera.ai/products/pricing-automation) | Retail competitor crawling/matching, elasticity, scenarios, guardrails and price publishing | Do not compete on SKU monitoring; retrieve a broader evidence set for non-routine strategic decisions |
| [WorkBoardAI](https://www.workboard.com/products/workboardai) | Strategy, assumptions, scenarios, collaboration and management pre-reads | A generic strategy workspace is crowded; pricing-specific evidence and modelling are essential |
| [Anaplan platform](https://www.anaplan.com/platform/) | Governed planning, deterministic calculations, scenarios and collaboration | Scenario collaboration is not unique; linkage to pricing research and consultancy assets must differentiate |

## 7. Consolidated product inference

The plausible opening is:

> A vendor-neutral engagement and decision layer for the zero-to-recommendation phase: turning an ambiguous pricing problem and fragmented internal/external evidence into a human-authored, model-tested and approval-ready strategy.

This inference remains vulnerable because Pricefx, Vendavo and other platforms are moving upstream. The product must prove expert value in:

- Research-question design
- Multi-source retrieval beyond transaction and competitor-price data
- Contradiction-aware consolidation
- Human strategy composition and branching
- Evidence/model/decision lineage
- Linked consultancy assets

## 8. Research gaps

External research does not answer:

- How frequently target consultancies run qualifying engagements
- How much time they spend by workflow stage
- Which tools they currently combine
- Whether evidence consolidation is perceived as painful or billable value
- Whether they will keep strategy creation inside a structured workspace
- Security and deployment requirements by firm size
- Willingness to pay and budget ownership
- Whether internal pricing teams have stronger demand
- Which initial engagement archetype gives the best model coverage

These require primary user research described in [MVP_VALIDATION.md](MVP_VALIDATION.md).

## 9. Maintenance

- Reverify regulatory and product sources before a production launch or material scope change.
- Record source date and policy version in the application.
- Treat vendor capabilities as time-sensitive.
- Add interview evidence separately from public-source research.
- Do not copy extensive source content into this repository; cite and summarise.
