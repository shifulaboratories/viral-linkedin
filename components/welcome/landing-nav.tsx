"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#formats", label: "Formats" },
  { href: "#results", label: "Results" },
  { href: "#loop", label: "The loop" },
];

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={cn(
          "flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border px-2 py-2 pl-4 transition-all duration-500",
          scrolled
            ? "border-white/[0.09] bg-background/60 shadow-lg backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Link href="/welcome" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" aria-hidden className="h-5 w-5" />
          Viral
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-white/[0.06] hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>
        {signedIn ? (
          <Link href="/" className="landing-btn-primary h-9 px-4 text-sm">
            Open the app
          </Link>
        ) : (
          <div className="flex items-center gap-1">
            <Link
              href="/auth/signin"
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Sign in
            </Link>
            <Link href="/welcome/request" className="landing-btn-primary h-9 px-4 text-sm">
              Request access
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
