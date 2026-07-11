// Editable decision-memo export (.docx), generated from the frozen pack
// snapshot with all numbers resolved from deterministic model outputs.

import { Document, Packer, Paragraph, TextRun, HeadingLevel, Footer, AlignmentType } from "docx";
import { loadPack } from "@/lib/artifacts/load";
import { resolveNarrativeText } from "@/lib/artifacts/composer";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pack = await loadPack(Number(id));
  if (!pack) return new Response("Pack not found", { status: 404 });
  const { snapshot: snap } = pack;
  const n = snap.narrative;
  const r = (t: string) => resolveNarrativeText(t, snap);

  const h = (text: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 }, children: [new TextRun({ text })] });
  const p = (text: string) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 22 })] });

  const statusLine = pack.status === "ready_for_review" ? "READY FOR REVIEW — NOT CLIENT APPROVED" : "DRAFT — NOT FOR CIRCULATION";

  const doc = new Document({
    sections: [{
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Pricing Strategy Workbench D0 demonstrator · synthetic data · pack v${pack.version} · ${statusLine}`, size: 14, color: "888888" })] })],
        }),
      },
      children: [
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: "Decision memo — " + snap.engagement.name })] }),
        new Paragraph({ children: [new TextRun({ text: `${snap.engagement.clientName} · ${snap.engagement.jurisdiction} · generated ${snap.generatedAt} · ${statusLine}`, size: 18, color: "666666" })] }),
        new Paragraph({ children: [new TextRun({ text: "Synthetic demonstration data. Citations [EV-xx] resolve to the evidence book; every modelled number derives from the validated deterministic model (engine " + (snap.model?.engineVersion ?? "n/a") + ").", size: 16, italics: true, color: "996600" })], spacing: { after: 240 } }),

        h("Decision requested"), p(snap.recommendation?.decision ?? ""),
        h("Executive summary"), p(r(n.executiveSummary)),
        h("Situation and case for change"), p(r(n.situation)),
        h("Diagnosis"), p(r(n.diagnosis)),
        h("Options considered"), p(r(n.optionsNarrative)),
        h("Recommended course"), p(r(n.recommendationNarrative)),
        h("Material assumptions"),
        ...snap.assumptions.map((a) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: `${a.code} ${a.name}: ${a.value} [${a.low}–${a.high}] ${a.unit} — owner ${a.owner} (${a.basis.replaceAll("_", " ")})`, size: 20 })] })),
        h("Contrary evidence and risks"), p(r(n.risksNarrative)),
        ...(snap.recommendation?.counterCase ? [h("Recorded counter-case"), p(snap.recommendation.counterCase)] : []),
        h("Conditions"), p(snap.recommendation?.conditions ?? ""),
        h("Approvals"),
        p(`Recommendation owner: ${snap.recommendation?.owner ?? "unassigned"}. This memo requests internal review of pack version ${pack.version}; it does not represent client approval.`),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="psw-memo-v${pack.version}.docx"`,
    },
  });
}
