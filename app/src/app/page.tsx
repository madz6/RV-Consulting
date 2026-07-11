import Link from "next/link";
import { getCaseState, gateStatus } from "@/lib/queries";
import { PageHeader, StateBadge } from "@/components/workbench";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const state = await getCaseState();
  if (!state) {
    return (
      <div className="p-8 text-sm text-neutral-600">
        No engagement found. Run <code className="bg-neutral-100 px-1 rounded">npm run demo:reset</code> to load the synthetic case pack.
      </div>
    );
  }
  const g = gateStatus(state);

  const steps: { label: string; done: boolean; href: string; hint: string }[] = [
    { label: "1 · Approve decision framing", done: g.framingApproved, href: "/case", hint: "Review the drafted charter, context and research questions, then approve the framing gate." },
    { label: "2 · Review evidence & preserve conflicts", done: g.evidenceReviewed, href: "/case?tab=evidence", hint: "Review extracted claims, accept the question-led synthesis, conclude each research question." },
    { label: "3 · Author a strategy + AI branch/challenge", done: g.humanStrategy && g.aiBranch, href: "/strategy", hint: "Write your own thesis, then request an AI branch and structured challenge." },
    { label: "4 · Select strategy for modelling", done: g.strategySelected, href: "/strategy", hint: "Shortlist gate: select one strategy; rejections are logged with rationale." },
    { label: "5 · Approve assumptions & validate model", done: g.modelValidated, href: "/model", hint: "Approve behavioural assumptions, run deterministic scenarios, validate the model." },
    { label: "6 · Own recommendation after challenge", done: g.recommendationOwned, href: "/model", hint: "Draft the recommendation, request the counter-case, then take ownership." },
    { label: "7 · Generate & release decision pack", done: g.packReady, href: "/package", hint: "Generate the linked pack, pass consistency checks, release as ready for review." },
  ];
  const next = steps.find((s) => !s.done);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={state.engagement.name}
        subtitle={`${state.engagement.clientName} · ${state.engagement.jurisdiction} · ${state.engagement.audience} · synthetic case`}
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Decision under consideration</div>
          <p className="text-sm leading-relaxed">{state.charter?.decision}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
            Charter: <StateBadge state={state.charter?.status ?? "missing"} />
            {state.charter?.approvedBy && <span>approved by {state.charter.approvedBy}</span>}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-sm font-medium text-neutral-700 mb-3">Demonstrator loop — three human decisions, seven steps</h2>
      <ol className="space-y-2">
        {steps.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={`flex items-start gap-3 rounded-lg border p-3 bg-white hover:border-neutral-400 transition-colors ${s === next ? "border-blue-300 ring-1 ring-blue-200" : "border-neutral-200"}`}>
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${s.done ? "bg-emerald-500 text-white" : s === next ? "bg-blue-500 text-white" : "bg-neutral-200 text-neutral-500"}`}>
                {s.done ? "✓" : "·"}
              </span>
              <span>
                <span className={`block text-sm ${s.done ? "text-neutral-400 line-through decoration-neutral-300" : "font-medium"}`}>{s.label}</span>
                {!s.done && <span className="block text-xs text-neutral-500 mt-0.5">{s.hint}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {[
          ["Sources", state.sources.length],
          ["Evidence claims", state.claims.length],
          ["Strategies", state.strategies.length],
          ["Pack versions", state.artifacts.length],
        ].map(([label, n]) => (
          <div key={String(label)} className="rounded-lg border border-neutral-200 bg-white p-3">
            <div className="text-2xl font-semibold">{String(n)}</div>
            <div className="text-xs text-neutral-500">{String(label)}</div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-neutral-400 max-w-2xl">
        Seeded case-pack quality issues to watch for: one deliberate contradiction (mid-market vs sales belief on outcome pricing), one stale source (2019 market report), one unsupported management assertion (CEO willingness-to-pay claim) and one quarantined competition-sensitive document.
      </p>
    </div>
  );
}
