// One-off backfill — Option B in docs/product-description-specification.md §3.3.
//
// Product.description is switching from plain text to HTML (TipTap output). Plain text
// is valid HTML so nothing crashes either way, but a legacy value renders as one
// unstyled block with collapsed newlines. This wraps legacy plain text in <p> tags,
// splitting on blank lines, and skips any row that already contains "<" (already HTML).
//
// Idempotent: after a successful run every row contains "<", so re-running is a no-op.
//
// Take a backup first:  node prisma/backupProductDescriptions.js
//
// Run:  DATABASE_URL=... node prisma/backfillProductDescriptions.js
//
// NOTE: this does not HTML-escape the inner text. That is correct here because the
// source is plain text typed by admins. If this is ever pointed at untrusted input,
// escape the inner text first.

const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Export it (it lives in .env) and re-run.');
  process.exit(1);
}

const prisma = new PrismaClient();

function wrapInParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('');
}

async function main() {
  const rows = await prisma.product.findMany({
    where: { description: { not: null } },
    select: { id: true, title: true, description: true },
  });

  let changed = 0;
  for (const { id, title, description } of rows) {
    if (description.includes('<')) continue; // already HTML — leave alone

    await prisma.product.update({
      where: { id },
      data: { description: wrapInParagraphs(description) },
    });
    changed++;
    console.log(`  wrapped: ${title}`);
  }

  console.log(`wrapped ${changed} description(s) of ${rows.length} non-null row(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
