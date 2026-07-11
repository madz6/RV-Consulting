// Decision-pack composition: freeze a case snapshot, resolve narrative
// citations to claim IDs and numbers to model-output IDs, and run the
// cross-artifact consistency checks that gate "ready for review".

import type { CaseState } from "@/lib/queries";
import type { z } from "zod";
import type { AssetNarrativeProposal } from "@/lib/ai/schemas";

export type AssetNarrative = z.infer<typeof AssetNarrativeProposal>;

export interface SnapshotOutput { outputId: string; label: string; value: number; unit: string }

export interface PackSnapshot {
  generatedAt: string;
  engagement: { name: string; clientName: string; jurisdiction: string; synthetic: boolean };
  charter: { decision: string; objective: string; scope: string; constraints: string[]; approvedBy: string | null } | null;
  narrative: AssetNarrative;
  researchQuestions: { code: string; question: string; status: string; humanConclusion: string | null }[];
  syntheses: { rqCode: string; supportingSummary: string; contrarySummary: string; limitations: string; gaps: string }[];
  claims: { code: string; proposition: string; excerpt: string; location: string; sourceCode: string; sourceTitle: string; contentType: string; state: string; reviewNote: string | null }[];
  sources: { code: string; title: string; kind: string; sourceClass: string; status: string; url: string | null; publishedDate: string | null; retrievedAt: string | null; quarantineReason: string | null; seededIssue: string | null }[];
  strategies: { code: string; title: string; thesis: string; authorship: string; status: string; rejectionReason: string | null; originNote: string }[];
  assumptions: { code: string; name: string; value: number; low: number | null; high: number | null; unit: string; owner: string; basis: string; rationale: string }[];
  model: {
    specName: string;
    transform: unknown;
    engineVersion: string;
    validatedBy: string | null;
    scenarios: { scenario: string; version: number; inputHash: string; outputs: SnapshotOutput[] }[];
    sensitivity: unknown;
    switchingValue: unknown;
  } | null;
  recommendation: { decision: string; rationale: string; conditions: string; risks: string; rejectedAlternatives: string; counterCase: string; owner: string | null; status: string } | null;
  reviewLog: { objectType: string; objectId: number; actor: string; role: string; action: string; note: string; createdAt: string }[];
}

