import { parseLocalityAndCountry } from './address-parsing';
import { fetchMapsApiJson } from './google-maps-http';
import type { GeocodeSuccess, ReverseGeocodeSuccess } from '@/domain/places/types';

interface GeocodeResponse {
  status: string;
  error_message?: string;
  results?: Array<{
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
    address_components: Array<{ types: string[]; long_name: string }>;
  }>;
}

export async function geocodeAddress(
  address: string,
  apiKey: string,
): Promise<GeocodeSuccess | { error: 'not_found' }> {
  const data = await fetchMapsApiJson<GeocodeResponse>('geocode/json', {
    address,
    key: apiKey,
  });

  if (data.status !== 'OK' || !data.results?.[0]) {
    return { error: 'not_found' };
  }

  const result = data.results[0];
  const { lat, lng } = result.geometry.location;
  const { city, country } = parseLocalityAndCountry(result.address_components);

  return {
    lat,
    lng,
    address: result.formatted_address,
    city,
    country,
  };
}

export async function reverseGeocodeLatLng(
  lat: string,
  lng: string,
  apiKey: string,
): Promise<ReverseGeocodeSuccess> {
  const data = await fetchMapsApiJson<GeocodeResponse>('geocode/json', {
    latlng: `${lat},${lng}`,
    key: apiKey,
    result_type: 'locality|political',
  });

  if (data.status !== 'OK') {
    throw new Error(data.error_message || 'No results found');
  }

  const result = data.results?.[0];
  if (!result) {
    return { city: '', country: '', address: 'Unknown location' };
  }

  const { city, country } = parseLocalityAndCountry(result.address_components);
  return {
    city,
    country,
    address: result.formatted_address,
  };
}
