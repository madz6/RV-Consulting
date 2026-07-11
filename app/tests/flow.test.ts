/**
 * End-to-end demonstrator flow test (fixture AI mode, isolated test database).
 * Drives every gate through the real server actions and asserts the
 * non-negotiable D0 quality gates from MVP_VALIDATION.md §9:
 *  - seeded contradiction survives to the evidence gate and the pack
 *  - quarantined competition-sensitive source contributes nothing
 *  - deterministic model reproduces outputs
 *  - consistency checks pass and the pack ends "ready for review"
 *  - an approved assumption change propagates with zero inconsistencies
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const TEST_DIR = path.join(process.cwd(), "data-test");
process.env.PSW_DATA_DIR = TEST_DIR;
process.env.AI_MODE = "fixture";

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

/* eslint-disable @typescript-eslint/no-explicit-any */
let actions: typeof import("@/lib/actions");
let queries: typeof import("@/lib/queries");

function fd(entries: Record<string, string | number>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, String(v));
  return f;
}

beforeAll(async () => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  fs.mkdirSync(TEST_DIR, { recursive: true });
  execSync("npx drizzle-kit push --force", { env: { ...process.env }, stdio: "pipe" });
  const seed = await import("@/lib/seed");
  await seed.seedDatabase();
  actions = await import("@/lib/actions");
  queries = await import("@/lib/queries");
}, 120_000);

