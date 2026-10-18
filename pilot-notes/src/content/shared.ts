import type { Block, Module } from "./types.ts";
import { reference as ref } from "./reference.ts";

/**
 * Core modules shared by every paid track (M1, M2, M5). Each track passes its own
 * id prefix and a few audience-specific blocks, so the core stays in one place.
 */

export function workbench(p: { prefix: string; focus: string; extra?: Block[] }): Module {
  return {
    id: `${p.prefix}1`,
    title: "Your AI workbench",
    minutes: 8,
    preview: true,
    objectives: [
      "Name the main parts of the Copilot app: chat, agent mode, model picker, diff view",
      "Choose a model for the task in front of you",
    ],
    blocks: [
      { t: "p", text: `This module is a **free preview**. By the end of the course you’ll have built a real project and shared it at a live URL. First, a tour of the tool you’ll build it with — ${ref.copilotApp}.` },
      { t: "h", text: "The four controls that matter" },
      { t: "steps", items: [
        { title: "Chat", text: "Ask questions, get explanations, paste errors. Context carries across follow-ups." },
        { title: "Agent mode", text: "Give it a goal; it plans, edits several files and asks before running commands. This is how you’ll build the project." },
        { title: "Model picker", text: ref.modelPickerHint },
        { title: "Diff view", text: "Every change shows up as green (added) and red (removed) lines. You accept or undo — you’re the pilot." },
      ] },
      { t: "callout", tone: "tip", title: "Model choice for you", text: p.focus },
      ...(p.extra ?? []),
      { t: "quiz", id: `${p.prefix}1-q1`, q: "Copilot keeps producing an over-complicated multi-file change. What’s the best first move?", options: ["Switch to a stronger reasoning model and restate the constraints", "Accept it and hope", "Start a brand-new GitHub account"], answer: 0, why: "A clearer constraint plus the right model fixes most bad outputs." },
      { t: "order", id: `${p.prefix}1-o1`, prompt: "Put the agent loop in order:", items: ["Describe the goal and constraints", "Review the plan Copilot proposes", "Review the diff", "Accept and preview the result"], why: "Plan → diff → preview. Never skip the review steps." },
    ],
    takeaways: [
      "Agent mode plans and edits across files; you approve every change.",
      "Pick a fast model for small edits and a stronger one for multi-file work.",
      "The diff view is your safety net.",
    ],
  };
}

export function githubHome(p: { prefix: string; extra?: Block[] }): Module {
  return {
    id: `${p.prefix}2`,
    title: "Your project’s home: GitHub",
    minutes: 8,
    badge: "repo-connected",
    objectives: [
      "Create a GitHub repository for your project",
      "Open it in Copilot and make your first commit",
    ],
    blocks: [
      { t: "p", text: "A **repository** (repo) is a project folder with a perfect memory: every saved version is kept, and Netlify will deploy straight from it." },
      { t: "handoff", tool: "GitHub", title: "Create and connect your repo (≈5 min)", items: [
        "On github.com choose **New repository**. Name it after your project (lowercase, dashes — e.g. `quote-calculator`). Tick **Add a README**.",
        `In ${ref.copilotApp}, open the repository (clone it to your computer when asked).`,
        "Ask Copilot: “Create an index.html with a heading that says Hello.” Review the diff and accept.",
        "Commit with the message `First page` and push (sync) to GitHub.",
        "Refresh the repo on github.com — your file is there.",
      ] },
      { t: "h", text: "Words you’ll hear" },
      { t: "list", items: [
        "**Commit** — a saved snapshot with a message.",
        "**Push** — upload your commits to GitHub.",
        "**Branch** — a parallel copy for trying ideas safely.",
      ] },
      ...(p.extra ?? []),
      { t: "fill", id: `${p.prefix}2-f1`, prompt: "Fill in the vocabulary:", lang: "text", code: "A saved snapshot with a message is a ___.\nUploading snapshots to GitHub is called a ___.", answers: ["commit", "push"], why: "Commit saves locally; push sends it to GitHub." },
    ],
    takeaways: [
      "One repository per project.",
      "Commit often with short, clear messages.",
      "Push so GitHub — and later Netlify — sees your work.",
    ],
  };
}

export function goLive(p: { prefix: string; extra?: Block[] }): Module {
  return {
    id: `${p.prefix}5`,
    title: "Go live on Netlify",
    minutes: 10,
    objectives: [
      "Connect your GitHub repository to Netlify and deploy",
      "Understand that every push redeploys automatically",
      "Verify your project at a live URL",
    ],
    blocks: [
      { t: "p", text: "**Netlify** turns your repository into a website with its own address. Connect once; every push after that redeploys in seconds." },
      { t: "handoff", tool: "Netlify", title: "Deploy (≈5 min)", items: [
        `Sign up at [Netlify](${ref.netlifySignup}) with your GitHub account.`,
        ref.netlifyImportHint,
        "When the deploy finishes, open **Site configuration → Change site name** and pick something memorable.",
        "Make a tiny change with Copilot, commit and push — watch Netlify redeploy on its own.",
      ] },
      ...(p.extra ?? []),
      { t: "quiz", id: `${p.prefix}5-q1`, q: "You pushed a fix but the live site still shows the old version. What do you check first?", options: ["The Deploys tab in Netlify", "Buy a new domain", "Delete the repository"], answer: 0, why: "The Deploys tab shows whether the new build is still running or failed — and why." },
      { t: "verify", id: `${p.prefix}5-live`, prompt: "Paste your live Netlify URL to earn **Live on Netlify** (+500 XP)." },
    ],
    takeaways: [
      "Netlify deploys from GitHub automatically on every push.",
      "The Deploys tab tells you what happened and why.",
      "Your project now has a public URL you can share.",
    ],
  };
}
