import Link from "next/link";
import { getCaseState } from "@/lib/queries";
import { proposeNarrative, generatePack, rejectProposal, releasePack } from "@/lib/actions";
import { PageHeader, StateBadge, ActorSelect, EmptyHint } from "@/components/workbench";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import type { PackSnapshot, ConsistencyReport } from "@/lib/artifacts/composer";

export const dynamic = "force-dynamic";

export default async function PackagePage() {
  const state = await getCaseState();
  if (!state) return <EmptyHint>Run <code>npm run demo:reset</code> first.</EmptyHint>;

  const ready = state.recommendation?.status === "owned" && state.modelSpecs.some((m) => m.status === "validated");
  const narrativeProposal = state.proposals.find((p) => p.skill === "asset_composer" && p.status === "proposed");
  const artifactsDesc = [...state.artifacts].sort((a, b) => b.version - a.version);

  return (
    <div className="max-w-5xl">
      <PageHeader title="Decision Package" subtitle="One linked pack — memo, deck pages, model and evidence appendices — generated from a frozen case snapshot. Consistency checks gate release." />

      {!ready && (
        <EmptyHint>
          The pack can be generated once the model is validated and the recommendation is owned. Complete <Link className="underline" href="/model">Model & Decision</Link> first.
        </EmptyHint>
      )}

      {ready && !narrativeProposal && (
        <form action={proposeNarrative} className="mb-6">
          <Button type="submit" size="sm">Request AI narrative draft (asset composer)</Button>
          <p className="mt-1 text-xs text-neutral-400">The composer drafts from approved state only: facts must cite [EV-xx]; every number is a {"{{output-id}}"} placeholder resolved from the deterministic model. It cannot introduce uncited facts or unmodelled numbers.</p>
        </form>
      )}

      {narrativeProposal && (
        <Card className="mb-6 border-violet-300">
          <CardHeader><CardTitle className="text-base">Narrative proposal ({narrativeProposal.provider} mode) <StateBadge state="proposed" /></CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {Object.entries(JSON.parse(narrativeProposal.payloadJson) as Record<string, string>).map(([k, v]) => (
              <div key={k}>
                <div className="text-xs uppercase tracking-wide text-neutral-400">{k.replace(/([A-Z])/g, " $1")}</div>
                <p className="text-xs leading-relaxed mt-0.5 whitespace-pre-wrap">{v}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <form action={generatePack} className="flex items-center gap-2">
                <input type="hidden" name="proposalId" value={narrativeProposal.id} />
                <ActorSelect />
                <Button type="submit" size="sm">Accept narrative & generate pack</Button>
              </form>
              <form action={rejectProposal}>
                <input type="hidden" name="proposalId" value={narrativeProposal.id} />
                <Button type="submit" size="sm" variant="outline" className="text-red-700">Reject</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {artifactsDesc.map((art) => {
        const consistency = JSON.parse(art.consistencyJson) as ConsistencyReport;
        const snapshot = JSON.parse(art.snapshotJson) as PackSnapshot;
        const prev = artifactsDesc.find((a) => a.version === art.version - 1);
        return (
          <Card key={art.id} className={`mb-4 ${art.status === "ready_for_review" ? "border-emerald-300" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                Decision pack v{art.version} <StateBadge state={art.status} />
                <span className="text-xs font-normal text-neutral-400">generated {new Date(art.createdAt).toLocaleString("en-GB")}</span>
              </CardTitle>
              {art.releasedBy && <p className="text-xs text-neutral-500">Released ready-for-review by {art.releasedBy} — the demonstrator terminal state; this is not client approval.</p>}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/package/${art.id}/view`}>View pack (HTML / print to PDF)</Link>
                <a className={buttonVariants({ size: "sm", variant: "outline" })} href={`/api/export/${art.id}/xlsx`}>Model workbook (.xlsx)</a>
                <a className={buttonVariants({ size: "sm", variant: "outline" })} href={`/api/export/${art.id}/docx`}>Memo (.docx)</a>
                <a className={buttonVariants({ size: "sm", variant: "outline" })} href={`/api/export/${art.id}/pptx`}>Deck (.pptx)</a>
              </div>

              <div className={`rounded-md border p-3 ${consistency.passed ? "border-emerald-200 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
                <div className="text-xs font-medium mb-1">{consistency.passed ? "Consistency checks passed" : "Consistency checks FAILED — release blocked"}</div>
                <ul className="space-y-0.5 text-xs">
                  {consistency.checks.map((c) => (
                    <li key={c.name}>
                      {c.passed ? "✓" : "✗"} {c.name}
                      {!c.passed && c.details.map((d) => <div key={d} className="ml-4 text-red-700">{d}</div>)}
                    </li>
                  ))}
                </ul>
              </div>

              {prev && <PackDiff current={snapshot} previous={JSON.parse(prev.snapshotJson) as PackSnapshot} prevVersion={prev.version} />}

              {art.status === "draft" && consistency.passed && (
                <form action={releasePack} className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
                  <input type="hidden" name="artifactId" value={art.id} />
                  <span className="flex-1 text-sm"><span className="font-medium">Reviewer release gate.</span> Mark this exact version ready for review. The version locks; later changes create a new version.</span>
                  <ActorSelect defaultActor="Demo Reviewer" />
                  <Button type="submit" size="sm">Release as ready for review</Button>
                </form>
              )}
            </CardContent>
          </Card>
        );
      })}

      {ready && artifactsDesc.length > 0 && (
        <p className="text-xs text-neutral-400 max-w-3xl">
          Assumption-change demonstration: change an approved assumption in <Link className="underline" href="/model">Model & Decision</Link>, re-run scenarios, then request a new narrative and generate the pack again — a new version appears here with a delta view against the previous version, which remains intact.
        </p>
      )}
    </div>
  );
}

function PackDiff({ current, previous, prevVersion }: { current: PackSnapshot; previous: PackSnapshot; prevVersion: number }) {
  const curOutputs = current.model?.scenarios.find((s) => s.scenario === "base")?.outputs ?? [];
  const prevOutputs = new Map((previous.model?.scenarios.find((s) => s.scenario === "base")?.outputs ?? []).map((o) => [o.outputId, o]));
  const changedOutputs = curOutputs.filter((o) => prevOutputs.get(o.outputId) && prevOutputs.get(o.outputId)!.value !== o.value);
  const prevAssumptions = new Map(previous.assumptions.map((a) => [a.code, a]));
  const changedAssumptions = current.assumptions.filter((a) => prevAssumptions.get(a.code) && prevAssumptions.get(a.code)!.value !== a.value);
  if (!changedOutputs.length && !changedAssumptions.length) return null;
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
      <div className="text-xs font-medium text-amber-900 mb-2">Changes versus v{prevVersion} — every affected number updated consistently across memo, deck and model appendix</div>
      {changedAssumptions.length > 0 && (
        <div className="text-xs mb-2">
          <span className="font-medium">Assumptions changed:</span>{" "}
          {changedAssumptions.map((a) => `${a.code} ${a.name}: ${prevAssumptions.get(a.code)!.value} → ${a.value}`).join(" · ")}
        </div>
      )}
      {changedOutputs.length > 0 && (
        <table className="w-full text-xs">
          <thead><tr className="text-amber-800"><th className="text-left py-1">Output</th><th className="text-right">v{prevVersion}</th><th className="text-right">now</th></tr></thead>
          <tbody>
            {changedOutputs.map((o) => (
              <tr key={o.outputId} className="border-t border-amber-200/60">
                <td className="py-1">{o.label}</td>
                <td className="text-right">{fmt(prevOutputs.get(o.outputId)!.value, o.unit)}</td>
                <td className="text-right font-medium">{fmt(o.value, o.unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function fmt(v: number, unit: string) {
  if (unit === "GBP") return `£${Math.round(v).toLocaleString("en-GB")}`;
  return String(v);
}
