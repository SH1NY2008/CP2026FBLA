import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/places';
import { requireGoogleMapsKey } from '@/lib/server/google-maps-route';
import { geocodeQuerySchema } from '@/lib/schemas/places';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = geocodeQuerySchema.safeParse({
    address: searchParams.get('address') ?? '',
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
  }

  const keyCheck = requireGoogleMapsKey();
  if (!keyCheck.ok) {
    return keyCheck.response;
  }

  try {
    const result = await geocodeAddress(parsed.data.address, keyCheck.apiKey);
    if ('error' in result) {
      return NextResponse.json(
        { error: 'Location not found. Please try a different search.' },
        { status: 404 },
      );
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to geocode address' }, { status: 500 });
  }
}
