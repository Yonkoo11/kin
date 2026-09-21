import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { rateLimiter } from "./limits";

// A short, human-readable routing token. AgentMail has no plus-addressing or catch-all
// (confirmed against agent.email/skill.md and docs.agentmail.to, 2026-09-20), so inbound
// mail is matched by thread id first and by this token in the subject as a fallback.
// This token travels in an email subject line and is one of the two ways inbound
// mail is matched to a family, so it is a credential, not a display id.
// Math.random() is predictable enough to guess; use the CSPRNG and enough length
// that guessing is not worth anyone's time.
function newToken(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

// Every read or write of a case goes through here.
// A case holds a dead person's name and their family's correspondence.
// Demo cases are deliberately open so a judge can use the product without signing up;
// everything else belongs to whoever created it.
async function authorize(ctx: any, caseId: any) {
  const kase = await ctx.db.get("cases", caseId);
  if (!kase) throw new Error("not found");
  if (kase.demo) return kase;
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.tokenIdentifier !== kase.createdBy) {
    throw new Error("not found");
  }
  return kase;
}

export const createCase = mutation({
  args: { deceasedName: v.string(), demo: v.optional(v.boolean()) },
  handler: async (ctx, { deceasedName, demo }) => {
    const identity = await ctx.auth.getUserIdentity();
    const isDemo = demo ?? false;
    // Signed-in users are limited per account; anonymous demo traffic shares one bucket.
    await rateLimiter.limit(ctx, "createCase", {
      key: identity?.tokenIdentifier ?? "anonymous",
      throws: true,
    });
    // A real case with no signed-in owner would be a case nobody can be checked against.
    if (!isDemo && !identity) throw new Error("sign in to open a real estate");
    return await ctx.db.insert("cases", {
      deceasedName,
      token: newToken(),
      demo: isDemo,
      createdBy: identity?.tokenIdentifier,
    });
  },
});

export const getCase = query({
  args: { caseId: v.id("cases") },
  handler: (ctx, { caseId }) => authorize(ctx, caseId),
});

// The case board. This is the reactive query the whole family watches: when a reply
// lands, every open browser moves without anyone refreshing.
export const board = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, { caseId }) => {
    await authorize(ctx, caseId);
    const counterparties = await ctx.db
      .query("counterparties")
      .withIndex("by_caseId", (q) => q.eq("caseId", caseId))
      .collect();

    return await Promise.all(
      counterparties.map(async (c) => ({
        ...c,
        playbook: c.playbookId ? await ctx.db.get("playbooks", c.playbookId) : null,
      })),
    );
  },
});

export const addCounterparty = mutation({
  args: { caseId: v.id("cases"), name: v.string() },
  handler: async (ctx, { caseId, name }) => {
    await authorize(ctx, caseId);
    // Per estate first, so one visitor cannot exhaust another's allowance, then a
    // global backstop so a script cannot exhaust everyone's.
    await rateLimiter.limit(ctx, "researchPerCase", { key: caseId, throws: true });
    await rateLimiter.limit(ctx, "researchGlobal", { key: "all", throws: true });
    const id = await ctx.db.insert("counterparties", {
      caseId,
      name,
      state: "researching",
    });
    // Discovery is an action because it talks to Firecrawl and OpenAI.
    await ctx.scheduler.runAfter(0, internal.research.researchInstitution, {
      counterpartyId: id,
      name,
    });
    return id;
  },
});

export const attachPlaybook = internalMutation({
  args: { counterpartyId: v.id("counterparties"), playbookId: v.id("playbooks") },
  handler: async (ctx, { counterpartyId, playbookId }) => {
    await ctx.db.patch("counterparties", counterpartyId, { playbookId, state: "ready" });
    // Write the letter straight away. It is shown for approval, never sent on its own.
    await ctx.scheduler.runAfter(0, internal.drafts.compose, { counterpartyId });
  },
});

