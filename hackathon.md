# Hackathon log

- **Project:** Kin
- **Event:** Convex All Gas Hackathon
- **What it does:** Works out what each organisation requires when a customer dies, by reading that organisation's own page, then writes to them and tracks every reply on one live case board.
- **Live app:** https://acrobatic-condor-542.convex.site
- **Repo:** https://github.com/Yonkoo11/kin
- **Frontend:** Convex static hosting
- **Convex deployment:** https://acrobatic-condor-542.convex.cloud
- **Components:** @agentmail/convex, @firecrawl/firecrawl-convex, @convex-dev/rate-limiter, @convex-dev/static-hosting
- **Convex features:** schema, tables, indexes, queries, mutations, internal functions, actions, HTTP actions, scheduled functions, realtime queries, auth
- **Auth:** Convex Auth
- **AI models:** openai/gpt-5 through the Convex AI Gateway when the team is on a paid plan, gpt-5 direct otherwise, claude-sonnet-5 as the declared fallback
- **Started:** 2026-09-19T10:01:18Z
- **Last updated:** 2026-09-21T14:55:00Z

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

### 2026-09-20 - 994d4e7
Rate limited the open paths before publishing anything. A judge has to be able to use this
without signing up, so the demo path is reachable by anyone, and adding an organisation
spends real Firecrawl and model credit. Without a limit one script could empty the account
before judging and the app would simply look broken. Registered `@convex-dev/rate-limiter`
and put a token bucket on research and case creation and a fixed window on sending.
Verified on the dev deployment: five research calls went through and the sixth and seventh
were rejected. Convex features: registered component (`convex/limits.ts`, `convex/cases.ts`,
`convex/mail.ts`, `convex/convex.config.ts`).

### 2026-09-20 - working tree
Published. Registered `@convex-dev/static-hosting` and mounted its routes after the
webhook routes, so exact paths keep winning over the site's root handler. Production
deployment is live and serving at https://acrobatic-condor-542.convex.site, verified with
a cold request rather than assumed.

Registered the inbound mail webhook from inside the deployment so the URL cannot be
mistyped and the key never leaves it, and re-registered it against production once the
production site URL existed. The registration deliberately reports whether a signing
secret was issued and never the secret (`convex/webhooks.ts`, `convex/http.ts`).

Smoke tested production end to end: given only the string "Wells Fargo", the live
deployment found the bank's estate page, read it, and returned the postal address
including its internal mail-stop code, the named form, and the channel classified as
portal rather than email. Nothing failed the grounding check.

Publishing hygiene before the repo goes public: the inbox address moved out of source into
a per-deployment variable, because a real address in a public repository is a spam target
and it differs between deployments anyway. Strategy and demand notes are excluded from the
repository entirely. Added an internal action that reports which credentials a deployment
holds as booleans only, since a length or a prefix still leaks information about a secret
(`convex/preflight.ts`).

Known gap, stated rather than hidden: OpenAI is wired as the primary model and currently
returns 429 for lack of credits on this account, so the extraction above ran on the
declared fallback. Every playbook records which model produced it, and the interface shows
it. This is a billing state, not a missing integration.

### 2026-09-20 - working tree
Added the letter writer. It composes from what that organisation's own page asked for
rather than from a template, which is the point: a family currently sends the same vague
letter to twenty places and gets twenty different requests for more documents back. The
draft is written as soon as a playbook lands and is shown for approval; nothing sends on
its own (`convex/drafts.ts`, `convex/playbooks.ts`, `convex/cases.ts`).

Verified on production. For Wells Fargo the letter addressed the Estate Care Center by
name, named their Letter of Instruction, listed the certified death certificate, and,
rather than inventing account details it did not have, asked which account types applied
and what each would need. No bracketed placeholders.

Cleaned up the webhook endpoint left pointing at the dev deployment, which is offline. A
stale endpoint accumulates delivery failures and ruins the only signal that inbound mail
is healthy (`convex/webhooks.ts`). One endpoint remains, on production, listening for
received, sent, delivered, bounced and rejected. Its signing secret is set on production,
so inbound mail is signature-verified.

### 2026-09-21 - working tree
Built the screen, to a direction written down first rather than discovered while styling
(`design/DIRECTION.md`). The direction is "a letter, not a dashboard": this product's output
is a letter, and the reader is someone awake since 4am who is frightened of getting it wrong.
Serif on a cream ground, one column, no cards, no shadows, no icons, no animation, status as
a sentence rather than a coloured badge, colour used twice only. Comparables studied were
GOV.UK service pages, bank bereavement flows, and a physical estate letter.

