import { test } from "node:test";
import assert from "node:assert/strict";
import { empty, merge, parse, reduce, totalXp } from "../src/lib/progress.ts";

const T = "2026-01-01T00:00:00.000Z";

test("parse rejects garbage and keeps valid fields", () => {
  assert.deepEqual(parse(null), empty());
  assert.deepEqual(parse({ v: 2 }), empty());
  const s = parse({ v: 1, modules: { "a/m1": T, bad: 3 }, badges: { "first-flight": T, nope: T }, started: ["a", 1] });
  assert.deepEqual(s.modules, { "a/m1": T });
  assert.deepEqual(Object.keys(s.badges), ["first-flight"]);
  assert.deepEqual(s.started, ["a"]);
});

test("XP: 100 per module, 50 per checkpoint, 500 per live project", () => {
  let s = empty();
  s = reduce(s, { type: "checkpoint", course: "c", id: "q1" }, T).state;
  s = reduce(s, { type: "checkpoint", course: "c", id: "q1" }, T).state; // idempotent
  s = reduce(s, { type: "complete", course: "c", module: "m1", courseModules: ["m1", "m2"], paid: true }, T).state;
  assert.equal(totalXp(s), 150);
  s = reduce(s, { type: "live", course: "c", id: "v", url: "https://x.netlify.app" }, T).state;
  assert.equal(totalXp(s), 700);
});

test("badges: module badge, course-complete only for paid, library explorer at 2 courses", () => {
  let r = reduce(empty(), { type: "complete", course: "free", module: "f1", badge: "first-flight", courseModules: ["f1"], paid: false }, T);
  assert.deepEqual(r.earned, ["first-flight"]);
  r = reduce(r.state, { type: "complete", course: "p", module: "m1", courseModules: ["m1"], paid: true }, T);
  assert.deepEqual(r.earned, ["course-complete"]);
  r = reduce(r.state, { type: "start", course: "a", module: "x" }, T);
  assert.deepEqual(r.earned, []);
  r = reduce(r.state, { type: "start", course: "b", module: "x" }, T);
  assert.deepEqual(r.earned, ["library-explorer"]);
  r = reduce(r.state, { type: "start", course: "c", module: "x" }, T);
  assert.deepEqual(r.earned, []);
});

test("merge unions progress and keeps earliest timestamps", () => {
  const a = { ...empty(), modules: { "c/m1": "2026-02-01" }, started: ["c"] };
  const b = { ...empty(), modules: { "c/m1": "2026-01-01", "c/m2": "2026-01-02" }, started: ["d"] };
  const m = merge(a, b);
  assert.deepEqual(m.modules, { "c/m1": "2026-01-01", "c/m2": "2026-01-02" });
  assert.deepEqual(m.started, ["c", "d"]);
});
