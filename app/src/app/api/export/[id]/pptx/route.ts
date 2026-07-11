// Executive presentation export (.pptx), generated from structured case
// objects in the frozen snapshot — not screenshots of chat output.

import PptxGenJS from "pptxgenjs";
import { loadPack } from "@/lib/artifacts/load";
import { resolveNarrativeText, formatOutputValue } from "@/lib/artifacts/composer";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pack = await loadPack(Number(id));
  if (!pack) return new Response("Pack not found", { status: 404 });
  const { snapshot: snap } = pack;
  const n = snap.narrative;
  const r = (t: string) => resolveNarrativeText(t, snap).replace(/\[(EV-\d+)\]/g, "[$1]");

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";
  const statusLine = pack.status === "ready_for_review" ? "READY FOR REVIEW — NOT CLIENT APPROVED" : "DRAFT";

  const addSlide = (title: string, body: string, extra?: (s: PptxGenJS.Slide) => void) => {
    const s = pptx.addSlide();
    s.addText(title, { x: 0.6, y: 0.4, w: 12, h: 0.8, fontSize: 26, bold: true, color: "1a1a1a" });
    if (body) s.addText(body, { x: 0.6, y: 1.4, w: 12.1, h: 5.2, fontSize: 13, color: "333333", valign: "top" });
    s.addText(`Pricing Strategy Workbench D0 · synthetic data · pack v${pack.version} · ${statusLine}`, { x: 0.6, y: 7.0, w: 12, h: 0.3, fontSize: 9, color: "999999" });
    extra?.(s);
    return s;
  };

  addSlide(snap.engagement.name, `${snap.engagement.clientName}\n\nDecision: ${snap.recommendation?.decision ?? ""}\n\nGenerated ${snap.generatedAt} · every number resolves to a deterministic model output; citations resolve to the evidence book.`);
  addSlide("Client objective & diagnosed problem", r(n.situation));
  addSlide("Evidence synthesis", r(n.diagnosis));
  addSlide("Strategic alternatives", r(n.optionsNarrative));

  const base = snap.model?.scenarios.find((s) => s.scenario === "base");
  const rows: PptxGenJS.TableRow[] = [[
    { text: "Output", options: { bold: true } },
    ...(snap.model?.scenarios ?? []).map((s) => ({ text: s.scenario, options: { bold: true } })),
  ]];
  for (const o of base?.outputs ?? []) {
    rows.push([
      { text: `${o.label}` },
      ...(snap.model?.scenarios ?? []).map((s) => ({ text: formatOutputValue(s.outputs.find((x) => x.outputId === o.outputId) ?? o) })),
    ]);
  }
  addSlide("Quantified comparison & sensitivities", "", (s) => {
    s.addTable(rows, { x: 0.6, y: 1.4, w: 12.1, fontSize: 11, border: { pt: 0.5, color: "CCCCCC" } });
    const sw = snap.model?.switchingValue as { key: string; predicate: string; value: number | null } | null;
    if (sw) s.addText(`Switching value: ${sw.value !== null ? `${sw.key} = ${sw.value} satisfies "${sw.predicate}"` : `no in-range value of ${sw.key} satisfies "${sw.predicate}"`}`, { x: 0.6, y: 6.2, w: 12, h: 0.6, fontSize: 11, italic: true, color: "555555" });
  });

  addSlide("Recommendation, risks & conditions", `${r(n.recommendationNarrative)}\n\nRisks: ${r(n.risksNarrative)}`);
  addSlide("Pilot / implementation outline", snap.strategies.find((s) => s.status === "selected")?.thesis ?? "");
  addSlide("Decision request & approvals", `Requested: internal review of pack v${pack.version}.\n\nRecommendation owner: ${snap.recommendation?.owner ?? "unassigned"}.\n\nTerminal demonstrator state is "ready for review" — no client approval is implied.`);

  const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="psw-deck-v${pack.version}.pptx"`,
    },
  });
}
