'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { ArrowUpRight, Coffee, MapPin, ShoppingBag, Sparkles, Star, Store, Utensils } from 'lucide-react';
import { useBusinesses } from '@/hooks/use-businesses';
import { cn } from '@/lib/utils';

const BENTO_ICONS = [MapPin, Store, Utensils, Coffee, ShoppingBag, Sparkles, Star] as const;

/** Same image band height for every bento cell (1-col and 2-col wide). */
const BENTO_IMAGE_HEIGHT = 'h-48 sm:h-52 md:h-56';

function BentoHeader({ photoUrl, name }: { photoUrl?: string | null; name: string }) {
  if (photoUrl) {
    return (
      <div
        className={cn(
          'relative w-full shrink-0 overflow-hidden rounded-xl bg-muted',
          BENTO_IMAGE_HEIGHT,
        )}
      >
        <Image
          src={photoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        'w-full shrink-0 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800',
        BENTO_IMAGE_HEIGHT,
      )}
    />
  );
}

function BentoSkeleton() {
  return (
    <div
      className={cn(
        'w-full shrink-0 animate-pulse rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800',
        BENTO_IMAGE_HEIGHT,
      )}
    />
  );
}

export function FeaturedBusinesses() {
  const { businesses, loading, error } = useBusinesses();
  const featured = businesses.slice(0, 7);

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Our picks of the moment
      </p>
      <div className="flex justify-between items-end mb-20">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1]">
          Featured{' '}
          <span className="text-muted-foreground">Businesses</span>
        </h2>
        <Button
          asChild
          variant="outline"
          className="hidden md:flex rounded-full border-border hover:bg-secondary group"
        >
          <Link href="/browse">
            View All{' '}
            <ArrowUpRight className="ml-2 w-4 h-4 group-hover:rotate-45 transition-transform" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <BentoGrid className="max-w-5xl mx-auto">
          {Array.from({ length: 7 }).map((_, i) => (
            <BentoGridItem
              key={i}
              className={i === 3 || i === 6 ? 'md:col-span-2' : ''}
              header={<BentoSkeleton />}
              icon={<MapPin className="h-4 w-4 text-neutral-500" />}
              title="Loading…"
              description="Fetching nearby places"
            />
          ))}
        </BentoGrid>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : featured.length === 0 ? (
        <p className="text-center text-neutral-500">No businesses found nearby. Try browsing all listings.</p>
      ) : (
        <BentoGrid className="max-w-5xl mx-auto">
          {featured.map((business, i) => {
            const Icon = BENTO_ICONS[i % BENTO_ICONS.length];
            const description = [
              business.address,
              business.rating != null ? `★ ${business.rating.toFixed(1)}` : null,
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <Link
                key={business.placeId}
                href={`/business/${business.placeId}`}
                className={cn(
                  'block h-full min-h-0 min-w-0',
                  (i === 3 || i === 6) && 'md:col-span-2',
                )}
              >
                <BentoGridItem
                  className="h-full cursor-pointer hover:border-neutral-300 dark:hover:border-white/30"
                  title={business.name}
                  description={description}
                  header={<BentoHeader photoUrl={business.photoUrl} name={business.name} />}
                  icon={<Icon className="h-4 w-4 text-neutral-500" />}
                />
              </Link>
            );
          })}
        </BentoGrid>
      )}

      <div className="mt-16 flex justify-center md:hidden">
        <Button
          asChild
          variant="outline"
          className="rounded-full border-border hover:bg-secondary"
        >
          <Link href="/browse">
            View All <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
