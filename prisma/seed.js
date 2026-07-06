const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const BASE = 'https://eghuri.com';

async function fetchHTML(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SeedBot/1.0)' },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

function parsePrice(text) {
  if (!text) return null;
  const n = parseFloat(text.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

// ——————— Step 1: Categories from mobile-menu ———————
async function scrapeCategories() {
  console.log('Fetching homepage…');
  const html = await fetchHTML(BASE);
  const $ = cheerio.load(html);

  const cats = [];

  $('.mobile-menu .first-nav > .parent-category').each((_, el) => {
    const $el = $(el);
    const $link = $el.find('> a.menu-category-name');
    const href = $link.attr('href') || '';
    const name = $link.clone().children().remove().end().text().trim();
    const image = $link.find('img.side_cat_img').attr('src') || '';
    const slug = href.replace(/^https?:\/\/[^\/]+\/category\//, '');

    if (!slug || href.includes('order-track')) return;

    const subs = [];
    $el.find('.second-nav > .parent-subcategory').each((_, subEl) => {
      const $a = $(subEl).find('> .menu-subcategory-name');
      const sh = $a.attr('href') || '';
      const sn = $a.text().trim();
      const ss = sh.replace(/^https?:\/\/[^\/]+\/subcategory\//, '');
      if (sn) subs.push({ name: sn, slug: ss, href: sh });
    });

    cats.push({
      name,
      slug,
      image: image || null,
      href: href.startsWith('http') ? href : BASE + href,
      subs,
    });
  });

  console.log(`  → ${cats.length} categories`);
  return cats;
}

// ——————— Step 2: Product URLs from a category page ———————
async function scrapeCategoryProducts(url) {
  const products = [];
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    $('.product_item.wist_item').each((_, el) => {
      const $e = $(el);
      const $imgLink = $e.find('.pro_img a');
      const $nameLink = $e.find('.pro_name a');

      const productUrl = $imgLink.attr('href') || $nameLink.attr('href') || '';
      const name = $nameLink.text().trim();
      const image = $e.find('.pro_img img').attr('src') || '';

      const $price = $e.find('.pro_price p');
      let uPrice = null, sPrice = null;
      const $del = $price.find('del');
      if ($del.length) {
        uPrice = parsePrice($del.text());
        sPrice = parsePrice($price.clone().children('del').remove().end().text());
      } else {
        uPrice = parsePrice($price.text());
      }

      if (productUrl && name) {
        const full = productUrl.startsWith('http') ? productUrl : BASE + productUrl;
        const slug = full.replace(/^https?:\/\/[^\/]+\/product\//, '');
        products.push({ name, slug, url: full, image, unitePrice: uPrice, salePrice: sPrice });
      }
    });
  } catch (e) {
    console.error(`    ✗ ${e.message}`);
  }
  return products;
}

// ——————— Step 3: Product detail + breadcrumb ———————
async function scrapeProductDetail(url) {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const title = $('.product-cart .name').text().trim() ||
      $('title').text().replace(' - Eghuri', '').trim();

    const $price = $('.details-price');
    let uPrice = null, sPrice = null;
    const $del = $price.find('del');
    if ($del.length) {
      uPrice = parsePrice($del.text());
      sPrice = parsePrice($price.clone().children('del').remove().end().text());
    } else {
      sPrice = parsePrice($price.text());
      uPrice = sPrice;
    }

    const images = [];
    $('.details_slider .dimage_item img').each((_, el) => {
      const src = $(el).attr('src');
      if (src) images.push(src);
    });

    let description = '';
    const $desc = $('#description');
    if ($desc.length) description = $desc.html()?.trim() || '';

    // Breadcrumb → determine correct category / subcategory
    let breadcrumbCatSlug = null;
    let breadcrumbSubName = null;

    const $crumbs = $('.breadcrumb ul li a');
    $crumbs.each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      const m = href.match(/\/category\/(.+)$/);
      if (m) breadcrumbCatSlug = m[1];
    });

    // subcategory is the last <li> <a> whose href is "#" or empty
    const $allLis = $('.breadcrumb ul li');
    $allLis.each((i, li) => {
      const $a = $(li).find('a');
      const href = $a.attr('href') || '';
      const text = $a.text().trim();
      // skip Home (first) and category link
      if (i === 0) return;
      if (i === 1) return; // the "/" separator
      if (href.includes('/category/')) return;
      if (text && (href === '#' || href === '')) {
        breadcrumbSubName = text;
      }
    });

    // Variants (size / color)
    const variants = [];
    const $sizeSel = $('select[name="product_size"]');
    const $colorSel = $('select[name="product_color"]');

    if ($sizeSel.length && $colorSel.length) {
      const sizes = [];
      $sizeSel.find('option').each((_, el) => {
        const v = $(el).val(); if (v) sizes.push(v);
      });
      const colors = [];
      $colorSel.find('option').each((_, el) => {
        const v = $(el).val(); if (v) colors.push(v);
      });
      if (sizes.length && colors.length) {
        sizes.forEach((size, si) => {
          colors.forEach((color, ci) => {
            variants.push({
              sku: `${slugify(title)}-${slugify(size)}-${slugify(color)}`.slice(0, 100),
              size, color,
              price: uPrice, sale_price: sPrice,
              inventoryQuantity: 100,
              isDefault: si === 0 && ci === 0,
            });
          });
        });
      }
    } else if ($sizeSel.length) {
      $sizeSel.find('option').each((i, el) => {
        const v = $(el).val(); if (!v) return;
        variants.push({
          sku: `${slugify(title)}-${slugify(v)}`.slice(0, 100),
          size: v, color: null,
          price: uPrice, sale_price: sPrice,
          inventoryQuantity: 100,
          isDefault: i === 0,
        });
      });
    } else if ($colorSel.length) {
      $colorSel.find('option').each((i, el) => {
        const v = $(el).val(); if (!v) return;
        variants.push({
          sku: `${slugify(title)}-${slugify(v)}`.slice(0, 100),
          size: null, color: v,
          price: uPrice, sale_price: sPrice,
          inventoryQuantity: 100,
          isDefault: i === 0,
        });
      });
    }

    return {
      title,
      unitePrice: uPrice || 0,
      salePrice: sPrice,
      images,
      description,
      variants,
      breadcrumbCatSlug,
      breadcrumbSubName,
    };
  } catch (e) {
    console.error(`    ✗ ${e.message}`);
    return null;
  }
}

// ——————— Main ———————
async function main() {
  console.log('=== eghuri.com scraper seed ===\n');

  // 1. Scrape categories & subcategories from homepage
  const cats = await scrapeCategories();

  // Build lookup: normalized name → slug (for matching breadcrumb text to slugs)
  const nameToSlug = {};
  for (const c of cats) {
    nameToSlug[c.name.toLowerCase()] = c.slug;
    for (const s of c.subs) {
      nameToSlug[s.name.toLowerCase()] = s.slug;
    }
  }

  // 2. Seed categories (parents first, then children with parentId)
  console.log('\nSeeding categories…');
  const catMap = {};
  for (const c of cats) {
    const r = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, image: c.image },
      create: {
        name: c.name,
        slug: c.slug,
        image: c.image,
        description: `Products in ${c.name}.`,
      },
    });
    catMap[c.slug] = r.id;
    console.log(`  ✓ ${c.name}`);

    for (const s of c.subs) {
      const sr = await prisma.category.upsert({
        where: { slug: s.slug },
        update: { name: s.name, parentId: r.id },
        create: { name: s.name, slug: s.slug, description: `Products in ${s.name}.`, parentId: r.id },
      });
      catMap[s.slug] = sr.id;
      console.log(`    ✓ ${s.name}`);
    }
  }

  // 3. Collect all product URLs from every category page
  console.log('\nScraping products…');
  const all = [];
  const seen = new Set();

  for (const c of cats) {
    const pp = await scrapeCategoryProducts(c.href);
    console.log(`  ${c.name}: ${pp.length} products`);
    for (const p of pp) {
      if (!seen.has(p.url)) { seen.add(p.url); all.push(p); }
    }
    for (const s of c.subs) {
      const url = s.href.startsWith('http') ? s.href : BASE + s.href;
      const sp = await scrapeCategoryProducts(url);
      console.log(`    ${s.name}: ${sp.length} products`);
      for (const p of sp) {
        if (!seen.has(p.url)) { seen.add(p.url); all.push(p); }
      }
    }
  }

  console.log(`\nTotal unique products: ${all.length}`);

  // 4. Fetch details + seed, assigning to correct subcategory via breadcrumb
  console.log('\nFetching details & seeding…');
  let done = 0;
  const CONC = 5;

  for (let i = 0; i < all.length; i += CONC) {
    const batch = all.slice(i, i + CONC);
    const results = await Promise.all(
      batch.map(async (p) => {
        const d = await scrapeProductDetail(p.url);
        return { ...p, detail: d };
      }),
    );

    for (const p of results) {
      if (!p.detail) continue;
      const d = p.detail;

      // Determine the correct category slug from the breadcrumb
      let targetSlug = null;

      if (d.breadcrumbSubName) {
        // Try to find the subcategory slug by name
        const subSlug = nameToSlug[d.breadcrumbSubName.toLowerCase()];
        if (subSlug && catMap[subSlug]) {
          targetSlug = subSlug;
        }
      }

      // Fall back to the breadcrumb parent category slug
      if (!targetSlug && d.breadcrumbCatSlug && catMap[d.breadcrumbCatSlug]) {
        targetSlug = d.breadcrumbCatSlug;
      }

      // Last resort: try to find any matching category in our DB
      if (!targetSlug) {
        for (const [slug] of Object.entries(catMap)) {
          if (p.slug.startsWith(slug.replace(/-/g, ''))) {
            targetSlug = slug;
            break;
          }
        }
      }

      try {
        const catId = targetSlug ? catMap[targetSlug] : undefined;
        await prisma.product.upsert({
          where: { slug: p.slug },
          update: {},
          create: {
            title: d.title || p.name,
            slug: p.slug,
            description: d.description || null,
            unite_price: d.unitePrice,
            sale_price: d.salePrice || null,
            compareAtPrice:
              d.unitePrice !== d.salePrice ? d.unitePrice : null,
            inventoryQuantity: 100,
            status: 'publish',
            categories: catId ? { connect: { id: catId } } : undefined,
            images: {
              create:
                d.images.length > 0
                  ? d.images.map((img, idx) => ({
                      image_path: img,
                      altText:
                        idx === 0 ? d.title : `${d.title} — Image ${idx + 1}`,
                    }))
                  : [{ image_path: p.image, altText: d.title }],
            },
            variants:
              d.variants.length > 0
                ? { create: d.variants }
                : undefined,
          },
        });
        done++;
        if (done % 10 === 0 || done === all.length)
          console.log(`  ${done}/${all.length}`);
      } catch (e) {
        console.error(`  ✗ ${p.name}: ${e.message}`);
      }
    }
  }

  console.log(`\nSeeded ${done} products.`);

  // 5. Users
  console.log('\nSeeding users…');
  const hash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: hash, role: 'admin' },
    create: { name: 'Admin User', email: 'admin@example.com', passwordHash: hash, role: 'admin' },
  });
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: { name: 'Test Customer', email: 'customer@example.com', passwordHash: 'customer-hash', role: 'customer' },
  });

  // 6. Site settings
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
      announcementText: 'Free shipping on orders over ৳1,000 — Call or WhatsApp: 01945090085',
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
      announcementText: 'Free shipping on orders over ৳1,000 — Call or WhatsApp: 01945090085',
    },
  });

  // 7. Hero sliders
  console.log('\nSeeding hero sliders…');
  const heroSlides = [
    { title: 'Modern Furniture Collection', subtitle: 'Discover premium furniture & decor', buttonText: 'Shop Now', buttonLink: '/products', image: 'https://picsum.photos/seed/furniture1/1400/500', order: 0 },
    { title: 'Elegant Home Decor', subtitle: 'Transform your living space', buttonText: 'Explore', buttonLink: '/products', image: 'https://picsum.photos/seed/furniture2/1400/500', order: 1 },
    { title: 'Premium Cabinet Designs', subtitle: 'Crafted with precision and care', buttonText: 'View Collection', buttonLink: '/products', image: 'https://picsum.photos/seed/furniture3/1400/500', order: 2 },
  ];
  for (const slide of heroSlides) {
    await prisma.heroSlider.create({ data: slide });
  }

  // 8. Social links
  console.log('\nSeeding social links…');
  const socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com/radiantpicks', icon: 'facebook', order: 0 },
    { name: 'Instagram', url: 'https://instagram.com/radiantpicks', icon: 'instagram', order: 1 },
    { name: 'YouTube', url: 'https://youtube.com/@radiantpicks', icon: 'youtube', order: 2 },
  ];
  for (const link of socialLinks) {
    await prisma.socialLink.create({ data: link });
  }

  console.log('\n=== Seed complete ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
