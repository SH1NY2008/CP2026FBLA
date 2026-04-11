import { NextResponse } from 'next/server';

// Cache session for 55 minutes (sessions last 1 hour)
let cachedSession: { token: string; expiresAt: number } | null = null;

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const now = Date.now();
  if (cachedSession && now < cachedSession.expiresAt) {
    return NextResponse.json({ session: cachedSession.token });
  }

  try {
    const res = await fetch(
      `https://tile.googleapis.com/v1/createSession?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapType: 'satellite',
          language: 'en-US',
          region: 'US',
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Map Tiles session error:', err);
      return NextResponse.json({ error: 'Failed to create map session' }, { status: 502 });
    }

    const data = await res.json();
    const token = data.session;

    if (!token) {
      return NextResponse.json({ error: 'No session token returned' }, { status: 502 });
    }

    cachedSession = { token, expiresAt: now + 55 * 60 * 1000 };
    return NextResponse.json({ session: token });
  } catch (err) {
    console.error('Map Tiles session error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
