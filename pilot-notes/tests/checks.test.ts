import { test } from "node:test";
import assert from "node:assert/strict";
import { norm, requiredCheckpoints, runChecks, shuffled } from "../src/lib/checks.ts";
import { courses } from "../src/content/catalog.ts";

test("runChecks evaluates regex checks and survives bad patterns", () => {
  const r = runChecks({ "/index.html": "<h1>Ada</h1>" }, [
    { label: "named", file: "/index.html", pattern: "<h1>(?!\\s*Your Name\\s*<)[^<]+</h1>" },
    { label: "missing file", file: "/x.css", pattern: "a" },
    { label: "bad regex", file: "/index.html", pattern: "(" },
  ]);
  assert.deepEqual(r.map((x) => x.pass), [true, false, false]);
});

test("shuffled never returns the original order and is deterministic", () => {
  const items = ["a", "b", "c", "d"];
  for (const seed of ["x", "y", "z", "f2-o1"]) {
    const s = shuffled(items, seed);
    assert.notDeepEqual(s, items);
    assert.deepEqual([...s].sort(), items);
    assert.deepEqual(shuffled(items, seed), s);
  }
});

test("norm trims and lowercases", () => assert.equal(norm("  Goal  "), "goal"));

test("every course is well-formed", () => {
  for (const c of courses) {
    assert.ok(c.modules.length <= 6, `${c.slug}: max 6 modules`);
    const minutes = c.modules.reduce((s, m) => s + m.minutes, 0);
    assert.ok(minutes < 60, `${c.slug}: under 60 minutes (got ${minutes})`);
    const ids = new Set<string>();
    for (const m of c.modules) {
      assert.ok(m.minutes >= 5 && m.minutes <= 10, `${c.slug}/${m.id}: 5–10 min`);
      for (const id of requiredCheckpoints(m.blocks, m.sandbox?.id)) {
        assert.ok(!ids.has(id), `${c.slug}: duplicate checkpoint id ${id}`);
        ids.add(id);
      }
      for (const b of m.blocks) {
        if (b.t === "quiz") assert.ok(b.answer >= 0 && b.answer < b.options.length, `${b.id}: answer index`);
        if (b.t === "fill") assert.equal(b.code.split("___").length - 1, b.answers.length, `${b.id}: blanks match answers`);
      }
      if (m.sandbox) for (const ch of m.sandbox.checks) {
        assert.ok(ch.file in m.sandbox.files, `${m.sandbox.id}: check file exists`);
        assert.equal(runChecks(m.sandbox.files, [ch])[0]!.pass, false, `${m.sandbox.id}: "${ch.label}" must fail on starter code`);
      }
    }
  }
});

test("free course sandbox checks pass on a solved file", () => {
  const sb = courses[0]!.modules.find((m) => m.sandbox)!.sandbox!;
  const solved = sb.files["/index.html"]!.replace("<h1>Your Name</h1>", "<h1>Ada Lovelace</h1>").replace("background: #ffffff", "background: #111827");
  assert.ok(runChecks({ "/index.html": solved }, sb.checks).every((r) => r.pass));
});
