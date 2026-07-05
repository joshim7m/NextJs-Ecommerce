const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding site settings...');

  await prisma.siteSetting.upsert({
    where: { id: 'singleton' },
    update: {
      siteName: 'Radiant Picks',
      logo: '/uploads/settings/radiant-picks-logo.png',
      favicon: '/uploads/settings/favicon.png',
      mobile: '01945090085',
      email: 'hello@radiantpicks.com',
      address: '6/C, Unite-2, Confidence Center, Shahjadpur, Gulshan, Dhaka-1212',
      copyrightText: '@ 2025 Radiant Picks. All rights reserved.',
    },
    create: {
      id: 'singleton',
      siteName: 'Radiant Picks',
      logo: '/uploads/settings/radiant-picks-logo.png',
      favicon: '/uploads/settings/favicon.png',
      mobile: '01945090085',
      email: 'hello@radiantpicks.com',
      address: '6/C, Unite-2, Confidence Center, Shahjadpur, Gulshan, Dhaka-1212',
      copyrightText: '@ 2025 Radiant Picks. All rights reserved.',
    },
  });

  console.log('Site settings seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
