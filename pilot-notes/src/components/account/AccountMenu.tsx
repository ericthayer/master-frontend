import { signOut, useAuth } from "../../lib/account.ts";
import { accountsEnabled } from "../../lib/supabase.ts";

/** Compact sign-in / account control for headers. */
export default function AccountMenu() {
  const auth = useAuth();
  if (!accountsEnabled) return null;
  if (auth.status === "loading") return <span className="chip" aria-hidden="true">…</span>;
  if (auth.status === "signed-out") {
    const next = typeof window === "undefined" ? "/" : location.pathname + location.search;
    return <a className="btn btn--sm" href={`/login?next=${encodeURIComponent(next)}`}>Sign in</a>;
  }
  const email = auth.session.user.email ?? "Account";
  return (
    <details className="acct">
      <summary className="acct__btn" aria-label={`Account: ${email}`}>{email.slice(0, 1).toUpperCase()}</summary>
      <div className="acct__pop">
        <p className="acct__email">{email}</p>
        <a href="/library">My library</a>
        <a href="/account">Account & billing</a>
        <button type="button" onClick={() => void signOut().then(() => location.assign("/"))}>Sign out</button>
      </div>
    </details>
  );
}
