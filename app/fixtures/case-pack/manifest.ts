// Synthetic case pack manifest — "NordMach / PulseGuard" new-offer monetisation case.
// Everything here is fictitious demonstration data (MVP_VALIDATION.md §3).
// Seeded quality issues:
//   contradiction          — EV-20 (mid-market rejects outcome pricing) vs EV-11 (sales: all customers accept it)
//   stale                  — SRC-12 (2019 market report)
//   unsupported_assertion  — EV-01 (CEO: customers will pay 20% of avoided downtime)
//   competition_trigger    — SRC-13 (rival's non-public discount schedule → quarantine)

export interface SourceFixture {
  code: string;
  title: string;
  kind: "upload" | "search_result" | "transcript" | "note";
  file: string;
  origin: string;
  url?: string;
  publisher?: string;
  publishedDate?: string;
  retrievedAt?: string;
  searchQuery?: string;
  confidentiality: "public" | "client_confidential" | "quarantined";
  sourceClass: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  status: "retrieved" | "selected" | "quarantined";
  quarantineReason?: string;
  seededIssue?: "contradiction" | "stale" | "unsupported_assertion" | "competition_trigger";
}

export const engagement = {
  name: "PulseGuard new-offer monetisation",
  clientName: "NordMach Industrial Systems Ltd (synthetic)",
  jurisdiction: "United Kingdom",
  audience: "B2B",
};

export const charter = {
  decision:
    "Which pricing model should NordMach adopt for the commercial launch of the PulseGuard predictive-maintenance service — bundle with equipment, site subscription, per-connected-machine fee, or a bounded performance-linked charge — at what level, and introduced how?",
  objective:
    "A board-approvable pricing recommendation that captures a fair share of the downtime value PulseGuard creates while turning contribution-positive within 18 months.",
  scope:
    "UK installed base (12 enterprise accounts / ~420 machines; 110 mid-market plants / ~880 machines) plus new machine sales, direct channel only.",
  exclusions:
    "No distributor channel design, no international pricing, no equipment repricing, no live price execution.",
  timeHorizon: "3-year modelling horizon; decision required for next-quarter board.",
  constraints: [
    "Contribution must turn positive within 18 months (Finance).",
    "Service capacity: one engineer per ~200 connected machines; onboarding must be phased (Operations).",
    "Any performance-linked element requires a cap, floor and agreed measurement protocol (Finance).",
    "Sales require a simple, explainable price structure (Sales).",
  ],
  successMeasures: [
    "Board approves one pricing model with defined levels and migration path.",
    "Modelled contribution-positive within 18 months in the base case.",
    "Recommendation traceable to reviewed evidence and a reproducible model.",
  ],
  riskTolerance:
    "Low tolerance for cash risk and revenue volatility; moderate tolerance for slower adoption.",
  owner: "Engagement lead (demo author)",
};

export const contextProfile = {
  market:
    "UK industrial equipment predictive-maintenance services; growing post-2020 IoT adoption; current attach-rate benchmarks are weak (best available source is from 2019).",
  customers:
    "Two segments: enterprise multi-site manufacturers (measure downtime, accept availability KPIs, dislike per-machine fees on idle backup capacity) and mid-market single-site plants (do not measure downtime cost, want flat predictable fees, reject performance-linked billing).",
  competitors:
    "SentinelIQ (software-only, £49/machine/month list, min 20 machines, no performance guarantees); MacroFleet (OEM, bundles ~4%/yr into new-equipment price, no published retrofit offer).",
  companyEconomics:
    "Platform fixed cost £380k/yr; £6/machine/month variable; £900/machine onboarding; engineer £58k per 200 machines; tight cash after Doncaster investment.",
  organisation:
    "Direct sales with revenue-based incentives (bundling threatens commission line); field-service capacity constrained.",
  implementationCapability:
    "Connection tracking exists (per-machine billing easy); site-level downtime measurement protocols do not exist yet (outcome billing is a project per site).",
  pricingContext:
    "Concentrated seller side (OEM with installed base); heterogeneous customers; differentiated offer vs software-only rivals; low data availability on willingness to pay; B2B only; no regulated price controls identified — competition-law care required around rival pricing intelligence.",
};

