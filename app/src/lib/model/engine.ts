// Deterministic new-offer monetisation model (ARCHITECTURE.md §6.1 MVP contract).
// Pure functions only: identical inputs + engine version always reproduce
// identical outputs. The LLM never executes arithmetic here.

import { createHash } from "crypto";

export const ENGINE_VERSION = "psw-newoffer-1.0.0";
export const YEARS = [1, 2, 3] as const;

export type SegmentKey = "enterprise" | "midmarket";

export interface SegmentInput {
  accounts: number;
  totalMachines: number;
  downtimeCostPerHour: number; // GBP
  baselineDowntimeHoursPerMachineYear: number;
}

export interface ObservedInputs {
  segments: Record<SegmentKey, SegmentInput>;
  platformFixedCostPerYear: number;
  variableCostPerMachineMonth: number;
  onboardingCostPerMachine: number;
  engineerCostPerYear: number;
  machinesPerEngineer: number;
  avgEquipmentPrice: number;
  annualNewMachineSales: number;
}

export interface BehaviouralAssumptions {
  adoptionY1: Record<SegmentKey, number>; // share of machines connected by end of Y1
  adoptionGrowthY2Y3: number; // relative growth of connected base per year
  downtimeReduction: number; // share of baseline downtime avoided
  retention: number; // share of connected machines retained per year
}

export type StrategyTransform =
  | { model: "site_subscription"; pricePerSiteMonth: Record<SegmentKey, number> }
  | { model: "per_machine"; pricePerMachineMonth: Record<SegmentKey, number> }
  | { model: "bundle_uplift"; upliftPctOfEquipmentPricePerYear: number; coverageYears: number }
  | {
      model: "outcome_linked";
      basePerSiteMonth: Record<SegmentKey, number>;
      outcomeSharePct: number; // share of measured avoided-downtime value
      capPerMachineYear: number; // GBP hard cap (Finance/E1 requirement)
      floorPerMachineYear: number; // GBP floor
      segmentsIncluded: SegmentKey[]; // e.g. enterprise only
    };

export interface ModelInputs {
  observed: ObservedInputs;
  assumptions: BehaviouralAssumptions;
  strategy: StrategyTransform;
}

export interface ModelOutput {
  outputId: string;
  label: string;
  value: number;
  unit: string;
}

export interface ModelResult {
  engineVersion: string;
  inputHash: string;
  outputs: ModelOutput[];
  byId: Record<string, ModelOutput>;
  notes: string[];
}

export function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`).join(",")}}`;
}

export function hashInputs(inputs: ModelInputs): string {
  return createHash("sha256").update(ENGINE_VERSION + stableStringify(inputs)).digest("hex").slice(0, 16);
}

const r2 = (n: number) => Math.round(n * 100) / 100;

interface YearState {
  connected: Record<SegmentKey, number>;
  newConnections: Record<SegmentKey, number>;
  bundleCovered: number; // machines under bundle coverage (bundle model only)
}

function connectedByYear(obs: ObservedInputs, a: BehaviouralAssumptions): YearState[] {
  const states: YearState[] = [];
  let prev: Record<SegmentKey, number> = { enterprise: 0, midmarket: 0 };
  let bundleCovered = 0;
  for (const y of YEARS) {
    const connected = {} as Record<SegmentKey, number>;
    const newConnections = {} as Record<SegmentKey, number>;
    for (const seg of ["enterprise", "midmarket"] as SegmentKey[]) {
      const total = obs.segments[seg].totalMachines;
      const target =
        y === 1
          ? total * a.adoptionY1[seg]
          : Math.min(total, prev[seg] * (a.retention + a.adoptionGrowthY2Y3));
      connected[seg] = r2(target);
      newConnections[seg] = r2(Math.max(0, target - prev[seg] * a.retention));
    }
    bundleCovered = r2(bundleCovered + obs.annualNewMachineSales);
    states.push({ connected, newConnections, bundleCovered });
    prev = connected;
  }
  return states;
}

function revenueForYear(inputs: ModelInputs, state: YearState): { revenue: number; note?: string } {
  const { observed: obs, assumptions: a, strategy: s } = inputs;
  const segs = ["enterprise", "midmarket"] as SegmentKey[];
  const accountsConnected = (seg: SegmentKey) =>
    obs.segments[seg].accounts * (state.connected[seg] / obs.segments[seg].totalMachines);

  switch (s.model) {
    case "site_subscription":
      return { revenue: segs.reduce((sum, seg) => sum + accountsConnected(seg) * s.pricePerSiteMonth[seg] * 12, 0) };
    case "per_machine":
      return { revenue: segs.reduce((sum, seg) => sum + state.connected[seg] * s.pricePerMachineMonth[seg] * 12, 0) };
    case "bundle_uplift": {
      const covered = Math.min(state.bundleCovered, obs.annualNewMachineSales * s.coverageYears);
      return {
        revenue: covered * obs.avgEquipmentPrice * s.upliftPctOfEquipmentPricePerYear,
        note: "Bundle monetises new machine sales only; the existing installed base generates no service revenue under this model.",
      };
    }
    case "outcome_linked": {
      let revenue = 0;
      for (const seg of s.segmentsIncluded) {
        const avoidedValuePerMachine =
          obs.segments[seg].baselineDowntimeHoursPerMachineYear * a.downtimeReduction * obs.segments[seg].downtimeCostPerHour;
        const outcomeFee = Math.min(Math.max(avoidedValuePerMachine * s.outcomeSharePct, s.floorPerMachineYear), s.capPerMachineYear);
        revenue += accountsConnected(seg) * s.basePerSiteMonth[seg] * 12 + state.connected[seg] * outcomeFee;
      }
      const excluded = segs.filter((x) => !s.segmentsIncluded.includes(x));
      return {
        revenue,
        note: excluded.length
          ? `Segments not comparable under this strategy (excluded from revenue): ${excluded.join(", ")}. They remain unmonetised rather than receiving manufactured precision.`
          : undefined,
      };
    }
  }
}

