import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Every table is engagement-scoped. All AI output lands in `proposals`;
// canonical rows change only through human actions recorded in `reviewDecisions`
// and `auditEvents`. Approved rows are immutable by convention: edits create a
// new version row and mark the old one superseded.

const id = () =>
  integer("id").primaryKey({ autoIncrement: true });
const ts = (name: string) =>
  text(name)
    .notNull()
    .$defaultFn(() => new Date().toISOString());

export const engagements = sqliteTable("engagements", {
  id: id(),
  name: text("name").notNull(),
  clientName: text("client_name").notNull(),
  jurisdiction: text("jurisdiction").notNull().default("United Kingdom"),
  audience: text("audience").notNull().default("B2B"),
  confidentiality: text("confidentiality").notNull().default("synthetic"),
  synthetic: integer("synthetic", { mode: "boolean" }).notNull().default(true),
  status: text("status").notNull().default("active"),
  createdAt: ts("created_at"),
});

export const charters = sqliteTable("charters", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  version: integer("version").notNull().default(1),
  decision: text("decision").notNull(),
  objective: text("objective").notNull(),
  scope: text("scope").notNull(),
  exclusions: text("exclusions").notNull().default(""),
  timeHorizon: text("time_horizon").notNull().default(""),
  constraintsJson: text("constraints_json").notNull().default("[]"),
  successMeasuresJson: text("success_measures_json").notNull().default("[]"),
  riskTolerance: text("risk_tolerance").notNull().default(""),
  owner: text("owner").notNull().default(""),
  // draft | approved | superseded
  status: text("status").notNull().default("draft"),
  approvedBy: text("approved_by"),
  approvedAt: text("approved_at"),
  createdAt: ts("created_at"),
});

export const contextProfiles = sqliteTable("context_profiles", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  version: integer("version").notNull().default(1),
  // { market, customers, competitors, companyEconomics, organisation, implementationCapability, pricingContext }
  fieldsJson: text("fields_json").notNull().default("{}"),
  status: text("status").notNull().default("draft"),
  createdAt: ts("created_at"),
});

export const researchQuestions = sqliteTable("research_questions", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  code: text("code").notNull(), // RQ-01
  question: text("question").notNull(),
  decisionLink: text("decision_link").notNull(),
  hypothesis: text("hypothesis").notNull().default(""),
  domainsJson: text("domains_json").notNull().default("[]"),
  sufficiencyRule: text("sufficiency_rule").notNull().default(""),
  priority: text("priority").notNull().default("medium"),
  // proposed | approved | sufficient | conditionally_sufficient | insufficient | not_applicable
  status: text("status").notNull().default("proposed"),
  reviewer: text("reviewer"),
  humanConclusion: text("human_conclusion"),
  createdAt: ts("created_at"),
});

export const sources = sqliteTable("sources", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  code: text("code").notNull(), // SRC-01
  title: text("title").notNull(),
  // upload | search_result | transcript | note
  kind: text("kind").notNull(),
  origin: text("origin").notNull().default(""),
  url: text("url"),
  publisher: text("publisher"),
  publishedDate: text("published_date"),
  retrievedAt: text("retrieved_at"),
  searchQuery: text("search_query"),
  // public | client_confidential | restricted | quarantined
  confidentiality: text("confidentiality").notNull().default("client_confidential"),
  // tiers A-G per EVIDENCE_SYSTEM.md §5
  sourceClass: text("source_class").notNull().default("F"),
  // retrieved | selected | excluded | quarantined
  status: text("status").notNull().default("retrieved"),
  quarantineReason: text("quarantine_reason"),
  // seeded quality issue label (synthetic case pack): contradiction | stale | unsupported_assertion | competition_trigger
  seededIssue: text("seeded_issue"),
  content: text("content").notNull().default(""),
  createdAt: ts("created_at"),
});

export const claims = sqliteTable("claims", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  code: text("code").notNull(), // EV-01
  sourceId: integer("source_id").notNull(),
  researchQuestionId: integer("research_question_id"),
  proposition: text("proposition").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  location: text("location").notNull().default(""),
  // verbatim | normalised | paraphrased
  paraphraseStatus: text("paraphrase_status").notNull().default("paraphrased"),
  // retrieved_fact | client_assertion | ai_inference
  contentType: text("content_type").notNull().default("retrieved_fact"),
  dateOfInfo: text("date_of_info"),
  scope: text("scope").notNull().default(""),
  reliabilityNote: text("reliability_note").notNull().default(""),
  applicabilityNote: text("applicability_note").notNull().default(""),
  // extracted | approved | qualified | rejected | superseded
  state: text("state").notNull().default("extracted"),
  reviewer: text("reviewer"),
  reviewNote: text("review_note"),
  createdBy: text("created_by").notNull().default("ai"),
  createdAt: ts("created_at"),
});

export const claimRelations = sqliteTable("claim_relations", {
  id: id(),
  claimId: integer("claim_id").notNull(),
  relatedClaimId: integer("related_claim_id").notNull(),
  // supports | contradicts | qualifies | duplicates
  relation: text("relation").notNull(),
  note: text("note").notNull().default(""),
});

export const syntheses = sqliteTable("syntheses", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  researchQuestionId: integer("research_question_id").notNull(),
  version: integer("version").notNull().default(1),
  supportingSummary: text("supporting_summary").notNull().default(""),
  contrarySummary: text("contrary_summary").notNull().default(""),
  limitations: text("limitations").notNull().default(""),
  gaps: text("gaps").notNull().default(""),
  humanConclusion: text("human_conclusion"),
  // proposed | approved | superseded
  status: text("status").notNull().default("proposed"),
  createdBy: text("created_by").notNull().default("ai"),
  reviewer: text("reviewer"),
  createdAt: ts("created_at"),
});

