const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const categories = [
  { name: 'Personal Care Essential', slug: 'personal-care-essential', image: '', description: 'Personal care and grooming essentials.' },
  { name: 'Baby Care', slug: 'baby-care', image: '', description: 'Baby care products and accessories.' },
  { name: 'Computer Components', slug: 'computer-components', image: '', description: 'Computer accessories and components.' },
  { name: 'Household Appliance', slug: 'household-appliance', image: '', description: 'Home organization, storage, and household appliances.' },
  { name: 'Kitchen Appliances', slug: 'kitchen-appliances', image: '', description: 'Kitchen tools, racks, and appliances.' },
];

const products = [
  {
    title: 'Air Cooler Fan',
    slug: 'air-cooler-fan',
    description: '3 in 1 air cooler fan. Features: 7 colour light, 10W Max, USB Type-C, 600ml water tank, timer function.',
    unite_price: 1450, sale_price: 1250, compareAtPrice: 1450,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Air-Cooler-Fan-1.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Air-Cooler-Fan-1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Air-Cooler-Fan-3.jpg',
    ],
    variants: [],
  },
  {
    title: 'AP Lunch Box – 2/3/4 Box',
    slug: 'ap-lunch-box',
    description: 'Premium AP lunch box available in 2, 3, and 4 box configurations. Perfect for carrying meals on the go.',
    unite_price: 1000, sale_price: 850, compareAtPrice: 1000,
    inventoryQuantity: 30, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Ap-lunch-boz-3-pcs-.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Ap-lunch-boz-3-pcs-.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Ap-lunch-boz-3-pcs-13.jpg',
    ],
    variants: [
      { sku: 'AP-LB-2', size: '2 Box', color: '', price: 1000, sale_price: 850, inventoryQuantity: 20, image: 'https://cdn.pathao.com/uploads/enterprise/WhatsApp-Image-2026-01-12-at-6.50.20-PM.jpeg' },
      { sku: 'AP-LB-3', size: '3 Box', color: '', price: 1350, sale_price: 1150, inventoryQuantity: 20, image: 'https://cdn.pathao.com/uploads/enterprise/Ap-lunch-boz-3-pcs-.jpg' },
      { sku: 'AP-LB-4', size: '4 Box', color: '', price: 1450, sale_price: 1350, inventoryQuantity: 20, image: 'https://cdn.pathao.com/uploads/enterprise/Ap-lunch-boz-4-pcs4.jpg' },
    ],
  },
  {
    title: 'Multifunctional Storage Rack',
    slug: 'multifunctional-storage-rack',
    description: 'Versatile storage rack for organizing household items. Compact and durable design.',
    unite_price: 750, sale_price: 599, compareAtPrice: 750,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Storage-Rack.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Storage-Rack.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Storage-Rack3.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Storage-Rack2.jpg',
    ],
    variants: [],
  },
  {
    title: 'Food Grinder-925',
    slug: 'food-grinder-925',
    description: 'Electric food grinder model 925. Ideal for grinding spices, herbs, and other dry ingredients.',
    unite_price: 1450, sale_price: 1050, compareAtPrice: 1450,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Food-Grinder-925-07.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Food-Grinder-925-07.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Food-Grinder-925-03.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Food-Grinder-925-2.jpg',
    ],
    variants: [],
  },
  {
    title: 'Multifunctional Kitchen and Oven Rack',
    slug: 'multifunctional-kitchen-oven-rack',
    description: 'Multi-purpose kitchen and oven rack for organizing cookware, bakeware, and kitchen essentials.',
    unite_price: 1000, sale_price: 799, compareAtPrice: 1000,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Kitchen-and-Oven-Rack2-1.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Kitchen-and-Oven-Rack2-1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Kitchen-and-Oven-Rack-2.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Kitchen-and-Oven-Rack5.jpg',
    ],
    variants: [],
  },
  {
    title: '19 Hook Door Hanger',
    slug: '19-hook-door-hanger',
    description: 'Over-the-door 19 hook hanger. Perfect for organizing coats, bags, towels, and accessories.',
    unite_price: 700, sale_price: 399, compareAtPrice: 700,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Over-The-Door-19-Hook-Hanger-8.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Over-The-Door-19-Hook-Hanger-8.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Over-The-Door-19-Hook-Hanger-9.jpg',
    ],
    variants: [],
  },
  {
    title: 'Double Layer Adjustable Reading & Laptop Table',
    slug: 'double-layer-adjustable-table',
    description: 'Foldable height-adjustable reading and laptop table. Available in single layer and double layer options.',
    unite_price: 1900, sale_price: 1800, compareAtPrice: 1900,
    inventoryQuantity: 20, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Double-layer-Table-010-768x768.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Double-layer-Table-010-768x768.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Double-layer-Table-09-768x768.jpg',
    ],
    variants: [
      { sku: 'DLT-SINGLE', size: 'Single Layer & Adjustable', color: '', price: 1900, sale_price: 1800, inventoryQuantity: 10, image: 'https://cdn.pathao.com/uploads/enterprise/FOLDABLE-HEIGHT-ADJUSTABLE-READING-TABLE.jpg' },
      { sku: 'DLT-DOUBLE', size: 'Double Layer & Adjustable', color: '', price: 2450, sale_price: 2150, inventoryQuantity: 10, image: 'https://cdn.pathao.com/uploads/enterprise/Double-layer-Table-010-768x768.jpg' },
    ],
  },
  {
    title: 'Quran Sharif & Jaynamaz Rack',
    slug: 'quran-sharif-jaynamaz-rack',
    description: 'Beautiful wooden rack for holding Quran Sharif and Jaynamaz. Compact and elegant design.',
    unite_price: 750, sale_price: 499, compareAtPrice: 750,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Quran-Sharif-amp-Janamaz-Rack-02.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Quran-Sharif-amp-Janamaz-Rack-02.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Quran-Sharif-amp-Janamaz-Rack-03.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Quran-Sharif-amp-Janamaz-Rack-06.jpg',
    ],
    variants: [],
  },
  {
    title: 'Folding Clothes Hanger',
    slug: 'folding-clothes-hanger',
    description: 'Space-saving folding clothes hanger. Ideal for small spaces and travel.',
    unite_price: 520, sale_price: 350, compareAtPrice: 520,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Folding-Clothes-Hanger3.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Folding-Clothes-Hanger3.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Folding-Clothes-Hangers.jpg',
    ],
    variants: [],
  },
  {
    title: 'Wall Mounted Clothes Drying Hanger',
    slug: 'wall-mounted-clothes-drying-hanger',
    description: 'Space-saving wall mounted clothes drying hanger. Perfect for balconies and small spaces.',
    unite_price: 2200, sale_price: 1850, compareAtPrice: 2200,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Wall-Mounted-Clothes-Drying-Hanger-1.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Wall-Mounted-Clothes-Drying-Hanger-1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/edited-photo.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Wall-Mounted-Clothes-Drying-Hanger5-05-1.jpg',
    ],
    variants: [],
  },
  {
    title: '3 Layer Dish Rack',
    slug: '3-layer-dish-rack',
    description: 'Sturdy 3-layer iron dish rack for organizing plates, bowls, and kitchen utensils.',
    unite_price: 3050, sale_price: 2550, compareAtPrice: 3050,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/3-layer-iron-disk-rack-2.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/3-layer-iron-disk-rack-2.jpg',
      'https://cdn.pathao.com/uploads/enterprise/3-layer-iron-disk-rack-3.jpg',
      'https://cdn.pathao.com/uploads/enterprise/3-layer-iron-disk-rack.jpg',
    ],
    variants: [],
  },
  {
    title: '05 Layer Shoe Rack',
    slug: '5-layer-shoe-rack',
    description: '5-layer shoe rack available in multiple colors. Perfect for organizing footwear.',
    unite_price: 550, sale_price: 480, compareAtPrice: 550,
    inventoryQuantity: 30, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/5-Layer-SHoe-Rack.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/5-Layer-SHoe-Rack.jpg',
      'https://cdn.pathao.com/uploads/enterprise/5-Layer-SHoe-Rack-2.jpg',
      'https://cdn.pathao.com/uploads/enterprise/5-Layer-shoe-rack-8.jpg',
    ],
    variants: [
      { sku: 'SR-5-LEMON', size: '', color: 'Lemon', price: 550, sale_price: 480, inventoryQuantity: 20, image: 'https://cdn.pathao.com/uploads/enterprise/5-Layer-SHoe-Rack.jpg' },
      { sku: 'SR-5-BLUE', size: '', color: 'Blue', price: 550, sale_price: 480, inventoryQuantity: 20, image: 'https://cdn.pathao.com/uploads/enterprise/5-Layer-SHoe-Rack.jpg' },
      { sku: 'SR-5-ORANGE', size: '', color: 'Orange', price: 550, sale_price: 480, inventoryQuantity: 20, image: 'https://cdn.pathao.com/uploads/enterprise/5-Layer-SHoe-Rack-2.jpg' },
    ],
  },
  {
    title: 'AP Yogurt Maker 1L (Doi Maker)',
    slug: 'ap-yogurt-maker-1l',
    description: 'Electric yogurt maker (doi maker) with 1 liter capacity. Make fresh homemade yogurt easily.',
    unite_price: 950, sale_price: 749, compareAtPrice: 950,
    inventoryQuantity: 100, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Electric-Doi-Maker-F3.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Electric-Doi-Maker-F3.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Yougurt-Maker-1L.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Electric-Doi-Maker-F1.jpg',
    ],
    variants: [],
  },
  {
    title: 'Quran Box With Tasbih Hanger',
    slug: 'quran-box-tasbih-hanger',
    description: 'Elegant Quran box with built-in tasbih hanger. Perfect for home or gift giving.',
    unite_price: 1000, sale_price: 799, compareAtPrice: 1000,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Quran-Box-With-Tasbih-Hanger5.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Quran-Box-With-Tasbih-Hanger5.jpg',
      'https://cdn.pathao.com/uploads/enterprise/quran.jpg',
    ],
    variants: [],
  },
  {
    title: '20 Grid Egg Storage Box',
    slug: '20-grid-egg-storage-box',
    description: '20 grid egg storage box for safely storing and organizing eggs in the refrigerator.',
    unite_price: 350, sale_price: 249, compareAtPrice: 350,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/20-Grid-Egg-Box-F1.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/20-Grid-Egg-Box-F1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/20-Grid-Egg-Box-F5.jpg',
    ],
    variants: [],
  },
  {
    title: 'Wall Mounted Router Stand',
    slug: 'wall-mounted-router-stand',
    description: 'Space-saving wall mounted router stand. Keeps your router organized and off the floor.',
    unite_price: 650, sale_price: 399, compareAtPrice: 650,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['computer-components'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Wall Mounted Router Stand.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Wall Mounted Router Stand.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Wall Mounted Router Stand 2.jpg',
    ],
    variants: [],
  },
  {
    title: '9 Layer Shoe Rack',
    slug: '9-layer-shoe-rack',
    description: 'Large 9-layer shoe rack for organizing extensive footwear collections.',
    unite_price: 1950, sale_price: 1499, compareAtPrice: 1950,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/9-layer-shoe-rack-1.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/9-layer-shoe-rack-1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/9-Layer-Shoe-Rack.jpg',
    ],
    variants: [],
  },
  {
    title: 'Almari/Closet Cloth Hanger',
    slug: 'almari-closet-cloth-hanger',
    description: 'Space-saving almari/closet cloth hanger for maximizing wardrobe organization.',
    unite_price: 650, sale_price: 499, compareAtPrice: 650,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['household-appliance'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Almari-Hanger-1.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Almari-Hanger-1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Almari-Hanger5.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Almari-Hanger.jpg',
    ],
    variants: [],
  },
  {
    title: 'Electric Grinder 1000W Model FP824',
    slug: 'electric-grinder-1000w-fp824',
    description: 'Powerful electric grinder with 1000W motor. Model FP824. Ideal for grinding spices and dry ingredients.',
    unite_price: 1150, sale_price: 799, compareAtPrice: 1150,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Electric-Grinder-1000w-Model-FP824-4-01.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Electric-Grinder-1000w-Model-FP824-4-01.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Electric-Grinder-1000w-Model-FP824-5-01.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Electric-Grinder-1000w-Model-FP824-3.jpg',
    ],
    variants: [],
  },
  {
    title: 'Remington Salon Hair Dryer',
    slug: 'remington-salon-hair-dryer',
    description: 'Professional salon hair dryer for quick and efficient hair drying at home.',
    unite_price: 800, sale_price: 650, compareAtPrice: 800,
    inventoryQuantity: 20, status: 'publish',
    categorySlugs: ['personal-care-essential'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Fashion-hair-dryer3.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Fashion-hair-dryer3.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Fashion-hair-dryer4.jpg',
      'https://cdn.pathao.com/uploads/enterprise/mini-hair-dryer-2.jpeg',
      'https://cdn.pathao.com/uploads/enterprise/mini-hair-dryer-.jpeg',
    ],
    variants: [],
  },
  {
    title: '5 Layer Pot Rack',
    slug: '5-layer-pot-rack',
    description: 'Sturdy 5-layer pot rack for organizing pots, pans, and kitchen cookware.',
    unite_price: 1950, sale_price: 1650, compareAtPrice: 1950,
    inventoryQuantity: 10, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/5-Layer-pot-rack-2.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/5-Layer-pot-rack-2.jpg',
      'https://cdn.pathao.com/uploads/enterprise/5-layer-pot-rack-3.jpg',
      'https://cdn.pathao.com/uploads/enterprise/5-Layer-Pot-Rack03.jpg',
    ],
    variants: [],
  },
  {
    title: 'iBaby Toddler Rocker Dining Chair',
    slug: 'ibaby-toddler-rocker-dining-chair',
    description: 'Infant to toddler rocker dining chair. Perfect for feeding time and gentle rocking.',
    unite_price: 3250, sale_price: 2950, compareAtPrice: 3250,
    inventoryQuantity: 20, status: 'publish',
    categorySlugs: ['baby-care'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Ti-Baby-Toddler-Rocker-Dining-Chair-6-1.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Ti-Baby-Toddler-Rocker-Dining-Chair-6-1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Ti-Baby-Toddler-Rocker-Dining-Chair-7.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Tibaby-Infant-to-Toddler-Rocker-F1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Tbaby-Infant-to-Toddler-Rocker-F4.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Ti-Baby-Toddler-Rocker-Dining-Chair-3-1.jpg',
    ],
    variants: [],
  },
  {
    title: '04 Layer Kitchen Rack',
    slug: '4-layer-kitchen-rack',
    description: '4-layer kitchen rack available in square and round shapes. Durable and spacious.',
    unite_price: 2850, sale_price: 2400, compareAtPrice: 2850,
    inventoryQuantity: 24, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/4-Layer-Square-Shape-Kitchen-Rack.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/4-Layer-Square-Shape-Kitchen-Rack.jpg',
      'https://cdn.pathao.com/uploads/enterprise/4-Layer-Square-Shape-Kitchen-Rack-6.jpg',
      'https://cdn.pathao.com/uploads/enterprise/4 Layer Kitchen Rack.jpg',
    ],
    variants: [
      { sku: 'KR-4-SQUARE', size: '', color: 'Square', price: 2850, sale_price: 2400, inventoryQuantity: 24, image: 'https://cdn.pathao.com/uploads/enterprise/4-Layer-Square-Shape-Kitchen-Rack.jpg' },
      { sku: 'KR-4-ROUND', size: '', color: 'Round', price: 2850, sale_price: 2400, inventoryQuantity: 24, image: 'https://cdn.pathao.com/uploads/enterprise/4-Layer-Square-Shape-Kitchen-Rack.jpg' },
    ],
  },
  {
    title: 'Ti Baby Toddler Rocking & Dining Chair with Mosquito Net',
    slug: 'ti-baby-toddler-chair-mosquito-net',
    description: 'Toddler rocking and dining chair with included mosquito net for added protection.',
    unite_price: 3500, sale_price: 3250, compareAtPrice: 3500,
    inventoryQuantity: 20, status: 'publish',
    categorySlugs: ['baby-care'],
    image: 'https://cdn.pathao.com/uploads/enterprise/Ti-Baby-Toddler-Rocker-Dining-Chair-5.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/Ti-Baby-Toddler-Rocker-Dining-Chair-5.jpg',
      'https://cdn.pathao.com/uploads/enterprise/Ti-Baby-Toddler-Rocker-Dining-Chair-4.jpg',
    ],
    variants: [],
  },
  {
    title: 'iBaby Infant to Toddler Rocker',
    slug: 'ibaby-infant-toddler-rocker',
    description: 'Convertible infant to toddler rocker chair. Grows with your child from infancy to toddlerhood.',
    unite_price: 3200, sale_price: 2800, compareAtPrice: 3200,
    inventoryQuantity: 20, status: 'publish',
    categorySlugs: ['baby-care'],
    image: 'https://cdn.pathao.com/uploads/enterprise/ibaby-Infant-to-Toddler-Rocker-F1.jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/ibaby-Infant-to-Toddler-Rocker-F1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/ibaby-Infant-to-Toddler-Rocker-F2.jpg',
      'https://cdn.pathao.com/uploads/enterprise/ibaby-Infant-to-Toddler-Rocker-F3.jpg',
    ],
    variants: [],
  },
  {
    title: '06 Layer Kitchen Rack',
    slug: '6-layer-kitchen-rack',
    description: 'Large 6-layer kitchen rack available in square and round shapes. Maximum storage capacity.',
    unite_price: 3450, sale_price: 3000, compareAtPrice: 3450,
    inventoryQuantity: 40, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/6-layer-squre-shape-kitchen-Rack-17 (1).jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/6-layer-squre-shape-kitchen-Rack-17 (1).jpg',
      'https://cdn.pathao.com/uploads/enterprise/6-layer-squre-shape-kitchen-Rack-1.jpg',
      'https://cdn.pathao.com/uploads/enterprise/6-layer-squre-shape-kitchen-Rack-6.jpg',
    ],
    variants: [
      { sku: 'KR-6-SQUARE', size: '', color: 'Square', price: 3450, sale_price: 3000, inventoryQuantity: 40, image: 'https://cdn.pathao.com/uploads/enterprise/6-layer-squre-shape-kitchen-Rack-17 (1).jpg' },
      { sku: 'KR-6-ROUND', size: '', color: 'Round', price: 3450, sale_price: 3000, inventoryQuantity: 40, image: 'https://cdn.pathao.com/uploads/enterprise/6-layer-squre-shape-kitchen-Rack-17 (1).jpg' },
    ],
  },
  {
    title: '05 Layer Kitchen Rack',
    slug: '5-layer-kitchen-rack',
    description: '5-layer kitchen rack available in square and round shapes. Perfect middle-size storage solution.',
    unite_price: 3150, sale_price: 2750, compareAtPrice: 3150,
    inventoryQuantity: 40, status: 'publish',
    categorySlugs: ['kitchen-appliances'],
    image: 'https://cdn.pathao.com/uploads/enterprise/5-Layer-Round-Shape-Kitchen-Rack (1).jpg',
    images: [
      'https://cdn.pathao.com/uploads/enterprise/5-Layer-Round-Shape-Kitchen-Rack (1).jpg',
    ],
    variants: [
      { sku: 'KR-5-SQUARE', size: '', color: 'Square', price: 3150, sale_price: 2750, inventoryQuantity: 40, image: 'https://cdn.pathao.com/uploads/enterprise/5-Layer-Round-Shape-Kitchen-Rack (1).jpg' },
      { sku: 'KR-5-ROUND', size: '', color: 'Round', price: 3150, sale_price: 2750, inventoryQuantity: 40, image: 'https://cdn.pathao.com/uploads/enterprise/5-Layer-Round-Shape-Kitchen-Rack (1).jpg' },
    ],
  },
];

