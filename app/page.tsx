'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FeaturedBusinesses } from '@/components/featured-businesses';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Tag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

function FloatingPaths({ position }: { position: number }) {
  const paths = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
        duration: 20 + ((i * 17 + position * 5) % 10) + (i % 3) * 0.25,
      })),
    [position],
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-white" viewBox="0 0 696 316" fill="none">
        <title>Background</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.03 + path.id * 0.01}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
            transition={{ duration: path.duration, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </svg>
    </div>
  );
}

const MISSION_ITEMS = [
  {
    icon: MapPin,
    title: 'Effortless Discovery',
    description:
      'Complete transparency — the right info to understand every business around you, with smart filters to find exactly what you need.',
  },
  {
    icon: Tag,
    title: 'Exclusive Deals',
    description:
      'Online tools and a streamlined experience built for deal-hunters and community supporters of today.',
  },
  {
    icon: Users,
    title: 'Community First',
    description:
      "At Boost, our values go beyond a simple directory. Our community is 100% with you — available, engaged, and aligned with your vision.",
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Personalised Location Discovery',
    description:
      'Boost detects your neighborhood automatically and surfaces the businesses closest to you. No manual setup needed.',
  },
  {
    number: '02',
    title: 'Browse & Filter with Confidence',
    description:
      'Explore restaurants, shops, services and entertainment with powerful filters. Every listing is verified and current.',
  },
  {
    number: '03',
    title: 'Unlock Exclusive Deals',
    description:
      'Finding a great deal starts with knowing where to look. Our team curates the best local offers right in your feed.',
  },
  {
    number: '04',
    title: 'Reviews to Help You Decide',
    description:
      'Community ratings and in-depth reviews give you the confidence to walk through the door from day one.',
  },
];

const RESOURCES = [
  {
    tag: 'Community',
    date: '04/01/2026',
    title: 'Welcome to 2026',
    description:
      "New year, new local gems to discover. See what's trending in your neighborhood this season.",
    href: '/resources',
  },
  {
    tag: 'Deals',
    date: '13/01/2026',
    title: 'Top Deals This Week',
    description:
      "Our best curated offers from local businesses — don't miss these limited-time discounts near you.",
    href: '/deals',
  },
  {
    tag: 'Guide',
    date: '10/02/2026',
    title: 'Supporting Local: Why It Matters',
    description:
      "When you shop local, more money stays in your community. Here's how Boost helps make a real difference.",
    href: '/resources',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background pt-16">
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6"
          >
            Discover with confidence
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.92] mb-8"
          >
            Local Business Discovery{' '}
            <span className="text-muted-foreground">without the hassle</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Boost does more than help you find great local spots. We connect you with exclusive
            deals, community reviews, and tools to support the businesses that make your
            neighborhood unique.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full w-52 h-14 text-base font-semibold !bg-white !text-black hover:!bg-white/90 !border-0 !shadow-none"
            >
              <Link href="/browse">I&apos;m Exploring</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full w-52 h-14 text-base font-semibold border-border hover:bg-secondary"
            >
              <Link href="/signup">List My Business</Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-border/50 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-muted-foreground/60" />
          </motion.div>
        </div>
      </section>

      {/* ── MISSION ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Your neighborhood, our mission
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1]">
              Beyond the simple listing:{' '}
              <span className="text-muted-foreground">our commitment</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MISSION_ITEMS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-card border border-border/60 rounded-2xl p-8 flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Simple from start to finish
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1]">
              A winner&apos;s journey.{' '}
              <span className="text-muted-foreground">Not a warrior&apos;s.</span>
            </h2>
            <Button
              asChild
              variant="outline"
              className="hidden md:flex rounded-full border-border self-end"
            >
              <Link href="/browse">
                Discover the concept <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STEPS.map(({ number, title, description }) => (
              <div
                key={number}
                className="bg-card border border-border/60 rounded-2xl p-8 flex flex-col gap-4"
              >
                <span className="text-6xl font-black text-border/60 leading-none">{number}</span>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT CTA ──────────────────────────────────────────────────── */}
      <section className="py-8 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/browse"
            className="group bg-card border border-border/60 rounded-2xl p-12 flex flex-col gap-6 hover:border-border/80 transition-all"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Explore
            </p>
            <h3 className="text-3xl font-black tracking-tight leading-tight">
              Ready to discover
              <br />
              your neighborhood?
            </h3>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Find Businesses{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/signup"
            className="group bg-foreground text-background rounded-2xl p-12 flex flex-col gap-6 hover:bg-foreground/95 transition-all"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-background/50">
              For Businesses
            </p>
            <h3 className="text-3xl font-black tracking-tight leading-tight">
              Want to become
              <br />a local favorite?
            </h3>
            <div className="flex items-center gap-2 text-sm font-semibold text-background/70 group-hover:text-background transition-colors">
              List My Business{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── FEATURED BUSINESSES ────────────────────────────────────────── */}
      <div className="border-t border-border/50">
        <FeaturedBusinesses />
      </div>

      {/* ── RESOURCES ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            A community of local explorers
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1]">
              Let the{' '}
              <span className="text-muted-foreground">local shine</span>
            </h2>
            <Button
              asChild
              variant="outline"
              className="hidden md:flex rounded-full border-border self-end"
            >
              <Link href="/resources">
                All Resources <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {RESOURCES.map(({ tag, date, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group bg-card border border-border/60 rounded-2xl p-8 flex flex-col gap-4 hover:border-border/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{date}</span>
                </div>
                <h3 className="text-xl font-bold group-hover:text-foreground transition-colors">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {description}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  Read more{' '}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-t border-border/50 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Stay in the loop
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            Every month, our best tips and upcoming events.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-card border border-border rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
            />
            <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 shrink-0">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">No spam. Unsubscribe at any time.</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
