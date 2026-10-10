// @ts-check
import { modules } from "./modules.js";
import { slug } from "../lib/dom.js";

/**
 * Glossary = every `terms` block in the lessons, plus curated terms that lessons explain in prose.
 * Each entry links back to the lesson that teaches it.
 * @typedef {{ term: string; def: string; slug: string; moduleId: string; lessonIndex: number }} GlossaryEntry
 */

/** @type {Array<[term: string, definition: string, moduleId: string, lessonId: string]>} */
const CURATED = [
  ["Branch", "A parallel line of commits for trying a change without affecting main.", "git", "trunk-based"],
  ["Main (trunk)", "The shared branch everyone merges into. In trunk-based development it is always deployable.", "git", "trunk-based"],
  ["Trunk-based development", "A workflow where short-lived branches merge into main at least daily.", "git", "trunk-based"],
  ["Feature flag", "A switch in the code that hides unfinished work from users until it is ready.", "git", "trunk-based"],
  ["Staging area", "The set of changes you have picked to go into the next commit.", "git", "what-is-git"],
  ["Pull request", "A proposal on GitHub to merge a branch, with its diff, checks and review comments.", "git", "pull-requests"],
  ["Squash and merge", "Combines all of a PR's commits into one commit on main.", "git", "pull-requests"],
  ["Element", "One piece of an HTML page, written as an opening tag, content and a closing tag.", "html-css", "html-structure"],
  ["Semantic HTML", "Choosing elements by meaning (button, nav, main) so browsers and assistive tech understand the page.", "html-css", "html-structure"],
  ["Selector", "The part of a CSS rule that picks which elements to style.", "html-css", "css-cascade"],
  ["Specificity", "How CSS ranks competing selectors: IDs beat classes, classes beat tag names.", "html-css", "css-cascade"],
  ["Cascade", "The rules that decide which CSS declaration wins when several apply.", "html-css", "css-cascade"],
  ["Custom property", "A CSS variable such as --accent, read with var(). Used to store design tokens.", "html-css", "css-cascade"],
  ["Box model", "Every element is a box of content, padding, border and margin.", "html-css", "box-layout"],
  ["Flexbox", "One-direction CSS layout; the code version of Figma auto layout.", "html-css", "box-layout"],
  ["Grid", "Two-dimensional CSS layout for rows and columns at once.", "html-css", "box-layout"],
  ["clamp()", "A CSS function that picks a value between a minimum and maximum, used for fluid type.", "html-css", "responsive"],
  ["Container query", "A CSS rule that changes a component's styles based on its parent's width, not the screen's.", "html-css", "responsive"],
  ["Markdown", "Plain text with a few symbols that render as formatting.", "markdown", "md-basics"],
  ["GitHub Flavored Markdown", "GitHub's extensions to Markdown: tables, task lists, alerts and mentions.", "markdown", "gfm"],
  ["Alt text", "A text description of an image for screen readers and failed loads.", "markdown", "md-lists-links"],
  ["README", "The front page of a repository explaining what it is and how to run it.", "markdown", "readme-pr"],
  ["Continuous Integration (CI)", "Automatically running checks on every push.", "cicd", "what-is-ci"],
  ["Continuous Delivery (CD)", "Automatically releasing changes after they merge.", "cicd", "what-is-ci"],
  ["GitHub Actions", "GitHub's built-in CI system, configured with YAML files in .github/workflows.", "cicd", "actions-yaml"],
  ["YAML", "An indentation-based config format used for workflows.", "cicd", "actions-yaml"],
  ["Preview deployment", "A live copy of the site built for one pull request, for review before merge.", "cicd", "environments"],
  ["Environment", "A place the app runs: local, preview, staging or production.", "cicd", "environments"],
  ["Revert", "A new commit or PR that undoes an earlier change without rewriting history.", "cicd", "failures-rollbacks"],
  ["DevTools", "The browser's built-in tools for inspecting and debugging pages.", "devtools", "elements"],
  ["Computed tab", "Shows the final value of every CSS property on the selected element.", "devtools", "styles"],
  ["Device mode", "DevTools mode that resizes the page and simulates touch.", "devtools", "device-mode"],
  ["Lighthouse", "An automated audit for performance, accessibility and SEO built into Chrome.", "devtools", "device-mode"],
  ["Console", "The DevTools panel that shows JavaScript messages and errors.", "devtools", "console-network"],
  ["Status code", "A number the server returns with each response, such as 200 OK or 404 Not Found.", "devtools", "console-network"],
  ["Build tool", "Software that turns source files into optimized files a browser can load.", "vite", "dev-server"],
  ["Dev server", "A local server that serves your project and updates it as you save.", "vite", "dev-server"],
  ["Hot Module Replacement (HMR)", "Swapping a changed file into the open page without a full reload.", "vite", "dev-server"],
  ["Node.js", "A runtime that runs JavaScript outside the browser; tools like Vite need it.", "vite", "package-json"],
  ["npm", "The package manager that installs dependencies and runs scripts.", "vite", "package-json"],
  ["package.json", "The file listing a project's dependencies and scripts.", "vite", "package-json"],
  ["Environment variable", "A setting supplied from outside the code, often different per environment.", "vite", "env-vars"],
  [".env file", "A file of environment variables that Vite loads automatically.", "vite", "env-vars"],
];

/** @returns {GlossaryEntry[]} */
function build() {
  /** @type {Map<string, GlossaryEntry>} */
  const map = new Map();
  for (const m of modules) {
    m.lessons.forEach((lesson, lessonIndex) => {
      for (const block of lesson.blocks) {
        if (block.t !== "terms") continue;
        for (const [term, def] of block.items) {
          if (!/^[\p{L}.@]/u.test(term)) continue;
          const key = term.toLowerCase();
          if (!map.has(key)) map.set(key, { term, def, slug: slug(term), moduleId: m.id, lessonIndex });
        }
      }
    });
  }
  for (const [term, def, moduleId, lessonId] of CURATED) {
    const m = modules.find((x) => x.id === moduleId);
    const lessonIndex = m ? m.lessons.findIndex((l) => l.id === lessonId) : -1;
    const key = term.toLowerCase();
    if (m && lessonIndex >= 0 && !map.has(key)) map.set(key, { term, def, slug: slug(term), moduleId, lessonIndex });
  }
  const sortKey = (/** @type {string} */ t) => t.replace(/^[^\p{L}]+/u, "").toLowerCase();
  return [...map.values()].sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
}

export const glossary = build();

/** @param {string} term @returns {string | null} glossary route for a term, if it exists */
export const glossaryHref = (term) => {
  const s = slug(term);
  return glossary.some((e) => e.slug === s) ? `#glossary.${s}` : null;
};
