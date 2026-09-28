// One-off: back up every Product.description / Product.specification before the
// empty-rich-text cleanup (prisma/cleanEmptyRichText.js).
//
// That cleanup only ever NULLs values with no visible content — an empty TipTap document
// (`<p></p>`, `<p><br></p>`, …). Nothing with text, images or tables is touched, so this
// backup is a safety net rather than a prerequisite, but it costs nothing to take.
//
// Writes prisma/backups/product-richtext-<timestamp>.json.
//
// Run:  DATABASE_URL=... node prisma/backupProductRichText.js

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Export it (it lives in .env) and re-run.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.product.findMany({
    where: { OR: [{ description: { not: null } }, { specification: { not: null } }] },
    select: { id: true, slug: true, title: true, description: true, specification: true },
    orderBy: { createdAt: 'asc' },
  });

  const outDir = path.join(__dirname, 'backups');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(outDir, `product-richtext-${stamp}.json`);

  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        takenAt: new Date().toISOString(),
        note: 'Product.description / Product.specification captured before the empty-rich-text cleanup. Restore with prisma.product.update({ where: { id }, data: { description, specification } }).',
        rows,
      },
      null,
      2
    )
  );

  console.log(`backed up ${rows.length} product(s) with rich text -> ${outFile}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
