import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// How an institution actually accepts a death notification.
// This is the product's core finding: most large banks do NOT accept email.
// Measured 2026-09-19 against Wells Fargo and Chase's own pages.
export const channel = v.union(
  v.literal("email"),
  v.literal("mail"),
  v.literal("fax"),
  v.literal("phone"),
  v.literal("portal"),
  v.literal("branch"),
  v.literal("unknown"),
);

export default defineSchema({
  // One estate. Multiple family members share it.
  cases: defineTable({
    deceasedName: v.string(),
    // Routing token. ONE AgentMail inbox serves every case (free tier allows 3 inboxes
    // total), so inbound mail is matched to a case by thread id or by this token.
    token: v.string(),
    createdBy: v.optional(v.string()),
    demo: v.boolean(),
  }).index("by_token", ["token"]),

  // One organisation that must be told, within one case.
  counterparties: defineTable({
    caseId: v.id("cases"),
    name: v.string(),
    playbookId: v.optional(v.id("playbooks")),
    state: v.union(
      v.literal("found"),       // we know who they are
      v.literal("researching"), // crawling their page
      v.literal("ready"),       // playbook extracted, draft written
      v.literal("awaiting"),    // sent or posted, waiting on them
      v.literal("needs_action"),// they replied asking for something
      v.literal("closed"),
    ),
    nextAction: v.optional(v.string()),
    threadId: v.optional(v.string()),
    lastContactAt: v.optional(v.number()),
  })
    .index("by_caseId", ["caseId"])
    .index("by_threadId", ["threadId"]),

  // What this specific organisation says it requires, extracted from its own page.
  // Nothing in here is hardcoded. Every field carries the URL it came from.
  playbooks: defineTable({
    institutionName: v.string(),
    sourceUrl: v.string(),
    scrapedAt: v.number(),
    channel,
    channelNote: v.optional(v.string()),
    postalAddress: v.optional(v.string()),
    overnightAddress: v.optional(v.string()),
    faxNumber: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    portalUrl: v.optional(v.string()),
    formName: v.optional(v.string()),
    requiredDocuments: v.array(v.string()),
    accountTypeNotes: v.optional(v.string()),
    // Which model produced this extraction. Every generated artifact records its origin.
    extractedBy: v.string(),
    // Facts the model returned that were NOT found on the page, and were therefore
    // thrown away. Shown in the interface: a silently missing address is a trap.
    droppedFields: v.optional(v.array(v.string())),
  }).index("by_institutionName", ["institutionName"]),

  // Every outbound message is drafted, shown, and sent on a human click. Never auto-sent.
  drafts: defineTable({
    counterpartyId: v.id("counterparties"),
    subject: v.string(),
    body: v.string(),
    generatedBy: v.string(),
    approvedAt: v.optional(v.number()),
    sentMessageId: v.optional(v.string()),
  }).index("by_counterpartyId", ["counterpartyId"]),
});
