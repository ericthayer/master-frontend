import type { Course } from "../types.ts";
import { githubHome, goLive, workbench } from "../shared.ts";
import { reference as ref } from "../reference.ts";

export const productCourse: Course = {
  slug: "copilot-for-product-teams",
  title: "Copilot for Product Teams",
  audience: "product-design",
  tier: "paid",
  tagline: "Brief to clickable prototype in an afternoon — then hand developers something real.",
  project: "A clickable feature prototype with a one-page spec",
  outcome: "You can turn a product brief into a responsive prototype, share it as a live link and hand it off with a generated spec.",
  accent: "#a78bfa",
  modules: [
    workbench({
      prefix: "pd",
      focus: "Use a fast model for copy and spacing tweaks; switch to a stronger reasoning model when you ask for a new screen, interaction states or a multi-file refactor.",
      extra: [
        { t: "callout", tone: "pro", title: "Speak in design-system terms", text: "Copilot understands tokens and components. “Use an 8px spacing scale and a `Card` component with `title`, `meta` and `action` slots” beats “make it look nice”." },
      ],
    }),
    githubHome({
      prefix: "pd",
      extra: [
        { t: "callout", tone: "tip", title: "How developers will see your work", text: "Developers review changes as **pull requests** — a branch plus a conversation. Prototyping on a branch and opening a PR is the most dev-friendly hand-off there is." },
      ],
    }),
    {
      id: "pd3",
      title: "Brief to prototype",
      minutes: 10,
      objectives: [
        "Turn a product brief into a responsive prototype with one agent prompt",
        "Iterate using design tokens and component names",
      ],
      blocks: [
        { t: "p", text: "Your project: a **feature prototype** — a “Saved items” screen for a shopping app. Start from a brief, not a blank page." },
        { t: "code", lang: "text", caption: "The prompt (copy into agent mode)", code: "Goal: Build a clickable prototype of a \"Saved items\" screen.\nContext: Mobile shopping app; users save products to buy later.\nConstraints: Plain HTML/CSS/JS, no frameworks. Mobile-first,\n  responsive to desktop. Design tokens as CSS custom properties\n  (--color-*, --space-*). Card component with image, title, price\n  and a Remove button. Empty state when nothing is saved.\nFormat: index.html, styles.css, app.js. Explain the file roles." },
        { t: "handoff", tool: "Copilot", title: "Build it (≈5 min)", items: [
          "Open your repo from the last module in Copilot.",
          "Paste the prompt in agent mode. Review the plan, then the diff.",
          "Open index.html in your browser. Click Remove until you see the empty state.",
          "Follow up: “Use a 4/8/16/24 spacing scale and make the accent colour a token.”",
          "Commit: `Saved items prototype`. Push.",
        ] },
        { t: "p", text: "Before you run it for real, practise the iteration loop in the sandbox →" },
        { t: "sandbox-task" },
      ],
      sandbox: {
        id: "pd3-sb",
        task: "Act on design feedback: (1) make the accent colour a CSS token called `--color-accent` and use it for the button, and (2) add an empty-state message with the class `empty`.",
        template: "static",
        active: "/styles.css",
        files: {
          "/index.html": `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Saved items</h1>
  <ul class="list">
    <li class="card"><span>Linen shirt</span><b>$48</b><button>Remove</button></li>
    <li class="card"><span>Canvas tote</span><b>$22</b><button>Remove</button></li>
  </ul>
</body>
</html>
`,
          "/styles.css": `body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #fafafa; }
.list { list-style: none; padding: 0; display: grid; gap: 8px; }
.card { display: flex; gap: 8px; align-items: center; padding: 12px; background: white; border-radius: 12px; }
.card span { flex: 1; }
button { background: #6d28d9; color: white; border: 0; border-radius: 8px; padding: 6px 10px; }
`,
        },
        checks: [
          { label: "Defines a --color-accent token", file: "/styles.css", pattern: "--color-accent\\s*:" },
          { label: "The button uses var(--color-accent)", file: "/styles.css", pattern: "button\\s*\\{[^}]*var\\(\\s*--color-accent\\s*\\)" },
          { label: "Has an element with class=\"empty\"", file: "/index.html", pattern: "class=\"[^\"]*\\bempty\\b" },
        ],
      },
      takeaways: [
        "Prompt with a brief: goal, context, constraints, format.",
        "Name tokens and components — Copilot will follow them.",
        "Iterate in small follow-ups and commit each good step.",
      ],
    },
    {
      id: "pd4",
      title: "Skills for makers",
      minutes: 9,
      badge: "skill-installed",
      objectives: [
        "Install an agent skill or plug-in",
        "Use it to add interaction states and run an accessibility pass",
      ],
      blocks: [
        { t: "p", text: "**Agent skills and plug-ins** give Copilot new abilities and house rules — like a checklist it always follows for accessibility, or knowledge of your design system." },
        { t: "callout", tone: "tip", title: "Where to find them", text: ref.skillsHint },
        { t: "handoff", tool: "Copilot", title: "Install and use a skill (≈5 min)", items: [
          "Install one skill or plug-in related to UI quality (accessibility, design tokens or front-end review).",
          "Ask: “Using the installed skill, add hover, focus and disabled states to every button and run an accessibility check.”",
          "Review the diff — look for visible focus rings and button labels.",
          "Commit: `Interaction states + a11y pass`. Push.",
        ] },
        { t: "quiz", id: "pd4-q1", q: "Which state is most often forgotten in prototypes and matters most for keyboard users?", options: ["Hover", "Focus", "Active"], answer: 1, why: "Visible focus is how keyboard users know where they are." },
        { t: "fill", id: "pd4-f1", prompt: "Complete the CSS so keyboard focus is visible:", lang: "css", code: "button:___ {\n  outline: 2px solid var(--color-accent);\n}", answers: ["focus-visible"], why: ":focus-visible shows the ring for keyboard users without flashing it on every mouse click." },
      ],
      takeaways: [
        "Skills and plug-ins add abilities and house rules to Copilot.",
        "Always ask for hover, focus and disabled states.",
        "Use an accessibility pass before you share.",
      ],
    },
    goLive({
      prefix: "pd",
      extra: [
        { t: "callout", tone: "pro", title: "Deploy previews = review links", text: "Open a pull request and Netlify builds a **deploy preview** with its own URL. Share it in Slack or Figma comments instead of screenshots." },
      ],
    }),
    {
      id: "pd6",
      title: "Hand off like a pro",
      minutes: 9,
      objectives: [
        "Generate a one-page spec and README from the prototype",
        "Explain the difference between a prototype and production code",
      ],
      blocks: [
        { t: "p", text: "Developers don’t want a zip file. They want a **link**, a **spec** and **honest notes** about what’s prototype-only." },
        { t: "handoff", tool: "Copilot", title: "Generate the hand-off (≈4 min)", items: [
          "Ask: “Write SPEC.md for this prototype: user story, screens, states, tokens, acceptance criteria and open questions.”",
          "Ask: “Update README.md with the live URL and how to run it locally.”",
          "Commit and push. Share the live URL plus SPEC.md with your team.",
        ] },
        { t: "h", text: "Prototype vs. production" },
        { t: "list", items: [
          "**Prototype**: proves the flow, fakes the data, skips edge cases.",
          "**Production**: real data, error handling, tests, security reviews.",
          "Say so in the README — it builds trust with developers.",
        ] },
        { t: "quiz", id: "pd6-q1", q: "What’s the best hand-off package?", options: ["A screenshot in Slack", "Live URL + SPEC.md + README noting what’s fake", "A zip of the folder"], answer: 1, why: "A link they can click, a spec they can build from and honest notes." },
      ],
      takeaways: [
        "Hand off a live link, a spec and honest notes.",
        "Let Copilot draft docs from the code — then edit.",
        "Label prototype-only shortcuts clearly.",
      ],
    },
  ],
};
