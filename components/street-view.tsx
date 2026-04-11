'use client';

import { useState } from 'react';
import Image from 'next/image';

interface StreetViewProps {
  lat: number;
  lng: number;
  heading?: number;
  className?: string;
}

export function StreetView({ lat, lng, heading = 0, className = '' }: StreetViewProps) {
  const [hasError, setHasError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey || hasError) return null;

  const url = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&heading=${heading}&pitch=0&fov=100&key=${apiKey}`;

  return (
    <div className={`relative overflow-hidden rounded-xl bg-muted ${className}`}>
      <Image
        src={url}
        alt="Street View"
        width={600}
        height={300}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
        <svg viewBox="0 0 24 24" className="h-3 w-3 text-yellow-400 fill-yellow-400">
          <circle cx="12" cy="8" r="4" />
          <path d="M12 12c-3 0-5 2-5 4v2h10v-2c0-2-2-4-5-4z" />
        </svg>
        <span className="text-[10px] text-white font-medium">Street View</span>
      </div>
    </div>
  );
}
