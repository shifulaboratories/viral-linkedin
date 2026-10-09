import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Library,
  Palette,
  Trophy,
  Users,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { FlickeringFooter } from "@/components/ui/flickering-footer";
import { CountUp } from "@/components/welcome/count-up";
import { WelcomeReveal } from "@/components/welcome/welcome-reveal";
import { SceneBackdrop } from "@/components/welcome/scene/scene-backdrop";
import { LandingNav } from "@/components/welcome/landing-nav";
import { SpotlightCard } from "@/components/welcome/spotlight-card";
import { FormatShowcase } from "@/components/welcome/format-showcase";
import "./welcome.css";

export const dynamic = "force-dynamic";

const POST_EMBEDS = [
  "https://www.linkedin.com/embed/feed/update/urn:li:share:7449661662900707329?collapsed=1",
  "https://www.linkedin.com/embed/feed/update/urn:li:share:7443026949586915328?collapsed=1",
  "https://www.linkedin.com/embed/feed/update/urn:li:share:7440637028079214592?collapsed=1",
  "https://www.linkedin.com/embed/feed/update/urn:li:share:7442361131559526400?collapsed=1",
];

const HEADLINE = ["We", "figured", "out", "how", "to"];
const HEADLINE_ACCENT = ["hack", "virality."];

const LOOP = [
  {
    icon: BarChart3,
    title: "Every post, with its numbers",
    body: "Impressions, reactions, comments and reposts logged against the exact post that earned them — and the source kept, so any winner can be remixed.",
    span: "lg:col-span-2",
  },
  {
    icon: Library,
    title: "A logo library that compounds",
    body: "Every company you post about stays resolved. The hundredth post is faster than the first.",
    span: "",
  },
  {
    icon: Palette,
    title: "Brand themes",
    body: "Your look, applied to any slide in one click.",
    span: "",
  },
  {
    icon: Trophy,
    title: "Wins, out in the open",
    body: "Once a post has a week of real numbers it lands on the community feed and the leaderboard. Patterns surface in days, not months.",
    span: "lg:col-span-2",
  },
  {
    icon: Users,
    title: "Built-in accountability",
    body: "A small directory of people who ship. Show up, post, share, repeat.",
    span: "lg:col-span-2",
  },
  {
    icon: BookOpen,
    title: "The playbook, shared",
    body: "The skills and tools the group actually uses, in one place.",
    span: "",
  },
];

export default async function WelcomePage() {
  // Signed-in visitors get "open the app" instead of being asked to
  // sign in or request access.
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip text-foreground">
      <SceneBackdrop />
      <WelcomeReveal />
      <LandingNav signedIn={signedIn} />

      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col items-center px-6 pb-16 pt-32 text-center sm:pt-40">
        <div className="welcome-fade flex flex-col items-center" style={{ animationDelay: "100ms" }}>
          <span className="shine-badge">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            Invite-only · A Shifu Labs tool
          </span>
        </div>

        <h1 className="mt-8 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-7xl md:text-[5.5rem]">
          {HEADLINE.map((w, i) => (
            <span key={w + i} className="welcome-word" style={{ animationDelay: `${200 + i * 70}ms` }}>
              {w}{" "}
            </span>
          ))}
          {HEADLINE_ACCENT.map((w, i) => (
            <span
              key={w}
              className="welcome-word text-accent-gradient"
              style={{ animationDelay: `${200 + (HEADLINE.length + i) * 70}ms` }}
            >
              {w}
              {i === 0 ? " " : ""}
            </span>
          ))}
        </h1>

        <p
          className="welcome-fade mt-6 max-w-xl text-balance text-lg text-muted-foreground sm:text-xl"
          style={{ animationDelay: "750ms" }}
        >
          One platform at a time, we&apos;re making our friends famous.
        </p>

        <div className="welcome-fade mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "900ms" }}>
          {signedIn ? (
            <Link href="/" className="landing-btn-primary h-12 px-6 text-sm">
              Open the app <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href="/welcome/request" className="landing-btn-primary h-12 px-6 text-sm">
                Request access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/signin" className="landing-btn-ghost h-12 px-6 text-sm">
                Sign in
              </Link>
            </>
          )}
        </div>

      </section>

      {/* Big number */}
      <section id="results" className="scroll-mt-24 px-6 py-24 sm:py-36">
        <div className="mx-auto max-w-4xl text-center" data-reveal>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-signal">
            Last 30 days
          </p>
          <p className="mt-4 bg-gradient-to-b from-chalk to-chalk/50 bg-clip-text text-7xl font-semibold tabular-nums tracking-[-0.04em] text-transparent sm:text-8xl md:text-[9rem] md:leading-none">
            <CountUp target={2_000_000} suffix="+" />
          </p>
          <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
            impressions across the community.
          </p>
        </div>
      </section>

      {/* Formats — sticky scroll */}
      <section id="formats" className="scroll-mt-24 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Three formats"
            title="From a draft to the feed, without opening a design tool."
            body="Write it however you write — usually with Claude and one of our skills. Viral turns it into the finished asset."
          />
          <FormatShowcase />
        </div>
      </section>

      {/* Post embeds */}
      <section className="relative px-6 py-24 sm:py-32">
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/85 to-transparent" />
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="From the wall"
            title="A few that hit."
            body="Real posts from the wall. We share what works, refine what doesn't, and ship the next one with what we learned."
          />
          <div className="grid gap-6 sm:grid-cols-2" data-reveal data-reveal-stagger>
            {POST_EMBEDS.map((src, i) => (
              <SpotlightCard key={src} className="p-1.5">
                {/* LinkedIn embeds are ~504px wide with variable
                  * height; a fixed-height flexible iframe fits every
                  * column width. */}
                <iframe
                  src={src}
                  loading="lazy"
                  className="block h-[600px] w-full rounded-[14px] border-0 bg-card"
                  allowFullScreen
                  title={`Embedded LinkedIn post ${i + 1}`}
                />
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* The loop — bento */}
      <section id="loop" className="scroll-mt-24 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="The loop"
            title="Built for people who post."
            body="We compress what works into a small private toolkit, share what we're shipping with each other, and pull everyone's metrics into one place so the loop tightens fast."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal data-reveal-stagger>
            {LOOP.map(({ icon: Icon, title, body, span }) => (
              <SpotlightCard key={title} className={`p-7 ${span}`}>
                <span className="mb-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-chalk transition-colors duration-300 group-hover:border-signal/40 group-hover:text-signal">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-32 pt-12">
        <div className="beam-border mx-auto max-w-4xl rounded-[28px]" data-reveal>
          <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[27px] bg-[#131211]/90 px-8 py-16 text-center backdrop-blur-xl sm:py-20">
            <div
              aria-hidden
              className="absolute -bottom-40 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-signal/20 blur-[100px]"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" aria-hidden className="relative h-10 w-10" />
            <h2 className="relative max-w-2xl text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              We&apos;re selective. If you ship, you&apos;re in.
            </h2>
            <p className="relative max-w-xl text-muted-foreground">
              Membership is referral-based. If a friend pointed you here,
              request access and we&apos;ll get back to you.
            </p>
            <Link
              href={signedIn ? "/" : "/welcome/request"}
              className="landing-btn-primary relative mt-2 h-12 px-7 text-sm"
            >
              {signedIn ? "Open the app" : "Request access"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="relative bg-background">
        <FlickeringFooter />
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mb-14 max-w-2xl" data-reveal>
      <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.24em] text-signal">{eyebrow}</p>
      <h2 className="text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
