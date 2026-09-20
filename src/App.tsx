import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// The source URL comes from a web search, so it is not ours and is not trusted.
// Only ever render it as a plain https link, and always show the host, so a person
// can see for themselves whose page this came from before acting on it.
function safeSource(raw: string): { href: string; host: string } | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    return { href: u.toString(), host: u.hostname };
  } catch {
    return null;
  }
}

const CHANNEL_LABEL: Record<string, string> = {
  email: "Accepts email",
  mail: "Post only",
  fax: "Fax",
  phone: "Phone only",
  portal: "Their own upload page",
  branch: "In person",
  unknown: "Not stated on their page",
};

export default function App() {
  // A judge lands here with no account. The demo case is open from the first click.
  const [caseId, setCaseId] = useState<Id<"cases"> | null>(null);
  const [name, setName] = useState("");

  const createCase = useMutation(api.cases.createCase);
  const addCounterparty = useMutation(api.cases.addCounterparty);
  const board = useQuery(api.cases.board, caseId ? { caseId } : "skip");

  async function start() {
    setCaseId(await createCase({ deceasedName: "Demo estate", demo: true }));
  }

  return (
    <main>
      <h1>Kin</h1>
      <p>
        When someone dies, one person has to tell twenty or thirty organisations. Each wants
        something different, and most will not tell you what until you have waited on hold.
      </p>

      {!caseId ? (
        <>
          <p>Kin reads each organisation's own page, works out what they need and how they
            accept it, writes to them, and keeps every reply in one place.</p>
          <button onClick={start}>Open a demo estate</button>
        </>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addCounterparty({ caseId, name: name.trim() });
              setName("");
            }}
          >
            <label htmlFor="org">Who needs to be told?</label>
            <input
              id="org"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Wells Fargo"
              autoComplete="off"
            />
            <button type="submit">Find out what they need</button>
          </form>

          {board === undefined && <p className="muted">Loading.</p>}
          {board?.length === 0 && (
            <p className="muted">Nothing added yet. Try Wells Fargo.</p>
          )}

          {board?.map((c: any) => (
            <article key={c._id} className="card">
              <h2>{c.name}</h2>

              {c.state === "researching" && (
                <p className="muted">Reading their page.</p>
              )}

              {c.state === "needs_action" && !c.playbook && (
                <p className="warn">{c.nextAction}</p>
              )}

              {c.playbook && (
                <>
                  <p className={c.playbook.channel === "email" ? "tag ok" : "tag"}>
                    {CHANNEL_LABEL[c.playbook.channel] ?? c.playbook.channel}
                  </p>
                  {c.playbook.channelNote && <p>{c.playbook.channelNote}</p>}

                  <dl>
                    {c.playbook.postalAddress && (
                      <>
                        <dt>Send it to</dt>
                        <dd className="mono">{c.playbook.postalAddress}</dd>
                      </>
                    )}
                    {c.playbook.formName && (
                      <>
                        <dt>They name a form</dt>
                        <dd>{c.playbook.formName}</dd>
                      </>
                    )}
                    {c.playbook.faxNumber && (
                      <>
                        <dt>Fax</dt>
                        <dd className="mono">{c.playbook.faxNumber}</dd>
                      </>
                    )}
                    {c.playbook.requiredDocuments?.length > 0 && (
                      <>
                        <dt>What they ask for</dt>
                        <dd>
                          <ul>
                            {c.playbook.requiredDocuments.map((d: string, i: number) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </dd>
                      </>
                    )}
                    {c.playbook.accountTypeNotes && (
                      <>
                        <dt>Depends on the account</dt>
                        <dd>{c.playbook.accountTypeNotes}</dd>
                      </>
                    )}
                  </dl>

                  {c.playbook.droppedFields?.length > 0 && (
                    <p className="warn">
                      Some details could not be confirmed on their page and were left
                      out rather than guessed: {c.playbook.droppedFields.join(", ")}.
                      Check those by phone before sending anything.
                    </p>
                  )}

                  {/* Every fact on this card is traceable to the page it came from,
                      and the host is named so nobody has to take our word for it. */}
                  {(() => {
                    const src = safeSource(c.playbook.sourceUrl);
                    return (
                      <p className="muted">
                        Read on {new Date(c.playbook.scrapedAt).toLocaleDateString()} from{" "}
                        {src ? (
                          <a href={src.href} target="_blank" rel="noreferrer noopener">
                            {src.host}
                          </a>
                        ) : (
                          "a source we could not verify — treat this card with suspicion"
                        )}
                        .
                      </p>
                    );
                  })()}
                </>
              )}
            </article>
          ))}
        </>
      )}
    </main>
  );
}
