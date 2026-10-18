/**
 * Single source of truth for product decisions (see docs/decisions.md).
 * Change a price, the name or the pass semantics here and every page follows.
 */
export const product = {
  name: "Pilot Notes",
  tagline: "The cheat sheet for building with AI.",
  slug: "pilotnotes",
  supportEmail: "hello@pilotnotes.example",
  disclaimer:
    "Pilot Notes is an independent course library. It is not affiliated with, endorsed by, or sponsored by GitHub, Microsoft or Netlify. GitHub Copilot is a trademark of GitHub, Inc.",
  refundDays: 30,
  /** Show the testimonials section only once real, permissioned quotes exist. */
  testimonials: [] as Array<{ quote: string; name: string; role: string }>,
} as const;

export const pricing = {
  course: { amount: 5, label: "$5", note: "one-time · lifetime access to the course + e-book" },
  pass: { amount: 24, label: "$24", note: "per year · every course + e-book while active" },
  upgrade: { amount: 19, label: "$19", note: "pass upgrade after a single-course purchase ($5 credited)" },
} as const;

/** XP economy, shared by the player and any server-side recomputation. */
export const xp = {
  module: 100,
  checkpoint: 50,
  shipLive: 500,
} as const;
