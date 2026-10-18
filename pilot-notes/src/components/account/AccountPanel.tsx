import { useState } from "react";
import { api, signOut, useAuth, useEntitlements } from "../../lib/account.ts";
import { PASS } from "../../lib/access.ts";
import { accountsEnabled } from "../../lib/supabase.ts";

export interface CourseLabel { slug: string; title: string }

export default function AccountPanel({ courses }: { courses: CourseLabel[] }) {
  const auth = useAuth();
  const ent = useEntitlements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!accountsEnabled) return <p className="muted">Accounts aren’t configured on this deploy yet.</p>;
  if (auth.status === "loading") return <p role="status">Loading…</p>;
  if (auth.status === "signed-out") return <p><a className="btn btn--primary" href="/login?next=/account">Sign in to see your account</a></p>;

  const title = (slug: string) => (slug === PASS ? "All-Access Pass" : courses.find((c) => c.slug === slug)?.title ?? slug);
  const portal = async () => {
    setBusy(true); setError("");
    const res = await api("/api/billing-portal", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && body.url) { location.assign(body.url); return; }
    setError(body.error ?? "Billing portal is unavailable.");
    setBusy(false);
  };

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      <section className="panel">
        <h2 className="panel__h">Signed in</h2>
        <p>{auth.session.user.email}</p>
        <p><button type="button" className="btn btn--sm" onClick={() => void signOut().then(() => location.assign("/"))}>Sign out</button></p>
      </section>
      <section className="panel">
        <h2 className="panel__h">Purchases</h2>
        {ent.loading ? <p role="status">Loading…</p> : ent.rows.length === 0 ? <p className="muted">No purchases yet. <a href="/courses">Browse courses</a>.</p> : (
          <ul className="rows">
            {ent.rows.map((r) => (
              <li key={`${r.course}-${r.source}`}>
                <strong>{title(r.course)}</strong>
                <span className="muted">{r.expires_at ? (new Date(r.expires_at) > new Date() ? `Renews/ends ${new Date(r.expires_at).toLocaleDateString()}` : `Ended ${new Date(r.expires_at).toLocaleDateString()}`) : "Lifetime access"}</span>
              </li>
            ))}
          </ul>
        )}
        <p><button type="button" className="btn btn--sm" onClick={portal} disabled={busy}>{busy ? "Opening…" : "Receipts, cards & pass renewal"}</button></p>
        {error && <p className="buy__error" role="alert">{error}</p>}
      </section>
    </div>
  );
}
