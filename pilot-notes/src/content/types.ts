/**
 * Content model. Courses are typed data: the player renders them, the e-book prints them,
 * and the lesson API serves paid module bodies only to entitled users.
 * Inline text supports **bold**, `code` and [links](https://…).
 */

export type Audience = "beginner" | "small-business" | "product-design" | "freelancer";
export type Tone = "tip" | "warn" | "pro";
export type BadgeId =
  | "first-flight"
  | "repo-connected"
  | "skill-installed"
  | "live-on-netlify"
  | "course-complete"
  | "library-explorer";

/** Blocks that gate module completion carry an `id` so progress can record them. */
export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "code"; lang: string; code: string; caption?: string }
  | { t: "callout"; tone: Tone; title: string; text: string }
  | { t: "steps"; items: Array<{ title: string; text: string }> }
  /** Hand-off to a real tool outside the browser (Copilot, GitHub, Netlify). */
  | { t: "handoff"; tool: string; title: string; items: string[] }
  | { t: "quiz"; id: string; q: string; options: string[]; answer: number; why: string }
  /** Code with one or more `___` gaps; `answers[i]` fills gap i (case-insensitive, trimmed). */
  | { t: "fill"; id: string; prompt: string; lang: string; code: string; answers: string[]; why: string }
  /** Put the items in order. `items` is authored in the correct order; the player shuffles it. */
  | { t: "order"; id: string; prompt: string; items: string[]; why: string }
  /** Learner pastes their live https://*.netlify.app URL; the server checks it responds. */
  | { t: "verify"; id: string; prompt: string }
  /** Marker for where the sandbox task sits in the reading flow. */
  | { t: "sandbox-task" }
  /** Free course only: quiz that recommends a paid track. */
  | { t: "track-quiz"; id: string };

export interface SandboxCheck {
  label: string;
  /** File path in the sandbox, e.g. "/index.html". */
  file: string;
  /** Regular-expression source, tested case-insensitively. */
  pattern: string;
}

export interface SandboxSpec {
  id: string;
  task: string;
  template: "static" | "vanilla" | "react";
  files: Record<string, string>;
  /** File shown first in the editor. */
  active: string;
  checks: SandboxCheck[];
}

export interface ModuleContent {
  blocks: Block[];
  sandbox?: SandboxSpec;
  takeaways: string[];
}

export interface ModuleMeta {
  id: string;
  title: string;
  minutes: number;
  objectives: string[];
  /** Badge earned when this module is completed. */
  badge?: BadgeId;
}

export interface Module extends ModuleMeta, ModuleContent {}

export interface Course {
  slug: string;
  title: string;
  audience: Audience;
  tier: "free" | "paid";
  tagline: string;
  /** The working project the learner ships. */
  project: string;
  outcome: string;
  accent: string;
  modules: Module[];
}

/** Everything about a course except module bodies: safe to ship to any browser. */
export interface CourseOutline extends Omit<Course, "modules"> {
  modules: ModuleMeta[];
  minutes: number;
}
