// @ts-check
import { h, icon } from "../lib/dom.js";
import { href } from "../lib/router.js";
import { store } from "../lib/store.js";
import { lessonKey } from "../data/modules.js";
import { moduleStats } from "./module-stats.js";

const CHECK = "M5 12l5 5L20 7";
const ARROW = "M5 12h14|M13 6l6 6-6 6";

/** Module overview: outcome, progress and the ordered lesson list. */
export class FdModuleView extends HTMLElement {
  /** @type {import("../types").Module | null} */
  #module = null;
  /** @type {(() => void) | null} */
  #unsubscribe = null;

  /** @param {import("../types").Module} value */
  set module(value) {
    this.#module = value;
    if (this.isConnected) this.#render();
  }

  /** @returns {void} */
  connectedCallback() {
    this.#render();
    this.#unsubscribe = store.subscribe(() => this.#render());
  }

  /** @returns {void} */
  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  /** @returns {void} */
  #render() {
    const m = this.#module;
    if (!m) return;
    const stats = moduleStats(m);
    const nextIndex = Math.max(0, m.lessons.findIndex((l) => !store.isDone(lessonKey(m.id, l.id))));

    const header = h("header", { class: "mhead", style: `--mhue:${m.hue}` }, [
      h("span", { class: "mcard__icon mcard__icon--lg" }, [icon(m.icon)]),
      h("div", { class: "mhead__text" }, [
        h("p", { class: "eyebrow", text: `Module · ${m.lessons.length} lessons · ${stats.minutes} min` }),
        h("h1", { class: "page__title", text: m.title }),
        h("p", { class: "page__lede", text: m.tagline }),
      ]),
    ]);

    const outcome = h("section", { class: "outcome", "aria-labelledby": "outcome-title" }, [
      h("div", {}, [
        h("h2", { id: "outcome-title", class: "eyebrow", text: "By the end you can" }),
        h("p", { class: "outcome__text", text: m.outcome }),
      ]),
      h("div", { class: "outcome__side" }, [
        h("span", { class: "pill", "data-state": stats.state, text: stats.label }),
        h("div", { class: "meter", role: "progressbar", "aria-label": `${m.title} progress`, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": stats.pct, style: `--pct:${stats.pct}%` }, [h("i")]),
        h("a", { class: "btn btn--primary", href: href(m.id, nextIndex) }, [stats.done ? "Continue" : "Start module", icon(ARROW)]),
      ]),
    ]);

    const list = h("ol", { class: "llist", "aria-label": "Lessons" }, m.lessons.map((lesson, i) => {
      const done = store.isDone(lessonKey(m.id, lesson.id));
      return h("li", {}, [
        h("a", { class: "lrow", href: href(m.id, i) }, [
          h("span", { class: "lrow__num", "data-done": String(done), "aria-hidden": "true" }, [done ? icon(CHECK) : String(i + 1)]),
          h("span", { class: "lrow__body" }, [
            h("span", { class: "lrow__title", text: lesson.title }),
            h("span", { class: "lrow__sum", text: lesson.summary }),
          ]),
          h("span", { class: "lrow__meta" }, [`${lesson.minutes} min`, done ? h("span", { class: "visually-hidden", text: ", completed" }) : null]),
        ]),
      ]);
    }));

    this.replaceChildren(h("div", { class: "page" }, [header, outcome, list]));
  }
}

customElements.define("fd-module-view", FdModuleView);
