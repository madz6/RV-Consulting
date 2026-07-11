# Pricing Strategy Workbench — D0 hackathon demonstrator

The implemented thin slice specified in [`../docs/product/MVP_VALIDATION.md`](../docs/product/MVP_VALIDATION.md):
one synthetic engagement (NordMach Industrial Systems launching the PulseGuard predictive-maintenance
service) taken from ambiguous brief to a **ready-for-review** decision pack, with evidence lineage,
human gates, a deterministic model and linked exports.

**Everything here is synthetic demonstration data.** The terminal state is *ready for review*, never
"client approved". No production security, legal compliance or willingness-to-pay claims are made.

## Run it

```bash
npm install
npm run demo:reset   # create schema + load the synthetic case pack
npm run dev          # http://localhost:3000
```

- **AI mode:** without configuration the app runs in deterministic **fixture mode** (canned, reviewed
  AI proposals — works offline). To use live OpenAI calls, copy `.env.example` to `.env.local` and set
  `OPENAI_API_KEY` (optionally `OPENAI_MODEL`). Live calls flow through the same bounded-skill →
  proposal-store → human-accept path; a live failure falls back to fixtures.
- **Reset the demo:** `npm run demo:reset` restores the untouched case pack at any time.
- **Tests:** `npm test` — deterministic-model unit tests plus an end-to-end flow test that drives every
  gate and asserts the non-negotiable quality gates from MVP_VALIDATION §9 (contradiction retention,
  quarantine exclusion, reproducibility, consistency-gated release, assumption-change propagation).

## Demo walkthrough (the six D0 "must demonstrate" items)

1. **Overview** shows the loop; follow the highlighted next step.
2. **Case & Research → Framing:** review the AI-drafted charter and research questions, approve the
   framing gate (human decision 1 of 3).
3. **Case & Research → Source register:** note the saved-search provenance, the stale 2019 report
   warning, and the **quarantined** competitor discount schedule (competition trigger — unavailable to
   everything downstream).
4. **Case & Research → Evidence review:** review claims (client assertions can only be *qualified*),
   request the AI synthesis — the mid-market vs sales-belief **contradiction is preserved**, not
   averaged away — then record your human conclusion per question.
5. **Strategy Studio:** author your own thesis (blank start), request an **AI branch** (enterprise
   outcome-linked amendment, with its evidence, contrary evidence and gaps declared) and a structured
   challenge, then select one strategy at the shortlist gate (human decision 2 of 3). Rejections are logged.
6. **Model & Decision:** approve the ranged assumptions, create the deterministic model (base/downside/
   upside + sensitivity + the 18-month switching value), validate it, draft the recommendation, request
   the AI counter-case (ownership is blocked until it exists), and take named ownership.
7. **Decision Package:** request the narrative draft (facts must cite `[EV-xx]`, numbers must be
   `{{output-id}}` placeholders), generate the pack, check the consistency report, and release
   **ready for review** (human decision 3 of 3). View the HTML pack (print for PDF) and download the
   real `.xlsx` model workbook (live formulas), `.docx` memo and `.pptx` deck.
8. **Assumption change:** back in Model & Decision, change enterprise adoption (e.g. 0.5 → 0.6),
   re-run scenarios, request a new narrative and regenerate — pack **v2** appears with a delta view;
   the released v1 stays locked.

## Architecture in one paragraph

Canonical objects live in SQLite (Drizzle) — never in chat history. Bounded AI skills
(`src/lib/ai/`) return zod-validated JSON into a **proposal store**; only recorded human actions apply
proposals to canonical state, and every material step lands in the append-only audit log. Financial
arithmetic runs in a pure, versioned, input-hashed TypeScript engine (`src/lib/model/engine.ts`) — the
LLM never calculates. Artifact generation (`src/lib/artifacts/`) freezes a case snapshot, resolves
citations to claim IDs and numbers to model-output IDs, and a consistency checker blocks release on
any unresolved citation, unmodelled number, quarantine leak or missing gate.
