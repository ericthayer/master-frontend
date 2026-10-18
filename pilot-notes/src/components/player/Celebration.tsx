import { useEffect, useRef, useState, type ReactNode } from "react";
import confetti from "canvas-confetti";
import type { BadgeId } from "../../content/types.ts";
import { BADGES } from "../../lib/progress.ts";

interface Props {
  open: boolean;
  title: string;
  xpGained: number;
  badges: BadgeId[];
  nextHref: string | null;
  nextLabel: string;
  onClose: () => void;
  children?: ReactNode;
}

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Between-module celebration: confetti, XP count-up, unlocked badges. */
export function Celebration({ open, title, xpGained, badges, nextHref, nextLabel, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    if (!open) return;

    if (!reduceMotion()) {
      void confetti({ particleCount: 120, spread: 75, origin: { y: 0.65 }, colors: ["#3ecf8e", "#fbbf24", "#a78bfa", "#7dd3fc"], disableForReducedMotion: true });
      if (badges.length) setTimeout(() => void confetti({ particleCount: 60, spread: 110, startVelocity: 35, origin: { y: 0.4 }, disableForReducedMotion: true }), 450);
    }
    if (reduceMotion()) { setShown(xpGained); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setShown(Math.round(xpGained * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, xpGained, badges.length]);

  return (
    <dialog ref={ref} className="celebrate" aria-labelledby="celebrate-title" onClose={onClose} onCancel={onClose}>
      <p className="celebrate__kicker">Module complete</p>
      <h2 id="celebrate-title" className="celebrate__title">{title}</h2>
      <p className="celebrate__xp" aria-label={`${xpGained} XP earned`}><span aria-hidden="true">+{shown}</span> <span className="celebrate__xp-unit">XP</span></p>
      {badges.length > 0 && (
        <ul className="celebrate__badges">
          {badges.map((b) => (
            <li key={b} className="badge-card">
              <span className="badge-card__emoji" aria-hidden="true">{BADGES[b].emoji}</span>
              <span><strong>Badge unlocked: {BADGES[b].label}</strong><br />{BADGES[b].text}</span>
            </li>
          ))}
        </ul>
      )}
      {children}
      <div className="celebrate__actions">
        {nextHref ? <a className="btn btn--primary" href={nextHref} autoFocus>{nextLabel} →</a> : null}
        <button type="button" className="btn btn--ghost" onClick={onClose} autoFocus={!nextHref}>Stay here</button>
      </div>
    </dialog>
  );
}
