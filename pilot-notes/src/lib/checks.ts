import type { Block, SandboxCheck } from "../content/types.ts";

export interface CheckResult { label: string; pass: boolean }

/** Evaluate authored regex checks against the learner's current sandbox files. */
export function runChecks(files: Record<string, string>, checks: SandboxCheck[]): CheckResult[] {
  return checks.map((c) => {
    let pass = false;
    try {
      pass = new RegExp(c.pattern, "i").test(files[c.file] ?? "");
    } catch {
      pass = false;
    }
    return { label: c.label, pass };
  });
}

/** Normalise a fill-in-the-blank answer. */
export const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Deterministic shuffle that never returns the original order (for ordering tasks). */
export function shuffled<T>(items: T[], seed: string): T[] {
  if (items.length < 2) return [...items];
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  if (out.every((x, i) => x === items[i])) out.push(out.shift()!);
  return out;
}

/** Ids of checkpoints that must pass before a module can be completed. */
export function requiredCheckpoints(blocks: Block[], sandboxId?: string): string[] {
  const ids = blocks.flatMap((b) => (b.t === "quiz" || b.t === "fill" || b.t === "order" || b.t === "verify" ? [b.id] : []));
  return sandboxId ? [...ids, sandboxId] : ids;
}
