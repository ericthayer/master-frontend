import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import type { BadgeId, CourseOutline, ModuleContent } from "../../content/types.ts";
import { progressStore, useProgress } from "../../lib/progress-store.ts";
import { totalXp } from "../../lib/progress.ts";
import { requiredCheckpoints } from "../../lib/checks.ts";
import { xp as XP } from "../../config/product.ts";
import { ModuleSidebar } from "./ModuleSidebar.tsx";
import { PlayerHeader } from "./PlayerHeader.tsx";
import { LessonBlocks, type BlockContext } from "./LessonBlocks.tsx";
import { Celebration } from "./Celebration.tsx";
import { LeadCapture } from "./LeadCapture.tsx";
import { Inline } from "../Inline.tsx";
import type { TrackOption } from "./checkpoints/TrackQuiz.tsx";
import { VerifyUrl } from "./checkpoints/VerifyUrl.tsx";
import { UpgradeGate } from "./UpgradeGate.tsx";
import AccountMenu from "../account/AccountMenu.tsx";
import { api, useAuth, useEntitlements } from "../../lib/account.ts";
import { hasAccess } from "../../lib/access.ts";
import { BADGES } from "../../lib/progress.ts";

const SandboxPanel = lazy(() => import("./SandboxPanel.tsx"));
const COMBO_KEY = "pilotnotes:combo";

export interface PlayerProps {
  outline: CourseOutline;
  moduleId: string;
  /** Module body for free modules; null when it must be fetched for an entitled user. */
  content: ModuleContent | null;
  verifiedOn: string;
  trackOptions: TrackOption[];
}

function readCombo(): number {
  try { return Number(sessionStorage.getItem(COMBO_KEY)) || 0; } catch { return 0; }
}

type Remote = { status: "idle" | "loading" | "locked" | "error"; content: ModuleContent | null };

