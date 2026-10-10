// @ts-check
import { h, icon } from "../lib/dom.js";
import { href } from "../lib/router.js";
import { store } from "../lib/store.js";
import { sync } from "../lib/sync.js";
import { modules, totalLessons } from "../data/modules.js";
import { moduleStats } from "./module-stats.js";

const HOME = "M3 10.5L12 3l9 7.5|M5 9v11h14V9|M10 20v-6h4v6";
const TEAM = "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1|M16 3.5a4 4 0 0 1 0 7|M18 14a5 5 0 0 1 4 5v2";
const SYNC_TEXT = {
  connecting: "Connecting…",
  synced: "Synced to your account",
  local: "Saved in this browser",
  "read-only": "Saved in this browser (view-only access)",
};
const BOOK = "M4 4.5A1.5 1.5 0 0 1 5.5 3H20v16H5.5A1.5 1.5 0 0 0 4 20.5z|M4 20.5A1.5 1.5 0 0 0 5.5 22H20v-3|M8 7h8|M8 11h6";

/** Primary navigation rail. Becomes a drawer below 860px (see shell.css). */
export class FdSidebar extends HTMLElement {
  /** @type {string} */
  #current = "home";
  /** @type {(() => void) | null} */
  #unsubscribe = null;
  /** @type {number} */
  #resetTimer = 0;

  /** @param {string} moduleId the active module id, or "home" */
  set current(moduleId) {
    this.#current = moduleId;
    this.#render();
  }

  /** @returns {void} */
  connectedCallback() {
    this.id = "sidebar";
    this.setAttribute("role", "navigation");
    this.setAttribute("aria-label", "Course");
    this.#render();
    const offStore = store.subscribe(() => this.#render());
    const offSync = sync.subscribe(() => this.#render());
    this.#unsubscribe = () => { offStore(); offSync(); };
  }

  /** @returns {void} */
  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  /** @param {boolean} open @returns {void} */
  setOpen(open) {
    this.toggleAttribute("data-open", open);
    this.dispatchEvent(new CustomEvent("fd-drawer", { detail: { open }, bubbles: true }));
  }

  /** @returns {void} */
  #render() {
    const done = modules.reduce((n, m) => n + moduleStats(m).done, 0);
    const total = totalLessons();
    const pct = Math.round((done / total) * 100);

    /** @param {string} id @param {string} label @param {string} path @param {string} [hue] @param {HTMLElement | null} [count] */
    const link = (id, label, path, hue, count = null) => h("li", {}, [
      h("a", { class: "side__link", href: id === "home" || id === "glossary" || id === "team" ? `#${id}` : href(id), "aria-current": this.#current === id ? "page" : undefined, style: hue ? `--link-hue:${hue}` : undefined }, [
        icon(path), h("span", { text: label }), count,
      ]),
    ]);

    const moduleLinks = modules.map((m) => {
      const stats = moduleStats(m);
      const count = h("span", { class: "side__count", "data-done": String(stats.state === "done"), "aria-label": `${stats.done} of ${m.lessons.length} lessons complete`, text: `${stats.done}/${m.lessons.length}` });
      return link(m.id, m.title, m.icon, m.hue, count);
    });

    const reset = h("button", { type: "button", class: "btn btn--ghost side__reset" }, ["Reset progress"]);
    reset.addEventListener("click", () => {
      if (reset.dataset.armed) {
        clearTimeout(this.#resetTimer);
        store.reset();
        return;
      }
      reset.dataset.armed = "true";
      reset.textContent = "Click again to confirm";
      this.#resetTimer = window.setTimeout(() => { delete reset.dataset.armed; reset.textContent = "Reset progress"; }, 3000);
    });

    this.replaceChildren(
      h("a", { class: "side__brand", href: "#home", "aria-label": "Frontend Academy home" }, [
        h("span", { class: "side__mark", "aria-hidden": "true", text: "</>" }),
        h("span", { class: "side__name" }, ["Frontend Academy", h("small", { text: "for product designers" })]),
      ]),
      h("div", { class: "side__scroll" }, [
        h("div", { class: "side__group" }, [
          h("p", { class: "eyebrow side__label", text: "Overview" }),
          h("ul", { class: "side__list" }, [link("home", "Dashboard", HOME), link("glossary", "Glossary", BOOK), sync.isOwner ? link("team", "Team progress", TEAM) : null]),
        ]),
        h("div", { class: "side__group" }, [
          h("p", { class: "eyebrow side__label", text: "Modules" }),
          h("ul", { class: "side__list" }, moduleLinks),
        ]),
      ]),
      h("div", { class: "side__foot" }, [
        h("div", { class: "meter", role: "progressbar", "aria-label": "Course progress", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct, style: `--pct:${pct}%` }, [h("i")]),
        h("p", { text: `${done} of ${total} lessons · ${pct}%` }),
        h("p", { class: "side__sync", "data-state": sync.state, text: SYNC_TEXT[sync.state] }),
        done ? reset : null,
      ]),
    );
  }
}

customElements.define("fd-sidebar", FdSidebar);
