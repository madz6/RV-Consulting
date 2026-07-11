import { eq } from "drizzle-orm";
import { db, artifacts } from "@/db";
import { formatOutputValue, type PackSnapshot, type SnapshotOutput } from "@/lib/artifacts/composer";
import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";

export default async function PackViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [art] = await db.select().from(artifacts).where(eq(artifacts.id, Number(id)));
  if (!art) return <div className="p-8 text-sm">Pack not found.</div>;
  const snap = JSON.parse(art.snapshotJson) as PackSnapshot;
  const n = snap.narrative;
  const baseOutputs = new Map((snap.model?.scenarios.find((s) => s.scenario === "base")?.outputs ?? []).map((o) => [o.outputId, o]));
  const statusLabel = art.status === "ready_for_review" ? "READY FOR REVIEW" : art.status.toUpperCase();

  const rn = (text: string) => renderNarrative(text, baseOutputs);

  const slides: { title: string; body: React.ReactNode }[] = [
    { title: "Decision & recommendation", body: <><p className="font-medium">{snap.recommendation?.decision}</p><p className="mt-2 text-neutral-600">{rn(n.executiveSummary)}</p></> },
    { title: "Client objective & diagnosed problem", body: <>{rn(n.situation)}</> },
    { title: "Evidence synthesis", body: <>{rn(n.diagnosis)}</> },
    { title: "Strategic alternatives", body: <>{rn(n.optionsNarrative)}</> },
    {
      title: "Quantified comparison & sensitivities", body: (
        <>
          <ScenarioMiniTable snap={snap} />
          <p className="mt-2 text-xs text-neutral-600">Switching value: {describeSwitching(snap)}</p>
        </>
      ),
    },
    { title: "Recommendation, risks & conditions", body: <>{rn(n.recommendationNarrative)}<p className="mt-2">{rn(n.risksNarrative)}</p></> },
    { title: "Pilot / implementation outline", body: <p>{snap.strategies.find((s) => s.status === "selected")?.thesis}</p> },
    { title: "Decision request & approvals", body: <p>Requested: internal review of this pack (v{art.version}). Terminal demonstrator state is “ready for review” — no client approval is implied. Recommendation owner: {snap.recommendation?.owner}.</p> },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-8 py-10 text-[13px] leading-relaxed text-neutral-900 print:px-0">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link href="/package" className="text-xs text-neutral-400 hover:text-neutral-700">← back to packages</Link>
          <span className="text-xs text-neutral-400">Print this page for the PDF review copy</span>
        </div>

        {/* Cover */}
        <header className="border-b-4 border-neutral-900 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-neutral-400">Decision pack · v{art.version} · {statusLabel}</div>
            <div className={`text-xs font-bold px-2 py-1 rounded ${art.status === "ready_for_review" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{art.status === "ready_for_review" ? "READY FOR REVIEW — NOT CLIENT APPROVED" : "DRAFT — NOT FOR CIRCULATION"}</div>
          </div>
          <h1 className="text-2xl font-bold mt-4">{snap.engagement.name}</h1>
          <p className="text-neutral-500 mt-1">{snap.engagement.clientName} · {snap.engagement.jurisdiction} · generated {new Date(snap.generatedAt).toLocaleString("en-GB")}</p>
          <p className="mt-2 text-xs bg-amber-50 border border-amber-200 rounded p-2 text-amber-900">Synthetic demonstration data. Every material factual claim cites the evidence book; every modelled number resolves to a deterministic model output ID. Model engine {snap.model?.engineVersion}, validated by {snap.model?.validatedBy}.</p>
        </header>

        {/* Decision memo */}
        <section className="mb-10">
          <h2 className="text-lg font-bold border-b border-neutral-300 pb-1 mb-4">Decision memo</h2>
          <MemoSection title="Decision requested"><p>{snap.recommendation?.decision}</p></MemoSection>
          <MemoSection title="Executive summary">{rn(n.executiveSummary)}</MemoSection>
          <MemoSection title="Situation and case for change">{rn(n.situation)}</MemoSection>
          <MemoSection title="Diagnosis — market, customer, competitor, company">{rn(n.diagnosis)}</MemoSection>
          <MemoSection title="Options considered">{rn(n.optionsNarrative)}</MemoSection>
          <MemoSection title="Recommended course">{rn(n.recommendationNarrative)}</MemoSection>
          <MemoSection title="Material assumptions">
            <ul className="list-disc pl-5">
              {snap.assumptions.map((a) => <li key={a.code}><span className="font-mono text-xs">{a.code}</span> {a.name}: <b>{a.value}</b> [{a.low}–{a.high}] {a.unit} — owner {a.owner} ({a.basis.replaceAll("_", " ")})</li>)}
            </ul>
          </MemoSection>
          <MemoSection title="Contrary evidence and risks">{rn(n.risksNarrative)}
            {snap.recommendation?.counterCase && <div className="mt-2 border-l-2 border-red-300 pl-3 text-neutral-700 whitespace-pre-wrap text-xs">{snap.recommendation.counterCase}</div>}
          </MemoSection>
          <MemoSection title="Conditions and approvals required"><p>{snap.recommendation?.conditions}</p><p className="mt-1">Recommendation owner: <b>{snap.recommendation?.owner}</b>. This pack requests internal review only.</p></MemoSection>
        </section>

        {/* Deck */}
        <section className="mb-10 break-before-page">
          <h2 className="text-lg font-bold border-b border-neutral-300 pb-1 mb-4">Executive presentation</h2>
          <div className="grid gap-4">
            {slides.map((s, i) => (
              <div key={s.title} className="border border-neutral-300 rounded-lg p-5 aspect-[16/7] overflow-hidden flex flex-col">
                <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Slide {i + 1} / {slides.length}</div>
                <h3 className="font-bold text-base mb-2">{s.title}</h3>
                <div className="text-xs leading-relaxed overflow-hidden">{s.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Model appendix */}
        <section className="mb-10 break-before-page">
          <h2 className="text-lg font-bold border-b border-neutral-300 pb-1 mb-4">Appendix A — deterministic model</h2>
          <p className="text-xs text-neutral-500 mb-3">Spec: {snap.model?.specName} · engine {snap.model?.engineVersion} · validated by {snap.model?.validatedBy}. Identical inputs and engine version reproduce identical outputs; input hashes are recorded per scenario.</p>
          <ScenarioMiniTable snap={snap} full />
          <h3 className="font-semibold mt-4 mb-1 text-sm">Sensitivity (cumulative 3-year contribution)</h3>
          <SensitivityTable snap={snap} />
          <p className="mt-2 text-xs">{describeSwitching(snap)}</p>
          <h3 className="font-semibold mt-4 mb-1 text-sm">Strategy transformation</h3>
          <pre className="text-[10px] bg-neutral-50 border border-neutral-200 rounded p-2 overflow-x-auto">{JSON.stringify(snap.model?.transform, null, 2)}</pre>
        </section>

        {/* Evidence book */}
        <section className="mb-10 break-before-page">
          <h2 className="text-lg font-bold border-b border-neutral-300 pb-1 mb-4">Appendix B — evidence book</h2>
          <h3 className="font-semibold mb-2 text-sm">B.1 Research questions and conclusions</h3>
          <table className="w-full text-xs border border-neutral-200 mb-4">
            <thead className="bg-neutral-50"><tr><th className="p-1.5 text-left">RQ</th><th className="p-1.5 text-left">Question</th><th className="p-1.5 text-left">Status</th><th className="p-1.5 text-left">Human conclusion</th></tr></thead>
            <tbody>{snap.researchQuestions.map((q) => <tr key={q.code} className="border-t border-neutral-100"><td className="p-1.5 font-mono">{q.code}</td><td className="p-1.5">{q.question}</td><td className="p-1.5">{q.status.replaceAll("_", " ")}</td><td className="p-1.5">{q.humanConclusion}</td></tr>)}</tbody>
          </table>

          <h3 className="font-semibold mb-2 text-sm">B.2 Source register</h3>
          <table className="w-full text-xs border border-neutral-200 mb-4">
            <thead className="bg-neutral-50"><tr><th className="p-1.5 text-left">Code</th><th className="p-1.5 text-left">Title</th><th className="p-1.5 text-left">Tier</th><th className="p-1.5 text-left">Status</th><th className="p-1.5 text-left">Dates</th></tr></thead>
            <tbody>
              {snap.sources.map((s) => (
                <tr key={s.code} className={`border-t border-neutral-100 ${s.status === "quarantined" ? "bg-red-50" : ""}`}>
                  <td className="p-1.5 font-mono">{s.code}</td>
                  <td className="p-1.5">{s.title}{s.status === "quarantined" && <div className="text-red-700 mt-0.5">QUARANTINED — {s.quarantineReason}</div>}{s.seededIssue === "stale" && <span className="text-amber-700"> (stale — treat with caution)</span>}</td>
                  <td className="p-1.5">{s.sourceClass}</td>
                  <td className="p-1.5">{s.status}</td>
                  <td className="p-1.5">{s.publishedDate ?? "—"}{s.retrievedAt ? ` / retrieved ${s.retrievedAt}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-semibold mb-2 text-sm">B.3 Claim register (approved and qualified)</h3>
          <table className="w-full text-xs border border-neutral-200 mb-4">
            <thead className="bg-neutral-50"><tr><th className="p-1.5 text-left">Code</th><th className="p-1.5 text-left">Proposition</th><th className="p-1.5 text-left">Type</th><th className="p-1.5 text-left">Source · location</th><th className="p-1.5 text-left">State</th></tr></thead>
            <tbody>
              {snap.claims.map((c) => (
                <tr key={c.code} className="border-t border-neutral-100" id={`claim-${c.code}`}>
                  <td className="p-1.5 font-mono">{c.code}</td>
                  <td className="p-1.5">{c.proposition}<div className="text-neutral-400 italic mt-0.5">“{c.excerpt}”</div></td>
                  <td className="p-1.5">{c.contentType.replaceAll("_", " ")}</td>
                  <td className="p-1.5">{c.sourceCode} · {c.location}</td>
                  <td className="p-1.5">{c.state}{c.reviewNote ? ` — ${c.reviewNote}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-semibold mb-2 text-sm">B.4 Evidence synthesis, contradictions and gaps</h3>
          {snap.syntheses.map((s) => (
            <div key={s.rqCode} className="border border-neutral-200 rounded p-3 mb-2 text-xs">
              <div className="font-mono text-neutral-400">{s.rqCode}</div>
              <p><b>Supporting:</b> {s.supportingSummary}</p>
              <p className="mt-1"><b>Contrary:</b> {s.contrarySummary}</p>
              <p className="mt-1 text-neutral-500"><b>Limitations:</b> {s.limitations} · <b>Gaps:</b> {s.gaps}</p>
            </div>
          ))}
        </section>

        {/* Review log */}
        <section className="mb-10 break-before-page">
          <h2 className="text-lg font-bold border-b border-neutral-300 pb-1 mb-4">Appendix C — decision and review log</h2>
          <table className="w-full text-xs border border-neutral-200">
            <thead className="bg-neutral-50"><tr><th className="p-1.5 text-left">When</th><th className="p-1.5 text-left">Actor · role</th><th className="p-1.5 text-left">Action</th><th className="p-1.5 text-left">Object</th><th className="p-1.5 text-left">Note</th></tr></thead>
            <tbody>
              {[...snap.reviewLog].reverse().map((r, i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="p-1.5 whitespace-nowrap">{new Date(r.createdAt).toLocaleString("en-GB")}</td>
                  <td className="p-1.5">{r.actor} · {r.role}</td>
                  <td className="p-1.5">{r.action}</td>
                  <td className="p-1.5">{r.objectType} #{r.objectId}</td>
                  <td className="p-1.5">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="text-[10px] text-neutral-400 border-t border-neutral-200 pt-3">
          Pricing Strategy Workbench D0 demonstrator · synthetic data · pack v{art.version} · {statusLabel} · office-file exports (.docx/.pptx/.xlsx) are generated from this same frozen snapshot.
        </footer>
      </div>
    </div>
  );
}

function MemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <div className="text-[13px] leading-relaxed">{children}</div>
    </div>
  );
}

function renderNarrative(text: string, baseOutputs: Map<string, SnapshotOutput>): React.ReactNode[] {
  const parts = text.split(/(\[EV-\d+\]|\{\{[a-z0-9-]+\}\})/g);
  return parts.map((p, i) => {
    const cite = p.match(/^\[(EV-\d+)\]$/);
    if (cite) return <sup key={i}><a href={`#claim-${cite[1]}`} className="text-blue-600 no-underline">[{cite[1]}]</a></sup>;
    const ph = p.match(/^\{\{([a-z0-9-]+)\}\}$/);
    if (ph) {
      const o = baseOutputs.get(ph[1]);
      return (
        <span key={i} className="font-semibold border-b border-dotted border-neutral-400" title={o ? `model output ${o.outputId} (${o.label})` : "unresolved"}>
          {o ? formatOutputValue(o) : `[unresolved ${ph[1]}]`}
        </span>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

function ScenarioMiniTable({ snap, full = false }: { snap: PackSnapshot; full?: boolean }) {
  const scenarios = snap.model?.scenarios ?? [];
  const order = ["base", "downside", "upside"];
  const sorted = [...scenarios].sort((a, b) => order.indexOf(a.scenario) - order.indexOf(b.scenario));
  const rows = sorted[0]?.outputs.filter((o) => full || ["revenue-y1", "contribution-y1", "cumulative-y3", "breakeven-months"].includes(o.outputId)) ?? [];
  return (
    <table className="w-full text-xs border border-neutral-200">
      <thead className="bg-neutral-50"><tr><th className="p-1.5 text-left">Output</th>{sorted.map((s) => <th key={s.scenario} className="p-1.5 text-right capitalize">{s.scenario}</th>)}</tr></thead>
      <tbody>
        {rows.map((o) => (
          <tr key={o.outputId} className="border-t border-neutral-100">
            <td className="p-1.5">{o.label} <span className="font-mono text-neutral-300">{o.outputId}</span></td>
            {sorted.map((s) => {
              const out = s.outputs.find((x) => x.outputId === o.outputId);
              return <td key={s.scenario} className="p-1.5 text-right">{out ? formatOutputValue(out) : "—"}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SensitivityTable({ snap }: { snap: PackSnapshot }) {
  const sens = (snap.model?.sensitivity ?? []) as { assumptionKey: string; atLow: number; atBase: number; atHigh: number }[];
  return (
    <table className="w-full text-xs border border-neutral-200">
      <thead className="bg-neutral-50"><tr><th className="p-1.5 text-left">Assumption</th><th className="p-1.5 text-right">At low</th><th className="p-1.5 text-right">Base</th><th className="p-1.5 text-right">At high</th></tr></thead>
      <tbody>
        {sens.map((s) => (
          <tr key={s.assumptionKey} className="border-t border-neutral-100">
            <td className="p-1.5 font-mono">{s.assumptionKey}</td>
            <td className="p-1.5 text-right">£{Math.round(s.atLow).toLocaleString("en-GB")}</td>
            <td className="p-1.5 text-right font-semibold">£{Math.round(s.atBase).toLocaleString("en-GB")}</td>
            <td className="p-1.5 text-right">£{Math.round(s.atHigh).toLocaleString("en-GB")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function describeSwitching(snap: PackSnapshot): string {
  const sw = snap.model?.switchingValue as { key: string; predicate: string; value: number | null } | null;
  if (!sw) return "No switching-value analysis recorded.";
  return sw.value !== null
    ? `The decision test “${sw.predicate}” is satisfied once ${sw.key} reaches ${sw.value}; below that the 18-month cash constraint fails.`
    : `No value of ${sw.key} within its approved range satisfies “${sw.predicate}”.`;
}
