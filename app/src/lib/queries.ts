import { asc, desc, eq } from "drizzle-orm";
import {
  db, engagements, charters, contextProfiles, researchQuestions, sources, claims,
  claimRelations, syntheses, assumptions, strategies, strategyLinks, modelSpecs,
  modelRuns, recommendations, reviewDecisions, artifacts, proposals, auditEvents,
} from "@/db";

export async function getEngagement() {
  const [eng] = await db.select().from(engagements).limit(1);
  return eng;
}

export async function getCaseState() {
  const eng = await getEngagement();
  if (!eng) return null;
  const engagementId = eng.id;
  const [
    charterRows, contextRows, rqs, srcs, clms, relations, synths, asms,
    strats, links, specs, runs, recs, reviews, arts, props, audit,
  ] = await Promise.all([
    db.select().from(charters).where(eq(charters.engagementId, engagementId)).orderBy(desc(charters.version)),
    db.select().from(contextProfiles).where(eq(contextProfiles.engagementId, engagementId)).orderBy(desc(contextProfiles.version)),
    db.select().from(researchQuestions).where(eq(researchQuestions.engagementId, engagementId)).orderBy(asc(researchQuestions.code)),
    db.select().from(sources).where(eq(sources.engagementId, engagementId)).orderBy(asc(sources.code)),
    db.select().from(claims).where(eq(claims.engagementId, engagementId)).orderBy(asc(claims.code)),
    db.select().from(claimRelations),
    db.select().from(syntheses).where(eq(syntheses.engagementId, engagementId)).orderBy(asc(syntheses.researchQuestionId)),
    db.select().from(assumptions).where(eq(assumptions.engagementId, engagementId)).orderBy(asc(assumptions.code)),
    db.select().from(strategies).where(eq(strategies.engagementId, engagementId)).orderBy(asc(strategies.id)),
    db.select().from(strategyLinks),
    db.select().from(modelSpecs).where(eq(modelSpecs.engagementId, engagementId)).orderBy(asc(modelSpecs.id)),
    db.select().from(modelRuns).where(eq(modelRuns.engagementId, engagementId)).orderBy(asc(modelRuns.id)),
    db.select().from(recommendations).where(eq(recommendations.engagementId, engagementId)).orderBy(desc(recommendations.version)),
    db.select().from(reviewDecisions).where(eq(reviewDecisions.engagementId, engagementId)).orderBy(desc(reviewDecisions.id)),
    db.select().from(artifacts).where(eq(artifacts.engagementId, engagementId)).orderBy(desc(artifacts.version)),
    db.select().from(proposals).where(eq(proposals.engagementId, engagementId)).orderBy(desc(proposals.id)),
    db.select().from(auditEvents).where(eq(auditEvents.engagementId, engagementId)).orderBy(desc(auditEvents.id)),
  ]);

  return {
    engagement: eng,
    charter: charterRows[0] ?? null,
    context: contextRows[0] ?? null,
    researchQuestions: rqs,
    sources: srcs,
    claims: clms,
    claimRelations: relations,
    syntheses: synths,
    assumptions: asms,
    strategies: strats,
    strategyLinks: links,
    modelSpecs: specs,
    modelRuns: runs,
    recommendation: recs[0] ?? null,
    reviewDecisions: reviews,
    artifacts: arts,
    proposals: props,
    auditEvents: audit,
  };
}

export type CaseState = NonNullable<Awaited<ReturnType<typeof getCaseState>>>;

// Workflow gate status derived from canonical state, not stored flags.
export function gateStatus(s: CaseState) {
  const framingApproved = s.charter?.status === "approved";
  const claimsReviewed = s.claims.filter((c) => c.state !== "extracted").length;
  const synthesesApproved = s.syntheses.filter((x) => x.status === "approved").length;
  const evidenceReviewed = synthesesApproved >= s.researchQuestions.length && s.researchQuestions.length > 0;
  const humanStrategy = s.strategies.some((x) => x.authorship === "human");
  const aiBranch = s.strategies.some((x) => x.authorship === "ai_assisted");
  const strategySelected = s.strategies.some((x) => x.status === "selected");
  const modelValidated = s.modelSpecs.some((m) => m.status === "validated");
  const recommendationOwned = s.recommendation?.status === "owned";
  const packReady = s.artifacts.some((a) => a.status === "ready_for_review");
  return {
    framingApproved,
    claimsReviewed,
    evidenceReviewed,
    humanStrategy,
    aiBranch,
    strategySelected,
    modelValidated,
    recommendationOwned,
    packReady,
  };
}
