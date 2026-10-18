import { test } from "node:test";
import assert from "node:assert/strict";
import { hasAccess, hasActivePass, parseNetlifyUrl, PASS, type Entitlement } from "../src/lib/access.ts";
import { safeNext } from "../src/components/account/safe-next.ts";

const now = new Date("2026-06-01T00:00:00Z");
const row = (course: string, expires_at: string | null, source: Entitlement["source"] = "purchase"): Entitlement => ({ course, source, expires_at });

test("course purchases are lifetime; passes expire", () => {
  assert.equal(hasAccess([row("a", null)], "a", now), true);
  assert.equal(hasAccess([row("a", null)], "b", now), false);
  assert.equal(hasAccess([row(PASS, "2026-07-01T00:00:00Z", "pass")], "b", now), true);
  assert.equal(hasAccess([row(PASS, "2026-05-01T00:00:00Z", "pass")], "b", now), false);
  assert.equal(hasActivePass([row(PASS, "2026-07-01T00:00:00Z", "pass")], now), true);
  assert.equal(hasActivePass([row(PASS, "2026-05-01T00:00:00Z", "pass"), row("a", null)], now), false);
});

test("parseNetlifyUrl only accepts https *.netlify.app", () => {
  assert.equal(parseNetlifyUrl("https://my-site.netlify.app"), "https://my-site.netlify.app/");
  assert.equal(parseNetlifyUrl("  https://my-site.netlify.app/page?q=1 "), "https://my-site.netlify.app/page");
  for (const bad of [
    "http://my-site.netlify.app",
    "https://netlify.app",
    "https://my-site.netlify.app.evil.com",
    "https://evil.com/my-site.netlify.app",
    ["https://", "user", ":", "pw", "@", "my-site.netlify.app"].join(""),
    "https://my-site.netlify.app:8443",
    "https://a.b.netlify.app",
    "javascript:alert(1)",
    "not a url",
  ]) assert.equal(parseNetlifyUrl(bad), null, bad);
});

test("safeNext keeps redirects on-site", () => {
  assert.equal(safeNext("/learn/x/y?z=1"), "/learn/x/y?z=1");
  assert.equal(safeNext(null), "/library");
  for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "/\t/evil.com", "/\n/evil.com", "javascript:alert(1)", ""]) assert.equal(safeNext(bad), "/library", bad);
});