export const researchQuestions = [
  {
    code: "RQ-01",
    question: "What measurable value does PulseGuard create, and for whom?",
    decisionLink: "Sets the value ceiling and whether value-based levels are defensible.",
    hypothesis: "Avoided downtime is the dominant, measurable value driver in the enterprise segment.",
    domains: ["customer", "market"],
    sufficiencyRule: "At least two independent evidence types, including one direct customer or behavioural source.",
    priority: "high",
  },
  {
    code: "RQ-02",
    question: "Which price metric and model fits how each segment buys?",
    decisionLink: "Directly selects between bundle, subscription, per-machine and outcome-linked models.",
    hypothesis: "Enterprise accepts outcome-linked elements; mid-market requires flat predictable fees.",
    domains: ["customer"],
    sufficiencyRule: "Direct evidence from at least one customer per segment.",
    priority: "high",
  },
  {
    code: "RQ-03",
    question: "How do competitors and substitutes price comparable services?",
    decisionLink: "Anchors price levels and differentiation claims.",
    hypothesis: "Software-only rivals price per machine; OEMs bundle at point of sale.",
    domains: ["competitor"],
    sufficiencyRule: "Public list prices for at least two comparable offers, with comparability limits recorded.",
    priority: "medium",
  },
  {
    code: "RQ-04",
    question: "Can NordMach finance, bill and service each candidate model within its constraints?",
    decisionLink: "Feasibility screen and cash constraint on every option.",
    hypothesis: "Onboarding cost and service capacity, not demand, are the binding constraints in year one.",
    domains: ["company"],
    sufficiencyRule: "Finance and operations confirmation of cost, capacity and billing feasibility.",
    priority: "high",
  },
  {
    code: "RQ-05",
    question: "Which legal or competition constraints apply to the pricing approach?",
    decisionLink: "Gates the use of competitor information and any performance-linked terms.",
    hypothesis: "Main exposure is handling of rival pricing intelligence, not price regulation.",
    domains: ["regulatory"],
    sufficiencyRule: "Competition-sensitive sources classified; escalation triggers checked.",
    priority: "medium",
  },
];

export const sources: SourceFixture[] = [
  { code: "SRC-01", title: "Board memo — PulseGuard commercial launch", kind: "upload", file: "client-brief.md", origin: "Client CEO", confidentiality: "client_confidential", sourceClass: "F", status: "selected" },
  { code: "SRC-02", title: "PulseGuard service description and pilot results", kind: "upload", file: "product-description.md", origin: "Client product management", confidentiality: "client_confidential", sourceClass: "A", status: "selected" },
  { code: "SRC-03", title: "Segment data (accounts, machines, downtime cost)", kind: "upload", file: "segment-data.csv", origin: "Client commercial ops", confidentiality: "client_confidential", sourceClass: "A", status: "selected" },
  { code: "SRC-04", title: "Cost and forecast inputs", kind: "upload", file: "cost-forecast.csv", origin: "Client finance", confidentiality: "client_confidential", sourceClass: "A", status: "selected" },
  { code: "SRC-05", title: "Interview — Sales Director", kind: "transcript", file: "interview-sales-director.md", origin: "Engagement interview 2026-06-10", confidentiality: "client_confidential", sourceClass: "F", status: "selected" },
  { code: "SRC-06", title: "Interview — Finance Director", kind: "transcript", file: "interview-finance-director.md", origin: "Engagement interview 2026-06-11", confidentiality: "client_confidential", sourceClass: "F", status: "selected" },
  { code: "SRC-07", title: "Interview — Head of Field Service", kind: "transcript", file: "interview-operations.md", origin: "Engagement interview 2026-06-12", confidentiality: "client_confidential", sourceClass: "F", status: "selected" },
  { code: "SRC-08", title: "Interview — enterprise customer (Account E1)", kind: "transcript", file: "interview-customer-enterprise.md", origin: "Engagement interview 2026-06-16", confidentiality: "client_confidential", sourceClass: "B", status: "selected" },
  { code: "SRC-09", title: "Interview — mid-market customer (Account M7)", kind: "transcript", file: "interview-customer-midmarket.md", origin: "Engagement interview 2026-06-17", confidentiality: "client_confidential", sourceClass: "B", status: "selected", seededIssue: "contradiction" },
  { code: "SRC-10", title: "SentinelIQ public pricing page (saved search result)", kind: "search_result", file: "search-sentineliq-pricing.md", origin: "Approved search capability", url: "https://www.sentineliq.example/pricing", publisher: "SentinelIQ Ltd (fictitious)", publishedDate: "2026-05-01", retrievedAt: "2026-06-20", searchQuery: "predictive maintenance industrial compressors pricing UK", confidentiality: "public", sourceClass: "D", status: "selected" },
  { code: "SRC-11", title: "MacroFleet Care+ brochure (saved search result)", kind: "search_result", file: "search-macrofleet-bundle.md", origin: "Approved search capability", url: "https://www.macrofleet.example/services/care-plus", publisher: "MacroFleet GmbH (fictitious)", publishedDate: "2026-02-01", retrievedAt: "2026-06-20", searchQuery: "industrial equipment OEM connected service bundle pricing", confidentiality: "public", sourceClass: "D", status: "selected" },
  { code: "SRC-12", title: "Industrial Services Market Outlook 2019 (saved search result)", kind: "search_result", file: "search-market-outlook-2019.md", origin: "Approved search capability", url: "https://www.industryinsight.example/reports/ism-outlook-2019", publisher: "IndustryInsight Research (fictitious)", publishedDate: "2019-03-01", retrievedAt: "2026-06-20", searchQuery: "connected services attach rate industrial equipment market", confidentiality: "public", sourceClass: "E", status: "selected", seededIssue: "stale" },
  { code: "SRC-13", title: "SentinelIQ enterprise discount schedule (internal note)", kind: "note", file: "upload-competitor-discount-intel.md", origin: "Client sales operations, via ex-SentinelIQ employee", confidentiality: "quarantined", sourceClass: "F", status: "quarantined", quarantineReason: "Non-public rival pricing, discount floors and future price intentions obtained from a former employee. Unavailable to retrieval, strategy and recommendation until documented specialist competition review (COMP-04/05).", seededIssue: "competition_trigger" },
];

