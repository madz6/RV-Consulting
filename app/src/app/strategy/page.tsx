import Link from "next/link";
import { getCaseState, gateStatus } from "@/lib/queries";
import { createStrategy, requestBranch, acceptBranch, requestChallenge, acceptChallenge, rejectProposal, selectStrategy } from "@/lib/actions";
import { PageHeader, StateBadge, TypeBadge, ActorSelect, EmptyHint } from "@/components/workbench";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function StrategyPage() {
  const state = await getCaseState();
  if (!state) return <EmptyHint>Run <code>npm run demo:reset</code> first.</EmptyHint>;
  const g = gateStatus(state);
  if (!g.evidenceReviewed) {
    return (
      <div className="max-w-4xl">
        <PageHeader title="Strategy Studio" subtitle="Human-led strategy creation with AI branch and challenge." />
        <EmptyHint>
          The evidence-sufficiency gate is not complete. Review claims, accept the synthesis and conclude every research question in{" "}
          <Link className="underline" href="/case?tab=evidence">Evidence review</Link> before strategy work. Exploratory hypotheses are allowed earlier, but this demonstrator follows the governed path.
        </EmptyHint>
      </div>
    );
  }

  const branchProposal = state.proposals.find((p) => p.skill === "strategy_branch" && p.status === "proposed");
  const challengeProposal = state.proposals.find((p) => p.skill === "strategy_challenge" && p.status === "proposed");
  const selected = state.strategies.find((s) => s.status === "selected");

  return (
    <div className="max-w-5xl">
      <PageHeader title="Strategy Studio" subtitle="Thesis first: write strategy in your own words, link it to evidence, then use AI to branch and challenge — never to decide." />

      <div className="space-y-4">
        {state.strategies.map((s) => {
          const links = state.strategyLinks.filter((l) => l.strategyId === s.id);
          const design = JSON.parse(s.designJson) as Record<string, unknown>;
          const challenge = s.challengeJson ? JSON.parse(s.challengeJson) as { perspectives: { perspective: string; challenge: string; evidenceCodes: string[] }[]; missingTests: string[] } : null;
          return (
            <Card key={s.id} className={s.status === "selected" ? "border-emerald-300" : s.status === "rejected" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">{s.code}</span>
                  {s.title}
                  <TypeBadge type={s.authorship} />
                  <StateBadge state={s.status} />
                  {s.parentStrategyId && <Badge variant="outline" className="font-normal">branch of {state.strategies.find((x) => x.id === s.parentStrategyId)?.code}</Badge>}
                </CardTitle>
                <p className="text-xs text-neutral-400">{s.originNote}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="leading-relaxed">{s.thesis}</p>
                <div className="grid gap-2 sm:grid-cols-2 text-xs text-neutral-600">
                  {Object.entries(design).filter(([, v]) => v && String(v).length).map(([k, v]) => (
                    <div key={k}><span className="font-medium text-neutral-500">{k.replace(/([A-Z])/g, " $1").toLowerCase()}:</span> {Array.isArray(v) ? v.join("; ") : String(v)}</div>
                  ))}
                </div>
                {s.causalChain && <p className="text-xs text-neutral-500"><span className="font-medium">Causal chain:</span> {s.causalChain}</p>}
                {s.failureModes && <p className="text-xs text-neutral-500"><span className="font-medium">Failure modes:</span> {s.failureModes}</p>}
                {s.smallestTest && <p className="text-xs text-neutral-500"><span className="font-medium">Smallest credible test:</span> {s.smallestTest}</p>}

                {links.length > 0 && (
                  <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 space-y-1">
                    <div className="text-xs font-medium text-neutral-500 mb-1">Evidence & assumption links</div>
                    {links.map((l) => {
                      const claim = state.claims.find((c) => c.id === l.claimId);
                      const color = l.kind === "supporting" ? "text-emerald-700" : l.kind === "contrary" ? "text-red-700" : "text-amber-700";
                      return (
                        <div key={l.id} className="text-xs">
                          <span className={`font-medium ${color}`}>{l.kind}</span>{" "}
                          {claim ? <><span className="font-mono">{claim.code}</span> — {claim.proposition}</> : l.note}
                          {claim && l.note && <span className="text-neutral-400"> ({l.note})</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {challenge && (
                  <details className="rounded-md border border-violet-200 bg-violet-50/50 p-3" open>
                    <summary className="cursor-pointer text-xs font-medium text-violet-800">Structured challenge (AI, accepted onto record)</summary>
                    <div className="mt-2 space-y-2">
                      {challenge.perspectives.map((p) => (
                        <p key={p.perspective} className="text-xs"><span className="font-semibold capitalize">{p.perspective}:</span> {p.challenge} <span className="text-neutral-400">[{p.evidenceCodes.join(", ")}]</span></p>
                      ))}
                      <p className="text-xs"><span className="font-semibold">Missing tests:</span> {challenge.missingTests.join(" · ")}</p>
                    </div>
                  </details>
                )}

                {s.status === "rejected" && <p className="text-xs text-red-700">Rejected: {s.rejectionReason}</p>}

                {s.status === "draft" && !selected && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-100">
                    {!branchProposal && !state.strategies.some((x) => x.parentStrategyId === s.id) && (
                      <form action={requestBranch}>
                        <input type="hidden" name="strategyId" value={s.id} />
                        <Button type="submit" size="sm" variant="outline">Request AI branch</Button>
                      </form>
                    )}
                    {!challengeProposal && !s.challengeJson && (
                      <form action={requestChallenge}>
                        <input type="hidden" name="strategyId" value={s.id} />
                        <Button type="submit" size="sm" variant="outline">Request structured challenge</Button>
                      </form>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {branchProposal && <BranchProposalCard proposal={branchProposal} />}
      {challengeProposal && <ChallengeProposalCard proposal={challengeProposal} strategies={state.strategies} />}

      {!selected && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Author a new strategy (blank start — human-owned)</CardTitle></CardHeader>
          <CardContent>
            <form action={createStrategy} className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1"><span className="text-xs text-neutral-500">Title</span><Input name="title" required placeholder="e.g. Segmented site subscription" /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Acting as</span><div><ActorSelect /></div></label>
              </div>
              <label className="block space-y-1"><span className="text-xs text-neutral-500">Strategic thesis (your own words — required before structure)</span>
                <Textarea name="thesis" required rows={3} placeholder="What do you believe, why does it create and capture value, and why does it fit this context?" /></label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1"><span className="text-xs text-neutral-500">Target segments</span><Input name="targetSegments" placeholder="enterprise, midmarket" /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Price metric</span><Input name="priceMetric" placeholder="per site / per machine / outcome" /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Pricing model</span><Input name="pricingModel" placeholder="flat subscription, base + outcome fee…" /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Offer & package</span><Input name="offerAndPackage" /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Price architecture</span><Input name="priceArchitecture" placeholder="levels, caps, floors, fences" /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Migration</span><Input name="migration" placeholder="installed base first? renewals?" /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1"><span className="text-xs text-neutral-500">Causal chain</span><Textarea name="causalChain" rows={2} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Failure modes</span><Textarea name="failureModes" rows={2} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Required conditions</span><Textarea name="requiredConditions" rows={2} /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Smallest credible test</span><Textarea name="smallestTest" rows={2} /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1"><span className="text-xs text-neutral-500">Supporting evidence (claim codes, comma-separated)</span><Input name="supportingCodes" placeholder="EV-19, EV-21, EV-13" /></label>
                <label className="space-y-1"><span className="text-xs text-neutral-500">Contrary evidence (claim codes)</span><Input name="contraryCodes" placeholder="EV-22" /></label>
              </div>
              <Button type="submit" size="sm">Create strategy</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!selected && state.strategies.filter((s) => s.status === "draft").length >= 2 && (
        <Card className="mt-6 border-blue-200 bg-blue-50/50">
          <CardHeader><CardTitle className="text-base">Shortlist gate — select one strategy for modelling</CardTitle></CardHeader>
          <CardContent>
            <form action={selectStrategy} className="flex flex-wrap items-center gap-2 text-sm">
              <select name="strategyId" className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm">
                {state.strategies.filter((s) => s.status === "draft").map((s) => (
                  <option key={s.id} value={s.id}>{s.code} — {s.title}</option>
                ))}
              </select>
              <Input name="rationale" required placeholder="Selection rationale (recorded in the decision log)" className="flex-1 min-w-64" />
              <ActorSelect />
              <Button type="submit" size="sm">Select for modelling</Button>
            </form>
            <p className="mt-2 text-xs text-neutral-500">The system cannot designate a preferred strategy — this is an authorised human action (PRD P0-11). Non-selected strategies move to the rejection log with your rationale.</p>
          </CardContent>
        </Card>
      )}

      {selected && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <span className="font-medium">{selected.code} — {selected.title}</span> selected for modelling. Continue to <Link href="/model" className="underline">Model & Decision</Link>.
        </div>
      )}
    </div>
  );
}

function BranchProposalCard({ proposal }: { proposal: { id: number; provider: string; payloadJson: string } }) {
  const b = JSON.parse(proposal.payloadJson) as {
    title: string; thesis: string; causalChain: string; failureModes: string; smallestTest: string;
    evidenceUsed: { claimCode: string; how: string }[]; contraryEvidence: { claimCode: string; why: string }[];
    assumptionsIntroduced: string[]; evidenceGaps: string[];
  };
  return (
    <Card className="mt-6 border-violet-300">
      <CardHeader>
        <CardTitle className="text-base">AI-proposed branch ({proposal.provider} mode) <StateBadge state="proposed" /></CardTitle>
        <p className="text-xs text-neutral-500">Proposal only — becomes a strategy branch when a human adopts it; adoption is recorded as AI-assisted authorship.</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-medium">{b.title}</p>
        <p>{b.thesis}</p>
        <p className="text-xs text-neutral-500"><span className="font-medium">Causal chain:</span> {b.causalChain}</p>
        <p className="text-xs text-neutral-500"><span className="font-medium">Failure modes:</span> {b.failureModes}</p>
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs space-y-1">
          <div><span className="font-medium text-emerald-700">Evidence used:</span> {b.evidenceUsed.map((e) => `${e.claimCode} (${e.how})`).join(" · ")}</div>
          <div><span className="font-medium text-red-700">Contrary evidence acknowledged:</span> {b.contraryEvidence.map((e) => `${e.claimCode} (${e.why})`).join(" · ")}</div>
          <div><span className="font-medium text-amber-700">New assumptions introduced:</span> {b.assumptionsIntroduced.join(" · ")}</div>
          <div><span className="font-medium text-amber-700">Evidence gaps:</span> {b.evidenceGaps.join(" · ")}</div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <form action={acceptBranch} className="flex items-center gap-2">
            <input type="hidden" name="proposalId" value={proposal.id} />
            <ActorSelect />
            <Button type="submit" size="sm">Adopt as branch</Button>
          </form>
          <form action={rejectProposal}>
            <input type="hidden" name="proposalId" value={proposal.id} />
            <Button type="submit" size="sm" variant="outline" className="text-red-700">Reject</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function ChallengeProposalCard({ proposal, strategies }: { proposal: { id: number; provider: string; payloadJson: string; targetId: number | null }; strategies: { id: number; code: string }[] }) {
  const c = JSON.parse(proposal.payloadJson) as { perspectives: { perspective: string; challenge: string; evidenceCodes: string[] }[]; missingTests: string[] };
  const target = strategies.find((s) => s.id === proposal.targetId);
  return (
    <Card className="mt-6 border-violet-300">
      <CardHeader>
        <CardTitle className="text-base">AI structured challenge of {target?.code} ({proposal.provider} mode) <StateBadge state="proposed" /></CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {c.perspectives.map((p) => (
          <p key={p.perspective} className="text-sm"><span className="font-semibold capitalize">{p.perspective}:</span> {p.challenge} <span className="text-xs text-neutral-400">[{p.evidenceCodes.join(", ")}]</span></p>
        ))}
        <p className="text-xs text-neutral-500"><span className="font-medium">Missing tests:</span> {c.missingTests.join(" · ")}</p>
        <div className="flex items-center gap-2 pt-2">
          <form action={acceptChallenge} className="flex items-center gap-2">
            <input type="hidden" name="proposalId" value={proposal.id} />
            <ActorSelect />
            <Button type="submit" size="sm">Record challenge against strategy</Button>
          </form>
          <form action={rejectProposal}>
            <input type="hidden" name="proposalId" value={proposal.id} />
            <Button type="submit" size="sm" variant="outline" className="text-red-700">Reject</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
