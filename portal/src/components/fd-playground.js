// @ts-check
import { h } from "../lib/dom.js";
import { renderMarkdown } from "../lib/markdown.js";
import { createEditor } from "../lib/code-editor.js";

/** @typedef {Extract<import("../types").Block, { t: "playground" }>} PlaygroundBlock */

let uid = 0;
const BLOCKED = "script, iframe, object, embed, link, meta, base, form";

/**
 * Parse viewer-typed HTML without executing it, strip active content, return inert nodes.
 * @param {string} markup
 * @returns {DocumentFragment}
 */
function sanitize(markup) {
  const doc = new DOMParser().parseFromString(`<body>${markup}</body>`, "text/html");
  doc.querySelectorAll(BLOCKED).forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      const value = attr.value.trim().toLowerCase();
      if (attr.name.startsWith("on") || value.startsWith("javascript:") || attr.name === "srcdoc") el.removeAttribute(attr.name);
    }
  });
  const frag = document.createDocumentFragment();
  frag.append(...[...doc.body.childNodes].map((n) => document.importNode(n, true)));
  return frag;
}

/** Live editor: HTML + CSS rendered into an isolated shadow root, or Markdown rendered to DOM. */
export class FdPlayground extends HTMLElement {
  /** @type {PlaygroundBlock | null} */
  #data = null;
  /** @type {number} */
  #frame = 0;
  /** @type {ResizeObserver | null} */
  #observer = null;

  /** @param {PlaygroundBlock} value */
  set data(value) {
    this.#data = value;
    if (this.isConnected) this.#render();
  }

  /** @returns {void} */
  connectedCallback() {
    if (this.#data && !this.firstChild) this.#render();
  }

  /** @returns {void} */
  disconnectedCallback() {
    this.#observer?.disconnect();
    cancelAnimationFrame(this.#frame);
  }

  /** @returns {void} */
  #render() {
    const data = this.#data;
    if (!data) return;
    const id = `pg-${++uid}`;
    const isMd = data.kind === "md";

    const hintId = `${id}-hint`;
    const make = (/** @type {string} */ label, /** @type {string} */ lang, /** @type {string} */ value) =>
      createEditor({ id: `${id}-${lang}`, label, lang, value, hintId, onInput: () => update() });
    const editors = data.kind === "md"
      ? [make("Markdown", "markdown", data.md)]
      : [make("HTML", "html", data.html), make("CSS", "css", data.css)];
    const host = h("div", { class: isMd ? "pg__md" : "pg__host" });
    const width = h("span", { class: "pg__width", "aria-hidden": "true" });
    const viewport = h("div", { class: "pg__viewport", role: "region", "aria-label": "Live preview", tabindex: 0 }, [host]);
    const reset = h("button", { type: "button", class: "btn btn--ghost" }, ["Reset"]);

    const root = isMd ? null : host.attachShadow({ mode: "open" });

    const update = () => {
      cancelAnimationFrame(this.#frame);
      this.#frame = requestAnimationFrame(() => {
        if (data.kind === "md") {
          host.replaceChildren(renderMarkdown(editors[0].area.value));
        } else if (root) {
          const style = document.createElement("style");
          style.textContent = `:host{display:block;color:#111;background:#fff;font:15px/1.5 system-ui,sans-serif}${editors[1].area.value}`;
          root.replaceChildren(style, sanitize(editors[0].area.value));
        }
      });
    };

    host.addEventListener("click", (e) => { if (e.composedPath().some((n) => n instanceof HTMLAnchorElement)) e.preventDefault(); });
    reset.addEventListener("click", () => {
      if (data.kind === "md") editors[0].set(data.md);
      else { editors[0].set(data.html); editors[1].set(data.css); }
      update();
    });

    this.#observer = new ResizeObserver(([entry]) => {
      width.textContent = `${Math.round(entry.contentRect.width)}px`;
    });
    this.#observer.observe(viewport);

    this.replaceChildren(h("section", { class: "pg", "aria-labelledby": `${id}-title` }, [
      h("header", { class: "pg__head" }, [
        h("div", {}, [
          h("p", { class: "eyebrow", id: `${id}-title`, text: isMd ? "Markdown playground" : "HTML & CSS playground" }),
          h("p", { class: "pg__task" }, [h("strong", { text: "Try it: " }), data.task]),
          h("p", { class: "pg__hint", id: hintId, text: "Tab indents. Press Esc, then Tab, to leave the editor." }),
        ]),
        reset,
      ]),
      h("div", { class: "pg__body" }, [
        h("div", { class: "pg__editors" }, editors.map((e) => e.field)),
        h("div", { class: "pg__preview" }, [
          h("div", { class: "pg__chrome", "aria-hidden": "true" }, [h("i"), h("i"), h("i"), width]),
          viewport,
        ]),
      ]),
    ]));
    update();
  }
}

customElements.define("fd-playground", FdPlayground);
