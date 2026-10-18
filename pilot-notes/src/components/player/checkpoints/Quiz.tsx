import { useId, useState } from "react";
import { Inline } from "../../Inline.tsx";

interface Props {
  q: string;
  options: string[];
  answer: number;
  why: string;
  passed: boolean;
  onPass: (firstTry: boolean) => void;
}

export function Quiz({ q, options, answer, why, passed, onPass }: Props) {
  const name = useId();
  const [choice, setChoice] = useState<number | null>(passed ? answer : null);
  const [tries, setTries] = useState(0);
  const [checked, setChecked] = useState(passed);
  const correct = choice === answer;

  const check = () => {
    if (choice === null) return;
    setChecked(true);
    setTries((t) => t + 1);
    if (choice === answer && !passed) onPass(tries === 0);
  };

  return (
    <fieldset className={`cp cp--quiz ${checked ? (correct ? "is-ok" : "is-bad") : ""}`}>
      <legend className="cp__label"><span className="cp__tag">Checkpoint</span> <Inline text={q} /></legend>
      <div className="cp__options">
        {options.map((opt, i) => (
          <label key={i} className={`cp__option ${checked && i === choice ? (correct ? "is-ok" : "is-bad") : ""}`}>
            <input type="radio" name={name} checked={choice === i} disabled={passed} onChange={() => { setChoice(i); setChecked(false); }} />
            <span><Inline text={opt} /></span>
          </label>
        ))}
      </div>
      {!passed && <button type="button" className="btn btn--sm" onClick={check} disabled={choice === null}>Check answer</button>}
      <p className="cp__feedback" role="status">
        {checked && (correct ? <><strong>Correct.</strong> <Inline text={why} /></> : "Not quite — try another option.")}
      </p>
    </fieldset>
  );
}
