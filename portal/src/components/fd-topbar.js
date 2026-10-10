// @ts-check
import { h, icon } from "../lib/dom.js";
import { href } from "../lib/router.js";
import { store } from "../lib/store.js";

const MENU = "M4 6h16|M4 12h16|M4 18h16";
const SEARCH = "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z|M20 20l-4-4";
const SUN = "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M12 2v2|M12 20v2|M4.9 4.9l1.4 1.4|M17.7 17.7l1.4 1.4|M2 12h2|M20 12h2|M4.9 19.1l1.4-1.4|M17.7 6.3l1.4-1.4";
const MOON = "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z";

const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/**
 * Top bar: drawer toggle, breadcrumbs, search trigger and theme switch.
 * Emits "fd-open-search" and "fd-toggle-drawer".
 */
export class FdTopbar extends HTMLElement {
  /** @type {HTMLOListElement} */
  #crumbs = h("ol", { class: "crumbs" });
  /** @type {HTMLButtonElement} */
  #theme = h("button", { type: "button", class: "icon-btn" });
  /** @type {HTMLButtonElement} */
  #menu = h("button", { type: "button", class: "icon-btn top__menu", "aria-label": "Open navigation", "aria-controls": "sidebar", "aria-expanded": "false" }, [icon(MENU)]);

  /** @returns {void} */
  connectedCallback() {
    this.setAttribute("role", "banner");
    const search = h("button", { type: "button", class: "top__search", "aria-haspopup": "dialog", "aria-keyshortcuts": isMac ? "Meta+K" : "Control+K" }, [
      icon(SEARCH), h("span", { class: "label", text: "Search lessons" }), h("kbd", { text: isMac ? "⌘K" : "Ctrl K" }),
    ]);
    search.setAttribute("aria-label", "Search lessons");
    search.addEventListener("click", () => this.dispatchEvent(new CustomEvent("fd-open-search", { bubbles: true })));
    this.#menu.addEventListener("click", () => this.dispatchEvent(new CustomEvent("fd-toggle-drawer", { bubbles: true })));
    this.#theme.addEventListener("click", () => {
      const next = this.#effectiveTheme() === "dark" ? "light" : "dark";
      store.setTheme(next);
      applyTheme(next);
      this.#syncTheme();
    });

    this.replaceChildren(
      this.#menu,
      h("nav", { "aria-label": "Breadcrumb", class: "top__crumbs" }, [this.#crumbs]),
      h("div", { class: "top__spacer" }),
      search,
      this.#theme,
    );
    this.#syncTheme();
  }

  /** @param {boolean} open @returns {void} */
  set drawerOpen(open) {
    this.#menu.setAttribute("aria-expanded", String(open));
  }

  /** @param {import("../types").Route} route @returns {void} */
  set route(route) {
    /** @type {Array<[string, string | null]>} */
    const trail = [["Dashboard", route.view === "home" ? null : "#home"]];
    if (route.view === "glossary") trail.push(["Glossary", null]);
    if (route.view === "team") trail.push(["Team progress", null]);
    if (route.view === "module" || route.view === "lesson") trail.push([route.module.title, route.view === "lesson" ? href(route.module.id) : null]);
    if (route.view === "lesson") trail.push([route.lesson.title, null]);
    this.#crumbs.replaceChildren(...trail.map(([label, link]) => h("li", {}, [
      link ? h("a", { href: link, text: label }) : h("span", { "aria-current": "page", text: label }),
    ])));
  }

  /** @returns {"dark" | "light"} */
  #effectiveTheme() {
    const attr = document.documentElement.dataset.theme;
    if (attr === "dark" || attr === "light") return attr;
    return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  /** @returns {void} */
  #syncTheme() {
    const dark = this.#effectiveTheme() === "dark";
    this.#theme.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    this.#theme.replaceChildren(icon(dark ? SUN : MOON));
  }
}

/** @param {"dark" | "light"} theme @returns {void} */
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

customElements.define("fd-topbar", FdTopbar);