async function main() {
  console.log('Seeding categories...');
  const currentSlugs = categories.map((c) => c.slug);
  await prisma.category.deleteMany({ where: { slug: { notIn: currentSlugs } } });
  const categoryRecords = [];
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, image: category.image },
      create: category,
    });
    categoryRecords.push(record);
  }

  console.log('Seeding products...');
  for (const product of products) {
    const { categorySlugs, image, images, variants, ...productData } = product;

    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        categories: {
          connect: categorySlugs.map((slug) => ({ slug })),
        },
        images: {
          create: images.map((imgPath, i) => ({
            image_path: imgPath,
            altText: i === 0 ? productData.title : `${productData.title} - Image ${i + 1}`,
          })),
        },
        variants: {
          create: variants.map((variant, index) => ({
            sku: variant.sku,
            size: variant.size || null,
            color: variant.color || null,
            price: variant.price,
            sale_price: variant.sale_price || null,
            inventoryQuantity: variant.inventoryQuantity,
            isDefault: index === 0,
          })),
        },
      },
    });
  }

  console.log('Seeding users...');
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: hashedAdminPassword, role: 'admin' },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: hashedAdminPassword,
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

  console.log('Seeding orders...');
  await prisma.order.upsert({
    where: { orderNo: 'ORDER-1001' },
    update: {},
    create: {
      orderNo: 'ORDER-1001',
      userId: customer.id,
      total: 2398,
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
            productTitle: 'Air Cooler Fan',
            itemImagePath: 'https://cdn.pathao.com/uploads/enterprise/Air-Cooler-Fan-1.jpg',
            purchasePrice: 1250,
            quantity: 1,
          },
          {
            productTitle: 'Multifunctional Storage Rack',
            itemImagePath: 'https://cdn.pathao.com/uploads/enterprise/Multifunctional-Storage-Rack.jpg',
            purchasePrice: 599,
            quantity: 1,
          },
          {
            productTitle: '20 Grid Egg Storage Box',
            itemImagePath: 'https://cdn.pathao.com/uploads/enterprise/20-Grid-Egg-Box-F1.jpg',
            purchasePrice: 249,
            quantity: 2,
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
      total: 3199,
      orderStatus: 'pending',
      paymentStatus: 'paid',
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
            productTitle: 'AP Lunch Box – 3 Box',
            itemImagePath: 'https://cdn.pathao.com/uploads/enterprise/Ap-lunch-boz-3-pcs-.jpg',
            purchasePrice: 1150,
            quantity: 1,
          },
          {
            productTitle: 'AP Yogurt Maker 1L (Doi Maker)',
            itemImagePath: 'https://cdn.pathao.com/uploads/enterprise/Electric-Doi-Maker-F3.jpg',
            purchasePrice: 749,
            quantity: 1,
          },
          {
            productTitle: 'Food Grinder-925',
            itemImagePath: 'https://cdn.pathao.com/uploads/enterprise/Food-Grinder-925-07.jpg',
            purchasePrice: 1050,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log('Seed complete — 5 categories, 27 products, 2 orders');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
