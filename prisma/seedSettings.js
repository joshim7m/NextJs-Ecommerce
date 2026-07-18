const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const startTime = Date.now();
  console.log('=== Seed Start ===\n');

  // 1. Users
  console.log('Seeding users…');
  const hash = await bcrypt.hash('histacin', 12);
  await prisma.user.upsert({
    where: { email: 'joshimfv@gmail.com' },
    update: { passwordHash: hash, role: 'admin' },
    create: { name: 'Joshim', email: 'joshimfv@gmail.com', passwordHash: hash, role: 'admin' },
  });
  console.log('  ✓ Admin user');

  // 2. Site settings
  console.log('\nSeeding site settings…');
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
      announcementText: 'Call or WhatsApp: 01945090085',
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
      announcementText: 'Call or WhatsApp: 01945090085',
    },
  });
  console.log('  ✓ Site settings');

  // 3. Hero sliders
  console.log('\nSeeding hero sliders…');
  const heroSlides = [
    { title: 'Modern Furniture Collection', subtitle: 'Discover premium furniture & decor', buttonText: 'Shop Now', buttonLink: '/products', image: 'https://picsum.photos/seed/furniture1/1400/500', order: 0 },
    { title: 'Elegant Home Decor', subtitle: 'Transform your living space', buttonText: 'Explore', buttonLink: '/products', image: 'https://picsum.photos/seed/furniture2/1400/500', order: 1 },
    { title: 'Premium Cabinet Designs', subtitle: 'Crafted with precision and care', buttonText: 'View Collection', buttonLink: '/products', image: 'https://picsum.photos/seed/furniture3/1400/500', order: 2 },
  ];
  for (const slide of heroSlides) {
    await prisma.heroSlider.create({ data: slide });
  }
  console.log(`  ✓ ${heroSlides.length} slides`);

  // 4. Social links
  console.log('\nSeeding social links…');
  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com/radiantpicks', icon: 'facebook', order: 0 },
    { name: 'Instagram', url: 'https://instagram.com/radiantpicks', icon: 'instagram', order: 1 },
    { name: 'YouTube', url: 'https://youtube.com/@radiantpicks', icon: 'youtube', order: 2 },
  ];
  for (const link of socialLinks) {
    await prisma.socialLink.create({ data: link });
  }
  console.log(`  ✓ ${socialLinks.length} social links`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Seed complete in ${elapsed}s ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