The card now carries the whole path: how that organisation will accept the news, in their own
quoted words; the address in monospace with a copy button because it is a string to transcribe
exactly; the form they name; what they ask for; how it changes by account type; the drafted
letter; and then either a send button or, for the majority who will not take email, the exact
instruction for that channel (`src/Organisation.tsx`, `src/index.css`).

Looked at the render rather than trusting the code, and fixed four things only visible that
way: the extracted upload-page link was never shown although it is the single most useful
thing on a card for an organisation that only accepts uploads; the offline button said "I have
posted it" for a company that takes uploads or phone calls; the letter body ran into its
attribution line; and the channel line competed with the organisation name for weight.

Verified against production with a real browser: entering "Wells Fargo" produced the estate
address including its mail-stop code, the Letter of Instruction, the fax, the phone, the
per-account-type requirements, and a drafted letter that asked how the accounts were titled
rather than inventing it. The card correctly refused to offer a send button and said
"Use their upload page above" instead (`convex/cases.ts` markSentOffline).

### 2026-09-21 - working tree
Three ways to reach a model, tried in order, with the product recording which one ran:
the Convex AI Gateway serving OpenAI models, then OpenAI directly, then a declared
fallback. The gateway is preferred because Convex holds the credentials, so there is no
model key in the deployment at all. Confirmed on the free plan that it fails with exactly
`AiGatewayDisabled` and the chain degrades cleanly; upgrading the plan switches OpenAI on
with no code change (`convex/llm.ts`).

Built forwarding, which is how Kin learns who must be told. Nobody has a list of
everything a dead person paid for; their inbox does. An address is registered against an
estate, anything forwarded from it arrives through the signed webhook, and the message is
read for the one organisation being paid. Verified on production: a forwarded subscription
bill produced the right organisation, ignoring the mail provider, the card network and the
person's own name, and the research ran on it automatically
(`convex/intake.ts`, `convex/inbound.ts`, `src/Forwarding.tsx`).

Fixed the most serious quality problem in the product, found by reading a real result
rather than by testing the code. A search for a company's death process also surfaces user
forums and estate-guide businesses, and a forum thread reads exactly like policy. One run
pulled a phrase out of a community post and presented it as a requirement. Search results
are now ranked, the organisation's own domain is strongly preferred, a second search is
run pinned to that domain when the open web only offers commentary, and the playbook
records whether the facts came from the organisation itself. When they did not, the card
says so and tells the family to confirm before sending anything (`convex/research.ts`).

Some organisations, Spotify and Netflix among them, publish no bereavement process at all.
The honest result there is a flagged third-party source rather than an invented official
one, and that is what the card shows.

Reworked the rate limits after being blocked by them while testing, which exposed a real
flaw: all anonymous traffic shared one bucket, so one visitor could lock out the next.
During judging that is the worst possible failure. Limits are now per estate with a global
backstop sized for many people at once (`convex/limits.ts`).

### 2026-09-21 - working tree
Added accounts, with `@convex-dev/auth` and a password provider rather than an OAuth one.
The people this is for are settling an estate, often on a borrowed laptop, often not the
person whose Google account the deceased's mail sits in; a third-party login is a wall at
the worst moment. Convex Auth v2 is labelled "super alpha" by the organisers, so this uses
the stable package. Signing in is optional and late: the example estate needs no account,
because a real estate is the only thing that has to belong to somebody. Ownership moved
onto the auth user id, and a case that is not yours reads as "not found" rather than
"not yours", because whether an estate exists is itself private
(`convex/auth.ts`, `convex/auth.config.ts`, `src/Account.tsx`).

Added `/judge`, which runs the product live rather than describing it. It opens an estate,
enters one input, and annotates each stage as the real data arrives: the page found without
any address in our code, the mail-stop code extracted and checked back against that page,
the channel decision that refuses to offer a send button to a bank that will not take
email, and the letter written from their own stated requirements. It ends with a section
headed "What is not true yet" (`src/Judge.tsx`).

Three bugs found by looking at the rendered page rather than by testing the code, and one
of them is the worst kind:

- **The letter signed off as the dead person.** In a letter announcing their death. The
  prompt now states that the writer is the person handling the estate, is not the deceased,
  and must end with no name at all rather than borrow theirs.
- A letter body arrived as `[object Object]`. The fallback's JSON picker scored a model's
  restatement of the schema as highly as its actual answer, because a restatement has every
  required key with a non-empty value. Scoring is now type-aware, and a value that is itself
  a schema fragment is penalised (`convex/llm.ts`).
- The letter rendered in monospace outside the letter block, and every page load 404ed on a
  missing icon.
