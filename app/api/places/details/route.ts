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

  try {
    const data = await fetchPlaceDetails(parsed.data.placeId, keyCheck.apiKey);
    return NextResponse.json({ result: data.result, status: data.status });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 },
    );
  }
}
