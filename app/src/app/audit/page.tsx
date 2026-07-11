import { getCaseState } from "@/lib/queries";
import { PageHeader, EmptyHint, StateBadge } from "@/components/workbench";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const ACTOR_STYLES: Record<string, string> = {
  human: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ai: "bg-violet-50 text-violet-700 border-violet-200",
  system: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export default async function AuditPage() {
  const state = await getCaseState();
  if (!state) return <EmptyHint>Run <code>npm run demo:reset</code> first.</EmptyHint>;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Audit & Lineage" subtitle="Structured event log: retrievals, AI proposals, human edits, gate approvals, model runs and artifact generation. Content types stay distinct — retrieved fact, client assertion, human assumption, AI inference, calculated result, recommendation." />

      <section className="mb-8">
        <h2 className="text-sm font-medium mb-2">AI proposal register — {state.proposals.length} proposals, none applied without a human decision</h2>
        <div className="space-y-1.5">
          {state.proposals.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs">
              <span className="font-mono text-neutral-400">#{p.id}</span>
              <span className="font-medium">{p.skill}</span>
              <Badge variant="outline" className="font-normal">{p.provider}</Badge>
              <StateBadge state={p.status} />
              {p.decidedBy && <span className="text-neutral-500">decided by {p.decidedBy}</span>}
              <span className="ml-auto text-neutral-400">{new Date(p.createdAt).toLocaleString("en-GB")}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium mb-2">Event log — {state.auditEvents.length} events (newest first)</h2>
        <div className="space-y-1">
          {state.auditEvents.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center gap-2 rounded border border-neutral-100 bg-white px-3 py-1.5 text-xs">
              <span className="text-neutral-400 font-mono w-36 shrink-0">{new Date(e.createdAt).toLocaleString("en-GB")}</span>
              <Badge variant="outline" className={`${ACTOR_STYLES[e.actorType]} font-normal`}>{e.actorType}</Badge>
              <span className="font-medium">{e.actor}</span>
              <span className="text-neutral-600">{e.action.replaceAll("_", " ")}</span>
              {e.objectType && <span className="text-neutral-400">{e.objectType}{e.objectId ? ` #${e.objectId}` : ""}</span>}
              {e.detailJson !== "{}" && <span className="text-neutral-400 font-mono truncate max-w-md">{e.detailJson}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
