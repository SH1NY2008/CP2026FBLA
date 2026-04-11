'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import {
  Route,
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Trash2,
  Sparkles,
  Car,
  LocateFixed,
  ArrowDown,
  Milestone,
} from 'lucide-react';
import { toast } from 'sonner';

interface TripStop {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string | null;
  selected: boolean;
}

interface OptimizedLeg {
  from: { lat: number; lng: number; name?: string };
  to: { lat: number; lng: number; name?: string };
  distanceMiles: number;
  durationText: string;
}

interface OptimizedResult {
  optimizedStops: (TripStop & { originalIndex: number })[];
  legs: OptimizedLeg[];
  totalDistanceMiles: number;
  totalDurationText: string;
  stopCount: number;
}

export default function TripPlannerPage() {
  const { user } = useAuth();
  const [stops, setStops] = useState<TripStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizedResult | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'bookmarks', user.uid));
        const ids: string[] = snap.exists() ? (snap.data().placeIds ?? []) : [];

        const details = await Promise.all(
          ids.slice(0, 20).map(async (id) => {
            try {
              const res = await fetch(`/api/places/details?placeId=${id}`);
              const data = await res.json();
              if (!data.result) return null;
              const r = data.result;
              return {
                placeId: id,
                name: r.name,
                address: r.formatted_address,
                lat: r.geometry.location.lat,
                lng: r.geometry.location.lng,
                photoUrl: r.photos?.[0]?.photo_reference
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${r.photos[0].photo_reference}&key=${apiKey}`
                  : null,
                selected: true,
              } as TripStop;
            } catch { return null; }
          }),
        );
        setStops(details.filter(Boolean) as TripStop[]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user, apiKey]);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success('Location set!');
      },
      () => {
        toast.error('Could not get your location');
        setLocating(false);
      },
    );
  };

  const toggleStop = (placeId: string) => {
    setStops((prev) => prev.map((s) => (s.placeId === placeId ? { ...s, selected: !s.selected } : s)));
    setResult(null);
  };

  const selectedStops = useMemo(() => stops.filter((s) => s.selected), [stops]);

  const handleOptimize = async () => {
    if (!userLocation) { toast.error('Set your starting location first'); return; }
    if (selectedStops.length < 2) { toast.error('Select at least 2 stops'); return; }

    setOptimizing(true);
    setResult(null);

    try {
      const res = await fetch('/api/route-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: userLocation,
          stops: selectedStops.map((s) => ({ lat: s.lat, lng: s.lng, name: s.name })),
        }),
      });

      if (!res.ok) throw new Error('Optimization failed');

      const data = await res.json();

      const optimizedWithNames = {
        ...data,
        optimizedStops: data.optimizedStops.map((s: { originalIndex: number }) => ({
          ...selectedStops[s.originalIndex],
          ...s,
        })),
        legs: data.legs.map((leg: OptimizedLeg, i: number) => ({
          ...leg,
          from: i === 0 ? { ...leg.from, name: 'Your Location' } : { ...leg.from, name: selectedStops[data.optimizedStops[i - 1]?.originalIndex]?.name ?? 'Stop' },
          to: { ...leg.to, name: selectedStops[data.optimizedStops[i]?.originalIndex]?.name ?? 'Stop' },
        })),
      };

      setResult(optimizedWithNames);
      toast.success('Route optimized!');
    } catch {
      toast.error('Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  if (!user && !loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <Container className="max-w-4xl pt-32 pb-16 text-center">
          <div className="p-4 rounded-full bg-muted inline-flex mb-6">
            <Route className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Trip Planner</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sign in to plan an optimized route through your bookmarked businesses.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors">
            Sign In
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
            Route Optimization
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1] mb-2">
            Trip <span className="text-muted-foreground">Planner</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Select from your bookmarked places and get the most efficient route powered by Google Routes API
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Stop selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Starting location */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <LocateFixed className="h-4 w-4 text-blue-400" />
                Starting Point
              </h3>
              {userLocation ? (
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-400 shrink-0" />
                  <p className="text-sm text-foreground">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                  <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Set
                  </span>
                </div>
              ) : (
                <Button onClick={handleLocate} disabled={locating} variant="outline" className="gap-2">
                  {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                  Use My Current Location
                </Button>
              )}
            </div>

            {/* Stops */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Your Bookmarked Places
                  <span className="text-xs text-muted-foreground font-normal">
                    ({selectedStops.length} selected)
                  </span>
                </h3>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : stops.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border rounded-xl">
                  <MapPin className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No bookmarked places yet.</p>
                  <Link href="/browse" className="text-xs text-accent hover:underline mt-1 inline-block">
                    Browse and save some places first
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {stops.map((stop) => (
                    <button
                      key={stop.placeId}
                      onClick={() => toggleStop(stop.placeId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        stop.selected
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        stop.selected ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30'
                      }`}>
                        {stop.selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      {stop.photoUrl && (
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={stop.photoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{stop.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Results sidebar */}
          <div className="space-y-4 lg:sticky lg:top-28 self-start">
            <Button
              onClick={handleOptimize}
              disabled={optimizing || !userLocation || selectedStops.length < 2}
              className="w-full gap-2 h-12 text-base rounded-xl"
            >
              {optimizing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Optimizing…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Optimize Route</>
              )}
            </Button>

            {!userLocation && (
              <p className="text-xs text-muted-foreground text-center">
                Set your starting location first
              </p>
            )}

            {result && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Summary */}
                <div className="p-5 border-b border-border bg-gradient-to-br from-emerald-500/10 to-blue-500/10">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Route className="h-4 w-4 text-emerald-400" />
                    Optimized Route
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-black text-foreground">{result.totalDistanceMiles} mi</p>
                      <p className="text-xs text-muted-foreground">Total distance</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground">{result.totalDurationText}</p>
                      <p className="text-xs text-muted-foreground">Total drive time</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {result.stopCount} stops · Traffic-aware routing
                  </p>
                </div>

                {/* Leg-by-leg */}
                <div className="p-4 space-y-0">
                  {result.legs.map((leg, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-3 py-2">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          i === 0 ? 'bg-blue-500 text-white' : 'bg-muted text-foreground'
                        }`}>
                          {i === 0 ? <LocateFixed className="h-3.5 w-3.5" /> : i}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {i === 0 ? 'Your Location' : result.optimizedStops[i - 1]?.name}
                          </p>
                        </div>
                      </div>
                      <div className="ml-3.5 flex items-center gap-2 pl-3 border-l-2 border-dashed border-border py-1.5">
                        <Car className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {leg.distanceMiles} mi · {leg.durationText}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Final stop */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold bg-emerald-500 text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {result.optimizedStops[result.optimizedStops.length - 1]?.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Open in Maps */}
                <div className="p-4 pt-0">
                  <a
                    href={buildGoogleMapsUrl(userLocation!, result.optimizedStops)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <Navigation className="h-4 w-4" />
                      Open in Google Maps
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}

function buildGoogleMapsUrl(
  origin: { lat: number; lng: number },
  stops: TripStop[],
): string {
  const base = 'https://www.google.com/maps/dir/';
  const points = [
    `${origin.lat},${origin.lng}`,
    ...stops.map((s) => encodeURIComponent(s.address || `${s.lat},${s.lng}`)),
  ];
  return base + points.join('/');
}
