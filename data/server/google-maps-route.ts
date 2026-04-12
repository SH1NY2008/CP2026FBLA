import { NextResponse } from 'next/server';
import { getGoogleMapsApiKey } from './google-maps-env';

/**
 * Shared guard for API routes that need a configured Maps key.
 */
export function requireGoogleMapsKey():
  | { ok: true; apiKey: string }
  | { ok: false; response: NextResponse } {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      ),
    };
  }
  return { ok: true, apiKey };
}
