import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { components } from "./_generated/api";
import { AgentMail } from "@agentmail/convex";

const http = httpRouter();
const agentmail = new AgentMail(components.agentmail);

// AgentMail posts here when mail arrives or a delivery state changes.
// The component verifies the Svix signature and de-duplicates by event id,
// so a retried webhook does not move the board twice.
http.route({
  path: "/agentmail/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => agentmail.handleWebhook(ctx, req)),
});

// Firecrawl's crawl webhook is mounted by the component itself at /firecrawl/webhook
// via the httpPrefix set in convex.config.ts.

export default http;
