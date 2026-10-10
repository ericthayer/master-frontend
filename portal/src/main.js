// @ts-check
import "./components/fd-code.js";
import "./components/fd-quiz.js";
import "./components/fd-playground.js";
import "./components/fd-home.js";
import "./components/fd-module-view.js";
import "./components/fd-lesson-view.js";
import "./components/fd-sidebar.js";
import "./components/fd-command-palette.js";
import "./components/fd-glossary.js";
import "./components/fd-team.js";
import { applyTheme } from "./components/fd-topbar.js";
import { onRoute } from "./lib/router.js";
import { store } from "./lib/store.js";
import { sync } from "./lib/sync.js";

/** App controller: wires the router to views and owns drawer state. No business logic here. */

if (store.theme) applyTheme(store.theme);

const $ = (/** @type {string} */ sel) => {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing ${sel}`);
  return el;
};

const main = /** @type {HTMLElement} */ ($("#main"));
const sidebar = /** @type {import("./components/fd-sidebar.js").FdSidebar} */ ($("fd-sidebar"));
const topbar = /** @type {import("./components/fd-topbar.js").FdTopbar} */ ($("fd-topbar"));
const palette = /** @type {import("./components/fd-command-palette.js").FdCommandPalette} */ ($("fd-command-palette"));
const scrim = /** @type {HTMLElement} */ ($(".scrim"));

const narrow = matchMedia("(max-width: 860px)");

/**
 * On narrow screens the sidebar is an off-canvas drawer: it is inert while closed so
 * keyboard focus cannot land on hidden links, and the page behind is inert while open.
 * @param {boolean} open
 * @param {boolean} [restoreFocus]
 * @returns {void}
 */
function setDrawer(open, restoreFocus = true) {
  const drawer = narrow.matches;
  sidebar.setOpen(open);
  topbar.drawerOpen = open;
  scrim.hidden = !open;
  sidebar.inert = drawer && !open;
  main.inert = drawer && open;
  if (open) sidebar.querySelector("a")?.focus();
  else if (drawer && restoreFocus) /** @type {HTMLElement | null} */ (topbar.querySelector(".top__menu"))?.focus();
}

setDrawer(false, false);
narrow.addEventListener("change", () => setDrawer(false, false));

document.addEventListener("fd-toggle-drawer", () => setDrawer(!sidebar.hasAttribute("data-open")));
document.addEventListener("fd-open-search", () => palette.open());
scrim.addEventListener("click", () => setDrawer(false));
// Skip link focuses main without touching the route hash.
$(".skip-link").addEventListener("click", (e) => { e.preventDefault(); main.focus(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.hasAttribute("data-open")) setDrawer(false);
  if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
    e.preventDefault();
    palette.open();
  }
});

let first = true;

onRoute((route) => {
  /** @type {HTMLElement} */
  let view;
  if (route.view === "lesson") {
    const el = /** @type {import("./components/fd-lesson-view.js").FdLessonView} */ (document.createElement("fd-lesson-view"));
    el.route = route;
    view = el;
  } else if (route.view === "module") {
    const el = /** @type {import("./components/fd-module-view.js").FdModuleView} */ (document.createElement("fd-module-view"));
    el.module = route.module;
    view = el;
  } else if (route.view === "team") {
    view = document.createElement("fd-team");
  } else if (route.view === "glossary") {
    const el = /** @type {import("./components/fd-glossary.js").FdGlossary} */ (document.createElement("fd-glossary"));
    el.term = route.term;
    view = el;
  } else {
    view = document.createElement("fd-home");
  }

  main.replaceChildren(view);
  sidebar.current = route.view === "home" || route.view === "glossary" || route.view === "team" ? route.view : route.module.id;
  topbar.route = route;
  document.title = route.view === "lesson" ? `${route.lesson.title} · Frontend Academy`
    : route.view === "module" ? `${route.module.title} · Frontend Academy`
      : route.view === "glossary" ? "Glossary · Frontend Academy"
        : route.view === "team" ? "Team progress · Frontend Academy" : "Frontend Academy";

  if (sidebar.hasAttribute("data-open")) setDrawer(false, false);
  main.scrollTop = 0;
  // Move focus to the new view's heading so screen readers announce it, except on first load.
  if (!first) {
    const heading = main.querySelector("h1");
    if (heading instanceof HTMLElement) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    } else main.focus({ preventScroll: true });
  }
  first = false;
});

// Cross-device progress: connects after first paint; the page works fully without it.
void sync.start();
