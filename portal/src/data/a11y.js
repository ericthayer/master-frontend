// @ts-check
/** @type {import("../types").Module} */
export const a11y = {
  id: "a11y",
  title: "Accessibility in code",
  short: "A11y",
  hue: "var(--hue-a11y)",
  icon: "M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z|M5 8l7 1.5L19 8|M12 9.5V14|M9 21l3-7 3 7",
  tagline: "What makes an interface usable with a keyboard, a screen reader and low vision.",
  outcome: "Spot inaccessible markup, name controls correctly, design visible focus, and run a basic accessibility check.",
  lessons: [
    {
      id: "semantics",
      title: "Semantic HTML does most of the work",
      minutes: 9,
      summary: "Native elements come with keyboard support and meaning built in.",
      blocks: [
        { t: "p", text: "Browsers build an **accessibility tree** from the HTML: a simplified version of the page with each element's role, name and state. Screen readers read that tree, not the visual design." },
        { t: "table", head: ["", "`<button>`", "`<div onclick>`"], rows: [
          ["Reachable with Tab", "Yes", "No"],
          ["Works with Enter and Space", "Yes", "No"],
          ["Announced as a button", "Yes", "No, just text"],
          ["Extra code needed", "None", "Role, tabindex and key handling"],
        ] },
        { t: "callout", tone: "design", title: "Designer translation", text: "Annotate your designs with the element, not just the look: \"button\", \"link\", \"heading level 2\". It removes guesswork and most accessibility bugs." },
        { t: "playground", kind: "html", task: "This \"button\" can't be reached with Tab. Replace the div with a real button element, then press Tab in the preview to check.", html: "<div class=\"btn\">Delete project</div>\n<p>Only owners can delete projects.</p>", css: ".btn {\n  display: inline-block;\n  padding: 8px 14px;\n  background: #c42b2b;\n  color: white;\n  border: 0;\n  border-radius: 6px;\n  font: inherit;\n  cursor: pointer;\n}" },
        { t: "quiz", q: "Why is a div with a click handler worse than a button?", options: ["It looks different", "Keyboard and screen reader users can't find or use it", "It loads slower"], answer: 1, why: "A div has no role, can't receive focus and ignores Enter and Space unless all of that is rebuilt by hand." },
      ],
    },
    {
      id: "names-aria",
      title: "Names, roles and ARIA",
      minutes: 11,
      summary: "Every control needs a name a screen reader can announce.",
      blocks: [
        { t: "p", text: "The **accessible name** is what a screen reader says for a control. Visible text is the best source. Icon-only buttons have no text, so they need a name added." },
        { t: "code", lang: "html", code: "<!-- Name from visible text -->\n<button>Save changes</button>\n\n<!-- Icon-only: name from aria-label -->\n<button aria-label=\"Close dialog\">\n  <svg aria-hidden=\"true\">…</svg>\n</button>\n\n<!-- Form field: name from its label -->\n<label for=\"email\">Work email</label>\n<input id=\"email\" type=\"email\">" },
        { t: "p", text: "**ARIA** attributes add roles, names and states that HTML can't express. The first rule of ARIA: if a native element does the job, use it instead." },
        { t: "table", head: ["Attribute", "Use it for"], rows: [
          ["`aria-label`", "A name when there is no visible text"],
          ["`aria-expanded`", "Whether a menu or accordion is open"],
          ["`aria-current=\"page\"`", "The active item in navigation"],
          ["`aria-live=\"polite\"`", "Announcing updates like \"Saved\" without moving focus"],
          ["`aria-hidden=\"true\"`", "Hiding decorative icons from screen readers"],
          ["`aria-describedby`", "Linking extra help or error text to a field"],
        ] },
        { t: "callout", tone: "tip", title: "Placeholder is not a label", text: "Placeholder text disappears when you type and is often low contrast. Keep a visible label above every field." },
        { t: "quiz", q: "A search button shows only a magnifying glass icon. What does it need?", options: ["A title attribute", "aria-label=\"Search\"", "Nothing, the icon is clear"], answer: 1, why: "Without text the button has no accessible name. aria-label gives screen readers \"Search, button\"." },
      ],
    },
    {
      id: "focus-keyboard",
      title: "Focus and keyboard navigation",
      minutes: 10,
      summary: "Design the focus state as carefully as the hover state.",
      blocks: [
        { t: "p", text: "Keyboard users move through a page with Tab, and the **focus indicator** shows where they are. Tab order follows the HTML order, so the visual order and the code order must match." },
        { t: "code", lang: "css", code: "/* Show a ring for keyboard focus, not for mouse clicks */\nbutton:focus-visible {\n  outline: 2px solid var(--color-focus);\n  outline-offset: 2px;\n}\n\n/* Never do this without a replacement */\nbutton:focus { outline: none; }" },
        { t: "list", items: [
          "**Focus not obscured** (WCAG 2.4.11): sticky headers and banners must not cover the focused element.",
          "**Target size** (WCAG 2.5.8): clickable targets should be at least 24 by 24 CSS pixels.",
          "Dialogs move focus inside when they open and return it to the trigger when they close. The native `<dialog>` element handles most of this.",
          "A **skip link** lets keyboard users jump past the navigation to the main content.",
        ] },
        { t: "playground", kind: "html", task: "Click into the preview and press Tab. Then add a :focus-visible style with a 2px outline so the focused link is obvious.", html: "<nav>\n  <a href=\"#\">Overview</a>\n  <a href=\"#\">Billing</a>\n  <a href=\"#\">Team</a>\n</nav>", css: "nav { display: flex; gap: 16px; font-family: system-ui; }\na { color: #1d4ed8; padding: 4px; }\na:focus { outline: none; }" },
        { t: "quiz", q: "Which CSS pseudo-class shows a focus ring for keyboard users without showing it on every mouse click?", options: [":focus", ":focus-visible", ":active"], answer: 1, why: ":focus-visible matches when the browser decides a visible indicator is helpful, which is mainly keyboard focus." },
      ],
    },
    {
      id: "contrast-testing",
      title: "Contrast, motion and testing",
      minutes: 10,
      summary: "The numbers to remember and a routine to check your work.",
      blocks: [
        { t: "table", head: ["Content", "Minimum contrast (AA)"], rows: [
          ["Body text", "4.5 : 1"],
          ["Large text (24px, or 18.66px bold)", "3 : 1"],
          ["Icons, borders of inputs, focus rings", "3 : 1 against neighbors"],
          ["Disabled controls and decoration", "No requirement"],
        ] },
        { t: "code", lang: "css", code: "@media (prefers-reduced-motion: reduce) {\n  * {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}", caption: "Respect the system setting for people who get motion sick." },
        { t: "h", text: "A 10-minute check" },
        { t: "steps", items: [
          { title: "Automated scan", text: "Run axe DevTools or Lighthouse's accessibility audit. They catch about a third of issues, mostly contrast and missing names." },
          { title: "Keyboard only", text: "Put the mouse away. Can you reach and use everything with Tab, Enter, Space, arrows and Esc? Is focus always visible?" },
          { title: "Zoom to 200%", text: "Text should reflow without overlapping or horizontal scrolling." },
          { title: "Screen reader", text: "On a Mac, toggle VoiceOver with <kbd>⌘</kbd> <kbd>F5</kbd>. On Windows use NVDA. Listen to one key flow end to end." },
        ] },
        { t: "callout", tone: "design", title: "Design for it up front", text: "Check contrast with your token pairs before handoff, design focus and error states, and write the alt text and button labels in the spec." },
        { t: "quiz", q: "Gray 14px body text measures 3.8:1 against its background. Does it pass WCAG AA?", options: ["Yes", "No, body text needs 4.5:1", "Only in dark mode"], answer: 1, why: "Normal-size text needs at least 4.5:1. The 3:1 minimum applies only to large text and UI components." },
      ],
    },
  ],
};
