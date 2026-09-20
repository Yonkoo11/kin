# probe/

Throwaway scripts whose only job is to find out what the sponsor's technology **actually does**,
before any feature code is written.

On a new chain or a freshly-released SDK the model has no training data, so it invents an API and
the build dies in integration on the last day. An hour here removes that entire failure class.

Real examples from studied projects: a chain probe (which endpoints respond, what the log-query
limits really are, which canonical contracts are actually deployed), and a contract-hop probe
(which encrypted types survive a contract-to-contract call — the answer contradicted the docs).

## What a probe answers

- which endpoint actually responds, and which documented one is dead
- the real request/response envelope, captured not assumed
- real limits — rate caps, block-range caps, gas-estimation accuracy
- what fails **silently**, which is the expensive category
- if there is a grader: how it actually scores, measured against known inputs

## Rules

1. Probes are disposable. They do not need to be clean.
2. Every finding goes into `CLAUDE.md` under **Verified Facts**, with the probe file and the date.
3. A probe run against an environment that lacks the sponsor's runtime proves nothing. Say so.
4. Findings outrank documentation. Docs go stale; a dated measurement does not.
