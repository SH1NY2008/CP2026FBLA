import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { origin, destination, travelMode = 'DRIVE', intermediates } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    const fieldMask = [
      'routes.duration',
      'routes.distanceMeters',
      'routes.polyline.encodedPolyline',
      'routes.legs.duration',
      'routes.legs.distanceMeters',
      'routes.legs.startLocation',
      'routes.legs.endLocation',
      'routes.legs.steps.navigationInstruction',
      'routes.legs.steps.distanceMeters',
      'routes.legs.steps.staticDuration',
      'routes.travelAdvisory',
    ].join(',');

    const payload: Record<string, unknown> = {
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      travelMode,
      routingPreference: travelMode === 'DRIVE' ? 'TRAFFIC_AWARE' : undefined,
      computeAlternativeRoutes: false,
      languageCode: 'en-US',
      units: 'IMPERIAL',
    };

    if (intermediates?.length) {
      payload.intermediates = intermediates.map((pt: { lat: number; lng: number }) => ({
        location: { latLng: { latitude: pt.lat, longitude: pt.lng } },
      }));
    }

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Routes API error:', err);
      throw new Error('Routes API error');
    }

    const data = await res.json();
    const route = data.routes?.[0];

    if (!route) {
      return NextResponse.json({ error: 'No route found' }, { status: 404 });
    }

    const durationSec = parseInt(route.duration?.replace('s', '') ?? '0');
    const distanceMeters = route.distanceMeters ?? 0;
    const distanceMiles = distanceMeters / 1609.34;

    const legs = (route.legs ?? []).map((leg: Record<string, unknown>) => ({
      durationSec: parseInt((leg.duration as string)?.replace('s', '') ?? '0'),
      distanceMeters: leg.distanceMeters,
      distanceMiles: (leg.distanceMeters as number) / 1609.34,
    }));

    return NextResponse.json({
      durationSec,
      durationText: formatDuration(durationSec),
      distanceMeters,
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      polyline: route.polyline?.encodedPolyline ?? null,
      legs,
    });
  } catch (error) {
    console.error('Routes API error:', error);
    return NextResponse.json({ error: 'Failed to compute route' }, { status: 500 });
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours} hr ${rem} min` : `${hours} hr`;
}
