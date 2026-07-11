// Editable model workbook export. Scenario sheets contain live formulas that
// reference the Inputs and Assumptions sheets — no unexplained hardcoded
// values inside formulas (PRD §12). A recorded-outputs sheet allows the
// reviewer to cross-check formulas against the canonical deterministic run.

import ExcelJS from "exceljs";
import { loadPack } from "@/lib/artifacts/load";
import { OBSERVED } from "@/lib/model/inputs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pack = await loadPack(Number(id));
  if (!pack?.snapshot.model) return new Response("Pack or model not found", { status: 404 });
  const { snapshot } = pack;
  const model = snapshot.model!;
  const transform = model.transform as Record<string, unknown>;

  const wb = new ExcelJS.Workbook();
  wb.creator = "Pricing Strategy Workbench (D0 demonstrator, synthetic data)";

  // ---- Inputs sheet (observed data with lineage) ----
  const inp = wb.addWorksheet("Inputs");
  inp.columns = [{ width: 42 }, { width: 16 }, { width: 26 }];
  inp.addRow(["Observed input (approved evidence lineage in col C)", "Value", "Evidence"]).font = { bold: true };
  const inputRows: [string, number, string][] = [
    ["Enterprise: total machines", OBSERVED.segments.enterprise.totalMachines, "EV-02"],
    ["Enterprise: accounts", OBSERVED.segments.enterprise.accounts, "EV-02"],
    ["Enterprise: downtime cost £/hour", OBSERVED.segments.enterprise.downtimeCostPerHour, "EV-08"],
    ["Mid-market: total machines", OBSERVED.segments.midmarket.totalMachines, "EV-02"],
    ["Mid-market: accounts", OBSERVED.segments.midmarket.accounts, "EV-02"],
    ["Mid-market: downtime cost £/hour (client assertion)", OBSERVED.segments.midmarket.downtimeCostPerHour, "EV-09"],
    ["Baseline unplanned downtime hours/machine/year", OBSERVED.segments.enterprise.baselineDowntimeHoursPerMachineYear, "EV-05"],
    ["Platform fixed cost £/year", OBSERVED.platformFixedCostPerYear, "EV-06"],
    ["Variable cost £/machine/month", OBSERVED.variableCostPerMachineMonth, "EV-06"],
    ["Onboarding cost £/machine", OBSERVED.onboardingCostPerMachine, "EV-06"],
    ["Engineer cost £/year", OBSERVED.engineerCostPerYear, "EV-06"],
    ["Machines per engineer", OBSERVED.machinesPerEngineer, "EV-16"],
    ["Average equipment price £", OBSERVED.avgEquipmentPrice, "EV-06"],
    ["Annual new machine sales", OBSERVED.annualNewMachineSales, "EV-06"],
  ];
  for (const r of inputRows) inp.addRow(r);
  // named cells: B2..B15
  const IN = {
    entMachines: "Inputs!B2", entAccounts: "Inputs!B3", entDowntimeCost: "Inputs!B4",
    mmMachines: "Inputs!B5", mmAccounts: "Inputs!B6", mmDowntimeCost: "Inputs!B7",
    baselineHours: "Inputs!B8", fixed: "Inputs!B9", varCost: "Inputs!B10",
    onboarding: "Inputs!B11", engineerCost: "Inputs!B12", machinesPerEng: "Inputs!B13",
    equipPrice: "Inputs!B14", newSales: "Inputs!B15",
  };

  // ---- Strategy sheet (transformation parameters) ----
  const st = wb.addWorksheet("Strategy");
  st.columns = [{ width: 42 }, { width: 16 }];
  st.addRow(["Strategy transformation parameter", "Value"]).font = { bold: true };
  st.addRow(["Pricing model type", String(transform.model)]);
  const stratParams: [string, number][] = [];
  if (transform.model === "site_subscription") {
    const p = transform.pricePerSiteMonth as { enterprise: number; midmarket: number };
    stratParams.push(["Enterprise price £/site/month", p.enterprise], ["Mid-market price £/site/month", p.midmarket]);
  } else if (transform.model === "per_machine") {
    const p = transform.pricePerMachineMonth as { enterprise: number; midmarket: number };
    stratParams.push(["Enterprise price £/machine/month", p.enterprise], ["Mid-market price £/machine/month", p.midmarket]);
  } else if (transform.model === "bundle_uplift") {
    stratParams.push(["Uplift % of equipment price per year", transform.upliftPctOfEquipmentPricePerYear as number], ["Coverage years", transform.coverageYears as number]);
  } else if (transform.model === "outcome_linked") {
    const b = transform.basePerSiteMonth as { enterprise: number; midmarket: number };
    stratParams.push(
      ["Enterprise base £/site/month", b.enterprise], ["Mid-market base £/site/month", b.midmarket],
      ["Outcome share (0-1)", transform.outcomeSharePct as number],
      ["Cap £/machine/year", transform.capPerMachineYear as number],
      ["Floor £/machine/year", transform.floorPerMachineYear as number],
    );
  }
  for (const r of stratParams) st.addRow(r);
  const SP = (i: number) => `Strategy!B${3 + i}`; // first param at B3

  // ---- Scenario sheets with formulas ----
  const scenarios = model.scenarios;
  for (const sc of scenarios) {
    const inputs = sc.outputs; // recorded outputs for cross-check
    const a = (snapshotAssumptions(snapshot, sc.scenario));
    const ws = wb.addWorksheet(`Scenario ${sc.scenario}`);
    ws.columns = [{ width: 44 }, { width: 16 }, { width: 16 }, { width: 16 }];
    ws.addRow([`Scenario: ${sc.scenario} — assumptions below feed the formulas; edit to explore`, "", "", ""]).font = { bold: true };
    ws.addRow(["Assumption", "Value"]).font = { bold: true };
    ws.addRow(["Enterprise adoption Y1 (share of machines)", a.adoptionEnt]);
    ws.addRow(["Mid-market adoption Y1", a.adoptionMm]);
    ws.addRow(["Adoption growth Y2-Y3", a.growth]);
    ws.addRow(["Downtime reduction", a.reduction]);
    ws.addRow(["Retention", a.retention]);
    const A = { adoptionEnt: "B3", adoptionMm: "B4", growth: "B5", reduction: "B6", retention: "B7" };

    ws.addRow([]);
    ws.addRow(["Line", "Year 1", "Year 2", "Year 3"]).font = { bold: true };
    const startRow = 10;
    const col = (y: number) => ["B", "C", "D"][y - 1];
    // connected machines rows 10 (ent) and 11 (mm)
    ws.getCell(`A${startRow}`).value = "Connected machines — enterprise";
    ws.getCell(`B${startRow}`).value = { formula: `${IN.entMachines}*${A.adoptionEnt}` };
    ws.getCell(`C${startRow}`).value = { formula: `MIN(${IN.entMachines},B${startRow}*(${A.retention}+${A.growth}))` };
    ws.getCell(`D${startRow}`).value = { formula: `MIN(${IN.entMachines},C${startRow}*(${A.retention}+${A.growth}))` };
    ws.getCell(`A${startRow + 1}`).value = "Connected machines — mid-market";
    ws.getCell(`B${startRow + 1}`).value = { formula: `${IN.mmMachines}*${A.adoptionMm}` };
    ws.getCell(`C${startRow + 1}`).value = { formula: `MIN(${IN.mmMachines},B${startRow + 1}*(${A.retention}+${A.growth}))` };
    ws.getCell(`D${startRow + 1}`).value = { formula: `MIN(${IN.mmMachines},C${startRow + 1}*(${A.retention}+${A.growth}))` };

    const entRow = startRow, mmRow = startRow + 1, revRow = startRow + 2;
    ws.getCell(`A${revRow}`).value = "Service revenue £";
    for (let y = 1; y <= 3; y++) {
      const c = col(y);
      let f = "0";
      if (transform.model === "site_subscription") {
        f = `(${IN.entAccounts}*${c}${entRow}/${IN.entMachines})*${SP(0)}*12+(${IN.mmAccounts}*${c}${mmRow}/${IN.mmMachines})*${SP(1)}*12`;
      } else if (transform.model === "per_machine") {
        f = `${c}${entRow}*${SP(0)}*12+${c}${mmRow}*${SP(1)}*12`;
      } else if (transform.model === "bundle_uplift") {
        f = `MIN(${IN.newSales}*${y},${IN.newSales}*${SP(1)})*${IN.equipPrice}*${SP(0)}`;
      } else if (transform.model === "outcome_linked") {
        const included = (transform.segmentsIncluded as string[]) ?? ["enterprise"];
        const parts: string[] = [];
        if (included.includes("enterprise")) parts.push(`(${IN.entAccounts}*${c}${entRow}/${IN.entMachines})*${SP(0)}*12+${c}${entRow}*MIN(MAX(${IN.baselineHours}*${A.reduction}*${IN.entDowntimeCost}*${SP(2)},${SP(4)}),${SP(3)})`);
        if (included.includes("midmarket")) parts.push(`(${IN.mmAccounts}*${c}${mmRow}/${IN.mmMachines})*${SP(1)}*12+${c}${mmRow}*MIN(MAX(${IN.baselineHours}*${A.reduction}*${IN.mmDowntimeCost}*${SP(2)},${SP(4)}),${SP(3)})`);
        f = parts.join("+") || "0";
      }
      ws.getCell(`${c}${revRow}`).value = { formula: f };
    }

    // cost rows: connected total, variable, engineers, onboarding, fixed, contribution, cumulative
    const totRow = revRow + 1;
    const onlyEnt = transform.model === "outcome_linked" && !(transform.segmentsIncluded as string[])?.includes("midmarket");
    const isBundle = transform.model === "bundle_uplift";
    ws.getCell(`A${totRow}`).value = "Connected machines for cost purposes";
    for (let y = 1; y <= 3; y++) {
      const c = col(y);
      ws.getCell(`${c}${totRow}`).value = {
        formula: isBundle
          ? `MIN(${IN.newSales}*${y},${IN.newSales}*${SP(1)})`
          : onlyEnt ? `${c}${entRow}` : `${c}${entRow}+${c}${mmRow}`,
      };
    }
    const rows = [
      ["Variable cost £", (c: string) => `${c}${totRow}*${IN.varCost}*12`],
      ["Service engineers £", (c: string) => `CEILING(${c}${totRow}/${IN.machinesPerEng},1)*${IN.engineerCost}`],
      ["Onboarding cost £", (c: string, y: number) => isBundle ? `${IN.newSales}*${IN.onboarding}` : y === 1 ? `${c}${totRow}*${IN.onboarding}` : `MAX(0,${c}${totRow}-${["B", "C", "D"][y - 2]}${totRow}*${A.retention})*${IN.onboarding}`],
      ["Platform fixed cost £", () => `${IN.fixed}`],
    ] as const;
    let r = totRow + 1;
    for (const [label, ff] of rows) {
      ws.getCell(`A${r}`).value = label;
      for (let y = 1; y <= 3; y++) ws.getCell(`${col(y)}${r}`).value = { formula: ff(col(y), y) };
      r++;
    }
    const contribRow = r;
    ws.getCell(`A${r}`).value = "Contribution £";
    for (let y = 1; y <= 3; y++) ws.getCell(`${col(y)}${r}`).value = { formula: `${col(y)}${revRow}-${col(y)}${totRow + 1}-${col(y)}${totRow + 2}-${col(y)}${totRow + 3}-${col(y)}${totRow + 4}` };
    r++;
    ws.getCell(`A${r}`).value = "Cumulative contribution £";
    ws.getCell(`B${r}`).value = { formula: `B${contribRow}` };
    ws.getCell(`C${r}`).value = { formula: `B${r}+C${contribRow}` };
    ws.getCell(`D${r}`).value = { formula: `C${r}+D${contribRow}` };

    // recorded outputs for cross-check
    ws.addRow([]);
    ws.addRow([`Recorded canonical outputs (engine ${model.engineVersion}, input hash ${sc.inputHash})`, "", "", ""]).font = { italic: true };
    for (const o of inputs) ws.addRow([`${o.label} [${o.outputId}]`, o.value, o.unit]);
  }

  // ---- Version sheet ----
  const meta = wb.addWorksheet("Version");
  meta.columns = [{ width: 30 }, { width: 60 }];
  meta.addRows([
    ["Engagement", snapshot.engagement.name],
    ["Pack version", pack.version],
    ["Status", pack.status],
    ["Engine version", model.engineVersion],
    ["Model validated by", model.validatedBy ?? "NOT VALIDATED"],
    ["Generated at", snapshot.generatedAt],
    ["Data", "SYNTHETIC DEMONSTRATION DATA — not a real client engagement"],
  ]);

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="psw-model-v${pack.version}.xlsx"`,
    },
  });
}

function snapshotAssumptions(snapshot: { assumptions: { code: string; value: number; low: number | null; high: number | null }[] }, scenario: string) {
  const pick = (code: string) => {
    const a = snapshot.assumptions.find((x) => x.code === code);
    if (!a) return 0;
    if (scenario === "downside") return a.low ?? a.value;
    if (scenario === "upside") return a.high ?? a.value;
    return a.value;
  };
  return { adoptionEnt: pick("ASM-01"), adoptionMm: pick("ASM-02"), reduction: pick("ASM-03"), retention: pick("ASM-04"), growth: pick("ASM-05") };
}
