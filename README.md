# Kin

![channel detection](https://img.shields.io/badge/channel_detection-Wells_Fargo%3A_portal_not_email-1a7f37)
![grounding](https://img.shields.io/badge/invented_facts_dropped-0_on_clean_runs-1a7f37)
![rate limit](https://img.shields.io/badge/rate_limit-5_through_6th_rejected-1a7f37)
![primary model](https://img.shields.io/badge/primary_model-gpt--5_on_the_live_site-1a7f37)

**The death admin inbox.**

When someone dies, one person has to tell twenty or thirty separate organisations. Five are banks
and pensions. The rest are the phone carrier, the streaming subscriptions, the gym, the storage
unit, the HOA, the lawn service, the dentist, the employer's HR. Each wants something different,
and most will not tell you what until you have already waited on hold.

Kin reads each organisation's own page, works out what they require and **which channel they
actually accept**, writes to them, and keeps every reply on one live board.

**Live:** https://acrobatic-condor-542.convex.site
**Build log (what judges read):** [hackathon.md](hackathon.md)

Built for the Convex All Gas Hackathon, 25 August to 22 September 2026.

---

## The thing most products in this space get wrong

**Large banks do not accept a death notification by email.** We checked their pages rather than
assuming. Wells Fargo takes phone, US mail, fax, a branch, or their own upload portal. Chase takes
a branch, phone, or mail.

So detecting the channel is the feature, not a limitation to route around. Where an organisation
accepts email, Kin runs the correspondence end to end. Where it does not, Kin produces the exact
postal packet, with the exact address including any internal mail-stop code, and still catches
their reply in the thread.

## Verify it yourself

Every output below was produced by a run against the production deployment before this was written.

```bash
git clone https://github.com/Yonkoo11/kin && cd kin && npm install
npx convex dev            # creates your own deployment
npx convex env set FIRECRAWL_API_KEY  fc-...
npx convex env set AGENTMAIL_API_KEY  ...
npx convex env set AGENTMAIL_INBOX_ID you@agentmail.to
npx convex env set OPENAI_API_KEY     sk-...
```

Then, with only the words "Wells Fargo" as input:

```bash
CASE=$(npx convex run cases:createCase '{"deceasedName":"Test","demo":true}' | tr -d '"')
npx convex run cases:addCounterparty "{\"caseId\":\"$CASE\",\"name\":\"Wells Fargo\"}"
sleep 60
npx convex run cases:board "{\"caseId\":\"$CASE\"}"
```

Expected, and what a real run returned:

```
"channel": "portal"                          <- not email. This is the point.
"formName": "Letter of Instruction"
"faxNumber": "1-866-358-1145"
"postalAddress": "Wells Fargo Bank N.A.
                  Estate Care Center
                  Attention: D1118-02D       <- their internal mail-stop code
                  PO Box 71208
                  Charlotte, NC 28201-1245"
"droppedFields": []                          <- nothing failed the grounding check
```

`D1118-02D` appears nowhere in this repository. Check:

```bash
grep -rn "D1118" --include="*.ts" --include="*.tsx" convex/ src/    # no matches
```

That is the whole proof. The address was read off their live page, not recalled by a model.

## How it is built

| Piece | What it does here |
|---|---|
| **Convex** | The backend. Reactive queries drive the board, scheduled functions chase silence, HTTP actions take both webhooks, four components are registered. |
| **Firecrawl** | `search` finds each organisation's page from its name alone, `scrape` reads it. No institution URL is hardcoded anywhere. |
| **AgentMail** | One shared inbox, in both directions: outbound notifications with live delivery state, inbound replies threaded onto the right organisation. |
| **OpenAI** | Extracts the typed playbook from a page, writes the letter from that organisation's own requirements, reads the reply for what they actually want. |

## Reading pages we did not write

The product reads untrusted web pages and then tells a grieving person where to post a certified
death certificate. That makes prompt injection the central threat, not a checklist item.

Nothing the model returns is trusted alone. Page text is delimited and framed as data. Every
contact fact is then checked back against the page, comparing on alphanumerics so a reflowed
address still matches but an invented one cannot. Anything not literally on the page is dropped,
and the card names which fields were dropped and tells the family to confirm those by phone.
Portal links must be https and on the same site that was read.

Model output is never spread into the database; fields are picked by hand.

## What this does not do, on purpose

- **No probate filing.** State law varies and this is not legal advice. It notifies and closes.
- **No auto-send.** Every message is drafted, shown, and sent on a human click. An agent that
  writes to twenty organisations about a death unattended is not something anyone should trust.
- **No claim that a bank accepts email when it does not.**

## Honest state

| Claim | Status |
|---|---|
| Finds and reads an organisation's real page | Run against production. Wells Fargo, Chase, Netflix, Spotify. |
| Returns facts a model cannot know | Verified: `D1118-02D`, absent from this repo. |
| Detects the accepted channel | Verified: Wells Fargo classified `portal`, not email. |
| Grounding check drops invented facts | Implemented and exercised; `droppedFields` empty on clean runs. |
| Writes the letter from their stated requirements | Verified on production. |
| Rate limiting | Verified: five calls through, sixth rejected. |
| Inbound webhook, signature-verified | Registered on production, secret set. **Round trip not yet exercised.** |
| OpenAI as the primary model | Running on the live site. A production run on 2026-09-22 recorded `extractedBy: gpt-5` for the page extraction and the letter, with nothing dropped by the grounding check. Reachable three ways in order: Convex AI Gateway, OpenAI directly, then a declared fallback; every playbook records which one ran. |
| Send path end to end | **Not yet exercised.** No organisation tested so far accepts email. |
| Auth, multi-user cases | **Not built yet.** Demo cases are open by design so judges need no signup. |

## Layout

```
convex/
  schema.ts        cases, counterparties, playbooks, drafts
  cases.ts         the board, authorization, the routing token
  research.ts      search -> scrape -> typed playbook, with the grounding check
  drafts.ts        writes the letter from the playbook
  mail.ts          outbound send, delivery state
  inbound.ts       routes an incoming reply to the right organisation
  replies.ts       reads the reply for what they actually asked for
  llm.ts           OpenAI primary, declared fallback, records which ran
  limits.ts        rate limits on the open paths
  webhooks.ts      registers the inbound webhook from inside the deployment
  preflight.ts     does the account work, can Firecrawl reach these hosts
  http.ts          both webhooks, then the static site
src/               the board
```

## Licence

MIT. See [LICENSE](LICENSE).
