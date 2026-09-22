# Build brief — Kin, Direction A "The Ledger"

Every value here is a decision. Anything not written down will be invented at build time,
and the invented values are where the design leaks away.

## Tokens

```
--paper:        #F7F3EA   /* warm ground. never #fff (ER-1) */
--paper-raised: #FCFAF4   /* elevation level 2 */
--ink:          #17150F
--ink-2:        #5E5749   /* secondary text */
--ink-3:        #8A8273   /* metadata */
--rule:         #E0D8C6   /* hairline */
--rule-strong:  #CFC4AC
--accent:       #2A5140   /* ONE colour. three uses only (SR-5) */
--accent-wash:  rgba(42,81,64,0.10)
--flag:         #9B4A22   /* not a second brand colour: warnings only */
```

Accent's three permitted uses: the live dot, the "accepts email" chip, the primary action.
Nowhere else.

## Radius scale (CF-1 — tokens only, zero literals in components)

```
--r-sm: 2px    /* chips, inputs */
--r-md: 4px    /* buttons */
--r-lg: 8px    /* the raised panel */
```

## Elevation ladder (CF-2, CF-5 — soft-elevation ladder declared)

```
--e-1: 0 1px 2px rgba(50,40,20,0.05);
--e-2: 0 1px 2px rgba(50,40,20,0.05),
       0 4px 10px -2px rgba(50,40,20,0.07),
       0 12px 28px -8px rgba(50,40,20,0.08);
```
Level 1: inputs, chips. Level 2: the live extraction panel, and nothing else.
Rows use hairlines and carry no shadow (SR-1). A border never replaces elevation.

## Type

Display: `"Iowan Old Style", Baskerville, "Times New Roman", serif` — a system stack, no
webfont, no layout shift (ER-2).

```
--t-display: clamp(2.6rem, 7vw, 4.75rem);  /* 76px ceiling */
--t-h2:      clamp(1.35rem, 2.6vw, 1.75rem);
--t-body:    1.0625rem;                     /* 17px */
--t-small:   0.875rem;
--t-meta:    0.75rem;                       /* mono, tracked +0.08em, uppercase */
```
Ratio 76 / 17 = **4.5×** (SR-2; the current site is 1.3×, which is the core defect).
Display: weight 400, `letter-spacing: -0.035em`, `line-height: 0.98`.
Body `line-height: 1.6`, measure capped at `34rem`.
Mono: `ui-monospace, "SF Mono", Menlo` for every address, code, fax, phone and channel.

## Layout

Desktop: content column `min(52vw, 40rem)`, left-aligned at a `max(6vw, 2rem)` left margin,
right side deliberately empty (SR-6). Not centered.
The live panel may extend to `min(64vw, 50rem)` — the one asymmetric break.
Mobile ≤ 620px: single column, 20px side padding, panel full width.

Section rhythm, deliberately uneven (forbidden-patterns bans uniform vertical rhythm):
`7rem` after the statement, `4.5rem` between record sections, `6rem` before the board.

## Motion

Hover 160ms, press 80ms, panel content arrival 280ms.
Easing `cubic-bezier(0.23, 1, 0.32, 1)` everywhere. No `ease-in`.
Hover changes `transform` and `box-shadow`, never colour alone (CF-4), inside
`@media (hover: hover)`.
`:focus-visible` = `box-shadow: 0 0 0 3px var(--accent-wash)`.
One ambient element only: the live dot, a 2.4s breathing opacity. Respects
`prefers-reduced-motion`.

## Copy — verbatim, and what the model may not write

**Headline: `[HEADLINE — from the author]`.** copy-rules §1 forbids a model-written headline.
Three candidates offered separately; until one is chosen the slot renders the placeholder.

Fixed copy that IS permitted (mechanical, not voice):
- Live panel eyebrow: `RUNNING NOW · ONE INPUT: "WELLS FARGO"`
- Coverage table heading: `What they actually accept`
- Coverage footnote: `Seven organisations, read from their own pages on 22 September 2026.`
- Limits heading: `What this does not do`
- Quote attribution: `An executor, quoted by Which?, 7 August 2025`

Banned in all copy: seamless, effortless, powerful, revolutionary, simply, just, unleash,
elevate. No invented metric. No testimonial. No award. No press logo.

## Section order (landing)

1. Statement — headline + one sentence + the live dot
2. **The live extraction panel** (signature element, first viewport on desktop)
3. What they actually accept — the real seven-organisation table
4. The executor's quote, attributed and linked
5. What this does not do — four honest lines
6. The board (the working product)

No "how it works". No three numbered steps. No trust badges.

## Output contract

Files: `src/Landing.tsx` (new), `src/index.css` (rewritten), `src/App.tsx` (routes to Landing),
`src/Organisation.tsx` and `src/Judge.tsx` (ported to the tokens).
Stack unchanged: React + Vite + plain CSS. No Tailwind, no UI library, no icon library,
no webfont, no new dependency.

## Acceptance checklist

- [ ] Zero `border-radius` literals outside `:root`
- [ ] ≥2 elevation levels as tokens; no flat 1px-border card anywhere
- [ ] Every `:hover` changes transform or shadow, not colour alone
- [ ] `:focus-visible` present and visible on every control
- [ ] `clamp()` on display type; ratio ≥4×
- [ ] Accent appears exactly three times
- [ ] Ground is neither `#ffffff` nor `#000000`
- [ ] No three-column equal card grid; no icon+title+subtitle boxes
- [ ] No invented number, testimonial, award or press logo
- [ ] Headline slot is the author's words or the labeled placeholder
- [ ] Rendered and viewed at 1280px and 390px before it is called done
