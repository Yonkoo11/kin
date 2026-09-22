# Vibe Apps submission: copy each block exactly

---

## App Title
Kin

---

## App/Project Tagline  (127 of 140 characters)
When someone dies, Kin reads each organisation's own page, works out what they require, and writes to them the way they accept.

---

## Description

## The problem

When someone dies, one person has to tell twenty or thirty organisations. Five of them are banks and pensions. The rest are the phone carrier, the streaming subscriptions, the gym, the storage unit, the HOA, the dentist, the employer's HR. Each one wants something different, and most will not tell you what until you have already waited on hold.

The thing almost every product in this space gets wrong is assuming you can email a bank about a death. You cannot. Wells Fargo takes phone, US mail, fax, a branch, or their own upload portal. Chase takes a branch, phone, or mail. We read their pages instead of guessing.

So working out which channel an organisation accepts is the product, not a detail to route around. Of the seven organisations Kin has read so far, one accepts email.

## How it works

You type a name. Nothing else.

Firecrawl searches for that organisation's own bereavement page. Search order is not source quality, so results get ranked rather than taken from the top: the organisation's own domain beats a forum thread that reads like policy. One early run pulled "your husband's account" out of a Spotify community post and presented it as a requirement, which is what that ranking exists to stop. If the best the open web offers is somebody writing about the organisation, Kin searches again pinned to their own site, and the card says where the facts came from.

Firecrawl then reads the page it picked, and OpenAI pulls out the fields a letter needs as structured output, so a missing field comes back visibly empty instead of quietly invented.

Then the part I care about most. Every contact fact is checked back against the page text before it is stored, comparing on alphanumerics only so a reflowed address still matches but an invented one cannot. Anything the model produced that is not literally on that page is dropped, and the card names what was dropped. On the run in the video, nothing was dropped.

The test for all of this is one string. Wells Fargo's postal address carries an internal mail code, D1118-02D, that exists on their page and nowhere else. Search the repository and you will not find it. If a model guessed that line, a certified death certificate would go to the wrong place.

AgentMail then writes the letter from that organisation's own stated requirements and watches one shared inbox for the reply, routed back to the right card by thread and case token. Where an organisation will not take email, Kin refuses to show a send button and produces the postal packet instead, with the mail code in it.

Convex runs all of it. The board updates live because the queries are reactive, the lookup is a scheduled action, the rate limiter and the static site are Convex components, and inbound mail arrives on a Convex HTTP action.

## What I would rather you heard from me than found

The send path has not been run end to end, because no organisation tested so far accepts email. Spotify and Netflix publish no bereavement process at all, so the honest result there is a flagged third-party source rather than an invented official one. Both of these are on the live site, not buried here.

## Why I built it

I wanted a project where being wrong has a cost you can point at. Most agent demos fail by sounding plausible. This one fails by sending a death certificate to an address that does not exist, which makes the grounding check the actual work rather than a feature on a list.

## Tech stack

Convex for the database, reactive queries, scheduled actions, HTTP actions, rate limiting and static hosting. Firecrawl for search and page reads, through the Convex component. OpenAI for structured extraction, with a three tier model chain that records which tier actually answered. AgentMail for the estate inbox and inbound webhooks. Convex Auth for sign in. React and Vite on the front end.

## Challenges

The first version hard-coded institution URLs. Four of nine were dead and two returned 403 to a plain request, which is why the search step exists at all.

A card could hang on "reading their page" forever. The first live run did exactly that on a billing error, so every failure path now writes a visible reason to the card.

The fallback model echoed the JSON schema back instead of an answer, and the naive first-brace parser accepted it. The parser now scans balanced braces and scores candidates by type before picking one.

The rate limiter locked me out mid test, which was the useful kind of bug: it showed that every anonymous visitor shared one bucket, so one judge could have locked out the next. It is now two tier, per case and global.

On the last day I found the published site was talking to my development backend while I was deploying the code to production. The address bar looked right, so nothing about it was visible from the outside.

## Measured on the production deployment

Seven organisations read, one of which accepts email. Model that read the page on the recorded run: gpt-5. Facts kept that were not on the source page: zero. Rate limit verified at five requests through and the sixth rejected. A full lookup takes about forty seconds, and the video shows one running start to finish without a cut.

---

## App Website Link
https://acrobatic-condor-542.convex.site

---

## Video Demo
NOT YET UPLOADED. The file is at video/out/demo.mp4 (2 minutes 9 seconds, 22 MB).
Upload it to YouTube as Unlisted, then paste the link here.

---

## Your Name
Mustapha Alex

---

## Email
mykdahunsi@gmail.com

---

## GitHub Repo URL
https://github.com/Yonkoo11/kin

---

## Upload Screenshot
submission/03-mailstop.png

## Additional Images
submission/01-landing.png
submission/02-judge-top.png
submission/04-channel.png

---

## Select Tags
convex, AllGasHackathon, OpenAI, Firecrawl, AgentMail
