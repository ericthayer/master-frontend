import { lazy, Suspense, useEffect, useRef, useState } from "react";

const HeroScene = lazy(() => import("./HeroScene.tsx"));

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Loads the Three.js scene only where it helps: wide screens, motion allowed, WebGL present.
 * Everyone else keeps the static CSS backdrop rendered by Hero.astro. Pauses when scrolled away.
 */
export default function HeroCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wide = matchMedia("(min-width: 768px)");
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(wide.matches && !still.matches && webglOk());
    update();
    wide.addEventListener("change", update);
    still.addEventListener("change", update);
    return () => { wide.removeEventListener("change", update); still.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting));
    io.observe(el);
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  useEffect(() => { if (enabled) requestAnimationFrame(() => setReady(true)); }, [enabled]);

  return (
    <div ref={host} className={`hero__canvas${ready ? " is-ready" : ""}`} aria-hidden="true">
      {enabled && (
        <Suspense fallback={null}>
          <HeroScene active={visible} />
        </Suspense>
      )}
    </div>
  );
}
