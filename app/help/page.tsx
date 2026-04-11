'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { InteractiveHelpQA } from '@/components/interactive-help-qa';

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Support
        </p>
        <h1 className="text-4xl font-black tracking-tighter mb-3">Help centre</h1>
        <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
          Ask in plain language — we&apos;ll match the closest answer from our guide.
        </p>
        <InteractiveHelpQA />
      </div>
      <Footer />
    </main>
  );
}
