import Link from "next/link";
import { getCaseState } from "@/lib/queries";
import { approveAssumptions, updateAssumption, createModelSpecAction, rerunScenarios, validateModel, saveRecommendation, requestCounterCase, acceptCounterCase, rejectProposal, ownRecommendation } from "@/lib/actions";
import { PageHeader, StateBadge, ActorSelect, EmptyHint } from "@/components/workbench";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatOutputValue, type SnapshotOutput } from "@/lib/artifacts/composer";

export const dynamic = "force-dynamic";

export default async function ModelPage() {
  const state = await getCaseState();
  if (!state) return <EmptyHint>Run <code>npm run demo:reset</code> first.</EmptyHint>;
  const selected = state.strategies.find((s) => s.status === "selected");
  if (!selected) {
    return (
      <div className="max-w-4xl">
        <PageHeader title="Model & Decision" subtitle="Deterministic scenarios, sensitivity, recommendation and challenge." />
        <EmptyHint>No strategy has been selected for modelling yet. Complete the <Link className="underline" href="/strategy">Strategy Studio</Link> shortlist gate first.</EmptyHint>
      </div>
    );
  }

  const pendingAssumptions = state.assumptions.filter((a) => a.status === "proposed");
  const spec = state.modelSpecs.find((m) => m.strategyId === selected.id);
  const currentRuns = spec ? state.modelRuns.filter((r) => r.modelSpecId === spec.id && r.status === "current") : [];
  const scenarioRuns = currentRuns.filter((r) => r.scenario !== "sensitivity");
  const analysisRun = currentRuns.find((r) => r.scenario === "sensitivity");
  const analysis = analysisRun ? JSON.parse(analysisRun.outputsJson) as { sensitivity: { assumptionKey: string; atLow: number; atBase: number; atHigh: number }[]; switchingValue: { key: string; predicate: string; value: number | null } } : null;
  const ccProposal = state.proposals.find((p) => p.skill === "recommendation_challenger" && p.status === "proposed");

  return (
    <div className="max-w-5xl">
      <PageHeader title="Model & Decision" subtitle={`Modelling ${selected.code} — ${selected.title}. Financial arithmetic is deterministic; the AI never calculates.`} />

      {/* Assumptions */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Behavioural assumptions (human-owned, ranged)</CardTitle>
          {pendingAssumptions.length > 0 && (
            <form action={approveAssumptions} className="flex items-center gap-2">
              <ActorSelect />
              <Button type="submit" size="sm">Approve all with ranges</Button>
            </form>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {state.assumptions.map((a) => (
            <div key={a.id} className="rounded-md border border-neutral-200 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-neutral-400">{a.code}</span>
                <span className="font-medium">{a.name}</span>
                <StateBadge state={a.status} />
                <Badge variant="outline" className="font-normal">{a.basis.replaceAll("_", " ")}</Badge>
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Value <span className="font-semibold text-neutral-800">{a.value}</span> in [{a.low} – {a.high}] {a.unit} · owner {a.owner}
                {a.linkedClaimId && <> · linked to {state.claims.find((c) => c.id === a.linkedClaimId)?.code}</>}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{a.rationale}</p>
              {a.status === "approved" && (
                <form action={updateAssumption} className="mt-2 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="assumptionId" value={a.id} />
                  <ActorSelect />
                  <Input name="value" type="number" step="0.01" placeholder={`new value (${a.low}–${a.high})`} className="h-8 w-40 text-xs" />
                  <Input name="rationale" placeholder="change rationale" className="h-8 flex-1 min-w-40 text-xs" />
                  <Button type="submit" size="sm" variant="outline">Change value</Button>
                </form>
              )}
            </div>
          ))}
          <p className="text-xs text-neutral-400">Changing an approved assumption is audited and requires a re-run; values outside the stated range are rejected. After re-running, regenerate the decision pack — the previous version is preserved.</p>
        </CardContent>
      </Card>

      {/* Model spec */}
      {!spec && pendingAssumptions.length === 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Configure the deterministic model for {selected.code}</CardTitle></CardHeader>
          <CardContent>
            <form action={createModelSpecAction} className="space-y-3 text-sm">
              <input type="hidden" name="strategyId" value={selected.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1"><span className="text-xs text-neutral-500">Model name</span><Input name="name" defaultValue={`${selected.title} — scenario model`} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Pricing model type (strategy transformation)</span>
                  <select name="modelType" className="h-9 w-full rounded-md border border-neutral-300 bg-white px-2 text-sm" defaultValue="site_subscription">
                    <option value="site_subscription">Site subscription (flat per-site fee by segment)</option>
                    <option value="per_machine">Per connected machine</option>
                    <option value="bundle_uplift">Bundle uplift on new equipment sales</option>
                    <option value="outcome_linked">Base + bounded outcome fee</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="space-y-1"><span className="text-xs text-neutral-500">Enterprise £/site/mo (site model)</span><Input name="priceEnterprise" type="number" defaultValue={2400} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Mid-market £/site/mo</span><Input name="priceMidmarket" type="number" defaultValue={450} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Outcome share (0–1)</span><Input name="outcomeShare" type="number" step="0.01" defaultValue={0.1} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Cap £/machine/yr</span><Input name="cap" type="number" defaultValue={2000} /></label>
              </div>
              <p className="text-xs text-neutral-400">Observed inputs (installed base, costs) come from approved evidence with recorded lineage; behavioural assumptions come from the approved set above. Base, downside and upside scenarios plus sensitivity and the 18-month switching value run automatically.</p>
              <Button type="submit" size="sm">Create model & run scenarios</Button>
            </form>
          </CardContent>
        </Card>
      )}
      {!spec && pendingAssumptions.length > 0 && <EmptyHint>Approve the behavioural assumptions before configuring the model — every assumption needs a named owner and range (PRD P0-12).</EmptyHint>}

      {/* Scenario outputs */}
      {spec && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{spec.name} <StateBadge state={spec.status} /></CardTitle>
            <div className="flex items-center gap-2">
              <form action={rerunScenarios} className="flex items-center gap-2">
                <input type="hidden" name="modelSpecId" value={spec.id} />
                <ActorSelect />
                <Button type="submit" size="sm" variant="outline">Re-run scenarios</Button>
              </form>
              {spec.status !== "validated" && (
                <form action={validateModel} className="flex items-center gap-2">
                  <input type="hidden" name="modelSpecId" value={spec.id} />
                  <Button type="submit" size="sm">Validate model</Button>
                </form>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="text-xs text-neutral-500">
              Engine {scenarioRuns[0]?.engineVersion} · run version {scenarioRuns[0]?.version} · input hashes:{" "}
              {scenarioRuns.map((r) => <span key={r.id} className="font-mono mr-2">{r.scenario}:{r.inputHash.slice(0, 8)}</span>)}
            </div>
            <ScenarioTable runs={scenarioRuns} />
            {analysis && (
              <>
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 mb-2">Sensitivity — cumulative 3-year contribution across assumption ranges</h3>
                  <table className="w-full text-xs border border-neutral-200 rounded-md overflow-hidden">
                    <thead className="bg-neutral-50 text-neutral-500">
                      <tr><th className="p-2 text-left">Assumption</th><th className="p-2 text-right">At low</th><th className="p-2 text-right">Base</th><th className="p-2 text-right">At high</th><th className="p-2 text-right">Swing</th></tr>
                    </thead>
                    <tbody>
                      {analysis.sensitivity.map((s) => (
                        <tr key={s.assumptionKey} className="border-t border-neutral-100">
                          <td className="p-2 font-mono">{s.assumptionKey}</td>
                          <td className="p-2 text-right">£{Math.round(s.atLow).toLocaleString("en-GB")}</td>
                          <td className="p-2 text-right font-medium">£{Math.round(s.atBase).toLocaleString("en-GB")}</td>
                          <td className="p-2 text-right">£{Math.round(s.atHigh).toLocaleString("en-GB")}</td>
                          <td className="p-2 text-right">£{Math.round(s.atHigh - s.atLow).toLocaleString("en-GB")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs">
                  <span className="font-medium">Switching value:</span>{" "}
                  {analysis.switchingValue.value !== null
                    ? <>the model satisfies “{analysis.switchingValue.predicate}” once <span className="font-mono">{analysis.switchingValue.key}</span> reaches <span className="font-semibold">{analysis.switchingValue.value}</span>. Below that, the 18-month cash constraint fails.</>
                    : <>no value of <span className="font-mono">{analysis.switchingValue.key}</span> within its approved range satisfies “{analysis.switchingValue.predicate}” — the constraint cannot be met by adoption alone.</>}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      {spec?.status === "validated" && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Recommendation & challenge {state.recommendation && <StateBadge state={state.recommendation.status} />}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <form action={saveRecommendation} className="space-y-3">
              <label className="block space-y-1"><span className="text-xs text-neutral-500">Decision (conditional recommendation, in your own words)</span>
                <Textarea name="decision" required rows={2} defaultValue={state.recommendation?.decision} placeholder="Recommend… subject to…" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1"><span className="text-xs text-neutral-500">Rationale</span><Textarea name="rationale" rows={3} defaultValue={state.recommendation?.rationale} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Conditions</span><Textarea name="conditions" rows={3} defaultValue={state.recommendation?.conditions} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Risks</span><Textarea name="risks" rows={3} defaultValue={state.recommendation?.risks} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Rejected alternatives & why</span><Textarea name="rejectedAlternatives" rows={3} defaultValue={state.recommendation?.rejectedAlternatives} /></label>
              </div>
              <div className="flex items-center gap-2">
                <ActorSelect />
                <Button type="submit" size="sm" variant="outline">Save draft</Button>
              </div>
            </form>

            {state.recommendation && !state.recommendation.counterCase && !ccProposal && (
              <form action={requestCounterCase}>
                <Button type="submit" size="sm" variant="outline">Request AI counter-case</Button>
                <p className="mt-1 text-xs text-neutral-400">The engagement lead cannot take ownership until a counter-case has been considered (PRD P0-13).</p>
              </form>
            )}

            {ccProposal && (
              <div className="rounded-md border border-violet-300 bg-violet-50/50 p-3 space-y-2">
                <div className="text-xs font-medium text-violet-800">AI counter-case proposal ({ccProposal.provider} mode)</div>
                <p className="text-sm">{(JSON.parse(ccProposal.payloadJson) as { strongestCounterCase: string }).strongestCounterCase}</p>
                <ul className="list-disc pl-5 text-xs text-neutral-600">
                  {(JSON.parse(ccProposal.payloadJson) as { conditionsThatWouldReverse: string[] }).conditionsThatWouldReverse.map((c) => <li key={c}>{c}</li>)}
                </ul>
                <div className="flex items-center gap-2">
                  <form action={acceptCounterCase} className="flex items-center gap-2">
                    <input type="hidden" name="proposalId" value={ccProposal.id} />
                    <ActorSelect />
                    <Button type="submit" size="sm">Record counter-case</Button>
                  </form>
                  <form action={rejectProposal}>
                    <input type="hidden" name="proposalId" value={ccProposal.id} />
                    <Button type="submit" size="sm" variant="outline" className="text-red-700">Reject</Button>
                  </form>
                </div>
              </div>
            )}

            {state.recommendation?.counterCase && (
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs whitespace-pre-wrap">
                <span className="font-medium">Recorded counter-case:</span>{"\n"}{state.recommendation.counterCase}
              </div>
            )}

            {state.recommendation?.counterCase && state.recommendation.status !== "owned" && (
              <form action={ownRecommendation} className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
                <span className="text-sm flex-1"><span className="font-medium">Engagement-lead decision.</span> Take named ownership of this conditional recommendation, having considered the counter-case.</span>
                <ActorSelect />
                <Button type="submit" size="sm">Own recommendation</Button>
              </form>
            )}
            {state.recommendation?.status === "owned" && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
                Recommendation owned by <span className="font-medium">{state.recommendation.owner}</span>. Continue to the <Link href="/package" className="underline">Decision Package</Link>.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScenarioTable({ runs }: { runs: { id: number; scenario: string; outputsJson: string }[] }) {
  const order = ["base", "downside", "upside"];
  const sorted = [...runs].sort((a, b) => order.indexOf(a.scenario) - order.indexOf(b.scenario));
  const first = sorted[0] ? (JSON.parse(sorted[0].outputsJson) as SnapshotOutput[]) : [];
  return (
    <table className="w-full text-xs border border-neutral-200 rounded-md overflow-hidden">
      <thead className="bg-neutral-50 text-neutral-500">
        <tr>
          <th className="p-2 text-left">Output</th>
          {sorted.map((r) => <th key={r.id} className="p-2 text-right capitalize">{r.scenario}</th>)}
        </tr>
      </thead>
      <tbody>
        {first.map((o) => (
          <tr key={o.outputId} className="border-t border-neutral-100">
            <td className="p-2">{o.label} <span className="font-mono text-neutral-300">{o.outputId}</span></td>
            {sorted.map((r) => {
              const out = (JSON.parse(r.outputsJson) as SnapshotOutput[]).find((x) => x.outputId === o.outputId);
              return <td key={r.id} className="p-2 text-right">{out ? formatOutputValue(out) : "—"}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
