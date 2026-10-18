import { useEffect, useRef, useState, type FormEvent } from "react";
import { logins } from "../config";
import { useAuth } from "../state/auth";
import { readString, writeLocal } from "../lib/storage";
import { Chips, HEART_PATH } from "./ui";

/** Lock screen: pick who you are, type your passcode. */
export function Gate() {
  const { signIn } = useAuth();
  const [who, setWho] = useState(() => {
    const saved = Number(readString("bp-who"));
    return logins[saved] ? saved : 0;
  });
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), [who]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!pass) return setErr("Type the passcode first.");
    setErr("");
    setBusy(true);
    try {
      await signIn(who, pass);
    } catch (x) {
      const code = (x as { code?: string })?.code ?? "";
      setErr(
        /too-many-requests/.test(code) ? "Too many tries. Wait a few minutes and try again."
        : /network/.test(code) ? "No internet connection. Check your signal and try again."
        : /wrong-password|invalid-credential|invalid-login-credentials|user-not-found/.test(code) ? "That passcode isn't right."
        : `Couldn't open the planner (${code}).`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gate">
      <form className="gate-box" onSubmit={submit} noValidate>
        <svg className="w-10 h-10 mx-auto fill-rose" viewBox="0 0 24 24" aria-hidden="true"><path d={HEART_PATH} /></svg>
        <h2>Our May planner</h2>
        <p className="text-muted">Who's opening it?</p>
        <div className="flex justify-center">
          <Chips
            label="Who is signing in"
            value={String(who)}
            onChange={(v) => { setWho(Number(v)); writeLocal("bp-who", v); }}
            options={logins.map((l, i) => ({ key: String(i), label: l.name }))}
          />
        </div>
        <input
          ref={input}
          className="field text-center text-lg tracking-widest"
          type="password"
          autoComplete="current-password"
          placeholder={`${logins[who].name}'s passcode`}
          aria-label="Passcode"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button className="btn pri w-full" disabled={busy}>{busy ? "Opening…" : "Open planner"}</button>
        <div className="err" role="alert">{err}</div>
      </form>
    </div>
  );
}
