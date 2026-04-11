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

  try {
    const params = new URLSearchParams({
      'location.latitude': lat,
      'location.longitude': lng,
      requiredQuality: 'MEDIUM',
      key: apiKey,
    });

    const res = await fetch(
      `https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`,
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Solar API error:', res.status, errText);
      return NextResponse.json({ error: 'Solar data unavailable for this location' }, { status: 404 });
    }

    const data = await res.json();
    const panel = data.solarPotential;

    if (!panel) {
      return NextResponse.json({ error: 'No solar data' }, { status: 404 });
    }

    const bestConfig = panel.solarPanelConfigs?.[panel.solarPanelConfigs.length - 1];
    const maxPanels = panel.maxArrayPanelsCount ?? 0;
    const maxArea = panel.maxArrayAreaMeters2 ?? 0;
    const maxSunshine = panel.maxSunshineHoursPerYear ?? 0;
    const roofSegments = panel.roofSegmentStats?.length ?? 0;
    const carbonOffset = panel.carbonOffsetFactorKgPerMwh ?? 0;

    const yearlyEnergyKwh = bestConfig?.yearlyEnergyDcKwh ?? 0;
    const panelsCount = bestConfig?.panelsCount ?? maxPanels;

    const yearlyEnergySavings = yearlyEnergyKwh * 0.12;

    return NextResponse.json({
      maxPanels,
      maxAreaSqFt: Math.round(maxArea * 10.764),
      maxSunshineHours: Math.round(maxSunshine),
      roofSegments,
      yearlyEnergyKwh: Math.round(yearlyEnergyKwh),
      recommendedPanels: panelsCount,
      yearlySavingsUsd: Math.round(yearlyEnergySavings),
      carbonOffsetKg: Math.round((yearlyEnergyKwh / 1000) * carbonOffset),
      imageryQuality: data.imageryQuality ?? 'UNKNOWN',
    });
  } catch (error) {
    console.error('Solar API error:', error);
    return NextResponse.json({ error: 'Failed to fetch solar data' }, { status: 500 });
  }
}