export const markFailed = internalMutation({
  args: { counterpartyId: v.id("counterparties"), reason: v.string() },
  handler: async (ctx, { counterpartyId, reason }) => {
    // A failed lookup is shown, not swallowed. A family that thinks a bank was told
    // when it was not is worse off than one that can see the gap.
    await ctx.db.patch("counterparties", counterpartyId, {
      state: "needs_action",
      nextAction: `Could not read their page: ${reason}. Check by hand.`,
    });
  },
});

// Set by the reply reader. Kept here rather than in replies.ts because that file is
// "use node" for the OpenAI SDK, and only actions may live in Node files.
export const setNextAction = internalMutation({
  args: {
    counterpartyId: v.id("counterparties"),
    state: v.union(v.literal("closed"), v.literal("needs_action")),
    nextAction: v.string(),
    quotedAsk: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { counterpartyId, state, nextAction, quotedAsk }) => {
    await ctx.db.patch("counterparties", counterpartyId, {
      state,
      // Their own words win over any summary of them.
      nextAction: quotedAsk ? `${nextAction} They wrote: "${quotedAsk}"` : nextAction,
    });
  },
});

// For organisations that do not accept email: the family posts, faxes or calls, and
// records that here. Kin never claims an offline step happened on its own.
export const markSentOffline = mutation({
  args: { counterpartyId: v.id("counterparties"), how: v.string() },
  handler: async (ctx, { counterpartyId, how }) => {
    const cp = await ctx.db.get("counterparties", counterpartyId);
    if (!cp) throw new Error("not found");
    await authorize(ctx, cp.caseId);
    await ctx.db.patch("counterparties", counterpartyId, {
      state: "awaiting",
      lastContactAt: Date.now(),
      nextAction: `Sent by ${how}. Waiting for them to reply.`,
    });
  },
});

// Forwarding is how Kin learns who must be told. A person's bills are the only
// complete list of their recurring relationships, and the family already has them
// in an inbox. Registering the address is what lets a forwarded bill find its case.
export const addMemberEmail = mutation({
  args: { caseId: v.id("cases"), email: v.string() },
  handler: async (ctx, { caseId, email }) => {
    const kase = await authorize(ctx, caseId);
    await rateLimiter.limit(ctx, "addMember", { key: caseId, throws: true });
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error("that does not look like an email address");
    const existing = kase.memberEmails ?? [];
    if (existing.includes(clean)) return;
    if (existing.length >= 6) throw new Error("that is as many addresses as one estate can register");
    await ctx.db.patch("cases", caseId, { memberEmails: [...existing, clean] });
  },
});

// Used by the inbound router, which runs before any user is known.
export const caseForSender = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const clean = email.trim().toLowerCase();
    // Small table in practice; one estate has a handful of addresses.
    for await (const kase of ctx.db.query("cases")) {
      if ((kase.memberEmails ?? []).includes(clean)) return kase;
    }
    return null;
  },
});

// Records what a forwarded message turned into, and starts the research if it
// named an organisation we do not already have on this case.
export const recordIntake = internalMutation({
  args: {
    caseId: v.id("cases"),
    subject: v.string(),
    organisation: v.union(v.string(), v.null()),
    note: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { caseId, subject, organisation, note }) => {
    if (!organisation) {
      await ctx.db.insert("counterparties", {
        caseId,
        name: `Something forwarded: "${subject.slice(0, 60)}"`,
        state: "needs_action",
        nextAction: note ?? "No organisation was named in it. Add them by hand above.",
      });
      return;
    }

    const existing = await ctx.db
      .query("counterparties")
      .withIndex("by_caseId", (q) => q.eq("caseId", caseId))
      .collect();
    if (existing.some((c) => c.name.toLowerCase() === organisation.toLowerCase())) return;

    const id = await ctx.db.insert("counterparties", {
      caseId,
      name: organisation,
      state: "researching",
      nextAction: note ?? undefined,
    });
    await ctx.scheduler.runAfter(0, internal.research.researchInstitution, {
      counterpartyId: id,
      name: organisation,
    });
  },
});
