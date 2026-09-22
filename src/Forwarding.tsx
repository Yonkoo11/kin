import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// Nobody has a list of everything a dead person paid for. Their inbox does.
// This is the part families find hardest, so it is the part with the least friction:
// register an address, forward anything, a card appears.
export default function Forwarding({ caseId }: { caseId: Id<"cases"> }) {
  const inbox = useQuery(api.mail.inboxAddress, {});
  const members = useQuery(api.mail.members, { caseId });
  const addEmail = useMutation(api.cases.addMemberEmail);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await addEmail({ caseId, email });
      setEmail("");
    } catch (e: any) {
      const m = String(e?.message ?? e).match(/Uncaught Error:\s*([^\n]+)/);
      setErr(m ? m[1] : String(e?.message ?? e).split("\n")[0]);
    }
  }

  if (!inbox) return null;

  return (
    <section className="forwarding">
      <h2>Or forward the bills</h2>
      <p>
        You will not remember everyone. Their bank statements and their inbox will.
        Forward anything they were paying for and Kin works out who it is from.
      </p>

      {members && members.length > 0 ? (
        <>
          <p>
            Forward to <code>{inbox}</code>{" "}
            <button
              className="link"
              onClick={() => {
                navigator.clipboard?.writeText(inbox);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </p>
          <p className="small">
            Accepted from {members.join(", ")}. Mail from anywhere else is ignored,
            so nobody else can add to this estate.
          </p>
        </>
      ) : (
        <>
          <form onSubmit={add}>
            <label htmlFor="member">Which address will you forward from?</label>
            <div className="field">
              <input
                id="member"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <button type="submit">Use this address</button>
            </div>
          </form>
          <p className="small">
            Only addresses you register here can add to this estate.
          </p>
        </>
      )}
      {err && <p className="small flag">{err}</p>}
    </section>
  );
}
