"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

// Registers this deployment's inbound mail webhook with AgentMail.
// Runs server-side so the API key never leaves the deployment, and deliberately
// does NOT return the signing secret: that value is copied from the AgentMail
// console straight into `npx convex env set AGENTMAIL_WEBHOOK_SECRET`, so it
// never passes through a chat transcript or a log line.
export const register = internalAction({
  args: { siteUrl: v.string() },
  handler: async (_ctx, { siteUrl }) => {
    const url = `${siteUrl.replace(/\/$/, "")}/agentmail/webhook`;

    const res = await fetch("https://api.agentmail.to/v0/webhooks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AGENTMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        event_types: [
          "message.received",
          "message.sent",
          "message.delivered",
          "message.bounced",
          "message.rejected",
        ],
      }),
    });

    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, url, error: body?.message ?? body?.error ?? "unknown" };
    }

    // Report the shape, never the values.
    const id = body?.webhook_id ?? body?.id ?? null;
    const secretIssued = Boolean(body?.secret ?? body?.signing_secret);
    return {
      ok: true,
      url,
      webhookId: id,
      secretIssued,
      note: secretIssued
        ? "A signing secret was issued. Copy it from the AgentMail console and set AGENTMAIL_WEBHOOK_SECRET."
        : "No secret in the response; check the AgentMail console for this webhook's signing secret.",
    };
  },
});

export const list = internalAction({
  args: {},
  handler: async () => {
    const res = await fetch("https://api.agentmail.to/v0/webhooks", {
      headers: { Authorization: `Bearer ${process.env.AGENTMAIL_API_KEY}` },
    });
    const body: any = await res.json().catch(() => ({}));
    const hooks: any[] = body?.webhooks ?? body?.data ?? [];
    // Shape only, no secrets.
    return hooks.map((h) => ({
      id: h.webhook_id ?? h.id,
      url: h.url,
      events: h.event_types ?? h.events,
      enabled: h.enabled ?? h.active ?? true,
    }));
  },
});

// Remove an endpoint that points at a deployment which no longer serves traffic.
// A stale endpoint accumulates delivery failures and muddies the error rate that
// is the only signal you have that inbound mail is healthy.
export const remove = internalAction({
  args: { webhookId: v.string() },
  handler: async (_ctx, { webhookId }) => {
    const res = await fetch(`https://api.agentmail.to/v0/webhooks/${webhookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.AGENTMAIL_API_KEY}` },
    });
    return { ok: res.ok, status: res.status, webhookId };
  },
});
