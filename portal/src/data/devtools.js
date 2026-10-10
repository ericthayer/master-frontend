// @ts-check
/** @type {import("../types").Module} */
export const devtools = {
  id: "devtools",
  title: "Browser DevTools & debugging",
  short: "DevTools",
  hue: "var(--hue-devtools)",
  icon: "M3 4h18v12H3z|M8 20h8|M12 16v4|M9 8l-2 2 2 2|M15 8l2 2-2 2",
  tagline: "Inspect, tweak and debug any page right in the browser.",
  outcome: "Find why a style is not applying, test layouts at any size, and read errors in the console.",
  lessons: [
    {
      id: "elements",
      title: "Opening DevTools and the Elements panel",
      minutes: 8,
      summary: "Inspect any element and edit the page live without breaking anything.",
      blocks: [
        { t: "p", text: "Every modern browser ships developer tools. These lessons use Chrome; Edge is identical and Firefox and Safari are close." },
        { t: "table", head: ["Action", "Mac", "Windows / Linux"], rows: [
          ["Open DevTools", "<kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>I</kbd>", "<kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd>"],
          ["Pick an element to inspect", "<kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>C</kbd>", "<kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>C</kbd>"],
          ["Toggle device mode", "<kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>M</kbd>", "<kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>M</kbd>"],
          ["Command menu", "<kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>P</kbd>", "<kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>P</kbd>"],
        ] },
        { t: "p", text: "You can also right-click anything on a page and choose **Inspect**. The Elements panel shows the live HTML tree; hovering a node highlights it on the page with its padding and margin." },
        { t: "callout", tone: "design", title: "Designer translation", text: "The Elements panel is Figma's layers panel for a live site. Selecting a node is like selecting a layer, and the Styles pane is the right-hand properties panel." },
        { t: "callout", tone: "tip", title: "Edits are temporary", text: "Double-click text or attributes to change them. Nothing you do here affects the real site; a reload resets it. That makes it a safe sandbox for trying copy or spacing." },
        { t: "quiz", q: "You changed a heading's text in the Elements panel and reloaded. What happens?", options: ["The change is saved to the site", "The change disappears", "The change appears for everyone"], answer: 1, why: "DevTools edits live only in your browser tab until reload. To make a change real it has to go into the code." },
      ],
    },
    {
      id: "styles",
      title: "Styles, Computed and \"why is this not applying?\"",
      minutes: 12,
      summary: "Read the cascade in the Styles pane and check contrast and spacing.",
      blocks: [
        { t: "p", text: "With an element selected, the **Styles** pane lists every CSS rule that matches it, most specific at the top. A declaration with a line through it was overridden by a rule above it." },
        { t: "steps", items: [
          { title: "Find the crossed-out property", text: "That is the style you expected. The rule above it with the same property won." },
          { title: "Check the Computed tab", text: "It shows the final value of each property and, when expanded, which rule set it." },
          { title: "Check for a typo", text: "An invalid value shows a yellow warning icon and is ignored." },
          { title: "Toggle rules on and off", text: "Click the checkbox next to a declaration to test what happens without it." },
        ] },
        { t: "h", text: "Built-in design QA" },
        { t: "list", items: [
          "Click any color swatch to open the color picker, which shows the **contrast ratio** against the background and whether it passes AA and AAA.",
          "The box model diagram at the bottom of Computed shows exact margin, border, padding and content sizes.",
          "Hover a flex or grid container's badge in Elements to overlay its gaps and tracks on the page.",
          "Force `:hover`, `:focus` or `:active` states with the **:hov** button to inspect them without moving the mouse.",
        ] },
        { t: "quiz", q: "In the Styles pane, `color: #999` has a line through it. What does that mean?", options: ["The color is invalid", "Another rule overrode it", "The color failed contrast"], answer: 1, why: "Strikethrough means overridden by a more specific or later rule. Invalid values show a warning icon instead." },
      ],
    },
    {
      id: "device-mode",
      title: "Device mode, throttling and audits",
      minutes: 10,
      summary: "Test responsive layouts, slow networks and accessibility.",
      blocks: [
        { t: "p", text: "**Device mode** resizes the page to any width and simulates touch. Pick a preset device or set Responsive and drag the edges. Dragging slowly through widths is the fastest way to find layout breaks between breakpoints." },
        { t: "list", items: [
          "**Network throttling** (Network panel) simulates slow connections so you can see loading states and layout shift.",
          "**Rendering → Emulate CSS media feature** switches `prefers-color-scheme` and `prefers-reduced-motion` to test dark mode and reduced motion.",
          "**Lighthouse** runs audits for performance, accessibility and SEO and lists specific failing elements.",
          "The **Accessibility** pane shows an element's computed name and role, exactly what a screen reader announces.",
        ] },
        { t: "callout", tone: "design", title: "A 5-minute QA routine", text: "Before approving a PR preview: drag from 360px to 1440px, toggle dark mode, tab through every control with the keyboard, then run Lighthouse's accessibility audit." },
        { t: "quiz", q: "How do you check a design in dark mode without changing your computer's settings?", options: ["Lighthouse", "Rendering → Emulate prefers-color-scheme", "Device mode presets"], answer: 1, why: "The Rendering panel can emulate media features like prefers-color-scheme for the current tab only." },
      ],
    },
    {
      id: "console-network",
      title: "Console and Network basics",
      minutes: 10,
      summary: "Read errors and spot missing or slow files.",
      blocks: [
        { t: "p", text: "The **Console** shows messages and errors from the page's JavaScript. Red lines are errors; yellow are warnings. A link on the right side of each message jumps to the line of code that caused it." },
        { t: "code", lang: "text", code: "Uncaught TypeError: Cannot read properties of undefined (reading 'name')\n    at UserCard (UserCard.tsx:12:24)", caption: "The code expected a user object but got nothing. Line 12 of UserCard.tsx." },
        { t: "p", text: "The **Network** panel lists every file the page loads, with its status code, size and timing. Reload with the panel open to capture everything." },
        { t: "table", head: ["Status", "Meaning", "Designer symptom"], rows: [
          ["200", "OK", "Everything loaded"],
          ["304", "Not modified, used the cached copy", "Normal on reload"],
          ["404", "File not found", "Broken image or missing font"],
          ["401 / 403", "Not allowed", "Empty data or a login wall"],
          ["500", "Server error", "Error page or a spinner that never stops"],
        ] },
        { t: "callout", tone: "tip", title: "Filter to find fonts and images", text: "Use the Font and Img filters in the Network panel to check that the right font files load and how heavy images are." },
        { t: "quiz", q: "A custom font is not showing. In Network you see the font file with status 404. What does that tell you?", options: ["The CSS has a typo in the font-family name", "The font file URL is wrong or the file is missing", "The browser does not support the font"], answer: 1, why: "404 means the request reached the server but nothing exists at that URL. The path in @font-face or the deployed file is wrong." },
      ],
    },
  ],
};
