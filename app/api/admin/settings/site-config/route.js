import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';
import { normalizeSiteUrl } from '../../../../../src/lib/siteSettings';

/**
 * SEO / sharing fields (owned by /admin/settings/site-config) plus the
 * integration fields. Branding and contact fields are owned by the site route —
 * each route writes only its own slice of the singleton row, so saving on one
 * admin page can never blank out the other page's values.
 */
const CONFIG_FIELDS = [
  'siteUrl',
  'metaTitle',
  'metaDescription',
  'metaKeywords',
  'ogImage',
  'telegramBotToken',
  'telegramChatId',
  'gtmId',
  'whatsappNumber',
];

function pickConfigFields(body) {
  const data = Object.fromEntries(
    CONFIG_FIELDS.filter((f) => f in body).map((f) => [f, body[f] || null])
  );
  // Reject a malformed site URL instead of persisting a value that would break
  // every metadata/OG/sitemap consumer. Empty = fall back to the env var.
  if ('siteUrl' in data) {
    const hasValue = typeof body.siteUrl === 'string' && body.siteUrl.trim() !== '';
    const normalized = normalizeSiteUrl(body.siteUrl);
    if (hasValue && !normalized) {
      return { error: 'Invalid site URL. Use a full URL like https://example.com' };
    }
    data.siteUrl = normalized;
  }
  return data;
}

export async function GET() {
  try {
    let settings = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: { id: 'singleton' } });
    }
    // Explicit projection (never secret columns) + siteName, which the SEO live
    // preview needs as a read-only fallback for the title.
    const payload = Object.fromEntries(
      CONFIG_FIELDS.map((f) => [f, settings[f] || ''])
    );
    return NextResponse.json({ ...payload, siteName: settings.siteName || '' });
  } catch (error) {
    console.error('Error fetching site config settings:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const data = pickConfigFields(body);
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    const settings = await prisma.siteSetting.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });

    const payload = Object.fromEntries(
      CONFIG_FIELDS.map((f) => [f, settings[f] || ''])
    );
    return NextResponse.json({ ...payload, siteName: settings.siteName || '' });
  } catch (error) {
    console.error('Error saving site config settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
