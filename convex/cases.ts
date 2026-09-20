import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// A short, human-readable routing token. AgentMail has no plus-addressing or catch-all
// (confirmed against agent.email/skill.md and docs.agentmail.to, 2026-09-20), so inbound
// mail is matched by thread id first and by this token in the subject as a fallback.
function newToken(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export const createCase = mutation({
  args: { deceasedName: v.string(), demo: v.optional(v.boolean()) },
  handler: async (ctx, { deceasedName, demo }) => {
    return await ctx.db.insert("cases", {
      deceasedName,
      token: newToken(),
      demo: demo ?? false,
    });
  },
});

export const getCase = query({
  args: { caseId: v.id("cases") },
  handler: (ctx, { caseId }) => ctx.db.get(caseId),
});

// The case board. This is the reactive query the whole family watches: when a reply
// lands, every open browser moves without anyone refreshing.
export const board = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, { caseId }) => {
    const counterparties = await ctx.db
      .query("counterparties")
      .withIndex("by_case", (q) => q.eq("caseId", caseId))
      .collect();

    return await Promise.all(
      counterparties.map(async (c) => ({
        ...c,
        playbook: c.playbookId ? await ctx.db.get(c.playbookId) : null,
      })),
    );
  },
});

export const addCounterparty = mutation({
  args: { caseId: v.id("cases"), name: v.string() },
  handler: async (ctx, { caseId, name }) => {
    const id = await ctx.db.insert("counterparties", {
      caseId,
      name,
      state: "researching",
    });
    // Discovery is an action because it talks to Firecrawl and OpenAI.
    await ctx.scheduler.runAfter(0, api.research.researchInstitution, {
      counterpartyId: id,
      name,
    });
    return id;
  },
});

export const attachPlaybook = mutation({
  args: { counterpartyId: v.id("counterparties"), playbookId: v.id("playbooks") },
  handler: async (ctx, { counterpartyId, playbookId }) => {
    await ctx.db.patch(counterpartyId, { playbookId, state: "ready" });
  },
});

export const markFailed = mutation({
  args: { counterpartyId: v.id("counterparties"), reason: v.string() },
  handler: async (ctx, { counterpartyId, reason }) => {
    // A failed lookup is shown, not swallowed. A family that thinks a bank was told
    // when it was not is worse off than one that can see the gap.
    await ctx.db.patch(counterpartyId, {
      state: "needs_action",
      nextAction: `Could not read their page: ${reason}. Check by hand.`,
    });
  },
});
