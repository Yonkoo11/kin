# Kin — design direction

Chosen 2026-09-21. One direction, committed, before any code.

## What this screen is actually for

A person who has been awake since 4am, is doing this between other obligations, and is
frightened of getting it wrong. They are not browsing. They want to know what one company
needs and whether it has been done.

The output of this product is a letter. So the interface should read like a well-set
document, not like a control panel.

## Comparables studied

- **GOV.UK service pages.** The benchmark for serious information with zero decoration.
  Black on white, one column, generous measure, no icons, no cards. Nothing on the page
  that is not load-bearing. This is the closest match in tone and stakes.
- **Monzo and Starling bereavement flows.** Warm without performing sympathy. Short
  sentences. They never say "we're so sorry for your loss" twice.
- **A physical estate letter.** The thing being produced. Serif, ragged right, plenty of
  air around the address block.

## The direction: a letter, not a dashboard

| Decision | Why |
|---|---|
| Serif body, ~17px, 1.6 line height | It is a document. Serif signals correspondence, not software. |
| Cream ground (`#faf7f2`), near-black ink | Paper, not screen. Pure white under fluorescent hospital light is harsh. |
| One column, 34rem measure | Reading, not scanning. A dashboard grid implies you should compare things; you should not. |
| No cards, no shadows, no rounded panels | A hairline rule between organisations is enough. Shadows are a dashboard tell. |
| No icons anywhere | Icons here are decoration. Words are unambiguous, which matters when wrong means a lost death certificate. |
| Status as a sentence, not a badge | "Waiting for them to reply" beats a coloured pill labelled AWAITING. |
| Address in monospace | It is a string to copy exactly. Monospace signals "transcribe this precisely". |
| Colour used twice only | Quiet green when a company accepts email; rust when something needs checking by hand. Nothing else is coloured. |
| No animation | Nothing here should feel lively. |

## Forbidden, explicitly

- The dark / Inter / mono template. Starting there is how every AI project looks identical.
- Gradients, glassmorphism, glow, emoji, progress rings, confetti.
- Sympathy copy. One restrained line at most, never repeated. The kindness is in getting
  the address right, not in the adjectives.
- The words "seamless", "effortless", "powerful", "revolutionary".

## Copy rules

- Second person, present tense. "Send it" not "Submit notification".
- Name the company, never "the institution".
- Every uncertainty stated plainly: "check this by phone before sending anything".
- Never imply something was done when it was not.
