import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { lat, lng, radius = 500 } = body;

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
    }

    const typeGroups = [
      { label: 'Restaurants', types: ['restaurant'] },
      { label: 'Cafés', types: ['cafe'] },
      { label: 'Shopping', types: ['store', 'shopping_mall'] },
      { label: 'Hotels', types: ['lodging'] },
      { label: 'Entertainment', types: ['movie_theater', 'amusement_park', 'night_club'] },
      { label: 'Health', types: ['pharmacy', 'hospital', 'gym'] },
      { label: 'Parks', types: ['park'] },
      { label: 'Banks', types: ['bank', 'atm'] },
    ];

    const results = await Promise.allSettled(
      typeGroups.map(async (group) => {
        const payload = {
          insights: ['INSIGHT_COUNT'],
          filter: {
            locationFilter: {
              circle: {
                latLng: { latitude: lat, longitude: lng },
                radius,
              },
            },
            typeFilter: { includedTypes: group.types },
            operatingStatus: ['OPERATING_STATUS_OPERATIONAL'],
          },
        };

        const res = await fetch('https://areainsights.googleapis.com/v1:computeInsights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) return { label: group.label, count: 0 };

        const data = await res.json();
        return {
          label: group.label,
          count: data.count ?? data.placeCount ?? 0,
        };
      }),
    );

    const insights = results
      .filter((r): r is PromiseFulfilledResult<{ label: string; count: number }> => r.status === 'fulfilled')
      .map((r) => r.value)
      .sort((a, b) => b.count - a.count);

    const total = insights.reduce((sum, i) => sum + i.count, 0);

    return NextResponse.json({ insights, total, radius });
  } catch (error) {
    console.error('Area Insights API error:', error);
    return NextResponse.json({ error: 'Failed to fetch area insights' }, { status: 500 });
  }
}
