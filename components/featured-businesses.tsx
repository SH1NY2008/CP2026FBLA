'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useBusinesses } from '@/hooks/use-businesses';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { BusinessCard } from '@/components/business-card';

export function FeaturedBusinesses() {
  const { businesses, loading, error } = useBusinesses();

  const featured = businesses.slice(0, 4);

  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">Featured <br/> <span className="text-neutral-500">Businesses</span></h2>
        </div>
        <Button asChild variant="outline" className="hidden md:flex rounded-full border-neutral-700 hover:bg-neutral-900 hover:text-white group">
          <Link href="/browse">
            View All <ArrowUpRight className="ml-2 w-4 h-4 group-hover:rotate-45 transition-transform" />
          </Link>
        </Button>
      </div>

      {
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <BusinessCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((business) => (
              <BusinessCard key={business.placeId} {...business} />
            ))}
          </div>
        )
      }
      
      <div className="mt-16 flex justify-center md:hidden">
        <Button asChild variant="outline" className="rounded-full border-neutral-700 hover:bg-neutral-900 hover:text-white">
          <Link href="/browse">
            View All <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
