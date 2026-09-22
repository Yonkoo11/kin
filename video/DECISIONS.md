# DECISIONS — Kin demo video

## Decision: Paper theme, not the skill's dark default
**Recommendation:** Kin's own tokens (paper #f7f3ea, ink #17150f, deep green #2a5140, serif).
**Rationale:** The skill's design principles say "dark theme always". Two things override it here.
Both screen recordings are of a light product, so a dark surround would fight every frame. And the
standing style rule is that dark must re-earn its place per project; for something opened by
someone whose parent died this week, it has not. The video matches the product instead.
**Override:** `COLORS` in `src/constants.ts`.
**Affected files:** constants.ts, all scenes, Subtitles.tsx.

## Decision: TTS narration, not human
**Recommendation:** edge-tts `en-US-BrianNeural`, atempo 1.12, GAP mode.
**Rationale:** The operator was away for the whole build window, so a human read was not available.
Gemini TTS was not reachable from this session; edge-tts serves the same neural voices and is the
standing free fallback. PLAYBACK_RATE stays 1.0 so atempo and playbackRate cannot stack.
**Override:** re-record narration and switch PACING_MODE to "speed".

## Decision: 1280x720 layout captured at 1.5x device scale
**Recommendation:** Capture the page as a 1280px-wide screen, rendered at 1920x1080 real pixels.
**Rationale:** The first cut captured at a true 1920px viewport. The reading column is capped at
40rem, so it filled about a third of the frame and two thirds sat empty. Laying out at 1280px puts
the column at roughly half the frame and makes the body text legible at 1080p, with no loss of
output resolution.
**Override:** `VP` in the capture script.

## Decision: the core action runs once, unedited
**Recommendation:** The 44-second lookup plays in full. No cuts, no speed-up.
**Rationale:** The house rule is that a cut inside the core action reads as a hidden failure. It is
watchable now because the stage ledger strikes each step through as it genuinely finishes — a fix
made during rehearsal, after the old card showed one static line for the whole minute.

## Correction made during the cut
The first narration said AgentMail "runs the exchange end to end". The product's own page says that
send path has **not** been run end to end, because no organisation tested so far accepts email. The
line was rewritten to say what is actually true, and the video now reads that limitation aloud.
