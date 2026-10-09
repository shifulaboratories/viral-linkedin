"use client";

import { useEffect, useRef, useState } from "react";
import { FileImage, GalleryHorizontalEnd, MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    key: "infographic",
    icon: FileImage,
    title: "Infographic",
    spec: "One HTML file in · 1080 × 1350 PNG out",
    body: "Paste the HTML, and every company it mentions picks up its real logo from your library. You get a finished image, ready for the feed.",
  },
  {
    key: "carousel",
    icon: GalleryHorizontalEnd,
    title: "Carousel",
    spec: "A .zip of slides in · multi-page PDF out",
    body: "Drop in a folder of 1080 × 1080 slides. Reorder them, retheme them, and export the document LinkedIn turns into a swipeable post.",
  },
  {
    key: "tweet",
    icon: MessageSquareQuote,
    title: "Tweet",
    spec: "A short form in · 1080 × 1350 PNG out",
    body: "Persona, words, engagement counts. Viral renders a pixel-clean post card, so a good line can travel to a second platform.",
  },
] as const;

export function FormatShowcase() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // A step is "active" while it crosses the middle band of the
    // viewport, so the mock swaps right as you read each one.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-step={i}
              className="flex min-h-[55vh] flex-col justify-center py-10 lg:min-h-[70vh]"
            >
              <div
                className={cn(
                  "transition-all duration-500",
                  active === i ? "opacity-100" : "opacity-35 lg:opacity-30",
                )}
              >
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-500",
                      active === i
                        ? "border-signal/50 bg-signal/10 text-signal"
                        : "border-white/10 bg-white/[0.03] text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    0{i + 1} / 03
                  </span>
                </div>
                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">{s.title}</h3>
                <p className="mt-2 font-mono text-sm text-signal">{s.spec}</p>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
              {/* On small screens the mock sits inline under its step. */}
              <div className="mt-10 lg:hidden">
                <MockStage active={i} only={i} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-0 flex h-screen items-center justify-center">
          <MockStage active={active} />
        </div>
      </div>
    </div>
  );
}

function MockStage({ active, only }: { active: number; only?: number }) {
  return (
    <div className="format-stage relative mx-auto aspect-[4/5] w-full max-w-[380px]">
      {[InfographicMock, CarouselMock, TweetMock].map((Mock, i) =>
        only !== undefined && only !== i ? null : (
          <div
            key={i}
            className="format-mock absolute inset-0"
            data-state={active === i ? "on" : i < active ? "before" : "after"}
          >
            <Mock />
          </div>
        ),
      )}
    </div>
  );
}

const Line = ({ w, className }: { w: string; className?: string }) => (
  <div className={cn("h-2.5 rounded-full bg-white/15", className)} style={{ width: w }} />
);

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[22px] border border-white/10 bg-[#161514] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9),inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function InfographicMock() {
  return (
    <Frame className="p-7">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-signal" />
        <Line w="30%" className="h-2 bg-white/25" />
      </div>
      <div className="mt-6 space-y-2.5">
        <div className="h-5 w-[85%] rounded-md bg-chalk/90" />
        <div className="h-5 w-[60%] rounded-md bg-chalk/90" />
      </div>
      <div className="mt-8 flex h-[44%] items-end gap-3">
        {[38, 52, 46, 70, 64, 100].map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={cn("w-full rounded-t-md", i === 5 ? "bg-signal" : "bg-white/20")}
              style={{ height: `${h}%` }}
            />
            <div className="h-5 w-5 rounded-full border border-white/15 bg-white/10" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-7 bottom-7 flex items-center justify-between">
        <Line w="40%" />
        <span className="font-mono text-[10px] text-white/40">1080×1350</span>
      </div>
    </Frame>
  );
}

function CarouselMock() {
  return (
    <div className="relative h-full w-full [transform-style:preserve-3d]">
      {[2, 1, 0].map((i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 aspect-square w-[82%]"
          style={{
            transform: `translate(-50%, -50%) translateX(${i * 34}px) translateZ(${-i * 70}px) rotateY(${-i * 8}deg)`,
            opacity: 1 - i * 0.22,
          }}
        >
          <Frame className="p-6">
            <span className="font-mono text-[10px] text-white/40">{i + 1} / 8</span>
            <div className="mt-5 space-y-2">
              <div className="h-4 w-[80%] rounded-md bg-chalk/90" />
              <div className="h-4 w-[55%] rounded-md bg-chalk/90" />
            </div>
            <div className="mt-6 space-y-2">
              <Line w="90%" />
              <Line w="75%" />
              <Line w="82%" />
            </div>
            {i === 0 && (
              <div className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-signal text-background">
                →
              </div>
            )}
          </Frame>
        </div>
      ))}
    </div>
  );
}

function TweetMock() {
  return (
    <div className="flex h-full w-full items-center">
      <Frame className="h-auto p-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-chalk/80 to-concrete" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded-full bg-chalk/80" />
            <Line w="80px" className="h-2" />
          </div>
        </div>
        <div className="mt-5 space-y-2.5">
          <Line w="96%" className="bg-white/25" />
          <Line w="88%" className="bg-white/25" />
          <Line w="92%" className="bg-white/25" />
          <Line w="54%" className="bg-white/25" />
        </div>
        <div className="mt-6 flex items-center gap-6 border-t border-white/10 pt-4 font-mono text-xs text-white/45">
          <span className="flex items-center gap-1.5">↺ <Line w="22px" className="h-1.5" /></span>
          <span className="flex items-center gap-1.5 text-signal">
            ♥ <span className="h-1.5 w-7 rounded-full bg-signal/70" />
          </span>
          <span className="flex items-center gap-1.5">◔ <Line w="28px" className="h-1.5" /></span>
        </div>
      </Frame>
    </div>
  );
}
