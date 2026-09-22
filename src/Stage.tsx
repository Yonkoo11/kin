// A research run takes about a minute. For most of that minute the old card said
// "Reading their page." and nothing else, which is indistinguishable on screen from
// a card that has hung — the exact failure this product had in its first live run.
//
// So the four steps are listed, and each one is struck through as it genuinely
// finishes. Nothing here is on a timer: the stage is written to the database by the
// step that just completed. If the run stalls, the list stops moving, which is the
// truth. The second column names what did the work, because where a fact came from
// is the thing this product asks to be trusted on.
const STEPS = [
  { key: "searching", label: "Finding their own page", by: "Firecrawl" },
  { key: "reading", label: "Reading that page", by: "Firecrawl" },
  { key: "extracting", label: "Pulling out what they require", by: "OpenAI" },
  { key: "verifying", label: "Checking every detail against the page", by: "Kin" },
] as const;

export default function Stage({ stage }: { stage?: string }) {
  const at = STEPS.findIndex((s) => s.key === stage);
  return (
    <ol className="stage" aria-live="polite" data-stage={stage ?? "none"}>
      {STEPS.map((s, i) => (
        <li key={s.key} className={i < at ? "done" : i === at ? "now" : ""}>
          <span>{s.label}</span>
          <span className="stage-by">{s.by}</span>
        </li>
      ))}
    </ol>
  );
}
