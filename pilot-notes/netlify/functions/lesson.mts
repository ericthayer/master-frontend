import type { Config } from "@netlify/functions";
import { getCourse } from "../../src/content/catalog.ts";
import { hasAccess } from "../../src/lib/access.ts";
import { HttpError, entitlementsFor, handle, json, requireUser } from "../lib/server.ts";

/** Serves a paid module body to entitled users. Free/preview bodies ship statically instead. */
export default handle(async (req) => {
  const url = new URL(req.url);
  const course = getCourse(url.searchParams.get("course") ?? "");
  const mod = course?.modules.find((m) => m.id === url.searchParams.get("module"));
  if (!course || !mod) throw new HttpError(404, "Lesson not found.");

  if (course.tier === "paid" && !mod.preview) {
    const user = await requireUser(req);
    if (!hasAccess(await entitlementsFor(user.id), course.slug)) throw new HttpError(403, "Purchase required.");
  }
  return json({ blocks: mod.blocks, takeaways: mod.takeaways, ...(mod.sandbox ? { sandbox: mod.sandbox } : {}) });
});

export const config: Config = { path: "/api/lesson", method: "GET" };
