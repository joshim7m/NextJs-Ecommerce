// One-off: back up the Product.description values that the rich-text backfill
// (Option B in docs/product-description-specification.md §3.3) is allowed to touch.
// Those are exactly the rows whose description contains no "<" character, i.e. the
// ones still holding legacy plain text rather than HTML.
//
// Writes prisma/backups/product-description-pre-html-<timestamp>.json.
//
// Run:  DATABASE_URL=... node prisma/backupProductDescriptions.js

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
    where: { description: { not: null } },
    select: { id: true, title: true, description: true },
    orderBy: { createdAt: 'asc' },
  });

  const legacy = rows.filter((r) => !r.description.includes('<'));

  const outDir = path.join(__dirname, 'backups');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(outDir, `product-description-pre-html-${stamp}.json`);

  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        takenAt: new Date().toISOString(),
        note: 'Legacy plain-text Product.description rows captured before the HTML backfill. Restore with prisma.product.update({ where: { id }, data: { description } }) using the values below.',
        rows: legacy.map(({ id, title, description }) => ({ id, title, description })),
      },
      null,
      2
    )
  );

  console.log(`backed up ${legacy.length} legacy plain-text description(s) -> ${outFile}`);
  legacy.forEach((r) => console.log(`  - ${r.title}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
