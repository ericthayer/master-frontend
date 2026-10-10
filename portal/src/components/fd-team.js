// @ts-check
import { h } from "../lib/dom.js";
import { href } from "../lib/router.js";
import { sync } from "../lib/sync.js";
import { modules, totalLessons, lessonKey } from "../data/modules.js";

/** @typedef {{ id: string; done: string[]; last: string | null; updatedAt: string }} Row */

const fmt = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/** @param {string} iso @returns {string} */
function ago(iso) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  const mins = Math.round((ms - Date.now()) / 60000);
  if (Math.abs(mins) < 60) return fmt.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return fmt.format(hours, "hour");
  return fmt.format(Math.round(hours / 24), "day");
}

/** @param {string | null} key @returns {{ title: string; link: string } | null} */
function lessonFor(key) {
  if (!key) return null;
  const [moduleId, lessonId] = key.split("/");
  const m = modules.find((x) => x.id === moduleId);
  const i = m ? m.lessons.findIndex((l) => l.id === lessonId) : -1;
  return m && i >= 0 ? { title: m.lessons[i].title, link: href(m.id, i) } : null;
}

/** Owner-only roster of everyone's synced progress, live. */
export class FdTeam extends HTMLElement {
  /** @type {(() => void) | null} */
  #unsubscribe = null;
  /** @type {(() => void) | null} */
  #unsync = null;
  #body = h("div", { class: "team__body" });

  /** @returns {void} */
  connectedCallback() {
    this.replaceChildren(h("div", { class: "page" }, [
      h("header", { class: "gloss__head" }, [
        h("p", { class: "eyebrow", text: "Owner view" }),
        h("h1", { class: "page__title", text: "Team progress" }),
        h("p", { class: "page__lede", text: "Everyone who has opened the portal while signed in, with progress synced from their account. Updates live." }),
      ]),
      this.#body,
    ]));
    this.#unsync = sync.subscribe(() => this.#connect());
    this.#connect();
  }

  /** @returns {void} */
  disconnectedCallback() {
    this.#unsubscribe?.();
    this.#unsync?.();
  }

  /** @returns {void} */
  #connect() {
    if (this.#unsubscribe) return;
    if (sync.state === "connecting") { this.#message("Connecting to shared progress…"); return; }
    if (!sync.isOwner || !sync.db) { this.#message("Only the portal's owner can see team progress."); return; }
    this.#unsubscribe = sync.db.collection("progress").onSnapshot(
      (snap) => {
        /** @type {Row[]} */
        const rows = snap.docs.filter((d) => d.exists).map((d) => {
          const raw = /** @type {Record<string, unknown>} */ (d.data() ?? {});
          return {
            id: d.id,
            done: Array.isArray(raw.done) ? raw.done.filter((x) => typeof x === "string") : [],
            last: typeof raw.last === "string" ? raw.last : null,
            updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
          };
        });
        void this.#render(rows);
      },
      () => this.#message("Team progress couldn't load. Reload the page to try again."),
    );
  }

  /** @param {string} text @returns {void} */
  #message(text) {
    this.#body.replaceChildren(h("p", { class: "team__empty", text }));
  }

  /** @param {Row[]} rows @returns {Promise<void>} */
  async #render(rows) {
    if (!rows.length) {
      this.#message("Nobody has synced progress yet. Share the portal with people at Contributor access; their progress appears here as soon as they complete a lesson.");
      return;
    }
    const total = totalLessons();
    const people = await sync.user?.profiles(rows.map((r) => r.id)) ?? {};
    const sorted = [...rows].sort((a, b) => b.done.length - a.done.length);
    const avg = Math.round(rows.reduce((n, r) => n + r.done.length, 0) / rows.length / total * 100);
    const finished = rows.filter((r) => r.done.length >= total).length;

    const stat = (/** @type {string} */ label, /** @type {string} */ value, /** @type {string} */ unit) =>
      h("div", { class: "status__cell" }, [
        h("p", { class: "eyebrow", text: label }),
        h("p", { class: "status__value" }, [h("span", { text: value }), h("small", { text: unit })]),
      ]);

    const table = h("div", { class: "table-wrap", role: "region", tabindex: 0, "aria-label": "Progress by person" }, [
      h("table", { class: "team__table" }, [
        h("thead", {}, [h("tr", {}, ["Person", "Lessons", "Modules done", "Last lesson", "Updated"].map((c) => h("th", { scope: "col", text: c })))]),
        h("tbody", {}, sorted.map((r) => {
          const p = people[r.id];
          const pct = Math.round(r.done.length / total * 100);
          const modsDone = modules.filter((m) => m.lessons.every((l) => r.done.includes(lessonKey(m.id, l.id)))).length;
          const last = lessonFor(r.last);
          return h("tr", {}, [
            h("th", { scope: "row" }, [h("span", { class: "team__who" }, [
              h("img", { src: p?.avatarUrl ?? "", alt: "", width: 24, height: 24, class: "team__avatar" }),
              h("span", { text: p?.name || "Someone" }),
            ])]),
            h("td", {}, [h("span", { class: "team__count", text: `${r.done.length}/${total}` }),
              h("span", { class: "meter meter--thin team__meter", role: "img", "aria-label": `${pct}% complete`, style: `--pct:${pct}%` }, [h("i")])]),
            h("td", { class: "team__num", text: `${modsDone}/${modules.length}` }),
            h("td", {}, [last ? h("a", { href: last.link, text: last.title }) : "—"]),
            h("td", { class: "team__num", text: r.updatedAt ? ago(r.updatedAt) : "—" }),
          ]);
        })),
      ]),
    ]);

    this.#body.replaceChildren(
      h("section", { class: "status", "aria-label": "Team summary" }, [
        stat("Learners", String(rows.length), " people"),
        stat("Average completion", String(avg), "%"),
        stat("Finished the course", String(finished), ` of ${rows.length}`),
      ]),
      table,
    );
  }
}

customElements.define("fd-team", FdTeam);
