import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import type { Deal, Business } from '@/lib/data';

interface DealWithBusiness extends Deal {
  _businessName: string;
  _businessCategory: string;
  _businessAddress: string;
}

// ─── Groupon scraper ───────────────────────────────────────────────────────

async function scrapeGroupon(lat: number, lng: number): Promise<DealWithBusiness[]> {
  const url = `https://www.groupon.com/browse/deals?lat=${lat}&lng=${lng}&radius=mi_15`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Groupon HTTP ${res.status}`);

  const html = await res.text();

  // Groupon embeds deal data in window.__INITIAL_STATE__
  const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      const items: unknown[] =
        state?.page?.deals?.items ??
        state?.deals?.items ??
        state?.page?.deals?.dealCardCollection?.items ??
        [];

      if (Array.isArray(items) && items.length > 0) {
        return items.slice(0, 20).map((item: unknown, idx: number) => {
          const it = item as Record<string, unknown>;
          const merchant = (it.merchant ?? {}) as Record<string, unknown>;
          const options = Array.isArray(it.options) ? it.options : [];
          const option = (options[0] ?? {}) as Record<string, unknown>;
          const price = (option.price ?? {}) as Record<string, unknown>;
          const originalPriceObj = (price.originalPrice ?? {}) as Record<string, unknown>;

          const discountPct = Math.round(
            ((option.discount as Record<string, unknown>)?.percent as number) ?? 0
          );
          const dealPrice =
            typeof price.amount === 'number' ? price.amount / 100 : undefined;
          const originalPrice =
            typeof originalPriceObj.amount === 'number'
              ? originalPriceObj.amount / 100
              : undefined;

          const expiresAt =
            (it.endAt as string) ??
            (option.endAt as string) ??
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

          const soldQty = (it.soldQuantity as number) ?? 0;
          const remaining =
            ((option as Record<string, unknown>).remainingCount as number) ?? 80;

          const tags = Array.isArray(it.tags) ? it.tags : [];
          const firstTag = (tags[0] as Record<string, unknown>)?.name ?? 'local';

          const dealUrl = (it.dealUrl as string) ?? '';

          return {
            id: String(it.id ?? `g-${idx}`),
            businessId: String((merchant as Record<string, unknown>).id ?? `biz-g-${idx}`),
            _businessName: String((merchant as Record<string, unknown>).name ?? 'Local Business'),
            _businessCategory: String(firstTag),
            _businessAddress: String((merchant as Record<string, unknown>).address ?? ''),
            title: String(it.title ?? it.shortTitle ?? 'Special Deal'),
            description: String(
              it.description ?? (option as Record<string, unknown>).description ?? 'Limited-time offer'
            ).slice(0, 200),
            discountPercent: discountPct,
            originalPrice,
            dealPrice,
            code: '',
            expiresAt,
            redemptions: soldQty,
            maxRedemptions: soldQty + remaining,
            termsAndConditions:
              String(it.finePrint ?? 'See Groupon listing for full terms.'),
            sourceUrl: dealUrl ? `https://www.groupon.com${dealUrl}` : 'https://www.groupon.com',
            source: 'groupon' as const,
          };
        });
      }
    } catch {
      // fall through to cheerio
    }
  }

  // Fallback: parse deal cards from HTML
  const $ = cheerio.load(html);
  const deals: DealWithBusiness[] = [];

  $('[data-bhw="DealCard"], [class*="deal-card"], [class*="DealCard"]').each((idx, el) => {
    if (idx >= 20) return false;
    const $el = $(el);
    const title =
      $el.find('[data-bhw="DealTitle"], h3, [class*="title"]').first().text().trim();
    const merchant =
      $el.find('[data-bhw="MerchantName"], [class*="merchant"]').first().text().trim();
    if (!title) return;

    const href = $el.find('a').first().attr('href') ?? '';
    deals.push({
      id: `g-html-${idx}`,
      businessId: `biz-g-html-${idx}`,
      _businessName: merchant || 'Local Business',
      _businessCategory: 'local',
      _businessAddress: '',
      title,
      description:
        $el.find('[class*="description"], [class*="tagline"]').first().text().trim() ||
        'Special offer from a local business.',
      discountPercent: 0,
      code: '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      redemptions: 0,
      maxRedemptions: 100,
      termsAndConditions: 'See Groupon listing for full terms.',
      sourceUrl: href.startsWith('http') ? href : `https://www.groupon.com${href}`,
      source: 'groupon' as const,
    });
  });

  return deals;
}

