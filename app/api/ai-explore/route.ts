import { NextRequest, NextResponse } from 'next/server';

interface GroundingPlace {
  place: string;
  id: string;
  location?: { latitude: number; longitude: number };
  googleMapsLinks?: {
    directionsUrl?: string;
    placeUrl?: string;
    writeAReviewUrl?: string;
    reviewsUrl?: string;
    photosUrl?: string;
  };
}

interface MCPResult {
  content?: { type: string; text: string }[];
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { query, lat, lng, radius } = body;

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    const args: Record<string, unknown> = { textQuery: query };

    if (lat != null && lng != null) {
      args.locationBias = {
        circle: {
          center: { latitude: lat, longitude: lng },
          ...(radius ? { radiusMeters: radius } : {}),
        },
      };
    }

    const mcpRes = await fetch('https://mapstools.googleapis.com/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'search_places',
          arguments: args,
        },
      }),
    });

    if (!mcpRes.ok) {
      const errText = await mcpRes.text();
      console.error('Grounding Lite error:', errText);
      return NextResponse.json({ error: 'AI exploration failed' }, { status: 502 });
    }

    const raw = await mcpRes.text();

    // MCP may return SSE events or plain JSON — extract the JSON payload
    let parsed: { result?: MCPResult; error?: { message: string } };
    if (raw.startsWith('{')) {
      parsed = JSON.parse(raw);
    } else {
      // SSE: look for lines starting with "data:" and pick the last JSON one
      const lines = raw.split('\n').filter((l) => l.startsWith('data:'));
      const last = lines[lines.length - 1]?.replace('data:', '').trim();
      if (!last) {
        return NextResponse.json({ error: 'Empty response from Grounding Lite' }, { status: 502 });
      }
      parsed = JSON.parse(last);
    }

    if (parsed.error) {
      console.error('MCP error:', parsed.error);
      return NextResponse.json({ error: parsed.error.message ?? 'MCP error' }, { status: 502 });
    }

    const textContent = parsed.result?.content?.find((c) => c.type === 'text');
    if (!textContent) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    // The text content is JSON with { summary, places }
    let payload: { summary?: string; places?: GroundingPlace[]; nextPageToken?: string };
    try {
      payload = JSON.parse(textContent.text);
    } catch {
      // If it's not JSON, treat it as a plain summary
      payload = { summary: textContent.text, places: [] };
    }

    // Enrich places with photo URLs from the Places API for visual cards
    const places = payload.places ?? [];
    const enriched = await Promise.all(
      places.slice(0, 10).map(async (p) => {
        try {
          const detailRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.id}&fields=name,formatted_address,rating,user_ratings_total,photos,types,opening_hours,price_level&key=${apiKey}`,
          );
          const detailData = await detailRes.json();
          const r = detailData.result;
          return {
            ...p,
            name: r?.name ?? p.place?.replace('places/', ''),
            address: r?.formatted_address ?? '',
            rating: r?.rating,
            ratingCount: r?.user_ratings_total,
            types: r?.types ?? [],
            isOpen: r?.opening_hours?.open_now,
            priceLevel: r?.price_level,
            photoUrl: r?.photos?.[0]?.photo_reference
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}&key=${apiKey}`
              : null,
          };
        } catch {
          return { ...p, name: p.place?.replace('places/', '') ?? 'Unknown', address: '', types: [] };
        }
      }),
    );

    return NextResponse.json({
      summary: payload.summary ?? '',
      places: enriched,
    });
  } catch (error) {
    console.error('AI explore error:', error);
    return NextResponse.json({ error: 'Failed to explore' }, { status: 500 });
  }
}
