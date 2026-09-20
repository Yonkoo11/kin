import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

// A judge must be able to use this without signing up, which means the demo path is
// open to the internet. Adding an organisation spends real Firecrawl and OpenAI credit,
// so without a limit a single script could empty the account before judging starts and
// the app would simply look broken.
//
// Token bucket rather than a fixed window: a judge clicking through three organisations
// in ten seconds should not be blocked, while sustained automated use is.
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // The expensive one. Each call is a web search, a page read and a model call.
  researchInstitution: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  // Cheap, but unbounded case creation is still a way to fill a database.
  createCase: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  // Sending mail costs reputation, not just credit, and the free tier allows
  // 100 messages a day across the whole account.
  sendMail: { kind: "fixed window", rate: 20, period: HOUR },
});
