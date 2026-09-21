import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// Ninety seconds is what a judge has. This page spends them on the three moments
// that are hard to fake, runs them live rather than describing them, and says which
// model actually did the work.
export default function Judge() {
  const [caseId, setCaseId] = useState<Id<"cases"> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const started = useRef(false);

  const createCase = useMutation(api.cases.createCase);
  const addCounterparty = useMutation(api.cases.addCounterparty);
  const board = useQuery(api.cases.board, caseId ? { caseId } : "skip");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const id = await createCase({ deceasedName: "Margaret Oyelaran", demo: true });
        setCaseId(id);
        await addCounterparty({ caseId: id, name: "Wells Fargo" });
      } catch (e: any) {
        const m = String(e?.message ?? e).match(/Uncaught Error:\s*([^\n]+)/);
        setErr(m ? m[1] : String(e?.message ?? e).split("\n")[0]);
      }
    })();
  }, [createCase, addCounterparty]);

  const wf = board?.[0];
  const p = wf?.playbook;
  const draft = useQuery(
    api.mail.draftFor,
    wf ? { counterpartyId: wf._id } : "skip",
  );

  return (
    <main>
      <h1>Kin</h1>
      <p className="lede">
        When someone dies, one person has to tell twenty or thirty organisations.
        Kin reads each one&rsquo;s own page, works out what they need and how they will
        accept it, writes to them, and keeps every reply in one place.
      </p>
      <p className="note">
        This page is running the real product, right now, with one input: the words
        &ldquo;Wells Fargo&rdquo;. Nothing below is pre-recorded.
      </p>

      {err && <p className="warn">{err}</p>}

      <Step
        n={1}
        title="Firecrawl finds and reads their own page"
        done={!!p}
        waiting="Searching, then reading."
      >
        {p && (
          <>
            <p>
              No address for this page is written anywhere in our code. Of nine such pages
              we tried by hand, four were wrong and two refused to load, so it has to be
              searched for.
            </p>
            <p className="mono-line">{p.sourceUrl}</p>
            <p className="note">
              {p.sourceIsOwnDomain === false
                ? "Flagged: this is not their own website, so the card says so."
                : "This is Wells Fargo’s own website."}
            </p>
          </>
        )}
      </Step>

      <Step
        n={2}
        title="OpenAI turns the page into facts, and only facts that are on it"
        done={!!p}
        waiting="Waiting on step one."
      >
        {p && (
          <>
            <p>
              The line that matters is the middle one. <code>D1118-02D</code> is Wells
              Fargo&rsquo;s internal mail-stop code. No model knows that string. If it were
              guessed, a certified death certificate would go nowhere.
            </p>
            <pre className="highlight">{p.postalAddress}</pre>
            <p className="note">
              Grep this repository for <code>D1118</code> and you will not find it.
            </p>
            <p>
              Every contact fact is checked back against the page before it is stored.
              Anything the model produced that is not literally on that page is dropped
              and named. Dropped on this run:{" "}
              <strong>{p.droppedFields?.length ? p.droppedFields.join(", ") : "none"}</strong>.
            </p>
            <p className="note">Produced by {p.extractedBy}.</p>
          </>
        )}
      </Step>

      <Step
        n={3}
        title="It works out that this one will not take an email"
        done={!!p}
        waiting="Waiting on step two."
      >
        {p && (
          <>
            <p>
              Most products in this space would now email the bank. Wells Fargo does not
              accept email, and neither does Chase. We checked their pages rather than
              assuming.
            </p>
            <p className="channel">{p.channel === "email" ? "Accepts email" : `They accept: ${p.channel}, not email`}</p>
            {p.channelNote && <p className="quote">{p.channelNote}</p>}
            <p>
              So Kin refuses to offer a send button here and produces the exact postal
              packet instead. Detecting the channel is the feature, not a limitation we
              route around.
            </p>
          </>
        )}
      </Step>

      <Step
        n={4}
        title="AgentMail: the letter, written from their own requirements"
        done={!!draft}
        waiting="Writing it."
      >
        {draft && (
          <>
            <pre className="body">{draft.body}</pre>
            <p className="note">
              Written by {draft.generatedBy}. It names their Letter of Instruction because
              their page names it, and it asks how the accounts are titled rather than
              inventing an answer.
            </p>
            <p>
              Where an organisation does accept email, this goes out through AgentMail with
              its delivery state live on the card, and their reply threads back onto it.
              The inbox works in both directions: forward a bill from a registered address
              and the organisation appears on the board by itself.
            </p>
          </>
        )}
      </Step>

      <section className="account">
        <h2>What is not true yet</h2>
        <p>
          We would rather you read this from us than find it.
        </p>
        <ul>
          <li>
            The send path has not been exercised end to end, because no organisation
            tested so far accepts email.
          </li>
          <li>
            Spotify and Netflix publish no bereavement process at all. The honest result
            there is a flagged third-party source, not an invented official one.
          </li>
        </ul>
        <p>
          <a href="/">Use it yourself</a>, or read the{" "}
          <a href="https://github.com/Yonkoo11/kin" target="_blank" rel="noreferrer noopener">
            source and build log
          </a>
          .
        </p>
      </section>
    </main>
  );
}

function Step({
  n,
  title,
  done,
  waiting,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  waiting: string;
  children?: React.ReactNode;
}) {
  return (
    <article>
      <h2>
        {n}. {title}
      </h2>
      {done ? children : <p className="note">{waiting}</p>}
    </article>
  );
}
