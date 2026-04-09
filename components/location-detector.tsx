'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationDetectorProps {
  onLocationFound: (lat: number, lng: number, address: string) => void;
}

export function LocationDetector({ onLocationFound }: LocationDetectorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState(false);

  const detectLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get address from reverse geocoding
        try {
          const response = await fetch(
            `/api/places/nearby?lat=${latitude}&lng=${longitude}&radius=1&type=point_of_interest`
          );
          const data = await response.json();
          const address = data.results?.[0]?.address || 'Your location';
          onLocationFound(latitude, longitude, address);
          setHasLocation(true);
        } catch (err) {
          onLocationFound(latitude, longitude, `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setHasLocation(true);
        }

        setLoading(false);
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission was denied. Please enable it in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while detecting location.');
        }
      }
    );
  };

  useEffect(() => {
    // Auto-detect on mount
    detectLocation();
  }, []);

  if (hasLocation) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="bg-red-950 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}
      {!hasLocation && (
        <Button
          onClick={detectLocation}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Detecting location...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Detect My Location
            </>
          )}
        </Button>
      )}
    </div>
  );
}
