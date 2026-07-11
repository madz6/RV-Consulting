// Small shared presentational helpers used across work areas.

import { Badge } from "@/components/ui/badge";

const STATE_STYLES: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-700 border-neutral-200",
  proposed: "bg-blue-50 text-blue-700 border-blue-200",
  extracted: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  validated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  owned: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ready_for_review: "bg-emerald-100 text-emerald-800 border-emerald-300",
  sufficient: "bg-emerald-50 text-emerald-700 border-emerald-200",
  conditionally_sufficient: "bg-amber-50 text-amber-700 border-amber-200",
  qualified: "bg-amber-50 text-amber-700 border-amber-200",
  insufficient: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  quarantined: "bg-red-100 text-red-800 border-red-300",
  superseded: "bg-neutral-100 text-neutral-400 border-neutral-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StateBadge({ state }: { state: string }) {
  return (
    <Badge variant="outline" className={`${STATE_STYLES[state] ?? "bg-neutral-100 text-neutral-600"} font-normal`}>
      {state.replaceAll("_", " ")}
    </Badge>
  );
}

const TYPE_STYLES: Record<string, string> = {
  retrieved_fact: "bg-sky-50 text-sky-700 border-sky-200",
  client_assertion: "bg-amber-50 text-amber-800 border-amber-200",
  ai_inference: "bg-violet-50 text-violet-700 border-violet-200",
  human: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ai_assisted: "bg-violet-50 text-violet-700 border-violet-200",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={`${TYPE_STYLES[type] ?? "bg-neutral-100 text-neutral-600"} font-normal`}>
      {type.replaceAll("_", " ")}
    </Badge>
  );
}

export function ActorSelect({ defaultActor = "Demo Author" }: { defaultActor?: string }) {
  return (
    <select name="actor" defaultValue={defaultActor} className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs">
      <option value="Demo Author">Demo Author (engagement lead)</option>
      <option value="Demo Reviewer">Demo Reviewer (independent reviewer)</option>
    </select>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-neutral-500 mt-1 max-w-3xl">{subtitle}</p>}
    </header>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">{children}</div>;
}
