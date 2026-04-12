'use client';

import React from 'react';

interface BusinessMapProps {
  lat: number;
  lng: number;
  category?: string;
  className?: string;
}

const CATEGORY_QUERIES: Record<string, string> = {
  restaurant: 'restaurants',
  shopping: 'shopping stores',
  services: 'local services',
  entertainment: 'entertainment',
};

export function BusinessMap({ lat, lng, category = 'restaurant', className = '' }: BusinessMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-xl border border-border ${className}`}
      >
        <p className="text-sm text-muted-foreground">Map unavailable — API key missing</p>
      </div>
    );
  }

  const query = encodeURIComponent(CATEGORY_QUERIES[category] || 'local businesses');
  const mapSrc = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${query}&center=${lat},${lng}&zoom=14`;

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border bg-muted ${className}`}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block', minHeight: '400px' }}
        src={mapSrc}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Business map"
      />
    </div>
  );
}
