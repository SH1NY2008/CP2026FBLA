import { fetchMapsApiJson } from './google-maps-http';

const DETAIL_FIELDS = [
  'name',
  'formatted_address',
  'geometry',
  'rating',
  'user_ratings_total',
  'types',
  'opening_hours',
  'photos',
  'formatted_phone_number',
  'website',
  'price_level',
  'editorial_summary',
] as const;

interface PlaceDetailsResponse {
  result: unknown;
  status: string;
}

export async function fetchPlaceDetails(placeId: string, apiKey: string) {
  return fetchMapsApiJson<PlaceDetailsResponse>('place/details/json', {
    place_id: placeId,
    key: apiKey,
    fields: DETAIL_FIELDS.join(','),
  });
}
