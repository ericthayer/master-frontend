import { useEffect, useMemo, useRef, useState } from "react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import type { SandboxSpec } from "../../content/types.ts";
import { runChecks, type CheckResult } from "../../lib/checks.ts";
import { Inline } from "../Inline.tsx";

const theme = {
  colors: {
    surface1: "#0a0e0f",
    surface2: "#192022",
    surface3: "#212a2c",
    clickable: "#93a39e",
    base: "#e4ece9",
    disabled: "#4c5c57",
    hover: "#ffffff",
    accent: "#3ecf8e",
    error: "#ff6b6b",
    errorSurface: "#2a1414",
  },
  syntax: {
    plain: "#e4ece9",
    comment: { color: "#7d8c87", fontStyle: "italic" as const },
    keyword: "#c4b5fd",
    tag: "#f0883e",
    punctuation: "#93a39e",
    definition: "#93c5fd",
    property: "#93c5fd",
    static: "#7dd3fc",
    string: "#3ecf8e",
  },
  font: {
    body: "\"Instrument Sans\", system-ui, sans-serif",
    mono: "\"JetBrains Mono\", ui-monospace, monospace",
    size: "13px",
    lineHeight: "20px",
  },
};

const storageKey = (id: string) => `pilotnotes:sandbox:${id}`;

function loadFiles(spec: SandboxSpec): Record<string, string> {
  try {
    const raw = localStorage.getItem(storageKey(spec.id));
    if (raw) {
      const saved = JSON.parse(raw) as unknown;
      if (saved && typeof saved === "object") {
        const merged = { ...spec.files };
        for (const [k, v] of Object.entries(saved as Record<string, unknown>)) if (k in merged && typeof v === "string") merged[k] = v;
        return merged;
      }
    }
  } catch { /* ignore */ }
  return spec.files;
}

/** Inner toolbar: autosave, run checks, reset. Must live inside SandpackProvider. */
function Toolbar({ spec, passed, onPass }: { spec: SandboxSpec; passed: boolean; onPass: (firstTry: boolean) => void }) {
  const { sandpack } = useSandpack();
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const tries = useRef(0);
  const timer = useRef<number>(0);

  const current = (): Record<string, string> =>
    Object.fromEntries(Object.entries(sandpack.files).map(([path, f]) => [path, f.code]));

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try { localStorage.setItem(storageKey(spec.id), JSON.stringify(current())); } catch { /* ignore */ }
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [sandpack.files, spec.id]);

  const check = () => {
    const r = runChecks(current(), spec.checks);
    setResults(r);
    tries.current += 1;
    if (r.every((x) => x.pass) && !passed) onPass(tries.current === 1);
  };

  const reset = () => {
    try { localStorage.removeItem(storageKey(spec.id)); } catch { /* ignore */ }
    for (const [path, code] of Object.entries(spec.files)) sandpack.updateFile(path, code);
    setResults(null);
  };

  return (
    <div className="sb__bar">
      <div className="sb__actions">
        <button type="button" className="btn btn--primary btn--sm" onClick={check}>Run checks</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>Reset</button>
        {passed && <span className="chip chip--accent">✓ Passed</span>}
      </div>
      {results && (
        <ul className="sb__results" aria-live="polite">
          {results.map((r) => (
            <li key={r.label} className={r.pass ? "is-ok" : "is-bad"}>
              <span aria-hidden="true">{r.pass ? "✓" : "✗"}</span> {r.label}
              <span className="visually-hidden">{r.pass ? " — passed" : " — not yet"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SandboxPanel({ spec, passed, onPass }: { spec: SandboxSpec; passed: boolean; onPass: (firstTry: boolean) => void }) {
  const files = useMemo(() => loadFiles(spec), [spec]);
  return (
    <section className="sb" aria-labelledby="sb-title">
      <header className="sb__head">
        <h2 id="sb-title" className="sb__title">Sandbox</h2>
        <p className="sb__task"><Inline text={spec.task} /></p>
      </header>
      <SandpackProvider template={spec.template} files={files} theme={theme} options={{ activeFile: spec.active, autorun: true, recompileDelay: 400 }}>
        <Toolbar spec={spec} passed={passed} onPass={onPass} />
        <SandpackLayout className="sb__layout">
          <SandpackCodeEditor showTabs showLineNumbers wrapContent className="sb__editor" />
          <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton className="sb__preview" />
        </SandpackLayout>
      </SandpackProvider>
    </section>
  );
}
