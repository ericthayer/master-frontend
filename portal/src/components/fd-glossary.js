// @ts-check
import { h } from "../lib/dom.js";
import { href } from "../lib/router.js";
import { glossary } from "../data/glossary.js";
import { modules } from "../data/modules.js";

/** @param {string} term @returns {string} */
const letterOf = (term) => (term.replace(/^[^\p{L}]+/u, "")[0] ?? "#").toUpperCase();

/** Searchable A–Z glossary. Every entry links to the lesson that teaches it. */
export class FdGlossary extends HTMLElement {
  /** @type {string | null} */
  #focusTerm = null;

  /** @param {string | null} value term slug to scroll to */
  set term(value) {
    this.#focusTerm = value;
  }

  /** @returns {void} */
  connectedCallback() {
    const search = h("input", { type: "search", id: "glossary-search", class: "gloss__search", placeholder: "Filter terms, e.g. commit, token, contrast", autocomplete: "off", "aria-describedby": "glossary-count" });
    const count = h("p", { id: "glossary-count", class: "gloss__count", "aria-live": "polite" });
    const empty = h("p", { class: "gloss__empty", hidden: true, text: "No terms match. Try a shorter word." });

    /** @type {Map<string, HTMLElement[]>} */
    const groups = new Map();
    /** @type {Array<{ el: HTMLElement; text: string }>} */
    const rows = [];
    for (const entry of glossary) {
      const m = modules.find((x) => x.id === entry.moduleId);
      if (!m) continue;
      const lesson = m.lessons[entry.lessonIndex];
      const row = h("div", { class: "gloss__row", id: `term-${entry.slug}` }, [
        h("dt", { text: entry.term }),
        h("dd", {}, [
          h("p", { text: entry.def }),
          h("a", { class: "gloss__src", href: href(m.id, entry.lessonIndex), style: `--chip-hue:${m.hue}` }, [
            h("span", { class: "chip", text: m.short }), ` ${lesson.title}`,
          ]),
        ]),
      ]);
      rows.push({ el: row, text: `${entry.term} ${entry.def}`.toLowerCase() });
      const letter = letterOf(entry.term);
      groups.set(letter, [...(groups.get(letter) ?? []), row]);
    }

    const sections = [...groups.entries()].map(([letter, items]) => h("section", { class: "gloss__group", "aria-labelledby": `letter-${letter}` }, [
      h("h2", { id: `letter-${letter}`, class: "gloss__letter", text: letter }),
      h("dl", { class: "gloss__list" }, items),
    ]));

    const jump = h("nav", { class: "gloss__jump", "aria-label": "Jump to letter" }, [...groups.keys()].map((letter) => {
      const btn = h("button", { type: "button", "aria-label": `Terms starting with ${letter}`, text: letter });
      btn.addEventListener("click", () => this.#reveal(this.querySelector(`#letter-${letter}`)));
      return btn;
    }));

    const filter = () => {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let shown = 0;
      for (const { el, text } of rows) {
        const match = terms.every((t) => text.includes(t));
        el.hidden = !match;
        if (match) shown++;
      }
      sections.forEach((s) => { s.hidden = !s.querySelector(".gloss__row:not([hidden])"); });
      empty.hidden = shown > 0;
      count.textContent = `${shown} of ${rows.length} terms`;
    };
    search.addEventListener("input", filter);

    this.replaceChildren(h("div", { class: "page" }, [
      h("header", { class: "gloss__head" }, [
        h("p", { class: "eyebrow", text: "Reference" }),
        h("h1", { class: "page__title", text: "Glossary" }),
        h("p", { class: "page__lede", text: "Every term from the course in plain language, with a link to the lesson that explains it." }),
      ]),
      h("div", { class: "gloss__tools" }, [
        h("label", { for: "glossary-search", class: "visually-hidden", text: "Filter glossary terms" }),
        search, count, jump,
      ]),
      empty,
      h("div", { class: "gloss__body" }, sections),
    ]));
    filter();

    if (this.#focusTerm) {
      const target = this.querySelector(`#term-${CSS.escape(this.#focusTerm)}`);
      if (target instanceof HTMLElement) {
        target.dataset.flash = "true";
        requestAnimationFrame(() => this.#reveal(target));
      }
    }
  }

  /** @param {Element | null} target @returns {void} */
  #reveal(target) {
    if (!(target instanceof HTMLElement)) return;
    target.tabIndex = -1;
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }
}

customElements.define("fd-glossary", FdGlossary);
