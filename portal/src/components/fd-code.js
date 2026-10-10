// @ts-check
import { h, icon } from "../lib/dom.js";
import { highlight } from "../lib/highlight.js";

const COPY = "M9 9h11v11H9z|M5 15H4V4h11v1";
const CHECK = "M5 12l5 5L20 7";

/** Code sample with a language label and a copy button. */
export class FdCode extends HTMLElement {
  /** @type {{ code: string; lang: string; caption?: string } | null} */
  #data = null;

  /** @param {{ code: string; lang: string; caption?: string }} value */
  set data(value) {
    this.#data = value;
    if (this.isConnected) this.#render();
  }

  /** @returns {void} */
  connectedCallback() {
    if (this.#data && !this.firstChild) this.#render();
  }

  /** @returns {void} */
  #render() {
    const data = this.#data;
    if (!data) return;
    const code = h("code", {}, [highlight(data.lang, data.code)]);
    const status = h("span", { class: "visually-hidden", "aria-live": "polite" });
    const btn = h("button", { type: "button", class: "code__copy", "aria-label": `Copy ${data.lang} code` }, [icon(COPY)]);
    btn.addEventListener("click", () => this.#copy(code, btn, status));
    this.replaceChildren(h("figure", { class: "code" }, [
      h("div", { class: "code__bar" }, [h("span", { class: "code__lang", text: data.lang }), btn, status]),
      h("pre", { tabindex: 0, "aria-label": `${data.lang} code sample` }, [code]),
      data.caption ? h("figcaption", { text: data.caption }) : null,
    ]));
  }

  /**
   * @param {HTMLElement} code
   * @param {HTMLButtonElement} btn
   * @param {HTMLElement} status
   * @returns {Promise<void>}
   */
  async #copy(code, btn, status) {
    try {
      await navigator.clipboard.writeText(code.textContent ?? "");
      btn.replaceChildren(icon(CHECK));
      status.textContent = "Copied";
      setTimeout(() => { btn.replaceChildren(icon(COPY)); status.textContent = ""; }, 1600);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      status.textContent = "Selected. Press Ctrl+C or Command+C to copy.";
    }
  }
}

customElements.define("fd-code", FdCode);
