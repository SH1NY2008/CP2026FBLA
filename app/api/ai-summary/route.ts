import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { name, types, rating, ratingCount, address } = body;

  if (!name) {
    return NextResponse.json({ error: 'Missing business name' }, { status: 400 });
  }

  const typeList = (types as string[] ?? [])
    .filter((t: string) => !['point_of_interest', 'establishment', 'food', 'premise'].includes(t))
    .slice(0, 3)
    .map((t: string) => t.replace(/_/g, ' '))
    .join(', ');

  const prompt = `Write a friendly 2-3 sentence "What to expect" description for a place called "${name}" — a ${typeList || 'local business'} located at ${address ?? 'an undisclosed location'}, rated ${rating ?? 'unknown'}/5 by ${ratingCount ?? 0} visitors. Focus on atmosphere, what makes it worth visiting, and who it's best for. Keep it concise, warm, and informative. Do not use quotation marks or mention that this is AI-generated.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini error:', err);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error('AI summary error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
