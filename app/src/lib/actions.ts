"use server";

// All canonical state transitions. Human gate actions are recorded as review
// decisions plus audit events; AI skills only ever create proposal rows here,
// and separate human accept-actions apply them to canonical state.

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import {
  db, charters, contextProfiles, researchQuestions, claims, syntheses,
  assumptions, strategies, strategyLinks, modelSpecs, modelRuns, recommendations,
  reviewDecisions, artifacts, proposals, auditEvents,
} from "@/db";
import { runSkill } from "@/lib/ai/provider";
import type { SkillName } from "@/lib/ai/schemas";
import { StrategyBranchProposal, StrategyChallengeProposal, CounterCaseProposal, SynthesisBatch, AssetNarrativeProposal } from "@/lib/ai/schemas";
import { runModel, sensitivity, switchingValue, ENGINE_VERSION, type ModelInputs, type BehaviouralAssumptions, type StrategyTransform } from "@/lib/model/engine";
import { OBSERVED, SENSITIVITY_RANGES } from "@/lib/model/inputs";
import { composeSnapshot, checkConsistency } from "@/lib/artifacts/composer";
import { getCaseState } from "@/lib/queries";

const DEMO_ENGAGEMENT_ID = 1;

async function audit(actor: string, actorType: "human" | "ai" | "system", action: string, objectType = "", objectId: number | null = null, detail: object = {}) {
  await db.insert(auditEvents).values({ engagementId: DEMO_ENGAGEMENT_ID, actor, actorType, action, objectType, objectId, detailJson: JSON.stringify(detail) });
}

async function recordReview(objectType: string, objectId: number, actor: string, role: string, action: string, note = "") {
  await db.insert(reviewDecisions).values({ engagementId: DEMO_ENGAGEMENT_ID, objectType, objectId, actor, role, action, note });
}

function done() {
  revalidatePath("/", "layout");
}

// ---- Gate 1: framing --------------------------------------------------------

export async function updateCharter(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const id = Number(form.get("charterId"));
  await db.update(charters).set({
    decision: String(form.get("decision")),
    objective: String(form.get("objective")),
    scope: String(form.get("scope")),
  }).where(and(eq(charters.id, id), eq(charters.status, "draft")));
  await audit(actor, "human", "charter_edited", "charter", id);
  done();
}

export async function approveFraming(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const state = await getCaseState();
  if (!state?.charter || state.charter.status !== "draft") return;
  await db.update(charters).set({ status: "approved", approvedBy: actor, approvedAt: new Date().toISOString() }).where(eq(charters.id, state.charter.id));
  if (state.context) await db.update(contextProfiles).set({ status: "approved" }).where(eq(contextProfiles.id, state.context.id));
  await db.update(researchQuestions).set({ status: "approved", reviewer: actor }).where(and(eq(researchQuestions.engagementId, DEMO_ENGAGEMENT_ID), eq(researchQuestions.status, "proposed")));
  await recordReview("charter", state.charter.id, actor, "engagement lead", "approve", "Framing gate: charter, context and research direction approved.");
  await audit(actor, "human", "framing_gate_approved", "charter", state.charter.id);
  done();
}

// ---- Evidence review --------------------------------------------------------

export async function reviewClaim(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const claimId = Number(form.get("claimId"));
  const action = String(form.get("action")); // approve | qualify | reject
  const note = String(form.get("note") ?? "");
  const state = action === "approve" ? "approved" : action === "qualify" ? "qualified" : "rejected";
  await db.update(claims).set({ state, reviewer: actor, reviewNote: note }).where(eq(claims.id, claimId));
  await recordReview("claim", claimId, actor, "evidence reviewer", action, note);
  await audit(actor, "human", `claim_${action}`, "claim", claimId, { note });
  done();
}

export async function reviewAllRemainingClaims(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const state = await getCaseState();
  if (!state) return;
  for (const c of state.claims.filter((c) => c.state === "extracted")) {
    // Client assertions are qualified (labelled, not verified) rather than approved wholesale.
    const to = c.contentType === "client_assertion" ? "qualified" : "approved";
    await db.update(claims).set({ state: to, reviewer: actor, reviewNote: to === "qualified" ? "Client assertion: retained as labelled assertion, not verified fact." : "Bulk-reviewed for demo." }).where(eq(claims.id, c.id));
    await recordReview("claim", c.id, actor, "evidence reviewer", to === "qualified" ? "qualify" : "approve", "Bulk review");
  }
  await audit(actor, "human", "claims_bulk_reviewed");
  done();
}

