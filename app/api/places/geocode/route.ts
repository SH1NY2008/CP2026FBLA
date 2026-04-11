import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.[0]) {
      return NextResponse.json(
        { error: 'Location not found. Please try a different search.' },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;

    let city = '';
    let country = '';

    for (const component of result.address_components as Array<{ types: string[]; long_name: string }>) {
      if (component.types.includes('locality') || component.types.includes('postal_town')) {
        city = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.long_name;
      }
    }

    return NextResponse.json({
      lat,
      lng,
      address: result.formatted_address,
      city,
      country,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to geocode address' }, { status: 500 });
  }
}
