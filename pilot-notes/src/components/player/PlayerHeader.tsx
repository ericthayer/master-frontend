import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CourseOutline } from "../../content/types.ts";
import { BADGES, totalXp, type ProgressState } from "../../lib/progress.ts";

interface Props {
  outline: CourseOutline;
  moduleTitle: string;
  progress: ProgressState;
  combo: number;
  navOpen: boolean;
  onToggleNav: () => void;
  account?: ReactNode;
}

export function PlayerHeader({ outline, moduleTitle, progress, combo, navOpen, onToggleNav, account }: Props) {
  const xp = totalXp(progress);
  const done = outline.modules.filter((m) => progress.modules[`${outline.slug}/${m.id}`]).length;
  const pct = (done / outline.modules.length) * 100;
  const badges = Object.keys(progress.badges) as Array<keyof typeof BADGES>;

  const prev = useRef(xp);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (xp > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 700);
      prev.current = xp;
      return () => clearTimeout(t);
    }
    prev.current = xp;
  }, [xp]);

  return (
    <header className="phead">
      <button type="button" className="icon-btn phead__menu" aria-label="Course modules" aria-controls="player-nav" aria-expanded={navOpen} onClick={onToggleNav}>☰</button>
      <nav aria-label="Breadcrumb" className="phead__crumbs">
        <ol>
          <li><a href={outline.tier === "free" ? "/" : `/courses/${outline.slug}`}>{outline.title}</a></li>
          <li aria-current="page">{moduleTitle}</li>
        </ol>
      </nav>
      <div className="phead__progress" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="phead__stats">
        {combo >= 2 && <span className="chip phead__combo" title="First-try checkpoints in a row">🔥 ×{combo}</span>}
        <span className={`chip chip--xp phead__xp ${bump ? "is-bump" : ""}`} aria-live="polite">⚡ {xp.toLocaleString()} XP</span>
        <details className="phead__badges">
          <summary className="chip" aria-label={`${badges.length} badges`}>🏅 {badges.length}</summary>
          <div className="phead__badge-pop">
            {badges.length === 0 ? <p>No badges yet — finish a module to earn one.</p> : (
              <ul>{badges.map((b) => <li key={b}><span aria-hidden="true">{BADGES[b].emoji}</span> <strong>{BADGES[b].label}</strong> — {BADGES[b].text}</li>)}</ul>
            )}
          </div>
        </details>
        {account}
      </div>
    </header>
  );
}