// ---- AI proposals (generic plumbing) ---------------------------------------

async function createProposal(skill: SkillName, context: string, targetType = "", targetId: number | null = null) {
  const { provider, output } = await runSkill(skill, context);
  const [row] = await db.insert(proposals).values({
    engagementId: DEMO_ENGAGEMENT_ID,
    skill,
    targetType,
    targetId,
    payloadJson: JSON.stringify(output),
    provider,
  }).returning();
  await audit(`skill:${skill}`, "ai", "proposal_created", "proposal", row.id, { provider });
  return row;
}

export async function rejectProposal(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const id = Number(form.get("proposalId"));
  await db.update(proposals).set({ status: "rejected", decidedBy: actor, decidedAt: new Date().toISOString() }).where(eq(proposals.id, id));
  await recordReview("proposal", id, actor, "reviewer", "reject", String(form.get("note") ?? ""));
  await audit(actor, "human", "proposal_rejected", "proposal", id);
  done();
}

// ---- Evidence synthesis -----------------------------------------------------

export async function proposeSyntheses() {
  const state = await getCaseState();
  if (!state) return;
  const reviewed = state.claims.filter((c) => c.state !== "rejected");
  const context = JSON.stringify({
    researchQuestions: state.researchQuestions.map((q) => ({ code: q.code, question: q.question, hypothesis: q.hypothesis })),
    claims: reviewed.map((c) => ({ code: c.code, rq: state.researchQuestions.find((q) => q.id === c.researchQuestionId)?.code, proposition: c.proposition, contentType: c.contentType, reliability: c.reliabilityNote, applicability: c.applicabilityNote, state: c.state })),
    relations: state.claimRelations.map((r) => ({ claim: state.claims.find((c) => c.id === r.claimId)?.code, related: state.claims.find((c) => c.id === r.relatedClaimId)?.code, relation: r.relation })),
    note: "Quarantined sources are excluded from this context by policy.",
  });
  await createProposal("evidence_synthesiser", context);
  done();
}

export async function acceptSyntheses(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const proposalId = Number(form.get("proposalId"));
  const [prop] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
  if (!prop || prop.status !== "proposed") return;
  const batch = SynthesisBatch.parse(JSON.parse(prop.payloadJson));
  const state = await getCaseState();
  if (!state) return;
  for (const s of batch.syntheses) {
    const rq = state.researchQuestions.find((q) => q.code === s.researchQuestionCode);
    if (!rq) continue;
    await db.insert(syntheses).values({
      engagementId: DEMO_ENGAGEMENT_ID,
      researchQuestionId: rq.id,
      supportingSummary: s.supportingSummary,
      contrarySummary: s.contrarySummary,
      limitations: s.limitations,
      gaps: s.gaps,
      status: "approved",
      createdBy: "ai",
      reviewer: actor,
    });
  }
  await db.update(proposals).set({ status: "accepted", decidedBy: actor, decidedAt: new Date().toISOString() }).where(eq(proposals.id, proposalId));
  await recordReview("proposal", proposalId, actor, "research lead", "approve", "Evidence syntheses accepted after review.");
  await audit(actor, "human", "syntheses_accepted", "proposal", proposalId);
  done();
}

export async function concludeQuestion(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const rqId = Number(form.get("rqId"));
  const conclusion = String(form.get("conclusion"));
  const status = String(form.get("status")); // sufficient | conditionally_sufficient | insufficient
  await db.update(researchQuestions).set({ humanConclusion: conclusion, status, reviewer: actor }).where(eq(researchQuestions.id, rqId));
  await recordReview("research_question", rqId, actor, "research lead", "conclude", `${status}: ${conclusion}`);
  await audit(actor, "human", "question_concluded", "research_question", rqId, { status });
  done();
}

// ---- Strategy Studio --------------------------------------------------------

