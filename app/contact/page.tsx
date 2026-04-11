'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CONTACT_OPTIONS = [
  {
    icon: MessageSquare,
    title: 'General Enquiries',
    description: 'Questions about how Boost works, features, or anything else.',
    action: 'hello@boost.local',
  },
  {
    icon: Building2,
    title: 'Business Owners',
    description: 'Claim your listing, update your profile, or get help with the portal.',
    action: 'business@boost.local',
  },
  {
    icon: Mail,
    title: 'Press & Partnerships',
    description: 'Media requests, partnership opportunities, and collaboration ideas.',
    action: 'press@boost.local',
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Get in touch
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-4">
            We&apos;d love to{' '}
            <span className="text-muted-foreground">hear from you</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
            Whether you&apos;re a curious explorer, a local business owner, or just want to say hi — reach out and we&apos;ll get back to you quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Contact form */}
          <div className="lg:col-span-3 bg-card border border-border/60 rounded-2xl p-8">
            <h2 className="text-lg font-bold mb-6">Send a message</h2>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    First name
                  </label>
                  <input
                    type="text"
                    placeholder="Alex"
                    className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last name
                  </label>
                  <input
                    type="text"
                    placeholder="Smith"
                    className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subject
                </label>
                <select className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground/30 transition-colors">
                  <option value="">Select a topic…</option>
                  <option value="general">General enquiry</option>
                  <option value="business">Business owner support</option>
                  <option value="bug">Report a bug</option>
                  <option value="press">Press &amp; partnerships</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us what's on your mind…"
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground/30 transition-colors resize-none"
                />
              </div>
              <Button
                type="submit"
                className="rounded-xl bg-foreground text-background hover:bg-foreground/90 h-11 font-semibold mt-1"
              >
                Send message <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {CONTACT_OPTIONS.map(({ icon: Icon, title, description, action }) => (
              <div
                key={title}
                className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
                <a
                  href={`mailto:${action}`}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {action}
                </a>
              </div>
            ))}

            <div className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Quick links
              </p>
              {[
                { label: 'Browse local businesses', href: '/browse' },
                { label: 'Try the AI Explorer', href: '/explore' },
                { label: 'View current deals', href: '/deals' },
                { label: 'Claim your business', href: '/portal' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
