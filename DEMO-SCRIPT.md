# DEMO-SCRIPT — Kin
Generated 2026-09-22 | Target: 150s (hackathon limit: under 180s)
audio_strategy: **separate** (silent screen capture, narration added in post)
pacing_mode: **gap**

## Pre-Recording Setup
- [x] Production deployment live and serving the prod bundle (verified by curl)
- [x] Firecrawl, AgentMail, OpenAI all answering (preflight green)
- [x] Stage ledger verified advancing on a real run
- [x] Capture at 1920x1080 — required by the video pipeline
- [x] Headless capture, so no desktop, notifications or other windows can leak in
- [ ] Do NOT open PROJECT_SPEC.md or VIDEO_SCRIPT.md on camera (FG-003)

## Filming Sequence

### Scene 1 — Landing — 0:00–0:18
Action: Load https://acrobatic-condor-542.convex.site, hold, then scroll slowly to the coverage rows.
Say:
[SUB] When someone dies, one person has to tell twenty or thirty organisations.
[SUB] Five are banks. The rest are the phone carrier, the gym, the storage unit.
[SUB] Each wants something different, and most will not say what until you have waited on hold.

### Scene 2 — The claim — 0:18–0:34
Action: Hold on the coverage rows showing the channel each organisation accepts.
Say:
[SUB] Most products in this space assume you can email a bank about a death.
[SUB] We checked their own pages instead. Of seven organisations, one accepts email.
[SUB] So working out the channel is the product, not a detail.

### Scene 3 — The core action, live, unedited — 0:34–1:20
Action: Load /judge. Let it run start to finish. No cuts.
**WAIT:** ~41s. The stage ledger is the thing to watch.
Say:
[SUB] This is running now, with one input: the words "Wells Fargo".
[SUB] Firecrawl finds their own page, because hard-coded URLs rot.
[SUB] Four of nine we tried by hand were wrong, and two refused to load.
[SUB] Then GPT-5 pulls the requirements out of the page it actually fetched.

### Scene 4 — The proof — 1:20–1:50
Action: Hold on the postal address block, then the dropped-fields line.
Say:
[SUB] The middle line is the one that matters. D1118-02D is an internal mail-stop code.
[SUB] No model knows that string. Search this repository and it is not there.
[SUB] Every contact detail is checked back against the page before it is stored.
[SUB] Anything the model produced that is not literally on that page is dropped, and named.

### Scene 5 — The channel, and the letter — 1:50–2:15
Action: Show channel = portal, then scroll to the drafted letter awaiting approval.
Say:
[SUB] Wells Fargo will not take this by email, so Kin does not pretend otherwise.
[SUB] It produces the postal packet, with the mail-stop code, and still catches the reply.
[SUB] Where an organisation does accept email, AgentMail runs the exchange end to end.
[SUB] Nothing is ever sent without approval.

### Scene 6 — Close — 2:15–2:30
Action: Hold the live URL on screen.
Say:
[SUB] Built on Convex. Every step you just watched ran live.
[SUB] It is at acrobatic-condor-542.convex.site.

## Do NOT Show During Recording
See DEMO-FOOTGUNS.md. Only FG-003 is open: do not open the two unfilled template files.

## Async Operation Timings
| Operation | Expected wait | What is on screen during it |
|---|---|---|
| Full lookup (search, read, extract, verify) | 41–68s | the stage ledger, striking each step through as it finishes |