export async function createStrategy(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const state = await getCaseState();
  const code = `STRAT-0${(state?.strategies.length ?? 0) + 1}`;
  const design = {
    targetSegments: String(form.get("targetSegments") ?? ""),
    offerAndPackage: String(form.get("offerAndPackage") ?? ""),
    priceMetric: String(form.get("priceMetric") ?? ""),
    pricingModel: String(form.get("pricingModel") ?? ""),
    priceArchitecture: String(form.get("priceArchitecture") ?? ""),
    migration: String(form.get("migration") ?? ""),
  };
  const [row] = await db.insert(strategies).values({
    engagementId: DEMO_ENGAGEMENT_ID,
    code,
    title: String(form.get("title")),
    thesis: String(form.get("thesis")),
    authorship: "human",
    originNote: `Human-authored by ${actor}`,
    designJson: JSON.stringify(design),
    causalChain: String(form.get("causalChain") ?? ""),
    requiredConditions: String(form.get("requiredConditions") ?? ""),
    failureModes: String(form.get("failureModes") ?? ""),
    smallestTest: String(form.get("smallestTest") ?? ""),
    createdBy: actor,
  }).returning();
  // Human-selected evidence links (comma-separated claim codes)
  const link = async (codes: string, kind: string) => {
    for (const codeStr of codes.split(",").map((x) => x.trim()).filter(Boolean)) {
      const claim = state?.claims.find((c) => c.code === codeStr);
      if (claim) await db.insert(strategyLinks).values({ strategyId: row.id, claimId: claim.id, kind, note: "Linked by author" });
    }
  };
  await link(String(form.get("supportingCodes") ?? ""), "supporting");
  await link(String(form.get("contraryCodes") ?? ""), "contrary");
  await audit(actor, "human", "strategy_created", "strategy", row.id, { code });
  done();
}

export async function requestBranch(form: FormData) {
  const strategyId = Number(form.get("strategyId"));
  const state = await getCaseState();
  const strat = state?.strategies.find((x) => x.id === strategyId);
  if (!state || !strat) return;
  const approvedClaims = state.claims.filter((c) => c.state === "approved" || c.state === "qualified");
  const context = JSON.stringify({
    humanStrategy: { title: strat.title, thesis: strat.thesis, design: JSON.parse(strat.designJson) },
    approvedEvidence: approvedClaims.map((c) => ({ code: c.code, proposition: c.proposition, contentType: c.contentType, applicability: c.applicabilityNote })),
    approvedAssumptions: state.assumptions.map((a) => ({ code: a.code, name: a.name, value: a.value, range: [a.low, a.high], basis: a.basis })),
    charterConstraints: state.charter ? JSON.parse(state.charter.constraintsJson) : [],
  });
  await createProposal("strategy_branch", context, "strategy", strategyId);
  done();
}

export async function acceptBranch(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const proposalId = Number(form.get("proposalId"));
  const [prop] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
  if (!prop || prop.status !== "proposed") return;
  const branch = StrategyBranchProposal.parse(JSON.parse(prop.payloadJson));
  const state = await getCaseState();
  const code = `STRAT-0${(state?.strategies.length ?? 0) + 1}`;
  const [row] = await db.insert(strategies).values({
    engagementId: DEMO_ENGAGEMENT_ID,
    code,
    parentStrategyId: prop.targetId,
    title: branch.title,
    thesis: branch.thesis,
    authorship: "ai_assisted",
    originNote: `AI-proposed branch (provider: ${prop.provider}); adopted by ${actor}`,
    designJson: JSON.stringify(branch.design),
    causalChain: branch.causalChain,
    requiredConditions: branch.requiredConditions,
    failureModes: branch.failureModes,
    smallestTest: branch.smallestTest,
    createdBy: `skill:strategy_branch → ${actor}`,
  }).returning();
  for (const ev of branch.evidenceUsed) {
    const claim = state?.claims.find((c) => c.code === ev.claimCode);
    if (claim) await db.insert(strategyLinks).values({ strategyId: row.id, claimId: claim.id, kind: "supporting", note: ev.how });
  }
  for (const ev of branch.contraryEvidence) {
    const claim = state?.claims.find((c) => c.code === ev.claimCode);
    if (claim) await db.insert(strategyLinks).values({ strategyId: row.id, claimId: claim.id, kind: "contrary", note: ev.why });
  }
  for (const gap of branch.evidenceGaps) {
    await db.insert(strategyLinks).values({ strategyId: row.id, kind: "gap", note: gap });
  }
  await db.update(proposals).set({ status: "accepted", decidedBy: actor, decidedAt: new Date().toISOString() }).where(eq(proposals.id, proposalId));
  await recordReview("proposal", proposalId, actor, "strategy author", "approve", "AI branch adopted into Strategy Studio.");
  await audit(actor, "human", "branch_adopted", "strategy", row.id, { proposalId });
  done();
}

