// @ts-check
import { git } from "./git.js";
import { htmlCss } from "./html-css.js";
import { markdown } from "./markdown.js";
import { cicd } from "./cicd.js";
import { devtools } from "./devtools.js";
import { vite } from "./vite.js";
import { a11y } from "./a11y.js";
import { components } from "./components.js";

/** Learning order: foundations first, then the tooling that ships them. */
/** @type {import("../types").Module[]} */
export const modules = [htmlCss, markdown, git, devtools, a11y, components, vite, cicd];

/** @param {string} moduleId @param {string} lessonId @returns {string} */
export const lessonKey = (moduleId, lessonId) => `${moduleId}/${lessonId}`;

/** @returns {number} */
export const totalLessons = () => modules.reduce((n, m) => n + m.lessons.length, 0);

/** @returns {number} */
export const totalMinutes = () =>
  modules.reduce((n, m) => n + m.lessons.reduce((k, l) => k + l.minutes, 0), 0);

/**
 * Flat, ordered list of every lesson for prev/next and search.
 * @returns {Array<{ module: import("../types").Module; lesson: import("../types").Lesson; index: number }>}
 */
export const flatLessons = () =>
  modules.flatMap((module) => module.lessons.map((lesson, index) => ({ module, lesson, index })));
