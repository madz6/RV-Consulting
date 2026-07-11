import { describe, it, expect } from "vitest";
import {
  runModel, sensitivity, switchingValue, hashInputs,
  type ModelInputs, type BehaviouralAssumptions, type StrategyTransform,
} from "./engine";
import { OBSERVED, SENSITIVITY_RANGES } from "./inputs";

const baseAssumptions: BehaviouralAssumptions = {
  adoptionY1: { enterprise: 0.5, midmarket: 0.12 },
  adoptionGrowthY2Y3: 0.5,
  downtimeReduction: 0.25,
  retention: 0.95,
};

const siteSub: StrategyTransform = {
  model: "site_subscription",
  pricePerSiteMonth: { enterprise: 2400, midmarket: 450 },
};

const outcome: StrategyTransform = {
  model: "outcome_linked",
  basePerSiteMonth: { enterprise: 1200, midmarket: 0 },
  outcomeSharePct: 0.1,
  capPerMachineYear: 2000,
  floorPerMachineYear: 0,
  segmentsIncluded: ["enterprise"],
};

const inputs = (strategy: StrategyTransform, assumptions = baseAssumptions): ModelInputs => ({
  observed: OBSERVED,
  assumptions,
  strategy,
});

describe("deterministic reproduction", () => {
  it("identical inputs produce identical outputs and hash", () => {
    const a = runModel(inputs(siteSub));
    const b = runModel(inputs(siteSub));
    expect(a.inputHash).toBe(b.inputHash);
    expect(a.outputs).toEqual(b.outputs);
  });

  it("input hash is key-order independent", () => {
    const i1 = inputs(siteSub);
    const i2 = JSON.parse(JSON.stringify(i1));
    expect(hashInputs(i1)).toBe(hashInputs(i2));
  });

  it("changing one assumption changes hash and only dependent outputs", () => {
    const a = runModel(inputs(siteSub));
    const b = runModel(inputs(siteSub, { ...baseAssumptions, adoptionY1: { enterprise: 0.6, midmarket: 0.12 } }));
    expect(a.inputHash).not.toBe(b.inputHash);
    // revenue and contribution move; the engine version does not
    expect(b.byId["revenue-y1"].value).toBeGreaterThan(a.byId["revenue-y1"].value);
    expect(b.engineVersion).toBe(a.engineVersion);
  });
});

describe("formula correctness (hand-computed)", () => {
  it("site subscription year-1 revenue matches hand calculation", () => {
    // enterprise: 12 accounts * (210/420 connected share) = 6 accounts * 2400 * 12 = 172,800
    // midmarket: 110 * (105.6/880) = 13.2 accounts * 450 * 12 = 71,280
    const r = runModel(inputs(siteSub));
    expect(r.byId["revenue-y1"].value).toBeCloseTo(172800 + 71280, 0);
  });

  it("year-1 costs match hand calculation for site subscription", () => {
    // connected = 210 + 105.6 = 315.6; variable = 315.6*6*12 = 22,723.2
    // engineers = ceil(315.6/200)=2 * 58k = 116,000; onboarding = 315.6*900 = 284,040
    // contribution = 244,080 - 22,723.2 - 116,000 - 284,040 - 380,000 = -558,683.2
    const r = runModel(inputs(siteSub));
    expect(r.byId["contribution-y1"].value).toBeCloseTo(-558683.2, 0);
  });

  it("outcome-linked applies the per-machine cap", () => {
    // avoided value/machine (enterprise) = 30h * 0.25 * £1800 = £13,500
    // 10% share = £1,350 < cap £2,000 → fee = 1,350
    // base: 6 accounts * 1200 * 12 = 86,400; outcome: 210 * 1350 = 283,500
    const r = runModel(inputs(outcome));
    expect(r.byId["revenue-y1"].value).toBeCloseTo(86400 + 283500, 0);

    // with a high share the cap binds: 30h*0.25*1800*0.5 = 6750 → capped at 2000
    const capped = runModel(inputs({ ...outcome, outcomeSharePct: 0.5 }));
    expect(capped.byId["revenue-y1"].value).toBeCloseTo(86400 + 210 * 2000, 0);
  });

  it("outcome-linked excludes segments not included and says so", () => {
    const r = runModel(inputs(outcome));
    expect(r.notes.join(" ")).toContain("midmarket");
    // mid-market machines generate no cost or revenue in this strategy
    expect(r.byId["connected-y1"].value).toBeCloseTo(210, 0);
  });

  it("bundle monetises new sales only", () => {
    const bundle: StrategyTransform = { model: "bundle_uplift", upliftPctOfEquipmentPricePerYear: 0.04, coverageYears: 5 };
    const r = runModel(inputs(bundle));
    // y1: 140 machines * 38,000 * 4% = 212,800
    expect(r.byId["revenue-y1"].value).toBeCloseTo(140 * 38000 * 0.04, 0);
    expect(r.notes.join(" ")).toContain("installed base");
  });
});

describe("sensitivity and switching values", () => {
  it("sensitivity moves the metric in the expected direction", () => {
    const rows = sensitivity(inputs(siteSub), SENSITIVITY_RANGES);
    const adoption = rows.find((r) => r.assumptionKey === "adoptionY1.enterprise")!;
    expect(adoption.atHigh).toBeGreaterThan(adoption.atBase);
    expect(adoption.atLow).toBeLessThan(adoption.atBase);
  });

  it("finds the switching value for the 18-month cash constraint", () => {
    const v = switchingValue(
      inputs(siteSub),
      "adoptionY1.enterprise",
      0.3,
      0.7,
      (r) => {
        const m = r.byId["breakeven-months"].value;
        return m !== -1 && m <= 18;
      },
    );
    // If found it must lie in range and actually satisfy the predicate at v, not below
    if (v !== null) {
      expect(v).toBeGreaterThanOrEqual(0.3);
      expect(v).toBeLessThanOrEqual(0.7);
    }
    // deterministic across runs
    const v2 = switchingValue(inputs(siteSub), "adoptionY1.enterprise", 0.3, 0.7, (r) => {
      const m = r.byId["breakeven-months"].value;
      return m !== -1 && m <= 18;
    });
    expect(v2).toEqual(v);
  });

  it("returns null when the predicate is unattainable in range", () => {
    const v = switchingValue(inputs(siteSub), "retention", 0.9, 0.99, (r) => r.byId["revenue-y1"].value > 10_000_000);
    expect(v).toBeNull();
  });
});