// ─── Reddit scraper (public JSON API — no key needed) ─────────────────────

async function scrapeReddit(city: string): Promise<DealWithBusiness[]> {
  const query = encodeURIComponent(`deals discount coupon ${city}`);
  const url = `https://www.reddit.com/search.json?q=${query}&sort=new&t=week&limit=20&type=link`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'LocalDealsApp/1.0 (community deal finder)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);

  const json = await res.json();
  const posts: unknown[] = json?.data?.children ?? [];

  return posts
    .map((child: unknown, idx: number) => {
      const post = ((child as Record<string, unknown>).data ?? {}) as Record<string, unknown>;
      const title = String(post.title ?? '');
      if (!title) return null;

      // Try to extract a discount % from the title (e.g. "50% off", "$10 off")
      const pctMatch = title.match(/(\d+)\s*%\s*off/i);
      const discountPercent = pctMatch ? parseInt(pctMatch[1], 10) : 0;

      // Try to extract a promo code (e.g. "use code SAVE20")
      const codeMatch = title.match(/(?:code|promo|coupon)[:\s]+([A-Z0-9_-]{4,20})/i);
      const code = codeMatch ? codeMatch[1].toUpperCase() : '';

      const subreddit = String(post.subreddit ?? 'deals');
      const permalink = String(post.permalink ?? '');

      return {
        id: String(post.id ?? `r-${idx}`),
        businessId: `biz-r-${idx}`,
        _businessName: `r/${subreddit}`,
        _businessCategory: subreddit,
        _businessAddress: city,
        title: title.slice(0, 120),
        description: (String(post.selftext ?? '').slice(0, 200) || 'Community-shared deal. Click to view details.'),
        discountPercent,
        code,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        redemptions: (post.score as number) ?? 0,
        maxRedemptions: 9999,
        termsAndConditions: 'Community post — verify deal details at the source.',
        sourceUrl: `https://www.reddit.com${permalink}`,
        source: 'reddit' as const,
      } satisfies DealWithBusiness;
    })
    .filter((d): d is DealWithBusiness => d !== null);
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const city = searchParams.get('city') ?? '';

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const results = await Promise.allSettled([
    scrapeGroupon(lat, lng),
    scrapeReddit(city),
  ]);

  const grouponDeals =
    results[0].status === 'fulfilled' ? results[0].value : [];
  const redditDeals =
    results[1].status === 'fulfilled' ? results[1].value : [];

  if (results[0].status === 'rejected') {
    console.error('Groupon scrape failed:', (results[0] as PromiseRejectedResult).reason);
  }
  if (results[1].status === 'rejected') {
    console.error('Reddit scrape failed:', (results[1] as PromiseRejectedResult).reason);
  }

  const allDeals: DealWithBusiness[] = [...grouponDeals, ...redditDeals];

  // Split into deals + businesses arrays for the client
  const businesses: Business[] = allDeals.map((d) => ({
    id: d.businessId,
    name: d._businessName,
    category: d._businessCategory,
    state: d._businessAddress,
    address: d._businessAddress,
  }));

  const deals: Deal[] = allDeals.map(({ _businessName, _businessCategory, _businessAddress, ...d }) => d);

  return NextResponse.json(
    { deals, businesses, sources: { groupon: grouponDeals.length, reddit: redditDeals.length } },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' } }
  );
}
