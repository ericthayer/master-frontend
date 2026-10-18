import { Fragment, useState } from "react";
import { Inline } from "../../Inline.tsx";
import { norm } from "../../../lib/checks.ts";

interface Props {
  prompt: string;
  code: string;
  answers: string[];
  why: string;
  passed: boolean;
  onPass: (firstTry: boolean) => void;
}

export function FillBlank({ prompt, code, answers, why, passed, onPass }: Props) {
  const parts = code.split("___");
  const [values, setValues] = useState<string[]>(() => (passed ? [...answers] : answers.map(() => "")));
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<boolean[] | null>(passed ? answers.map(() => true) : null);
  const allOk = result?.every(Boolean) ?? false;

  const check = () => {
    const r = answers.map((a, i) => norm(values[i] ?? "") === norm(a));
    setResult(r);
    setTries((t) => t + 1);
    if (r.every(Boolean) && !passed) onPass(tries === 0);
  };

  return (
    <div className={`cp cp--fill ${result ? (allOk ? "is-ok" : "is-bad") : ""}`} role="group" aria-label="Fill in the blanks">
      <p className="cp__label"><span className="cp__tag">Checkpoint</span> <Inline text={prompt} /></p>
      <pre className="cp__code"><code>
        {parts.map((part, i) => (
          <Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                className={`cp__blank ${result ? (result[i] ? "is-ok" : "is-bad") : ""}`}
                aria-label={`Blank ${i + 1}`}
                size={Math.max(6, (answers[i] ?? "").length + 2)}
                value={values[i] ?? ""}
                disabled={passed}
                autoCapitalize="off" autoComplete="off" spellCheck={false}
                onChange={(e) => { const v = [...values]; v[i] = e.target.value; setValues(v); setResult(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") check(); }}
              />
            )}
          </Fragment>
        ))}
      </code></pre>
      {!passed && <button type="button" className="btn btn--sm" onClick={check} disabled={values.some((v) => !v.trim())}>Check</button>}
      <p className="cp__feedback" role="status">
        {result && (allOk ? <><strong>Nailed it.</strong> <Inline text={why} /></> : "Some blanks aren’t right yet — the red ones need another look.")}
      </p>
    </div>
  );
}
