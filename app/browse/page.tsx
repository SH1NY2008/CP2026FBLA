'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LocationDetector } from '@/components/location-detector';
import { BusinessFilters } from '@/components/business-filters';
import { BusinessCard } from '@/components/business-card';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
}

const TYPE_MAP: { [key: string]: string } = {
  restaurant: 'restaurant',
  shopping: 'shopping_mall|store|supermarket',
  services: 'bank|gym|pharmacy|hospital|spa',
  entertainment: 'movie_theater|park|amusement_park',
};

export default function BrowsePage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('restaurant');
  const [radius, setRadius] = useState(5);
  const [selectedPrices, setSelectedPrices] = useState<number[]>([1, 2, 3, 4]);

  // Fetch businesses when location or filters change
  useEffect(() => {
    if (location) {
      fetchBusinesses();
    }
  }, [location, selectedCategory, radius, selectedPrices]);

  const fetchBusinesses = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const placeType = TYPE_MAP[selectedCategory] || 'restaurant';
      const radiusInMeters = radius * 1000;

      const response = await fetch(
        `/api/places/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radiusInMeters}&type=${placeType}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(data.error_message || 'No results found');
      }

      // Calculate distances and filter by price
      const processedBusinesses = (data.results || [])
        .map((business: Business) => ({
          ...business,
          distance: calculateDistance(
            location.lat,
            location.lng,
            business.lat,
            business.lng
          ),
        }))
        .filter((business: Business) => {
          // Filter by selected price levels
          if (!business.priceLevel) return true;
          return selectedPrices.includes(business.priceLevel);
        })
        .sort((a: Business, b: Business) => (a.distance || 0) - (b.distance || 0));

      setBusinesses(processedBusinesses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch businesses';
      setError(errorMessage);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <Container className="max-w-7xl pt-28 pb-16">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-balance mb-3 text-foreground">Browse Local Businesses</h1>
          <p className="text-lg text-muted-foreground">Find restaurants, shops, services, and entertainment venues near you</p>
        </div>

        {/* Location Detection */}
        {!location && (
          <div className="mb-8 max-w-2xl">
            <LocationDetector
              onLocationFound={(lat, lng, address) => {
                setLocation({ lat, lng, address });
              }}
            />
          </div>
        )}

        {/* Location Display */}
        {location && (
          <div className="mb-8 p-4 bg-secondary border border-border rounded-lg">
            <p className="text-sm font-medium text-foreground">
              📍 Showing results near: <span className="text-accent font-semibold">{location.address}</span>
            </p>
          </div>
        )}

        {/* Main Content */}
        {location && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <BusinessFilters
                onCategoryChange={setSelectedCategory}
                onRadiusChange={setRadius}
                onPriceChange={setSelectedPrices}
              />
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {loading && (
                <>
                  <p className="text-sm font-medium text-muted-foreground mb-4">Loading businesses...</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <BusinessCardSkeleton key={i} />
                    ))}
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive" className="bg-red-950 border-red-900">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              {!loading && businesses.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-foreground text-lg font-medium mb-2">No businesses found</p>
                  <p className="text-muted-foreground">Try adjusting your search radius or filters to find more results.</p>
                </div>
              )}

              {!loading && businesses.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-6">
                    Found <span className="text-accent font-semibold">{businesses.length}</span> results
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              )}
            </div>
          </div>
        )}
      </Container>

      <Footer />
    </main>
  );
}
