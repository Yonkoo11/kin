import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

// The demo path is open to the internet on purpose: a judge must be able to use this
// without signing up. Adding an organisation spends real Firecrawl and model credit,
// so it has to be bounded.
//
// Two tiers, because one is wrong in both directions. A single shared bucket meant one
// visitor could lock out the next, which during judging is the worst possible failure.
// Per-case buckets alone would let a script open unlimited cases.
//
//   per case   generous enough that nobody hits it in normal use
//   global     a backstop sized for many people at once, not for one
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Each estate gets its own allowance. A burst of eight covers someone working
  // through a real list; it refills faster than anyone types.
  researchPerCase: { kind: "token bucket", rate: 60, period: HOUR, capacity: 8 },
  // Backstop across everyone. Sized so concurrent visitors do not collide.
  researchGlobal: { kind: "token bucket", rate: 600, period: HOUR, capacity: 60 },

  // Opening a case is cheap; the expensive work is bounded above.
  createCase: { kind: "token bucket", rate: 300, period: HOUR, capacity: 40 },

  // Sending costs sender reputation, not just credit, and the mail account allows
  // 100 messages a day across everything.
  sendMail: { kind: "fixed window", rate: 20, period: HOUR },

  // Registering a forwarding address. Low, because each one widens who can write in.
  addMember: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
});
