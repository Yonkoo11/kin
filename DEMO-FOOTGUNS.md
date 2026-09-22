# DEMO-FOOTGUNS — Kin
Generated 2026-09-22, against the live production deployment.

| id | source | description | severity | workaround | fixable | status |
|---|---|---|---|---|---|---|
| FG-001 | measured live run | A lookup takes 41–68s. The card showed one static line, "Reading their page.", for all of it. On camera that is indistinguishable from a hang. | HIGH | none needed now | YES | **FIXED** — four real stages now written as each finishes; verified advancing live at 8s / 11s / 41s |
| FG-002 | served bundle inspection | The published site was built against the **dev** deployment (`upbeat-wolverine-16`) while the backend was deployed to **prod** (`acrobatic-condor-542`). The demo would have run on dev, which can be reset. | CRITICAL | none needed now | YES | **FIXED** — served bundle now contains `acrobatic-condor-542.convex.cloud`, verified by curl |
| FG-003 | repo inspection | `PROJECT_SPEC.md` and `VIDEO_SCRIPT.md` are unfilled templates with `<PROJECT>` placeholders. | LOW | do not open either file on camera | YES | open |
| FG-004 | run-to-run variance | Firecrawl search ranking is not deterministic. A run can land on a third-party page, in which case the card says so rather than implying authority. | LOW | if it happens on camera, say it out loud — the flag is the feature | ACCEPT-ONLY | accepted |
| FG-005 | live data | Only 1 of 7 organisations in the coverage set accepts email (Vanguard). | LOW | not a footgun — this is the product's central claim | n/a | accepted |

CRITICAL outstanding: 0. HIGH outstanding: 0.
