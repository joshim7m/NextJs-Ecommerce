// One-off: NULL out rich-text fields that hold no visible content.
//
// An untouched TipTap editor serialises to `<p></p>`, so saving a product without touching
// the description wrote an empty *document* into a non-null column. On the storefront that
// renders as a blank panel instead of "No description available.", because the fallback was
// a truthiness test and `<p></p>` is a non-empty string.
//
// This is now prevented at the source — src/actions/products.js runs every description and
// specification through normalizeRichText() — so this script only has to clean up the rows
// written before that. It is deliberately conservative: a value is cleared only when it has
// no text AND no media/table, i.e. when it would render as nothing at all.
//
// Idempotent: after a successful run no such row remains.
//
// Take a backup first:  node prisma/backupProductRichText.js
// Run:                   DATABASE_URL=... node prisma/cleanEmptyRichText.js

const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Export it (it lives in .env) and re-run.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  // src/lib/richText.js is ESM and this script is CommonJS (like its siblings), so pull the
  // shared emptiness test in dynamically rather than duplicating the rule.
  const { hasVisibleContent } = await import('../src/lib/richText.js');

  const rows = await prisma.product.findMany({
    where: { OR: [{ description: { not: null } }, { specification: { not: null } }] },
    select: { id: true, slug: true, description: true, specification: true },
  });

  let cleared = 0;
  const skipped = [];

  for (const { id, slug, description, specification } of rows) {
    const data = {};
    if (description != null && !hasVisibleContent(description)) data.description = null;
    if (specification != null && !hasVisibleContent(specification)) data.specification = null;

    if (!Object.keys(data).length) {
      skipped.push(slug);
      continue;
    }

    await prisma.product.update({ where: { id }, data });
    cleared++;
    console.log(`  cleared ${Object.keys(data).join(' + ')}: ${slug}`);
  }

  console.log(`\ncleared ${cleared} product(s); left ${skipped.length} with real content untouched`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
