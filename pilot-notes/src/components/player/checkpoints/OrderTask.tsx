import { useMemo, useState, type DragEvent } from "react";
import { Inline } from "../../Inline.tsx";
import { shuffled } from "../../../lib/checks.ts";

interface Props {
  id: string;
  prompt: string;
  items: string[];
  why: string;
  passed: boolean;
  onPass: (firstTry: boolean) => void;
}

/** Ordering task. Works by drag on desktop and with ↑/↓ buttons on touch and keyboard. */
export function OrderTask({ id, prompt, items, why, passed, onPass }: Props) {
  const initial = useMemo(() => (passed ? items : shuffled(items, id)), [id, items, passed]);
  const [order, setOrder] = useState(initial);
  const [dragging, setDragging] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [checked, setChecked] = useState(passed);
  const correct = order.every((x, i) => x === items[i]);
  const [announce, setAnnounce] = useState("");

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    setOrder(next);
    setChecked(false);
    setAnnounce(`Moved to position ${to + 1} of ${next.length}.`);
  };

  const check = () => {
    setChecked(true);
    setTries((t) => t + 1);
    if (correct && !passed) onPass(tries === 0);
  };

  return (
    <div className={`cp cp--order ${checked ? (correct ? "is-ok" : "is-bad") : ""}`} role="group" aria-label="Put the steps in order">
      <p className="cp__label"><span className="cp__tag">Checkpoint</span> <Inline text={prompt} /></p>
      <ol className="cp__order">
        {order.map((item, i) => (
          <li
            key={item}
            className={`cp__order-item ${dragging === i ? "is-dragging" : ""}`}
            draggable={!passed}
            onDragStart={() => setDragging(i)}
            onDragOver={(e: DragEvent) => e.preventDefault()}
            onDrop={() => { if (dragging !== null) move(dragging, i); setDragging(null); }}
            onDragEnd={() => setDragging(null)}
          >
            <span className="cp__order-n" aria-hidden="true">{i + 1}</span>
            <span className="cp__order-text"><Inline text={item} /></span>
            {!passed && (
              <span className="cp__order-btns">
                <button type="button" className="icon-btn" aria-label={`Move “${item}” up`} disabled={i === 0} onClick={() => move(i, i - 1)}>↑</button>
                <button type="button" className="icon-btn" aria-label={`Move “${item}” down`} disabled={i === order.length - 1} onClick={() => move(i, i + 1)}>↓</button>
              </span>
            )}
          </li>
        ))}
      </ol>
      <span className="visually-hidden" aria-live="polite">{announce}</span>
      {!passed && <button type="button" className="btn btn--sm" onClick={check}>Check order</button>}
      <p className="cp__feedback" role="status">
        {checked && (correct ? <><strong>Perfect order.</strong> <Inline text={why} /></> : "Close — something is out of place.")}
      </p>
    </div>
  );
}
