"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

// A card whose border and surface catch a soft light under the cursor.
// The position is written to CSS variables directly so hovering never
// re-renders; welcome.css paints the light from those variables.
export function SpotlightCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "spotlight-card group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card/60 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.14]",
        className,
      )}
    >
      {children}
    </div>
  );
}
