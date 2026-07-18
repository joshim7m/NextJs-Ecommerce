const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const blogCategories = [
  { title: 'Fashion Trends', slug: 'fashion-trends', authorName: 'Madame Editorial', status: 'publish' },
  { title: 'Styling Tips', slug: 'styling-tips', authorName: 'Madame Editorial', status: 'publish' },
  { title: 'Outfit Ideas', slug: 'outfit-ideas', authorName: 'Madame Editorial', status: 'publish' },
  { title: 'Work & Formal Wear', slug: 'work-formal-wear', authorName: 'Madame Editorial', status: 'publish' },
  { title: 'Seasonal Style', slug: 'seasonal-style', authorName: 'Madame Editorial', status: 'publish' },
];

const blogPosts = [
  // Fashion Trends (2 posts)
  {
    categorySlug: 'fashion-trends',
    title: 'Spring 2026 Fashion Trends for Women: What to Wear This Season',
    slug: 'spring-fashion-trends-2026',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/ba921d4e1188448c3a9037367ee0802d.webp?v=1774347421',
    tags: 'spring, fashion trends, 2026, women fashion, pastels, co-ord sets',
    metaDescription: 'Discover the top Spring 2026 fashion trends for women including soft pastels, relaxed tailoring, co-ord sets, and modern florals.',
    content: `<p>Spring always feels like a fresh start. The heavy layers disappear from the wardrobe. The mornings are more relaxed. Spring 2026 fashion trends for women are all about ease, freshness, and confidence.</p>

<h2>What Defines Spring 2026 Fashion?</h2>
<p>The spring of 2026 marks a major trend towards functional elegance. Fashion-conscious women want clothes that look sophisticated but are at ease. Structured pieces come in relaxed styles. Colors that are bold and vibrant meet soft pastels.</p>

<h2>Top Spring 2026 Fashion Trends for Women</h2>

<h3>Soft Pastels and Sorbet Shades</h3>
<p>Color sets the mood for spring. In 2026, soft pastels lead the way. Think lavender, butter yellow, mint green, powder blue, and blush pink. These shades instantly brighten your look without feeling loud.</p>

<h3>Relaxed Tailoring and Structured Comfort</h3>
<p>This season is all about comfort meeting style. Easy silhouettes with a polished feel are dominating. Pair with minimal accessories for a clean look.</p>

<h3>Feminine Florals with a Modern Twist</h3>
<p>Florals return every spring. However, this year they come with a fresh perspective. You will see both delicate micro florals and bold botanical prints. Floral dresses are ideal for casual gatherings.</p>

<h3>Statement Tops and Elevated Basics</h3>
<p>Sometimes, all you require is one piece that stands out. The spring 2026 season is dominated by statement tops. Think of subtle ruffles, textured fabrics, soft pleats, and attractive necklines.</p>

<h3>Coordinated Sets for Effortless Style</h3>
<p>Co-ord sets continue to dominate Spring 2026 fashion trends for women. You can wear them as a complete set for a polished look or mix and match the top and bottom with other wardrobe staples.</p>

<h2>Must Have Fabrics for Spring 2026</h2>
<p>Cotton blends are a popular option because they let air flow. Linen-inspired fabrics provide natural beauty and comfort. Denim with a light weight provides structure and comfort without the weight.</p>

<h2>How to Build a Spring 2026 Capsule Wardrobe</h2>
<p>Begin with a standout dress that expresses your personal style. Add a coord set that can be worn for casual and semi-formal events. Invest in a reliable pair of everyday jeans. Pick a neutral layering piece like a lightweight jacket.</p>

<h2>Conclusion</h2>
<p>Spring 2026 fashion trends for women celebrate freshness, practicality, and self-expression. This season is the perfect time to select pieces that feel as great as they appear.</p>`,
  },
  {
    categorySlug: 'fashion-trends',
    title: "What's New on Madame Spring Summer 2026: Western Wear Highlights",
    slug: 'madame-spring-summer-2026-highlights',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/9373cad4d7a483d670d28e73aaf76dbd.webp?v=1774347423',
    tags: 'spring summer 2026, Madame, western wear, new collection, SS26',
    metaDescription: "Explore Madame's Spring Summer 2026 collection featuring soft silhouettes, bold prints, and easy vibes for your main character wardrobe.",
    content: `<p>Soft silhouettes, bold prints, and easy vibes. SS26 at Madame is your main character's spring summer wardrobe unlocked.</p>

<h2>Introducing the Spring Summer 2026 Collection</h2>
<p>This season at Madame brings a fresh perspective to women's western wear. The collection is designed for the modern woman who values both style and comfort. From breezy dresses to structured co-ords, every piece is crafted to make you feel confident.</p>

<h2>Key Highlights of the Collection</h2>

<h3>Breezy Dresses and Co-ords</h3>
<p>The collection features flowy dresses perfect for brunch dates and vacations. Co-ord sets in vibrant prints and soft pastels make getting dressed effortless. Mix and match pieces for maximum versatility.</p>

<h3>Statement Denim</h3>
<p>Denim gets a fresh update with lighter washes and modern cuts. From wide-leg jeans to cropped jackets, the denim collection bridges the gap between casual and chic.</p>

<h3>Elevated Basics</h3>
<p>Everyday essentials get a premium upgrade. Think perfectly cut t-shirts, well-fitted shirts, and versatile trousers that form the backbone of your wardrobe.</p>

<h2>Styling the Collection</h2>
<p>The beauty of this collection lies in its versatility. Pair a bold printed top with classic denim for a casual day out. Layer a structured blazer over a flowy dress for a work-appropriate look. Mix bold prints with solid pieces for balance.</p>

<h2>Conclusion</h2>
<p>Madame's Spring Summer 2026 collection is all about embracing your personal style with confidence. Discover the latest styles and make this season your most fashionable one yet.</p>`,
  },

  // Styling Tips (2 posts)
  {
    categorySlug: 'styling-tips',
    title: 'Cardigans and Shrugs Styling Guide for Everyday Wear',
    slug: 'cardigans-and-shrugs-styling-guide',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/cardigans_and_shrugs_styling_guide_for_women.webp?v=1767953193',
    tags: 'cardigans, shrugs, layering, styling tips, everyday wear',
    metaDescription: 'Master the art of layering with cardigans and shrugs. Learn how to style them for work, casual outings, and everyday looks.',
    content: `<p>The process of dressing every day should be effortless and not a burden. This is why smart layering is crucial. Shrugs and cardigans improve simple outfits and keep you comfortable when temperatures change.</p>

<h2>Cardigans vs Shrugs – Understanding the Difference</h2>
<p>Women's cardigans are generally open-front or buttoned sweaters with full sleeves. They are warm and provide coverage, making them perfect for colder weather. Shrugs are less bulky, typically placed above the waist, and focused more on style and not warmth.</p>

<h2>Cardigans Styling Guide for Everyday Wear</h2>

<h3>Styling Cardigans with Jeans and Tops</h3>
<p>This is where comfort meets fashion. Begin with a semi-fitted or fitted top and a pair of your favorite jeans. Layer a cardigan over it. To keep from looking bulky, balance is important. Cropped cardigans with high-waisted jeans work well.</p>

<h3>Styling Cardigans with Dresses</h3>
<p>Cardigans instantly help dresses more comfortable to wear in everyday life. For a more relaxed appearance, wear the cardigan open. For a more sculpted look, fasten it or tie it around the waist.</p>

<h2>Shrugs Styling Guide for Casual & Smart Looks</h2>

<h3>Shrugs with Dresses and Tops</h3>
<p>Shrugs look great with sleeveless tops and dresses. They provide just the right amount of coverage. For casual events, opt for soft fabrics and comfortable fits. For a more sophisticated look, choose a structured shrug.</p>

<h3>Shrugs for Light Layering</h3>
<p>Shrugs are perfect for indoor or mild conditions. They add style and flexibility without extra weight. They're especially helpful when you need the freedom to move and a polished appearance.</p>

<h2>Everyday Layering Tips</h2>
<p>Start by wearing breathable layers. Try experimenting with proportions. Longer cardigans are great with fitted bottoms, while cropped shrugs compliment flowing silhouettes. Make sure you stick to a consistent color scheme.</p>

<h2>Conclusion</h2>
<p>Fashion for everyday life is easier with dependable layers. Even the smallest styling choices can have a significant difference in how you feel and appear.</p>`,
  },
  {
    categorySlug: 'styling-tips',
    title: 'Coats & Blazers Styling Guide: From Workwear to Weekend Wear',
    slug: 'coats-and-blazers-styling-guide',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/coats_and_blazers_styling_guide.webp?v=1767352885',
    tags: 'coats, blazers, workwear, styling guide, women fashion',
    metaDescription: 'Learn how to style coats and blazers for every occasion — from professional workwear to relaxed weekend looks.',
    content: `<p>One blazer, many moods. This guide breaks down how to style coats and blazers for work, weekends, and everything between.</p>

<h2>The Power of a Well-Fitted Blazer</h2>
<p>A blazer is one of the most versatile pieces in any woman's wardrobe. It can instantly elevate a casual outfit or complete a professional look. The key is finding the right fit and knowing how to style it for different occasions.</p>

<h2>Workwear Styling</h2>

<h3>Classic Professional Looks</h3>
<p>Pair a structured blazer with tailored trousers and a crisp blouse for a timeless office look. Neutral colors like black, navy, and grey work best for formal settings. Add pointed-toe heels and minimal jewelry to complete the outfit.</p>

<h3>Modern Office Style</h3>
<p>For a more contemporary approach, try an oversized blazer over a fitted midi dress. Or layer a blazer over a turtleneck and wide-leg trousers. This combination offers a relaxed yet polished appearance.</p>

<h2>Weekend and Casual Styling</h2>

<h3>Relaxed Weekend Vibes</h3>
<p>Throw a blazer over your favorite jeans and t-shirt for an effortlessly cool weekend look. Roll up the sleeves for a more laid-back feel. Add sneakers or loafers for comfort.</p>

<h3>Evening and Social Events</h3>
<p>A well-chosen blazer can be your go-to for dinner dates and social gatherings. Pair a velvet or textured blazer with a sleek dress or tailored pants. Statement earrings add the finishing touch.</p>

<h2>Choosing the Right Coat for Your Wardrobe</h2>
<p>Invest in quality outerwear that transcends seasons. A classic trench coat or a wool-blend coat pairs beautifully with both formal and casual outfits. Choose neutral tones for maximum versatility.</p>

<h2>Conclusion</h2>
<p>Coats and blazers are wardrobe investments that pay off year-round. Master the art of styling them for every occasion and you'll always have the perfect outfit ready.</p>`,
  },

  // Outfit Ideas (2 posts)
  {
    categorySlug: 'outfit-ideas',
    title: "Valentine's Day Outfits for Women – Date & Dinner Looks",
    slug: 'valentines-day-outfit-ideas-for-women',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/923b4b04423de6a73859ba1667622394.webp?v=1774347415',
    tags: "valentine's day, outfit ideas, date night, dinner looks, women fashion",
    metaDescription: "Find the perfect Valentine's Day outfit for any plan — from cute day dates to romantic dinner looks. Confidence looks good on you.",
    content: `<p>Valentine's Day always brings a small amount of magic. No matter if you're heading to a coffee date or a romantic candlelight dinner, picking the perfect outfit will set the mood for the whole evening.</p>

<h2>How to Choose the Perfect Valentine's Day Outfit</h2>

<h3>Dress According to Your Date Plan</h3>
<p>A brunch requires something easy and casual. A dinner reservation at a fine restaurant needs elegance. A party at home allows you to explore bold silhouettes. When your outfit matches the vibe, you'll be comfortable.</p>

<h3>Pick Colors That Match the Mood</h3>
<p>Red is the timeless Valentine's classic. Pink feels soft and feminine. Black adds a sophisticated look. Wine shades and soft pastels are also fashionable this year.</p>

<h2>Cute Valentine's Day Outfit Ideas for Day Dates</h2>

<h3>Floral Dresses with Light Layers</h3>
<p>Floral dresses are ideal for brunches or coffee meetups. They look feminine without trying too hard. Pair them with minimal jewelry and a crossbody bag.</p>

<h3>Chic Co-Ord Sets</h3>
<p>Co-ords are in style and with good reason. They are easy to put together. A soft co-ord set with subtle makeup offers innovative and contemporary outfit ideas.</p>

<h2>Romantic Dinner Outfit Ideas</h2>

<h3>Red Bodycon Dresses</h3>
<p>Nothing could be more Valentine's Day than a red bodycon dress. It's strong, powerful, and emphasizes your figure. Style with classic shoes and delicate earrings.</p>

<h3>Elegant Midi and Maxi Dresses</h3>
<p>For a classy style, go for a midi or maxi dress. These styles are classy and sophisticated. Silk or flowing fabrics give an air of elegance and movement.</p>

<h2>Styling Tips to Elevate Your Look</h2>
<p>Keep your accessories well-balanced. Select footwear with care. Ensure your makeup aligns with your attire. Most importantly, take pride in yourself — it is the most effective accessory.</p>

<h2>Conclusion</h2>
<p>Valentine's Day is not just about wearing a dress. It's about showing your feelings. When you select the right outfit, you are comfortable, beautiful, and ready to make unforgettable memories.</p>`,
  },
  {
    categorySlug: 'outfit-ideas',
    title: "Women's Day Fashion Ideas for Work, Weekend and Celebrations",
    slug: 'womens-day-fashion-ideas',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/9e6332b08570f59da8937d4ab90d30e3.webp?v=1774347417',
    tags: "women's day, fashion ideas, workwear, weekend, celebration",
    metaDescription: "Celebrate Women's Day with stylish outfit ideas for work, weekend plans, and celebrations. Confidence looks good on you.",
    content: `<p>It's your day, own the spotlight. Women's Day fashion ideas for work, chill plans, and glam nights. Because confidence looks good on you.</p>

<h2>What to Wear to Work on Women's Day</h2>

<h3>Professional Yet Powerful</h3>
<p>Make a statement at the office with outfits that reflect your strength. A well-tailored blazer paired with wide-leg trousers creates a commanding presence. Add a pop of color with a bold blouse underneath.</p>

<h3>Smart Casual Options</h3>
<p>If your workplace leans casual, opt for a chic co-ord set or a structured midi dress. These pieces are comfortable enough for a full day while still looking polished and put-together.</p>

<h2>Weekend Outfit Ideas</h2>

<h3>Brunch with Friends</h3>
<p>For a relaxed weekend outing, try a flowy midi skirt paired with a fitted top. Add statement earrings and comfortable block heels. This look is effortless yet stylish.</p>

<h3>Casual Shopping Day</h3>
<p>Go for comfort without compromising style. A well-fitted pair of jeans with a statement top and sneakers creates the perfect casual ensemble for a day out.</p>

<h2>Celebration and Party Looks</h2>

<h3>Evening Glam</h3>
<p>For Women's Day celebrations, don't hold back. A sequined top with tailored pants or a sleek bodycon dress creates an unforgettable look. Pair with heels and bold jewelry.</p>

<h3>Dinner Party Elegance</h3>
<p>A midi dress in a rich jewel tone is perfect for an elegant dinner celebration. Add a clutch and minimal accessories to let the dress speak for itself.</p>

<h2>Conclusion</h2>
<p>Women's Day is a celebration of you. Dress in a way that makes you feel powerful, confident, and ready to take on the world. Because when you feel good, you look even better.</p>`,
  },

  // Work & Formal Wear (2 posts)
  {
    categorySlug: 'work-formal-wear',
    title: 'How to Layer Winter Formals for Women the Right Way',
    slug: 'how-to-layer-winter-formals-for-women',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/how_to_layer_winter_formals_for_women_b7eca964-f5de-489a-a18f-7d915bbd1739.webp?v=1769171130',
    tags: 'winter formals, office wear, layering, workwear, professional',
    metaDescription: 'Master the art of layering winter formal wear for the office. Stay warm, polished, and professional all season long.',
    content: `<p>Winter mornings are beautiful and challenging, particularly if you're getting ready for work. The choice of winter formals for women is not only about staying warm. It's about feeling professional, polished, and comfortable during long office hours.</p>

<h2>Why Layering Matters in Winter Formal Wear</h2>
<p>Layering lets you take control. The temperature of the office can vary and the weather outside is prone to change rapidly. Layered clothing lets you adapt easily while maintaining an elegant look.</p>

<h2>Start with the Right Base Layer</h2>

<h3>Choosing Comfortable Inner Layers</h3>
<p>A well-fitting inner layer will keep your body warm without adding weight. Think soft tops, light thermal t-shirts, or tailored blouses that fit comfortably beneath formal clothes.</p>

<h3>Fabric Selection for All Day Comfort</h3>
<p>Fabrics that breathe like blended cotton, modal, or fine wool help regulate your body temperature. They keep you warm but avoid being too hot once you're indoors.</p>

<h2>Mid Layers That Add Warmth Without Bulk</h2>

<h3>Shirts, Tops and Fine Knitwear</h3>
<p>A structured shirt paired with fine knit sweaters gives a professional and clean look. Opt for slim-fit knits which are close to the body. They look great with trousers and skirts.</p>

<h3>Smart Use of Cardigans for Office Wear</h3>
<p>Cardigans are an essential winter piece. Find tailored cardigans with clean lines and minimal details. They are easy to layer over dresses and shirts and can add warmth without overpowering your attire.</p>

<h2>Outerwear That Completes Winter Formals</h2>

<h3>Blazers: The Winter Formal Essential</h3>
<p>Blazers are a classic option for winter formals. They give the look structure and instantly elevate any outfit. For winter, pick more substantial fabrics that provide warmth and a sleek appearance.</p>

<h3>Coats and Jackets for Office Commutes</h3>
<p>Jackets and coats shield you from the cold while keeping your attire elegant. Classic coats with neutral colors work with formal attire for winter.</p>

<h2>Conclusion</h2>
<p>The winter dress code doesn't have to be difficult. If you know how to approach formal winter layering, you can design outfits that are warm, confident, and professional.</p>`,
  },
  {
    categorySlug: 'work-formal-wear',
    title: 'Smart Knitwear Styling Tips for Work, Weekends & Travel',
    slug: 'smart-knitwear-styling-tips',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/Smart_Knitwear_Styling_Tips_for_Work_Weekends_Travel_8247c9db-ab21-4395-9653-aebda24c526f.webp?v=1768564198',
    tags: 'knitwear, styling tips, workwear, travel, smart casual',
    metaDescription: 'Discover smart knitwear styling tips for every occasion — from professional work looks to weekend comfort and travel-ready outfits.',
    content: `<p>Knitwear isn't just winter vibes. Slay work, weekends, and travel looks with these smart knitwear styling tips.</p>

<h2>Knitwear for the Office</h2>

<h3>Fine Knits for Professional Settings</h3>
<p>Fine-gauge knitwear is perfect for the office. A slim-fit sweater in a neutral tone paired with tailored trousers creates a polished professional look. Layer a blazer on top for added structure during meetings.</p>

<h3>Knit Dresses for Effortless Elegance</h3>
<p>A well-fitted knit dress is a wardrobe hero for work. It's comfortable enough for long days while looking put-together. Pair with a belt to define your waist and add pointed-toe heels.</p>

<h2>Weekend Knitwear Styling</h2>

<h3>Casual Comfort</h3>
<p>For weekends, embrace chunkier knits. An oversized sweater paired with jeans or corduroy pants creates a cozy yet stylish look. Add boots or sneakers for a relaxed finish.</p>

<h3>Layering for Texture</h3>
<p>Mix different knit textures for visual interest. A cable-knit cardigan over a ribbed top adds depth to your outfit. Play with proportions — pair oversized knits with fitted bottoms.</p>

<h2>Travel-Ready Knitwear</h2>

<h3>Packing Smart</h3>
<p>Knitwear is ideal for travel. It's lightweight, wrinkle-resistant, and versatile. Pack a neutral sweater that pairs with multiple bottoms. Layer over a dress or with jeans for different looks from one piece.</p>

<h3>Airplane to Destination</h3>
<p>Style a cozy knit set for comfort during travel. A matching knit top and pants set looks chic at the airport and transitions seamlessly to your destination.</p>

<h2>Conclusion</h2>
<p>Knitwear is one of the most versatile categories in your wardrobe. With the right styling, it works for every occasion — from boardrooms to weekend adventures.</p>`,
  },

  // Seasonal Style (2 posts)
  {
    categorySlug: 'seasonal-style',
    title: 'Winter to Spring Fashion Guide for a Smooth Style Transition',
    slug: 'winter-to-spring-fashion-guide',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/53c20175f7af1489f34a14b843cdb8e7.webp?v=1774347409',
    tags: 'winter to spring, transitional fashion, layering, seasonal style',
    metaDescription: 'Navigate the winter-to-spring transition with ease. Learn how to layer, mix fabrics, and style outfits for unpredictable weather.',
    content: `<p>The transition from winter to spring is always a bit like a jumble. At one point, you are reaching for warm clothes, the next moment you are craving lighter clothes. This is precisely why having a properly planned winter to spring fashion guide is important.</p>

<h2>What is Transitional Fashion?</h2>
<p>Fashion for transitional times simply means wearing clothes that can be worn in a variety of weather. It emphasizes layers, flexibility, and picking pieces that shift to changing temperatures. The most important thing is layering and using a variety of fabrics.</p>

<h2>Must Have Winter to Spring Wardrobe Staples</h2>

<h3>Lightweight Jackets and Outerwear</h3>
<p>Light layers are your ideal partner during this season. Denim jackets give an informal look and go well with everything. Light blazers are great for casual and formal occasions alike. These lightweight jackets are easy to throw on and off as the day changes.</p>

<h3>Transitional Tops</h3>
<p>Tops with full sleeves protect you from morning chills while remaining cool and breathable. Lightweight knit tops offer warmth without feeling weighty. Shirts are the ultimate heroes of transitional style.</p>

<h3>Bottomwear That Works Across Seasons</h3>
<p>Straight-fit trousers appear polished and are comfortable throughout the day. Denim that is lightweight pairs well with both winter and spring tops. Ankle-length pants provide a fresh look while offering coverage.</p>

<h2>Smart Layering Tips for Spring Weather</h2>
<p>Start with a thin base layer, then add pieces you can take off. Mix spring and winter items carefully. Wear a warm sweater over an aerating top. Tops, shirts, and light jackets provide flexibility without being bulky.</p>

<h2>Color and Fabric Shift</h2>
<p>Gradually introduce spring-inspired colors such as blush, mint, soft blue, and warm brown. Combine them with your neutral winter outfits. Stay away from heavy wool and thick knits. Select fabrics made of cotton, breathable blends, and lightweight fabrics.</p>

<h2>Outfit Ideas for Women</h2>
<p>For casual looks, wear everyday tops with jeans and a lightweight jacket. For workwear, style casual shirts with straight-fit pants and a light jacket. For weekends, layer dresses with denim jackets and soft shrugs.</p>

<h2>Conclusion</h2>
<p>A seamless transition from season to season doesn't require a new outfit. It's about making more intelligent selections with careful layers, breathable fabrics, and versatile staples.</p>`,
  },
  {
    categorySlug: 'seasonal-style',
    title: 'Summer Outfit Ideas: Styling Tops for Effortless Daily Looks',
    slug: 'summer-outfit-ideas-styling-tops',
    bannerImage: 'https://madameonline.com/cdn/shop/articles/ec6ca05bd2d31b554269b45eeb40272b.webp?v=1773469677',
    tags: 'summer, outfit ideas, tops, styling, daily looks, warm weather',
    metaDescription: 'Summer fits made simple. Style your favorite tops with easy outfit ideas that keep you cool, comfy, and effortlessly stylish.',
    content: `<p>Summer fits made simple. Style your favorite tops with easy outfit ideas that keep you cool, comfy, and effortlessly stylish all season long.</p>

<h2>Choosing the Right Tops for Summer</h2>

<h3>Breathable Fabrics Are Key</h3>
<p>Summer demands fabrics that let your skin breathe. Cotton, linen, and lightweight blends are your best friends. These materials wick away moisture and keep you cool even on the hottest days.</p>

<h3>Colors That Beat the Heat</h3>
<p>Light colors reflect sunlight and keep you cooler. Whites, pastels, and soft neutrals are summer essentials. Don't shy away from bright colors either — they add energy to your summer wardrobe.</p>

<h2>Top Styling Ideas for Daily Wear</h2>

<h3>Tops with Jeans</h3>
<p>The simplest summer formula — a well-fitted top with your favorite pair of jeans. Choose light-wash or white denim for a summery feel. Roll up the hems and add sandals for a relaxed look.</p>

<h3>Tops with Shorts</h3>
<p>Pair breezy tops with denim or linen shorts for the ultimate summer comfort. A tucked-in blouse with high-waisted shorts creates a flattering silhouette that works for running errands or casual outings.</p>

<h3>Tops with Skirts</h3>
<p>A flowy midi skirt paired with a fitted top is perfect for summer lunches and gatherings. A-line skirts with crop tops create a playful yet put-together look for warmer days.</p>

<h2>Summer Workwear</h2>
<p>Choose structured tops in breathable fabrics for office days. Pair with tailored trousers or a pencil skirt. A light cardigan is perfect for air-conditioned offices. Stick to light colors and minimal layering for maximum comfort.</p>

<h2>Accessorizing Summer Outfits</h2>
<p>Keep accessories light and fun. Straw bags, oversized sunglasses, and delicate jewelry complement summer outfits perfectly. Comfortable sandals or white sneakers complete the look without adding heaviness.</p>

<h2>Conclusion</h2>
<p>Summer fashion is all about effortless style. With the right tops and simple styling, you can create looks that are comfortable, stylish, and perfect for any summer day.</p>`,
  },
];

async function main() {
  console.log('Seeding blog categories and posts...\n');

  for (const cat of blogCategories) {
    const category = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: { title: cat.title, authorName: cat.authorName, status: cat.status },
      create: cat,
    });
    console.log(`  [Category] ${category.title} (${category.id})`);
  }

  let postCount = 0;
  for (const post of blogPosts) {
    const category = await prisma.blogCategory.findUnique({ where: { slug: post.categorySlug } });
    if (!category) {
      console.error(`  [SKIP] Category "${post.categorySlug}" not found for post "${post.title}"`);
      continue;
    }

    const created = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        content: post.content,
        bannerImage: post.bannerImage,
        categoryId: category.id,
        tags: post.tags,
        metaDescription: post.metaDescription,
        status: 'publish',
      },
      create: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        bannerImage: post.bannerImage,
        categoryId: category.id,
        tags: post.tags,
        metaDescription: post.metaDescription,
        status: 'publish',
      },
    });
    console.log(`  [Post] ${created.title} (${created.id})`);
    postCount++;
  }

  console.log(`\nSeed complete — ${blogCategories.length} categories, ${postCount} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
