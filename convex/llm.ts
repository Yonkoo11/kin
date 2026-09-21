"use node";

import OpenAI from "openai";
import { generateObject, jsonSchema } from "ai";
import { convexGateway } from "@convex-dev/ai-sdk-provider";

// Three ways to reach a model, tried in order, and the product records which one ran.
//
//   1. Convex AI Gateway, serving OpenAI models. Preferred: Convex holds the
//      credentials, so there is no OpenAI key in this deployment at all, and the
//      call is billed on one invoice. Needs a Convex paid plan.
//   2. OpenAI directly, if this deployment holds a key.
//   3. Anthropic, as the declared degraded tier.
//
// OpenAI stays the intended model in tiers 1 and 2. The third exists because the
// first real run of this app died on a billing error with nothing behind it, and a
// fallback that is written down but not built is not a fallback.

export type Extracted = { json: any; producedBy: string };

// The exact gateway id is configurable, because a wrong id should be a one-line
// deployment change rather than a code change. The list is tried in order.
const GATEWAY_MODELS = (process.env.CONVEX_GATEWAY_MODELS ?? "openai/gpt-5,openai/gpt-4o-mini")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

export async function extractJson(
  system: string,
  user: string,
  schemaName: string,
  schema: any,
): Promise<Extracted> {
  const failures: string[] = [];

  // --- 1. Convex AI Gateway, OpenAI models, no key in this deployment ------
  for (const id of GATEWAY_MODELS) {
    try {
      const { object } = await generateObject({
        model: convexGateway(id),
        schema: jsonSchema(schema),
        system,
        prompt: user,
      });
      return { json: object, producedBy: `${id} via Convex AI Gateway` };
    } catch (e: any) {
      failures.push(`gateway ${id}: ${e?.message ?? e}`);
    }
  }

  // --- 2. OpenAI directly --------------------------------------------------
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: schemaName, strict: true, schema },
        },
      });
      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error("empty completion");
      return { json: JSON.parse(raw), producedBy: OPENAI_MODEL };
    } catch (e: any) {
      failures.push(`openai: ${e?.message ?? e}`);
    }
  }

  // --- 3. Declared degraded tier ------------------------------------------
  // Say out loud why the intended path did not run. A silent fallback is how a
  // billing problem looks like a working app for a week.
  console.warn(`[llm] falling back to ${ANTHROPIC_MODEL}. ${failures.join(" | ")}`);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error(`no model available. ${failures.join(" | ")}`);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system:
        system +
        "\n\nReply with a single JSON object matching this schema and nothing else, no prose, no code fence:\n" +
        JSON.stringify(schema),
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`every model failed. ${failures.join(" | ")} | anthropic: HTTP ${res.status}`);

  const body: any = await res.json();
  // Not necessarily content[0]: the response can lead with a non-text block,
  // so take every text block rather than assuming the first one.
  const text: string = (body?.content ?? [])
    .filter((b: any) => typeof b?.text === "string")
    .map((b: any) => b.text)
    .join("\n");

  const obj = bestJsonObject(text, schema);
  if (obj === null) throw new Error("fallback returned no JSON object");
  return { json: obj, producedBy: `${ANTHROPIC_MODEL} (fallback)` };
}

// Pull every complete JSON object out of a reply that may also contain prose, a
// code fence, or a restatement of the schema, then pick the one that actually
// answers. Taking the first object returned an empty shell; taking everything
// between the first "{" and the last "}" failed to parse at all.
function bestJsonObject(text: string, schema: any): any | null {
  const required: string[] = schema?.required ?? Object.keys(schema?.properties ?? {});
  let best: any = null;
  let bestScore = -1;
  for (const c of allJsonObjects(text)) {
    if (c === null || typeof c !== "object" || Array.isArray(c)) continue;
    // Score by how many required fields are present AND carry a real value.
    // A restated schema has the key names but no answers.
    let score = 0;
    for (const k of required) {
      if (!(k in c)) continue;
      score += 1;
      const v = (c as any)[k];
      if (v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

// Counts braces while respecting strings and escapes.
function allJsonObjects(text: string): any[] {
  const found: any[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let j = i; j < text.length; j++) {
      const c = text[j];
      if (escaped) { escaped = false; continue; }
      if (c === "\\" && inString) { escaped = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          try { found.push(JSON.parse(text.slice(i, j + 1))); } catch { /* try the next opening brace */ }
          break;
        }
      }
    }
  }
  return found;
}