describe("D0 demonstrator loop", () => {
  it("runs the full governed flow to a ready-for-review pack", async () => {
    // Gate 1 — framing
    await actions.approveFraming(fd({ actor: "Demo Author" }));
    let s = (await queries.getCaseState())!;
    expect(s.charter!.status).toBe("approved");
    expect(s.researchQuestions.every((q) => q.status === "approved")).toBe(true);

    // Quarantine check: competition-sensitive source has no claims at all
    const quarantined = s.sources.find((x) => x.status === "quarantined")!;
    expect(quarantined).toBeTruthy();
    expect(s.claims.some((c) => c.sourceId === quarantined.id)).toBe(false);

    // Evidence review
    await actions.reviewAllRemainingClaims(fd({ actor: "Demo Author" }));
    s = (await queries.getCaseState())!;
    expect(s.claims.some((c) => c.state === "extracted")).toBe(false);
    // client assertions were qualified, not silently approved
    const ceoClaim = s.claims.find((c) => c.code === "EV-01")!;
    expect(ceoClaim.state).toBe("qualified");

    // Synthesis (AI proposal → human accept)
    await actions.proposeSyntheses();
    s = (await queries.getCaseState())!;
    const synthProp = s.proposals.find((p) => p.skill === "evidence_synthesiser" && p.status === "proposed")!;
    expect(synthProp.provider).toBe("fixture");
    await actions.acceptSyntheses(fd({ actor: "Demo Author", proposalId: synthProp.id }));
    s = (await queries.getCaseState())!;
    expect(s.syntheses.filter((x) => x.status === "approved").length).toBe(5);

    // Contradiction preserved: RQ-02 synthesis contains contrary summary citing EV-20 vs EV-11
    const rq2 = s.researchQuestions.find((q) => q.code === "RQ-02")!;
    const rq2syn = s.syntheses.find((x) => x.researchQuestionId === rq2.id)!;
    expect(rq2syn.contrarySummary).toMatch(/EV-20/);
    expect(rq2syn.contrarySummary.length).toBeGreaterThan(50);

    // Human conclusions per question
    for (const q of s.researchQuestions) {
      await actions.concludeQuestion(fd({
        actor: "Demo Author", rqId: q.id,
        conclusion: q.code === "RQ-02"
          ? "Outcome acceptance is segment-specific: enterprise only, with cap/floor/protocol. Contradiction retained, not resolved."
          : "Sufficient for strategy work within documented limits.",
        status: q.code === "RQ-01" ? "conditionally_sufficient" : "sufficient",
      }));
    }

    // Strategy Studio — human authors, AI branches and challenges
    await actions.createStrategy(fd({
      actor: "Demo Author",
      title: "Segmented site subscription",
      thesis: "Charge a flat monthly site fee set per segment. Both segments asked for site-level, predictable pricing; it keeps the sales motion simple and monetises the installed base immediately.",
      targetSegments: "enterprise, midmarket",
      priceMetric: "per connected site",
      pricingModel: "flat site subscription by segment",
      priceArchitecture: "£2,400/site/month enterprise; £450/site/month mid-market",
      migration: "installed base first, phased to service capacity",
      causalChain: "Predictable fee → easy budget approval → adoption across installed base → recurring service margin",
      failureModes: "Mispriced levels without WTP research; large sites under-monetised",
      smallestTest: "Ten site agreements signed across both segments in one quarter",
      supportingCodes: "EV-19, EV-21, EV-13",
      contraryCodes: "EV-22",
    }));
    s = (await queries.getCaseState())!;
    const human = s.strategies.find((x) => x.authorship === "human")!;
    expect(human).toBeTruthy();

    await actions.requestBranch(fd({ strategyId: human.id }));
    s = (await queries.getCaseState())!;
    const branchProp = s.proposals.find((p) => p.skill === "strategy_branch" && p.status === "proposed")!;
    await actions.acceptBranch(fd({ actor: "Demo Author", proposalId: branchProp.id }));
    s = (await queries.getCaseState())!;
    const branch = s.strategies.find((x) => x.authorship === "ai_assisted")!;
    expect(branch.parentStrategyId).toBe(human.id);
    // branch carries evidence links including contrary evidence
    const branchLinks = s.strategyLinks.filter((l) => l.strategyId === branch.id);
    expect(branchLinks.some((l) => l.kind === "contrary")).toBe(true);
    expect(branchLinks.some((l) => l.kind === "gap")).toBe(true);

    await actions.requestChallenge(fd({ strategyId: human.id }));
    s = (await queries.getCaseState())!;
    const chProp = s.proposals.find((p) => p.skill === "strategy_challenge" && p.status === "proposed")!;
    await actions.acceptChallenge(fd({ actor: "Demo Author", proposalId: chProp.id }));

    // Gate 2 — selection (human action; others go to rejection log)
    await actions.selectStrategy(fd({ actor: "Demo Author", strategyId: human.id, rationale: "Fits both segments' stated buying preferences and the 18-month cash constraint; outcome amendment retained as follow-on option." }));
    s = (await queries.getCaseState())!;
    expect(s.strategies.find((x) => x.id === human.id)!.status).toBe("selected");
    expect(s.strategies.find((x) => x.id === branch.id)!.status).toBe("rejected");
    expect(s.strategies.find((x) => x.id === branch.id)!.rejectionReason).toBeTruthy();

    // Assumptions and model
    await actions.approveAssumptions(fd({ actor: "Demo Author" }));
    await actions.createModelSpecAction(fd({
      actor: "Demo Author", strategyId: human.id, modelType: "site_subscription",
      name: "Segmented site subscription — scenario model", priceEnterprise: 2400, priceMidmarket: 450,
    }));
    s = (await queries.getCaseState())!;
    const spec = s.modelSpecs[0];
    const runs = s.modelRuns.filter((r) => r.modelSpecId === spec.id && r.status === "current");
    expect(runs.map((r) => r.scenario).sort()).toEqual(["base", "downside", "sensitivity", "upside"]);

    // Deterministic reproduction: re-run and compare base outputs + hash
    const baseBefore = runs.find((r) => r.scenario === "base")!;
    await actions.rerunScenarios(fd({ actor: "Demo Author", modelSpecId: spec.id }));
    s = (await queries.getCaseState())!;
    const baseAfter = s.modelRuns.find((r) => r.modelSpecId === spec.id && r.scenario === "base" && r.status === "current")!;
    expect(baseAfter.inputHash).toBe(baseBefore.inputHash);
    expect(baseAfter.outputsJson).toBe(baseBefore.outputsJson);
    expect(baseAfter.id).not.toBe(baseBefore.id); // new versioned run, old superseded

    // Gate 3a — model validation
    await actions.validateModel(fd({ actor: "Demo Reviewer", modelSpecId: spec.id }));

    // Recommendation + mandatory challenge before ownership
    await actions.saveRecommendation(fd({
      actor: "Demo Author",
      decision: "Launch PulseGuard on a segmented site subscription (£2,400/site/month enterprise; £450/site/month mid-market), phased to service capacity, holding the enterprise outcome amendment for pilot-account renewals.",
      rationale: "Matches both segments' buying behaviour, keeps the price sheet simple, and meets the 18-month contribution constraint in the base case.",
      conditions: "Willingness-to-pay validation and a second mid-market interview before board price-lock; phased onboarding plan agreed with Operations.",
      risks: "Pilot performance may not generalise; mid-market value evidence unmeasured; adoption below switching value breaches cash constraint.",
      rejectedAlternatives: "Bundle (kills commission line, hides margin); pure per-machine (enterprise rejects idle-machine fees); outcome-linked everywhere (mid-market refuses).",
    }));
    // ownership must be blocked before a counter-case exists
    await actions.ownRecommendation(fd({ actor: "Demo Author" }));
    s = (await queries.getCaseState())!;
    expect(s.recommendation!.status).toBe("draft");

    await actions.requestCounterCase();
    s = (await queries.getCaseState())!;
    const ccProp = s.proposals.find((p) => p.skill === "recommendation_challenger" && p.status === "proposed")!;
    await actions.acceptCounterCase(fd({ actor: "Demo Author", proposalId: ccProp.id }));
    await actions.ownRecommendation(fd({ actor: "Demo Author" }));
    s = (await queries.getCaseState())!;
    expect(s.recommendation!.status).toBe("owned");
    expect(s.recommendation!.owner).toBe("Demo Author");

    // Decision pack
    await actions.proposeNarrative();
    s = (await queries.getCaseState())!;
    const narrProp = s.proposals.find((p) => p.skill === "asset_composer" && p.status === "proposed")!;
    await actions.generatePack(fd({ actor: "Demo Author", proposalId: narrProp.id }));
    s = (await queries.getCaseState())!;
    const pack1 = s.artifacts.find((a) => a.status === "draft")!;
    const consistency = JSON.parse(pack1.consistencyJson);
    expect(consistency.passed, JSON.stringify(consistency.checks, null, 2)).toBe(true);

    // Release gate
    await actions.releasePack(fd({ actor: "Demo Reviewer", artifactId: pack1.id }));
    s = (await queries.getCaseState())!;
    expect(s.artifacts.find((a) => a.id === pack1.id)!.status).toBe("ready_for_review");

    // Pack snapshot preserves contradiction and quarantine visibility
    const snap = JSON.parse(pack1.snapshotJson);
    expect(JSON.stringify(snap.syntheses)).toMatch(/contradict/i);
    expect(snap.sources.some((x: any) => x.status === "quarantined")).toBe(true);
    expect(snap.claims.some((x: any) => x.sourceCode === "SRC-13")).toBe(false);
  }, 60_000);

  it("propagates an approved assumption change into a new consistent pack version", async () => {
    let s = (await queries.getCaseState())!;
    const asm = s.assumptions.find((a) => a.code === "ASM-01")!; // enterprise adoption 0.5 → 0.6
    const spec = s.modelSpecs[0];
    const baseBefore = s.modelRuns.find((r) => r.modelSpecId === spec.id && r.scenario === "base" && r.status === "current")!;

    // out-of-range change is rejected
    await actions.updateAssumption(fd({ actor: "Demo Author", assumptionId: asm.id, value: 0.95, rationale: "should fail" }));
    s = (await queries.getCaseState())!;
    expect(s.assumptions.find((a) => a.id === asm.id)!.value).toBe(0.5);

    // in-range change is applied and audited
    await actions.updateAssumption(fd({ actor: "Demo Author", assumptionId: asm.id, value: 0.6, rationale: "Pilot-account goodwill stronger than planned; still within approved range." }));
    await actions.rerunScenarios(fd({ actor: "Demo Author", modelSpecId: spec.id }));
    s = (await queries.getCaseState())!;
    const baseAfter = s.modelRuns.find((r) => r.modelSpecId === spec.id && r.scenario === "base" && r.status === "current")!;
    expect(baseAfter.inputHash).not.toBe(baseBefore.inputHash);

    // regenerate the pack: new version, old ready-for-review version preserved
    await actions.proposeNarrative();
    s = (await queries.getCaseState())!;
    const narrProp = s.proposals.find((p) => p.skill === "asset_composer" && p.status === "proposed")!;
    await actions.generatePack(fd({ actor: "Demo Author", proposalId: narrProp.id }));
    s = (await queries.getCaseState())!;

    const v1 = s.artifacts.find((a) => a.version === 1)!;
    const v2 = s.artifacts.find((a) => a.version === 2)!;
    expect(v1.status).toBe("ready_for_review"); // released version locked, not overwritten
    expect(v2.status).toBe("draft");
    const consistency2 = JSON.parse(v2.consistencyJson);
    expect(consistency2.passed, JSON.stringify(consistency2.checks, null, 2)).toBe(true);

    // every affected number changed consistently between versions
    const out = (a: any, id: string) => JSON.parse(a.snapshotJson).model.scenarios.find((x: any) => x.scenario === "base").outputs.find((o: any) => o.outputId === id).value;
    expect(out(v2, "revenue-y1")).toBeGreaterThan(out(v1, "revenue-y1"));
    expect(out(v2, "connected-y1")).toBeGreaterThan(out(v1, "connected-y1"));
    // narrative placeholders resolve against the NEW run in v2 and OLD run in v1 (numbers differ in rendered assets)
    expect(JSON.parse(v2.snapshotJson).assumptions.find((a: any) => a.code === "ASM-01").value).toBe(0.6);
    expect(JSON.parse(v1.snapshotJson).assumptions.find((a: any) => a.code === "ASM-01").value).toBe(0.5);
  }, 60_000);

  it("blocks release when a consistency check fails (seeded mismatch)", async () => {
    const { checkConsistency } = await import("@/lib/artifacts/composer");
    const s = (await queries.getCaseState())!;
    const v2 = s.artifacts.find((a) => a.version === 2)!;
    const snap = JSON.parse(v2.snapshotJson);
    // seed a bad citation and an unmodelled number
    snap.narrative.executiveSummary += " This claim is fabricated [EV-99]. Revenue will be £9,999,999 next year.";
    const report = checkConsistency(snap);
    expect(report.passed).toBe(false);
    const failing = report.checks.filter((c) => !c.passed).map((c) => c.name);
    expect(failing).toContain("Citations resolve to reviewed evidence");
    expect(failing).toContain("No material numbers without lineage");
  });
});