export interface ClaimFixture {
  code: string;
  sourceCode: string;
  rqCode: string;
  proposition: string;
  excerpt: string;
  location: string;
  contentType: "retrieved_fact" | "client_assertion";
  dateOfInfo?: string;
  scope: string;
  reliabilityNote: string;
  applicabilityNote: string;
}

export const claims: ClaimFixture[] = [
  { code: "EV-01", sourceCode: "SRC-01", rqCode: "RQ-01", contentType: "client_assertion", proposition: "Customers would pay up to 20% of avoided downtime cost for PulseGuard.", excerpt: "Customers have told us they would pay up to 20% of avoided downtime cost for a service like this", location: "Board memo, para 3", scope: "All segments (claimed)", reliabilityNote: "CEO belief; no customer research or named customers behind it.", applicabilityNote: "Unsupported management assertion — must not be treated as willingness-to-pay evidence." },
  { code: "EV-02", sourceCode: "SRC-01", rqCode: "RQ-04", contentType: "retrieved_fact", proposition: "Installed base is ~420 machines across 12 enterprise accounts and ~880 machines across 110 mid-market plants.", excerpt: "roughly 420 machines across our 12 enterprise accounts and about 880 machines across 110 mid-market plants", location: "Board memo, para 3", scope: "UK installed base, 2026", reliabilityNote: "Client-reported; matches segment data file.", applicabilityNote: "Baseline population for all adoption modelling." },
  { code: "EV-03", sourceCode: "SRC-01", rqCode: "RQ-04", contentType: "retrieved_fact", proposition: "Near-term cash is constrained; the chosen model must not require heavy upfront subsidy.", excerpt: "our near-term cash position is tight following the Doncaster plant investment", location: "Board memo, para 4", scope: "NordMach, 2026", reliabilityNote: "Consistent with Finance Director interview.", applicabilityNote: "Hard constraint on onboarding-cost-heavy models." },
  { code: "EV-04", sourceCode: "SRC-02", rqCode: "RQ-01", contentType: "retrieved_fact", proposition: "The 18-month pilot (3 enterprise accounts, 86 machines) reduced unplanned downtime by ~35% versus prior-year baseline.", excerpt: "Unplanned downtime reduced by ~35% versus each account's prior-year baseline", location: "Service description, pilot results", dateOfInfo: "2026-05", scope: "3 hand-picked enterprise pilot accounts", reliabilityNote: "Internal measurement, credible but small hand-picked sample.", applicabilityNote: "Upper bound; engineering itself cautions against generalising to all sites." },
  { code: "EV-05", sourceCode: "SRC-02", rqCode: "RQ-01", contentType: "retrieved_fact", proposition: "Baseline unplanned downtime averages ~30 hours per machine per year.", excerpt: "Baseline unplanned downtime across the pilot fleet averaged 30 hours per machine per year", location: "Service description, pilot results", scope: "Pilot fleet; assumed representative", reliabilityNote: "Pilot measurement.", applicabilityNote: "Key value-model input." },
  { code: "EV-06", sourceCode: "SRC-04", rqCode: "RQ-04", contentType: "retrieved_fact", proposition: "Cost structure: £380k/yr platform fixed; £6/machine/month variable; £900/machine onboarding; one £58k engineer per 200 connected machines.", excerpt: "platform_fixed_cost,380000 … variable_cost_per_machine,6 … onboarding_cost_per_machine,900 … service_engineer_cost,58000", location: "cost-forecast.csv rows 1–4", scope: "Current scale", reliabilityNote: "Finance-supplied planning figures.", applicabilityNote: "Deterministic model cost inputs." },
  { code: "EV-07", sourceCode: "SRC-02", rqCode: "RQ-01", contentType: "retrieved_fact", proposition: "Pilot results are unproven at poorly maintained plants and mid-market sites were not piloted at all.", excerpt: "pilot accounts were hand-picked, well-maintained sites; results at poorly maintained plants are unproven. Mid-market sites have not been piloted", location: "Service description, caveats", scope: "Generalisation limit", reliabilityNote: "Engineering's own caveat.", applicabilityNote: "Qualifies EV-04; downtime-reduction assumption should sit below pilot result." },
  { code: "EV-08", sourceCode: "SRC-03", rqCode: "RQ-01", contentType: "retrieved_fact", proposition: "Enterprise downtime cost is ~£1,800/hour, measured by three pilot accounts.", excerpt: "1800 … Downtime cost from 3 pilot accounts' own measurements", location: "segment-data.csv row 1", scope: "Enterprise segment", reliabilityNote: "Customer-measured at pilot accounts; unverified elsewhere.", applicabilityNote: "Value-ceiling input for enterprise." },
  { code: "EV-09", sourceCode: "SRC-03", rqCode: "RQ-01", contentType: "client_assertion", proposition: "Mid-market downtime cost of ~£600/hour is a sales-team estimate with no direct measurement.", excerpt: "Downtime cost is a sales-team estimate; no direct measurement", location: "segment-data.csv row 2", scope: "Mid-market segment", reliabilityNote: "Unmeasured internal estimate.", applicabilityNote: "Mid-market value claims are weakly evidenced; corroborated by M7 saying they do not measure downtime." },
  { code: "EV-10", sourceCode: "SRC-04", rqCode: "RQ-04", contentType: "retrieved_fact", proposition: "Contribution must turn positive within 18 months of launch.", excerpt: "finance_cash_constraint,18,months", location: "cost-forecast.csv row 5", scope: "Launch plan", reliabilityNote: "CFO planning constraint.", applicabilityNote: "Pass/fail test for every modelled option." },
  { code: "EV-11", sourceCode: "SRC-05", rqCode: "RQ-02", contentType: "client_assertion", proposition: "All customers will accept outcome pricing (Sales Director).", excerpt: "All of our customers will accept outcome pricing; I've not heard a single objection", location: "Sales Director interview, quote 1", scope: "All segments (claimed)", reliabilityNote: "No supporting customer research; interviewer flagged as internal belief.", applicabilityNote: "Directly contradicted by mid-market customer evidence (EV-20)." },
  { code: "EV-12", sourceCode: "SRC-05", rqCode: "RQ-04", contentType: "retrieved_fact", proposition: "Bundling PulseGuard into equipment price would remove the sales commission line and reduce selling effort.", excerpt: "If we bundle PulseGuard into the equipment price for free-ish, my team loses the commission line, and honestly they'll stop selling it", location: "Sales Director interview, quote 3", scope: "NordMach sales organisation", reliabilityNote: "First-hand incentive statement.", applicabilityNote: "Organisational feasibility issue for bundle option." },
  { code: "EV-13", sourceCode: "SRC-05", rqCode: "RQ-02", contentType: "retrieved_fact", proposition: "Sales reps need one simple, explainable price structure.", excerpt: "don't make me quote a different price at every plant", location: "Sales Director interview, quote 4", scope: "Direct channel", reliabilityNote: "First-hand.", applicabilityNote: "Constrains price-architecture complexity." },
  { code: "EV-14", sourceCode: "SRC-06", rqCode: "RQ-04", contentType: "retrieved_fact", proposition: "Any performance-linked element requires a hard cap, a floor and an agreed measurement protocol.", excerpt: "it needs a hard cap, a floor and an agreed measurement protocol", location: "Finance Director interview, quote 2", scope: "NordMach finance policy", reliabilityNote: "First-hand.", applicabilityNote: "Design constraint on outcome-linked options; echoed by enterprise customer (EV-18)." },
  { code: "EV-15", sourceCode: "SRC-06", rqCode: "RQ-04", contentType: "retrieved_fact", proposition: "Bundling buries service revenue inside the hardware line, hiding margin and exposing the service to hardware price pressure.", excerpt: "it buries the service revenue inside the hardware line, we can't see the margin", location: "Finance Director interview, quote 3", scope: "NordMach reporting", reliabilityNote: "First-hand.", applicabilityNote: "Financial-control issue for bundle option." },
  { code: "EV-16", sourceCode: "SRC-07", rqCode: "RQ-04", contentType: "retrieved_fact", proposition: "Service capacity is one engineer per ~200 connected machines; onboarding must be phased.", excerpt: "One engineer covers about two hundred connected machines … onboarding has to be phased", location: "Field Service interview, quote 2", scope: "Launch period", reliabilityNote: "First-hand operational constraint.", applicabilityNote: "Caps year-one adoption in the model." },
  { code: "EV-17", sourceCode: "SRC-07", rqCode: "RQ-02", contentType: "retrieved_fact", proposition: "Per-machine billing is administratively easy today; outcome billing requires a per-site measurement project.", excerpt: "Billing per connected machine is easy … Anything performance-linked means we need an agreed downtime measurement per site, which is a project in itself", location: "Field Service interview, quote 3", scope: "Billing operations", reliabilityNote: "First-hand.", applicabilityNote: "Implementation-cost difference between metrics." },
  { code: "EV-18", sourceCode: "SRC-08", rqCode: "RQ-02", contentType: "retrieved_fact", proposition: "Enterprise customer E1 measures downtime (~£1,800/hr), accepts availability KPIs, and would accept a capped, floored, jointly measured outcome-linked fee.", excerpt: "Would I pay based on outcomes? In principle yes … But I'd want a cap, a floor and a jointly owned measurement protocol", location: "E1 interview, quotes 1–2", dateOfInfo: "2026-06-16", scope: "Enterprise segment (one pilot account)", reliabilityNote: "Direct customer statement; single account, pilot participant (favourable selection).", applicabilityNote: "Supports bounded outcome-linked design in enterprise; sample of one." },
  { code: "EV-19", sourceCode: "SRC-08", rqCode: "RQ-02", contentType: "retrieved_fact", proposition: "Enterprise customer E1 rejects per-machine fees on idle backup machines and prefers site-level agreements.", excerpt: "What I will not do is pay a big fee per machine for the quiet ones … charge me at site level", location: "E1 interview, quote 3", scope: "Enterprise segment (one account)", reliabilityNote: "Direct customer statement.", applicabilityNote: "Weakens naive per-machine pricing in enterprise; supports site-level metric." },
  { code: "EV-20", sourceCode: "SRC-09", rqCode: "RQ-02", contentType: "retrieved_fact", proposition: "Mid-market customer M7 rejects performance-linked billing outright and will not accept a vendor-measured fee formula.", excerpt: "Performance-linked billing is a non-starter for me. I'm not agreeing a formula where NordMach's own system decides how much I owe them", location: "M7 interview, quote 2", dateOfInfo: "2026-06-17", scope: "Mid-market segment (one account)", reliabilityNote: "Direct customer statement; single account, not a pilot participant.", applicabilityNote: "Directly contradicts EV-11 and limits EV-18's generalisability beyond enterprise." },
  { code: "EV-21", sourceCode: "SRC-09", rqCode: "RQ-02", contentType: "retrieved_fact", proposition: "Mid-market customer M7 wants a fixed, predictable, plant-level monthly fee benchmarked against the cost of one bad breakdown per year.", excerpt: "What I can do is a fixed monthly amount I can put in the budget … one price for the plant", location: "M7 interview, quotes 3–4", scope: "Mid-market segment (one account)", reliabilityNote: "Direct customer statement.", applicabilityNote: "Supports flat site subscription for mid-market." },
  { code: "EV-22", sourceCode: "SRC-10", rqCode: "RQ-03", contentType: "retrieved_fact", proposition: "SentinelIQ lists £49/connected machine/month (annual billing, min 20 machines) plus £350/machine installation; no performance guarantees on the standard plan.", excerpt: "£49 per connected machine per month, billed annually. Minimum 20 machines … Installation charged separately at £350 per machine", location: "SentinelIQ pricing page (saved 2026-06-20)", dateOfInfo: "2026-05", scope: "UK public list price", reliabilityNote: "Public list price; realised prices after volume tiers unknown.", applicabilityNote: "Price anchor for per-machine models; software-only offer, not directly comparable to OEM service." },
  { code: "EV-23", sourceCode: "SRC-11", rqCode: "RQ-03", contentType: "retrieved_fact", proposition: "MacroFleet bundles connected monitoring at ~4% of equipment price per coverage year, sold only with new machines; no published retrofit price.", excerpt: "Care+ adds approximately 4% to the equipment purchase price per year of coverage … Existing installed machines can be retrofitted 'on application'", location: "MacroFleet brochure (saved 2026-06-20)", dateOfInfo: "2026-02", scope: "OEM new-equipment sales", reliabilityNote: "Public brochure.", applicabilityNote: "Bundle benchmark; does not cover installed-base retrofit, which is NordMach's main opportunity." },
  { code: "EV-24", sourceCode: "SRC-12", rqCode: "RQ-03", contentType: "retrieved_fact", proposition: "In 2018, connected-service attach rates averaged 8% of installed base, per-machine subscription was the dominant model (71%), and outcome-based models were 'largely experimental'.", excerpt: "attach rates … averaged 8% … Per-machine subscription is the dominant pricing model … outcome-based commercial models … remain 'largely experimental'", location: "ISM Outlook 2019 summary", dateOfInfo: "2019-03", scope: "Global OEM services, 2018 survey", reliabilityNote: "Reputable analyst summary, but seven years old — predates post-2020 industrial IoT acceleration.", applicabilityNote: "STALE: use only as a weak lower bound; do not treat 2018 attach rates or outcome-model scepticism as current." },
];