export function composeSnapshot(state: CaseState, narrative: AssetNarrative): PackSnapshot {
  const sourceById = new Map(state.sources.map((s) => [s.id, s]));
  const rqById = new Map(state.researchQuestions.map((q) => [q.id, q]));
  const validatedSpec = state.modelSpecs.find((m) => m.status === "validated") ?? state.modelSpecs[0] ?? null;
  const currentRuns = validatedSpec
    ? state.modelRuns.filter((r) => r.modelSpecId === validatedSpec.id && r.status === "current")
    : [];
  const analysisRun = currentRuns.find((r) => r.scenario === "sensitivity");
  const analysis = analysisRun ? JSON.parse(analysisRun.outputsJson) : null;

  return {
    generatedAt: new Date().toISOString(),
    engagement: {
      name: state.engagement.name,
      clientName: state.engagement.clientName,
      jurisdiction: state.engagement.jurisdiction,
      synthetic: state.engagement.synthetic,
    },
    charter: state.charter
      ? {
          decision: state.charter.decision,
          objective: state.charter.objective,
          scope: state.charter.scope,
          constraints: JSON.parse(state.charter.constraintsJson),
          approvedBy: state.charter.approvedBy,
        }
      : null,
    narrative,
    researchQuestions: state.researchQuestions.map((q) => ({ code: q.code, question: q.question, status: q.status, humanConclusion: q.humanConclusion })),
    syntheses: state.syntheses
      .filter((s) => s.status === "approved")
      .map((s) => ({
        rqCode: rqById.get(s.researchQuestionId)?.code ?? "?",
        supportingSummary: s.supportingSummary,
        contrarySummary: s.contrarySummary,
        limitations: s.limitations,
        gaps: s.gaps,
      })),
    claims: state.claims
      .filter((c) => c.state === "approved" || c.state === "qualified")
      .map((c) => ({
        code: c.code,
        proposition: c.proposition,
        excerpt: c.excerpt,
        location: c.location,
        sourceCode: sourceById.get(c.sourceId)?.code ?? "?",
        sourceTitle: sourceById.get(c.sourceId)?.title ?? "?",
        contentType: c.contentType,
        state: c.state,
        reviewNote: c.reviewNote,
      })),
    sources: state.sources.map((s) => ({
      code: s.code, title: s.title, kind: s.kind, sourceClass: s.sourceClass, status: s.status,
      url: s.url, publishedDate: s.publishedDate, retrievedAt: s.retrievedAt,
      quarantineReason: s.quarantineReason, seededIssue: s.seededIssue,
    })),
    strategies: state.strategies.map((s) => ({
      code: s.code, title: s.title, thesis: s.thesis, authorship: s.authorship,
      status: s.status, rejectionReason: s.rejectionReason, originNote: s.originNote,
    })),
    assumptions: state.assumptions
      .filter((a) => a.status === "approved")
      .map((a) => ({ code: a.code, name: a.name, value: a.value, low: a.low, high: a.high, unit: a.unit, owner: a.owner, basis: a.basis, rationale: a.rationale })),
    model: validatedSpec
      ? {
          specName: validatedSpec.name,
          transform: JSON.parse(validatedSpec.specJson),
          engineVersion: currentRuns[0]?.engineVersion ?? "",
          validatedBy: validatedSpec.validatedBy,
          scenarios: currentRuns
            .filter((r) => r.scenario !== "sensitivity")
            .map((r) => ({ scenario: r.scenario, version: r.version, inputHash: r.inputHash, outputs: JSON.parse(r.outputsJson) })),
          sensitivity: analysis?.sensitivity ?? null,
          switchingValue: analysis?.switchingValue ?? null,
        }
      : null,
    recommendation: state.recommendation
      ? {
          decision: state.recommendation.decision,
          rationale: state.recommendation.rationale,
          conditions: state.recommendation.conditions,
          risks: state.recommendation.risks,
          rejectedAlternatives: state.recommendation.rejectedAlternatives,
          counterCase: state.recommendation.counterCase,
          owner: state.recommendation.owner,
          status: state.recommendation.status,
        }
      : null,
    reviewLog: state.reviewDecisions.map((r) => ({ objectType: r.objectType, objectId: r.objectId, actor: r.actor, role: r.role, action: r.action, note: r.note, createdAt: r.createdAt })),
  };
}

// ---- Consistency checks -----------------------------------------------------

export interface ConsistencyCheck { name: string; passed: boolean; details: string[] }
export interface ConsistencyReport { passed: boolean; checks: ConsistencyCheck[] }

const CITATION_RE = /\[(EV-\d+)\]/g;
const PLACEHOLDER_RE = /\{\{([a-z0-9-]+)\}\}/g;

export function narrativeFields(n: AssetNarrative): [string, string][] {
  return Object.entries(n) as [string, string][];
}

