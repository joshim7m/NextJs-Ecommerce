const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Kitchen', slug: 'kitchen', image: '', description: 'Kitchen cabinets and accessories.' },
    { name: 'Living Room', slug: 'living-room', image: '', description: 'Living room storage and decor.' },
    { name: 'Bedroom', slug: 'bedroom', image: '', description: 'Bedroom cabinets and furniture.' },
    { name: 'Bathroom', slug: 'bathroom', image: '', description: 'Bathroom organizers and vanities.' },
  ];

  const categoryRecords = [];
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    categoryRecords.push(record);
  }

  const products = [
    {
      title: 'Office Storage Cabinet',
      slug: 'office-storage-cabinet',
      description: 'A functional office storage cabinet with wooden finish.',
      unite_price: 2500,
      sale_price: 2200,
      compareAtPrice: 2800,
      inventoryQuantity: 20,
      status: 'publish',
      categorySlugs: ['living-room'],
      image: 'https://images.unsplash.com/photo-1582582494700-55f01aaf1484',
      variants: [
        { sku: 'OSC-BLK-M', size: 'Medium', color: 'Black', price: 2500, sale_price: 2200, inventoryQuantity: 10 },
        { sku: 'OSC-WHT-M', size: 'Medium', color: 'White', price: 2500, sale_price: 2300, inventoryQuantity: 5 },
      ],
    },
    {
      title: 'Modular Kitchen Cabinet',
      slug: 'modular-kitchen-cabinet',
      description: 'A modern modular kitchen cabinet set with soft-close drawers.',
      unite_price: 4600,
      sale_price: 4200,
      compareAtPrice: 5200,
      inventoryQuantity: 15,
      status: 'publish',
      categorySlugs: ['kitchen'],
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      variants: [
        { sku: 'MKC-BLK-L', size: 'Large', color: 'Black', price: 4600, sale_price: 4200, inventoryQuantity: 8 },
      ],
    },
    {
      title: 'Bedroom Wardrobe Cabinet',
      slug: 'bedroom-wardrobe-cabinet',
      description: 'A sleek wardrobe cabinet with sliding doors and shelves.',
      unite_price: 5200,
      sale_price: 4900,
      compareAtPrice: 6000,
      inventoryQuantity: 12,
      status: 'publish',
      categorySlugs: ['bedroom'],
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
      variants: [
        { sku: 'BWC-WHT-L', size: 'Large', color: 'White', price: 5200, sale_price: 4900, inventoryQuantity: 6 },
      ],
    },
    {
      title: 'Bathroom Vanity Cabinet',
      slug: 'bathroom-vanity-cabinet',
      description: 'A compact bathroom vanity cabinet with spacious storage.',
      unite_price: 3200,
      sale_price: 2900,
      compareAtPrice: 3600,
      inventoryQuantity: 10,
      status: 'publish',
      categorySlugs: ['bathroom'],
      image: 'https://images.unsplash.com/photo-1549187774-b4e9c1201e81',
      variants: [
        { sku: 'BVC-GRY-M', size: 'Medium', color: 'Gray', price: 3200, sale_price: 2900, inventoryQuantity: 4 },
      ],
    },
  ];

  const productRecords = [];
  for (const product of products) {
    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        unite_price: product.unite_price,
        sale_price: product.sale_price,
        compareAtPrice: product.compareAtPrice,
        inventoryQuantity: product.inventoryQuantity,
        status: product.status,
        categories: {
          connect: product.categorySlugs.map((slug) => ({ slug })),
        },
        images: {
          create: [
            {
              image_path: product.image,
              altText: product.title,
            },
          ],
        },
        variants: {
          create: product.variants.map((variant, index) => ({
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            sale_price: variant.sale_price,
            inventoryQuantity: variant.inventoryQuantity,
            isDefault: index === 0,
          })),
        },
      },
    });
    productRecords.push(record);
  }

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'password-hash-placeholder',
      role: 'admin',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Test Customer',
      email: 'customer@example.com',
      passwordHash: 'customer-hash-placeholder',
      role: 'customer',
    },
  });

  await prisma.order.upsert({
    where: { orderNo: 'ORDER-1001' },
    update: {},
    create: {
      orderNo: 'ORDER-1001',
      userId: customer.id,
      total: 6450,
      orderStatus: 'processing',
      paymentStatus: 'pending',
      details: {
        create: {
          user: { connect: { id: customer.id } },
          shippingAddress: 'House 14, Road 12, Dhanmondi',
          billingAddress: 'House 14, Road 12, Dhanmondi',
          phoneNumber: '01712345678',
          shippingArea: 'Inside Dhaka',
          deliveryCharge: 50,
        },
      },
      items: {
        create: [
          {
            productTitle: 'Office Storage Cabinet',
            itemImagePath: 'https://images.unsplash.com/photo-1582582494700-55f01aaf1484',
            purchasePrice: 2200,
            quantity: 1,
          },
          {
            productTitle: 'Modular Kitchen Cabinet',
            itemImagePath: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
            purchasePrice: 4200,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.order.upsert({
    where: { orderNo: 'ORDER-1002' },
    update: {},
    create: {
      orderNo: 'ORDER-1002',
      userId: customer.id,
      total: 7650,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      details: {
        create: {
          user: { connect: { id: customer.id } },
          shippingAddress: 'House 32, Road 5, Chattogram',
          billingAddress: 'House 32, Road 5, Chattogram',
          phoneNumber: '01887654321',
          shippingArea: 'Outside Dhaka',
          deliveryCharge: 120,
        },
      },
      items: {
        create: [
          {
            productTitle: 'Bedroom Wardrobe Cabinet',
            itemImagePath: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
            purchasePrice: 4900,
            quantity: 1,
          },
          {
            productTitle: 'Bathroom Vanity Cabinet',
            itemImagePath: 'https://images.unsplash.com/photo-1549187774-b4e9c1201e81',
            purchasePrice: 2900,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
