/**
 * Only allow same-origin redirects. Parsing with URL (rather than checking prefixes) also defeats
 * tricks like "/\t/evil.com", because browsers strip tabs and newlines before resolving.
 */
export function safeNext(raw: string | null, fallback = "/library", origin = globalThis.location?.origin ?? "https://pilotnotes.invalid"): string {
  if (!raw || !raw.startsWith("/")) return fallback;
  try {
    const u = new URL(raw, origin);
    if (u.origin !== origin) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
