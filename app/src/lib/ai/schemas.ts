// Output schemas for the bounded AI capabilities (ARCHITECTURE.md §4.6).
// Every skill returns schema-validated JSON into the proposal store; nothing
// an AI produces touches canonical state without a human accept action.

import { z } from "zod";

export const SynthesisProposal = z.object({
  researchQuestionCode: z.string(),
  supportingSummary: z.string().min(1),
  contrarySummary: z.string(), // may be empty ONLY when no contrary claims exist
  limitations: z.string(),
  gaps: z.string(),
  claimCodesUsed: z.array(z.string()),
});
export const SynthesisBatch = z.object({ syntheses: z.array(SynthesisProposal) });

export const StrategyDesign = z.object({
  targetSegments: z.array(z.string()),
  offerAndPackage: z.string(),
  priceMetric: z.string(),
  pricingModel: z.string(),
  priceArchitecture: z.string(),
  termsAndFences: z.string(),
  migration: z.string(),
  governance: z.string(),
  pilot: z.string(),
});

export const StrategyBranchProposal = z.object({
  title: z.string().min(1),
  thesis: z.string().min(1),
  design: StrategyDesign,
  causalChain: z.string(),
  requiredConditions: z.string(),
  failureModes: z.string(),
  smallestTest: z.string(),
  evidenceUsed: z.array(z.object({ claimCode: z.string(), how: z.string() })),
  contraryEvidence: z.array(z.object({ claimCode: z.string(), why: z.string() })),
  assumptionsIntroduced: z.array(z.string()),
  evidenceGaps: z.array(z.string()),
});

export const StrategyChallengeProposal = z.object({
  strategyTitle: z.string(),
  perspectives: z.array(z.object({
    perspective: z.enum(["customer", "competitor", "finance", "implementation", "regulatory"]),
    challenge: z.string().min(1),
    evidenceCodes: z.array(z.string()),
  })).min(3),
  missingTests: z.array(z.string()),
});

export const CounterCaseProposal = z.object({
  strongestCounterCase: z.string().min(1),
  conditionsThatWouldReverse: z.array(z.string()),
  evidenceCodes: z.array(z.string()),
});

// Asset narrative: prose blocks that cite claims as [EV-xx] and reference
// numbers ONLY via {{output-id}} placeholders resolved from the deterministic
// model — the composer cannot introduce a free-text number.
export const AssetNarrativeProposal = z.object({
  executiveSummary: z.string().min(1),
  situation: z.string().min(1),
  diagnosis: z.string().min(1),
  optionsNarrative: z.string().min(1),
  recommendationNarrative: z.string().min(1),
  risksNarrative: z.string().min(1),
});

export const SKILL_SCHEMAS = {
  evidence_synthesiser: SynthesisBatch,
  strategy_branch: StrategyBranchProposal,
  strategy_challenge: StrategyChallengeProposal,
  recommendation_challenger: CounterCaseProposal,
  asset_composer: AssetNarrativeProposal,
} as const;

export type SkillName = keyof typeof SKILL_SCHEMAS;
export type SkillOutput<S extends SkillName> = z.infer<(typeof SKILL_SCHEMAS)[S]>;
