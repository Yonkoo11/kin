"use node";

import { internalAction } from "./_generated/server";

// Internal only: run it from the dashboard or the CLI, never from a browser.
// It reports account and inbox details, which nobody outside this project should see.
// Runs inside the Convex deployment, so the keys never leave it.
// Answers the two questions that would otherwise break the demo in front of a judge.
export const check = internalAction({
  args: {},
  handler: async () => {
    const out: Record<string, string> = {};

    // 1. Is the AgentMail account claimed, or in restricted mode?
    //    Restricted mode can only send to the account owner's own address, 10/day.
    //    Source: agent.email/skill.md, read 2026-09-20.
    try {
      const r = await fetch("https://api.agentmail.to/v0/inboxes", {
        headers: { Authorization: `Bearer ${process.env.AGENTMAIL_API_KEY}` },
      });
      if (!r.ok) {
        out.agentmail = `HTTP ${r.status} — key rejected or account not reachable`;
      } else {
        const body: any = await r.json();
        const inboxes: any[] = body?.inboxes ?? body?.data ?? [];
        out.agentmail = `ok — ${inboxes.length} inbox(es): ${inboxes
          .map((i) => i.inbox_id ?? i.address ?? i.id)
          .join(", ")}`;
      }
    } catch (e: any) {
      out.agentmail = `failed: ${e.message}`;
    }

    // 2. Can Firecrawl reach the hosts that refused a plain request on 2026-09-19?
    //    This is the open unknown that the whole product rests on. Measured, not assumed.
    const hosts = [
      "https://www.wellsfargo.com/help/estate-care-center/",
      "https://www.chase.com/personal/estate-services",
      "https://www.fidelity.com/customer-service/transfer-assets-inheritance",
      "https://www.ssa.gov/forms/ssa-8.html",
    ];
    for (const url of hosts) {
      try {
        const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, formats: ["markdown"] }),
        });
        const body: any = await r.json();
        const md: string = body?.data?.markdown ?? body?.markdown ?? "";
        out[new URL(url).hostname] = r.ok
          ? `${md.length} chars${md.length < 500 ? " — TOO THIN, treat as blocked" : ""}`
          : `HTTP ${r.status}`;
      } catch (e: any) {
        out[new URL(url).hostname] = `failed: ${e.message}`;
      }
    }

    return out;
  },
});
