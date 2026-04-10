'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Star } from 'lucide-react';
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
}

const PRICE_DISPLAY = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
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
  const categoryLabel = getCategoryLabel(types);

  return (
    <Link href={`/business/${placeId}`} className="block">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-accent bg-card border border-border group cursor-pointer h-full">
        {/* Image */}
        {photoUrl ? (
          <div className="relative h-48 w-full bg-muted overflow-hidden">
            <Image
              src={photoUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div>
            <h3 className="font-semibold text-lg leading-tight text-balance mb-1 text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>

          {/* Category Badge */}
          {categoryLabel && (
            <Badge variant="secondary" className="w-fit bg-secondary text-foreground">
              {categoryLabel}
            </Badge>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-sm">
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                {ratingCount && (
                  <span className="text-muted-foreground">({ratingCount})</span>
                )}
              </div>
            )}

            {priceLevel && (
              <div className="font-medium text-foreground">
                {PRICE_DISPLAY[priceLevel as keyof typeof PRICE_DISPLAY]}
              </div>
            )}

            {distance && (
              <div className="text-muted-foreground">
                {distance.toFixed(1)} km away
              </div>
            )}

            {isOpen !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span
                  className={isOpen ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}
                >
                  {isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function getCategoryLabel(types: string[]): string {
  const categoryMap: { [key: string]: string } = {
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
    if (categoryMap[type]) {
      return categoryMap[type];
    }
  }

  return 'Business';
}
