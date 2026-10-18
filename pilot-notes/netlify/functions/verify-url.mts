import type { Config } from "@netlify/functions";
import { getCourse } from "../../src/content/catalog.ts";
import { hasAccess, parseNetlifyUrl } from "../../src/lib/access.ts";
import { HttpError, entitlementsFor, handle, json, readJson, requireUser } from "../lib/server.ts";

/**
 * Checks that a learner's project is live. Only https://<site>.netlify.app URLs are
 * accepted, redirects are not followed and the request times out quickly, so this
 * can't be used to probe arbitrary hosts.
 */
export default handle(async (req) => {
  const user = await requireUser(req);
  const body = await readJson<{ url?: unknown; course?: unknown }>(req);
  const course = getCourse(typeof body.course === "string" ? body.course : "");
  if (!course || course.tier !== "paid") throw new HttpError(400, "Unknown course.");
  if (!hasAccess(await entitlementsFor(user.id), course.slug)) throw new HttpError(403, "Purchase required.");

  const url = parseNetlifyUrl(typeof body.url === "string" ? body.url : "");
  if (!url) return json({ ok: false, reason: "Use your full Netlify address, like https://my-site.netlify.app" });

  try {
    const res = await fetch(url, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(6000), headers: { "User-Agent": "PilotNotes-LiveCheck/1.0" } });
    await res.body?.cancel();
    if (res.status >= 200 && res.status < 400) return json({ ok: true, url });
    return json({ ok: false, reason: res.status === 404 ? "Netlify says that site doesn’t exist yet (404). Check the name, or wait for the deploy to finish." : `The site answered with status ${res.status}.` });
  } catch {
    return json({ ok: false, reason: "The site didn’t respond in time. Is the deploy finished?" });
  }
});

export const config: Config = { path: "/api/verify-url", method: "POST" };
