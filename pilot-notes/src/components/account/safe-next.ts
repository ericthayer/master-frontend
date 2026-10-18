/** Only allow same-site relative redirects (blocks //evil.com and absolute URLs). */
export function safeNext(raw: string | null, fallback = "/library"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
