// @ts-check
import { store } from "../lib/store.js";
import { lessonKey } from "../data/modules.js";

/**
 * @typedef {{ done: number; pct: number; minutes: number; state: "todo" | "active" | "done"; label: string }} ModuleStats
 */

/**
 * Derived progress for one module. Kept apart from rendering so every view agrees.
 * @param {import("../types").Module} module
 * @returns {ModuleStats}
 */
export function moduleStats(module) {
  const done = module.lessons.filter((l) => store.isDone(lessonKey(module.id, l.id))).length;
  const total = module.lessons.length;
  const minutes = module.lessons.reduce((n, l) => n + l.minutes, 0);
  const state = done === 0 ? "todo" : done === total ? "done" : "active";
  const label = state === "todo" ? "Not started" : state === "done" ? "Complete" : `${done} of ${total} done`;
  return { done, pct: Math.round((done / total) * 100), minutes, state, label };
}
