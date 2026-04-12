import { NextRequest, NextResponse } from 'next/server';

function minScore(): number {
  const n = Number(process.env.RECAPTCHA_MIN_SCORE);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : 0.35;
}

export async function POST(request: NextRequest) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    // Local dev: allow sign-in when only the public site key is set (no server secret in .env yet).
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true, skipped: true });
    }
    return NextResponse.json(
      {
        success: false,
        error: 'reCAPTCHA is not configured on the server. Set RECAPTCHA_SECRET_KEY.',
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const token = typeof body === 'object' && body !== null && 'token' in body
    ? (body as { token: unknown }).token
    : undefined;

  if (typeof token !== 'string' || !token.length) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.set('secret', secret);
  params.set('response', token);

  const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = (await verifyRes.json()) as {
    success?: boolean;
    score?: number;
    action?: string;
    'error-codes'?: string[];
  };

  if (!data.success) {
    return NextResponse.json({
      success: false,
      error: 'reCAPTCHA rejected the request',
    });
  }

  if (typeof data.score === 'number' && data.score < minScore()) {
    return NextResponse.json({
      success: false,
      error: 'Security check score too low — try again in a moment',
    });
  }

  return NextResponse.json({ success: true, score: data.score });
}
