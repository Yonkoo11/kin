import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { components } from "./_generated/api";
import { AgentMail } from "@agentmail/convex";
import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { auth } from "./auth";

const http = httpRouter();

// Sign-in, sign-out and token refresh routes.
auth.addHttpRoutes(http);
const agentmail = new AgentMail(components.agentmail);

// AgentMail posts here when mail arrives or a delivery state changes.
// The component verifies the Svix signature and de-duplicates by event id,
// so a retried webhook does not move the board twice.
http.route({
  path: "/agentmail/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) =>
    // The cast is a version skew, not a shortcut: @agentmail/convex 0.1.0 was built
    // against a Convex whose runMutation took one argument, and 1.46 added an options
    // argument. The context passed is the one the component expects at runtime.
    agentmail.handleWebhook(ctx as any, req),
  ),
});

// Firecrawl's crawl webhook is mounted by the component itself at /firecrawl/webhook
// via the httpPrefix set in convex.config.ts.

// Registered last. Static hosting serves the site from the root, and the webhook
// routes above are exact paths that must keep winning over it.
registerStaticRoutes(http, components.staticHosting);

export default http;
