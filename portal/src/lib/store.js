// @ts-check
/** Per-viewer progress and theme. Storage can throw or come back empty; every access is guarded. */

const KEY = "fd-academy:v1";

/** @typedef {{ done: string[]; last: string | null; theme: "dark" | "light" | null }} State */

/** @returns {State} */
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        done: Array.isArray(parsed.done) ? parsed.done.filter((/** @type {unknown} */ x) => typeof x === "string") : [],
        last: typeof parsed.last === "string" ? parsed.last : null,
        theme: parsed.theme === "dark" || parsed.theme === "light" ? parsed.theme : null,
      };
    }
  } catch { /* storage unavailable */ }
  return { done: [], last: null, theme: null };
}

let state = read();
const bus = new EventTarget();

/** @returns {void} */
function write() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  bus.dispatchEvent(new Event("change"));
}

export const store = {
  /** @param {string} key @returns {boolean} */
  isDone(key) { return state.done.includes(key); },

  /** @param {string} key @param {boolean} done @returns {void} */
  setDone(key, done) {
    const set = new Set(state.done);
    if (done) set.add(key); else set.delete(key);
    state = { ...state, done: [...set] };
    write();
  },

  /** @returns {number} */
  get doneCount() { return state.done.length; },

  /** @returns {string | null} */
  get last() { return state.last; },

  /** @param {string} key @returns {void} */
  setLast(key) {
    if (state.last === key) return;
    state = { ...state, last: key };
    write();
  },

  /** @returns {{ done: string[]; last: string | null }} snapshot of progress for syncing */
  get progress() { return { done: [...state.done], last: state.last }; },

  /**
   * Replace progress with a copy from another device. No-op when nothing differs,
   * so a sync echo never triggers another write.
   * @param {string[]} done
   * @param {string | null} last
   * @returns {void}
   */
  applyRemote(done, last) {
    const next = [...new Set(done)].sort();
    const same = next.length === state.done.length && next.every((k) => state.done.includes(k)) && last === state.last;
    if (same) return;
    state = { ...state, done: next, last };
    write();
  },

  /** @returns {"dark" | "light" | null} */
  get theme() { return state.theme; },

  /** @param {"dark" | "light"} theme @returns {void} */
  setTheme(theme) {
    state = { ...state, theme };
    write();
  },

  /** @returns {void} */
  reset() {
    state = { done: [], last: null, theme: state.theme };
    write();
  },

  /** @param {() => void} fn @returns {() => void} unsubscribe */
  subscribe(fn) {
    bus.addEventListener("change", fn);
    return () => bus.removeEventListener("change", fn);
  },
};
