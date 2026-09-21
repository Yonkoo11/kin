import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Separate from mail.ts on purpose. The AgentMail client in mail.ts names this
// function as its inbound hook, so defining it there would make the module refer
// to itself and TypeScript could not work out the types.

// --- inbound --------------------------------------------------------------

export const onMessage = internalMutation({
  args: { message: v.any(), thread: v.any(), eventId: v.string() },
  handler: async (ctx, { message, thread }) => {
    const threadId: string | undefined = thread?.thread_id ?? message?.thread_id;
    const subject: string = message?.subject ?? "";
    const body: string = message?.text ?? message?.extracted_text ?? "";

    // Route 1: we already know this conversation.
    let counterparty = threadId
      ? await ctx.db
          .query("counterparties")
          .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
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
            .withIndex("by_caseId", (q) => q.eq("caseId", kase._id))
            .filter((q) => q.eq(q.field("state"), "awaiting"))
            .first();
        }
      }
    }

    if (!counterparty) {
      // Route 3: not a reply at all. Somebody forwarded a bill in.
      //
      // This is how Kin learns who must be told, and it is the part families find
      // hardest. Nobody has a list of everything the dead person paid for. Their
      // inbox does.
      //
      // AgentMail has no plus-addressing and there is one shared inbox, so the
      // sender address is the routing key, and only addresses registered on a case
      // can reach it.
      const from: string = message?.from ?? message?.sender ?? "";
      const addr = from.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
      if (!addr) return null;

      const kase = await ctx.runQuery(internal.cases.caseForSender, { email: addr });
      if (!kase) return null;

      await ctx.scheduler.runAfter(0, internal.intake.identify, {
        caseId: kase._id,
        subject,
        body: body.slice(0, 8000),
      });
      return null;
    }

    if (threadId && !counterparty.threadId) {
      await ctx.db.patch("counterparties", counterparty._id, { threadId });
    }

    await ctx.db.patch("counterparties", counterparty._id, {
      state: "needs_action",
      nextAction: "They replied. Reading it.",
    });

    // Work out what they are actually asking for. That runs in an action.
    await ctx.scheduler.runAfter(0, internal.replies.interpret, {
      counterpartyId: counterparty._id,
      subject,
      body: body.slice(0, 20000),
    });
    return null;
  },
});
