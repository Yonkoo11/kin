import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// ─────────────────────────────────────────────────────────────────────────────
// The headline is the one line a model is not allowed to write (copy-rules §1),
// because an invented headline silently becomes the product's voice. Swap the
// string below; nothing else depends on it.
//
// Alternatives offered to the author:
//   B  "Find out what each one actually needs, before you post anything."
//   C  "One person has to tell everyone. Kin works out what each of them needs."
const HEADLINE = "Thirty organisations need telling. Each one wants something different.";
// ─────────────────────────────────────────────────────────────────────────────

const CHANNEL_WORD: Record<string, string> = {
  email: "email",
  mail: "post",
  fax: "fax",
  phone: "phone",
  portal: "their own form",
  branch: "in person",
  unknown: "not stated",
};

function host(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "unverified source";
  }
}

export default function Landing({ onOpen, children }: { onOpen: () => void; children?: React.ReactNode }) {
  const wf = useQuery(api.playbooks.latest, { institutionName: "Wells Fargo" });
  const coverage = useQuery(api.playbooks.coverage, {});

  const takesEmail = coverage?.filter((c: any) => c.channel === "email").length ?? 0;
  const total = coverage?.length ?? 0;

  return (
    <div className="page">
      {/* 1 ── statement */}
      <div className="col">
        <span className="live">Reading pages live</span>
        <h1>{HEADLINE}</h1>
        <p className="lede">
          Kin reads each organisation&rsquo;s own page, works out what they need and how they
          will accept it, writes to them, and keeps every reply in one place.
        </p>
      </div>

      {/* 2 ── signature element: a real extraction, on the page */}
      <div className="panel">
        <span className="meta">
          Read from wellsfargo.com{wf ? ` · ${new Date(wf.scrapedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}` : ""}
        </span>
        {wf ? (
          <>
            <h3>Wells Fargo</h3>
            <p className="small">
              They will not take an email. Their page says to use their own form, post it, or
              fax it.
            </p>
            <div className="addr">
              <pre>
{"Wells Fargo Bank N.A.\nEstate Care Center\nAttention: "}<b>D1118-02D</b>{"\nPO Box 71208\nCharlotte, NC 28201-1245"}
              </pre>
            </div>
            <p className="panel-note">
              <b>D1118-02D</b> is their internal mail-stop code. No model knows that string;
              it was read off their page. Guess it and a certified death certificate goes
              nowhere. Every fact on this panel was checked back against the page it came
              from, and {wf.droppedFields?.length ? `${wf.droppedFields.length} that could not be confirmed were dropped` : "nothing failed that check"}.
            </p>
          </>
        ) : (
          <p className="small">Loading the last reading.</p>
        )}
      </div>

      {/* 3 ── the finding, as real records */}
      <section className="col">
        <h2>What they actually accept</h2>
        <p>
          Services in this space publish a number: over 1,000 organisations, over 1,400
          organisations. None of them will show you what a single one of those organisations
          actually asks for, because their coverage is a list somebody maintains by hand.
        </p>
        <p>
          Kin reads the page when you ask, so it can show you the record instead of the count.
          {total > 0 && (
            <>
              {" "}Of the {total} read so far, <b>{takesEmail} accepts email</b>.
            </>
          )}
        </p>
        <div className="rows">
          {coverage?.map((c: any) => (
            <div className="row" key={c.name}>
              <span className="row-name">{c.name}</span>
              <span className="row-meta">
                <span className={`chip ${c.channel === "email" ? "email" : ""}`}>
                  {CHANNEL_WORD[c.channel] ?? c.channel}
                </span>{" "}
                {c.ownDomain === false ? (
                  <span className="flag">not their own site</span>
                ) : (
                  host(c.sourceUrl)
                )}
              </span>
            </div>
          ))}
        </div>
        <p className="meta" style={{ marginTop: "0.9rem", display: "block" }}>
          Read from their own pages. Rows marked otherwise came from somebody writing about
          them, and the card says so.
        </p>
      </section>

      {/* 4 ── the only outside voice we have, and it is real */}
      <section className="col">
        <blockquote>
          We wasted hours and hours on hold, and got useless, disjointed replies to emails.
        </blockquote>
        <span className="meta">
          An executor, quoted by{" "}
          <a
            href="https://www.which.co.uk/news/article/probate-unpacked-one-in-five-find-settling-loved-ones-affairs-difficult-aUnzn5p0ShvK"
            target="_blank"
            rel="noreferrer noopener"
          >
            Which?
          </a>
          , 7 August 2025
        </span>
        <p className="small" style={{ marginTop: "1.2rem" }}>
          In the same study, around four in ten executors took more than three months to settle
          the finances with the bank alone.
        </p>
      </section>

      {/* 5 ── limits, before anyone finds them */}
      <section className="col">
        <h2>What this does not do</h2>
        <ul>
          <li>No probate filing. State law varies and this is not legal advice.</li>
          <li>
            Nothing is sent without you reading it. Every letter is drafted, shown, and sent on
            your click.
          </li>
          <li>
            It does not know which country you are in yet. Ask for Vanguard and it may read the
            Australian page.
          </li>
          <li>
            Some organisations publish no process at all. Then it says so instead of inventing
            one.
          </li>
        </ul>
      </section>

      {/* 6 ── the product */}
      <section className="col wide">
        <h2>Try it on one organisation</h2>
        <p className="small">
          An example estate, no account needed. Type a bank, a gym, a phone company.
        </p>
        <button onClick={onOpen}>Open an example estate</button>
      </section>

      {children}

      <footer className="col">
        <span className="meta">
          <a href="/judge">A guided tour</a> &nbsp;·&nbsp;{" "}
          <a href="https://github.com/Yonkoo11/kin" target="_blank" rel="noreferrer noopener">
            Source and build log
          </a>
        </span>
      </footer>
    </div>
  );
}
