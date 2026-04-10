'use client';

import { useState, useEffect } from 'react';

interface Business {
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
  distance?: number;
}

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        // For demonstration, we'll use a default location if geolocation fails or is denied.
        const location = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
              (error) => resolve({ lat: 40.7128, lng: -74.0060 }) // Default to NYC
            );
          } else {
            resolve({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
          }
        });

        const response = await fetch(`/api/places/nearby?lat=${location.lat}&lng=${location.lng}&radius=5000&type=restaurant`);
        if (!response.ok) {
          throw new Error('Failed to fetch businesses');
        }

        const data = await response.json();
        if (data.status !== 'OK') {
          throw new Error(data.error_message || 'No results found');
        }

        const processedBusinesses = (data.results || []).map((business: Business) => ({
          ...business,
          distance: calculateDistance(location.lat, location.lng, business.lat, business.lng),
        }));

        setBusinesses(processedBusinesses);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch businesses';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return { businesses, loading, error };
}
