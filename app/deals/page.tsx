'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Container } from '@/components/ui/container';
import { LocationDetector } from '@/components/location-detector';
import { DealCard } from '@/components/deal-card';
import { LocationTag } from '@/components/ui/location-tag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  RefreshCw,
  Search,
  Tag,
} from 'lucide-react';
import type { Deal, Business } from '@/lib/data';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
}

function DealsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/40 bg-card p-5 space-y-3 animate-pulse"
        >
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-6 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-10 bg-muted rounded w-full" />
        </div>
      ))}
    </div>
  );
}

export default function DealsPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sources, setSources] = useState<{ groupon: number; reddit: number } | null>(null);

  const fetchDeals = async (loc: Location) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: String(loc.lat),
        lng: String(loc.lng),
        city: loc.city || loc.address,
      });
      const res = await fetch(`/api/deals?${params}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setDeals(data.deals ?? []);
      setBusinesses(data.businesses ?? []);
      setSources(data.sources ?? null);
    } catch {
      setError('Could not load deals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) fetchDeals(location);
  }, [location]);

  const handleLocationFound = (loc: Location) => {
    setLocation(loc);
  };

  const filteredDeals = deals.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const biz = businesses.find((b) => b.id === d.businessId);
    return (
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      (biz?.name ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-background">
        <Header />
        <Container className="max-w-7xl pt-28 pb-16 space-y-8">

          {/* Hero */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Local Deals
            </h1>
            <p className="text-muted-foreground text-lg">
              Discounts and offers from businesses near you
            </p>
          </div>

          {/* Location picker */}
          {!location ? (
            <div className="max-w-xl mx-auto">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Set your location to find deals nearby
              </p>
              <LocationDetector onLocationFound={handleLocationFound} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Location bar */}
              <div className="flex flex-wrap items-center gap-3">
                <LocationTag
                  city={location.city}
                  address={location.address}
                  country={location.country}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocation(null);
                    setDeals([]);
                    setBusinesses([]);
                    setSources(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Change location
                </Button>
                {!loading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchDeals(location)}
                    className="text-muted-foreground hover:text-foreground ml-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                    Refresh
                  </Button>
                )}
              </div>

              {/* Search + source info */}
              {!loading && deals.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search deals..."
                      className="pl-9"
                    />
                  </div>
                  {sources && (
                    <p className="text-xs text-muted-foreground shrink-0">
                      {sources.groupon > 0 && (
                        <span className="mr-3">{sources.groupon} from Groupon</span>
                      )}
                      {sources.reddit > 0 && (
                        <span>{sources.reddit} community posts</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading */}
              {loading && <DealsSkeleton />}

              {/* Results */}
              {!loading && filteredDeals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDeals.map((deal) => {
                    const biz = businesses.find((b) => b.id === deal.businessId);
                    return (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        business={biz}
                        showBusiness
                      />
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && filteredDeals.length === 0 && deals.length > 0 && (
                <div className="text-center py-16 text-muted-foreground space-y-2">
                  <Search className="h-8 w-8 mx-auto opacity-30" />
                  <p>No deals match your search.</p>
                </div>
              )}

              {!loading && !error && deals.length === 0 && (
                <div className="text-center py-16 text-muted-foreground space-y-3">
                  <Tag className="h-10 w-10 mx-auto opacity-20" />
                  <p className="font-medium">No deals found near {location.city || 'your location'}</p>
                  <p className="text-sm">Try refreshing or check back later.</p>
                  <Button variant="outline" onClick={() => fetchDeals(location)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try again
                  </Button>
                </div>
              )}
            </div>
          )}
        </Container>
      </main>
  );
}
