# Three directions — Kin landing + product surface

Written 2026-09-22 against `ai/design-research.md` (4 fetched comparables) and the taste
corpus. All four comparables are sans-serif on white with trust badges and a count of
organisations. Every direction below deliberately breaks at least two of those.

**Shared constraints, from the corpus:**
- ONE brand colour. Surface variety from opacity derivatives, not a second hue. (style.config)
- Tinted ground, never `#ffffff`, never `#0a0a0a`. (ER-1)
- Type ratio ≥ 4× between display and body. Current site is 1.3×, which is why it reads timid. (SR-2)
- Tokenised radius scale, ≥2 elevation levels, hover changes transform not just colour,
  `:focus-visible` everywhere, `clamp()` on display. (CF-1..CF-6)
- ONE signature element in the first viewport.
- No trust furniture. We have no awards, no press, no TrustPilot, and inventing them is banned.
- No 3-step "how it works". Three of four comparables use it; it is also explicitly forbidden.
- Headline is NOT model-written. Placeholder until the author picks. (copy-rules §1)

---

## Direction A — "The Ledger"

**Thesis:** this is a records product. It reads like a well-set ledger page, and the proof is
that the records are real.

- **Ground:** warm paper `#F7F3EA`. Ink `#17150F`. One accent: a deep ink-green `#2A5140`,
  used exactly three times (SR-5) — the live dot, the channel chip when a company accepts
  email, and the primary action.
- **Type:** display in the system serif stack (`Iowan Old Style, Baskerville, Times`) at
  `clamp(44px, 7vw, 76px)`, weight 400, `letter-spacing: -0.035em`, `line-height: 0.98`.
  Body in the same serif at 17px. Metadata and every address, fax and code in mono.
  Ratio 76/17 = **4.5×**.
- **Layout:** left-aligned, content occupying ~52% at desktop with a deliberate right void
  (SR-6). Rows separated by hairlines, no cards anywhere (SR-1). Metadata right-aligned to a
  second vertical axis (SR-3).
- **Signature element:** **the live extraction, running in the first viewport.** Not a
  screenshot. On load it runs one real organisation and the mail-stop code lands on screen.
  The one thing nobody else in the category can put on their page.
- **Motif:** the hairline rule plus a mono block. Used on the landing, on every card, and in
  the judge tour. One move, everywhere.
- **Elevation:** soft-elevation ladder (CF-5), two levels: the page rows sit flat on paper;
  the live extraction panel sits one step up with a layered warm shadow.
- **Section order:** statement → live extraction → what they actually accept (real table) →
  the executor's quote → what this does not do → the board.
- **Risk:** serif on cream can read as a blog if the display type is not big enough. Mitigated
  by the 4.5× ratio and the mono counterpoint.

## Direction B — "The Envelope"

**Thesis:** the page is shaped like the correspondence it produces. Reading it is reading a
letter with the organisation's requirements annotated in the margin.

- **Ground:** `#FBFAF7`. A single 1px vertical rule at the left margin running the full page,
  like ruled paper. Accent: postal red `#9B2D20`, used on the margin marks only.
- **Type:** body serif at 18px set to a 62ch measure. Margin annotations in mono at 12px,
  hanging in the left gutter.
- **Layout:** one column, offset left, with a permanent ~180px annotation gutter. The gutter
  carries the facts (address, form name, channel) while the main column carries the letter.
- **Signature element:** the margin gutter itself. Facts live beside the prose, never inside it.
- **Risk:** the gutter collapses on mobile and the whole idea with it. Also: it makes the
  landing page about the *letter*, which is exactly the "letter generator with extra steps"
  critique this product has to defeat.

## Direction C — "Who Takes What"

**Thesis:** lead with the finding. The landing page *is* the coverage table, because the
finding is the product.

- **Ground:** near-white `#FCFCFA` with a strong ink. Accent: one signal green for "accepts
  email", everything else neutral.
- **Type:** a heavy grotesque display at 80px against 15px body. Data in mono.
- **Layout:** a full-bleed table dominating the first viewport. Organisation, channel, source,
  what they want. The input row sits *inside* the table as the first row, so adding a company
  extends the thing you are already reading.
- **Signature element:** the channel chip, colour-coded, with email rare enough to stand out.
- **Risk:** a table as a hero is cold. This product's reader is not a data analyst, they are
  someone whose parent died on Tuesday. Direction C optimises for the judge and abandons the
  user, and the judging criteria explicitly reward "a real person would use this".

---

## Selected: **Direction A — The Ledger**

**Why, on evidence:**

1. **It differentiates on the measured finding.** All four comparables are sans on white with
   a count and trust badges. A serif editorial ledger with real extracted records is the
   opposite on every axis, and the difference is substantive rather than stylistic: they show
   a number, we show the record.
2. **The signature element is the one thing no competitor can copy.** Life Ledger and Settld
   cannot put a live extraction on their page — their coverage is a hand-maintained directory,
   so the contents are the asset. Kin reads the page at request time. Running it live in the
   first viewport is a moat expressed as a design decision.
3. **It serves the reader B and C do not.** B makes the page about the letter, which walks into
   the strongest criticism of the product. C makes it about the data, which serves a judge for
   ninety seconds and abandons the person it is for.
4. **It matches the register the category has already proven.** Life Ledger's tone — practical
   efficiency over sentiment — is the correct one, and a ledger is that register made visual.

**Carried over from B and C:** the mono treatment for facts comes from B's gutter idea,
applied inside the row rather than beside it. The channel chip comes from C, kept small.

**Signature element (declared):** the live extraction in the first viewport.
**Shadow philosophy (declared, CF-5):** soft-elevation ladder.
**Colour mode:** light-only. This is read once, in daylight, under stress. Dark has not earned
its place here and would make it feel like a developer tool.
