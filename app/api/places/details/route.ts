import { NextRequest, NextResponse } from 'next/server';
import { fetchPlaceDetails } from '@/lib/places';
import { requireGoogleMapsKey } from '@/lib/server/google-maps-route';
import { placeDetailsQuerySchema } from '@/lib/schemas/places';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = placeDetailsQuerySchema.safeParse({
    placeId: searchParams.get('placeId') ?? '',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing required parameter: placeId' },
      { status: 400 },
    );
  }

  const keyCheck = requireGoogleMapsKey();
  if (!keyCheck.ok) {
    return keyCheck.response;
  }

  const startedAt = Date.now();
  try {
    const data = await fetchPlaceDetails(parsed.data.placeId, keyCheck.apiKey);
    const serverProcessingMs = Date.now() - startedAt;
    return NextResponse.json({
      result: data.result,
      status: data.status,
      pipeline: {
        clientEndpoint: 'GET /api/places/details',
        upstreamApi: 'Google Places API — place/details/json (field-masked)',
        serverProcessingMs,
      },
    });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 },
    );
  }
}
