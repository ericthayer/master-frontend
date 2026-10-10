// @ts-check
import { h } from "./dom.js";

/**
 * A small, safe Markdown renderer for the playground: builds DOM nodes, never HTML strings.
 * Covers headings, paragraphs, emphasis, code, lists, task lists, links, images,
 * blockquotes (with GitHub alerts), tables and rules.
 */

const SPAN = /(`[^`]+`|!\[[^\]]*\]\([^)]*\)|\[[^\]]+\]\([^)]*\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;

/** @param {string} text @returns {DocumentFragment} */
function spans(text) {
  const frag = document.createDocumentFragment();
  for (const part of text.split(SPAN)) {
    if (!part) continue;
    let m;
    if (part.startsWith("`")) frag.append(h("code", { text: part.slice(1, -1) }));
    else if ((m = /^!\[([^\]]*)\]\(([^)]*)\)$/.exec(part))) {
      frag.append(h("span", { class: "md-img", role: "img", "aria-label": m[1] || "image" }, [`🖼 ${m[1] || m[2]}`]));
    } else if ((m = /^\[([^\]]+)\]\(([^)]*)\)$/.exec(part))) {
      const safe = /^https:\/\//.test(m[2]);
      frag.append(h("a", safe ? { href: m[2], target: "_blank", rel: "noopener" } : { href: "#", "data-inert": "true" }, [spans(m[1])]));
    } else if (part.startsWith("**")) frag.append(h("strong", {}, [spans(part.slice(2, -2))]));
    else if (/^[*_].+[*_]$/.test(part)) frag.append(h("em", {}, [spans(part.slice(1, -1))]));
    else frag.append(document.createTextNode(part));
  }
  return frag;
}

/** @param {string} line @returns {string[]} */
const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

/**
 * @param {string} source
 * @returns {DocumentFragment}
 */
export function renderMarkdown(source) {
  const out = document.createDocumentFragment();
  const lines = source.replace(/\r/g, "").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++;
      out.append(h("pre", {}, [h("code", { text: body.join("\n") })]));
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = /** @type {"h1"|"h2"|"h3"|"h4"|"h5"|"h6"} */ (`h${heading[1].length}`);
      out.append(h(level, {}, [spans(heading[2])]));
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.append(h("hr")); i++; continue; }

    if (line.trim().startsWith("|") && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] ?? "")) {
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      out.append(h("div", { class: "md-table" }, [h("table", {}, [
        h("thead", {}, [h("tr", {}, head.map((c) => h("th", {}, [spans(c)])))]),
        h("tbody", {}, rows.map((r) => h("tr", {}, r.map((c) => h("td", {}, [spans(c)]))))),
      ])]));
      continue;
    }

    if (line.startsWith(">")) {
      const body = [];
      while (i < lines.length && lines[i].startsWith(">")) body.push(lines[i++].replace(/^>\s?/, ""));
      const alert = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/.exec(body[0] ?? "");
      const quote = h("blockquote", alert ? { class: `md-alert md-alert--${alert[1].toLowerCase()}` } : {});
      if (alert) { quote.append(h("p", { class: "md-alert__title", text: alert[1][0] + alert[1].slice(1).toLowerCase() })); body.shift(); }
      quote.append(renderMarkdown(body.join("\n")));
      out.append(quote);
      continue;
    }

    const listMatch = /^(\s*)([-*+]|\d+\.)\s+/.exec(line);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[2]);
      const list = h(ordered ? "ol" : "ul");
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        const raw = lines[i++];
        const nested = /^\s{2,}/.test(raw);
        const text = raw.replace(/^\s*([-*+]|\d+\.)\s+/, "");
        const task = /^\[([ xX])\]\s+(.*)$/.exec(text);
        const li = task
          ? h("li", { class: "md-task" }, [h("input", { type: "checkbox", disabled: true, checked: task[1] !== " ", "aria-label": task[2] }), " ", spans(task[2])])
          : h("li", {}, [spans(text)]);
        if (nested) li.classList.add("md-nested");
        list.append(li);
      }
      out.append(list);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#|>|```|\s*([-*+]|\d+\.)\s|\|)/.test(lines[i])) para.push(lines[i++].trim());
    if (para.length === 0) para.push(lines[i++]);
    out.append(h("p", {}, [spans(para.join(" "))]));
  }
  return out;
}
