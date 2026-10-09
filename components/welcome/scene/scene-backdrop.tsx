"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { sceneState } from "./scene-state";

// three.js is ~150 KB gzipped and touches `window` on import, so it is
// split out and only loaded in the browser. The landing page's text is
// server-rendered and readable before this arrives.
const ViralScene = dynamic(() => import("./viral-scene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SceneBackdrop() {
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");
  const [animate, setAnimate] = useState(true);
  const [ready, setReady] = useState(false);
  const dim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(hasWebGL() ? "webgl" : "fallback");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAnimate(!mq.matches);
    const onMq = () => setAnimate(!mq.matches);
    mq.addEventListener("change", onMq);

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      sceneState.progress = p;
      // The hero gets the scene at full strength; once text sections
      // scroll over it, it steps back so copy stays readable.
      if (dim.current) {
        const t = Math.min(1, Math.max(0, (window.scrollY - window.innerHeight * 0.25) / (window.innerHeight * 0.6)));
        dim.current.style.opacity = String(t * 0.55);
      }
    };
    const onPointer = (e: PointerEvent) => {
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
      {/* CSS glow sits underneath at all times: it is the fallback when
        * there is no WebGL, and the first paint while three.js loads. */}
      <div className="welcome-aurora absolute -inset-32 opacity-60 [background:radial-gradient(ellipse_at_50%_70%,hsl(var(--ring)/0.22),transparent_55%),radial-gradient(ellipse_at_30%_20%,hsl(var(--primary)/0.10),transparent_55%)]" />
      {mode === "webgl" && (
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <ViralScene animate={animate} onReady={() => setReady(true)} />
        </div>
      )}
      <div ref={dim} className="absolute inset-0 bg-background" style={{ opacity: 0 }} />
      {/* Vignette keeps text legible over the brightest bars. */}
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background)/0.75)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/80 to-transparent" />
    </div>
  );
}
