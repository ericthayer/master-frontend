// @ts-check
/** DOM construction helpers. No innerHTML for content: text goes through textContent. */

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Record<string, string | number | boolean | undefined>} [attrs]
 * @param {Array<Node | string | null | undefined | false>} [children]
 * @returns {HTMLElementTagNameMap[K]}
 */
export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key === "class") el.className = String(value);
    else if (key === "text") el.textContent = String(value);
    else el.setAttribute(key, value === true ? "" : String(value));
  }
  append(el, children);
  return el;
}

/**
 * @param {ParentNode} parent
 * @param {Array<Node | string | null | undefined | false>} children
 * @returns {void}
 */
export function append(parent, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * @param {string} tag
 * @param {Record<string, string | number>} [attrs]
 * @param {Array<SVGElement | string>} [children]
 * @returns {SVGElement}
 */
export function s(tag, attrs = {}, children = []) {
  const el = /** @type {SVGElement} */ (document.createElementNS(SVG_NS, tag));
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  for (const child of children) el.append(child);
  return el;
}

/**
 * Icon from a trusted, author-controlled path string (never user input).
 * @param {string} d
 * @returns {SVGElement}
 */
export function icon(d) {
  return s("svg", {
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    "stroke-width": 1.75, "stroke-linecap": "round", "stroke-linejoin": "round",
    "aria-hidden": "true", focusable: "false",
  }, d.split("|").map((path) => s("path", { d: path })));
}

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|<kbd>[^<]+<\/kbd>)/g;

/**
 * Render a small inline syntax: `code`, **bold**, [link](https://…), <kbd>key</kbd>.
 * @param {string} text
 * @returns {DocumentFragment}
 */
export function inline(text) {
  const frag = document.createDocumentFragment();
  for (const part of text.split(INLINE)) {
    if (!part) continue;
    if (part.startsWith("`") && part.endsWith("`")) frag.append(h("code", { text: part.slice(1, -1) }));
    else if (part.startsWith("**")) frag.append(h("strong", { text: part.slice(2, -2) }));
    else if (part.startsWith("<kbd>")) frag.append(h("kbd", { text: part.slice(5, -6) }));
    else if (part.startsWith("[")) {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      const href = m?.[2] ?? "";
      const safe = /^(https:\/\/|#)/.test(href);
      frag.append(safe && m
        ? h("a", { href, ...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {}) }, [m[1]])
        : document.createTextNode(part));
    } else frag.append(document.createTextNode(part));
  }
  return frag;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
