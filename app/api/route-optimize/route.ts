import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { origin, stops } = body;

    if (!origin || !stops?.length) {
      return NextResponse.json({ error: 'Missing origin or stops' }, { status: 400 });
    }

    // Use Routes API to compute all-pairs matrix, then do a nearest-neighbor optimization
    // This avoids needing the Route Optimization API's project-based auth while still
    // giving users optimized routes via the Routes API
    const allPoints = [origin, ...stops];
    const n = allPoints.length;

    // Compute distance matrix using Routes API computeRouteMatrix
    const origins = allPoints.map((pt: { lat: number; lng: number }, i: number) => ({
      waypoint: { location: { latLng: { latitude: pt.lat, longitude: pt.lng } } },
    }));

    const destinations = [...origins];

    const matrixRes = await fetch(
      'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status',
        },
        body: JSON.stringify({
          origins,
          destinations,
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        }),
      },
    );

    if (!matrixRes.ok) {
      const errText = await matrixRes.text();
      console.error('Matrix API error:', errText);
      throw new Error('Matrix computation failed');
    }

    const matrixData = await matrixRes.json();

    // Build distance matrix
    const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
    const dur: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));

    for (const entry of matrixData) {
      const oi = entry.originIndex;
      const di = entry.destinationIndex;
      if (entry.distanceMeters != null) {
        dist[oi][di] = entry.distanceMeters;
        dur[oi][di] = parseInt(entry.duration?.replace('s', '') ?? '0');
      }
    }

    // Nearest-neighbor TSP starting from origin (index 0)
    const visited = new Set([0]);
    const order = [0];
    let current = 0;

    while (visited.size < n) {
      let bestNext = -1;
      let bestDist = Infinity;
      for (let j = 0; j < n; j++) {
        if (!visited.has(j) && dist[current][j] < bestDist) {
          bestDist = dist[current][j];
          bestNext = j;
        }
      }
      if (bestNext === -1) break;
      visited.add(bestNext);
      order.push(bestNext);
      current = bestNext;
    }

    // Build optimized stops list and calculate totals
    const optimizedStops = order.slice(1).map((idx) => ({
      ...allPoints[idx],
      originalIndex: idx - 1,
    }));

    let totalDistance = 0;
    let totalDuration = 0;
    const legs = [];

    for (let i = 0; i < order.length - 1; i++) {
      const from = order[i];
      const to = order[i + 1];
      totalDistance += dist[from][to];
      totalDuration += dur[from][to];
      legs.push({
        from: allPoints[from],
        to: allPoints[to],
        distanceMeters: dist[from][to],
        distanceMiles: Math.round((dist[from][to] / 1609.34) * 10) / 10,
        durationSec: dur[from][to],
        durationText: formatDuration(dur[from][to]),
      });
    }

    return NextResponse.json({
      optimizedStops,
      legs,
      totalDistanceMiles: Math.round((totalDistance / 1609.34) * 10) / 10,
      totalDurationSec: totalDuration,
      totalDurationText: formatDuration(totalDuration),
      stopCount: stops.length,
    });
  } catch (error) {
    console.error('Route optimize error:', error);
    return NextResponse.json({ error: 'Failed to optimize route' }, { status: 500 });
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
