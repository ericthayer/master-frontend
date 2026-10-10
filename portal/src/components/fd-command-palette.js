// @ts-check
import { h, icon } from "../lib/dom.js";
import { href } from "../lib/router.js";
import { flatLessons, modules } from "../data/modules.js";
import { glossary } from "../data/glossary.js";

const SEARCH = "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z|M20 20l-4-4";

/** @typedef {{ label: string; detail: string; hue: string; target: string; haystack: string }} Item */

/** @returns {Item[]} */
function index() {
  /** @type {Item[]} */
  const items = modules.map((m) => ({ label: m.title, detail: "Module", hue: m.hue, target: href(m.id), haystack: `${m.title} ${m.tagline}`.toLowerCase() }));
  for (const { module, lesson, index: i } of flatLessons()) {
    const body = lesson.blocks.map((b) => ("text" in b ? b.text : "q" in b ? b.q : "")).join(" ");
    items.push({ label: lesson.title, detail: module.short, hue: module.hue, target: href(module.id, i), haystack: `${lesson.title} ${lesson.summary} ${body}`.toLowerCase() });
  }
  for (const entry of glossary) {
    items.push({ label: entry.term, detail: "Glossary", hue: "var(--fg-faint)", target: `#glossary.${entry.slug}`, haystack: `${entry.term} ${entry.def}`.toLowerCase() });
  }
  return items;
}

/** Command palette (⌘K / Ctrl K): ARIA combobox over a listbox inside a native modal dialog. */
export class FdCommandPalette extends HTMLElement {
  /** @type {Item[]} */
  #items = [];
  /** @type {Item[]} */
  #results = [];
  /** @type {number} */
  #active = 0;
  #dialog = h("dialog", { class: "palette", "aria-label": "Search lessons" });
  #input = h("input", { type: "search", id: "palette-input", role: "combobox", "aria-expanded": "true", "aria-controls": "palette-list", "aria-autocomplete": "list", placeholder: "Search lessons, e.g. branch, clamp, .env", autocomplete: "off" });
  #list = h("ul", { id: "palette-list", role: "listbox", "aria-label": "Results" });
  #count = h("p", { class: "visually-hidden", "aria-live": "polite" });

  /** @returns {void} */
  connectedCallback() {
    this.#items = index();
    this.#dialog.append(
      h("div", { class: "palette__field" }, [icon(SEARCH), h("label", { for: "palette-input", class: "visually-hidden", text: "Search lessons" }), this.#input, h("kbd", { text: "Esc" })]),
      this.#list,
      this.#count,
    );
    this.replaceChildren(this.#dialog);

    this.#input.addEventListener("input", () => { this.#active = 0; this.#search(); });
    this.#input.addEventListener("keydown", (e) => this.#onKey(e));
    this.#dialog.addEventListener("click", (e) => { if (e.target === this.#dialog) this.#dialog.close(); });
    this.#list.addEventListener("click", (e) => {
      const opt = e.target instanceof Element ? e.target.closest("[data-index]") : null;
      if (opt) this.#go(Number(opt.getAttribute("data-index")));
    });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); this.open(); }
    });
  }

  /** @returns {void} */
  open() {
    if (this.#dialog.open) return;
    this.#input.value = "";
    this.#active = 0;
    this.#search();
    this.#dialog.showModal();
    this.#input.focus();
  }

  /** @returns {void} */
  #search() {
    const q = this.#input.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    this.#results = (terms.length ? this.#items.filter((it) => terms.every((t) => it.haystack.includes(t))) : this.#items.filter((it) => it.detail === "Module")).slice(0, 12);
    this.#list.replaceChildren(...this.#results.map((it, i) => h("li", {
      role: "option", id: `palette-opt-${i}`, "data-index": i, "aria-selected": String(i === this.#active), class: "palette__opt",
    }, [
      h("span", { class: "chip", style: `--chip-hue:${it.hue}`, text: it.detail }),
      h("span", { class: "palette__label", text: it.label }),
    ])));
    if (this.#results.length === 0) this.#list.append(h("li", { class: "palette__empty", text: "No lessons match. Try a shorter word." }));
    if (this.#results.length) this.#input.setAttribute("aria-activedescendant", `palette-opt-${this.#active}`);
    else this.#input.removeAttribute("aria-activedescendant");
    this.#count.textContent = `${this.#results.length} results`;
  }

  /** @param {KeyboardEvent} e @returns {void} */
  #onKey(e) {
    const n = this.#results.length;
    if (!n) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      this.#active = (this.#active + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
      this.#list.querySelectorAll("[role=option]").forEach((el, i) => el.setAttribute("aria-selected", String(i === this.#active)));
      this.#input.setAttribute("aria-activedescendant", `palette-opt-${this.#active}`);
      this.#list.children[this.#active]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      this.#go(this.#active);
    }
  }

  /** @param {number} i @returns {void} */
  #go(i) {
    const item = this.#results[i];
    if (!item) return;
    this.#dialog.close();
    location.hash = item.target;
  }
}

customElements.define("fd-command-palette", FdCommandPalette);
