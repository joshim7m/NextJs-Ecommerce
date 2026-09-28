import { NextResponse } from 'next/server';
import { getUpsellAddOns } from '../../../src/lib/recommendations';

export const dynamic = 'force-dynamic';

// Prisma ids are cuid or uuid. Filtering before the query means a junk id can
// never reach the database, and the cap below bounds the query itself.
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const MAX_IDS = 20;
const MIN_LIMIT = 1;
const MAX_LIMIT = 6;

/**
 * GET /api/recommendations?ids=<csv>&limit=3
 *   → 200 { products: [...], source: 'curated' | 'auto' | 'mixed' }
 *
 * The caller's id list doubles as `excludeIds`, so a product already in the
 * cart is never recommended back. Only published, in-stock products are ever
 * selected, and every field returned is already public on the storefront — the
 * id cap and limit clamp are the only abuse controls required.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const ids = (searchParams.get('ids') || '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => ID_PATTERN.test(id))
    .slice(0, MAX_IDS);

  const rawLimit = Number.parseInt(searchParams.get('limit'), 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, rawLimit)) : 3;

  if (ids.length === 0) {
    return NextResponse.json({ products: [], source: 'auto' });
  }

  try {
    const { products, source } = await getUpsellAddOns({ seedIds: ids, excludeIds: ids, limit });
    return NextResponse.json({ products, source });
  } catch (error) {
    // Logged so a real failure is visible, but the client still gets a valid
    // empty list: this rail must never be able to take down cart or checkout.
    console.error('[recommendations] failed to build add-ons', error);
    return NextResponse.json({ products: [], source: 'auto' });
  }
}
