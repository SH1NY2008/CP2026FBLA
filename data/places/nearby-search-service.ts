import { fetchMapsApiJson } from './google-maps-http';
import { mapNearbyResults, type NearbySearchResponse } from './nearby-places';

export async function fetchNearbySearch(
  lat: string,
  lng: string,
  radius: string,
  apiKey: string,
  type?: string,
) {
  const data = await fetchMapsApiJson<NearbySearchResponse>('place/nearbysearch/json', {
    location: `${lat},${lng}`,
    radius,
    key: apiKey,
    ...(type ? { type } : {}),
  });
  return mapNearbyResults(data, apiKey);
}
