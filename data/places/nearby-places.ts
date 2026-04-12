import type { NearbyPlaceResult } from '@/domain/places/types';

export interface NearbySearchResponse {
  results?: NearbySearchApiPlace[];
  status: string;
}

interface NearbySearchApiPlace {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  opening_hours?: { open_now?: boolean };
  photos?: Array<{ photo_reference: string }>;
  price_level?: number;
}

/**
 * Maps raw Nearby Search payloads to stable app DTOs (adapter layer).
 */
export function mapNearbyResults(
  data: NearbySearchResponse,
  apiKey: string,
): { results: NearbyPlaceResult[]; status: string } {
  const results = (data.results ?? []).map((place) => toNearbyPlaceDto(place, apiKey));
  return { results, status: data.status };
}

function toNearbyPlaceDto(place: NearbySearchApiPlace, apiKey: string): NearbyPlaceResult {
  return {
    placeId: place.place_id,
    name: place.name,
    address: place.vicinity ?? '',
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    rating: place.rating,
    ratingCount: place.user_ratings_total,
    types: place.types,
    isOpen: place.opening_hours?.open_now,
    photoUrl: place.photos?.[0]
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
      : null,
    priceLevel: place.price_level,
  };
}
