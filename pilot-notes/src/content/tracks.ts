import type { Audience } from "./types.ts";

/** Marketing copy for each audience track (course content lives in courses/). */
export const trackCopy: Record<Audience, { emoji: string; headline: string; pains: string[]; wins: string[]; project: string; color: string }> = {
  beginner: {
    emoji: "🛫",
    headline: "Never built anything with AI? Start here.",
    pains: ["AI feels like hype you can’t use", "Every tutorial assumes you’re a developer"],
    wins: ["Know what Copilot is and what it’s good at", "Write prompts that work", "Finish your first real task in 30 minutes"],
    project: "Your first AI-built page, in the browser",
    color: "#7dd3fc",
  },
  "small-business": {
    emoji: "🏪",
    headline: "Automate the busywork. Build the tools you’d otherwise pay for.",
    pains: ["Paying for apps that almost fit", "Repeating the same quotes, emails and lists"],
    wins: ["Turn a messy process into a simple web tool", "Own it — no subscription", "Share it with customers via a live link"],
    project: "A live instant-quote calculator for your business",
    color: "#fbbf24",
  },
  "product-design": {
    emoji: "🧭",
    headline: "Prototype in an afternoon. Hand devs something real.",
    pains: ["Static mocks hide the hard questions", "Waiting a sprint to test an idea"],
    wins: ["Turn a brief into a clickable prototype", "Ship it to a URL stakeholders can try", "Hand off a spec + repo developers respect"],
    project: "A clickable feature prototype with a one-page spec",
    color: "#a78bfa",
  },
  freelancer: {
    emoji: "💼",
    headline: "Deliver client work faster — and sell AI-built sites.",
    pains: ["Scoping and proposals eat billable time", "Clients want sites, you’re not a developer"],
    wins: ["Ship a polished proposal microsite in under an hour", "A repeatable deliver-and-hand-over workflow", "A new service you can price"],
    project: "A proposal microsite you can send to a client today",
    color: "#f472b6",
  },
};

export const faqs: Array<{ q: string; a: string }> = [
  { q: "Do I need to know how to code?", a: "No. Every course is written for non-developers. You’ll read and tweak a little code inside the lesson, with checks that tell you when you got it right." },
  { q: "Do I need to install anything?", a: "Not for the lessons — the code sandbox runs in your browser. To ship your project you’ll use free accounts on GitHub and Netlify plus the Copilot app; each course walks you through it." },
  { q: "Is GitHub Copilot free?", a: "GitHub offers a free Copilot plan with monthly limits, which is enough to finish our courses. Paid Copilot plans are optional." },
  { q: "What do I get for $5?", a: "Lifetime access to one course, its PDF e-book, and every future update to that course." },
  { q: "What does the $24 pass include?", a: "Every course and e-book for a year, including new releases. If you cancel, e-books you downloaded are yours to keep. Already bought a course? Upgrade for $19." },
  { q: "Does it work on my phone?", a: "Yes — lessons, quizzes and the sandbox all work on mobile. Shipping to GitHub and Netlify is easiest on a laptop." },
  { q: "What if it’s not for me?", a: "Email us within 30 days for a full refund." },
];
