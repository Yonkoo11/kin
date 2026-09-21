import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// How each organisation says it will accept the news. This is the fact families get
// wrong most often, so it is the first thing on the card and it is written as a sentence.
const CHANNEL: Record<string, string> = {
  email: "Accepts email",
  mail: "Post only. They will not take an email",
  fax: "Fax. They will not take an email",
  phone: "By phone only",
  portal: "Their own upload page. They will not take an email",
  branch: "In person",
  unknown: "Their page does not say",
};

// The source URL came from a web search, so it is not ours and is not trusted.
// Render it only as a plain https link, and always show the host, so a person can
// see whose page this came from before acting on anything on this card.
function safeSource(raw: string): { href: string; host: string } | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    return { href: u.toString(), host: u.hostname.replace(/^www\./, "") };
  } catch {
    return null;
  }
}

// An organisation that will not take email still has to be told, and the family does
// that themselves. Kin says exactly how, and records that they did, rather than
// pretending an offline step happened on its own.
const OFFLINE_INSTRUCTION: Record<string, string> = {
  mail: "Print the letter above, enclose what they asked for, and post it to the address above.",
  portal: "Use their upload page above. Paste the letter in and attach what they asked for.",
  fax: "Fax the letter and the documents to the number above.",
  phone: "Call the number above. Keep the letter next to you; it has everything they will ask.",
  branch: "Take the letter and the documents into a branch.",
  unknown: "Their page does not say how they take this. Call the number above and ask before sending anything.",
};
const OFFLINE_VERB: Record<string, string> = {
  mail: "post", portal: "their upload page", fax: "fax", phone: "phone", branch: "hand, at a branch",
};
const OFFLINE_DONE: Record<string, string> = {
  mail: "I have posted it",
  portal: "I have uploaded it",
  fax: "I have faxed it",
  phone: "I have called them",
  branch: "I have taken it in",
  unknown: "I have contacted them",
};

export default function Organisation({ c }: { c: any }) {
  const p = c.playbook;
  const draft = useQuery(api.mail.draftFor, { counterpartyId: c._id });
  const send = useMutation(api.mail.approveAndSend);
  const markOffline = useMutation(api.cases.markSentOffline);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const delivery = useQuery(
    api.mail.deliveryState,
    draft?.sentMessageId ? { draftId: draft._id } : "skip",
  );

  const acceptsEmail = p?.channel === "email";
  const src = p ? safeSource(p.sourceUrl) : null;

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr(null);
    try {
      await fn();
    } catch (e: any) {
      const m = String(e?.message ?? e).match(/Uncaught Error:\s*([^\n]+)/);
      setErr(m ? m[1] : String(e?.message ?? e).split("\n")[0]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article>
      <h2>{c.name}</h2>

      {c.state === "researching" && <p className="note">Reading their page.</p>}

      {c.nextAction && <p className={p ? "next" : "warn"}>{c.nextAction}</p>}

      {p && (
        <>
          <p className={acceptsEmail ? "channel yes" : "channel"}>
            {CHANNEL[p.channel] ?? p.channel}
          </p>

          {p.channelNote && <p className="quote">{p.channelNote}</p>}

          <dl>
            {p.postalAddress && (
              <>
                <dt>Send it to</dt>
                <dd>
                  <pre>{p.postalAddress}</pre>
                  <button
                    className="quiet"
                    onClick={() => {
                      navigator.clipboard?.writeText(p.postalAddress);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? "Copied" : "Copy the address"}
                  </button>
                </dd>
              </>
            )}
            {p.portalUrl && (
              <>
                <dt>Their upload page</dt>
                <dd>
                  {safeSource(p.portalUrl) ? (
                    <a href={p.portalUrl} target="_blank" rel="noreferrer noopener">
                      {safeSource(p.portalUrl)!.host}
                    </a>
                  ) : (
                    <span className="warn">a link we could not verify</span>
                  )}
                </dd>
              </>
            )}
            {p.formName && (
              <>
                <dt>They name a form</dt>
                <dd>{p.formName}</dd>
              </>
            )}
            {p.faxNumber && (
              <>
                <dt>Fax</dt>
                <dd><code>{p.faxNumber}</code></dd>
              </>
            )}
            {p.phoneNumber && (
              <>
                <dt>Phone</dt>
                <dd><code>{p.phoneNumber}</code></dd>
              </>
            )}
            {p.requiredDocuments?.length > 0 && (
              <>
                <dt>What they ask for</dt>
                <dd>
                  <ul>
                    {p.requiredDocuments.map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
            {p.accountTypeNotes && (
              <>
                <dt>It depends on the account</dt>
                <dd>{p.accountTypeNotes}</dd>
              </>
            )}
          </dl>

          {p.droppedFields?.length > 0 && (
            <p className="warn">
              We could not confirm these on their page, so we left them out rather than
              guessing: {p.droppedFields.join(", ")}. Check those by phone before you send
              anything.
            </p>
          )}

          {draft && (
            <section className="letter">
              <p className="from">Subject: {draft.subject}</p>
              <pre className="body">{draft.body}</pre>
              <p className="note">Written by {draft.generatedBy}. Read it before it goes.</p>
            </section>
          )}

          {err && <p className="warn">{err}</p>}

          {draft && !draft.approvedAt && (
            acceptsEmail ? (
              <button disabled={busy} onClick={() => act(() => send({ draftId: draft._id }))}>
                {busy ? "Sending" : "Send it"}
              </button>
            ) : (
              <div className="offline">
                <p>{OFFLINE_INSTRUCTION[p.channel] ?? OFFLINE_INSTRUCTION.unknown}</p>
                <button
                  disabled={busy}
                  onClick={() =>
                    act(() => markOffline({ counterpartyId: c._id, how: OFFLINE_VERB[p.channel] ?? "hand" }))
                  }
                >
                  {OFFLINE_DONE[p.channel] ?? OFFLINE_DONE.unknown}
                </button>
              </div>
            )
          )}

          {draft?.approvedAt && (
            <p className="note">
              {delivery?.status
                ? `Sent. The mail service says: ${delivery.status}.`
                : "Sent."}
            </p>
          )}

          <p className="note">
            Read on {new Date(p.scrapedAt).toLocaleDateString()} from{" "}
            {src ? (
              <a href={src.href} target="_blank" rel="noreferrer noopener">
                {src.host}
              </a>
            ) : (
              "a source we could not verify, so treat this card with suspicion"
            )}
            .
          </p>
        </>
      )}
    </article>
  );
}
