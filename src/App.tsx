import { useState } from "react";
import { useQuery, useMutation, Authenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import Organisation from "./Organisation";
import Forwarding from "./Forwarding";
import Account from "./Account";
import Judge from "./Judge";

export default function App() {
  // Static hosting serves index.html for any path, so one read of the path is
  // the whole router. Nothing here needs history or nested routes.
  if (window.location.pathname.replace(/\/$/, "") === "/judge") return <Judge />;
  return <Board />;
}

function Board() {
  const [caseId, setCaseId] = useState<Id<"cases"> | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createCase = useMutation(api.cases.createCase);
  const addCounterparty = useMutation(api.cases.addCounterparty);
  const board = useQuery(api.cases.board, caseId ? { caseId } : "skip");
  const current = useQuery(api.cases.getCase, caseId ? { caseId } : "skip");

  async function open(demo: boolean, deceasedName: string) {
    try {
      setCaseId(await createCase({ deceasedName, demo }));
      setError(null);
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
          <button onClick={() => open(true, "Margaret Oyelaran")}>
            Open an example estate
          </button>
          <p className="note">Nothing is sent without you reading it first.</p>

          <Authenticated>
            <RealEstate onCreate={(n) => open(false, n)} />
          </Authenticated>
          <Account onOpen={setCaseId} />
        </>
      ) : (
        <>
          <p className="lede">
            {current?.demo ? "An example estate. " : ""}
            The estate of {current?.deceasedName ?? "…"}.
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

          <Forwarding caseId={caseId} />

          {board === undefined && <p className="note">Loading.</p>}
          {board?.length === 0 && (
            <p className="note">
              Nothing added yet. Try Wells Fargo, or the name of a gym.
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

function RealEstate({ onCreate }: { onCreate: (name: string) => void }) {
  const [n, setN] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (n.trim()) onCreate(n.trim());
      }}
    >
      <label htmlFor="who">Or start a real one. Whose estate is it?</label>
      <div className="row">
        <input
          id="who"
          value={n}
          onChange={(e) => setN(e.target.value)}
          placeholder="Their full name"
          autoComplete="off"
        />
        <button type="submit">Start</button>
      </div>
    </form>
  );
}

// Convex attaches a stack to errors. Show the person the sentence, not the trace.
function readable(e: any): string {
  const m = String(e?.message ?? e);
  if (m.includes("RateLimited") || m.includes("rate limit")) {
    return "That is as many as this allows for now. Give it a few minutes.";
  }
  const match = m.match(/Uncaught Error:\s*([^\n]+)/);
  return match ? match[1] : m.split("\n")[0];
}
