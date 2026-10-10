// @ts-check
import { modules } from "../data/modules.js";

/**
 * Hash routes use bare tokens only (the artifact viewer drops anything else):
 *   #home · #glossary · #glossary.<termSlug> · #<moduleId> · #<moduleId>.<lessonNumber>
 * @param {string} hash
 * @returns {import("../types").Route}
 */
export function parse(hash) {
  const token = hash.replace(/^#/, "");
  const [moduleId, num] = token.split(".");
  if (moduleId === "glossary") return { view: "glossary", term: num ?? null };
  if (moduleId === "team") return { view: "team" };
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return { view: "home" };
  const index = Number(num) - 1;
  const lesson = Number.isInteger(index) ? module.lessons[index] : undefined;
  return lesson ? { view: "lesson", module, lesson, index } : { view: "module", module };
}

/** @param {string} moduleId @param {number} [index] zero-based lesson index @returns {string} */
export const href = (moduleId, index) => (index === undefined ? `#${moduleId}` : `#${moduleId}.${index + 1}`);

/** @param {(route: import("../types").Route) => void} fn @returns {void} */
export function onRoute(fn) {
  const run = () => fn(parse(location.hash));
  window.addEventListener("hashchange", run);
  run();
}
