'use client';

/**
 * Business portal: search nearby → claim a place → manage it via `/portal/[placeId]`.
 * Firestore helpers live in `@/data/business-portal` so this file stays mostly UI.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
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
  LocateFixed,
  ArrowLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getBusinessesOwnedBy,
  claimBusiness,
  getClaimedBusiness,
  type ClaimedBusiness,
} from '@/lib/business-portal';

interface NearbyBusiness {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  ratingCount?: number;
  types: string[];
  isOpen?: boolean;
  photoUrl?: string | null;
}

export default function PortalPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<ClaimedBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  const [claimMode, setClaimMode] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [nearbyResults, setNearbyResults] = useState<NearbyBusiness[]>([]);
  const [fetchingNearby, setFetchingNearby] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getBusinessesOwnedBy(user.uid)
      .then(setBusinesses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setFetchingNearby(true);
    setNearbyResults([]);
    try {
      const res = await fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&radius=1500&type=establishment`);
      const data = await res.json();
      setNearbyResults(data.results ?? []);
    } catch {
      toast.error('Could not fetch nearby businesses');
    } finally {
      setFetchingNearby(false);
    }
  }, []);

  const handleUseMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter(coords);
        setLocating(false);
        fetchNearby(coords.lat, coords.lng);
      },
      () => {
        toast.error('Could not get your location');
        setLocating(false);
      },
    );
  };

  const handleAddressSearch = async () => {
    if (!addressQuery.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch(`/api/places/geocode?address=${encodeURIComponent(addressQuery)}`);
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      const coords = { lat: data.lat, lng: data.lng };
      setMapCenter(coords);
      fetchNearby(coords.lat, coords.lng);
    } catch {
      toast.error('Could not find that location');
    } finally {
      setGeocoding(false);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapCenter) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const zoom = 15;
    const scale = Math.pow(2, zoom) * 256;
    const centerX = ((mapCenter.lng + 180) / 360) * scale;
    const latRad = (mapCenter.lat * Math.PI) / 180;
    const centerY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;

    const clickWorldX = centerX + (x - w / 2);
    const clickWorldY = centerY + (y - h / 2);

    const newLng = (clickWorldX / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * clickWorldY) / scale;
    const newLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    const newCenter = { lat: newLat, lng: newLng };
    setMapCenter(newCenter);
    fetchNearby(newCenter.lat, newCenter.lng);
  };

  const handleClaim = async (biz: NearbyBusiness) => {
    if (!user) return;
    setClaiming(biz.placeId);
    try {
      const existing = await getClaimedBusiness(biz.placeId);
      if (existing) {
        toast.error('This business has already been claimed');
        setClaiming(null);
        return;
      }
      await claimBusiness(biz.placeId, user.uid, user.email ?? '');
      toast.success(`"${biz.name}" claimed successfully!`);
      setClaimMode(false);
      setNearbyResults([]);
      setMapCenter(null);
      const updated = await getBusinessesOwnedBy(user.uid);
      setBusinesses(updated);
    } catch {
      toast.error('Failed to claim business');
    } finally {
      setClaiming(null);
    }
  };

  const staticMapUrl = mapCenter
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${mapCenter.lat},${mapCenter.lng}&zoom=15&size=800x400&scale=2&maptype=roadmap&key=${apiKey}`
      + `&markers=color:blue%7Clabel:Y%7C${mapCenter.lat},${mapCenter.lng}`
      + nearbyResults.slice(0, 20).map((b, i) => `&markers=color:red%7Clabel:${String.fromCharCode(65 + (i % 26))}%7C${b.lat},${b.lng}`).join('')
    : null;

  if (!user && !loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <Container className="max-w-4xl pt-32 pb-16 text-center" data-tour="portal-guest">
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

  if (claimMode) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <Container className="max-w-6xl pt-28 pb-16">
          <div className="pt-6 mb-8">
            <button
              onClick={() => { setClaimMode(false); setNearbyResults([]); setMapCenter(null); }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Your Businesses
            </button>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-[1] mb-2">
              Claim a <span className="text-muted-foreground">Business</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Set a location on the map, then pick your business from nearby results
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Map + location controls */}
            <div className="lg:col-span-3 space-y-4">
              {/* Location controls */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                    placeholder="Search an address or city…"
                    className="flex-1"
                  />
                  <Button onClick={handleAddressSearch} disabled={geocoding} size="sm" className="gap-1.5 shrink-0">
                    {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Go
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Button onClick={handleUseMyLocation} disabled={locating} variant="outline" className="w-full gap-2">
                  {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                  Use My Current Location
                </Button>
              </div>

              {/* Map */}
              <div
                className="relative w-full rounded-xl overflow-hidden border border-border bg-muted cursor-crosshair"
                style={{ aspectRatio: '2/1', minHeight: 280 }}
                onClick={handleMapClick}
              >
                {staticMapUrl ? (
                  <img
                    src={staticMapUrl}
                    alt="Map"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <MapPin className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Search an address or use your location to get started</p>
                  </div>
                )}
                {mapCenter && (
                  <p className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                    Click anywhere on the map to re-center
                  </p>
                )}
              </div>

              {mapCenter && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing businesses near {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                </p>
              )}
            </div>

            {/* Right: Nearby businesses list */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Store className="h-4 w-4" />
                Nearby Businesses
                {nearbyResults.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">({nearbyResults.length})</span>
                )}
              </h3>

              {fetchingNearby && (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
                </div>
              )}

              {!fetchingNearby && nearbyResults.length === 0 && !mapCenter && (
                <div className="py-16 text-center border border-dashed border-border rounded-xl">
                  <MapPin className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Set a location to see nearby businesses</p>
                </div>
              )}

              {!fetchingNearby && nearbyResults.length === 0 && mapCenter && (
                <div className="py-16 text-center border border-dashed border-border rounded-xl">
                  <Store className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No businesses found nearby</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different location</p>
                </div>
              )}

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {nearbyResults.map((biz, i) => (
                  <div
                    key={biz.placeId}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPin === biz.placeId
                        ? 'border-foreground/30 bg-foreground/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedPin(selectedPin === biz.placeId ? null : biz.placeId)}
                  >
                    <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-red-500">{String.fromCharCode(65 + (i % 26))}</span>
                    </div>
                    {biz.photoUrl ? (
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img src={biz.photoUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Store className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{biz.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{biz.address}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {biz.rating != null && (
                          <span className="flex items-center gap-0.5 text-xs text-foreground font-medium">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {biz.rating}
                          </span>
                        )}
                        {biz.isOpen !== undefined && (
                          <span className={`text-[10px] font-semibold ${biz.isOpen ? 'text-green-500' : 'text-red-400'}`}>
                            {biz.isOpen ? 'Open' : 'Closed'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 gap-1.5 rounded-lg"
                      disabled={claiming === biz.placeId}
                      onClick={(e) => { e.stopPropagation(); handleClaim(biz); }}
                    >
                      {claiming === biz.placeId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Claim
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-6xl pt-28 pb-16">
        {/* Header */}
        <div className="pt-6 mb-10 border-b border-border/50 pb-10" data-tour="portal-header">
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
            <Button onClick={() => setClaimMode(true)} className="gap-2 rounded-full px-5">
              <Plus className="h-4 w-4" />
              Claim a Business
            </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-tour="portal-cards">
            {businesses.map((biz) => (
              <BusinessOwnerCard key={biz.placeId} business={biz} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && businesses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center" data-tour="portal-cards">
            <div className="p-5 rounded-full bg-muted mb-4">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No businesses yet</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Claim your first business to start managing your presence, creating deals, and engaging with customers.
            </p>
            <Button onClick={() => setClaimMode(true)} className="gap-2 rounded-full px-6">
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
