"use node";

import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, components, internal } from "./_generated/api";
import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import OpenAI from "openai";

const firecrawl = new FirecrawlClient(components.firecrawl);

// The shape we pull out of an institution's own page. Every field here is a fact that
// a letter needs and that a model would otherwise invent. Wells Fargo's postal address
// carries an internal mail code (D1118-02D) that exists nowhere but on their page.
const PLAYBOOK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "channel",
    "channelNote",
    "postalAddress",
    "overnightAddress",
    "faxNumber",
    "phoneNumber",
    "portalUrl",
    "formName",
    "requiredDocuments",
    "accountTypeNotes",
  ],
  properties: {
    channel: {
      type: "string",
      enum: ["email", "mail", "fax", "phone", "portal", "branch", "unknown"],
      description:
        "The channel this organisation says it accepts for reporting a death. Choose 'email' ONLY if an email address or an explicit statement that email is accepted appears on the page. Most large banks do not accept email; do not assume they do.",
    },
    channelNote: {
      type: ["string", "null"],
      description: "One sentence quoting or closely paraphrasing how the page says to contact them.",
    },
    postalAddress: {
      type: ["string", "null"],
      description:
        "The full postal address exactly as printed, including any internal mail code, department code or 'Attention:' line. Do not normalise or tidy it.",
    },
    overnightAddress: { type: ["string", "null"] },
    faxNumber: { type: ["string", "null"] },
    phoneNumber: { type: ["string", "null"] },
    portalUrl: { type: ["string", "null"] },
    formName: {
      type: ["string", "null"],
      description: "The name of any specific form the page names, e.g. 'Letter of Instruction'.",
    },
    requiredDocuments: {
      type: "array",
      items: { type: "string" },
      description: "Each document the page says is required, in the page's own words.",
    },
    accountTypeNotes: {
      type: ["string", "null"],
      description:
        "How requirements differ by account type (sole-owned, payable-on-death, joint, trust), if stated.",
    },
  },
} as const;

export const researchInstitution = action({
  args: { counterpartyId: v.id("counterparties"), name: v.string() },
  handler: async (ctx, { counterpartyId, name }) => {
    // 1. Find their page. No hardcoded URLs: four of nine hand-built institution URLs
    //    returned 404 on 2026-09-19, and two more returned 403 to a plain request.
    const found = await firecrawl.search(ctx, {
      query: `${name} report a death deceased account estate required documents`,
      limit: 5,
    });

    const results: Array<{ url?: string; title?: string }> = (found as any)?.web ?? (found as any)?.data ?? [];
    const candidate = results.find((r) => !!r.url);

    if (!candidate?.url) {
      await ctx.runMutation(api.cases.markFailed, {
        counterpartyId,
        reason: "no page found in search",
      });
      return null;
    }

    // 2. Read it.
    let markdown = "";
    try {
      const page = await firecrawl.scrape(ctx, candidate.url, { formats: ["markdown"] });
      markdown = (page as any)?.markdown ?? "";
    } catch (e) {
      await ctx.runMutation(api.cases.markFailed, {
        counterpartyId,
        reason: `scrape failed for ${candidate.url}`,
      });
      return null;
    }

    if (markdown.trim().length < 200) {
      await ctx.runMutation(api.cases.markFailed, {
        counterpartyId,
        reason: `page at ${candidate.url} returned almost no text`,
      });
      return null;
    }

    // 3. Pull the facts out. Structured output, not free text, so a missing field is
    //    visibly null rather than quietly invented.
    const model = "gpt-5";
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You extract what an organisation requires when reporting a customer's death. Use ONLY the page text given. If the page does not state something, return null for it. Never infer an address, a fax number or a form name. Copy addresses character for character, including internal mail codes.",
        },
        { role: "user", content: `Organisation: ${name}\nSource: ${candidate.url}\n\n${markdown.slice(0, 60000)}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "institution_playbook", strict: true, schema: PLAYBOOK_SCHEMA as any },
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      await ctx.runMutation(api.cases.markFailed, { counterpartyId, reason: "extraction returned nothing" });
      return null;
    }
    const parsed = JSON.parse(raw);

    const playbookId: any = await ctx.runMutation(internal.research.savePlaybook, {
      institutionName: name,
      sourceUrl: candidate.url,
      extractedBy: model,
      ...parsed,
    });

    await ctx.runMutation(api.cases.attachPlaybook, { counterpartyId, playbookId });
    return playbookId;
  },
});

export const savePlaybook = internalMutation({
  args: {
    institutionName: v.string(),
    sourceUrl: v.string(),
    extractedBy: v.string(),
    channel: v.string(),
    channelNote: v.union(v.string(), v.null()),
    postalAddress: v.union(v.string(), v.null()),
    overnightAddress: v.union(v.string(), v.null()),
    faxNumber: v.union(v.string(), v.null()),
    phoneNumber: v.union(v.string(), v.null()),
    portalUrl: v.union(v.string(), v.null()),
    formName: v.union(v.string(), v.null()),
    requiredDocuments: v.array(v.string()),
    accountTypeNotes: v.union(v.string(), v.null()),
  },
  handler: async (ctx, a) => {
    const nn = (s: string | null) => (s === null ? undefined : s);
    return await ctx.db.insert("playbooks", {
      institutionName: a.institutionName,
      sourceUrl: a.sourceUrl,
      scrapedAt: Date.now(),
      channel: a.channel as any,
      channelNote: nn(a.channelNote),
      postalAddress: nn(a.postalAddress),
      overnightAddress: nn(a.overnightAddress),
      faxNumber: nn(a.faxNumber),
      phoneNumber: nn(a.phoneNumber),
      portalUrl: nn(a.portalUrl),
      formName: nn(a.formName),
      requiredDocuments: a.requiredDocuments,
      accountTypeNotes: nn(a.accountTypeNotes),
      extractedBy: a.extractedBy,
    });
  },
});
