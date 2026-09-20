# Fix Plan — Kin

Phase 1 only. Nothing below the Phase 1 line gets built until the gate passes.
Gate: the UI displays `D1118-02D` (Wells Fargo's internal mail code, read live from their page,
absent from the source), and a reply lands on the card in a second browser with no refresh.

## Tasks

- [ ] T1: Convex app scaffolds and deploys empty to a convex.site URL
  - Acceptance: `curl -sL <url>` returns 200 and the page says the project name. URL recorded in hackathon.md.
  - Files: package.json, convex/convex.config.ts, convex/schema.ts, index.html
  - Note: static hosting via `npx @convex-dev/static-hosting setup`. A Vercel URL does not qualify.

- [ ] T2: Both sponsor components mount without error
  - Acceptance: `npx convex dev` starts clean with `@agentmail/convex` and `@firecrawl/firecrawl-convex`
    both in convex.config.ts. Firecrawl key wired through typed component env, not process.env.
  - Files: convex/convex.config.ts

- [ ] T3: Probe — does Firecrawl reach the hosts that blocked plain requests?
  - Acceptance: probe/firecrawl-reach.md records, per host, the status for wellsfargo.com,
    chase.com, ssa.gov, fidelity.com, irs.gov. Result written down whether it passes or fails.
  - Files: probe/firecrawl-reach.md
  - This is an OPEN UNKNOWN. Do not build the fallback or the happy path until it is measured.

- [ ] T4: search → scrape returns a real institution page with no hardcoded URL
  - Acceptance: given the string "Wells Fargo", the app finds their estate page itself and stores
    the markdown. `grep -r "wellsfargo.com" convex/ src/` returns nothing.
  - Files: convex/discover.ts

- [ ] T5: OpenAI extracts a typed InstitutionPlaybook from that page
  - Acceptance: the stored playbook contains channel=mail/fax/phone/portal (not email),
    address including `D1118-02D`, fax 1-866-358-1145, form "Letter of Instruction",
    and the per-account-type document list. Schema-validated.
  - Files: convex/playbook.ts, convex/schema.ts

- [ ] T6: The playbook renders on a counterparty card, with the source URL shown
  - Acceptance: `D1118-02D` is visible in the browser, and the card links to the page it came from.
  - Files: src/CounterpartyCard.tsx

- [ ] T7: One shared AgentMail inbox exists and can send
  - Acceptance: a draft is approved by a human click and arrives at a test address.
    Card shows pending → sent → delivered, reactively.
  - Files: convex/mail.ts
  - Constraint: ONE inbox. Free tier allows 3 total. Route by thread + case token.

- [ ] T8: Inbound reply threads onto the right card, live
  - Acceptance: reply to the sent message; in a SECOND browser window already open, the card's
    state changes within seconds with no refresh. Record this as the live-update evidence.
  - Files: convex/http.ts, convex/mail.ts

- [ ] T9: OpenAI reads the reply and sets the next action
  - Acceptance: a reply saying "we need a certified copy" changes the card's next action to
    request a certified copy. Shown on screen.
  - Files: convex/replies.ts

- [ ] T10: hackathon.md at root, with what it is, the stack, the live URL, and one dated entry per session
  - Acceptance: `test -f hackathon.md` and it contains the live URL and all four sponsor names.
  - Files: hackathon.md

- [ ] T11: File the minimum entry on vibeapps.dev as soon as T1 and T10 exist
  - Acceptance: SUBMISSION.md first line reads `Status: filed YYYY-MM-DD <url>`.
  - Note: most venues allow editing until the deadline. An entry that exists and is weak beats a
    strong one that does not exist. This is the single most common way projects here have died.

--- PHASE 1 GATE ---

- [ ] T12: forward-a-bill intake creates a counterparty card
- [ ] T13: channel detection labels email vs mail vs fax vs portal, and produces an offline packet
- [ ] T14: 14-day silence fires a chase (scheduled function, with a dev-only clock control)
- [ ] T15: death certificate uploaded once, attached to every packet (Convex file storage)
- [ ] T16: auth with @convex-dev/auth; two siblings, one case, both screens move
- [ ] T17: /judge route, a guided tour of the three sponsor moments in order
- [ ] T18: design pass (run /design, do not start from the dark/Inter/mono template)
- [ ] T19: video under 3 minutes
- [ ] T20: X and LinkedIn post, all four handles verified live before posting

## Completed
(builder fills this in)
