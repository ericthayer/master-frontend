import type { BadgeId } from "../content/types.ts";
import { xp as XP } from "../config/product.ts";

/** Per-learner progress. Saved in localStorage; merged into the account after sign-in. */
export interface ProgressState {
  v: 1;
  /** "course/module" → ISO completion time */
  modules: Record<string, string>;
  /** "course/checkpoint" → ISO pass time */
  checkpoints: Record<string, string>;
  badges: Partial<Record<BadgeId, string>>;
  /** course slug → verified live URL */
  liveUrls: Record<string, string>;
  started: string[];
  /** "course/module" last visited */
  last: string | null;
}

export type Action =
  | { type: "start"; course: string; module: string }
  | { type: "checkpoint"; course: string; id: string }
  | { type: "complete"; course: string; module: string; badge?: BadgeId; courseModules: string[]; paid: boolean }
  | { type: "live"; course: string; id: string; url: string };

export const BADGES: Record<BadgeId, { label: string; emoji: string; text: string }> = {
  "first-flight": { label: "First Flight", emoji: "🛫", text: "Finished the free course." },
  "repo-connected": { label: "Repo Connected", emoji: "🔗", text: "Connected a GitHub repository." },
  "skill-installed": { label: "Skill Installed", emoji: "🧩", text: "Installed an agent skill or plug-in." },
  "live-on-netlify": { label: "Live on Netlify", emoji: "🚀", text: "Shipped a project to a live URL." },
  "course-complete": { label: "Course Complete", emoji: "🏆", text: "Finished every module in a paid course." },
  "library-explorer": { label: "Library Explorer", emoji: "🧭", text: "Started two or more courses." },
};

export function empty(): ProgressState {
  return { v: 1, modules: {}, checkpoints: {}, badges: {}, liveUrls: {}, started: [], last: null };
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const strings = (x: unknown): Record<string, string> =>
  isRecord(x) ? Object.fromEntries(Object.entries(x).filter(([, v]) => typeof v === "string")) as Record<string, string> : {};

/** Accept anything (storage can hold garbage) and return a valid state. */
export function parse(raw: unknown): ProgressState {
  if (!isRecord(raw) || raw.v !== 1) return empty();
  const badges = strings(raw.badges);
  return {
    v: 1,
    modules: strings(raw.modules),
    checkpoints: strings(raw.checkpoints),
    badges: Object.fromEntries(Object.entries(badges).filter(([k]) => k in BADGES)),
    liveUrls: strings(raw.liveUrls),
    started: Array.isArray(raw.started) ? raw.started.filter((s): s is string => typeof s === "string") : [],
    last: typeof raw.last === "string" ? raw.last : null,
  };
}

/** Union of two states — used to merge anonymous progress into an account. Earliest timestamps win. */
export function merge(a: ProgressState, b: ProgressState): ProgressState {
  const pick = (x: Record<string, string>, y: Record<string, string>) => {
    const out = { ...x };
    for (const [k, v] of Object.entries(y)) if (!out[k] || v < out[k]) out[k] = v;
    return out;
  };
  return {
    v: 1,
    modules: pick(a.modules, b.modules),
    checkpoints: pick(a.checkpoints, b.checkpoints),
    badges: pick(a.badges as Record<string, string>, b.badges as Record<string, string>) as ProgressState["badges"],
    liveUrls: { ...b.liveUrls, ...a.liveUrls },
    started: [...new Set([...a.started, ...b.started])],
    last: a.last ?? b.last,
  };
}

export function totalXp(s: ProgressState): number {
  return (
    Object.keys(s.modules).length * XP.module +
    Object.keys(s.checkpoints).length * XP.checkpoint +
    Object.keys(s.liveUrls).length * XP.shipLive
  );
}

/** Apply an action. Returns the next state and any badges newly earned (for celebrations). */
export function reduce(s: ProgressState, a: Action, now = new Date().toISOString()): { state: ProgressState; earned: BadgeId[] } {
  const next: ProgressState = { ...s, modules: { ...s.modules }, checkpoints: { ...s.checkpoints }, badges: { ...s.badges }, liveUrls: { ...s.liveUrls }, started: [...s.started] };
  const earned: BadgeId[] = [];
  const award = (b: BadgeId) => {
    if (!next.badges[b]) { next.badges[b] = now; earned.push(b); }
  };

  switch (a.type) {
    case "start":
      next.last = `${a.course}/${a.module}`;
      if (!next.started.includes(a.course)) next.started.push(a.course);
      if (next.started.length >= 2) award("library-explorer");
      break;
    case "checkpoint":
      next.checkpoints[`${a.course}/${a.id}`] ??= now;
      break;
    case "live":
      next.checkpoints[`${a.course}/${a.id}`] ??= now;
      next.liveUrls[a.course] = a.url;
      award("live-on-netlify");
      break;
    case "complete": {
      next.modules[`${a.course}/${a.module}`] ??= now;
      if (a.badge) award(a.badge);
      if (a.paid && a.courseModules.every((m) => next.modules[`${a.course}/${m}`])) award("course-complete");
      break;
    }
  }
  return { state: next, earned };
}

export function courseProgress(s: ProgressState, course: string, moduleIds: string[]): number {
  if (moduleIds.length === 0) return 0;
  return moduleIds.filter((m) => s.modules[`${course}/${m}`]).length / moduleIds.length;
}
