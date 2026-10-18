import { useState } from "react";
import { api, useAuth, useEntitlements } from "../../lib/account.ts";
import { hasAccess, hasActivePass } from "../../lib/access.ts";
import { accountsEnabled } from "../../lib/supabase.ts";

interface Props {
  plan: "course" | "pass";
  course?: string;
  label: string;
  primary?: boolean;
  /** Where to send buyers who already own it. */
  ownedHref?: string;
}

/** Starts Stripe Checkout. Signed-out buyers sign in first, then come back here. */
export default function BuyButton({ plan, course, label, primary = true, ownedHref = "/library" }: Props) {
  const auth = useAuth();
  const ent = useEntitlements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const go = async () => {
    setError("");
    if (auth.status !== "signed-in") {
      location.assign(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    setBusy(true);
    try {
      const res = await api("/api/checkout", { method: "POST", body: JSON.stringify({ plan, course }) });
      const body = (await res.json()) as { url?: string; error?: string };
      if (res.ok && body.url) { location.assign(body.url); return; }
      setError(body.error ?? "Checkout is unavailable right now.");
    } catch {
      setError("Checkout is unavailable right now.");
    }
    setBusy(false);
  };

  const owned = auth.status === "signed-in" && !ent.loading && (plan === "pass" ? hasActivePass(ent.rows) : course ? hasAccess(ent.rows, course) : false);
  if (owned) return <a className={`btn ${primary ? "btn--primary" : ""}`} href={ownedHref}>{plan === "pass" ? "Your pass is active →" : "Continue course →"}</a>;

  return (
    <span className="buy">
      <button type="button" className={`btn ${primary ? "btn--primary" : ""}`} onClick={go} disabled={busy || !accountsEnabled || auth.status === "loading"}>
        {busy ? "Opening checkout…" : label}
      </button>
      {!accountsEnabled && <span className="buy__note">Checkout opens at launch.</span>}
      {error && <span className="buy__error" role="alert">{error}</span>}
    </span>
  );
}
