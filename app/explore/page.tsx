'use client';

/**
 * AI Explorer: natural-language query → `/api/ai-explore` (Google Maps grounding + Places details).
 * Optional GPS bias so "near me" actually means near the user. History is session-only for quick compare.
 */
import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Loader2,
  MapPin,
  Star,
  Clock,
  Navigation,
  ExternalLink,
  LocateFixed,
  ArrowRight,
  Compass,
  Utensils,
  Coffee,
  ShoppingBag,
  TreePine,
  Dumbbell,
  Music,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExplorePlace {
  id: string;
  place: string;
  name?: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  types?: string[];
  isOpen?: boolean;
  priceLevel?: number;
  photoUrl?: string | null;
  location?: { latitude: number; longitude: number };
  googleMapsLinks?: {
    directionsUrl?: string;
    placeUrl?: string;
    reviewsUrl?: string;
    photosUrl?: string;
  };
}

interface ExploreResult {
  summary: string;
  places: ExplorePlace[];
}

interface HistoryEntry {
  query: string;
  result: ExploreResult;
}

const PRICE_DISPLAY: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };

/* Starter prompts — good for demos so nobody stares at a blank input. */
const SUGGESTED_QUERIES = [
  { icon: Utensils, text: 'Best date night restaurants nearby', color: 'text-orange-400' },
  { icon: Coffee, text: 'Cozy cafes with good wifi for working', color: 'text-amber-400' },
  { icon: ShoppingBag, text: 'Unique local shops and boutiques', color: 'text-blue-400' },
  { icon: TreePine, text: 'Parks and outdoor activities near me', color: 'text-green-400' },
  { icon: Dumbbell, text: 'Top rated gyms and fitness studios', color: 'text-rose-400' },
  { icon: Music, text: 'Live music venues and nightlife spots', color: 'text-purple-400' },
];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExploreResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success('Location set — results will be biased near you');
      },
      () => {
        toast.error('Could not get your location');
        setLocating(false);
      },
    );
  };

  const handleExplore = async (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // 5km bias is a sweet spot: local enough to feel relevant, wide enough to return results.
      const res = await fetch('/api/ai-explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          ...(userLocation ? { lat: userLocation.lat, lng: userLocation.lng, radius: 5000 } : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error ?? 'Exploration failed');
      }

      const data: ExploreResult = await res.json();
      setResult(data);
      setHistory((prev) => [{ query: searchQuery, result: data }, ...prev.slice(0, 9)]);

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to explore');
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryWithCitations = (summary: string, places: ExplorePlace[]) => {
    // Replace [0], [1], etc. with clickable place links
    const parts = summary.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const idx = parseInt(match[1]);
        const place = places[idx];
        if (place) {
          return (
            <Link
              key={i}
              href={`/business/${place.id}`}
              className="inline-flex items-center gap-0.5 text-accent hover:text-accent/80 font-semibold transition-colors"
            >
              <span className="underline decoration-accent/30 underline-offset-2">{place.name ?? `Place ${idx + 1}`}</span>
              <sup className="text-[9px] font-bold text-muted-foreground no-underline">[{idx + 1}]</sup>
            </Link>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-4xl pt-28 pb-16">
        {/* Hero */}
        <div className="pt-8 mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Maps Grounding Lite
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] mb-4">
            AI <span className="text-muted-foreground">Explorer</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Ask anything about local places in natural language. Get AI-curated answers grounded in real Google Maps data.
          </p>
        </div>

        {/* Location toggle */}
        <div className="flex justify-center mb-6" data-tour="explore-locate">
          {userLocation ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              Location active ({userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)})
              <button
                onClick={() => setUserLocation(null)}
                className="text-accent hover:underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={handleLocate}
              disabled={locating}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
              Use my location for better results
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-8" data-tour="explore-search">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
                placeholder="e.g. Best pizza places with outdoor seating in downtown…"
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              />
            </div>
            <Button
              onClick={() => handleExplore()}
              disabled={loading || !query.trim()}
              className="h-14 px-6 rounded-2xl gap-2 text-sm font-semibold"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Exploring…</>
              ) : (
                <><Compass className="h-4 w-4" /> Explore</>
              )}
            </Button>
          </div>
        </div>

        {/* Suggested queries */}
        {!result && !loading && (
          <div className="mb-12" data-tour="explore-suggestions">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 text-center">
              Try asking
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUERIES.map(({ icon: Icon, text, color }) => (
                <button
                  key={text}
                  onClick={() => { setQuery(text); handleExplore(text); }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-border/80 transition-all text-left group"
                >
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                    {text}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-t-accent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Exploring with AI…</p>
              <p className="text-xs text-muted-foreground mt-1">Searching Google Maps and generating insights</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="space-y-8">
            {/* AI Summary */}
            {result.summary && (
              <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">AI Summary</h2>
                    <p className="text-[10px] text-muted-foreground">Grounded in Google Maps data</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {renderSummaryWithCitations(result.summary, result.places)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Source: Google Maps via Grounding Lite
                </p>
              </div>
            )}

            {/* Place cards */}
            {result.places.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Places Mentioned
                  <span className="text-xs font-normal text-muted-foreground">({result.places.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.places.map((place, idx) => (
                    <PlaceCard key={place.id} place={place} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Search again prompt */}
            <div className="text-center pt-4">
              <button
                onClick={() => { setResult(null); inputRef.current?.focus(); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 mx-auto"
              >
                <Search className="h-4 w-4" />
                Ask something else
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && !loading && (
          <div className="mt-16 pt-8 border-t border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Recent Explorations
            </h3>
            <div className="space-y-2">
              {history.slice(1).map((entry, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(entry.query); setResult(entry.result); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-all text-left"
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">{entry.query}</span>
                  <span className="text-xs text-muted-foreground/60 shrink-0">{entry.result.places.length} places</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}

function PlaceCard({ place, index }: { place: ExplorePlace; index: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-border/80 hover:shadow-md transition-all group">
      {/* Photo */}
      <div className="relative h-36 bg-muted overflow-hidden">
        {place.photoUrl ? (
          <img
            src={place.photoUrl}
            alt={place.name ?? ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 left-2 h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">{index + 1}</span>
        </div>
        {place.isOpen !== undefined && (
          <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            place.isOpen
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}>
            {place.isOpen ? 'Open' : 'Closed'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div>
          <h4 className="font-bold text-sm text-foreground line-clamp-1">{place.name ?? 'Unknown Place'}</h4>
          {place.address && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{place.address}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {place.rating != null && (
            <span className="flex items-center gap-1 text-xs font-medium text-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {place.rating}
              {place.ratingCount != null && (
                <span className="text-muted-foreground font-normal">({place.ratingCount.toLocaleString()})</span>
              )}
            </span>
          )}
          {place.priceLevel != null && place.priceLevel > 0 && (
            <span className="text-xs text-muted-foreground">{PRICE_DISPLAY[place.priceLevel]}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 pt-1">
          <Link
            href={`/business/${place.id}`}
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            View Details
          </Link>
          {place.googleMapsLinks?.placeUrl && (
            <a
              href={place.googleMapsLinks.placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              Maps
            </a>
          )}
          {place.googleMapsLinks?.directionsUrl && (
            <a
              href={place.googleMapsLinks.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium py-2 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Navigation className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Attribution */}
        {place.googleMapsLinks?.placeUrl && (
          <p className="text-[9px] text-muted-foreground/60 pt-0.5">
            <a href={place.googleMapsLinks.placeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              View on Google Maps
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
