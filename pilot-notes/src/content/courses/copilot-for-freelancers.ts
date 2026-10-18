import type { Course } from "../types.ts";
import { githubHome, goLive, workbench } from "../shared.ts";
import { reference as ref } from "../reference.ts";

export const freelancerCourse: Course = {
  slug: "copilot-for-freelancers",
  title: "Copilot for Freelancers",
  audience: "freelancer",
  tier: "paid",
  tagline: "Win and deliver client work faster — ship a proposal microsite in under an hour.",
  project: "A proposal microsite you can send to a client today",
  outcome: "You can build a polished client-facing microsite with Copilot, publish it at a live link and reuse the workflow as a paid service.",
  accent: "#f472b6",
  modules: [
    workbench({
      prefix: "fl",
      focus: "Use a fast model for copy edits and tone tweaks. Switch to a stronger reasoning model for page structure, multi-section layouts or anything that touches several files.",
      extra: [
        { t: "callout", tone: "pro", title: "Feed it the brief", text: "Paste the client’s own words (from the discovery call or email) into the prompt. Copilot will mirror their language back to them — which is exactly what wins proposals." },
      ],
    }),
    githubHome({
      prefix: "fl",
      extra: [
        { t: "callout", tone: "tip", title: "One repo per client", text: "Name repos `client-project`, e.g. `acme-proposal`. Later you can **transfer** a repository to the client’s GitHub account as part of the hand-over." },
      ],
    }),
    {
      id: "fl3",
      title: "Build the proposal microsite",
      minutes: 10,
      objectives: [
        "Turn a client brief into a one-page proposal site with one agent prompt",
        "Structure it for skimming: problem, plan, price, next step",
      ],
      blocks: [
        { t: "p", text: "Your project: a **proposal microsite**. It’s a single page that beats a PDF attachment because it looks custom, works on phones and ends with a clear yes button." },
        { t: "code", lang: "text", caption: "The prompt (copy into agent mode, then edit the brief)", code: "Goal: Build a one-page proposal website for a client.\nContext: Client: Acme Bakery. They want online pre-orders.\n  Their words: \"we lose orders when the phone is busy\".\nConstraints: Plain HTML/CSS, no frameworks. Sections in order:\n  Problem, Plan (3 steps), Timeline, Price (3 options), Next step.\n  Each price option is an <article class=\"option\">.\n  End with an \"Accept proposal\" mailto button.\nFormat: index.html and styles.css. Mobile-first." },
        { t: "handoff", tool: "Copilot", title: "Build it (≈5 min)", items: [
          "Open your repo from the last module in Copilot.",
          "Paste the prompt in agent mode with a real (or practice) client brief. Review the plan, then the diff.",
          "Open index.html. Read it as the client would — on your phone if you can.",
          "Follow up: “Tighten every paragraph to two sentences and make the recommended price option stand out.”",
          "Commit: `Proposal microsite`. Push.",
        ] },
        { t: "p", text: "Practise the pricing section in the sandbox first →" },
        { t: "sandbox-task" },
      ],
      sandbox: {
        id: "fl3-sb",
        task: "Finish the pricing section: (1) add a **third** `<article class=\"option\">` so there are three options, and (2) mark one option as recommended by adding the class `featured` to it.",
        template: "static",
        active: "/index.html",
        files: {
          "/index.html": `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Online pre-orders for Acme Bakery</h1>
  <section class="pricing">
    <h2>Options</h2>
    <article class="option">
      <h3>Starter</h3>
      <p>Pre-order page with pickup times.</p>
      <p class="price">$900</p>
    </article>
    <article class="option">
      <h3>Growth</h3>
      <p>Starter + email confirmations and a weekly orders report.</p>
      <p class="price">$1,600</p>
    </article>
  </section>
  <a class="cta" href="mailto:you@example.com?subject=Accept%20proposal">Accept proposal</a>
</body>
</html>
`,
          "/styles.css": `body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; color: #1f1720; }
.pricing { display: grid; gap: 12px; }
.option { padding: 16px; border: 1px solid #eadbe4; border-radius: 12px; }
.option.featured { border: 2px solid #db2777; box-shadow: 0 8px 24px rgb(219 39 119 / 0.18); }
.price { font-size: 1.5rem; font-weight: 700; }
.cta { display: inline-block; margin-top: 20px; padding: 12px 18px; background: #db2777; color: white; border-radius: 999px; text-decoration: none; }
`,
        },
        checks: [
          { label: "Has three price options", file: "/index.html", pattern: "(class=\"option[^\"]*\"[\\s\\S]*){3}" },
          { label: "One option is featured", file: "/index.html", pattern: "class=\"(?:option\\s+featured|featured\\s+option)\"" },
        ],
      },
      takeaways: [
        "Paste the client’s own words into the prompt.",
        "Problem → plan → price → next step is a structure clients can skim.",
        "Three options with one recommended makes the decision easy.",
      ],
    },
    {
      id: "fl4",
      title: "Skills = your secret team",
      minutes: 9,
      badge: "skill-installed",
      objectives: [
        "Install an agent skill or plug-in",
        "Use it for a quality pass before the client sees anything",
      ],
      blocks: [
        { t: "p", text: "**Agent skills and plug-ins** are like hiring a specialist for ten minutes: an accessibility reviewer, a copy editor or a front-end checker that Copilot consults while it works." },
        { t: "callout", tone: "tip", title: "Where to find them", text: ref.skillsHint },
        { t: "handoff", tool: "Copilot", title: "Install and use a skill (≈5 min)", items: [
          "Install one skill or plug-in for front-end quality, accessibility or writing.",
          "Ask: “Using the installed skill, review the proposal for accessibility, broken links and unclear copy. Fix what you find and list the changes.”",
          "Read the list. Undo anything that changes your meaning.",
          "Commit: `Quality pass`. Push.",
        ] },
        { t: "quiz", id: "fl4-q1", q: "Copilot’s quality pass rewrote your price to sound “friendlier”. What do you do?", options: ["Undo that change in the diff — you own the numbers", "Ship it — AI knows best", "Delete the whole section"], answer: 0, why: "You review every diff. Prices, promises and dates are yours to approve." },
        { t: "fill", id: "fl4-f1", prompt: "Complete the link so it opens a pre-filled email:", lang: "html", code: "<a href=\"___:you@example.com?subject=Accept%20proposal\">Accept</a>", answers: ["mailto"], why: "mailto: links open the visitor’s email app with your address filled in." },
      ],
      takeaways: [
        "Skills and plug-ins act like on-call specialists.",
        "Run a quality pass before any client sees your work.",
        "You approve every change to prices, dates and promises.",
      ],
    },
    goLive({
      prefix: "fl",
      extra: [
        { t: "callout", tone: "pro", title: "Branch = draft for the client", text: "Push a `v2` branch and open a pull request: Netlify builds a **deploy preview** with its own link. Send that link for feedback while the main link stays unchanged." },
      ],
    }),
    {
      id: "fl6",
      title: "Deliver and get paid",
      minutes: 9,
      objectives: [
        "Hand a project over cleanly (repo transfer or zip + live link)",
        "Price “AI-built microsites” as a repeatable service",
      ],
      blocks: [
        { t: "p", text: "You just built a sellable deliverable in under an hour. Turn it into a **repeatable service** with a clean hand-over." },
        { t: "handoff", tool: "GitHub", title: "Hand over (≈3 min)", items: [
          "Ask Copilot: “Write HANDOVER.md: what’s included, how to edit text, how deploys work and who to contact.”",
          "Commit and push. Then either **transfer** the repository to the client’s GitHub account (Settings → Transfer) or add them as a collaborator.",
          "Send the live URL, HANDOVER.md and your invoice in the same email.",
        ] },
        { t: "h", text: "Pricing it" },
        { t: "list", items: [
          "Charge for the **outcome**, not the hour. Fast delivery is a feature.",
          "Offer three options (you just built that section!).",
          "Add a small monthly care plan for edits and checks.",
        ] },
        { t: "order", id: "fl6-o1", prompt: "Put the freelance delivery loop in order:", items: ["Capture the client’s words in a brief", "Build with Copilot and run a quality pass", "Share a deploy preview for feedback", "Hand over with HANDOVER.md and invoice"], why: "Brief → build → preview → hand over. Repeat for every client." },
        { t: "quiz", id: "fl6-q1", q: "What should you tell clients about AI in your process?", options: ["Be upfront: you use AI tools and review everything yourself", "Never mention it", "Say a robot did all of it"], answer: 0, why: "Honesty builds trust. Your value is judgement, speed and accountability." },
      ],
      takeaways: [
        "Hand over a live link, HANDOVER.md and an invoice together.",
        "Price outcomes and offer three options.",
        "Be open about using AI. Your review is the value.",
      ],
    },
  ],
};
