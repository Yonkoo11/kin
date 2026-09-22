import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

// Lives outside research.ts because that file is "use node" for the OpenAI SDK,
// and Convex only allows actions in Node files. Mutations run in the default runtime.

export const save = internalMutation({
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
    droppedFields: v.array(v.string()),
    sourceIsOwnDomain: v.boolean(),
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
      droppedFields: a.droppedFields,
      sourceIsOwnDomain: a.sourceIsOwnDomain,
    });
  },
});

// Everything the letter writer needs, in one read rather than three round trips.
export const forCounterparty = internalQuery({
  args: { counterpartyId: v.id("counterparties") },
  handler: async (ctx, { counterpartyId }) => {
    const counterparty = await ctx.db.get("counterparties", counterpartyId);
    if (!counterparty?.playbookId) return null;
    const playbook = await ctx.db.get("playbooks", counterparty.playbookId);
    const kase = await ctx.db.get("cases", counterparty.caseId);
    if (!playbook || !kase) return null;
    return { playbook, counterparty, deceasedName: kase.deceasedName };
  },
});

// The landing page shows real extractions, not a mockup of one. These two queries are the
// surface for data that previously existed only inside somebody's private case.

// The most recent reading of one organisation, for the panel in the first viewport.
export const latest = query({
  args: { institutionName: v.string() },
  handler: async (ctx, { institutionName }) =>
    await ctx.db
      .query("playbooks")
      .withIndex("by_institutionName", (q) => q.eq("institutionName", institutionName))
      .order("desc")
      .first(),
});

// What real organisations actually accept. One row per organisation, most recent reading.
// This is the finding the whole product rests on, and no competitor can publish it:
// their coverage is a hand-maintained directory, so the contents are the asset.
export const coverage = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("playbooks").order("desc").take(400);
    const seen = new Map<string, any>();
    for (const p of all) {
      const key = p.institutionName.toLowerCase();
      if (seen.has(key)) continue;
      seen.set(key, {
        name: p.institutionName,
        channel: p.channel,
        ownDomain: p.sourceIsOwnDomain ?? null,
        formName: p.formName ?? null,
        sourceUrl: p.sourceUrl,
        scrapedAt: p.scrapedAt,
      });
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  },
});
