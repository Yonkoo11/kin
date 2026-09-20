"use node";

import OpenAI from "openai";

// ACCESS.md declares a fallback tier for every outside dependency: something that still
// runs, still demos, and says out loud that it is degraded. This is that tier for the
// model call, and it exists because the first real run died on an OpenAI billing error
// with nothing to fall back to.
//
// OpenAI is primary and stays primary: this hackathon scores whether OpenAI does real
// work in the product. Anthropic is the degraded tier. Every artifact records which one
// actually ran, so nothing can quietly claim OpenAI did work that OpenAI did not do.

export type Extracted = { json: any; producedBy: string };

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

export async function extractJson(
  system: string,
  user: string,
  schemaName: string,
  schema: unknown,
): Promise<Extracted> {
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
        json_schema: { name: schemaName, strict: true, schema: schema as any },
      },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("empty completion");
    return { json: JSON.parse(raw), producedBy: OPENAI_MODEL };
  } catch (err: any) {
    // A silent fallback hides the reason the primary failed, which is how a billing
    // problem can look like a working app for a week. Say it out loud, every time.
    console.warn(`[llm] OpenAI call failed, falling back. Reason: ${err?.message ?? err}`);
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw err;

    // Degraded tier. Named in the return value, shown in the interface.
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
    if (!res.ok) {
      throw new Error(`both models failed. openai: ${err.message}; anthropic: HTTP ${res.status}`);
    }
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
}

// Pull every complete JSON object out of a reply that may also contain prose, a
// code fence, or a restatement of the schema, then pick the one that actually
// answers. Taking the first object returned an empty shell; taking everything
// between the first "{" and the last "}" failed to parse at all.
function bestJsonObject(text: string, schema: any): any | null {
  const required: string[] = schema?.required ?? Object.keys(schema?.properties ?? {});
  const candidates = allJsonObjects(text);
  let best: any = null;
  let bestScore = -1;
  for (const c of candidates) {
    if (c === null || typeof c !== "object" || Array.isArray(c)) continue;
    // Score by how many required fields are present AND carry a real value.
    // A restated schema has the key names but no answers.
    let score = 0;
    for (const k of required) {
      if (!(k in c)) continue;
      score += 1;
      const v = (c as any)[k];
      if (v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)) {
        score += 1;
      }
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
      if (escaped) {
        escaped = false;
        continue;
      }
      if (c === "\\" && inString) {
        escaped = true;
        continue;
      }
      if (c === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          try {
            found.push(JSON.parse(text.slice(i, j + 1)));
          } catch {
            // not valid; fall through and try the next opening brace
          }
          break;
        }
      }
    }
  }
  return found;
}
