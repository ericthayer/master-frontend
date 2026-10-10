// @ts-check
import { h, icon } from "../lib/dom.js";
import { href } from "../lib/router.js";
import { store } from "../lib/store.js";
import { modules, lessonKey, totalLessons, totalMinutes, flatLessons } from "../data/modules.js";
import { moduleStats } from "./module-stats.js";

const ARROW = "M5 12h14|M13 6l6 6-6 6";
const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** Dashboard hub: progress summary, next lesson, and the ordered learning path. */
export class FdHome extends HTMLElement {
  /** @type {(() => void) | null} */
  #unsubscribe = null;

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
    const all = flatLessons();
    const done = all.filter(({ module, lesson }) => store.isDone(lessonKey(module.id, lesson.id))).length;
    const total = totalLessons();
    const pct = Math.round((done / total) * 100);
    const next = all.find(({ module, lesson }) => !store.isDone(lessonKey(module.id, lesson.id))) ?? all[0];
    const hours = (totalMinutes() / 60).toFixed(1);

    const pathBtn = h("button", { type: "button", class: "btn" }, ["See the path"]);
    pathBtn.addEventListener("click", () => {
      const target = this.querySelector("#path-title");
      if (!(target instanceof HTMLElement)) return;
      target.setAttribute("tabindex", "-1");
      target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      target.focus({ preventScroll: true });
    });

    const hero = h("section", { class: "hero", "aria-labelledby": "hero-title" }, [
      h("p", { class: "eyebrow", text: "Frontend fluency for product designers" }),
      h("h1", { id: "hero-title", class: "hero__title" }, ["Learn the code side of the work you design."]),
      h("p", { class: "hero__lede", text: `${WORDS[modules.length] ?? modules.length} modules and ${total} short lessons on the tools your engineering team uses every day. No coding background needed: every idea is mapped to something you already do in Figma.` }),
      h("div", { class: "hero__actions" }, [
        h("a", { class: "btn btn--primary", href: href(next.module.id, next.index) }, [done ? "Continue learning" : "Start the first lesson", icon(ARROW)]),
        pathBtn,
      ]),
    ]);

    const status = h("section", { class: "status", "aria-label": "Your progress" }, [
      h("div", { class: "status__cell status__cell--wide" }, [
        h("p", { class: "eyebrow", text: "Progress" }),
        h("p", { class: "status__value" }, [h("span", { text: `${done}` }), h("small", { text: ` / ${total} lessons` })]),
        h("div", { class: "meter", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct, "aria-label": "Lessons complete", style: `--pct:${pct}%` }, [h("i")]),
      ]),
      h("div", { class: "status__cell" }, [
        h("p", { class: "eyebrow", text: "Total time" }),
        h("p", { class: "status__value" }, [h("span", { text: hours }), h("small", { text: " hours" })]),
      ]),
      h("a", { class: "status__cell status__next", href: href(next.module.id, next.index) }, [
        h("p", { class: "eyebrow", text: done === total ? "All done. Review" : "Up next" }),
        h("p", { class: "status__lesson", text: next.lesson.title }),
        h("span", { class: "chip", style: `--chip-hue:${next.module.hue}`, text: `${next.module.short} · ${next.lesson.minutes} min` }),
      ]),
    ]);

    const cards = modules.map((m, i) => {
      const stats = moduleStats(m);
      return h("li", {}, [
        h("a", { class: "mcard", href: href(m.id), style: `--mhue:${m.hue}` }, [
          h("div", { class: "mcard__top" }, [
            h("span", { class: "mcard__icon" }, [icon(m.icon)]),
            h("span", { class: "mcard__num", text: String(i + 1).padStart(2, "0") }),
          ]),
          h("h3", { class: "mcard__title", text: m.title }),
          h("p", { class: "mcard__tag", text: m.tagline }),
          h("div", { class: "mcard__foot" }, [
            h("span", { class: "pill", "data-state": stats.state, text: stats.label }),
            h("span", { class: "mcard__meta", text: `${m.lessons.length} lessons · ${stats.minutes} min` }),
          ]),
          h("div", { class: "meter meter--thin", "aria-hidden": "true", style: `--pct:${stats.pct}%` }, [h("i")]),
        ]),
      ]);
    });

    const path = h("section", { class: "path", id: "path", "aria-labelledby": "path-title" }, [
      h("div", { class: "section-head" }, [
        h("h2", { id: "path-title", text: "Learning path" }),
        h("p", { text: "Recommended order. Each module stands on its own, so jump to whatever your team needs first." }),
      ]),
      h("ol", { class: "mgrid" }, cards),
    ]);

    this.replaceChildren(h("div", { class: "page" }, [hero, status, path]));
  }
}

customElements.define("fd-home", FdHome);