function connectedForCosts(inputs: ModelInputs, state: YearState): { connected: number; newConnections: number } {
  if (inputs.strategy.model === "bundle_uplift") {
    const covered = Math.min(state.bundleCovered, inputs.observed.annualNewMachineSales * inputs.strategy.coverageYears);
    return { connected: covered, newConnections: inputs.observed.annualNewMachineSales };
  }
  const segs: SegmentKey[] =
    inputs.strategy.model === "outcome_linked" ? inputs.strategy.segmentsIncluded : ["enterprise", "midmarket"];
  return {
    connected: segs.reduce((s, seg) => s + state.connected[seg], 0),
    newConnections: segs.reduce((s, seg) => s + state.newConnections[seg], 0),
  };
}

export function runModel(inputs: ModelInputs): ModelResult {
  const { observed: obs } = inputs;
  const states = connectedByYear(obs, inputs.assumptions);
  const outputs: ModelOutput[] = [];
  const notes: string[] = [];
  const push = (outputId: string, label: string, value: number, unit: string) =>
    outputs.push({ outputId, label, value: r2(value), unit });

  let cumulative = 0;
  const cumulativeByYear: number[] = [];
  for (const y of YEARS) {
    const state = states[y - 1];
    const { revenue, note } = revenueForYear(inputs, state);
    if (note && y === 1) notes.push(note);
    const { connected, newConnections } = connectedForCosts(inputs, state);
    const variableCost = connected * obs.variableCostPerMachineMonth * 12;
    const engineerCost = Math.ceil(connected / obs.machinesPerEngineer) * obs.engineerCostPerYear;
    const onboardingCost = newConnections * obs.onboardingCostPerMachine;
    const contribution = revenue - variableCost - engineerCost - onboardingCost - obs.platformFixedCostPerYear;
    cumulative += contribution;
    cumulativeByYear.push(cumulative);

    push(`connected-y${y}`, `Connected machines, end of year ${y}`, connected, "machines");
    push(`revenue-y${y}`, `Service revenue, year ${y}`, revenue, "GBP");
    push(`contribution-y${y}`, `Contribution, year ${y}`, contribution, "GBP");
    push(`cumulative-y${y}`, `Cumulative contribution, end of year ${y}`, cumulative, "GBP");
  }

  // Break-even month via linear interpolation of cumulative contribution
  // across year boundaries (deterministic, documented approximation).
  let breakEvenMonths = -1;
  let prevCum = 0;
  for (const y of YEARS) {
    const cum = cumulativeByYear[y - 1];
    if (cum >= 0) {
      const yearContribution = cum - prevCum;
      breakEvenMonths =
        yearContribution <= 0 ? (y - 1) * 12 : (y - 1) * 12 + Math.min(12, (-prevCum / yearContribution) * 12);
      break;
    }
    prevCum = cum;
  }
  push("breakeven-months", "Months to cumulative contribution break-even (interpolated)", breakEvenMonths === -1 ? -1 : Math.ceil(breakEvenMonths), "months (-1 = not within horizon)");

  const byId = Object.fromEntries(outputs.map((o) => [o.outputId, o]));
  return { engineVersion: ENGINE_VERSION, inputHash: hashInputs(inputs), outputs, byId, notes };
}

// ---- Sensitivity and switching values ------------------------------------

export interface SensitivityRow {
  assumptionKey: keyof BehaviouralAssumptions | "adoptionY1.enterprise" | "adoptionY1.midmarket";
  low: number;
  high: number;
  metric: string;
  atLow: number;
  atBase: number;
  atHigh: number;
}

export function withAssumption(a: BehaviouralAssumptions, key: SensitivityRow["assumptionKey"], value: number): BehaviouralAssumptions {
  const next: BehaviouralAssumptions = JSON.parse(JSON.stringify(a));
  if (key === "adoptionY1.enterprise") next.adoptionY1.enterprise = value;
  else if (key === "adoptionY1.midmarket") next.adoptionY1.midmarket = value;
  else (next[key] as number) = value;
  return next;
}

export function sensitivity(
  inputs: ModelInputs,
  ranges: { key: SensitivityRow["assumptionKey"]; low: number; high: number }[],
  metricId = "cumulative-y3",
): SensitivityRow[] {
  const base = runModel(inputs).byId[metricId].value;
  return ranges.map(({ key, low, high }) => ({
    assumptionKey: key,
    low,
    high,
    metric: metricId,
    atLow: runModel({ ...inputs, assumptions: withAssumption(inputs.assumptions, key, low) }).byId[metricId].value,
    atBase: base,
    atHigh: runModel({ ...inputs, assumptions: withAssumption(inputs.assumptions, key, high) }).byId[metricId].value,
  }));
}

/**
 * Switching value: smallest value of `key` in [low, high] at which `predicate`
 * over the model result becomes true (bisection; assumes monotonicity across
 * the range, which holds for adoption/reduction/retention on these metrics).
 * Returns null when the predicate is false across the whole range.
 */
export function switchingValue(
  inputs: ModelInputs,
  key: SensitivityRow["assumptionKey"],
  low: number,
  high: number,
  predicate: (r: ModelResult) => boolean,
): number | null {
  const at = (v: number) => predicate(runModel({ ...inputs, assumptions: withAssumption(inputs.assumptions, key, v) }));
  if (!at(high)) return null;
  if (at(low)) return low;
  let lo = low, hi = high;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid)) hi = mid;
    else lo = mid;
  }
  return Math.round(hi * 10000) / 10000;
}