export function checkConsistency(snapshot: PackSnapshot): ConsistencyReport {
  const checks: ConsistencyCheck[] = [];
  const approvedCodes = new Set(snapshot.claims.map((c) => c.code));
  const baseOutputs = new Map(
    (snapshot.model?.scenarios.find((s) => s.scenario === "base")?.outputs ?? []).map((o) => [o.outputId, o]),
  );

  // 1. Every citation resolves to an approved/qualified claim in the evidence book
  {
    const details: string[] = [];
    for (const [field, text] of narrativeFields(snapshot.narrative)) {
      for (const m of text.matchAll(CITATION_RE)) {
        if (!approvedCodes.has(m[1])) details.push(`${field}: citation [${m[1]}] does not resolve to reviewed evidence`);
      }
    }
    checks.push({ name: "Citations resolve to reviewed evidence", passed: details.length === 0, details });
  }

  // 2. Every number placeholder resolves to a current base-scenario model output
  {
    const details: string[] = [];
    for (const [field, text] of narrativeFields(snapshot.narrative)) {
      for (const m of text.matchAll(PLACEHOLDER_RE)) {
        if (!baseOutputs.has(m[1])) details.push(`${field}: number reference {{${m[1]}}} does not resolve to a model output`);
      }
    }
    checks.push({ name: "Numbers resolve to model outputs", passed: details.length === 0, details });
  }

  // 3. No un-cited, un-modelled material numerals in narrative sentences
  {
    const details: string[] = [];
    for (const [field, text] of narrativeFields(snapshot.narrative)) {
      for (const sentence of text.split(/(?<=[.!?])\s+/)) {
        const hasBigNumber = /£?\d{1,3}(,\d{3})+|£\d{3,}|\d+%/.test(sentence.replace(PLACEHOLDER_RE, ""));
        const hasLineage = CITATION_RE.test(sentence) || PLACEHOLDER_RE.test(sentence);
        // reset lastIndex on global regexes reused across iterations
        CITATION_RE.lastIndex = 0; PLACEHOLDER_RE.lastIndex = 0;
        if (hasBigNumber && !hasLineage) details.push(`${field}: sentence contains a material number without citation or model lineage: "${sentence.slice(0, 120)}…"`);
      }
    }
    checks.push({ name: "No material numbers without lineage", passed: details.length === 0, details });
  }

  // 4. Quarantined sources are not cited and contributed no claims
  {
    const quarantined = new Set(snapshot.sources.filter((s) => s.status === "quarantined").map((s) => s.code));
    const details = snapshot.claims
      .filter((c) => quarantined.has(c.sourceCode))
      .map((c) => `claim ${c.code} derives from quarantined source ${c.sourceCode}`);
    checks.push({ name: "Quarantined material excluded", passed: details.length === 0, details });
  }

  // 5. Memo and deck agree on the recommendation and selected strategy
  {
    const details: string[] = [];
    const selected = snapshot.strategies.filter((s) => s.status === "selected");
    if (selected.length !== 1) details.push(`expected exactly one selected strategy, found ${selected.length}`);
    if (!snapshot.recommendation) details.push("no recommendation in snapshot");
    else if (snapshot.recommendation.status !== "owned") details.push("recommendation is not owned by a named human");
    if (!snapshot.recommendation?.counterCase) details.push("no counter-case recorded — challenge is required before release");
    checks.push({ name: "Recommendation gates satisfied", passed: details.length === 0, details });
  }

  // 6. Model validation and reproducibility metadata present
  {
    const details: string[] = [];
    if (!snapshot.model) details.push("no model in snapshot");
    else {
      if (!snapshot.model.validatedBy) details.push("model spec not validated by a named human");
      if (!snapshot.model.scenarios.length) details.push("no current scenario runs");
      for (const s of snapshot.model.scenarios) if (!s.inputHash) details.push(`scenario ${s.scenario} missing input hash`);
    }
    checks.push({ name: "Model validated with reproducible runs", passed: details.length === 0, details });
  }

  return { passed: checks.every((c) => c.passed), checks };
}

// ---- Narrative rendering ----------------------------------------------------

export function formatOutputValue(o: SnapshotOutput): string {
  if (o.unit === "GBP") return `£${Math.round(o.value).toLocaleString("en-GB")}`;
  if (o.unit.startsWith("months")) return o.value === -1 ? "beyond the 3-year horizon" : `${Math.round(o.value)}`;
  if (o.unit === "machines") return Math.round(o.value).toLocaleString("en-GB");
  return String(o.value);
}

/** Resolve placeholders/citations to plain text (for docx/pptx) */
export function resolveNarrativeText(text: string, snapshot: PackSnapshot): string {
  const baseOutputs = new Map(
    (snapshot.model?.scenarios.find((s) => s.scenario === "base")?.outputs ?? []).map((o) => [o.outputId, o]),
  );
  return text.replace(PLACEHOLDER_RE, (_, id) => {
    const o = baseOutputs.get(id);
    return o ? formatOutputValue(o) : `[unresolved: ${id}]`;
  });
}
