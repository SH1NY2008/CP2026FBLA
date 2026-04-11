import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const [weatherRes, aqRes] = await Promise.allSettled([
    fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}&unitsSystem=IMPERIAL`
    ),
    fetch(
      `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          extraComputations: ['HEALTH_RECOMMENDATIONS', 'LOCAL_AQI'],
          languageCode: 'en',
        }),
      }
    ),
  ]);

  let weather = null;
  let airQuality = null;

  if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
    const raw = await weatherRes.value.json();
    const c = raw.currentConditions ?? raw;
    weather = {
      tempF: Math.round(c.temperature?.degrees ?? c.temperature ?? 0),
      feelsLikeF: Math.round(c.feelsLike?.degrees ?? c.feelsLike ?? 0),
      humidity: Math.round(c.relativeHumidity ?? c.humidity ?? 0),
      windMph: Math.round(c.wind?.speed?.value ?? c.windSpeed ?? 0),
      condition: c.weatherCondition?.description?.text ?? c.condition ?? 'Unknown',
      iconUri: c.weatherCondition?.iconBaseUri ?? null,
    };
  }

  if (aqRes.status === 'fulfilled' && aqRes.value.ok) {
    const raw = await aqRes.value.json();
    const idx = (raw.indexes ?? []).find((i: { code: string }) => i.code === 'usa_epa') ??
                (raw.indexes ?? [])[0];
    airQuality = idx
      ? {
          aqi: idx.aqi ?? 0,
          category: idx.category ?? 'Unknown',
          dominantPollutant: idx.dominantPollutant ?? null,
          healthRecommendation: raw.healthRecommendations?.generalPopulation ?? null,
        }
      : null;
  }

  return NextResponse.json({ weather, airQuality });
}
