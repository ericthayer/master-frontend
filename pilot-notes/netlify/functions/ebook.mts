import type { Config } from "@netlify/functions";
import { courses } from "../../src/content/catalog.ts";
import { hasAccess } from "../../src/lib/access.ts";
import { entitlementsFor, handle, HttpError, json, requireUser, supabaseAdmin } from "../lib/server.ts";

/** Returns a short-lived signed download URL for a purchased course's PDF e-book. */
export default handle(async (req) => {
  const slug = new URL(req.url).searchParams.get("course") ?? "";
  const course = courses.find((c) => c.slug === slug && c.tier === "paid");
  if (!course) throw new HttpError(404, "Unknown course.");
  const user = await requireUser(req);
  if (!hasAccess(await entitlementsFor(user.id), course.slug)) throw new HttpError(403, "Buy the course or the pass to download its e-book.");
  const { data, error } = await supabaseAdmin()
    .storage.from("ebooks")
    .createSignedUrl(`${course.slug}.pdf`, 300, { download: `${course.slug}.pdf` });
  if (error || !data) throw new HttpError(404, "The e-book is being prepared — try again soon.");
  return json({ url: data.signedUrl });
});

export const config: Config = { path: "/api/ebook", method: "GET" };
