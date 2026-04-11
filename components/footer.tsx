'use client';

/* Site-wide footer: marquee band + columns. "About" points at dashboard for now — swap if you add a real about page. */
import Link from 'next/link';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Browse', href: '/browse' },
  { label: 'Deals', href: '/deals' },
  { label: 'Help', href: '/help' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/dashboard' },
  { label: 'Contact', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Mentions légales', href: '/legal' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Credits', href: '/credits' },
];

export function Footer() {
  return (
    <footer className="relative bg-background border-t border-border/50 overflow-hidden">
      {/* Scrolling marquee band */}
      <section className="py-14 border-b border-border/30 overflow-hidden">
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
            className="flex gap-20 items-center px-10"
          >
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="flex gap-20 text-6xl md:text-7xl font-black text-border/40 uppercase tracking-tighter select-none"
              >
                <span>Support Local</span>
                <span>Find Deals</span>
                <span>Community First</span>
                <span>Grow Together</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="font-black text-2xl text-foreground tracking-tight">
              BOOST
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Discover local gems, unlock exclusive deals, and support the heartbeat of your
              community.
            </p>
            <Link
              href="/contact"
              className="text-sm font-semibold text-foreground hover:underline underline-offset-4 mt-2 w-fit"
            >
              Talk to us →
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Navigation
            </p>
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Explore more
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We&apos;re here to help you find the best your city has to offer. Every week, new
              local spots, fresh deals, and community stories.
            </p>
            <Link
              href="/browse"
              className="text-sm font-semibold text-foreground hover:underline underline-offset-4 mt-1 w-fit"
            >
              Start exploring →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Byte-Sized Boost. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Giant background text */}
      <div className="w-full overflow-hidden leading-none select-none pointer-events-none flex justify-center">
        <h2 className="text-[22vw] font-black text-border/15 tracking-tighter text-center leading-[0.85] pb-4">
          BOOST
        </h2>
      </div>
    </footer>
  );
}
