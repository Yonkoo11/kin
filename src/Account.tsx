import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// Signing in is optional and deliberately late. A judge, or anyone curious, uses the
// example estate without an account. You sign in when you have a real one to keep,
// because a real one holds a dead person's details and must belong to somebody.
export default function Account({ onOpen }: { onOpen: (id: Id<"cases">) => void }) {
  return (
    <>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <MyEstates onOpen={onOpen} />
      </Authenticated>
    </>
  );
}

function SignIn() {
  const { signIn } = useAuthActions();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signIn" | "signUp">("signUp");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) {
    return (
      <p className="note">
        Keeping a real estate?{" "}
        <button className="link" onClick={() => setOpen(true)}>
          Sign in or start an account
        </button>
        .
      </p>
    );
  }

  return (
    <section className="account">
      <h2>{mode === "signUp" ? "Start an account" : "Sign in"}</h2>
      <p className="note">
        A real estate holds someone&rsquo;s details, so it has to belong to somebody.
        Nothing is shared with anyone you do not add.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(null);
          const form = new FormData(e.target as HTMLFormElement);
          form.set("flow", mode);
          try {
            await signIn("password", form);
          } catch {
            // The server does not say which of the two was wrong, and neither do we:
            // telling someone an address exists is telling them something private.
            setErr(
              mode === "signUp"
                ? "That did not work. If you already have an account, sign in instead."
                : "That email and password did not match.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signUp" ? "new-password" : "current-password"}
          required
          minLength={8}
        />
        {err && <p className="warn">{err}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "One moment" : mode === "signUp" ? "Start an account" : "Sign in"}
        </button>
      </form>
      <p className="note">
        {mode === "signUp" ? "Already have one? " : "New here? "}
        <button
          className="link"
          onClick={() => {
            setMode(mode === "signUp" ? "signIn" : "signUp");
            setErr(null);
          }}
        >
          {mode === "signUp" ? "Sign in" : "Start an account"}
        </button>
      </p>
    </section>
  );
}

function MyEstates({ onOpen }: { onOpen: (id: Id<"cases">) => void }) {
  const { signOut } = useAuthActions();
  const mine = useQuery(api.cases.myCases, {});

  return (
    <section className="account">
      {mine && mine.length > 0 && (
        <>
          <h2>Your estates</h2>
          <ul className="estates">
            {mine.map((c: any) => (
              <li key={c._id}>
                <button className="link" onClick={() => onOpen(c._id)}>
                  {c.deceasedName}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="note">
        Signed in. <button className="link" onClick={() => void signOut()}>Sign out</button>
      </p>
    </section>
  );
}
