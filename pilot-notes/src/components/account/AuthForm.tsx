import { useEffect, useState, type SubmitEvent } from "react";
import { supabase, accountsEnabled } from "../../lib/supabase.ts";
import { useAuth } from "../../lib/account.ts";
import { safeNext } from "./safe-next.ts";

/** Passwordless sign-in. Supabase emails a magic link that returns here. */
export default function AuthForm() {
  const auth = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const next = typeof window === "undefined" ? "/library" : safeNext(new URLSearchParams(location.search).get("next"));

  useEffect(() => {
    if (auth.status === "signed-in") location.replace(next);
  }, [auth.status, next]);

  if (!accountsEnabled || !supabase) return <p className="auth__note">Accounts aren’t configured on this deploy yet. The free course works without one.</p>;
  if (auth.status === "signed-in") return <p role="status">Signed in — taking you back…</p>;

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setStatus("sending");
    const redirect = new URL("/login", location.origin);
    redirect.searchParams.set("next", next);
    const { error } = await supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect.toString(), shouldCreateUser: true } });
    if (error) { setStatus("error"); setMessage(error.message); return; }
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="auth__sent" role="status">
        <p className="auth__big">📬 Check your email</p>
        <p>We sent you a sign-in link. Open it on this device to continue.</p>
      </div>
    );
  }

  return (
    <form className="auth" onSubmit={onSubmit}>
      <label htmlFor="auth-email">Email</label>
      <input id="auth-email" className="field" type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
      <button className="btn btn--primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending link…" : "Email me a sign-in link"}</button>
      {status === "error" && <p className="auth__error" role="alert">{message || "Couldn’t send the link. Try again."}</p>}
      <p className="auth__note">No password needed. New here? This creates your account.</p>
    </form>
  );
}
