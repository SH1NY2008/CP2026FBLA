'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AnimatedMarquee } from '@/components/animated-marquee';
import { FeaturedBusinesses } from '@/components/featured-businesses';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Search, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden px-4">
        <div
          className="z-10 text-center max-w-5xl mx-auto"
        >
          <h1
            className="text-[12vw] leading-[0.9] font-bold tracking-tighter uppercase mb-6 mix-blend-difference"
          >
            Business
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-600">Boost</span>
          </h1>
          
          <p
            className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 font-light"
          >
            Discover local gems, unlock exclusive deals, and support the heartbeat of your community.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <div className="relative group w-full sm:w-auto">
              <Input
                placeholder="Search businesses..."
                className="h-12 w-full sm:w-80 bg-neutral-900/50 border-neutral-800 text-white rounded-full px-6 focus:ring-1 focus:ring-white transition-all duration-300"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            </div>
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-neutral-200 h-12 px-8 font-medium">
              Explore Map
            </Button>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-900 to-blue-900 rounded-full blur-[120px]" />
        </div>
        
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-neutral-500 to-transparent" />
        </div>
      </section>

      {/* Marquee Section */}
      <AnimatedMarquee />

      {/* Featured Businesses Section */}
      <FeaturedBusinesses />



      {/* Footer */}
      <Footer />
    </main>
  );
}
