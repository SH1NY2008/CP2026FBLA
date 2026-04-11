'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Store,
  ArrowRight,
  Loader2,
  MapPin,
  Star,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getBusinessesOwnedBy,
  claimBusiness,
  getClaimedBusiness,
  type ClaimedBusiness,
} from '@/lib/business-portal';

interface SearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  types: string[];
  opening_hours?: { open_now: boolean };
}

export default function PortalPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<ClaimedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimOpen, setClaimOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getBusinessesOwnedBy(user.uid)
      .then(setBusinesses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/places/nearby?query=${encodeURIComponent(searchQuery)}&type=establishment`);
      const data = await res.json();
      setSearchResults(data.results?.slice(0, 8) ?? []);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleClaim = async (place: SearchResult) => {
    if (!user) return;
    setClaiming(place.place_id);
    try {
      const existing = await getClaimedBusiness(place.place_id);
      if (existing) {
        toast.error('This business has already been claimed');
        setClaiming(null);
        return;
      }
      await claimBusiness(place.place_id, user.uid, user.email ?? '');
      toast.success(`"${place.name}" claimed successfully!`);
      setClaimOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      const updated = await getBusinessesOwnedBy(user.uid);
      setBusinesses(updated);
    } catch {
      toast.error('Failed to claim business');
    } finally {
      setClaiming(null);
    }
  };

  if (!user && !loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <Container className="max-w-4xl pt-32 pb-16 text-center">
          <div className="p-4 rounded-full bg-muted inline-flex mb-6">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Business Portal
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Claim your business, manage your presence, engage with customers, and grow.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            Sign In to Get Started
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-6xl pt-28 pb-16">
        {/* Header */}
        <div className="pt-6 mb-10 border-b border-border/50 pb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Business Portal
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1] mb-2">
                Your <span className="text-muted-foreground">Businesses</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your listings, deals, events, and analytics
              </p>
            </div>
            <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-full px-5">
                  <Plus className="h-4 w-4" />
                  Claim a Business
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Claim Your Business</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mb-4">
                  Search for your business to claim and manage it.
                </p>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search business name or address…"
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={searching} size="sm" className="gap-1.5 shrink-0">
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Search
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {searchResults.map((place) => (
                    <div
                      key={place.place_id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{place.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{place.formatted_address}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5"
                        disabled={claiming === place.place_id}
                        onClick={() => handleClaim(place)}
                      >
                        {claiming === place.place_id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Claim
                      </Button>
                    </div>
                  ))}
                  {searchResults.length === 0 && searchQuery && !searching && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No results. Try a different search.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* Business cards */}
        {!loading && businesses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.map((biz) => (
              <BusinessOwnerCard key={biz.placeId} business={biz} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && businesses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-5 rounded-full bg-muted mb-4">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No businesses yet</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Claim your first business to start managing your presence, creating deals, and engaging with customers.
            </p>
            <Button onClick={() => setClaimOpen(true)} className="gap-2 rounded-full px-6">
              <Plus className="h-4 w-4" />
              Claim Your First Business
            </Button>
          </div>
        )}
      </Container>
    </main>
  );
}

function BusinessOwnerCard({ business }: { business: ClaimedBusiness }) {
  const [details, setDetails] = useState<{
    name: string;
    formatted_address: string;
    rating?: number;
    opening_hours?: { open_now: boolean };
    photos?: { photo_reference: string }[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/places/details?placeId=${business.placeId}`)
      .then((r) => r.json())
      .then((d) => { if (d.result) setDetails(d.result); })
      .catch(console.error);
  }, [business.placeId]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const photoUrl = details?.photos?.[0]?.photo_reference
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${details.photos[0].photo_reference}&key=${apiKey}`
    : null;

  return (
    <Link
      href={`/portal/${business.placeId}`}
      className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-border/80 hover:shadow-lg transition-all duration-200"
    >
      <div className="relative h-36 bg-muted overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={details?.name ?? ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        {business.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-foreground truncate">
          {details?.name ?? 'Loading…'}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {details?.formatted_address && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {details.formatted_address}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          {details?.rating && (
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {details.rating}
            </span>
          )}
          {details?.opening_hours && (
            <span className={`flex items-center gap-1 font-medium ${
              details.opening_hours.open_now ? 'text-green-500' : 'text-red-400'
            }`}>
              <Clock className="h-3 w-3" />
              {details.opening_hours.open_now ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground pt-1 group-hover:text-foreground transition-colors">
          Manage
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
