# Kin — build log

**The death admin inbox.**

When someone dies, one person has to tell twenty or thirty separate organisations. Five of them are
banks and pensions. The other twenty-five are the phone carrier, the streaming subscriptions, the gym,
the storage unit, the HOA, the lawn service, the dentist, the employer's HR. Each one wants something
different, and most will not tell you what until you have already waited on hold.

Kin finds out what each organisation actually requires, from that organisation's own page,
writes to them, and keeps every reply threaded on a board the whole family can watch.

**Live URL:** _(day-one deploy pending — see 2026-09-19 below)_
**Demo video:** _(pending)_
**Repo:** _(pending — will be public)_

## The stack

| Sponsor | What it does here | Where |
|---|---|---|
| **Convex** | The whole backend. Reactive queries drive the case board, mutations approve drafts, scheduled functions run the 14-day chase, file storage holds the death certificate, HTTP actions receive both webhooks, and both sponsor components are mounted. | `convex/` |
| **Firecrawl** | `search` finds each organisation's own death-notification page with no hardcoded URL, `scrape` returns the postal address, internal mail code, fax, named form and document list, and `startCrawl` walks a large institution's estate section into a reactive table. | `convex/convex.config.ts`, `convex/discover.ts` |
| **AgentMail** | The inbox, in both directions. Families forward the deceased's bills in, which is how the app learns who must be told. Outbound notifications go out through the durable workpool with delivery state shown live, and replies thread onto the right organisation. | `convex/mail.ts`, `convex/http.ts` |
| **OpenAI** | Three jobs: extract a typed playbook from a scraped page, draft the letter from that organisation's stated requirements, and read the reply to work out what they are asking for next. | `convex/playbook.ts`, `convex/replies.ts` |

## One thing we will not pretend about

**Large banks do not accept a death notification by email.** We checked. Wells Fargo takes phone,
US mail, fax, a branch, or their upload portal. Chase takes a branch, phone, or mail.

So detecting the channel is the feature, not a limitation we work around. Where an organisation
accepts email, Kin runs the correspondence end to end. Where it does not, Kin produces the
exact postal packet, with the exact address including any internal mail code, marks it as an offline
step, and still catches the organisation's reply in the thread.

Any product in this space that claims to email your bank on your behalf has not read the bank's page.

---

## 2026-09-19 — Session 1: research, lock, scaffold

Picked the idea, and killed two earlier favourites by checking the field first.

**Field recon.** Found eleven entrant repos using the Convex + Firecrawl + AgentMail stack and
checked commit counts and live URLs on each. Ten of the eleven built variations of the same product:
watch an official page, detect that it changed, prove what it used to say. That collision killed two
ideas I had ranked highly (a rental-listing verifier, already occupied with 146 commits and a live
judge tour; a health-insurance appeal tool, already occupied with 297 commits).

**Probe before design.** Fetched nine real institutional death-notification pages before writing
anything. Three findings, all of which changed the design:

1. The pages carry facts no model knows. Wells Fargo's page gives a PO Box *with an internal mail
   code* (`Attention: D1118-02D`), an overnight address, a fax line, a named notarized form, and a
   document list that differs by account type. A model asked to guess this would be wrong, and the
   letter would go nowhere.
2. Hand-built URLs do not work. Four of nine guesses returned 404 and two returned 403 to a plain
   request. So the app has to search, then scrape. No URL table can ship.
3. The banks do not take email. See above. This reshaped the product rather than being hidden.

**Access priced at lock, not at the deadline.** Every external dependency has a stated cost, an
acquisition time, and a fallback tier that still runs and still demos. This surfaced a constraint that
would otherwise have broken the demo: AgentMail's free tier allows **three inboxes**, so
one-inbox-per-case is impossible. The app uses one shared inbox and routes by thread plus a case token.

**Scaffolded.** Convex app with both sponsor components mounted, schema written, build passing.
Firecrawl's key is wired through typed component env rather than an ambient variable, per the
component's own README.

Next: deploy the empty shell to a convex.site URL before any features, then the Phase 1 gate, which is
`D1118-02D` appearing in the browser having been read live from Wells Fargo's page, with that string
absent from the source.

## 2026-09-20 — Session 2: the sending half, and a security pass

**Read the APIs instead of guessing them.** Pulled AgentMail's and Firecrawl's own docs, then read
the installed component's type definitions directly out of `node_modules`. That gave the exact
surface rather than a plausible-looking invention: `handleWebhook`, `status` as a reactive query,
and an `onMessageReceived` hook that fires on every inbound message.

Two things came out of it.

**One open question closed.** AgentMail supports no plus-addressing and no catch-all. Confirmed in
both sources. Inbound mail is matched by thread id first, with a case code in the subject as the
fallback. The design never depended on it, so this cost nothing.

**One new trap found.** AgentMail has a restricted mode: until an account is claimed by its human, it
can only send to that human's own address, ten a day. An unclaimed account means a judge presses send
and nothing happens. There is now a preflight check that answers this, and whether Firecrawl can
reach the four hosts that matter, before anything is built on top of either.

**Security pass.** A background review flagged six issues across the new code. All six were real and
all six are fixed. The one worth describing:

This product reads pages it did not write, and then tells a grieving person where to post a certified
death certificate. That makes prompt injection the central threat, not a checklist item. A hostile or
spoofed page can try to make the model emit an attacker's address.

So nothing the model returns is trusted on its own. Page text is delimited and framed as data.
Then every contact fact, the postal address, the overnight address, the fax number, the phone number,
the form name, is checked back against the page, comparing on alphanumerics only so a reflowed
address still matches but an invented one cannot. Anything not literally on the page is dropped, and
the card tells the family which fields were dropped and to confirm those by phone. Portal links must
be https and on the same site we read. Source links are parsed, forced to https, and shown by hostname
so nobody has to take our word for whose page it was.

The other five: cases had no owner check (demo cases stay open so judges need no signup, real cases
are scoped to their creator), the case token used `Math.random` when it is really a credential
(now 16 characters from the CSPRNG), and five functions that only the server should call were publicly
callable (now internal).

**State:** the frontend build does not pass yet, and that is expected: it imports Convex's generated
API, which does not exist until the first `npx convex dev` creates the deployment. Nothing has run
against a live service.

**Renamed.** The project was called Afterward for its first two days. That name was soft in the way
funeral-industry branding is soft, and it described a mood rather than the work. **Kin** is the word
every one of these organisations already prints on its own form: next of kin. It names the person
using this, not the event, and it does not flinch.
