import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { components, internal, api } from "./_generated/api";
import { AgentMail } from "@agentmail/convex";

// ONE shared inbox for every estate. AgentMail's free tier allows 3 inboxes total,
// and it supports no plus-addressing or catch-all (confirmed against agent.email/skill.md
// and docs.agentmail.to, 2026-09-20). So inbound mail is matched to a family by
// thread id first, and by a short code in the subject as a fallback.
const INBOX = process.env.AGENTMAIL_INBOX_ID ?? "dralex@agentmail.to";

const agentmail = new AgentMail(components.agentmail, {
  // Fired on every inbound message. This is what makes a reply move the board
  // without anybody pressing refresh.
  onMessageReceived: internal.mail.onInbound,
});

// --- outbound -------------------------------------------------------------

// Nothing is ever sent without a human pressing a button. A wrong letter about a
// death is worse than no letter, and an agent that writes to twenty organisations
// unattended is not something anyone should trust.
export const approveAndSend = mutation({
  args: { draftId: v.id("drafts") },
  handler: async (ctx, { draftId }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error("draft not found");
    if (draft.approvedAt) throw new Error("already sent");

    const counterparty = await ctx.db.get(draft.counterpartyId);
    if (!counterparty) throw new Error("counterparty not found");

    const playbook = counterparty.playbookId ? await ctx.db.get(counterparty.playbookId) : null;
    if (!playbook) throw new Error("no playbook: nothing has been read about this organisation yet");

    // The refusal that keeps this honest. If the organisation's own page does not say
    // it accepts email, we do not email it and pretend that counts.
    if (playbook.channel !== "email") {
      throw new Error(
        `${counterparty.name} does not accept email. Their page says: ${playbook.channelNote ?? playbook.channel}. Use the printed packet.`,
      );
    }

    const emailMatch = (playbook.channelNote ?? "").match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (!emailMatch) throw new Error("no address found on their page");

    const kase = await ctx.db.get(counterparty.caseId);

    const outboundId = await agentmail.sendMessage(ctx, INBOX, {
      to: emailMatch[0],
      // The case code rides in the subject so a reply that loses its thread headers
      // still finds its way home.
      subject: `${draft.subject} [ref ${kase?.token}]`,
      text: draft.body,
      // Labels are AgentMail's metadata dimension. One per organisation, one per case.
      labels: [`case:${kase?.token}`, `org:${counterparty.name.toLowerCase().replace(/\s+/g, "-")}`],
    });

    await ctx.db.patch(draftId, { approvedAt: Date.now(), sentMessageId: outboundId });
    await ctx.db.patch(draft.counterpartyId, {
      state: "awaiting",
      lastContactAt: Date.now(),
      nextAction: "Sent. Waiting for them to reply.",
    });
    return outboundId;
  },
});

// Delivery state is a live query, so "sent" turning into "delivered" or "bounced"
// appears on the card by itself. A bounce is a result worth seeing, not an error to hide:
// a family currently finds out weeks later, or never.
export const deliveryState = query({
  args: { draftId: v.id("drafts") },
  handler: async (ctx, { draftId }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft?.sentMessageId) return null;
    return await agentmail.status(ctx, draft.sentMessageId as any);
  },
});

export const saveDraft = internalMutation({
  args: {
    counterpartyId: v.id("counterparties"),
    subject: v.string(),
    body: v.string(),
    generatedBy: v.string(),
  },
  handler: (ctx, a) => ctx.db.insert("drafts", a),
});

export const draftFor = query({
  args: { counterpartyId: v.id("counterparties") },
  handler: (ctx, { counterpartyId }) =>
    ctx.db
      .query("drafts")
      .withIndex("by_counterparty", (q) => q.eq("counterpartyId", counterpartyId))
      .order("desc")
      .first(),
});

// --- inbound --------------------------------------------------------------

export const onInbound = internalMutation({
  args: { message: v.any(), thread: v.any(), eventId: v.string() },
  handler: async (ctx, { message, thread }) => {
    const threadId: string | undefined = thread?.thread_id ?? message?.thread_id;
    const subject: string = message?.subject ?? "";
    const body: string = message?.text ?? message?.extracted_text ?? "";

    // Route 1: we already know this conversation.
    let counterparty = threadId
      ? await ctx.db
          .query("counterparties")
          .withIndex("by_thread", (q) => q.eq("threadId", threadId))
          .first()
      : null;

    // Route 2: the case code in the subject.
    if (!counterparty) {
      const ref = subject.match(/\[ref ([a-z0-9]{6})\]/);
      if (ref) {
        const kase = await ctx.db
          .query("cases")
          .withIndex("by_token", (q) => q.eq("token", ref[1]))
          .first();
        if (kase) {
          counterparty = await ctx.db
            .query("counterparties")
            .withIndex("by_case", (q) => q.eq("caseId", kase._id))
            .filter((q) => q.eq(q.field("state"), "awaiting"))
            .first();
        }
      }
    }

    if (!counterparty) {
      // Unmatched mail is not dropped silently. It is the forward-a-bill intake path,
      // handled in T12, and until then it is visibly unhandled rather than pretended away.
      return null;
    }

    if (threadId && !counterparty.threadId) {
      await ctx.db.patch(counterparty._id, { threadId });
    }

    await ctx.db.patch(counterparty._id, {
      state: "needs_action",
      nextAction: "They replied. Reading it.",
    });

    // Work out what they are actually asking for. That runs in an action.
    await ctx.scheduler.runAfter(0, api.replies.interpret, {
      counterpartyId: counterparty._id,
      subject,
      body: body.slice(0, 20000),
    });
    return null;
  },
});
