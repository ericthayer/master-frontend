import { useSyncExternalStore } from "react";
import { empty, parse, reduce, type Action, type ProgressState } from "./progress.ts";
import type { BadgeId } from "../content/types.ts";

const KEY = "pilotnotes:progress:v1";
const listeners = new Set<() => void>();
let state: ProgressState | null = null;

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parse(JSON.parse(raw)) : empty();
  } catch {
    return empty();
  }
}

function current(): ProgressState {
  return (state ??= load());
}

function save(next: ProgressState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable: keep in memory */ }
  listeners.forEach((l) => l());
}

export const progressStore = {
  get: current,
  /** Replace the whole state (used by account sync). */
  set: save,
  dispatch(action: Action): BadgeId[] {
    const { state: next, earned } = reduce(current(), action);
    save(next);
    return earned;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};

if (typeof window !== "undefined") {
  // Keep tabs in sync.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) { state = null; listeners.forEach((l) => l()); }
  });
}

const serverSnapshot = empty();

export function useProgress(): ProgressState {
  return useSyncExternalStore(progressStore.subscribe, current, () => serverSnapshot);
}
