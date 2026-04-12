'use client';

/**
 * Builds an ordered route from bookmarked stops (Firestore) + optional "optimize" call.
 * Travel mode maps to Google's Routes API semantics — see `/api/route-optimize`.
 */
import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase';
import { userDataDoc } from '@/lib/firestore/schema';
import { getDoc } from 'firebase/firestore';
import Link from 'next/link';
import {
  Route,
  MapPin,
  Navigation,
  CheckCircle2,
  Loader2,
  Sparkles,
  Car,
  LocateFixed,
  Bike,
  PersonStanding,
  TrainFront,
  FileText,
  Copy,
  Download,
  Workflow,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type TravelMode = 'DRIVE' | 'WALK' | 'BICYCLE' | 'TRANSIT';

const TRAVEL_MODES: { id: TravelMode; label: string; icon: React.ElementType }[] = [
  { id: 'DRIVE', label: 'Drive', icon: Car },
  { id: 'WALK', label: 'Walk', icon: PersonStanding },
  { id: 'BICYCLE', label: 'Bike', icon: Bike },
  { id: 'TRANSIT', label: 'Transit', icon: TrainFront },
];

interface TripStop {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string | null;
  selected: boolean;
  /** Google Places types, e.g. restaurant, store */
  types?: string[];
  rating?: number;
  userRatingsTotal?: number;
  phone?: string;
  website?: string;
}

interface OptimizedLeg {
  from: { lat: number; lng: number; name?: string };
  to: { lat: number; lng: number; name?: string };
  distanceMiles: number;
  durationText: string;
  durationSec?: number;
}

interface RoutePipelineMeta {
  clientEndpoint: string;
  upstreamApi: string;
  optimizationAlgorithm: string;
  travelMode: string;
  routingPreference: string;
  matrixWaypointCount: number;
  serverProcessingMs: number;
}

interface OptimizedResult {
  optimizedStops: (TripStop & { originalIndex: number })[];
  legs: OptimizedLeg[];
  totalDistanceMiles: number;
  totalDurationText: string;
  totalDurationSec?: number;
  stopCount: number;
  pipeline?: RoutePipelineMeta;
  /** Time for the browser to receive a response from our API */
  clientRequestMs?: number;
}

interface RouteOptimizeSnapshot {
  generatedAt: string;
  origin: { lat: number; lng: number };
  travelMode: TravelMode;
  selectedStops: TripStop[];
}

export default function TripPlannerPage() {
  const { user } = useAuth();
  const [stops, setStops] = useState<TripStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizedResult | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVE');
  const [reportOpen, setReportOpen] = useState(false);
  /** Captured when a route is optimized so the report matches that run even if selections change later */
  const [reportSnapshot, setReportSnapshot] = useState<RouteOptimizeSnapshot | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!result || !reportSnapshot) setReportOpen(false);
  }, [result, reportSnapshot]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(userDataDoc(db, 'bookmarks', user.uid));
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
                types: Array.isArray(r.types) ? r.types : undefined,
                rating: typeof r.rating === 'number' ? r.rating : undefined,
                userRatingsTotal: typeof r.user_ratings_total === 'number' ? r.user_ratings_total : undefined,
                phone: r.formatted_phone_number ?? undefined,
                website: r.website ?? undefined,
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
    setReportSnapshot(null);
  };

  const handleTravelModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    setResult(null);
    setReportSnapshot(null);
  };

  const selectedStops = useMemo(() => stops.filter((s) => s.selected), [stops]);

  const handleOptimize = async () => {
    if (!userLocation) { toast.error('Set your starting location first'); return; }
    if (selectedStops.length < 2) { toast.error('Select at least 2 stops'); return; }

    setOptimizing(true);
    setResult(null);
    setReportSnapshot(null);

    try {
      const reqStart = performance.now();
      const res = await fetch('/api/route-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: userLocation,
          stops: selectedStops.map((s) => ({ lat: s.lat, lng: s.lng, name: s.name })),
          travelMode,
        }),
      });
      const clientRequestMs = Math.round(performance.now() - reqStart);

      if (!res.ok) throw new Error('Optimization failed');

      const data = await res.json();

      const optimizedWithNames = {
        ...data,
        clientRequestMs,
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
      setReportSnapshot({
        generatedAt: new Date().toISOString(),
        origin: { ...userLocation },
        travelMode,
        selectedStops: selectedStops.map((s) => ({ ...s })),
      });
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
        <Container className="max-w-4xl pt-32 pb-16 text-center" data-tour="trip-guest">
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
            <div className="rounded-xl border border-border bg-card p-5" data-tour="trip-start">
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

            {/* Transportation Mode */}
            <div className="rounded-xl border border-border bg-card p-5" data-tour="trip-modes">
              <h3 className="text-sm font-bold text-foreground mb-3">Transportation Mode</h3>
              <div className="grid grid-cols-4 gap-2">
                {TRAVEL_MODES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleTravelModeChange(id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      travelMode === id
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border/80'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stops */}
            <div data-tour="trip-stops">
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
          <div className="space-y-4 lg:sticky lg:top-28 self-start" data-tour="trip-optimize">
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
                      <p className="text-xs text-muted-foreground">Total {travelMode === 'DRIVE' ? 'drive' : travelMode === 'WALK' ? 'walk' : travelMode === 'BICYCLE' ? 'ride' : 'transit'} time</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {result.stopCount} stops · {travelMode === 'DRIVE' ? 'Traffic-aware routing' : `${TRAVEL_MODES.find((m) => m.id === travelMode)?.label} route`}
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
                        {(() => { const ModeIcon = TRAVEL_MODES.find((m) => m.id === travelMode)?.icon ?? Car; return <ModeIcon className="h-3 w-3 text-muted-foreground shrink-0" />; })()}
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

                {/* Open in Maps + report */}
                <div className="p-4 pt-0 flex flex-col gap-4">
                  <a
                    className="block w-full"
                    href={buildGoogleMapsUrl(userLocation!, result.optimizedStops, travelMode)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <Navigation className="h-4 w-4" />
                      Open in Google Maps
                    </Button>
                  </a>
                  {reportSnapshot && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => setReportOpen(true)}
                    >
                      <FileText className="h-4 w-4" />
                      Generate trip report
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      {result && reportSnapshot && user && (
        <TripReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          user={user}
          result={result}
          snapshot={reportSnapshot}
        />
      )}
    </main>
  );
}

function TripReportDialog({
  open,
  onOpenChange,
  user,
  result,
  snapshot,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  result: OptimizedResult;
  snapshot: RouteOptimizeSnapshot;
}) {
  const markdown = useMemo(() => {
    const label = user.email ?? `Firebase uid …${user.uid.slice(-8)}`;
    return buildTripReportMarkdown({ userLabel: label, result, snapshot });
  }, [result, snapshot, user]);

  const copyReport = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success('Report copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  const downloadReport = () => {
    if (!markdown || !snapshot) return;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-planner-report-${snapshot.generatedAt.slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const modeLabel = TRAVEL_MODES.find((m) => m.id === snapshot.travelMode)?.label ?? snapshot.travelMode;
  const p = result.pipeline;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Trip run report
          </DialogTitle>
          <DialogDescription>
            End-to-end view: your inputs, how the app routed the request, and the itinerary returned.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 space-y-6 text-sm">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              1 · User input
            </h4>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <p>
                <span className="text-muted-foreground">Session:</span>{' '}
                {user.email ?? `…${user.uid.slice(-8)}`}
              </p>
              <p>
                <span className="text-muted-foreground">Generated:</span>{' '}
                {new Date(snapshot.generatedAt).toLocaleString()}
              </p>
              <p>
                <span className="text-muted-foreground">Starting point:</span>{' '}
                {snapshot.origin.lat.toFixed(5)}, {snapshot.origin.lng.toFixed(5)}
              </p>
              <p>
                <span className="text-muted-foreground">Travel mode:</span> {modeLabel}
              </p>
              <p className="text-muted-foreground pt-1">Selected stops (bookmark metadata from Google Places)</p>
              <ul className="list-none space-y-2 mt-2">
                {snapshot.selectedStops.map((s) => (
                  <li
                    key={s.placeId}
                    className="rounded-md border border-border/80 bg-background px-3 py-2 text-xs"
                  >
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-muted-foreground">{s.address}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span>place_id: {s.placeId}</span>
                      {s.types?.length ? <span>types: {formatPlaceTypes(s.types)}</span> : null}
                      {s.rating != null ? (
                        <span>
                          rating: {s.rating}
                          {s.userRatingsTotal != null ? ` (${s.userRatingsTotal} reviews)` : ''}
                        </span>
                      ) : null}
                      {s.phone ? <span>phone: {s.phone}</span> : null}
                      {s.website ? <span>website: {s.website}</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Workflow className="h-3.5 w-3.5" />
              2 · Processing and API routing
            </h4>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2 font-mono text-xs">
              {p ? (
                <>
                  <p>
                    <span className="text-muted-foreground font-sans">App:</span> {p.clientEndpoint}
                  </p>
                  <p>
                    <span className="text-muted-foreground font-sans">Client round-trip:</span>{' '}
                    {result.clientRequestMs != null ? `${result.clientRequestMs} ms` : '—'}
                  </p>
                  <p>
                    <span className="text-muted-foreground font-sans">Server processing:</span> {p.serverProcessingMs} ms
                  </p>
                  <p>
                    <span className="text-muted-foreground font-sans">Upstream:</span> {p.upstreamApi}
                  </p>
                  <p>
                    <span className="text-muted-foreground font-sans">Matrix waypoints:</span> {p.matrixWaypointCount}{' '}
                    (origin + stops)
                  </p>
                  <p>
                    <span className="text-muted-foreground font-sans">Routing preference:</span> {p.routingPreference}
                  </p>
                  <p>
                    <span className="text-muted-foreground font-sans">Optimization:</span> {p.optimizationAlgorithm}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground font-sans text-xs">
                  Pipeline metadata was not returned (older server response). Re-run optimize to capture full routing details.
                </p>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Route className="h-3.5 w-3.5" />
              3 · Itinerary output
            </h4>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-black">{result.totalDistanceMiles} mi</p>
                  <p className="text-xs text-muted-foreground">Total distance</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{result.totalDurationText}</p>
                  <p className="text-xs text-muted-foreground">
                    Total trip time
                    {result.totalDurationSec != null ? ` (${result.totalDurationSec} sec)` : ''}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{result.stopCount} stops in visit order</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Your location (origin)</li>
                {result.optimizedStops.map((s) => (
                  <li key={s.placeId}>{s.name}</li>
                ))}
              </ol>
              <p className="text-xs font-semibold text-muted-foreground pt-2">Legs</p>
              <ul className="space-y-1.5 text-xs font-mono">
                {result.legs.map((leg, i) => (
                  <li key={i} className="border-l-2 border-dashed border-border pl-2">
                    {leg.from.name ?? 'A'} → {leg.to.name ?? 'B'} · {leg.distanceMiles} mi · {leg.durationText}
                    {leg.durationSec != null ? ` (${leg.durationSec}s)` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/10 shrink-0 gap-2 sm:justify-between">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={copyReport} disabled={!markdown}>
              <Copy className="h-3.5 w-3.5" />
              Copy Markdown
            </Button>
            <Button type="button" size="sm" className="gap-1.5" onClick={downloadReport} disabled={!markdown}>
              <Download className="h-3.5 w-3.5" />
              Download .md
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatPlaceTypes(types: string[]): string {
  return types
    .filter((t) => !t.startsWith('point_of_interest'))
    .slice(0, 6)
    .join(', ');
}

function buildTripReportMarkdown(args: {
  userLabel: string;
  result: OptimizedResult;
  snapshot: RouteOptimizeSnapshot;
}): string {
  const { userLabel, result, snapshot } = args;
  const modeLabel = TRAVEL_MODES.find((m) => m.id === snapshot.travelMode)?.label ?? snapshot.travelMode;
  const p = result.pipeline;
  const lines: string[] = [
    '# Trip Planner — run report',
    '',
    `- **Generated:** ${snapshot.generatedAt}`,
    `- **User:** ${userLabel}`,
    '',
    '## 1. User input',
    '',
    `- **Starting point:** ${snapshot.origin.lat}, ${snapshot.origin.lng}`,
    `- **Travel mode:** ${modeLabel}`,
    `- **Stops selected:** ${snapshot.selectedStops.length}`,
    '',
    '### Bookmarked places (Places metadata)',
    '',
  ];

  for (const s of snapshot.selectedStops) {
    lines.push(`- **${s.name}** (${s.placeId})`);
    lines.push(`  - Address: ${s.address}`);
    if (s.types?.length) lines.push(`  - Types: ${formatPlaceTypes(s.types)}`);
    if (s.rating != null) {
      lines.push(
        `  - Rating: ${s.rating}${s.userRatingsTotal != null ? ` (${s.userRatingsTotal} reviews)` : ''}`,
      );
    }
    if (s.phone) lines.push(`  - Phone: ${s.phone}`);
    if (s.website) lines.push(`  - Website: ${s.website}`);
    lines.push('');
  }

  lines.push('## 2. Processing & API routing', '');
  if (p) {
    lines.push(
      `- **App endpoint:** \`${p.clientEndpoint}\``,
      `- **Client round-trip:** ${result.clientRequestMs != null ? `${result.clientRequestMs} ms` : '—'}`,
      `- **Server processing:** ${p.serverProcessingMs} ms`,
      `- **Upstream:** ${p.upstreamApi}`,
      `- **Matrix waypoints:** ${p.matrixWaypointCount}`,
      `- **Routing preference:** ${p.routingPreference}`,
      `- **Optimization:** ${p.optimizationAlgorithm}`,
      '',
    );
  } else {
    lines.push('_(Pipeline metadata not present — re-run route optimization.)_', '', '');
  }

  lines.push(
    '## 3. Itinerary output',
    '',
    `- **Total distance:** ${result.totalDistanceMiles} mi`,
    `- **Total trip time:** ${result.totalDurationText}${
      result.totalDurationSec != null ? ` (${result.totalDurationSec} sec)` : ''
    }`,
    `- **Stop count:** ${result.stopCount}`,
    '',
    '### Visit order',
    '',
    '1. Origin (your location)',
  );
  let n = 2;
  for (const s of result.optimizedStops) {
    lines.push(`${n}. ${s.name}`);
    n += 1;
  }
  lines.push('', '### Legs', '');
  result.legs.forEach((leg, i) => {
    const extra = leg.durationSec != null ? ` (${leg.durationSec}s)` : '';
    lines.push(
      `${i + 1}. ${leg.from.name ?? '—'} → ${leg.to.name ?? '—'} — ${leg.distanceMiles} mi, ${leg.durationText}${extra}`,
    );
  });
  lines.push('');
  return lines.join('\n');
}

const GMAPS_MODE: Record<TravelMode, string> = {
  DRIVE: 'driving',
  WALK: 'walking',
  BICYCLE: 'bicycling',
  TRANSIT: 'transit',
};

function buildGoogleMapsUrl(
  origin: { lat: number; lng: number },
  stops: TripStop[],
  travelMode: TravelMode = 'DRIVE',
): string {
  const base = 'https://www.google.com/maps/dir/';
  const points = [
    `${origin.lat},${origin.lng}`,
    ...stops.map((s) => encodeURIComponent(s.address || `${s.lat},${s.lng}`)),
  ];
  return base + points.join('/') + `?travelmode=${GMAPS_MODE[travelMode]}`;
}
