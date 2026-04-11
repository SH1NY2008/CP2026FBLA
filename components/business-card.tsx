'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Bookmark, Clock, Navigation, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BusinessCardProps {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  ratingCount?: number;
  isOpen?: boolean;
  photoUrl?: string | null;
  priceLevel?: number;
  types: string[];
  distance?: number;
  lat: number;
  lng: number;
}

const PRICE_DISPLAY: Record<number, string> = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
};

const TYPE_GRADIENTS: Record<string, string> = {
  restaurant: 'from-orange-500/20 to-red-600/30',
  cafe: 'from-amber-500/20 to-orange-600/30',
  bar: 'from-purple-500/20 to-indigo-600/30',
  bakery: 'from-yellow-500/20 to-amber-600/30',
  store: 'from-blue-500/20 to-cyan-600/30',
  shopping_mall: 'from-sky-500/20 to-blue-600/30',
  supermarket: 'from-teal-500/20 to-green-600/30',
  bank: 'from-slate-500/20 to-zinc-600/30',
  gym: 'from-red-500/20 to-orange-600/30',
  pharmacy: 'from-emerald-500/20 to-green-600/30',
  movie_theater: 'from-indigo-500/20 to-purple-600/30',
  park: 'from-green-500/20 to-lime-600/30',
};

const TYPE_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  bar: '🍺',
  bakery: '🥐',
  store: '🛍️',
  shopping_mall: '🏬',
  supermarket: '🛒',
  bank: '🏦',
  gym: '💪',
  pharmacy: '💊',
  movie_theater: '🎬',
  park: '🌿',
  entertainment: '🎭',
};

export function BusinessCard({
  placeId,
  name,
  address,
  rating,
  ratingCount,
  isOpen,
  photoUrl,
  priceLevel,
  types,
  distance,
}: BusinessCardProps) {
  const [saved, setSaved] = useState(false);
  const categoryLabel = getCategoryLabel(types);
  const primaryType = types[0] || 'restaurant';
  const gradient = TYPE_GRADIENTS[primaryType] || 'from-zinc-500/20 to-neutral-600/30';
  const icon = TYPE_ICONS[primaryType] || '📍';

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&destination_place_id=${placeId}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 bg-card border border-border group h-full flex flex-col">
      {/* Image */}
      <Link href={`/business/${placeId}`} className="block shrink-0">
        {photoUrl ? (
          <div className="relative h-44 w-full bg-muted overflow-hidden">
            <Image
              src={photoUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : (
          <div
            className={`h-44 w-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
          >
            <span className="text-5xl opacity-70 select-none">{icon}</span>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_60%,rgba(0,0,0,0.15))]" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/business/${placeId}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-snug text-foreground line-clamp-1">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {categoryLabel}
              {address ? ` · ${address}` : ''}
            </p>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              setSaved(!saved);
            }}
            className={`shrink-0 p-1.5 rounded-lg transition-all duration-200 ${
              saved
                ? 'text-accent bg-accent/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            aria-label={saved ? 'Remove from saved' : 'Save'}
          >
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-accent' : ''}`} />
          </button>
        </div>

        {/* Decision metadata */}
        <div className="flex items-center gap-3 flex-wrap">
          {rating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
              <span className="font-semibold text-sm text-foreground">{rating.toFixed(1)}</span>
              {ratingCount !== undefined && (
                <span className="text-xs text-muted-foreground">({ratingCount})</span>
              )}
            </div>
          )}

          {isOpen !== undefined && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
              <span
                className={`text-xs font-medium ${isOpen ? 'text-green-500' : 'text-red-400'}`}
              >
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          )}

          {distance !== undefined && (
            <span className="text-xs text-muted-foreground">
              {distance < 1
                ? `${(distance * 1000).toFixed(0)} m`
                : `${distance.toFixed(1)} km`}
            </span>
          )}

          {priceLevel !== undefined && (
            <span className="text-xs font-medium text-muted-foreground ml-auto">
              {PRICE_DISPLAY[priceLevel]}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/business/${placeId}`}
            className="flex-1 text-center text-xs font-medium py-1.5 px-3 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            View details
          </Link>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg border border-border hover:bg-muted hover:border-accent/40 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Navigation className="h-3.5 w-3.5" />
            Directions
          </a>
        </div>
      </div>
    </Card>
  );
}

function getCategoryLabel(types: string[]): string {
  const categoryMap: Record<string, string> = {
    restaurant: 'Restaurant',
    cafe: 'Café',
    bar: 'Bar',
    bakery: 'Bakery',
    fast_food: 'Fast Food',
    store: 'Store',
    shopping_mall: 'Shopping Mall',
    supermarket: 'Supermarket',
    bank: 'Bank',
    gym: 'Gym',
    pharmacy: 'Pharmacy',
    hospital: 'Hospital',
    movie_theater: 'Cinema',
    park: 'Park',
    entertainment: 'Entertainment',
  };

  for (const type of types) {
    if (categoryMap[type]) return categoryMap[type];
  }
  return 'Business';
}
