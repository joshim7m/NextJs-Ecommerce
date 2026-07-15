import Link from 'next/link';
import prisma from '../../../src/lib/prisma';

export const metadata = {
  title: 'About Us | Radiant Picks',
  description: 'Learn about Radiant Picks — Bangladesh\'s favourite online destination for lingerie, bras, panties, nightwear, and women\'s intimate apparel.',
  alternates: { canonical: '/about' },
};

async function getSettings() {
  try {
    const settings = await prisma.siteSetting.findFirst();
    return JSON.parse(JSON.stringify(settings || {}));
  } catch {
    return {};
  }
}

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition-colors">Home</Link>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-slate-600 dark:text-slate-300">About Us</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">About Radiant Picks</h1>

      <div className="prose prose-slate mt-8 max-w-none prose-headings:text-slate-900 prose-a:text-[#2f0f6b] prose-p:leading-relaxed sm:prose-lg dark:prose-invert dark:prose-headings:text-white dark:prose-a:text-[#a78bfa]">
        <p>
          Welcome to Radiant Picks — Bangladesh&apos;s favourite online destination for lingerie, bras, panties, nightwear, and women&apos;s intimate apparel.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe every woman deserves access to comfortable, high-quality intimate wear that makes her feel confident and beautiful. Our mission is to provide premium lingerie and intimate apparel at affordable prices, delivered with discretion and care across Bangladesh.
        </p>

        <h2>Why Choose Us</h2>
        <ul>
          <li><strong>Premium Quality:</strong> We carefully select and curate our products to ensure the highest quality materials and craftsmanship.</li>
          <li><strong>Discreet Packaging:</strong> Your privacy matters to us. All orders are shipped in plain, unmarked packaging.</li>
          <li><strong>Cash on Delivery:</strong> Shop with confidence with our cash on delivery option available across Bangladesh.</li>
          <li><strong>Nationwide Shipping:</strong> We deliver to Dhaka, Chittagong, Sylhet, and all areas across Bangladesh.</li>
          <li><strong>Easy Returns:</strong> Not satisfied? Our hassle-free return policy has you covered.</li>
        </ul>

        <h2>Our Story</h2>
        <p>
          Radiant Picks was born from a simple idea: every woman should have access to beautiful, comfortable intimate wear without the hassle of traditional shopping. We started as a small online boutique and have grown into one of Bangladesh&apos;s most trusted destinations for women&apos;s intimate apparel.
        </p>
        <p>
          Our team works tirelessly to bring you the latest trends, classic essentials, and everything in between — from everyday comfort to special occasion pieces.
        </p>

        <h2>Get in Touch</h2>
        <p>
          Have questions? We&apos;d love to hear from you. Visit our <Link href="/contact">contact page</Link> or reach out to us directly. Your satisfaction is our priority.
        </p>
      </div>
    </div>
  );
}