export async function requestChallenge(form: FormData) {
  const strategyId = Number(form.get("strategyId"));
  const state = await getCaseState();
  const strat = state?.strategies.find((x) => x.id === strategyId);
  if (!state || !strat) return;
  const context = JSON.stringify({
    strategy: { title: strat.title, thesis: strat.thesis, design: JSON.parse(strat.designJson) },
    evidence: state.claims.filter((c) => c.state !== "rejected").map((c) => ({ code: c.code, proposition: c.proposition })),
    constraints: state.charter ? JSON.parse(state.charter.constraintsJson) : [],
  });
  await createProposal("strategy_challenge", context, "strategy", strategyId);
  done();
}

export async function acceptChallenge(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const proposalId = Number(form.get("proposalId"));
  const [prop] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
  if (!prop || prop.status !== "proposed" || !prop.targetId) return;
  const challenge = StrategyChallengeProposal.parse(JSON.parse(prop.payloadJson));
  await db.update(strategies).set({ challengeJson: JSON.stringify(challenge) }).where(eq(strategies.id, prop.targetId));
  await db.update(proposals).set({ status: "accepted", decidedBy: actor, decidedAt: new Date().toISOString() }).where(eq(proposals.id, proposalId));
  await recordReview("proposal", proposalId, actor, "strategy author", "approve", "Challenge recorded against strategy.");
  await audit(actor, "human", "challenge_recorded", "strategy", prop.targetId, { proposalId });
  done();
}

// ---- Gate 2: strategy selection ---------------------------------------------

export async function selectStrategy(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const strategyId = Number(form.get("strategyId"));
  const rationale = String(form.get("rationale") ?? "");
  const state = await getCaseState();
  if (!state) return;
  for (const s of state.strategies) {
    if (s.id === strategyId) {
      await db.update(strategies).set({ status: "selected" }).where(eq(strategies.id, s.id));
    } else if (s.status !== "rejected") {
      await db.update(strategies).set({ status: "rejected", rejectionReason: `Not selected at shortlist gate: ${rationale}` }).where(eq(strategies.id, s.id));
    }
  }
  await recordReview("strategy", strategyId, actor, "engagement lead", "select", rationale);
  await audit(actor, "human", "strategy_selected", "strategy", strategyId, { rationale });
  done();
}

// ---- Assumptions and model --------------------------------------------------

export async function approveAssumptions(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const state = await getCaseState();
  if (!state) return;
  for (const a of state.assumptions.filter((a) => a.status === "proposed")) {
    await db.update(assumptions).set({ status: "approved" }).where(eq(assumptions.id, a.id));
    await recordReview("assumption", a.id, actor, "model owner", "approve", "Assumption approved with stated range.");
  }
  await audit(actor, "human", "assumptions_approved");
  done();
}

export async function updateAssumption(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const id = Number(form.get("assumptionId"));
  const value = Number(form.get("value"));
  const rationale = String(form.get("rationale") ?? "");
  const state = await getCaseState();
  const a = state?.assumptions.find((x) => x.id === id);
  if (!a || Number.isNaN(value)) return;
  if (a.low !== null && a.high !== null && (value < a.low || value > a.high)) {
    // Out-of-range values are a deliberate hard stop: widen the range explicitly instead.
    await audit(actor, "human", "assumption_change_rejected_out_of_range", "assumption", id, { attempted: value, low: a.low, high: a.high });
    done();
    return;
  }
  await db.update(assumptions).set({ value, rationale: rationale || a.rationale }).where(eq(assumptions.id, id));
  await recordReview("assumption", id, actor, "model owner", "approve", `Value changed ${a.value} → ${value}. ${rationale}`);
  await audit(actor, "human", "assumption_changed", "assumption", id, { from: a.value, to: value, rationale });
  done();
}

function assumptionsToBehavioural(rows: { code: string; value: number }[]): BehaviouralAssumptions {
  const v = (code: string) => rows.find((r) => r.code === code)?.value ?? 0;
  return {
    adoptionY1: { enterprise: v("ASM-01"), midmarket: v("ASM-02") },
    downtimeReduction: v("ASM-03"),
    retention: v("ASM-04"),
    adoptionGrowthY2Y3: v("ASM-05"),
  };
}

