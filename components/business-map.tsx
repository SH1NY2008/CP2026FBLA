'use client';

import React from 'react';

interface BusinessMapProps {
  lat: number;
  lng: number;
}

export function BusinessMap({ lat, lng }: BusinessMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return <p>Google Maps API key is missing.</p>;
  }

  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;

  return (
    <div className="mt-4">
      <iframe
        width="100%"
        height="250"
        style={{ border: 0 }}
        src={mapSrc}
        allowFullScreen
      ></iframe>
    </div>
  );
}
