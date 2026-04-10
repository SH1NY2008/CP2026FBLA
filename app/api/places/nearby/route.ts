import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius');
  const type = searchParams.get('type');

  if (!lat || !lng || !radius) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat, lng, radius' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radius,
      key: apiKey,
      ...(type && { type: type }),
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform results to include helpful info
    const results = (data.results || []).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating,
      ratingCount: place.user_ratings_total,
      types: place.types,
      isOpen: place.opening_hours?.open_now,
      photoUrl: place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
        : null,
      priceLevel: place.price_level,
    }));

    return NextResponse.json({ results, status: data.status });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
}
