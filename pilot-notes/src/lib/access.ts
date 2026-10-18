/** Entitlement rows as stored in Supabase (`public.entitlements`). */
export interface Entitlement {
  course: string;
  source: "purchase" | "pass" | "comp";
  expires_at: string | null;
}

export const PASS = "*";

/** True if any row grants `course` at time `now`. Lifetime rows have no expiry. */
export function hasAccess(rows: Entitlement[], course: string, now: Date = new Date()): boolean {
  return rows.some((r) => (r.course === course || r.course === PASS) && (r.expires_at === null || new Date(r.expires_at) > now));
}

export function hasActivePass(rows: Entitlement[], now: Date = new Date()): boolean {
  return rows.some((r) => r.course === PASS && (r.expires_at === null || new Date(r.expires_at) > now));
}

/** Only exact Netlify site hostnames, e.g. my-site.netlify.app or deploy-preview-1--my-site.netlify.app. */
const NETLIFY_HOST = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:--[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)?\.netlify\.app$/;

/** Validate a learner-submitted live URL. Returns a normalised https URL or null. */
export function parseNetlifyUrl(input: string): string | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
  if (!NETLIFY_HOST.test(u.hostname)) return null;
  return `https://${u.hostname}${u.pathname}`;
}