function assumptionsAt(rows: { code: string; value: number; low: number | null; high: number | null }[], bound: "low" | "high" | "value"): BehaviouralAssumptions {
  return assumptionsToBehavioural(rows.map((r) => ({ code: r.code, value: bound === "value" ? r.value : (r[bound] ?? r.value) })));
}

export async function createModelSpecAction(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const strategyId = Number(form.get("strategyId"));
  const modelType = String(form.get("modelType")) as StrategyTransform["model"];
  let transform: StrategyTransform;
  const num = (k: string, d: number) => { const n = Number(form.get(k)); return Number.isNaN(n) || form.get(k) === null || form.get(k) === "" ? d : n; };
  switch (modelType) {
    case "per_machine":
      transform = { model: "per_machine", pricePerMachineMonth: { enterprise: num("priceEnterprise", 45), midmarket: num("priceMidmarket", 39) } };
      break;
    case "bundle_uplift":
      transform = { model: "bundle_uplift", upliftPctOfEquipmentPricePerYear: num("upliftPct", 0.04), coverageYears: num("coverageYears", 5) };
      break;
    case "outcome_linked":
      transform = {
        model: "outcome_linked",
        basePerSiteMonth: { enterprise: num("baseEnterprise", 1200), midmarket: num("baseMidmarket", 450) },
        outcomeSharePct: num("outcomeShare", 0.1),
        capPerMachineYear: num("cap", 2000),
        floorPerMachineYear: num("floor", 0),
        segmentsIncluded: String(form.get("segmentsIncluded") ?? "enterprise").split(",").map((s) => s.trim()) as ("enterprise" | "midmarket")[],
      };
      break;
    default:
      transform = { model: "site_subscription", pricePerSiteMonth: { enterprise: num("priceEnterprise", 2400), midmarket: num("priceMidmarket", 450) } };
  }
  const [spec] = await db.insert(modelSpecs).values({
    engagementId: DEMO_ENGAGEMENT_ID,
    strategyId,
    name: String(form.get("name") ?? `Model for strategy ${strategyId}`),
    specJson: JSON.stringify(transform),
  }).returning();
  await audit(actor, "human", "model_spec_created", "model_spec", spec.id, { modelType });
  await runScenariosForSpec(spec.id, actor);
  done();
}

async function runScenariosForSpec(modelSpecId: number, actor: string) {
  const state = await getCaseState();
  const spec = state?.modelSpecs.find((m) => m.id === modelSpecId);
  if (!state || !spec) return;
  const approved = state.assumptions.filter((a) => a.status === "approved");
  if (approved.length < 5) throw new Error("All behavioural assumptions must be approved before running the model.");
  const transform = JSON.parse(spec.specJson) as StrategyTransform;

  // supersede prior runs for this spec
  await db.update(modelRuns).set({ status: "superseded" }).where(and(eq(modelRuns.modelSpecId, modelSpecId), eq(modelRuns.status, "current")));

  const scenarios: { name: string; assumptions: BehaviouralAssumptions }[] = [
    { name: "base", assumptions: assumptionsAt(approved, "value") },
    { name: "downside", assumptions: assumptionsAt(approved, "low") },
    { name: "upside", assumptions: assumptionsAt(approved, "high") },
  ];
  const prior = state.modelRuns.filter((r) => r.modelSpecId === modelSpecId);
  const version = (prior.length ? Math.max(...prior.map((r) => r.version)) : 0) + 1;

  for (const sc of scenarios) {
    const inputs: ModelInputs = { observed: OBSERVED, assumptions: sc.assumptions, strategy: transform };
    const result = runModel(inputs);
    await db.insert(modelRuns).values({
      engagementId: DEMO_ENGAGEMENT_ID,
      modelSpecId,
      scenario: sc.name,
      version,
      inputsJson: JSON.stringify(inputs),
      outputsJson: JSON.stringify(result.outputs),
      inputHash: result.inputHash,
      engineVersion: result.engineVersion,
    });
  }

  // Sensitivity + switching value stored as a fourth "analysis" run
  const baseInputs: ModelInputs = { observed: OBSERVED, assumptions: assumptionsAt(approved, "value"), strategy: transform };
  const sens = sensitivity(baseInputs, SENSITIVITY_RANGES);
  const sw = switchingValue(baseInputs, "adoptionY1.enterprise", 0.05, 0.7, (r) => {
    const m = r.byId["breakeven-months"].value;
    return m !== -1 && m <= 18;
  });
  await db.insert(modelRuns).values({
    engagementId: DEMO_ENGAGEMENT_ID,
    modelSpecId,
    scenario: "sensitivity",
    version,
    inputsJson: JSON.stringify(baseInputs),
    outputsJson: JSON.stringify({ sensitivity: sens, switchingValue: { key: "adoptionY1.enterprise", predicate: "break-even within 18 months (EV-10)", value: sw } }),
    inputHash: runModel(baseInputs).inputHash,
    engineVersion: ENGINE_VERSION,
  });
  await audit("modelling-service", "system", "scenarios_run", "model_spec", modelSpecId, { version, actor });
}

