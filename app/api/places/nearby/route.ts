/**
 * GET /api/places/nearby — thin HTTP wrapper around Google Places Nearby Search.
 * Validates query params with Zod so bad lat/lng/radius never hits Google's billing.
 */
import { NextRequest, NextResponse } from 'next/server';
import { fetchNearbySearch } from '@/lib/places';
import { requireGoogleMapsKey } from '@/lib/server/google-maps-route';
import { nearbySearchQuerySchema } from '@/lib/schemas/places';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const parsed = nearbySearchQuerySchema.safeParse({
    lat: searchParams.get('lat') ?? '',
    lng: searchParams.get('lng') ?? '',
    radius: searchParams.get('radius') ?? '',
    type: typeParam && typeParam.length > 0 ? typeParam : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat, lng, radius' },
      { status: 400 },
    );
  }

  const keyCheck = requireGoogleMapsKey();
  if (!keyCheck.ok) {
    return keyCheck.response;
  }

  const { lat, lng, radius, type } = parsed.data;

  try {
    const { results, status } = await fetchNearbySearch(
      lat,
      lng,
      radius,
      keyCheck.apiKey,
      type,
    );
    return NextResponse.json({ results, status });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 },
    );
  }
}
