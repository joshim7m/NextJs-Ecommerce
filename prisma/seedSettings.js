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
      announcementText: 'আপনাকে স্বাগতম। বাংলাদেশের বিশ্বস্ত অনলাইন শপ। সারাদেশে ক্যাশ অন ডেলিভারি (৪৮ থেকে ৭২ ঘণ্টার মধ্যে নিশ্চিত ডেলিভারি) হটলাইন 01945090085',
      aboutCompany: `Welcome to Radiant Picks, your trusted online hub for premium lifestyle products in Bangladesh. We bring you a curated collection of modern apparel, comfortable sleepwear, premium lingerie, stylish footwear, beauty essentials, and smart home gadgets.`,
      aboutCompanyBn: `রেডিয়্যান্ট পিকস (Radiant Picks)-এ আপনাকে স্বাগতম—যা বাংলাদেশে প্রিমিয়াম লাইফস্টাইল পণ্য কেনাকাটার একটি নির্ভরযোগ্য অনলাইন মাধ্যম। আমরা নিয়ে এসেছি আধুনিক পোশাক, আরামদায়ক স্লিপওয়্যার, এক্সক্লুসিভ লিঞ্জেরি, ট্রেন্ডি জুতো, রূপচর্চার সামগ্রী এবং স্মার্ট কিচেন ও হোম গ্যাজেটসের চমৎকার কালেকশন।`,
      metaTitle: 'Radiant Picks',
      metaDescription: 'Shop premium lingerie, bras, panties, nightwear, and women\'s intimate apparel at Radiant Picks. Discreet packaging, cash on delivery, and free shipping options across Bangladesh.',
      metaKeywords: 'lingerie Bangladesh, bra shop online BD, panty buy Bangladesh, nightwear for women Bangladesh, women innerwear online Dhaka, intimate apparel Bangladesh',
      // Admin-managed site config — drives canonical/OG/sitemap/robots host
      // (DB value overrides NEXT_PUBLIC_SITE_URL without a rebuild).
      siteUrl: 'https://radiantpicksbd.com',
      // Reserved for admin session signing; auth still reads JWT_SECRET env
      // until the session flow is wired to the DB.
      jwtSecret: 'gcGoOcp3UM1Fzr7p7Tqtkon8UmSt5fWOXSb92FFlMLQ',
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
      announcementText: 'আপনাকে স্বাগতম। বাংলাদেশের বিশ্বস্ত অনলাইন শপ। সারাদেশে ক্যাশ অন ডেলিভারি (৪৮ থেকে ৭২ ঘণ্টার মধ্যে নিশ্চিত ডেলিভারি) হটলাইন 01945090085',
      aboutCompany: `Radiant Picks is a trusted online shopping destination in Bangladesh for premium lifestyle products. Explore modern apparel, comfortable sleepwear, premium lingerie, stylish footwear, beauty essentials, and smart home gadgets—all carefully selected for quality, style, comfort, and everyday convenience.`,
      aboutCompanyBn: `রেডিয়্যান্ট পিকস (Radiant Picks) বাংলাদেশের একটি বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। এখানে পাবেন আধুনিক পোশাক, আরামদায়ক স্লিপওয়্যার, প্রিমিয়াম লিঞ্জেরি, স্টাইলিশ জুতো, বিউটি এসেনশিয়ালস এবং স্মার্ট হোম গ্যাজেটস—মান, স্টাইল ও দৈনন্দিন সুবিধার কথা মাথায় রেখে নির্বাচিত পণ্য।`,
      metaTitle: '| Radiant Picks Bangladesh',
      metaDescription: 'Shop premium lifestyle products in Bangladesh at Radiant Picks. Discover modern apparel, sleepwear, lingerie, footwear, beauty essentials, and smart home gadgets at great prices.',
      metaKeywords: 'Radiant Picks, online shopping Bangladesh, lifestyle products Bangladesh, premium products Bangladesh, apparel, sleepwear, lingerie, footwear, beauty products, home gadgets, smart home gadgets, online store Bangladesh',

      // site config — same names as the schema (camelCase)
      siteUrl: 'https://radiantpicksbd.com',
      jwtSecret: 'gcGoOcp3UM1Fzr7p7Tqtkon8UmSt5fWOXSb92FFlMLQ',
      telegramBotToken: '8977559529:AAHBAeReqlbiAvpFWqF__58C0nzG4uTE2uA',
      telegramChatId: '7545635440',
      gtmId: 'GTM-5CW9J5HQ',
      whatsappNumber: '+8801945090085'
    },
  });
  console.log('  ✓ Site settings');

  // 3. Hero sliders
  console.log('\nSeeding hero sliders…');
  const heroSlides = [
    { title: "Comfortable Women's Sleepwear & Nightwear", subtitle: 'Soft, cozy sleepwear sets designed for ultimate comfort — shop dresses, shorts & loungewear', buttonText: 'Shop Sleepwear', buttonLink: '/products', image: 'https://picsum.photos/seed/sleepwear1/1400/500', order: 0 },
    { title: 'Premium Lingerie & Intimates Collection', subtitle: 'Elegant bra sets, stockings & lingerie — find your perfect fit with fast delivery in Bangladesh', buttonText: 'Explore Lingerie', buttonLink: '/products', image: 'https://picsum.photos/seed/lingerie1/1400/500', order: 1 },
    { title: 'Beauty & Personal Care Essentials', subtitle: 'Skincare, haircare & grooming products to elevate your daily self-care routine', buttonText: 'Shop Beauty', buttonLink: '/products', image: 'https://picsum.photos/seed/beauty1/1400/500', order: 2 },
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