// @ts-check
import { s } from "./dom.js";

/** Inline SVG diagrams. Colors come from CSS classes bound to theme tokens. */

/** @param {number} x @param {number} y @param {string} text @param {string} [cls] @param {string} [anchor] @returns {SVGElement} */
const label = (x, y, text, cls = "dg-text", anchor = "middle") =>
  s("text", { x, y, class: cls, "text-anchor": anchor }, [text]);

/** @returns {SVGElement} */
function trunk() {
  /** @type {SVGElement[]} */
  const kids = [];
  kids.push(s("line", { x1: 30, y1: 110, x2: 620, y2: 110, class: "dg-main" }));
  kids.push(label(30, 92, "main", "dg-tag", "start"));
  const branches = [
    { from: 80, to: 200, up: true, name: "fix/contrast" },
    { from: 220, to: 360, up: false, name: "feat/empty-state" },
    { from: 380, to: 520, up: true, name: "feat/nav (flagged)" },
  ];
  for (const b of branches) {
    const y = b.up ? 50 : 170;
    kids.push(s("path", { d: `M${b.from} 110 C ${b.from + 30} 110, ${b.from + 20} ${y}, ${b.from + 50} ${y} L ${b.to - 50} ${y} C ${b.to - 20} ${y}, ${b.to - 30} 110, ${b.to} 110`, class: "dg-branch" }));
    kids.push(s("circle", { cx: b.from + 70, cy: y, r: 6, class: "dg-commit-b" }));
    kids.push(s("circle", { cx: b.to - 70, cy: y, r: 6, class: "dg-commit-b" }));
    kids.push(label((b.from + b.to) / 2, b.up ? y - 14 : y + 24, b.name, "dg-small"));
  }
  for (const x of [80, 200, 220, 360, 380, 520, 600]) kids.push(s("circle", { cx: x, cy: 110, r: 7, class: "dg-commit" }));
  kids.push(label(600, 140, "deploy", "dg-small"));
  return s("svg", { viewBox: "0 0 640 200", role: "img", "aria-label": "Three short-lived branches leave main and merge back in sequence; main is deployable at the end." }, kids);
}

/** @returns {SVGElement} */
function pipeline() {
  const stages = ["Push", "Install", "Lint", "Test", "Build", "Deploy"];
  /** @type {SVGElement[]} */
  const kids = [];
  stages.forEach((name, i) => {
    const x = 10 + i * 118;
    if (i > 0) kids.push(s("path", { d: `M${x - 22} 60 L ${x - 4} 60 M ${x - 10} 54 L ${x - 4} 60 L ${x - 10} 66`, class: "dg-arrow" }));
    kids.push(s("rect", { x, y: 34, width: 96, height: 52, rx: 8, class: i === stages.length - 1 ? "dg-box dg-box--accent" : "dg-box" }));
    kids.push(label(x + 48, 66, name, "dg-text dg-strong"));
    kids.push(label(x + 48, 108, i === 0 ? "you" : i === stages.length - 1 ? "after merge" : "automatic", "dg-small"));
  });
  return s("svg", { viewBox: "0 0 720 120", role: "img", "aria-label": "Pipeline stages in order: push, install, lint, test, build, deploy." }, kids);
}

/** @returns {SVGElement} */
function boxmodel() {
  const layers = [
    { n: "margin", x: 10, y: 10, w: 400, h: 240, cls: "dg-margin" },
    { n: "border", x: 50, y: 50, w: 320, h: 160, cls: "dg-border" },
    { n: "padding", x: 70, y: 70, w: 280, h: 120, cls: "dg-padding" },
    { n: "content", x: 120, y: 105, w: 180, h: 50, cls: "dg-content" },
  ];
  /** @type {SVGElement[]} */
  const kids = [];
  for (const l of layers) {
    kids.push(s("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 4, class: l.cls }));
    kids.push(label(l.n === "content" ? l.x + l.w / 2 : l.x + 10, l.n === "content" ? l.y + 30 : l.y + 18, l.n, "dg-small", l.n === "content" ? "middle" : "start"));
  }
  return s("svg", { viewBox: "0 0 420 260", role: "img", "aria-label": "Nested boxes: margin outermost, then border, then padding, then content." }, kids);
}

/** @returns {SVGElement} */
function viteFlow() {
  /** @type {SVGElement[]} */
  const kids = [];
  const box = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ w, /** @type {string} */ t, /** @type {string} */ sub, accent = false) => {
    kids.push(s("rect", { x, y, width: w, height: 56, rx: 8, class: accent ? "dg-box dg-box--accent" : "dg-box" }));
    kids.push(label(x + w / 2, y + 25, t, "dg-text dg-strong"));
    kids.push(label(x + w / 2, y + 44, sub, "dg-small"));
  };
  box(10, 82, 150, "src/", ".ts .jsx .css");
  box(230, 82, 130, "Vite", "dev or build", true);
  box(440, 20, 190, "npm run dev", "localhost:5173");
  box(440, 144, 190, "npm run build", "dist/ → host");
  kids.push(s("path", { d: "M160 110 L 224 110 M 218 104 L 224 110 L 218 116", class: "dg-arrow" }));
  kids.push(s("path", { d: "M360 100 C 400 100, 400 48, 434 48 M 428 42 L 434 48 L 428 54", class: "dg-arrow" }));
  kids.push(s("path", { d: "M360 120 C 400 120, 400 172, 434 172 M 428 166 L 434 172 L 428 178", class: "dg-arrow" }));
  return s("svg", { viewBox: "0 0 640 220", role: "img", "aria-label": "Source files go into Vite, which either serves them on a local dev server or builds them into a dist folder for hosting." }, kids);
}

/** @type {Record<import("../types").DiagramName, () => SVGElement>} */
export const diagrams = { trunk, pipeline, boxmodel, vite: viteFlow };
