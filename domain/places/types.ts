/** Shared DTOs for Google Maps–backed features (API responses and app shapes). */

export interface NearbyPlaceResult {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  ratingCount?: number;
  types?: string[];
  isOpen?: boolean;
  photoUrl: string | null;
  priceLevel?: number;
}

export interface GeocodeSuccess {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
}

export interface ReverseGeocodeSuccess {
  city: string;
  country: string;
  address: string;
}
