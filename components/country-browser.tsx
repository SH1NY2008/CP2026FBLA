'use client';

import { useState, useMemo } from 'react';
import { Globe, ChevronLeft, Search, Loader2, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { COUNTRIES, type CountryData } from '@/lib/countries-data';
import Link from 'next/link';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
}

interface CountryBrowserProps {
  onLocationFound: (location: Location) => void;
  disabled?: boolean;
}

type Step = 'country' | 'state' | 'places';

interface PlaceResult {
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

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar', bakery: 'Bakery',
  store: 'Store', shopping_mall: 'Shopping Mall', supermarket: 'Supermarket',
  bank: 'Bank', gym: 'Gym', pharmacy: 'Pharmacy', hospital: 'Hospital',
  movie_theater: 'Cinema', park: 'Park', entertainment: 'Entertainment',
  lodging: 'Hotel', spa: 'Spa', beauty_salon: 'Salon', night_club: 'Night Club',
  amusement_park: 'Amusement Park', tourist_attraction: 'Attraction',
};

const SKIP_TYPES = new Set([
  'point_of_interest', 'establishment', 'food', 'premise', 'political',
  'locality', 'sublocality', 'route', 'country',
  'administrative_area_level_1', 'administrative_area_level_2',
]);

function formatType(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getDisplayTypes(types: string[]): string[] {
  return types.filter(t => !SKIP_TYPES.has(t)).slice(0, 2).map(formatType);
}

const PRICE_DISPLAY: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };

export function CountryBrowser({ onLocationFound, disabled }: CountryBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('country');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stateLocation, setStateLocation] = useState<Location | null>(null);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredStates = useMemo(() => {
    if (!selectedCountry) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return selectedCountry.states;
    return selectedCountry.states.filter(s => s.toLowerCase().includes(q));
  }, [selectedCountry, searchQuery]);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    setSearchQuery('');
    setStep('state');
  };

  const handleStateSelect = async (state: string) => {
    if (!selectedCountry) return;
    setSelectedState(state);
    setLoading(true);
    setError(null);
    setPlaces([]);

    try {
      const query = `${state}, ${selectedCountry.name}`;
      const geoRes = await fetch(`/api/places/geocode?address=${encodeURIComponent(query)}`);
      const geoData = await geoRes.json();

      if (!geoRes.ok) throw new Error(geoData.error || 'Could not find location');

      const loc: Location = geoData;
      setStateLocation(loc);

      // Fetch top-rated places (restaurants + entertainment mix)
      const placeType = 'restaurant|cafe|bar|movie_theater|park|amusement_park|tourist_attraction|shopping_mall|museum';
      const res = await fetch(
        `/api/places/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=50000&type=${placeType}`
      );
      const data = await res.json();
      if (!res.ok || data.status !== 'OK') throw new Error(data.error_message || 'No results found');

      const sorted: PlaceResult[] = ((data.results || []) as PlaceResult[])
        .sort((a, b) => {
          const ra = a.rating ?? 0;
          const rb = b.rating ?? 0;
          const ca = a.ratingCount ?? 0;
          const cb = b.ratingCount ?? 0;
          // weighted score: rating * log(count+1)
          return (rb * Math.log(cb + 1)) - (ra * Math.log(ca + 1));
        })
        .slice(0, 20);

      setPlaces(sorted);
      setStep('places');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHere = () => {
    if (stateLocation) {
      onLocationFound(stateLocation);
      setIsOpen(false);
    }
  };

  const goBack = () => {
    setError(null);
    if (step === 'state') {
      setSelectedCountry(null);
      setSearchQuery('');
      setStep('country');
    } else if (step === 'places') {
      setSelectedState(null);
      setPlaces([]);
      setSearchQuery('');
      setStep('state');
    }
  };

  const reset = () => {
    setStep('country');
    setSelectedCountry(null);
    setSelectedState(null);
    setPlaces([]);
    setSearchQuery('');
    setError(null);
    setStateLocation(null);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => { reset(); setIsOpen(true); }}
        disabled={disabled}
        className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="p-3 rounded-full bg-muted group-hover:bg-accent/10 transition-colors">
          <Globe className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground text-sm">Browse by Country</p>
          <p className="text-xs text-muted-foreground mt-0.5">Explore states &amp; top places</p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-accent/40 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        {step !== 'country' && (
          <button onClick={goBack} className="p-1 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {step === 'country' && 'Select Country'}
            {step === 'state' && `${selectedCountry?.name} — Select State / Province`}
            {step === 'places' && `Top Places in ${selectedState}, ${selectedCountry?.name}`}
          </p>
        </div>
        <button
          onClick={() => { setIsOpen(false); reset(); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Country step */}
      {step === 'country' && (
        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search countries…"
              className="pl-8 h-9 text-sm"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
            {filteredCountries.map(c => (
              <button
                key={c.code}
                onClick={() => handleCountrySelect(c)}
                className="text-left px-3 py-2 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-sm font-medium text-foreground truncate"
              >
                {c.name}
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="col-span-3 text-sm text-muted-foreground text-center py-4">No countries found</p>
            )}
          </div>
        </div>
      )}

      {/* State step */}
      {step === 'state' && (
        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search states / provinces…"
              className="pl-8 h-9 text-sm"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
            {filteredStates.map(s => (
              <button
                key={s}
                onClick={() => handleStateSelect(s)}
                disabled={loading}
                className="text-left px-3 py-2 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-sm font-medium text-foreground truncate disabled:opacity-40"
              >
                {s}
              </button>
            ))}
            {filteredStates.length === 0 && (
              <p className="col-span-3 text-sm text-muted-foreground text-center py-4">No results</p>
            )}
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading places…
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive mt-3 text-center">{error}</p>
          )}
        </div>
      )}

      {/* Places step */}
      {step === 'places' && (
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading top places…
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive text-center py-4">{error}</p>
          )}
          {!loading && places.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">
                  Top <span className="font-semibold text-foreground">{places.length}</span> highly-rated places
                </p>
                {stateLocation && (
                  <Button size="sm" onClick={handleGoHere} className="h-7 text-xs gap-1.5">
                    <MapPin className="h-3 w-3" />
                    Browse this area
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {places.map((place, idx) => (
                  <Link
                    key={place.placeId}
                    href={`/business/${place.placeId}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/40 hover:bg-accent/5 transition-all group"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 text-center">
                      {idx + 1}
                    </span>
                    {place.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="w-12 h-12 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                        {place.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {place.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                            <Star className="h-3 w-3 fill-amber-500" />
                            {place.rating.toFixed(1)}
                            {place.ratingCount && (
                              <span className="text-muted-foreground font-normal ml-0.5">
                                ({place.ratingCount.toLocaleString()})
                              </span>
                            )}
                          </span>
                        )}
                        {place.priceLevel && (
                          <span className="text-xs text-muted-foreground">{PRICE_DISPLAY[place.priceLevel]}</span>
                        )}
                        {getDisplayTypes(place.types).map(t => (
                          <span key={t} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
          {!loading && places.length === 0 && !error && (
            <p className="text-sm text-muted-foreground text-center py-6">No places found for this region.</p>
          )}
        </div>
      )}
    </div>
  );
}
