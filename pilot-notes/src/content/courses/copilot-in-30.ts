import type { Course } from "../types.ts";
import { reference as ref } from "../reference.ts";

export const freeCourse: Course = {
  slug: "copilot-in-30",
  title: "Copilot in 30 Minutes",
  audience: "beginner",
  tier: "free",
  tagline: "Your first AI-built thing, explained in plain English.",
  project: "A one-page “about me” card you build by prompting",
  outcome: "You can explain what Copilot is, write a prompt that works and run a first task end to end.",
  accent: "#3ecf8e",
  modules: [
    {
      id: "f1",
      title: "What Copilot is and why it matters",
      minutes: 6,
      objectives: [
        "Explain the difference between an AI assistant and an AI agent",
        "Name three tasks in your own work that Copilot could speed up",
      ],
      blocks: [
        { t: "p", text: "**GitHub Copilot** is an AI pair-builder. You describe what you want in plain English and it writes, edits and explains code for you. You stay the pilot: you decide what gets kept." },
        { t: "h", text: "Assistant vs. agent" },
        { t: "list", items: [
          "**Assistant mode** answers questions and suggests code you copy in. Think: a smart search box.",
          "**Agent mode** takes a goal, plans the steps, edits several files and runs commands, pausing for your approval. Think: a junior teammate.",
        ] },
        { t: "callout", tone: "tip", title: "Why it matters if you don’t code", text: "Most small tools — a price calculator, a sign-up page, a prototype — are a few hundred lines. That is now a 30-minute conversation instead of a freelancer invoice." },
        { t: "h", text: "Spot the opportunities" },
        { t: "p", text: "Good first Copilot jobs are **small, visible and repetitive**: a landing page, a form, a calculator, a checklist app, a script that renames files." },
        { t: "quiz", id: "f1-q1", q: "You ask Copilot to “add a contact form and deploy it”, and it edits three files and asks to run a command. Which mode is that?", options: ["Assistant mode", "Agent mode", "Autocomplete"], answer: 1, why: "Planning and editing several files, then asking to run commands, is agent behaviour." },
        { t: "quiz", id: "f1-q2", q: "Which is the best first project for Copilot?", options: ["A full online store with payments and inventory", "A one-page price calculator for your services", "Rewriting your accounting software"], answer: 1, why: "Small, visible and self-contained projects let you learn the loop fast." },
      ],
      takeaways: [
        "Copilot writes code from plain-English instructions; you approve what stays.",
        "Agent mode plans and edits across files; assistant mode answers and suggests.",
        "Start with small, visible, repetitive tasks.",
      ],
    },
    {
      id: "f2",
      title: "Setup and tour",
      minutes: 8,
      objectives: [
        "Create a GitHub account and turn on Copilot",
        "Find the chat, the model picker and settings",
      ],
      blocks: [
        { t: "handoff", tool: "GitHub", title: "Create your accounts (≈4 min)", items: [
          `Sign up for GitHub at [github.com/signup](${ref.githubSignup}).`,
          `Turn on Copilot — compare plans (including the free tier) at [the Copilot plans page](${ref.copilotPlans}).`,
          `Install ${ref.copilotApp} and sign in with GitHub.`,
        ] },
        { t: "h", text: "The three places you’ll live" },
        { t: "steps", items: [
          { title: "Chat", text: "Where you type requests. Each conversation keeps context, so follow-ups like “make it blue” work." },
          { title: "Model picker", text: ref.modelPickerHint },
          { title: "Changes / diff view", text: "Shows exactly what Copilot changed. Green lines were added, red lines were removed. Accept or undo." },
        ] },
        { t: "callout", tone: "warn", title: "Verify before you trust", text: "Copilot can be confidently wrong. Always open the preview or run the result before accepting." },
        { t: "order", id: "f2-o1", prompt: "Put the setup in order:", items: ["Create a GitHub account", "Turn on Copilot", "Install the app and sign in", "Ask your first question in chat"], why: "Copilot is tied to your GitHub account, so the account comes first." },
      ],
      takeaways: [
        "Copilot is tied to your GitHub account.",
        "Chat, model picker and the diff view are the three core surfaces.",
        "Always preview before you accept a change.",
      ],
    },
    {
      id: "f3",
      title: "Prompts that work",
      minutes: 8,
      objectives: [
        "Use the four-part prompt: Goal, Context, Constraints, Format",
        "Rewrite a weak prompt into a strong one",
      ],
      blocks: [
        { t: "p", text: "A vague prompt gets a vague result. Strong prompts have four parts — remember **G-C-C-F**:" },
        { t: "list", ordered: true, items: [
          "**Goal** — what you want: “Build a one-page about-me card.”",
          "**Context** — who it’s for and what exists: “For my freelance design profile; the page is empty.”",
          "**Constraints** — the rules: “Plain HTML and CSS, no frameworks, mobile-first, dark background.”",
          "**Format** — how to deliver: “One index.html file with the CSS inside a style tag.”",
        ] },
        { t: "code", lang: "text", caption: "Weak → strong", code: "Weak:   make me a website\n\nStrong: Build a one-page about-me card (goal) for my freelance\n        design profile (context). Plain HTML + CSS, mobile-first,\n        dark background, my name as the heading (constraints).\n        Return a single index.html (format)." },
        { t: "fill", id: "f3-f1", prompt: "Complete the four parts of a strong prompt:", lang: "text", code: "G = ___\nC = Context\nC = ___\nF = Format", answers: ["Goal", "Constraints"], why: "Goal, Context, Constraints, Format." },
        { t: "sandbox-task" },
      ],
      sandbox: {
        id: "f3-sb",
        task: "This is what Copilot returned for a weak prompt. Act as the “constraints” yourself: change the heading to your name, and give the card a dark background colour.",
        template: "static",
        active: "/index.html",
        files: {
          "/index.html": `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; }
    .card { padding: 2rem; border-radius: 16px; background: #ffffff; color: #111; max-width: 22rem; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Your Name</h1>
    <p>I design things people enjoy using.</p>
  </main>
</body>
</html>
`,
        },
        checks: [
          { label: "The heading is no longer “Your Name”", file: "/index.html", pattern: "<h1>(?!\\s*Your Name\\s*<)[^<]+</h1>" },
          { label: "The card background is no longer white", file: "/index.html", pattern: "\\.card\\s*\\{[^}]*background:\\s*(?!\\s|#fff\\b|#ffffff\\b|white\\b)[^;]+;" },
        ],
      },
      takeaways: [
        "Goal, Context, Constraints, Format.",
        "Constraints are where you add taste: colours, tone, tech limits.",
        "Iterate with short follow-ups instead of starting over.",
      ],
    },
    {
      id: "f4",
      title: "Your first task — and what’s next",
      minutes: 8,
      objectives: [
        "Run one small task end to end with Copilot",
        "Pick the paid track that matches your goals",
      ],
      badge: "first-flight",
      blocks: [
        { t: "handoff", tool: "Copilot", title: "Run your first real task (≈5 min)", items: [
          `Open ${ref.copilotApp} and start a new chat in an empty folder.`,
          "Paste your G-C-C-F prompt from the last module.",
          "Review the diff, accept it, then open index.html in your browser.",
          "Ask one follow-up: “Add a button that links to my email.”",
        ] },
        { t: "callout", tone: "pro", title: "What you just learned", text: "Prompt → review → accept → preview → follow-up. That loop is 90% of building with AI. The paid tracks repeat it on a real project and put it **live on the internet**." },
        { t: "quiz", id: "f4-q1", q: "Copilot’s change looks right in the diff. What do you do before accepting?", options: ["Accept immediately", "Preview or run it", "Delete the chat"], answer: 1, why: "Preview first — the diff shows what changed, not whether it works." },
        { t: "track-quiz", id: "f4-track" },
      ],
      takeaways: [
        "The core loop: prompt → review → accept → preview → follow-up.",
        "Small follow-ups beat giant first prompts.",
        "Next step: ship a real project to a live URL in a paid track.",
      ],
    },
  ],
};
