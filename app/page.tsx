'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AnimatedMarquee } from '@/components/animated-marquee';
import { FeaturedBusinesses } from '@/components/featured-businesses';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Search, ArrowDown } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">


        <div className="max-w-5xl text-center">
          {/* Headline - stacked BUSINESS BOOST */}
          <h1 className="mb-8">
            <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight text-foreground">
              BUSINESS
            </div>
            <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight text-neutral-600 mt-2">
              BOOST
            </div>
          </h1>

          {/* Tagline */}
          <p className="text-base md:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover local gems, unlock exclusive deals, and support the heartbeat of your community.
          </p>

          {/* Search Bar and Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto mb-16">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search businesses..."
                className="w-full pl-14 pr-6 py-4 bg-transparent border-2 border-neutral-800 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-neutral-200 text-black rounded-full px-8 font-medium whitespace-nowrap"
            >
              <Link href="/browse">
                Explore Map
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
          <span className="text-sm tracking-widest">SCROLL TO EXPLORE</span>
          <ArrowDown className="h-5 w-5" />
        </div>
      </section>

      {/* Marquee Section */}
      <AnimatedMarquee />



      {/* Footer */}
      <Footer />
    </main>
  );
}
