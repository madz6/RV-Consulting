import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  engagements, charters, contextProfiles, researchQuestions, sources, claims,
  claimRelations, assumptions, syntheses, strategies, strategyLinks, modelSpecs,
  modelRuns, recommendations, reviewDecisions, artifacts, proposals, auditEvents,
} from "@/db/schema";
import * as pack from "../../fixtures/case-pack/manifest";

const packDir = path.join(process.cwd(), "fixtures", "case-pack");

export async function seedDatabase() {
  // Full reset — the demonstrator is single-engagement.
  for (const t of [auditEvents, proposals, artifacts, reviewDecisions, recommendations,
    modelRuns, modelSpecs, strategyLinks, strategies, syntheses, assumptions,
    claimRelations, claims, sources, researchQuestions, contextProfiles, charters, engagements]) {
    await db.delete(t);
  }
  // Reset autoincrement counters so the demo engagement is always #1.
  try {
    await db.run(sql`DELETE FROM sqlite_sequence`);
  } catch {
    // sqlite_sequence only exists once an AUTOINCREMENT insert has happened
  }

  const [eng] = await db.insert(engagements).values({
    name: pack.engagement.name,
    clientName: pack.engagement.clientName,
    jurisdiction: pack.engagement.jurisdiction,
    audience: pack.engagement.audience,
  }).returning();
  const engagementId = eng.id;

  const audit = (actor: string, actorType: string, action: string, objectType = "", objectId: number | null = null, detail: object = {}) =>
    db.insert(auditEvents).values({ engagementId, actor, actorType, action, objectType, objectId, detailJson: JSON.stringify(detail) });

  await audit("seed-script", "system", "engagement_created", "engagement", engagementId, { synthetic: true });

  // Charter and context profile arrive as DRAFTS (system-proposed from the brief);
  // the human framing gate approves them in the UI.
  const [charter] = await db.insert(charters).values({
    engagementId,
    decision: pack.charter.decision,
    objective: pack.charter.objective,
    scope: pack.charter.scope,
    exclusions: pack.charter.exclusions,
    timeHorizon: pack.charter.timeHorizon,
    constraintsJson: JSON.stringify(pack.charter.constraints),
    successMeasuresJson: JSON.stringify(pack.charter.successMeasures),
    riskTolerance: pack.charter.riskTolerance,
    owner: pack.charter.owner,
    status: "draft",
  }).returning();
  await audit("brief-interpreter", "ai", "charter_drafted", "charter", charter.id, { from: "SRC-01" });

  await db.insert(contextProfiles).values({
    engagementId,
    fieldsJson: JSON.stringify(pack.contextProfile),
    status: "draft",
  });

  const rqIdByCode = new Map<string, number>();
  for (const rq of pack.researchQuestions) {
    const [row] = await db.insert(researchQuestions).values({
      engagementId,
      code: rq.code,
      question: rq.question,
      decisionLink: rq.decisionLink,
      hypothesis: rq.hypothesis,
      domainsJson: JSON.stringify(rq.domains),
      sufficiencyRule: rq.sufficiencyRule,
      priority: rq.priority,
      status: "proposed",
    }).returning();
    rqIdByCode.set(rq.code, row.id);
  }
  await audit("research-planner", "ai", "research_questions_proposed", "research_question", null, { count: pack.researchQuestions.length });

  const srcIdByCode = new Map<string, number>();
  for (const s of pack.sources) {
    const content = fs.readFileSync(path.join(packDir, s.file), "utf-8");
    const [row] = await db.insert(sources).values({
      engagementId,
      code: s.code,
      title: s.title,
      kind: s.kind,
      origin: s.origin,
      url: s.url,
      publisher: s.publisher,
      publishedDate: s.publishedDate,
      retrievedAt: s.retrievedAt,
      searchQuery: s.searchQuery,
      confidentiality: s.confidentiality,
      sourceClass: s.sourceClass,
      status: s.status,
      quarantineReason: s.quarantineReason,
      seededIssue: s.seededIssue,
      content,
    }).returning();
    srcIdByCode.set(s.code, row.id);
    if (s.status === "quarantined") {
      await audit("policy-service", "system", "source_quarantined", "source", row.id, { reason: s.quarantineReason });
    }
  }
  await audit("seed-script", "system", "case_pack_ingested", "source", null, { count: pack.sources.length });

  const claimIdByCode = new Map<string, number>();
  for (const c of pack.claims) {
    const [row] = await db.insert(claims).values({
      engagementId,
      code: c.code,
      sourceId: srcIdByCode.get(c.sourceCode)!,
      researchQuestionId: rqIdByCode.get(c.rqCode)!,
      proposition: c.proposition,
      excerpt: c.excerpt,
      location: c.location,
      contentType: c.contentType,
      dateOfInfo: c.dateOfInfo,
      scope: c.scope,
      reliabilityNote: c.reliabilityNote,
      applicabilityNote: c.applicabilityNote,
      state: "extracted",
      createdBy: "ai",
    }).returning();
    claimIdByCode.set(c.code, row.id);
  }
  await audit("evidence-extractor", "ai", "claims_extracted", "claim", null, { count: pack.claims.length });

  for (const r of pack.claimRelations) {
    await db.insert(claimRelations).values({
      claimId: claimIdByCode.get(r.claim)!,
      relatedClaimId: claimIdByCode.get(r.related)!,
      relation: r.relation,
      note: r.note,
    });
  }

  for (const a of pack.assumptions) {
    await db.insert(assumptions).values({
      engagementId,
      code: a.code,
      name: a.name,
      description: a.rationale,
      owner: a.owner,
      value: a.value,
      low: a.low,
      high: a.high,
      unit: a.unit,
      rationale: a.rationale,
      basis: a.basis,
      linkedClaimId: a.linkedClaim ? claimIdByCode.get(a.linkedClaim) : null,
      status: "proposed",
    });
  }
  await audit("seed-script", "system", "assumptions_proposed", "assumption", null, { count: pack.assumptions.length });

  console.log(`Seeded engagement #${engagementId}: ${pack.sources.length} sources, ${pack.claims.length} claims, ${pack.researchQuestions.length} research questions, ${pack.assumptions.length} assumptions.`);
}

