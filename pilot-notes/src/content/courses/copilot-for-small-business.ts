import type { Course } from "../types.ts";
import { githubHome, goLive, workbench } from "../shared.ts";
import { reference as ref } from "../reference.ts";

export const smallBusinessCourse: Course = {
  slug: "copilot-for-small-business",
  title: "Copilot for Small Business",
  audience: "small-business",
  tier: "paid",
  tagline: "Build the little tools you’d otherwise pay for — starting with an instant quote calculator.",
  project: "A live instant-quote calculator for your business",
  outcome: "You can describe a business task to Copilot, build a simple web tool for it, put it online and share it with customers.",
  accent: "#fbbf24",
  modules: [
    workbench({
      prefix: "sb",
      focus: "Use a fast model for wording, prices and colours. Switch to a stronger reasoning model when you ask for a calculation, a new page or anything that touches several files.",
      extra: [
        { t: "callout", tone: "pro", title: "Describe the business, not the code", text: "“I clean homes. Price = $30 per room + $15 per bathroom, 10% off for weekly visits” gets you further than “make a calculator”." },
      ],
    }),
    githubHome({
      prefix: "sb",
      extra: [
        { t: "callout", tone: "tip", title: "Private or public?", text: "A **private** repository hides your code; the live site is still public. Pick private if your pricing logic is something you’d rather not share." },
      ],
    }),
    {
      id: "sb3",
      title: "Build your quote calculator",
      minutes: 10,
      objectives: [
        "Turn your pricing rules into a working calculator with one agent prompt",
        "Test the maths and fix it with a follow-up prompt",
      ],
      blocks: [
        { t: "p", text: "Your project: an **instant quote calculator**. Customers pick options and see a price — no more back-and-forth emails. Swap in your own business as you go." },
        { t: "code", lang: "text", caption: "The prompt (copy into agent mode, then edit the prices)", code: "Goal: Build an instant quote calculator for my cleaning business.\nContext: Price = $30 per room + $15 per bathroom.\n  Weekly visits get 10% off. Customers use phones.\nConstraints: Plain HTML/CSS/JS, no frameworks. Big tap targets.\n  Show the total as they change options. Include a\n  \"Request this quote\" button that opens an email to me.\nFormat: index.html, styles.css, app.js. Explain each file." },
        { t: "handoff", tool: "Copilot", title: "Build it (≈5 min)", items: [
          "Open your repo from the last module in Copilot.",
          "Paste the prompt in agent mode — swap in your real prices. Review the plan, then the diff.",
          "Open index.html in your browser and try three quotes you already know the answer to.",
          "Wrong total? Tell Copilot the inputs, what you expected and what you got. It will find the bug.",
          "Commit: `Quote calculator`. Push.",
        ] },
        { t: "p", text: "Practise the key fix in the sandbox first →" },
        { t: "sandbox-task" },
      ],
      sandbox: {
        id: "sb3-sb",
        task: "The calculator forgets the bathrooms. In `app.js`, (1) add bathrooms to the total at **15** each, and (2) apply a **10% discount** when `weekly` is checked (multiply by `0.9`).",
        template: "vanilla",
        active: "/app.js",
        files: {
          "/index.html": `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Instant quote</h1>
  <label>Rooms <input id="rooms" type="number" min="0" value="3"></label>
  <label>Bathrooms <input id="baths" type="number" min="0" value="1"></label>
  <label><input id="weekly" type="checkbox"> Weekly visits</label>
  <p class="total">Total: $<span id="total">0</span></p>
  <script src="app.js"></script>
</body>
</html>
`,
          "/styles.css": `body { font-family: system-ui, sans-serif; padding: 16px; display: grid; gap: 12px; max-width: 360px; }
input[type="number"] { width: 4em; font-size: 1.1rem; }
.total { font-size: 1.6rem; font-weight: 700; }
`,
          "/app.js": `const $ = (id) => document.getElementById(id);

function update() {
  const rooms = Number($("rooms").value);
  const baths = Number($("baths").value);
  const weekly = $("weekly").checked;

  let total = rooms * 30;

  $("total").textContent = total.toFixed(2);
}

document.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
update();
`,
        },
        checks: [
          { label: "Adds bathrooms at 15 each", file: "/app.js", pattern: "baths\\s*\\*\\s*15|15\\s*\\*\\s*baths" },
          { label: "Applies a 10% weekly discount", file: "/app.js", pattern: "weekly[\\s\\S]*\\*=?\\s*0?\\.9\\b|weekly\\s*\\?[^:]*0?\\.9" },
        ],
      },
      takeaways: [
        "Describe your business rules in plain words with real numbers.",
        "Test with quotes you already know the answer to.",
        "When the maths is wrong, give Copilot the inputs, the expected total and the actual total.",
      ],
    },
    {
      id: "sb4",
      title: "Skills that save hours",
      minutes: 9,
      badge: "skill-installed",
      objectives: [
        "Install an agent skill or plug-in",
        "Use it to make your tool look on-brand and work well on phones",
      ],
      blocks: [
        { t: "p", text: "**Agent skills and plug-ins** give Copilot new abilities and house rules, such as a front-end checklist it always follows or a design helper that knows good spacing and colour." },
        { t: "callout", tone: "tip", title: "Where to find them", text: ref.skillsHint },
        { t: "handoff", tool: "Copilot", title: "Install and use a skill (≈5 min)", items: [
          "Install one skill or plug-in for front-end quality, design or accessibility.",
          "Ask: “Using the installed skill, restyle the calculator with my brand colour #0f766e, make every tap target at least 44px and check it on a phone-sized screen.”",
          "Review the diff, then preview it with your browser at phone width.",
          "Commit: `On-brand, phone-friendly`. Push.",
        ] },
        { t: "quiz", id: "sb4-q1", q: "Most of your customers will open the quote link from…", options: ["A desktop computer", "Their phone", "A printed flyer"], answer: 1, why: "Links shared by text, email and social media are mostly opened on phones. Design for thumbs first." },
        { t: "fill", id: "sb4-f1", prompt: "Complete the tag so the page scales properly on phones:", lang: "html", code: "<meta name=\"___\" content=\"width=device-width, initial-scale=1\">", answers: ["viewport"], why: "Without the viewport tag, phones render a zoomed-out desktop page." },
      ],
      takeaways: [
        "Skills and plug-ins add abilities and house rules to Copilot.",
        "Give exact brand values (hex colours, font names).",
        "Check every tool at phone width before you share it.",
      ],
    },
    goLive({
      prefix: "sb",
      extra: [
        { t: "callout", tone: "pro", title: "Use your own domain later", text: "Netlify lets you attach a domain you own (like quote.yourbusiness.com) in **Domain management**. The free netlify.app address is fine to start with." },
      ],
    }),
    {
      id: "sb6",
      title: "Put it to work",
      minutes: 9,
      objectives: [
        "Share your tool where customers already are",
        "Plan your next automation with a reusable prompt",
      ],
      blocks: [
        { t: "p", text: "A tool nobody sees saves nobody time. Put the link where questions about price usually come in." },
        { t: "list", items: [
          "**Website & Google Business Profile**: add a “Get an instant quote” button.",
          "**Email signature & auto-replies**: link it whenever someone asks for a price.",
          "**Social bios & messaging apps**: pin the link.",
        ] },
        { t: "handoff", tool: "Copilot", title: "Plan your next tool (≈3 min)", items: [
          "Ask: “I run a [your business]. List five small web tools that would save me time each week, ranked by effort.”",
          "Pick one. Reuse this course’s prompt shape: Goal, Context (your real rules), Constraints, Format.",
          "Add the idea to README.md under “Next”. Commit and push.",
        ] },
        { t: "order", id: "sb6-o1", prompt: "Put the small-business build loop in order:", items: ["Write down the real rules and numbers", "Prompt Copilot in agent mode", "Test with known answers", "Push and share the live link"], why: "Rules → build → test → share. The same loop works for every tool you build next." },
        { t: "quiz", id: "sb6-q1", q: "A customer says the quote looked wrong. What do you ask them for first?", options: ["The options they picked and the total they saw", "Their password", "A screenshot of their home screen"], answer: 0, why: "Inputs plus the result is exactly what Copilot needs to reproduce and fix the bug." },
      ],
      takeaways: [
        "Share the link where pricing questions already arrive.",
        "Rules → build → test → share works for every tool.",
        "Keep a “Next” list in your README.",
      ],
    },
  ],
};
