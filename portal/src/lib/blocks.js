// @ts-check
import { h, inline, slug } from "./dom.js";
import { diagrams } from "./diagrams.js";
import { glossaryHref } from "../data/glossary.js";

const CALLOUT_LABEL = { design: "For designers", tip: "Tip", warn: "Careful" };

/**
 * Render one content block into DOM. Pure: no state, no listeners beyond child components.
 * @param {import("../types").Block} block
 * @returns {HTMLElement}
 */
export function renderBlock(block) {
  switch (block.t) {
    case "p":
      return h("p", {}, [inline(block.text)]);
    case "h":
      return h("h2", { id: slug(block.text), class: "lesson__h" }, [block.text]);
    case "list":
      return h(block.ordered ? "ol" : "ul", { class: "lesson__list" }, block.items.map((item) => h("li", {}, [inline(item)])));
    case "code": {
      const el = /** @type {import("../components/fd-code.js").FdCode} */ (document.createElement("fd-code"));
      el.data = { code: block.code, lang: block.lang, caption: block.caption };
      return el;
    }
    case "callout":
      return h("aside", { class: `callout callout--${block.tone}`, "aria-label": CALLOUT_LABEL[block.tone] }, [
        h("p", { class: "callout__title" }, [block.title]),
        h("p", {}, [inline(block.text)]),
      ]);
    case "terms":
      return h("dl", { class: "terms" }, block.items.flatMap(([term, def]) => {
        const link = glossaryHref(term);
        return [
          h("dt", {}, [link ? h("a", { href: link, class: "terms__link", "aria-label": `${term}, open in glossary` }, [inline(term)]) : inline(term)]),
          h("dd", {}, [inline(def)]),
        ];
      }));
    case "steps":
      return h("ol", { class: "steps" }, block.items.map((step) => {
        let code = null;
        if (step.code) {
          code = /** @type {import("../components/fd-code.js").FdCode} */ (document.createElement("fd-code"));
          code.data = { code: step.code, lang: "bash" };
        }
        return h("li", { class: "steps__item" }, [
          h("p", { class: "steps__title" }, [step.title]),
          h("p", {}, [inline(step.text)]),
          code,
        ]);
      }));
    case "table":
      return h("div", { class: "table-wrap", role: "region", tabindex: 0, "aria-label": "Reference table" }, [
        h("table", {}, [
          h("thead", {}, [h("tr", {}, block.head.map((c) => h("th", { scope: "col" }, [inline(c)])))]),
          h("tbody", {}, block.rows.map((row) => h("tr", {}, row.map((c, i) =>
            i === 0 ? h("th", { scope: "row" }, [inline(c)]) : h("td", {}, [inline(c)]))))),
        ]),
      ]);
    case "diagram":
      return h("figure", { class: "diagram" }, [
        h("div", { class: "diagram__canvas" }, [diagrams[block.name]()]),
        h("figcaption", {}, [block.caption]),
      ]);
    case "playground": {
      const el = /** @type {import("../components/fd-playground.js").FdPlayground} */ (document.createElement("fd-playground"));
      el.data = block;
      return el;
    }
    case "quiz": {
      const el = /** @type {import("../components/fd-quiz.js").FdQuiz} */ (document.createElement("fd-quiz"));
      el.data = block;
      return el;
    }
  }
}
