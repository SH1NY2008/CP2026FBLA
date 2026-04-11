'use client';

import { useState, useEffect, useMemo } from 'react';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/header';
import { LocationTag } from '@/components/ui/location-tag';
import { LocationDetector } from '@/components/location-detector';
import { CountryBrowser } from '@/components/country-browser';
import { BusinessFilters } from '@/components/business-filters';
import { BusinessCard } from '@/components/business-card';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { TileMap } from '@/components/tile-map';
import { LocationEnvPanel } from '@/components/location-env-panel';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Clock,
  LayoutList,
  Map,
  Search,
  SlidersHorizontal,
  Store,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
}

const TYPE_MAP: Record<string, string> = {
  restaurant: 'restaurant',
  shopping: 'shopping_mall|store|supermarket',
  services: 'bank|gym|pharmacy|hospital|spa',
  entertainment: 'movie_theater|park|amusement_park',
};

type SortOption = 'distance' | 'rating' | 'price';
type ViewMode = 'list' | 'split';

export default function BrowsePage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state — synced from BusinessFilters via callbacks
  const [selectedCategory, setSelectedCategory] = useState('restaurant');
  const [radius, setRadius] = useState(5);
  const [selectedPrices, setSelectedPrices] = useState<number[]>([1, 2, 3, 4]);

  // Toolbar state — client-side
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [openNow, setOpenNow] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (location) {
      fetchBusinesses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, selectedCategory, radius, selectedPrices]);

  const fetchBusinesses = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);

    try {
      const placeType = TYPE_MAP[selectedCategory] || 'restaurant';
      const radiusInMeters = radius * 1609.34; // miles to meters

      const response = await fetch(
        `/api/places/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radiusInMeters}&type=${placeType}`
      );

      if (!response.ok) throw new Error('Failed to fetch businesses');

      const data = await response.json();
      if (data.status !== 'OK') throw new Error(data.error_message || 'No results found');

      const ratingsSnapshot = await getDocs(collection(db, 'businessRatings'));
      const firestoreRatings: Record<string, { rating: number; ratingCount: number }> = {};
      ratingsSnapshot.forEach((doc) => {
        firestoreRatings[doc.id] = doc.data() as { rating: number; ratingCount: number };
      });

      const processed = (data.results || [])
        .map((b: Business) => {
          const fr = firestoreRatings[b.placeId];
          return {
            ...b,
            rating: fr ? fr.rating : b.rating,
            ratingCount: fr ? fr.ratingCount : b.ratingCount,
            distance: calculateDistance(location.lat, location.lng, b.lat, b.lng),
          };
        })
        .filter((b: Business) => {
          if (!b.priceLevel) return true;
          return selectedPrices.includes(b.priceLevel);
        })
        .sort((a: Business, b: Business) => (a.distance || 0) - (b.distance || 0));

      setBusinesses(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const displayedBusinesses = useMemo(() => {
    let result = [...businesses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
      );
    }

    if (openNow) {
      result = result.filter((b) => b.isOpen === true);
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price':
        result.sort((a, b) => (a.priceLevel || 0) - (b.priceLevel || 0));
        break;
      default:
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return result;
  }, [businesses, searchQuery, openNow, sortBy]);

  const FiltersPanel = () => (
    <BusinessFilters
      onCategoryChange={setSelectedCategory}
      onRadiusChange={setRadius}
      onPriceChange={setSelectedPrices}
    />
  );

  const Toolbar = () => (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      {/* Mobile filter trigger */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden flex items-center gap-2 text-sm font-medium px-3 py-2 h-9 rounded-md border border-border hover:border-accent/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 pt-6">
          <SheetHeader className="px-5 pb-4 border-b border-border">
            <SheetTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="px-5 pt-5 overflow-y-auto">
            <FiltersPanel />
          </div>
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search results…"
          className="pl-8 h-9 text-sm"
        />
      </div>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className="h-9 text-sm px-3 rounded-md border border-border bg-background text-foreground cursor-pointer hover:border-accent/50 transition-colors"
      >
        <option value="distance">Nearest first</option>
        <option value="rating">Top rated</option>
        <option value="price">Price: low → high</option>
      </select>

      {/* Open now */}
      <button
        onClick={() => setOpenNow(!openNow)}
        className={`flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium border transition-all duration-200 ${
          openNow
            ? 'bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400'
            : 'border-border text-muted-foreground hover:text-foreground hover:border-accent/50'
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        Open now
        {openNow && <span className="h-1.5 w-1.5 rounded-full bg-green-500 ml-0.5" />}
      </button>

      {/* View toggle */}
      <div className="hidden sm:flex rounded-md border border-border overflow-hidden shrink-0">
        <button
          onClick={() => setViewMode('list')}
          title="List view"
          className={`px-2.5 py-2 text-sm transition-colors ${
            viewMode === 'list'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <LayoutList className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode('split')}
          title="Map view"
          className={`px-2.5 py-2 text-sm border-l border-border transition-colors ${
            viewMode === 'split'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Map className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const ResultsContent = ({ compact = false }: { compact?: boolean }) => (
    <>
      {!loading && businesses.length > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          Showing{' '}
          <span className="font-semibold text-foreground">{displayedBusinesses.length}</span>
          {displayedBusinesses.length !== businesses.length && (
            <> of {businesses.length}</>
          )}{' '}
          results
        </p>
      )}

      {loading && (
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <BusinessCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && displayedBusinesses.length === 0 && businesses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <Store className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">No businesses found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting the search radius or picking a different category.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && displayedBusinesses.length === 0 && businesses.length > 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="font-semibold text-foreground">No matches for your search</p>
          <p className="text-sm text-muted-foreground">Clear the search or toggle off "Open now".</p>
        </div>
      )}

      {!loading && displayedBusinesses.length > 0 && (
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {displayedBusinesses.map((business) => (
            <BusinessCard key={business.placeId} {...business} />
          ))}
        </div>
      )}
    </>
  );

  return (
    <main className="min-h-screen bg-background browse-theme">
      <Header />

      <Container className="max-w-7xl pt-28 pb-16">
        {/* Page header */}
        <div className="pt-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Find great spots near you
          </h1>
          <p className="text-muted-foreground text-sm">
            Discover restaurants, shops, services, and entertainment
          </p>
        </div>

        {/* Location setup */}
        {!location && (
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Where are you looking?
            </p>
            <LocationDetector onLocationFound={setLocation}>
              <CountryBrowser onLocationFound={setLocation} />
            </LocationDetector>
          </div>
        )}

        {location && (
          <div className="mb-8 flex items-center gap-3 flex-wrap">
            <LocationTag
              city={location.city}
              country={location.country}
              timezone={Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone.split('/')
                .pop()
                ?.replace('_', ' ')}
            />
            <LocationEnvPanel lat={location.lat} lng={location.lng} />
          </div>
        )}

        {/* Main content */}
        {location && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-start">

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-28">
                <div className="pb-3 mb-4 border-b border-border">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Filters
                  </h2>
                </div>
                <FiltersPanel />
              </div>
            </aside>

            {/* Results column */}
            <div className="flex-1 min-w-0">
              <Toolbar />

              {viewMode === 'list' && <ResultsContent />}

              {viewMode === 'split' && (
                <div className="flex flex-col lg:flex-row gap-5 lg:items-start">
                  <div className="flex-1 min-w-0">
                    <ResultsContent compact />
                  </div>
                  <div className="hidden sm:block lg:w-[44%] lg:sticky lg:top-28">
                    <TileMap
                      lat={location.lat}
                      lng={location.lng}
                      businesses={displayedBusinesses}
                      className="h-[calc(100vh-8rem)] min-h-[500px]"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </Container>
    </main>
  );
}
