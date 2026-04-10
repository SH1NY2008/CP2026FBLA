'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AnimatedMarquee } from '@/components/animated-marquee';
import { FeaturedBusinesses } from '@/components/featured-businesses';
import { BackgroundPaths } from '@/components/ui/background-paths';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <BackgroundPaths />

      {/* Marquee Section */}
      <AnimatedMarquee />

      {/* Featured Businesses Section */}
      <FeaturedBusinesses />

      {/* Footer */}
      <Footer />
    </main>
  );
}