export const assumptions = sqliteTable("assumptions", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  code: text("code").notNull(), // ASM-01
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  owner: text("owner").notNull().default(""),
  value: real("value").notNull(),
  low: real("low"),
  high: real("high"),
  unit: text("unit").notNull().default(""),
  rationale: text("rationale").notNull().default(""),
  // evidence_linked | bounded_expert | client_assertion
  basis: text("basis").notNull().default("bounded_expert"),
  linkedClaimId: integer("linked_claim_id"),
  // proposed | approved | superseded
  status: text("status").notNull().default("proposed"),
  createdAt: ts("created_at"),
});

export const strategies = sqliteTable("strategies", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  code: text("code").notNull(), // STRAT-01
  parentStrategyId: integer("parent_strategy_id"),
  title: text("title").notNull(),
  thesis: text("thesis").notNull(),
  // human | ai_assisted
  authorship: text("authorship").notNull().default("human"),
  originNote: text("origin_note").notNull().default(""),
  // structured design choices: segment, offer, priceMetric, pricingModel, architecture, fences, migration, governance, pilot
  designJson: text("design_json").notNull().default("{}"),
  causalChain: text("causal_chain").notNull().default(""),
  requiredConditions: text("required_conditions").notNull().default(""),
  failureModes: text("failure_modes").notNull().default(""),
  smallestTest: text("smallest_test").notNull().default(""),
  challengeJson: text("challenge_json"), // structured challenge accepted onto this strategy
  // draft | selected | rejected | superseded
  status: text("status").notNull().default("draft"),
  rejectionReason: text("rejection_reason"),
  createdBy: text("created_by").notNull().default("human"),
  createdAt: ts("created_at"),
});

export const strategyLinks = sqliteTable("strategy_links", {
  id: id(),
  strategyId: integer("strategy_id").notNull(),
  claimId: integer("claim_id"),
  synthesisId: integer("synthesis_id"),
  assumptionId: integer("assumption_id"),
  // supporting | contrary | gap | assumption
  kind: text("kind").notNull(),
  note: text("note").notNull().default(""),
});

export const modelSpecs = sqliteTable("model_specs", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  strategyId: integer("strategy_id").notNull(),
  version: integer("version").notNull().default(1),
  name: text("name").notNull(),
  // engine id + strategy transformation parameters
  specJson: text("spec_json").notNull(),
  // draft | validated | superseded
  status: text("status").notNull().default("draft"),
  validatedBy: text("validated_by"),
  validatedAt: text("validated_at"),
  createdAt: ts("created_at"),
});

export const modelRuns = sqliteTable("model_runs", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  modelSpecId: integer("model_spec_id").notNull(),
  scenario: text("scenario").notNull(), // base | downside | upside | sensitivity
  version: integer("version").notNull().default(1),
  inputsJson: text("inputs_json").notNull(),
  // [{ outputId, label, value, unit }]
  outputsJson: text("outputs_json").notNull(),
  inputHash: text("input_hash").notNull(),
  engineVersion: text("engine_version").notNull(),
  // current | superseded
  status: text("status").notNull().default("current"),
  createdAt: ts("created_at"),
});

export const recommendations = sqliteTable("recommendations", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  version: integer("version").notNull().default(1),
  decision: text("decision").notNull(),
  rationale: text("rationale").notNull().default(""),
  conditions: text("conditions").notNull().default(""),
  risks: text("risks").notNull().default(""),
  rejectedAlternatives: text("rejected_alternatives").notNull().default(""),
  counterCase: text("counter_case").notNull().default(""),
  // draft | owned | superseded
  status: text("status").notNull().default("draft"),
  owner: text("owner"),
  createdAt: ts("created_at"),
});

export const reviewDecisions = sqliteTable("review_decisions", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  objectType: text("object_type").notNull(),
  objectId: integer("object_id").notNull(),
  actor: text("actor").notNull(),
  role: text("role").notNull(),
  // approve | reject | qualify | comment | request_revision | release | select | validate
  action: text("action").notNull(),
  note: text("note").notNull().default(""),
  createdAt: ts("created_at"),
});

export const artifacts = sqliteTable("artifacts", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  version: integer("version").notNull().default(1),
  kind: text("kind").notNull().default("decision_pack"),
  // frozen case snapshot the pack was generated from
  snapshotJson: text("snapshot_json").notNull(),
  consistencyJson: text("consistency_json").notNull().default("{}"),
  // draft | ready_for_review | superseded
  status: text("status").notNull().default("draft"),
  releasedBy: text("released_by"),
  releasedAt: text("released_at"),
  createdAt: ts("created_at"),
});

export const proposals = sqliteTable("proposals", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  // evidence_synthesiser | strategy_facilitator | recommendation_challenger | asset_composer | claim_extractor
  skill: text("skill").notNull(),
  targetType: text("target_type").notNull().default(""),
  targetId: integer("target_id"),
  payloadJson: text("payload_json").notNull(),
  provider: text("provider").notNull(), // openai | fixture
  // proposed | accepted | rejected
  status: text("status").notNull().default("proposed"),
  decidedBy: text("decided_by"),
  decidedAt: text("decided_at"),
  createdAt: ts("created_at"),
});

export const auditEvents = sqliteTable("audit_events", {
  id: id(),
  engagementId: integer("engagement_id").notNull(),
  actor: text("actor").notNull(),
  // human | ai | system
  actorType: text("actor_type").notNull(),
  action: text("action").notNull(),
  objectType: text("object_type").notNull().default(""),
  objectId: integer("object_id"),
  detailJson: text("detail_json").notNull().default("{}"),
  createdAt: ts("created_at"),
});
