# <PROJECT> — functional spec

One sentence: **<what it does, for whom, using whose technology>.**

## Phase 1 Gate

- **Core Action:** <one sentence a person does, end to end>
- **Success Test (binary):** <a yes/no test with no room to argue>
- **Min Tech:** <only what the core action needs>
- **NOT Phase 1:** <everything deferred>
- **Status:** [ ] NOT STARTED

## How it works

<The mechanism, in the order data moves through it. Name the sponsor technology at the step where
it is actually load-bearing — if you cannot point at that step, the integration is decorative.>

## Backend tiers

| tier | needs | behaviour |
|---|---|---|
| 1 | <the paid key> | <full> |
| 2 | <free tier> | <limits> |
| 3 | <local> | <degraded, honest> |
| 4 | nothing | <deterministic stand-in, still demos> |

## What it will never claim

<The honesty boundary. State the thing the product refuses to assert, and what it says instead.>

## Deliverables

- [ ] Live URL: `<https://...>` (day one, before features)
- [ ] Demo video under 2 min
- [ ] `SUBMISSION.md` one-pager
- [ ] Repo public and readable
