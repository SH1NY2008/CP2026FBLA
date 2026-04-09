'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BusinessCard } from '@/components/business-card';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface Business {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  ratingCount?: number;
  isOpen?: boolean;
  photoUrl?: string | null;
  priceLevel?: number;
  types: string[];
  lat: number;
  lng: number;
  distance?: number;
}

export function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured businesses - in a real app, this would come from your backend
    const fetchFeatured = async () => {
      try {
        // Get user's location for featured businesses nearby
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `/api/places/nearby?lat=${latitude}&lng=${longitude}&radius=5000&type=restaurant`
            );

            if (response.ok) {
              const data = await response.json();
              // Get top 3 featured businesses
              const featured = (data.results || []).slice(0, 3);
              setBusinesses(featured);
            }
          });
        }
      } catch (error) {
        console.log('[v0] Error fetching featured businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">Featured Businesses</h2>
            <p className="text-muted-foreground">Discover our handpicked local favorites</p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="text-accent hover:text-accent hover:bg-secondary group"
          >
            <Link href="/browse">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Businesses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <BusinessCardSkeleton key={i} />
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard
                key={business.placeId}
                name={business.name}
                address={business.address}
                rating={business.rating}
                ratingCount={business.ratingCount}
                isOpen={business.isOpen}
                photoUrl={business.photoUrl}
                priceLevel={business.priceLevel}
                types={business.types}
                distance={business.distance}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Loading featured businesses...</p>
          </div>
        )}
      </div>
    </div>
  );
}
