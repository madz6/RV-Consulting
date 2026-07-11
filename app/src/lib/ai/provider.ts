// Provider adapter for bounded AI skills. Two modes:
//   fixture (default without OPENAI_API_KEY, or AI_MODE=fixture): canned,
//     deterministic outputs from fixtures/ai/<skill>.json
//   openai (AI_MODE=openai and OPENAI_API_KEY set): live structured-output call
// Both paths validate against the skill's zod schema before anything is stored.

import fs from "fs";
import path from "path";
import { SKILL_SCHEMAS, type SkillName, type SkillOutput } from "./schemas";

const SKILL_RULES: Record<SkillName, string> = {
  evidence_synthesiser:
    "You are the evidence synthesiser for a pricing-strategy engagement. Consolidate the provided evidence claims by research question. You MUST preserve contradictions and gaps — never average disagreement into false confidence, never omit contrary claims, never invent claims that are not in the input. Cite only provided claim codes.",
  strategy_branch:
    "You are the strategy facilitator. Propose ONE branch of the human strategy provided, grounded only in the provided approved evidence and assumptions. Identify the evidence you used, contrary evidence, new assumptions introduced and evidence gaps. You may not select the final strategy, invent willingness-to-pay numbers, or present unsupported ideas as evidence-backed.",
  strategy_challenge:
    "You are the strategy challenger. Produce a structured challenge of the provided strategy from customer, competitor, finance, implementation and regulatory perspectives, citing provided claim codes. Do not soften genuine problems.",
  recommendation_challenger:
    "You are the recommendation challenger. Produce the strongest credible counter-case to the provided recommendation and the conditions that would reverse it, citing provided claim codes only.",
  asset_composer:
    "You are the asset composer. Draft decision-pack narrative from the approved case state provided. Every factual statement must cite an approved claim code in square brackets, e.g. [EV-08]. Every number must be a placeholder referencing a model output id, e.g. {{revenue-y1}} — never write a numeral for a modelled quantity. Do not introduce facts or numbers that are not in the provided state.",
};

export type ProviderName = "openai" | "fixture";

export function activeProvider(): ProviderName {
  if (process.env.AI_MODE === "fixture") return "fixture";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "fixture";
}

async function callOpenAI<S extends SkillName>(skill: S, context: string): Promise<unknown> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI();
  const model = process.env.OPENAI_MODEL ?? "gpt-5.2";
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SKILL_RULES[skill] + "\nRespond with a single JSON object matching the required schema. No prose outside JSON." },
      { role: "user", content: context },
    ],
    response_format: { type: "json_object" },
  });
  const text = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text);
}

function loadFixture(skill: SkillName): unknown {
  const file = path.join(process.cwd(), "fixtures", "ai", `${skill}.json`);
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export interface SkillResult<S extends SkillName> {
  provider: ProviderName;
  output: SkillOutput<S>;
}

export async function runSkill<S extends SkillName>(skill: S, context: string): Promise<SkillResult<S>> {
  const provider = activeProvider();
  let raw: unknown;
  if (provider === "openai") {
    try {
      raw = await callOpenAI(skill, context);
    } catch (err) {
      // Live failure falls back to fixture so the demo never dead-ends;
      // the provider recorded on the proposal stays truthful.
      console.error(`[ai] openai call failed for ${skill}, falling back to fixture:`, err);
      return { provider: "fixture", output: parseOrThrow(skill, loadFixture(skill)) };
    }
    return { provider, output: parseOrThrow(skill, raw) };
  }
  return { provider, output: parseOrThrow(skill, loadFixture(skill)) };
}

function parseOrThrow<S extends SkillName>(skill: S, raw: unknown): SkillOutput<S> {
  const parsed = SKILL_SCHEMAS[skill].safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Skill ${skill} produced output failing its schema: ${parsed.error.message}`);
  }
  return parsed.data as SkillOutput<S>;
}