export async function rerunScenarios(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  await runScenariosForSpec(Number(form.get("modelSpecId")), actor);
  done();
}

export async function validateModel(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo reviewer");
  const id = Number(form.get("modelSpecId"));
  await db.update(modelSpecs).set({ status: "validated", validatedBy: actor, validatedAt: new Date().toISOString() }).where(eq(modelSpecs.id, id));
  await recordReview("model_spec", id, actor, "model owner", "validate", "Deterministic scenarios validated: reproduction, direction and boundary behaviour checked.");
  await audit(actor, "human", "model_validated", "model_spec", id);
  done();
}

// ---- Recommendation ---------------------------------------------------------

export async function saveRecommendation(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const state = await getCaseState();
  const values = {
    engagementId: DEMO_ENGAGEMENT_ID,
    decision: String(form.get("decision")),
    rationale: String(form.get("rationale") ?? ""),
    conditions: String(form.get("conditions") ?? ""),
    risks: String(form.get("risks") ?? ""),
    rejectedAlternatives: String(form.get("rejectedAlternatives") ?? ""),
    status: "draft",
  };
  if (state?.recommendation) {
    await db.update(recommendations).set(values).where(eq(recommendations.id, state.recommendation.id));
    await audit(actor, "human", "recommendation_edited", "recommendation", state.recommendation.id);
  } else {
    const [row] = await db.insert(recommendations).values(values).returning();
    await audit(actor, "human", "recommendation_drafted", "recommendation", row.id);
  }
  done();
}

export async function requestCounterCase() {
  const state = await getCaseState();
  if (!state?.recommendation) return;
  const selected = state.strategies.find((s) => s.status === "selected");
  const context = JSON.stringify({
    recommendation: { decision: state.recommendation.decision, rationale: state.recommendation.rationale },
    selectedStrategy: selected ? { title: selected.title, thesis: selected.thesis } : null,
    evidence: state.claims.filter((c) => c.state !== "rejected").map((c) => ({ code: c.code, proposition: c.proposition })),
  });
  await createProposal("recommendation_challenger", context, "recommendation", state.recommendation.id);
  done();
}

export async function acceptCounterCase(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const proposalId = Number(form.get("proposalId"));
  const [prop] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
  if (!prop || prop.status !== "proposed" || !prop.targetId) return;
  const cc = CounterCaseProposal.parse(JSON.parse(prop.payloadJson));
  await db.update(recommendations).set({ counterCase: `${cc.strongestCounterCase}\n\nConditions that would reverse the recommendation:\n${cc.conditionsThatWouldReverse.map((c) => `• ${c}`).join("\n")}` }).where(eq(recommendations.id, prop.targetId));
  await db.update(proposals).set({ status: "accepted", decidedBy: actor, decidedAt: new Date().toISOString() }).where(eq(proposals.id, proposalId));
  await recordReview("proposal", proposalId, actor, "engagement lead", "approve", "Counter-case recorded with recommendation.");
  await audit(actor, "human", "counter_case_recorded", "recommendation", prop.targetId);
  done();
}

export async function ownRecommendation(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const state = await getCaseState();
  if (!state?.recommendation) return;
  if (!state.recommendation.counterCase) return; // challenge before ownership
  await db.update(recommendations).set({ status: "owned", owner: actor }).where(eq(recommendations.id, state.recommendation.id));
  await recordReview("recommendation", state.recommendation.id, actor, "engagement lead", "approve", "Recommendation owned after considering the counter-case.");
  await audit(actor, "human", "recommendation_owned", "recommendation", state.recommendation.id);
  done();
}

// ---- Decision package -------------------------------------------------------

