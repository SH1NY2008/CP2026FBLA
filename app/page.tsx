'use client';

/**
 * Marketing landing: hero, feature grid, how-it-works, featured businesses (live data),
 * AI Explorer callout, resources, newsletter. Heavy Framer Motion here — keep sections in order for demos.
 */
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FeaturedBusinesses } from '@/components/featured-businesses';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  Tag,
  Users,
  Sparkles,
  Route,
  Store,
  Search,
  SlidersHorizontal,
  Map,
  Star,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

/* Decorative SVG lines behind the hero — cheap to render, reads as "motion" without loading video. */
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

/* Each card links to a real route — tags are just for visual grouping in the grid. */
const FEATURES = [
  {
    icon: Search,
    label: 'Browse',
    href: '/browse',
    title: 'Smart Local Search',
    description:
      'Detect your location automatically and filter businesses by category, distance, and rating. Toggle between list view and a live split map.',
    tag: 'Core',
    tagColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Sparkles,
    label: 'AI Explorer',
    href: '/explore',
    title: 'Natural Language Discovery',
    description:
      'Ask anything in plain English — "cozy cafes with wifi nearby" — and get AI-curated answers grounded in real Google Maps data.',
    tag: 'AI-Powered',
    tagColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  },
  {
    icon: Tag,
    label: 'Deals',
    href: '/deals',
    title: 'Exclusive Local Offers',
    description:
      'Browse hand-curated deals from local businesses across dining, retail, and services. Save offers to your dashboard to redeem later.',
    tag: 'Deals',
    tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  {
    icon: Route,
    label: 'Trip Planner',
    href: '/trip-planner',
    title: 'Optimised Route Builder',
    description:
      'Add bookmarked places as stops and let Boost calculate the fastest route. Switch between driving, walking, and cycling modes.',
    tag: 'Planning',
    tagColor: 'text-green-400 bg-green-400/10 border-green-400/20',
  },
  {
    icon: Store,
    label: 'Business Portal',
    href: '/portal',
    title: 'Claim & Manage Your Listing',
    description:
      'Business owners can claim their place, update details, and engage with the community directly from the portal dashboard.',
    tag: 'For Owners',
    tagColor: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  },
  {
    icon: Star,
    label: 'Reviews',
    href: '/browse',
    title: 'Community Ratings',
    description:
      'Real ratings and in-depth community reviews on every business profile, aggregated from Google and local contributors.',
    tag: 'Community',
    tagColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  },
];

const HOW_IT_WORKS = [
  {
    number: '01',
    icon: MapPin,
    title: 'Detect Your Location',
    description:
      'Boost pinpoints your neighbourhood automatically. Browse businesses nearby or search any area in the world.',
  },
  {
    number: '02',
    icon: SlidersHorizontal,
    title: 'Filter & Explore',
    description:
      'Narrow results by category, distance, and rating. Use the split map to see exactly where each place is.',
  },
  {
    number: '03',
    icon: Compass,
    title: 'Ask the AI Explorer',
    description:
      'Too many results? Just ask naturally — the AI Explorer surfaces the best matches with context and citations.',
  },
  {
    number: '04',
    icon: Map,
    title: 'Plan Your Visit',
    description:
      'Bookmark favourites, grab exclusive deals, then build a route in the Trip Planner for your next outing.',
  },
];

const RESOURCES = [
  {
    tag: 'Community',
    date: '04/01/2026',
    title: 'Welcome to 2026',
    description:
      "New year, new local gems to discover. See what's trending in your neighbourhood this season.",
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
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Browse nearby places on a live map, ask the AI Explorer in plain English, grab
            exclusive local deals, and plan optimised routes — all in one place.
          </motion.p>

          <motion.div
            data-tour="tour-hero-ctas"
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
              <Link href="/browse">Start Exploring</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full w-52 h-14 text-base font-semibold border-border hover:bg-secondary"
            >
              <Link href="/portal">List My Business</Link>
            </Button>
          </motion.div>

          {/* Quick feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-wrap justify-center gap-2 mt-10"
          >
            {[
              { label: 'Browse & Map', href: '/browse' },
              { label: 'AI Explorer', href: '/explore' },
              { label: 'Deals', href: '/deals' },
              { label: 'Trip Planner', href: '/trip-planner' },
              { label: 'Business Portal', href: '/portal' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-border/50 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-muted-foreground/60" />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Everything in one place
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1]">
              Six tools that work{' '}
              <span className="text-muted-foreground">together</span>
            </h2>
            <Button
              asChild
              variant="outline"
              className="hidden md:flex rounded-full border-border self-end shrink-0"
            >
              <Link href="/browse">
                Open the app <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div
            data-tour="tour-feature-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map(({ icon: Icon, label, href, title, description, tag, tagColor }) => (
              <Link
                key={label}
                href={href}
                className="group bg-card border border-border/60 rounded-2xl p-7 flex flex-col gap-4 hover:border-border/80 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${tagColor}`}>
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1.5">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors mt-auto">
                  Go to {label} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Simple from start to finish
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1]">
              From open to visiting,{' '}
              <span className="text-muted-foreground">in four steps.</span>
            </h2>
            <Button
              asChild
              variant="outline"
              className="hidden md:flex rounded-full border-border self-end shrink-0"
            >
              <Link href="/browse">
                Try it now <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HOW_IT_WORKS.map(({ number, icon: Icon, title, description }) => (
              <div
                key={number}
                className="bg-card border border-border/60 rounded-2xl p-7 flex gap-5"
              >
                <span className="text-5xl font-black text-border/50 leading-none shrink-0 w-12">{number}</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-lg font-bold">{title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT CTA ──────────────────────────────────────────────────── */}
      <section className="py-6 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/browse"
            className="group bg-card border border-border/60 rounded-2xl p-10 flex flex-col gap-5 hover:border-border/80 transition-all"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              For Explorers
            </p>
            <h3 className="text-3xl font-black tracking-tight leading-tight">
              Ready to discover
              <br />
              your neighbourhood?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Browse on a live map, use the AI Explorer, save deals, and plan trips with bookmarks.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Find Businesses{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/portal"
            className="group bg-foreground text-background rounded-2xl p-10 flex flex-col gap-5 hover:bg-foreground/95 transition-all"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-background/50">
              For Business Owners
            </p>
            <h3 className="text-3xl font-black tracking-tight leading-tight">
              Want to become
              <br />a local favourite?
            </h3>
            <p className="text-sm text-background/60 leading-relaxed max-w-xs">
              Claim your listing on the portal, update your info, and connect with community members.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-background/70 group-hover:text-background transition-colors">
              Go to Portal{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── FEATURED BUSINESSES ────────────────────────────────────────── */}
      <div className="border-t border-border/50">
        <FeaturedBusinesses />
      </div>

      {/* ── AI EXPLORE CALLOUT ─────────────────────────────────────────── */}
      <section className="py-8 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/explore"
            className="group block bg-card border border-border/60 rounded-2xl p-10 hover:border-border/80 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-2xl font-black tracking-tight">AI Explorer</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border text-purple-400 bg-purple-400/10 border-purple-400/20">
                    New
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                  Ask anything in plain English — <span className="text-foreground">"best date night restaurants with outdoor seating"</span> — and get AI-curated answers grounded in real Google Maps data with clickable citations.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                Try AI Explorer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── RESOURCES ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            A community of local explorers
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1]">
              Let the{' '}
              <span className="text-muted-foreground">local shine</span>
            </h2>
            <Button
              asChild
              variant="outline"
              className="hidden md:flex rounded-full border-border self-end shrink-0"
            >
              <Link href="/resources">
                All Resources <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESOURCES.map(({ tag, date, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group bg-card border border-border/60 rounded-2xl p-7 flex flex-col gap-4 hover:border-border/80 transition-all"
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
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card border border-border/60 rounded-2xl p-10 md:p-14 flex flex-col md:flex-row md:items-center gap-10">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Stay in the loop
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-3">
                Every month, our best tips and upcoming events.
              </h2>
              <p className="text-sm text-muted-foreground">No spam. Unsubscribe at any time.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:w-96 shrink-0">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-background border border-border rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
              />
              <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
