const MAPS_API_BASE = 'https://maps.googleapis.com/maps/api';

/**
 * Thin transport layer for Maps HTTP calls — no business rules here.
 */
export async function fetchMapsApiJson<T>(
  path: string,
  searchParams: Record<string, string | undefined>,
): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== '') {
      params.set(key, value);
    }
  }
  const url = `${MAPS_API_BASE}/${path}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
