// Observed model inputs for the NordMach/PulseGuard case, with evidence lineage.
// Values mirror the approved case-pack data files; each input records the
// evidence claim it derives from so artifacts can resolve numbers to sources.

import type { ObservedInputs } from "./engine";

export const OBSERVED: ObservedInputs = {
  segments: {
    enterprise: {
      accounts: 12,
      totalMachines: 420,
      downtimeCostPerHour: 1800,
      baselineDowntimeHoursPerMachineYear: 30,
    },
    midmarket: {
      accounts: 110,
      totalMachines: 880,
      downtimeCostPerHour: 600,
      baselineDowntimeHoursPerMachineYear: 30,
    },
  },
  platformFixedCostPerYear: 380000,
  variableCostPerMachineMonth: 6,
  onboardingCostPerMachine: 900,
  engineerCostPerYear: 58000,
  machinesPerEngineer: 200,
  avgEquipmentPrice: 38000,
  annualNewMachineSales: 140,
};

// Evidence lineage: observed input → claim code (EVIDENCE_SYSTEM.md §16)
export const OBSERVED_LINEAGE: Record<string, string> = {
  "segments.enterprise": "EV-02",
  "segments.midmarket": "EV-02",
  "segments.enterprise.downtimeCostPerHour": "EV-08",
  "segments.midmarket.downtimeCostPerHour": "EV-09", // client assertion — labelled, not verified
  baselineDowntimeHoursPerMachineYear: "EV-05",
  platformFixedCostPerYear: "EV-06",
  variableCostPerMachineMonth: "EV-06",
  onboardingCostPerMachine: "EV-06",
  engineerCostPerYear: "EV-06",
  machinesPerEngineer: "EV-16",
  avgEquipmentPrice: "EV-06",
  annualNewMachineSales: "EV-06",
};

export const SENSITIVITY_RANGES = [
  { key: "adoptionY1.enterprise" as const, low: 0.3, high: 0.7 },
  { key: "adoptionY1.midmarket" as const, low: 0.05, high: 0.25 },
  { key: "downtimeReduction" as const, low: 0.15, high: 0.35 },
  { key: "retention" as const, low: 0.9, high: 0.99 },
];
