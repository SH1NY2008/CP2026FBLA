'use client';

import { useState, useEffect } from 'react';
import { Car, PersonStanding, Loader2 } from 'lucide-react';

interface TravelInfoProps {
  destLat: number;
  destLng: number;
}

interface RouteData {
  durationText: string;
  distanceMiles: number;
}

export function TravelInfo({ destLat, destLng }: TravelInfoProps) {
  const [driveData, setDriveData] = useState<RouteData | null>(null);
  const [walkData, setWalkData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  useEffect(() => {
    if (!userLoc) return;
    setLoading(true);

    const fetchRoute = async (mode: string) => {
      try {
        const res = await fetch('/api/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: userLoc,
            destination: { lat: destLat, lng: destLng },
            travelMode: mode,
          }),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    };

    Promise.all([fetchRoute('DRIVE'), fetchRoute('WALK')])
      .then(([drive, walk]) => {
        if (drive) setDriveData(drive);
        if (walk) setWalkData(walk);
      })
      .finally(() => setLoading(false));
  }, [userLoc, destLat, destLng]);

  if (!userLoc || loading) {
    return loading ? (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Calculating travel time…
      </div>
    ) : null;
  }

  if (!driveData && !walkData) return null;

  return (
    <div className="flex items-center gap-3">
      {driveData && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Car className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold text-foreground">{driveData.durationText}</span>
          <span>({driveData.distanceMiles} mi)</span>
        </div>
      )}
      {walkData && walkData.distanceMiles < 5 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PersonStanding className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold text-foreground">{walkData.durationText}</span>
        </div>
      )}
    </div>
  );
}
