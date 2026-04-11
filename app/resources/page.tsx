import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { ArrowRight, BookOpen, Lightbulb, TrendingUp, Heart, Map, Store } from 'lucide-react';

const GUIDES = [
  {
    icon: Heart,
    tag: 'Community',
    date: '04 Jan 2026',
    title: 'Welcome to 2026',
    description:
      "New year, new local gems to discover. Explore what's trending in your neighbourhood this season and how Boost is helping communities thrive.",
    href: '#',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
  {
    icon: TrendingUp,
    tag: 'Deals',
    date: '13 Jan 2026',
    title: 'Top Deals This Week',
    description:
      "Our best curated offers from local businesses across dining, retail, and services. Don't miss these limited-time discounts near you.",
    href: '/deals',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Heart,
    tag: 'Guide',
    date: '10 Feb 2026',
    title: 'Supporting Local: Why It Matters',
    description:
      "When you shop local, more money stays in your community. Here's how Boost helps connect people with the businesses that matter most.",
    href: '#',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    icon: Lightbulb,
    tag: 'Tips',
    date: '18 Feb 2026',
    title: 'Getting the Most from the AI Explorer',
    description:
      'The AI Explorer understands natural language. Learn how to ask better questions and unlock hyper-relevant local recommendations every time.',
    href: '/explore',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Map,
    tag: 'Feature',
    date: '02 Mar 2026',
    title: 'Plan the Perfect Day Out with Trip Planner',
    description:
      'Bookmark your favourite spots, then use the Trip Planner to build an optimised route. Switch between driving, walking, and cycling modes.',
    href: '/trip-planner',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Store,
    tag: 'For Owners',
    date: '20 Mar 2026',
    title: 'Claiming Your Business Listing on Boost',
    description:
      'A step-by-step guide for business owners on how to claim your listing, update your details, and start engaging with the community.',
    href: '/portal',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
];

const QUICK_LINKS = [
  { label: 'Browse local businesses', href: '/browse', desc: 'Find places near you on the map' },
  { label: 'AI Explorer', href: '/explore', desc: 'Ask anything in plain English' },
  { label: 'Current Deals', href: '/deals', desc: 'Exclusive offers from local spots' },
  { label: 'Trip Planner', href: '/trip-planner', desc: 'Build an optimised route' },
  { label: 'Business Portal', href: '/portal', desc: 'Claim and manage your listing' },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Guides & insights
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              Tools and guides to{' '}
              <span className="text-muted-foreground">support local</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed md:text-right">
              Tips, feature spotlights, and community stories to help you get the most from Boost.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Main grid */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GUIDES.map(({ icon: Icon, tag, date, title, description, href, color, bg }) => (
              <Link
                key={title}
                href={href}
                className="group bg-card border border-border/60 rounded-2xl p-7 flex flex-col gap-4 hover:border-border/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                    <span className="text-xs text-muted-foreground">{date}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-bold mb-1.5 group-hover:text-foreground transition-colors">
                    {title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors mt-auto">
                  <BookOpen className="w-3.5 h-3.5" />
                  Read more{' '}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Quick links
              </p>
              <div className="flex flex-col gap-3">
                {QUICK_LINKS.map(({ label, href, desc }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group flex items-start gap-3 hover:opacity-80 transition-opacity"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Stay updated
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get new guides and community highlights delivered monthly.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground/30 transition-colors"
                />
                <button className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold py-2.5 transition-colors">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-muted-foreground">No spam. Unsubscribe any time.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