export const claimRelations = [
  { claim: "EV-20", related: "EV-11", relation: "contradicts", note: "Direct mid-market customer statement contradicts the sales belief that all customers accept outcome pricing." },
  { claim: "EV-20", related: "EV-18", relation: "qualifies", note: "Outcome acceptance appears segment-specific: plausible in enterprise, rejected in mid-market." },
  { claim: "EV-07", related: "EV-04", relation: "qualifies", note: "Pilot downtime reduction is an upper bound from hand-picked sites." },
  { claim: "EV-09", related: "EV-01", relation: "qualifies", note: "Mid-market value estimates are unmeasured, weakening the CEO's 20%-of-value claim further." },
  { claim: "EV-19", related: "EV-22", relation: "qualifies", note: "Competitor's per-machine list price does not resolve enterprise resistance to per-machine fees on idle machines." },
  { claim: "EV-14", related: "EV-18", relation: "supports", note: "Client finance policy and enterprise customer independently converge on cap/floor/protocol design." },
];

export const assumptions = [
  { code: "ASM-01", name: "Enterprise adoption by end of year 1", value: 0.5, low: 0.3, high: 0.7, unit: "share of enterprise machines connected", owner: "Model owner (demo author)", basis: "bounded_expert", rationale: "Pilot goodwill across 3 of 12 accounts plus service-capacity phasing (EV-16). No direct adoption evidence — bounded expert range.", linkedClaim: "EV-16" },
  { code: "ASM-02", name: "Mid-market adoption by end of year 1", value: 0.12, low: 0.05, high: 0.25, unit: "share of mid-market machines connected", owner: "Model owner (demo author)", basis: "bounded_expert", rationale: "Unpiloted segment; 2018 benchmark attach rate of 8% (EV-24, stale) treated as weak lower bound.", linkedClaim: "EV-24" },
  { code: "ASM-03", name: "Downtime reduction at commercial scale", value: 0.25, low: 0.15, high: 0.35, unit: "share of baseline unplanned downtime avoided", owner: "Model owner (demo author)", basis: "evidence_linked", rationale: "Pilot achieved 35% at hand-picked sites (EV-04); engineering caveat (EV-07) supports planning below pilot. High end of range = pilot result.", linkedClaim: "EV-04" },
  { code: "ASM-04", name: "Annual customer retention", value: 0.95, low: 0.9, high: 0.99, unit: "share of connected machines retained per year", owner: "Model owner (demo author)", basis: "bounded_expert", rationale: "No churn history exists for the new service; assumed high given switching friction of installed sensors.", linkedClaim: null },
  { code: "ASM-05", name: "Adoption growth in years 2–3", value: 0.5, low: 0.25, high: 0.75, unit: "relative growth of connected base per year", owner: "Model owner (demo author)", basis: "bounded_expert", rationale: "Post-launch expansion within existing accounts and new sales; capped by service capacity assumption.", linkedClaim: "EV-16" },
];
