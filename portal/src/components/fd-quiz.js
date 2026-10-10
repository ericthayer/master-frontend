// @ts-check
import { h, inline } from "../lib/dom.js";

let uid = 0;

/** Single-question knowledge check with keyboard-native radio inputs. */
export class FdQuiz extends HTMLElement {
  /** @type {Extract<import("../types").Block, { t: "quiz" }> | null} */
  #data = null;

  /** @param {Extract<import("../types").Block, { t: "quiz" }>} value */
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
    const id = `quiz-${++uid}`;
    const feedback = h("p", { class: "quiz__feedback", "aria-live": "polite", id: `${id}-fb` });
    const options = data.options.map((text, i) => h("label", { class: "quiz__option", for: `${id}-${i}` }, [
      h("input", { type: "radio", name: id, id: `${id}-${i}`, value: String(i) }),
      h("span", { text }),
    ]));
    const submit = h("button", { type: "submit", class: "btn btn--primary" }, ["Check answer"]);
    const form = h("form", { class: "quiz", "aria-describedby": `${id}-fb` }, [
      h("fieldset", {}, [
        h("legend", {}, [h("span", { class: "eyebrow", text: "Quick check" }), h("span", { class: "quiz__q" }, [inline(data.q)])]),
        h("div", { class: "quiz__options" }, options),
      ]),
      h("div", { class: "quiz__foot" }, [submit, feedback]),
    ]);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const picked = form.querySelector("input:checked");
      if (!(picked instanceof HTMLInputElement)) {
        feedback.dataset.state = "empty";
        feedback.textContent = "Pick an answer first.";
        return;
      }
      const correct = Number(picked.value) === data.answer;
      options.forEach((opt, i) => {
        opt.dataset.state = i === data.answer ? "right" : opt.contains(picked) ? "wrong" : "";
      });
      feedback.dataset.state = correct ? "right" : "wrong";
      feedback.textContent = `${correct ? "Correct." : "Not quite."} ${data.why}`;
    });

    this.replaceChildren(form);
  }
}

customElements.define("fd-quiz", FdQuiz);
