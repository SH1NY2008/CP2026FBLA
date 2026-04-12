'use client';

/**
 * First-run location UX: try GPS + reverse geocode for a friendly city label,
 * or fall back to the child (CountryBrowser / manual search) when GPS isn't an option.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, MapPin, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
}

interface LocationDetectorProps {
  onLocationFound: (location: Location) => void;
  children?: React.ReactNode;
}

export function LocationDetector({ onLocationFound, children }: LocationDetectorProps) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const detectGPS = async () => {
    setGpsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Turn coords into something humans recognize in the UI (city, country).
          const response = await fetch(
            `/api/places/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );
          const data = await response.json();

          if (response.ok) {
            onLocationFound({
              lat: latitude,
              lng: longitude,
              address: data.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city: data.city || '',
              country: data.country || '',
            });
          } else {
            onLocationFound({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city: '',
              country: '',
            });
          }
        } catch {
          onLocationFound({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: '',
            country: '',
          });
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Try entering a city or ZIP below.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Try entering a city or ZIP below.');
            break;
          default:
            setError('Could not detect location. Try entering a city or ZIP below.');
        }
      }
    );
  };

  const searchManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/places/geocode?address=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        onLocationFound(data);
      } else {
        setError(data.error || 'Location not found. Try a different search.');
      }
    } catch {
      setError('Failed to search for location. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <div className={`grid grid-cols-1 gap-3 items-stretch ${children ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {/* GPS option */}
        <button
          type="button"
          onClick={detectGPS}
          disabled={gpsLoading || searchLoading}
          className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
            {gpsLoading ? (
              <Loader2 className="h-6 w-6 text-accent animate-spin" />
            ) : (
              <MapPin className="h-6 w-6 text-accent" />
            )}
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">Use my location</p>
            <p className="text-xs text-muted-foreground mt-0.5">Auto-detect via GPS</p>
          </div>
        </button>

        {/* Manual search option */}
        <form
          onSubmit={searchManual}
          className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-200"
        >
          <div className="p-3 rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="w-full space-y-2">
            <p className="font-semibold text-foreground text-sm text-center">Enter a city or ZIP</p>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Austin, TX or 78701"
                className="text-sm h-9"
                disabled={gpsLoading || searchLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={gpsLoading || searchLoading || !searchQuery.trim()}
                className="shrink-0 h-9"
              >
                {searchLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Go'}
              </Button>
            </div>
          </div>
        </form>

        {children}
      </div>
    </div>
  );
}
