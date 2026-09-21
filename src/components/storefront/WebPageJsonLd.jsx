const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://radiantpicks.com';

// Renders schema.org WebPage (+ optional overrides) structured data for a
// static storefront page. Server component — no interactivity.
export default function WebPageJsonLd({ path, name, description, extra = null }) {
  const url = `${SITE_URL}${path}`;

  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url,
    ...(description ? { description } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page) }} />
      {extra && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(extra) }} />}
    </>
  );
}
