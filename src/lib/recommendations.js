import prisma from './prisma';

// Server-only merchandising engine. Curated picks win; automatic scoring fills
// the gap so a product with no curated upsells still gets recommendations.
// Not importable from client components — it talks to Prisma.

export const RECOMMEND_INCLUDE = { images: true, variants: true };

const PUBLISHED = 'publish';

// Candidates are scored in memory, so the pool is deliberately wider than the
// handful of cards a rail can ever show.
const CANDIDATE_POOL = 40;

const PRICE_BAND = 0.3;

export const serialize = (obj) => JSON.parse(JSON.stringify(obj));

function effectivePrice(product) {
  return Number(product.sale_price || product.unite_price) || 0;
}

function splitTags(tags) {
  return String(tags || '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * A product with variants is in stock if any variant has quantity > 0.
 * Otherwise fall back to the base quantity. A null base quantity is treated as
 * "unknown, assume available", matching how the PDP decides to show the
 * "Out of Stock" chip.
 */
export function isInStock(product) {
  if (!product) return false;

  const variants = product.variants || [];
  if (variants.length > 0) return variants.some((variant) => Number(variant.quantity) > 0);

  if (product.quantity == null) return true;
  return product.quantity > 0;
}

function scoreCandidate(candidate, seedCategoryIds, seedTags, seedPrices) {
  const sharedCategories = (candidate.categories || []).filter((cat) => seedCategoryIds.has(cat.id)).length;

  const candidateTags = new Set(splitTags(candidate.tags));
  let sharedTags = 0;
  candidateTags.forEach((tag) => {
    if (seedTags.has(tag)) sharedTags += 1;
  });

  const price = effectivePrice(candidate);
  const inPriceBand =
    price > 0 && seedPrices.some((seedPrice) => seedPrice > 0 && Math.abs(price - seedPrice) / seedPrice <= PRICE_BAND);

  // Category overlap is the strongest relevance signal available, tags are the
  // merchandiser's own keyword layer, the price band stops a ৳200 item being
  // suggested next to a ৳20,000 one, and `featured` is only a tiebreak.
  return (
    3 * sharedCategories +
    2 * sharedTags +
    (inPriceBand ? 1 : 0) +
    (candidate.isFeatured ? 0.5 : 0)
  );
}

// Featured first, then newest — so a rail never renders short while stock
// exists, matching the hot-sales page's convention.
async function backfill({ banned, remaining, isFeatured }) {
  if (remaining <= 0) return [];

  const rows = await prisma.product.findMany({
    where: {
      status: PUBLISHED,
      id: { notIn: banned },
      ...(isFeatured ? { isFeatured: true } : {}),
    },
    include: RECOMMEND_INCLUDE,
    // Over-fetch, then filter on stock: a product that cannot be bought must
    // not eat a slot the rail is going to render empty.
    take: remaining * 3,
    orderBy: { createdAt: 'desc' },
  });

  return rows.filter(isInStock).slice(0, remaining);
}

/**
 * Automatic recommendations, ordered by relevance.
 * Returns up to `limit` published, in-stock products, none of which are the
 * seeds or the explicitly excluded ids.
 */
export async function getAutoRelated({ seedIds = [], excludeIds = [], limit = 6 } = {}) {
  const seeds = [...new Set(seedIds.filter(Boolean))];
  if (seeds.length === 0 || limit <= 0) return [];

  const banned = [...new Set([...seeds, ...excludeIds.filter(Boolean)])];

  const seedRows = await prisma.product.findMany({
    where: { id: { in: seeds } },
    select: {
      id: true,
      tags: true,
      unite_price: true,
      sale_price: true,
      categories: { select: { id: true } },
    },
  });

  // No real seed means there is nothing to be related to. Returning the
  // backfill here would answer every unrecognised id with the same generic
  // rail, which is noise rather than a recommendation.
  if (seedRows.length === 0) return [];

  const seedCategoryIds = new Set();
  const seedTags = new Set();
  const seedPrices = [];
  seedRows.forEach((seed) => {
    (seed.categories || []).forEach((cat) => seedCategoryIds.add(cat.id));
    splitTags(seed.tags).forEach((tag) => seedTags.add(tag));
    seedPrices.push(effectivePrice(seed));
  });

  const picked = [];

  if (seedCategoryIds.size > 0) {
    const candidates = await prisma.product.findMany({
      where: {
        status: PUBLISHED,
        id: { notIn: banned },
        categories: { some: { id: { in: [...seedCategoryIds] } } },
      },
      include: { ...RECOMMEND_INCLUDE, categories: { select: { id: true } } },
      take: CANDIDATE_POOL,
      orderBy: { createdAt: 'desc' },
    });

    candidates
      .filter(isInStock)
      .map((candidate) => ({
        candidate,
        score: scoreCandidate(candidate, seedCategoryIds, seedTags, seedPrices),
      }))
      .sort((a, b) => b.score - a.score || b.candidate.createdAt - a.candidate.createdAt)
      .forEach(({ candidate }) => {
        if (picked.length < limit) picked.push(candidate);
      });
  }

  if (picked.length < limit) {
    const taken = [...banned, ...picked.map((product) => product.id)];
    picked.push(...(await backfill({ banned: taken, remaining: limit - picked.length, isFeatured: true })));
  }

  if (picked.length < limit) {
    const taken = [...banned, ...picked.map((product) => product.id)];
    picked.push(...(await backfill({ banned: taken, remaining: limit - picked.length, isFeatured: false })));
  }

  return picked.map(serialize);
}

/**
 * Curated upsells first, automatic scoring as the fallback.
 * `source` reports which path filled the rail so merchandising can be measured.
 */
export async function getUpsellAddOns({ seedIds = [], excludeIds = [], limit = 3 } = {}) {
  const seeds = [...new Set(seedIds.filter(Boolean))];
  const excluded = [...new Set(excludeIds.filter(Boolean))];

  if (seeds.length === 0 || limit <= 0) return { products: [], source: 'auto' };

  const rows = await prisma.productUpsell.findMany({
    where: { productId: { in: seeds }, upsellId: { notIn: excluded } },
    include: { upsell: { include: RECOMMEND_INCLUDE } },
    orderBy: { sortOrder: 'asc' },
  });

  const seen = new Set(excluded);
  const products = [];

  for (const row of rows) {
    const candidate = row.upsell;
    if (!candidate || candidate.status !== PUBLISHED || !isInStock(candidate) || seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    products.push(candidate);
    if (products.length >= limit) break;
  }

  const curatedCount = products.length;

  if (curatedCount < limit) {
    const auto = await getAutoRelated({
      seedIds: seeds,
      excludeIds: [...excluded, ...products.map((product) => product.id)],
      limit: limit - curatedCount,
    });
    products.push(...auto);
  }

  const source = curatedCount === 0 ? 'auto' : curatedCount >= limit ? 'curated' : 'mixed';

  return { products: products.map(serialize), source };
}
