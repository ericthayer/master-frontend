import type { CourseOutline } from "../../content/types.ts";
import type { ProgressState } from "../../lib/progress.ts";

interface Props {
  outline: CourseOutline;
  moduleId: string;
  progress: ProgressState;
  open: boolean;
  isLocked: (moduleId: string) => boolean;
}

export function ModuleSidebar({ outline, moduleId, progress, open, isLocked }: Props) {
  const done = outline.modules.filter((m) => progress.modules[`${outline.slug}/${m.id}`]).length;
  const pct = Math.round((done / outline.modules.length) * 100);

  return (
    <nav id="player-nav" className={`pnav ${open ? "is-open" : ""}`} aria-label="Course modules">
      <a className="pnav__brand" href="/">
        <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><path d="M7 22 25 10l-6 15-4-5-8 2Z" fill="currentColor" /></svg>
        Pilot Notes
      </a>
      <div className="pnav__course">
        <p className="pnav__kicker">{outline.tier === "free" ? "Free course" : "Course"} · {outline.minutes} min</p>
        <p className="pnav__title">{outline.title}</p>
        <div className="pnav__ring" style={{ ["--p" as string]: `${pct}` }} role="img" aria-label={`${done} of ${outline.modules.length} modules complete`}>
          <span>{pct}%</span>
        </div>
      </div>
      <ol className="pnav__list">
        {outline.modules.map((m, i) => {
          const isDone = Boolean(progress.modules[`${outline.slug}/${m.id}`]);
          const isCurrent = m.id === moduleId;
          const locked = isLocked(m.id);
          return (
            <li key={m.id}>
              <a
                className={`pnav__item ${isCurrent ? "is-current" : ""} ${isDone ? "is-done" : ""} ${locked ? "is-locked" : ""}`}
                href={`/learn/${outline.slug}/${m.id}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                <span className="pnav__mark" aria-hidden="true">{isDone ? "✓" : locked ? "🔒" : i + 1}</span>
                <span className="pnav__text">
                  <span className="pnav__name">{m.title}</span>
                  <span className="pnav__meta">{m.minutes} min{isDone ? " · done" : locked ? " · locked" : ""}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
