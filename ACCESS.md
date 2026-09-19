# Access needed before building — Afterward

Priced 2026-09-19, at idea lock, while swapping is still free.
Rule: an unchecked box means the project is stopped, not in progress. Every line has a fallback tier
that still runs and still demos, and says out loud that it is degraded.

## Accounts and keys

- [ ] **AgentMail API key** — needed for: the inbox, which is the product — how: https://console.agentmail.to
  (create account → API Keys → generate; key shown once) — cost: free tier, no card
  — eta: minutes, self-serve, no approval step found in their docs
  — fallback: `MailTransport` interface with a `LocalTransport` implementation that writes the
  outbound message into a Convex `outbox` table and lets a judge paste an institution's reply into
  a textarea to simulate inbound. Banner reads "local transport, no mail sent". Every case row records
  which transport ran.

- [ ] **Firecrawl API key** — needed for: finding and reading each institution's real death-notification
  page — how: https://firecrawl.dev — cost: free tier + 20,000 credits granted to every participant who
  registered on Luma — eta: minutes
  — fallback: a dated fixture corpus of ~20 institution pages scraped by hand and committed under
  `probe/fixtures/`, each with its capture date. Banner reads "offline corpus, captured 2026-09-19".
  The extraction and letter-drafting path is identical, so the demo is unaffected in shape.

- [x] **OpenAI API key** — needed for: structured extraction from crawled pages, letter drafting,
  reply parsing — how: already present in this machine's environment — cost: usage
  — eta: zero, confirmed set 2026-09-19
  — fallback: Anthropic key is also present; the model call sits behind one `llm.ts` wrapper so the
  provider is a one-line swap, and every generated artifact records which model produced it.
  (Note: the hackathon supplies no OpenAI credits, so this is spend from the existing account.)

- [x] **Convex account / team** — needed for: everything — how: https://dashboard.convex.dev/t/mustapha-alex
  exists — cost: free tier — eta: zero
  — fallback: none needed; without Convex there is no entry, and the account already exists.

## Credits and funding

- [ ] **Luma registration** — needed for: the 20,000 Firecrawl credits, and for eligibility
  — how: https://luma.com/convex-allgas-hackathon?tk=8cLQUK — cost: free — eta: minutes
  — fallback: Firecrawl's own free tier, with crawl volume capped in code to stay inside it.

## Installs and local tooling

- [x] **Node** — v20.19.5 confirmed present 2026-09-19 — fallback: n/a
- [ ] **Convex CLI** — `npx convex` (no global install needed; `which convex` returns nothing today,
  which is fine) — eta: first `npx` run — fallback: n/a
- [ ] **@convex-dev/static-hosting** — needed for: the convex.site URL, which is a submission requirement
  — how: `npm i @convex-dev/static-hosting && npx @convex-dev/static-hosting setup`
  — eta: minutes — fallback: **none, and that is deliberate.** A Vercel URL does not satisfy the rules.
  This is the one dependency with no degraded tier, so it gets deployed on day one, empty, before features.

## Submission requirements

- [ ] **vibeapps.dev account** — needed for: filing the entry — how: https://vibeapps.dev — cost: free
  — eta: minutes — fallback: none; file early (see Phase 4.6) so this is never discovered late.
- [ ] **Public GitHub repo** — required to qualify — eta: minutes — fallback: none.
- [ ] **X or LinkedIn post** tagging @convex, @OpenAI, @firecrawl, @agentmail — scored under "social proof"
  — fallback: LinkedIn alone if X is unavailable.

## Eligibility traps

Rules that disqualify rather than block. Checked against the hackathon's own rules page, not the marketing copy.

- [ ] **Live URL must be convex.site or chatgpt.site.** A Vercel or Netlify URL does not qualify.
  One current entrant (sangtrx/opportunity-concierge) is live on vercel.app and may be exposed to this.
  — checked against: "Deploy a public app / Must be a convex.site or chatgpt.site URL"
- [ ] **Repo must have been started on or after 25 August 2026, 12 PM PT.** The commit history is the
  evidence. — checked against: "Only new apps started on or after August 25 at 12 PM PT will qualify"
- [ ] **`hackathon.md` must exist at repo root.** It is named as the file judges read.
  — checked against: submission checklist
- [ ] **Deadline is 12:00 PM PT, not midnight.** Noon on 22 September.
  — checked against: "Submissions due Sep 22, 12:00 PM PT", stated twice on the page
- [ ] **Repo must be public.** — checked against: "All GitHub repos must be public to qualify"
- [ ] **Video under 3 minutes.**
- [ ] **Convex Auth v2 is labelled "super alpha" by the organisers, and the Convex AI Gateway is
  paid-teams-only.** Neither may be load-bearing. — checked against: the "Building resources" list

## Hard constraints discovered by probe, 2026-09-19

- **AgentMail free tier: 3 inboxes, 100 emails/day, 3,000/month, no custom domain.**
  This kills any "one inbox per case" design. The app uses ONE shared inbox and routes by thread plus
  a case token. The leading entrant (faultline) uses the same single-address pattern, which corroborates it.
  Open unknown: whether plus-addressing (`estate+token@agentmail.to`) works on the free tier. Probe it
  before relying on it; the thread-plus-token route works either way.
- **The majors do not accept death notification by email.** Wells Fargo takes phone, US mail, fax,
  branch, or their icomplete portal. Chase takes branch, phone, or mail. This is a design constraint,
  not a bug, and it is handled explicitly. See ai/sponsor-integration.md.

---

**Rule:** if any box above is unchecked and the deadline is closer than the longest eta, the project
runs on its fallback tier from now on. Longest eta here is minutes. Nothing on this list has a human
approval queue, which is the first time that has been true for a project on this machine.
