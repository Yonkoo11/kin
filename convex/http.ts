import { httpRouter } from "convex/server";

// The AgentMail inbound webhook and the Firecrawl crawl webhook both mount here.
// Firecrawl's route is added by the component via httpPrefix "/firecrawl/".
// AgentMail's inbound route is wired in T8; leaving it unwired is deliberate rather
// than stubbed, so nothing claims to work before it does.
const http = httpRouter();

export default http;
