// @ts-check
import { h } from "./dom.js";
import { highlight } from "./highlight.js";

const INDENT = "  ";

/**
 * @typedef {{ field: HTMLElement; area: HTMLTextAreaElement; set: (value: string) => void }} CodeEditor
 */

/**
 * Plain textarea layered over a highlighted <pre>. The textarea owns input, selection and
 * accessibility; the <pre> is decorative (aria-hidden) and mirrors its text and scroll.
 *
 * Keyboard: Tab / Shift+Tab indent and outdent. Esc releases the trap so the next Tab
 * moves focus out of the editor (WCAG 2.1.2 No Keyboard Trap).
 *
 * @param {{ id: string; label: string; lang: string; value: string; hintId: string; onInput: () => void }} opts
 * @returns {CodeEditor}
 */
export function createEditor({ id, label, lang, value, hintId, onInput }) {
  const code = h("code");
  const mirror = h("pre", { class: "ed__mirror", "aria-hidden": "true" }, [code]);
  const area = h("textarea", {
    id, class: "ed__input", spellcheck: "false", autocapitalize: "off", autocomplete: "off",
    wrap: "off", rows: 9, "aria-describedby": hintId,
  });
  area.value = value;
  let released = false;

  const paint = () => {
    // A trailing newline needs a placeholder character so the mirror keeps the same height.
    code.replaceChildren(highlight(lang, area.value.endsWith("\n") ? `${area.value} ` : area.value));
    mirror.scrollTop = area.scrollTop;
    mirror.scrollLeft = area.scrollLeft;
  };

  area.addEventListener("input", () => { paint(); onInput(); });
  area.addEventListener("scroll", () => {
    mirror.scrollTop = area.scrollTop;
    mirror.scrollLeft = area.scrollLeft;
  });
  area.addEventListener("blur", () => { released = false; });
  area.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { released = true; return; }
    if (e.key !== "Tab" || released || e.altKey || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    indent(area, e.shiftKey);
    paint();
    onInput();
  });

  paint();
  return {
    field: h("div", { class: "pg__field" }, [
      h("label", { for: id, class: "pg__label", text: label }),
      h("div", { class: "ed" }, [mirror, area]),
    ]),
    area,
    set(next) { area.value = next; paint(); },
  };
}

/**
 * Indent or outdent the selected lines (or insert spaces at the caret).
 * @param {HTMLTextAreaElement} area
 * @param {boolean} outdent
 * @returns {void}
 */
function indent(area, outdent) {
  const { value, selectionStart: start, selectionEnd: end } = area;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  if (start === end && !outdent) {
    area.setRangeText(INDENT, start, end, "end");
    return;
  }
  const block = value.slice(lineStart, end);
  const lines = block.split("\n");
  const changed = lines.map((line) => (outdent ? line.replace(/^ {1,2}/, "") : INDENT + line));
  const delta = changed.join("\n").length - block.length;
  const firstDelta = changed[0].length - lines[0].length;
  area.setRangeText(changed.join("\n"), lineStart, end, "preserve");
  area.selectionStart = Math.max(lineStart, start + firstDelta);
  area.selectionEnd = end + delta;
}
