import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useAuth, useEntitlements } from "../../lib/account.ts";
import { hasAccess, hasActivePass } from "../../lib/access.ts";

/** Waits for the Stripe webhook to grant access, then sends the buyer into the course. */
export default function CheckoutSuccess({ course, plan, firstModule }: { course: string | null; plan: "course" | "pass"; firstModule: string | null }) {
  const auth = useAuth();
  const ent = useEntitlements();
  const tries = useRef(0);
  const granted = plan === "pass" ? hasActivePass(ent.rows) : course ? hasAccess(ent.rows, course) : false;

  useEffect(() => {
    if (granted || ent.loading || auth.status !== "signed-in" || tries.current > 15) return;
    const t = setTimeout(() => { tries.current += 1; ent.reload(); }, 2000);
    return () => clearTimeout(t);
  }, [granted, ent.loading, auth.status]);

  useEffect(() => {
    if (granted) void confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, disableForReducedMotion: true });
  }, [granted]);

  if (granted) {
    const href = course && firstModule ? `/learn/${course}/${firstModule}` : "/library";
    return (
      <div className="panel">
        <p className="auth__big">🎉 You’re in!</p>
        <p>{plan === "pass" ? "Your All-Access Pass is active — every course and e-book is unlocked." : "The course is yours for life, e-book included."}</p>
        <p><a className="btn btn--primary" href={href}>{course ? "Start the course →" : "Go to my library →"}</a></p>
      </div>
    );
  }
  if (tries.current > 15) return <p className="panel">Payment received — access is taking longer than usual. Refresh in a minute, or email us and we’ll sort it out.</p>;
  return <p className="panel" role="status">Confirming your payment…</p>;
}
