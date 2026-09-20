# Kin — company thesis

Status: draft
Started: 2026-09-19

> Method and the D0-D5 ladder: ~/.claude/skills/company-thesis/SKILL.md
> Lines starting with ">" are guidance and are ignored by company-check.sh.

## 1. Who exactly

The adult child who is named executor for the first time, is employed full time, and now has to
individually notify twenty to thirty separate organisations that their parent died: five or so banks
and pensions, and twenty-five small recurring relationships (phone carrier, streaming, gym, storage
unit, ISP, HOA, lawn service, local paper, dentist, employer HR).

**Count, with source:** 3,072,039 deaths occurred in the United States in 2024
(CDC/NCHS provisional, based on 99.9% of records processed as of 1 June 2025,
https://www.cdc.gov/nchs/products/databriefs/db548.htm). Most produce one person who does this work.
For scale of the counterparty list rather than the population: NotifyNOW markets a service that
notifies "2,000 financial institutions and service providers" of a death, which is the size of the
directory the problem implies.

**Contactable today:** independent funeral directors, who already hand every family a paper version
of this checklist and have nothing to hand them next; and the people posting in r/widowers and
r/EstatePlanning, who describe this exact work in public every week.

**What they do instead right now:** a printed checklist from the funeral home, a spreadsheet, and the
phone. They call each organisation, are put on hold, are told to post a certified death certificate to
an address they have to ask for, and then have no record of what was sent, to whom, or what came back.

**What it costs them:** *"We wasted hours and hours on hold, and got useless, disjointed replies to
emails"* (an executor, quoted by Which?, 7 August 2025). Around 4 in 10 executors took more than three
months just to settle the deceased's finances with the bank (same source). Meanwhile the small
recurring relationships keep billing, because nobody got to them.

## 2. Demand evidence

Level: D1

> D0 asserted · D1 a stranger's words in public · D2 a named requester · D3 a conversation
> D4 a commitment without money · D5 money or use.

- D1 2025-08-07 An executor, in Which?'s published investigation into probate and banks, in their own
  words: *"We wasted hours and hours on hold, and got useless, disjointed replies to emails."*
  Same piece: 1 in 5 executors found settling the finances with their bank difficult; around 4 in 10
  took more than three months.
  https://www.which.co.uk/news/article/probate-unpacked-one-in-five-find-settling-loved-ones-affairs-difficult-aUnzn5p0ShvK
- D1 2022 Maru Public Opinion polled 1,500+ Americans for ClearEstate: 74% of people who had acted as
  an executor said it was one of the most difficult challenges of their life; 63% said it disrupted
  their personal or professional life.
  https://www.clearestate.com/en-us/blog/exclusive-clearestate-poll-shows-estate-settlement-among-lifes-most-difficult-tasks
- D1 (market revealed, not asserted) Multiple businesses exist purely to publish per-institution death
  notification instructions, which only makes sense if people search for them constantly:
  swiftprobate.com/institutions/chase, simplytrust.com/financial-institutions/chase/death-claim,
  mygoodtrust.com. Their existence is evidence of the search demand and of the gap: they are static
  directories, and none of them carry out the correspondence.

**Not claimed:** no D2. Nobody has asked me for this by name. The honest level is D1, and the climb to
D2 is block 3, which happens this week rather than after the deadline.

## 3. Distribution

**Where the first 50 come from, ranked:**

1. **r/widowers and r/EstatePlanning.** Both allow a first-person post about a tool you built when it
   is free and you are present in the comments. This is where the D1 quotes came from in the first
   place, which means the audience is already assembled and already describing the problem.
2. **Independent funeral directors, by direct email.** They hand out the paper checklist today. They
   are a channel with a warm reason to pass something on, and they are reachable individually rather
   than through a platform. Twenty of them, named, one message each.
3. **The hackathon's own audience.** The submission post on X and LinkedIn tagging @convex, @OpenAI,
   @firecrawl and @agentmail is scored under "social proof", so it has to happen anyway; it costs
   nothing to make it a real launch post rather than a submission notice.
4. **Estate attorneys and probate paralegals on LinkedIn.** Lower volume, higher intent; they see the
   same failure repeatedly and have a professional reason to share a free tool.

**Sent: lines** (a channel is not distribution until a message has left; required by
`company-check.sh --ship` before filing):

- Sent: (pending) r/EstatePlanning — first-person post with the live convex.site URL
- Sent: (pending) 20 independent funeral homes, individually named, one email each
- Sent: (pending) X and LinkedIn launch post tagging the four sponsors

## 4. Why this team, why now

Domain: I work in medicine and have been on the clinical side of the moment this product starts at.
The gap between "the death is recorded" and "the paperwork is done" is one I have watched families
walk into without a map, and it is not a gap you find by reading about it.

Why now: the specific capability this needs did not exist as infrastructure until this year. An agent
with a real, stateful, threaded inbox (AgentMail) plus a crawler that returns structured facts from a
company's own page (Firecrawl) plus a backend where asynchronous multi-week state is the default rather
than a build (Convex) is a combination that would have been six months of plumbing in 2024. The
product is the loop; the loop is now assembleable.

## 5. After the deadline

- 2026-09-23 Post in r/EstatePlanning and r/widowers with the live URL, and answer every comment.
  Target: the first five real cases, from strangers, with real institution names.
- 2026-09-30 Twenty named independent funeral homes emailed individually. Target: three replies,
  one call. Any funeral director who agrees to hand out the link is a D4.
- 2026-10-15 Institution playbook coverage widened from the demo set to the fifty organisations that
  actually appear in the first real cases, prioritised by what users forwarded rather than by guesswork.
  Publish the coverage list openly, including what is missing.
- 2026-11-01 Decision point on the paid shape: the plausible one is per-estate pricing paid by the
  family, or a per-seat tool for funeral homes and estate attorneys. Not decided now, deliberately,
  because the first fifty cases decide which counterparties dominate and that determines the buyer.

## 6. Kill test

If by **2026-11-01** fewer than ten people outside my contacts have started a real case with a real
institution name in it, then the thing families want is not correspondence help, it is somebody else
doing it entirely, and this should stop being software and become nothing. I will look on that date
and write the answer in this file either way.

Second, earlier kill: if the day-one probe shows Firecrawl cannot reach the institution pages that
block plain requests (ssa.gov and fidelity.com both returned 403 on 2026-09-19), and the reachable set
is under about twenty institutions, the playbook is too thin to be worth a family's trust and the
product reduces to the static directories that already exist. Checked: 2026-09-20.
