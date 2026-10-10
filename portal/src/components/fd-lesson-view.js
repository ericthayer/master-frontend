// @ts-check
import { h, icon, slug } from "../lib/dom.js";
import { href } from "../lib/router.js";
import { store } from "../lib/store.js";
import { renderBlock } from "../lib/blocks.js";
import { lessonKey, flatLessons } from "../data/modules.js";

const CHECK = "M5 12l5 5L20 7";
const LEFT = "M19 12H5|M11 6l-6 6 6 6";
const RIGHT = "M5 12h14|M13 6l6 6-6 6";

/** One lesson: article, on-page outline, completion toggle and prev/next. */
export class FdLessonView extends HTMLElement {
  /** @type {Extract<import("../types").Route, { view: "lesson" }> | null} */
  #route = null;
  /** @type {(() => void) | null} */
  #unsubscribe = null;
  /** @type {HTMLButtonElement | null} */
  #toggle = null;
  /** @type {IntersectionObserver | null} */
  #spy = null;

  /** @param {Extract<import("../types").Route, { view: "lesson" }>} value */
  set route(value) {
    this.#route = value;
    if (this.isConnected) this.#render();
  }

  /** @returns {void} */
  connectedCallback() {
    this.#render();
    this.#unsubscribe = store.subscribe(() => this.#syncToggle());
  }

  /** @returns {void} */
  disconnectedCallback() {
    this.#unsubscribe?.();
    this.#spy?.disconnect();
  }

  /**
   * Scroll-spy: mark the outline link for the section being read with aria-current="location".
   * The active section is the last heading that has crossed the top 30% of the scroll area.
   * @returns {void}
   */
  #watchSections() {
    this.#spy?.disconnect();
    const headings = [...this.querySelectorAll(".lesson__h")];
    const links = new Map([...this.querySelectorAll(".outline [data-anchor]")].map((a) => [a.getAttribute("data-anchor"), a]));
    if (!headings.length) return;
    const passed = new Set();
    const mark = () => {
      const current = headings.filter((el) => passed.has(el)).pop();
      links.forEach((a, key) => {
        if (current && key === current.id) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    };
    this.#spy = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // rootBounds is the top 30% band; a heading counts once it is inside or above it.
        const above = entry.isIntersecting || entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        if (above) passed.add(entry.target); else passed.delete(entry.target);
      }
      mark();
    }, { root: document.getElementById("main"), rootMargin: "0px 0px -70% 0px", threshold: [0, 1] });
    headings.forEach((el) => this.#spy?.observe(el));
  }

  /** @returns {string} */
  get #key() {
    const r = this.#route;
    return r ? lessonKey(r.module.id, r.lesson.id) : "";
  }

  /** @returns {void} */
  #syncToggle() {
    const btn = this.#toggle;
    if (!btn) return;
    const done = store.isDone(this.#key);
    btn.setAttribute("aria-pressed", String(done));
    btn.className = done ? "btn btn--done" : "btn btn--primary";
    btn.replaceChildren(icon(CHECK), done ? "Completed" : "Mark as complete");
    this.querySelector(".outline__module [aria-current='page']")?.setAttribute("data-done", String(done));
  }

  /** @returns {void} */
  #render() {
    const r = this.#route;
    if (!r) return;
    const { module: m, lesson, index } = r;
    store.setLast(this.#key);

    const all = flatLessons();
    const pos = all.findIndex((x) => x.module.id === m.id && x.lesson.id === lesson.id);
    const prev = all[pos - 1];
    const next = all[pos + 1];

    const headings = lesson.blocks.flatMap((b) => (b.t === "h" ? [b.text] : []));
    const hasQuiz = lesson.blocks.some((b) => b.t === "quiz");

    const toggle = h("button", { type: "button", class: "btn btn--primary", "aria-pressed": "false" });
    toggle.addEventListener("click", () => store.setDone(this.#key, !store.isDone(this.#key)));
    this.#toggle = toggle;

    /** @param {typeof prev} target @param {"prev" | "next"} dir @returns {HTMLElement | null} */
    const pager = (target, dir) => target
      ? h("a", { class: `pager__link pager__link--${dir}`, href: href(target.module.id, target.index), rel: dir }, [
        h("span", { class: "eyebrow" }, [dir === "prev" ? icon(LEFT) : null, dir === "prev" ? "Previous" : "Next", dir === "next" ? icon(RIGHT) : null]),
        h("span", { class: "pager__title", text: target.lesson.title }),
        target.module.id !== m.id ? h("span", { class: "chip", style: `--chip-hue:${target.module.hue}`, text: target.module.short }) : null,
      ])
      : h("span");

    const article = h("article", { class: "lesson", "aria-labelledby": "lesson-title" }, [
      h("header", { class: "lesson__head" }, [
        h("p", { class: "lesson__kicker" }, [
          h("span", { class: "chip", style: `--chip-hue:${m.hue}`, text: m.short }),
          h("span", { class: "eyebrow", text: `Lesson ${index + 1} of ${m.lessons.length} · ${lesson.minutes} min read` }),
        ]),
        h("h1", { id: "lesson-title", class: "page__title", text: lesson.title }),
        h("p", { class: "page__lede", text: lesson.summary }),
      ]),
      h("div", { class: "lesson__body" }, lesson.blocks.map(renderBlock)),
      h("footer", { class: "lesson__foot" }, [
        h("div", { class: "lesson__done" }, [toggle, h("p", { text: "Progress saves automatically." })]),
        h("nav", { class: "pager", "aria-label": "Lesson navigation" }, [pager(prev, "prev"), pager(next, "next")]),
      ]),
    ]);

    const outline = h("aside", { class: "outline", "aria-label": "On this page" }, [
      h("p", { class: "eyebrow", text: "On this page" }),
      h("ul", {}, [
        ...headings.map((t) => h("li", {}, [h("a", { href: `#${slug(t)}`, "data-anchor": slug(t), text: t })])),
        hasQuiz ? h("li", {}, [h("span", { class: "outline__quiz", text: "Quick check at the end" })]) : null,
      ]),
      h("div", { class: "outline__module" }, [
        h("p", { class: "eyebrow", text: m.title }),
        h("ol", {}, m.lessons.map((l, i) => h("li", {}, [
          h("a", { href: href(m.id, i), "aria-current": i === index ? "page" : undefined, "data-done": String(store.isDone(lessonKey(m.id, l.id))) }, [l.title]),
        ]))),
      ]),
    ]);

    // In-page anchors must not change the route hash: scroll instead.
    outline.addEventListener("click", (event) => {
      const link = event.target instanceof Element ? event.target.closest("[data-anchor]") : null;
      if (!link) return;
      event.preventDefault();
      const target = this.querySelector(`#${link.getAttribute("data-anchor")}`);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });

    this.replaceChildren(h("div", { class: "page page--lesson" }, [article, outline]));
    this.#syncToggle();
    this.#watchSections();
  }
}

customElements.define("fd-lesson-view", FdLessonView);
