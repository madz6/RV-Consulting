import Link from "next/link";
import { getCaseState } from "@/lib/queries";
import { approveFraming, reviewClaim, reviewAllRemainingClaims, proposeSyntheses, acceptSyntheses, rejectProposal, concludeQuestion } from "@/lib/actions";
import { PageHeader, StateBadge, TypeBadge, ActorSelect, EmptyHint } from "@/components/workbench";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "framing", label: "Framing" },
  { key: "sources", label: "Source register" },
  { key: "evidence", label: "Evidence review" },
] as const;

export default async function CasePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab = TABS.some((t) => t.key === rawTab) ? rawTab! : "framing";
  const state = await getCaseState();
  if (!state) return <EmptyHint>Run <code>npm run demo:reset</code> first.</EmptyHint>;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Case & Research" subtitle="Decision framing, research plan, source register and human evidence review." />
      <nav className="mb-6 flex gap-1 border-b border-neutral-200">
        {TABS.map((t) => (
          <Link key={t.key} href={`/case?tab=${t.key}`} className={`px-4 py-2 text-sm border-b-2 -mb-px ${tab === t.key ? "border-neutral-900 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "framing" && <FramingTab state={state} />}
      {tab === "sources" && <SourcesTab state={state} />}
      {tab === "evidence" && <EvidenceTab state={state} />}
    </div>
  );
}

type S = NonNullable<Awaited<ReturnType<typeof getCaseState>>>;

function FramingTab({ state }: { state: S }) {
  const charter = state.charter;
  const context = state.context ? (JSON.parse(state.context.fieldsJson) as Record<string, string>) : {};
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Decision charter <span className="ml-2 align-middle"><StateBadge state={charter?.status ?? "missing"} /></span></CardTitle>
          <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-normal">drafted by AI brief-interpreter — proposed until approved</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {charter && (
            <>
              <Field label="Decision">{charter.decision}</Field>
              <Field label="Objective">{charter.objective}</Field>
              <Field label="Scope">{charter.scope}</Field>
              <Field label="Exclusions">{charter.exclusions}</Field>
              <Field label="Hard constraints">
                <ul className="list-disc pl-5 space-y-1">{(JSON.parse(charter.constraintsJson) as string[]).map((c) => <li key={c}>{c}</li>)}</ul>
              </Field>
              <Field label="Risk tolerance">{charter.riskTolerance}</Field>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Context profile</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          {Object.entries(context).map(([k, v]) => (
            <Field key={k} label={k.replace(/([A-Z])/g, " $1").toLowerCase()}>{v}</Field>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Research questions (proposed by AI research-planner)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {state.researchQuestions.map((q) => (
            <div key={q.id} className="rounded-md border border-neutral-200 p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-neutral-400">{q.code}</span>
                <StateBadge state={q.status} />
                <Badge variant="outline" className="font-normal text-neutral-500">{q.priority} priority</Badge>
              </div>
              <div className="font-medium">{q.question}</div>
              <div className="text-xs text-neutral-500 mt-1">Decision link: {q.decisionLink}</div>
              <div className="text-xs text-neutral-500">Hypothesis: {q.hypothesis} · Sufficiency: {q.sufficiencyRule}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {charter?.status === "draft" ? (
        <form action={approveFraming} className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm flex-1">
            <span className="font-medium">Human framing gate.</span>{" "}
            Approving locks this charter version, approves the research direction and authorises evidence work. Retrieval cannot begin before this gate (PRD P0-02/03).
          </div>
          <ActorSelect />
          <Button type="submit" size="sm">Approve framing</Button>
        </form>
      ) : (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
          Framing approved by <span className="font-medium">{charter?.approvedBy}</span> — research direction authorised. Continue to the <Link href="/case?tab=sources" className="underline">source register</Link>.
        </div>
      )}
    </div>
  );
}

function SourcesTab({ state }: { state: S }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 max-w-3xl">
        Uploaded case-pack files plus saved results from an approved search capability, each with provenance. Building general web-retrieval infrastructure is outside D0 scope; saved search results carry query, URL, publication and retrieval dates.
      </p>
      {state.sources.map((s) => (
        <Card key={s.id} className={s.status === "quarantined" ? "border-red-300 bg-red-50/50" : ""}>
          <CardContent className="pt-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-neutral-400">{s.code}</span>
              <span className="font-medium">{s.title}</span>
              <StateBadge state={s.status} />
              <Badge variant="outline" className="font-normal">{s.kind.replaceAll("_", " ")}</Badge>
              <Badge variant="outline" className="font-normal">tier {s.sourceClass}</Badge>
              <Badge variant="outline" className="font-normal">{s.confidentiality.replaceAll("_", " ")}</Badge>
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Origin: {s.origin}
              {s.url && <> · <span className="font-mono">{s.url}</span></>}
              {s.publishedDate && <> · published {s.publishedDate}</>}
              {s.retrievedAt && <> · retrieved {s.retrievedAt}</>}
              {s.searchQuery && <> · query “{s.searchQuery}”</>}
            </div>
            {s.status === "quarantined" && (
              <div className="mt-2 rounded-md border border-red-300 bg-red-100 p-3 text-xs text-red-900">
                <span className="font-semibold">Quarantined — competition-sensitive.</span> {s.quarantineReason} No claims were extracted; this source is unavailable to synthesis, strategy and recommendation. Ordinary user attestation cannot clear it.
              </div>
            )}
            {s.seededIssue === "stale" && (
              <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
                Freshness warning: published {s.publishedDate} — treat as stale unless corroborated.
              </div>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-600">View content</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded bg-neutral-50 border border-neutral-200 p-3 text-xs text-neutral-700 max-h-64 overflow-y-auto">{s.content}</pre>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EvidenceTab({ state }: { state: S }) {
  const framingApproved = state.charter?.status === "approved";
  const pendingClaims = state.claims.filter((c) => c.state === "extracted");
  const synthProposal = state.proposals.find((p) => p.skill === "evidence_synthesiser" && p.status === "proposed");
  const synthAccepted = state.syntheses.some((s) => s.status === "approved");
  const claimByCode = new Map(state.claims.map((c) => [c.id, c]));

  if (!framingApproved) return <EmptyHint>The framing gate must be approved before evidence review begins. Go to the <Link className="underline" href="/case">Framing tab</Link>.</EmptyHint>;

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Claim review — {pendingClaims.length} of {state.claims.length} awaiting review</h2>
          {pendingClaims.length > 0 && (
            <form action={reviewAllRemainingClaims} className="flex items-center gap-2">
              <ActorSelect />
              <Button type="submit" size="sm" variant="outline">Bulk-review remaining (assertions → qualified)</Button>
            </form>
          )}
        </div>
        <div className="space-y-2">
          {state.claims.map((c) => {
            const src = state.sources.find((s) => s.id === c.sourceId);
            const relations = state.claimRelations.filter((r) => r.claimId === c.id || r.relatedClaimId === c.id);
            return (
              <div key={c.id} className="rounded-md border border-neutral-200 bg-white p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">{c.code}</span>
                  <TypeBadge type={c.contentType} />
                  <StateBadge state={c.state} />
                  <span className="text-xs text-neutral-400">from {src?.code} · {c.location}</span>
                </div>
                <p className="mt-1">{c.proposition}</p>
                <p className="mt-1 text-xs text-neutral-500 italic">“{c.excerpt}”</p>
                <p className="mt-1 text-xs text-neutral-500">Reliability: {c.reliabilityNote} · Applicability: {c.applicabilityNote}</p>
                {relations.map((r) => {
                  const other = claimByCode.get(r.claimId === c.id ? r.relatedClaimId : r.claimId);
                  const label = r.claimId === c.id ? r.relation : `${r.relation} (inverse)`;
                  return (
                    <div key={r.id} className={`mt-1.5 rounded px-2 py-1 text-xs border ${r.relation === "contradicts" ? "bg-red-50 border-red-200 text-red-800" : "bg-neutral-50 border-neutral-200 text-neutral-600"}`}>
                      <span className="font-medium">{label}</span> {other?.code}: {r.note}
                    </div>
                  );
                })}
                {c.state === "extracted" && (
                  <form action={reviewClaim} className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="claimId" value={c.id} />
                    <ActorSelect />
                    <input name="note" placeholder="review note (optional)" className="h-8 flex-1 min-w-40 rounded-md border border-neutral-300 px-2 text-xs" />
                    <Button type="submit" name="action" value="approve" size="sm" variant="outline" className="text-emerald-700">Approve</Button>
                    <Button type="submit" name="action" value="qualify" size="sm" variant="outline" className="text-amber-700">Qualify</Button>
                    <Button type="submit" name="action" value="reject" size="sm" variant="outline" className="text-red-700">Reject</Button>
                  </form>
                )}
                {c.reviewNote && <p className="mt-1 text-xs text-neutral-400">Review note ({c.reviewer}): {c.reviewNote}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium mb-3">Question-led evidence synthesis</h2>
        {!synthAccepted && !synthProposal && (
          <form action={proposeSyntheses}>
            <Button type="submit" size="sm" disabled={pendingClaims.length > 0}>
              Request AI synthesis by research question
            </Button>
            {pendingClaims.length > 0 && <p className="mt-1 text-xs text-neutral-400">Review all claims first — synthesis consolidates reviewed evidence.</p>}
          </form>
        )}
        {synthProposal && (
          <Card className="border-violet-200">
            <CardHeader><CardTitle className="text-sm">AI proposal — evidence synthesis ({synthProposal.provider} mode) <StateBadge state="proposed" /></CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              {(JSON.parse(synthProposal.payloadJson).syntheses as { researchQuestionCode: string; supportingSummary: string; contrarySummary: string; limitations: string; gaps: string }[]).map((s) => (
                <div key={s.researchQuestionCode} className="rounded-md border border-neutral-200 p-3">
                  <div className="font-mono text-xs text-neutral-400 mb-1">{s.researchQuestionCode}</div>
                  <p><span className="font-medium text-emerald-700">Supporting:</span> {s.supportingSummary}</p>
                  <p className="mt-1"><span className="font-medium text-red-700">Contrary:</span> {s.contrarySummary}</p>
                  <p className="mt-1 text-xs text-neutral-500"><span className="font-medium">Limitations:</span> {s.limitations}</p>
                  <p className="text-xs text-neutral-500"><span className="font-medium">Gaps:</span> {s.gaps}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <form action={acceptSyntheses} className="flex items-center gap-2">
                  <input type="hidden" name="proposalId" value={synthProposal.id} />
                  <ActorSelect />
                  <Button type="submit" size="sm">Accept syntheses</Button>
                </form>
                <form action={rejectProposal}>
                  <input type="hidden" name="proposalId" value={synthProposal.id} />
                  <Button type="submit" size="sm" variant="outline" className="text-red-700">Reject</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}
        {synthAccepted && (
          <div className="space-y-4">
            {state.researchQuestions.map((q) => {
              const syn = state.syntheses.find((s) => s.researchQuestionId === q.id && s.status === "approved");
              if (!syn) return null;
              return (
                <Card key={q.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="font-mono text-xs text-neutral-400">{q.code}</span> {q.question} <StateBadge state={q.status} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="font-medium text-emerald-700">Supporting:</span> {syn.supportingSummary}</p>
                    <p><span className="font-medium text-red-700">Contrary:</span> {syn.contrarySummary}</p>
                    <p className="text-xs text-neutral-500"><span className="font-medium">Limitations:</span> {syn.limitations} · <span className="font-medium">Gaps:</span> {syn.gaps}</p>
                    {q.humanConclusion ? (
                      <p className="rounded-md bg-emerald-50 border border-emerald-200 p-2 text-xs"><span className="font-medium">Human conclusion ({q.reviewer}):</span> {q.humanConclusion}</p>
                    ) : (
                      <form action={concludeQuestion} className="flex flex-wrap items-center gap-2 pt-1">
                        <input type="hidden" name="rqId" value={q.id} />
                        <ActorSelect />
                        <input name="conclusion" required placeholder="Your conclusion for this question…" className="h-8 flex-1 min-w-64 rounded-md border border-neutral-300 px-2 text-xs" />
                        <select name="status" className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs">
                          <option value="sufficient">sufficient</option>
                          <option value="conditionally_sufficient">conditionally sufficient</option>
                          <option value="insufficient">insufficient</option>
                        </select>
                        <Button type="submit" size="sm" variant="outline">Conclude</Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-0.5 leading-relaxed">{children}</div>
    </div>
  );
}
