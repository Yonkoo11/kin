# Hackathon log

- **Project:** Kin
- **Event:** Convex All Gas Hackathon
- **What it does:** Works out what each organisation requires when a customer dies, by reading that organisation's own page, then writes to them and tracks every reply on one live case board.
- **Live app:** not deployed
- **Repo:** private
- **Frontend:** Convex static hosting
- **Convex deployment:** not deployed
- **Components:** @agentmail/convex, @firecrawl/firecrawl-convex, @convex-dev/rate-limiter
- **Convex features:** schema, tables, indexes, queries, mutations, actions, HTTP actions, scheduled functions
- **Auth:** none
- **AI models:** gpt-5, claude-sonnet-5
- **Started:** 2026-09-19T10:01:18Z
- **Last updated:** 2026-09-20T22:41:00Z

## Log

### 2026-09-19 - 1cf2dd7
Scaffolded the Convex app and registered both sponsor components in
`convex/convex.config.ts`. Wrote the schema for cases, counterparties, playbooks and
drafts with indexes on `caseId`, `threadId`, `token` and `counterpartyId`. Firecrawl's key
is wired through typed component env in `defineApp`, per that component's README, rather
than read ambiently. Convex features: schema, tables, indexes, registered components
(`convex/convex.config.ts`, `convex/schema.ts`).

Before writing any of it, fetched nine real institutional death-notification pages to test
whether the idea holds. Four hand-built URLs returned 404 and two returned 403 to a plain
request, which settled that the product has to search rather than ship a URL table. The
pages that did load carry facts no model knows, including postal addresses with internal
mail-stop codes. A third finding reshaped the product: large banks do not accept a death
notification by email, so detecting which channel each organisation actually accepts became
the feature rather than an assumption.

### 2026-09-20 - e234663
Built the first path end to end: Firecrawl `search` finds an organisation's own page from
its name alone, `scrape` returns the markdown, and a JSON-schema-constrained extraction
turns it into a typed playbook. No institution URL is hardcoded. Convex features: actions,
mutations, queries, scheduled functions (`convex/research.ts`, `convex/cases.ts`).

### 2026-09-20 - 36c9aea
Added an internal preflight action that answers the two questions that would otherwise
break a demo in front of a judge: whether the mail account can send at all, and whether
Firecrawl reaches hosts that refuse a plain request (`convex/preflight.ts`).

### 2026-09-20 - de812f0
Security pass on the new code. Cases are scoped to their creator, with demo cases left open
so the product can be used without signing up. The case routing token moved from
`Math.random` to `crypto.getRandomValues`, because it travels in a mail subject and is one
of two ways an inbound message is matched to a case. Five functions that only the server
should call became internal.

The substantive one is prompt injection. This app reads pages it did not write and then
tells someone where to post a certified death certificate, so page text is now delimited and
framed as data, and every contact fact is checked back against the page before it is stored.
Anything the model returns that is not literally on the page is dropped, and the interface
names which fields were dropped. Portal links must be https and on the same site that was
read (`convex/research.ts`, `convex/cases.ts`, `src/App.tsx`).

### 2026-09-20 - af61fad
Renamed the project from Afterward to Kin. The first name described a mood; every
organisation in this product already prints the second one on its own form.

### 2026-09-20 - 1a7d422
Fixed the first real push. A mutation was sitting in a `"use node"` file, which Convex
rejects, so it moved to `convex/playbooks.ts`. The Firecrawl client's `search` takes
`(ctx, query, options)`, not an args object; read the real signature out of the installed
package rather than guessing again. The mail module named its own inbound hook, so it
referred to itself and could not be typed, and the hook moved to `convex/inbound.ts`.
Convex features: HTTP actions (`convex/http.ts`, `convex/mail.ts`, `convex/inbound.ts`).

Convex's own guidelines file corrected two things it says explicitly override training data:
ownership checks now use `identity.tokenIdentifier` rather than `identity.subject`, and the
database calls use the current `(table, id, value)` form.

### 2026-09-20 - a132747
First gate passed on the dev deployment. Given only the string "Wells Fargo", the app found
that bank's estate page, read it, and returned the postal address including its internal
mail-stop code, the overnight address, the fax, the phone, the named form, the
per-account-type document matrix and the portal URL. It classified the accepted channel as
portal rather than email, which is the fact this product exists to get right. The grounding
check dropped nothing, and the mail-stop code appears nowhere in this repository.

Four bugs surfaced only by running it, none of which a typecheck catches. A failed
extraction left a card reading "reading their page" forever, and now fails visibly with the
reason. Model output was being spread straight into a mutation, which broke when the model
echoed the schema's own `type` key back; fields are now picked by hand, which is the right
call anyway for output derived from an untrusted page. The fallback model's JSON was
extracted by slicing between the first and last brace, which does not parse when the reply
also contains prose, and then by taking the first balanced object, which returned an empty
shell because the model restates the schema before answering. Candidate objects are now
scored by how many required fields carry real values.

Added the model fallback tier the project's access notes had promised since the idea was
locked and which did not exist: OpenAI is primary because this event scores whether OpenAI
does real work, a second provider covers an outage, and every playbook records which model
produced it (`convex/llm.ts`, `convex/research.ts`, `convex/replies.ts`).

### 2026-09-20 - working tree
Rate limited the open paths before publishing anything. A judge has to be able to use this
without signing up, so the demo path is reachable by anyone, and adding an organisation
spends real Firecrawl and model credit. Without a limit one script could empty the account
before judging and the app would simply look broken. Registered `@convex-dev/rate-limiter`
and put a token bucket on research and case creation and a fixed window on sending.
Verified on the dev deployment: five research calls went through and the sixth and seventh
were rejected. Convex features: registered component (`convex/limits.ts`, `convex/cases.ts`,
`convex/mail.ts`, `convex/convex.config.ts`).
