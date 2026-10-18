import type { CourseOutline } from "../../content/types.ts";
import { useAuth, useEntitlements } from "../../lib/account.ts";
import { hasAccess } from "../../lib/access.ts";
import { useProgress } from "../../lib/progress-store.ts";
import { BADGES, courseProgress, totalXp } from "../../lib/progress.ts";
import { accountsEnabled } from "../../lib/supabase.ts";
import EbookButton from "./EbookButton.tsx";

export default function Library({ outlines }: { outlines: CourseOutline[] }) {
  const auth = useAuth();
  const ent = useEntitlements();
  const progress = useProgress();
  const owned = outlines.filter((o) => o.tier === "free" || hasAccess(ent.rows, o.slug));
  const badges = Object.keys(progress.badges) as Array<keyof typeof BADGES>;

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      {accountsEnabled && auth.status === "signed-out" && (
        <p className="panel">Sign in to see purchased courses and sync progress across devices. <a className="btn btn--sm" href="/login?next=/library">Sign in</a></p>
      )}
      <section className="panel">
        <h2 className="panel__h">⚡ {totalXp(progress).toLocaleString()} XP · 🏅 {badges.length} badges</h2>
        {badges.length > 0 && <p>{badges.map((b) => `${BADGES[b].emoji} ${BADGES[b].label}`).join(" · ")}</p>}
      </section>
      <ul className="rows">
        {owned.map((o) => {
          const pct = Math.round(courseProgress(progress, o.slug, o.modules.map((m) => m.id)) * 100);
          const resume = o.modules.find((m) => !progress.modules[`${o.slug}/${m.id}`]) ?? o.modules[0]!;
          return (
            <li key={o.slug}>
              <span><strong>{o.title}</strong><br /><span className="muted">{pct}% complete{progress.liveUrls[o.slug] ? " · 🚀 live" : ""}</span></span>
              <span style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <a className="btn btn--sm btn--primary" href={`/learn/${o.slug}/${resume.id}`}>{pct === 0 ? "Start" : pct === 100 ? "Review" : "Resume"}</a>
                {o.tier === "paid" && <EbookButton course={o.slug} />}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="muted">Looking for more? <a href="/courses">Browse the library</a>.</p>
    </div>
  );
}