export default function CoursePlayer({ outline, moduleId, content: staticContent, verifiedOn, trackOptions }: PlayerProps) {
  const progress = useProgress();
  const auth = useAuth();
  const ent = useEntitlements();
  const [remote, setRemote] = useState<Remote>({ status: "idle", content: null });
  const content = staticContent ?? remote.content;
  const index = outline.modules.findIndex((m) => m.id === moduleId);
  const meta = outline.modules[index]!;
  const next = outline.modules[index + 1];
  const prev = outline.modules[index - 1];
  const key = (id: string) => `${outline.slug}/${id}`;

  const [navOpen, setNavOpen] = useState(false);
  const [tab, setTab] = useState<"learn" | "code">("learn");
  const [combo, setCombo] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<{ badges: BadgeId[] } | null>(null);
  const xpAtLoad = useRef<number | null>(null);

  useEffect(() => {
    setCombo(readCombo());
    xpAtLoad.current = totalXp(progressStore.get());
    const earned = progressStore.dispatch({ type: "start", course: outline.slug, module: moduleId });
    if (earned.length) flash(`Badge unlocked: Library Explorer`);
  }, [outline.slug, moduleId]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setNavOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  // Paid module bodies are fetched for entitled users only.
  useEffect(() => {
    if (staticContent || auth.status === "loading") return;
    if (auth.status === "signed-out") { setRemote({ status: "locked", content: null }); return; }
    let live = true;
    setRemote({ status: "loading", content: null });
    api(`/api/lesson?course=${encodeURIComponent(outline.slug)}&module=${encodeURIComponent(moduleId)}`)
      .then(async (res) => {
        if (!live) return;
        if (res.ok) setRemote({ status: "idle", content: (await res.json()) as ModuleContent });
        else setRemote({ status: res.status === 401 || res.status === 403 ? "locked" : "error", content: null });
      })
      .catch(() => { if (live) setRemote({ status: "error", content: null }); });
    return () => { live = false; };
  }, [staticContent, auth.status, outline.slug, moduleId, ent.rows.length]);

  const isLocked = (id: string) => {
    if (outline.tier === "free") return false;
    if (outline.modules.find((m) => m.id === id)?.preview) return false;
    return !hasAccess(ent.rows, outline.slug);
  };

  const toastTimer = useRef(0);
  function flash(msg: string) {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }

  const required = useMemo(() => (content ? requiredCheckpoints(content.blocks, content.sandbox?.id) : []), [content]);
  const passedCount = required.filter((id) => progress.checkpoints[key(id)]).length;
  const isDone = Boolean(progress.modules[key(moduleId)]);
  const canComplete = content !== null && passedCount === required.length;

  const onPass = (id: string, firstTry: boolean) => {
    if (progress.checkpoints[key(id)]) return;
    progressStore.dispatch({ type: "checkpoint", course: outline.slug, id });
    const c = firstTry ? readCombo() + 1 : 0;
    try { sessionStorage.setItem(COMBO_KEY, String(c)); } catch { /* ignore */ }
    setCombo(c);
    flash(c >= 2 ? `+${XP.checkpoint} XP · 🔥 combo ×${c}` : `+${XP.checkpoint} XP`);
  };

  const complete = () => {
    const badges = progressStore.dispatch({
      type: "complete",
      course: outline.slug,
      module: moduleId,
      ...(meta.badge ? { badge: meta.badge } : {}),
      courseModules: outline.modules.map((m) => m.id),
      paid: outline.tier === "paid",
    });
    setCelebrate({ badges });
  };

  const sandboxPassed = content?.sandbox ? Boolean(progress.checkpoints[key(content.sandbox.id)]) : false;

  const ctx: BlockContext = {
    isPassed: (id) => Boolean(progress.checkpoints[key(id)]),
    onPass,
    trackOptions,
    sandboxCue: content?.sandbox ? (
      <aside className="sb-cue">
        <p className="sb-cue__title">{sandboxPassed ? "✓ Sandbox task passed" : "🧪 Sandbox task"}</p>
        <p><Inline text={content.sandbox.task} /></p>
        <button type="button" className="btn btn--sm sb-cue__open" onClick={() => setTab("code")}>Open the sandbox</button>
        <p className="sb-cue__hint">The sandbox is on the right →</p>
      </aside>
    ) : null,
    renderVerify: (id, prompt) => (
      <VerifyUrl
        course={outline.slug}
        prompt={prompt}
        passed={Boolean(progress.checkpoints[key(id)])}
        savedUrl={progress.liveUrls[outline.slug]}
        onVerified={(url) => {
          const earned = progressStore.dispatch({ type: "live", course: outline.slug, id, url });
          flash(earned.length ? `+${XP.shipLive} XP · ${BADGES[earned[0]!].emoji} ${BADGES[earned[0]!].label}` : `+${XP.shipLive} XP`);
        }}
      />
    ),
  };

  const hasSandbox = Boolean(content?.sandbox);

  return (
    <div className={`player ${hasSandbox ? "player--sandbox" : ""}`} data-tab={tab}>
      <ModuleSidebar outline={outline} moduleId={moduleId} progress={progress} open={navOpen} isLocked={isLocked} />
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}
      <PlayerHeader outline={outline} moduleTitle={meta.title} progress={progress} combo={combo} navOpen={navOpen} onToggleNav={() => setNavOpen((o) => !o)} account={<AccountMenu />} />

      <main id="main" className="lesson" tabIndex={-1}>
        <article className="lesson__inner">
          <p className="lesson__kicker">Module {index + 1} of {outline.modules.length} · {meta.minutes} min</p>
          <h1 className="lesson__title">{meta.title}</h1>
          <ul className="lesson__objectives" aria-label="You will be able to">
            {meta.objectives.map((o) => <li key={o}>{o}</li>)}
          </ul>

          {content ? (
            <LessonBlocks blocks={content.blocks} ctx={ctx} />
          ) : remote.status === "locked" ? (
            <UpgradeGate outline={outline} signedIn={auth.status === "signed-in"} />
          ) : remote.status === "error" ? (
            <p role="alert">This lesson didn’t load. Check your connection and refresh.</p>
          ) : (
            <p className="lesson__loading" role="status">Loading lesson…</p>
          )}

          {content && content.takeaways.length > 0 && (
            <section className="takeaways" aria-labelledby="takeaways-h">
              <h2 id="takeaways-h" className="takeaways__h">Key takeaways</h2>
              <ul>{content.takeaways.map((t) => <li key={t}><Inline text={t} /></li>)}</ul>
            </section>
          )}

          <footer className="lesson__foot">
            {!content ? null : isDone ? (
              <p className="lesson__done">✓ Module complete</p>
            ) : (
              <>
                <p className="lesson__gate" aria-live="polite">
                  {required.length === 0 ? "Ready when you are." : `${passedCount} of ${required.length} checkpoints passed`}
                </p>
                <button type="button" className="btn btn--primary" onClick={complete} disabled={!canComplete}>
                  Complete module · +{XP.module} XP
                </button>
              </>
            )}
            <div className="lesson__pager">
              {prev ? <a href={`/learn/${outline.slug}/${prev.id}`}>← {prev.title}</a> : <span />}
              {next && <a href={`/learn/${outline.slug}/${next.id}`}>{next.title} →</a>}
            </div>
            <p className="lesson__verified">Tool details verified: {verifiedOn}</p>
          </footer>
        </article>
      </main>

      {hasSandbox && content?.sandbox && (
        <aside className="sandbox-pane" aria-label="Code sandbox">
          <Suspense fallback={<p className="sb__loading">Loading sandbox…</p>}>
            <SandboxPanel spec={content.sandbox} passed={sandboxPassed} onPass={(ft) => onPass(content.sandbox!.id, ft)} />
          </Suspense>
        </aside>
      )}

      {hasSandbox && (
        <nav className="ptabs" aria-label="Lesson view">
          <button type="button" aria-pressed={tab === "learn"} onClick={() => setTab("learn")}>📖 Learn</button>
          <button type="button" aria-pressed={tab === "code"} onClick={() => setTab("code")}>💻 Code{sandboxPassed ? " ✓" : ""}</button>
        </nav>
      )}

      <div className="toast" role="status" aria-live="polite">{toast && <span className="toast__msg">{toast}</span>}</div>

      <Celebration
        open={celebrate !== null}
        title={meta.title}
        xpGained={Math.max(0, totalXp(progress) - (xpAtLoad.current ?? 0))}
        badges={celebrate?.badges ?? []}
        nextHref={next ? `/learn/${outline.slug}/${next.id}` : outline.tier === "free" ? null : `/courses/${outline.slug}`}
        nextLabel={next ? `Next: ${next.title}` : "Back to course"}
        onClose={() => setCelebrate(null)}
      >
        {outline.tier === "free" && moduleId === "f2" && (
          <LeadCapture source="free-f2" title="Want the cheat sheet?" text="Optional: get a free e-book chapter and short Copilot tips by email. Your progress is already saved in this browser." cta="Email it to me" />
        )}
      </Celebration>
    </div>
  );
}
