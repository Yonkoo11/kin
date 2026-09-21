import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import Organisation from "./Organisation";

export default function App() {
  // A judge lands here with no account. The demo estate opens on the first click.
  const [caseId, setCaseId] = useState<Id<"cases"> | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createCase = useMutation(api.cases.createCase);
  const addCounterparty = useMutation(api.cases.addCounterparty);
  const board = useQuery(api.cases.board, caseId ? { caseId } : "skip");

  async function start() {
    try {
      setCaseId(await createCase({ deceasedName: "Margaret Oyelaran", demo: true }));
    } catch (e: any) {
      setError(readable(e));
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !caseId) return;
    const n = name.trim();
    setName("");
    setError(null);
    try {
      await addCounterparty({ caseId, name: n });
    } catch (err: any) {
      setError(readable(err));
    }
  }

  return (
    <main>
      <h1>Kin</h1>

      {!caseId ? (
        <>
          <p className="lede">
            When someone dies, one person has to tell twenty or thirty organisations.
            Each wants something different, and most will not tell you what until you
            have waited on hold.
          </p>
          <p>
            Kin reads each organisation&rsquo;s own page, works out what they need and how
            they will accept it, writes to them, and keeps every reply in one place.
          </p>
          <button onClick={start}>Open an example estate</button>
          <p className="note">
            Nothing here is sent without you reading it first.
          </p>
        </>
      ) : (
        <>
          <p className="lede">
            The estate of Margaret Oyelaran. Add an organisation that needs to be told.
          </p>

          <form onSubmit={add}>
            <label htmlFor="org">Who needs to be told?</label>
            <div className="row">
              <input
                id="org"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Wells Fargo"
                autoComplete="off"
              />
              <button type="submit">Find out what they need</button>
            </div>
          </form>

          {error && <p className="warn">{error}</p>}

          {board === undefined && <p className="note">Loading.</p>}
          {board?.length === 0 && (
            <p className="note">
              Nothing added yet. Try Wells Fargo, or Netflix, or the name of a gym.
            </p>
          )}

          {board?.map((c: any) => (
            <Organisation key={c._id} c={c} />
          ))}
        </>
      )}
    </main>
  );
}

// Convex surfaces errors with a stack attached. Show the person the sentence, not the trace.
function readable(e: any): string {
  const m = String(e?.message ?? e);
  if (m.includes("RateLimited") || m.includes("rate limit")) {
    return "That is as many as this example allows for now. Give it a few minutes.";
  }
  const match = m.match(/Uncaught Error:\s*([^\n]+)/);
  return match ? match[1] : m.split("\n")[0];
}
