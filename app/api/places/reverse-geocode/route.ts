import { NextRequest, NextResponse } from 'next/server';
import { reverseGeocodeLatLng } from '@/lib/places';
import { requireGoogleMapsKey } from '@/lib/server/google-maps-route';
import { reverseGeocodeQuerySchema } from '@/lib/schemas/places';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = reverseGeocodeQuerySchema.safeParse({
    lat: searchParams.get('lat') ?? '',
    lng: searchParams.get('lng') ?? '',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat, lng' },
      { status: 400 },
    );
  }

  const keyCheck = requireGoogleMapsKey();
  if (!keyCheck.ok) {
    return keyCheck.response;
  }

  const { lat, lng } = parsed.data;

  try {
    const payload = await reverseGeocodeLatLng(lat, lng, keyCheck.apiKey);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 },
    );
  }
}
