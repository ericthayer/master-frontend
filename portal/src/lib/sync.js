// @ts-check
import { store } from "./store.js";

/**
 * Syncs lesson progress to the artifact's database under progress/<viewerId>.
 * localStorage stays the instant, offline copy; the database is the cross-device copy.
 *
 * Access rules (declared at publish):
 *   progress          read: owner, write: owner   → only the owner sees everyone (team view)
 *   progress/{self}   read: view,  write: interact → each person reads and writes their own doc
 *
 * Viewers below Contributor cannot write; their writes reject and the page stays local.
 */

/** @typedef {import("../types").SyncState} SyncState */

const bus = new EventTarget();
/** @type {SyncState} */
let state = "connecting";
/** @type {import("../types").DbApi | null} */
let dbApi = null;
/** @type {import("../types").UserApi | null} */
let userApi = null;
let owner = false;

/** @param {SyncState} next @returns {void} */
function setState(next) {
  if (state === next) return;
  state = next;
  bus.dispatchEvent(new Event("change"));
}

/** @param {unknown} raw @returns {{ done: string[]; last: string | null } | null} */
function parseDoc(raw) {
  if (!raw || typeof raw !== "object") return null;
  const r = /** @type {Record<string, unknown>} */ (raw);
  const done = Array.isArray(r.done) ? r.done.filter((x) => typeof x === "string") : [];
  return { done, last: typeof r.last === "string" ? r.last : null };
}

/** @param {{ done: string[]; last: string | null }} p @returns {string} */
const signature = (p) => `${[...p.done].sort().join("|")}#${p.last ?? ""}`;

export const sync = {
  /** @returns {SyncState} */
  get state() { return state; },
  /** @returns {boolean} viewer owns the artifact (sees team progress) */
  get isOwner() { return owner; },
  /** @returns {import("../types").DbApi | null} */
  get db() { return dbApi; },
  /** @returns {import("../types").UserApi | null} */
  get user() { return userApi; },

  /** @param {() => void} fn @returns {() => void} */
  subscribe(fn) {
    bus.addEventListener("change", fn);
    return () => bus.removeEventListener("change", fn);
  },

  /**
   * Connect once at startup. Never throws; any failure leaves the page on local storage.
   * @returns {Promise<void>}
   */
  async start() {
    const claude = window.claude;
    if (!claude?.use) { setState("local"); return; }
    try {
      const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
      dbApi = /** @type {import("../types").DbApi | null} */ (db);
      userApi = /** @type {import("../types").UserApi | null} */ (user);
      if (!dbApi || !userApi) { setState("local"); return; }
      owner = await userApi.isOwner();
      const uid = await userApi.id();
      if (!uid) { setState("local"); bus.dispatchEvent(new Event("change")); return; }
      await connect(dbApi.doc(`progress/${uid}`));
    } catch {
      setState("local");
    }
  },
};

/**
 * First load merges this browser's progress with the account's (union), so nothing done
 * offline is lost. After that the database copy wins and local edits are pushed.
 * @param {import("../types").DbDocRef} ref
 * @returns {Promise<void>}
 */
async function connect(ref) {
  const remote = parseDoc((await ref.get()).data());
  const local = store.progress;
  const merged = {
    done: [...new Set([...local.done, ...(remote?.done ?? [])])],
    last: local.last ?? remote?.last ?? null,
  };
  store.applyRemote(merged.done, merged.last);

  let pushed = remote ? signature(remote) : "";
  let writing = false;
  let timer = 0;

  const push = async () => {
    if (writing || state === "read-only") return;
    const current = store.progress;
    const sig = signature(current);
    if (sig === pushed) return;
    writing = true;
    try {
      await ref.set({ done: current.done, last: current.last, updatedAt: new Date().toISOString() });
      pushed = sig;
      setState("synced");
    } catch (err) {
      const code = /** @type {{ code?: string }} */ (err)?.code;
      // Below Contributor the store refuses writes: keep working locally for this visit.
      setState(code === "invalid_argument" || code === "not_granted" ? "read-only" : "local");
    } finally {
      writing = false;
    }
    if (signature(store.progress) !== pushed && state === "synced") schedule();
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = window.setTimeout(push, 800);
  };

  store.subscribe(() => { if (signature(store.progress) !== pushed) schedule(); });

  ref.onSnapshot((snap) => {
    if (snap.metadata.hasPendingWrites || !snap.exists) return;
    const doc = parseDoc(snap.data());
    if (!doc) return;
    pushed = signature(doc);
    store.applyRemote(doc.done, doc.last);
  }, () => setState("local"));

  if (signature(merged) !== pushed) await push();
  else setState("synced");
}