export async function proposeNarrative() {
  const state = await getCaseState();
  if (!state?.recommendation) return;
  const selected = state.strategies.find((s) => s.status === "selected");
  const spec = state.modelSpecs.find((m) => m.status === "validated");
  const baseRun = state.modelRuns.find((r) => r.modelSpecId === spec?.id && r.scenario === "base" && r.status === "current");
  const outputs = baseRun ? (JSON.parse(baseRun.outputsJson) as { outputId: string; label: string; value: number; unit: string }[]) : [];
  const context = JSON.stringify({
    charter: state.charter ? { decision: state.charter.decision, objective: state.charter.objective } : null,
    approvedClaims: state.claims.filter((c) => c.state === "approved" || c.state === "qualified").map((c) => ({ code: c.code, proposition: c.proposition, contentType: c.contentType })),
    syntheses: state.syntheses.filter((s) => s.status === "approved").map((s) => ({ rq: state.researchQuestions.find((q) => q.id === s.researchQuestionId)?.code, supporting: s.supportingSummary, contrary: s.contrarySummary })),
    selectedStrategy: selected ? { title: selected.title, thesis: selected.thesis } : null,
    rejectedStrategies: state.strategies.filter((s) => s.status === "rejected").map((s) => ({ title: s.title, reason: s.rejectionReason })),
    recommendation: { decision: state.recommendation.decision, conditions: state.recommendation.conditions, counterCase: state.recommendation.counterCase },
    modelOutputIds: outputs.map((o) => ({ id: o.outputId, label: o.label, unit: o.unit })),
    rules: "Cite claims as [EV-xx]. Reference every number as {{output-id}} from modelOutputIds. Never write a numeral for a modelled quantity.",
  });
  await createProposal("asset_composer", context);
  done();
}

export async function generatePack(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo author");
  const proposalId = Number(form.get("proposalId"));
  const [prop] = await db.select().from(proposals).where(eq(proposals.id, proposalId));
  if (!prop || prop.status !== "proposed") return;
  const narrative = AssetNarrativeProposal.parse(JSON.parse(prop.payloadJson));
  const state = await getCaseState();
  if (!state) return;
  const snapshot = composeSnapshot(state, narrative);
  const consistency = checkConsistency(snapshot);
  const version = (state.artifacts.length ? Math.max(...state.artifacts.map((a) => a.version)) : 0) + 1;
  await db.update(artifacts).set({ status: "superseded" }).where(and(eq(artifacts.engagementId, DEMO_ENGAGEMENT_ID), eq(artifacts.status, "draft")));
  const [row] = await db.insert(artifacts).values({
    engagementId: DEMO_ENGAGEMENT_ID,
    version,
    snapshotJson: JSON.stringify(snapshot),
    consistencyJson: JSON.stringify(consistency),
    status: "draft",
  }).returning();
  await db.update(proposals).set({ status: "accepted", decidedBy: actor, decidedAt: new Date().toISOString() }).where(eq(proposals.id, proposalId));
  await recordReview("proposal", proposalId, actor, "consultant", "approve", "Narrative accepted; pack generated from frozen snapshot.");
  await audit(actor, "human", "pack_generated", "artifact", row.id, { version, consistencyPassed: consistency.passed });
  done();
}

export async function releasePack(form: FormData) {
  const actor = String(form.get("actor") ?? "Demo reviewer");
  const artifactId = Number(form.get("artifactId"));
  const state = await getCaseState();
  const art = state?.artifacts.find((a) => a.id === artifactId);
  if (!state || !art || art.status !== "draft") return;
  const consistency = JSON.parse(art.consistencyJson) as { passed: boolean };
  if (!consistency.passed) {
    await audit(actor, "human", "release_blocked_consistency", "artifact", artifactId);
    done();
    return;
  }
  if (!state.modelSpecs.some((m) => m.status === "validated") || state.recommendation?.status !== "owned") {
    await audit(actor, "human", "release_blocked_gates", "artifact", artifactId);
    done();
    return;
  }
  await db.update(artifacts).set({ status: "ready_for_review", releasedBy: actor, releasedAt: new Date().toISOString() }).where(eq(artifacts.id, artifactId));
  await recordReview("artifact", artifactId, actor, "reviewer", "release", "Decision pack released as ready for review (terminal demonstrator state — not client approved).");
  await audit(actor, "human", "pack_released", "artifact", artifactId);
  done();
}
