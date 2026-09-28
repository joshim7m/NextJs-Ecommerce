import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';

/**
 * Branding / contact / content fields — owned by /admin/settings/site.
 * SEO & sharing fields live in the site-config route. Each route writes only
 * its own slice of the singleton row, so saving on one admin page can never
 * blank out the other page's values.
 */
const SITE_FIELDS = [
  'siteName',
  'logo',
  'favicon',
  'mobile',
  'email',
  'address',
  'copyrightText',
  'announcementText',
  'aboutCompany',
  'aboutCompanyBn',
];

/** Only the fields the client actually sent, so the rest of the row is untouched. */
function pickSiteFields(body) {
  return Object.fromEntries(
    SITE_FIELDS.filter((f) => f in body).map((f) => [f, body[f] || null])
  );
}

export async function GET() {
  try {
    let settings = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: { id: 'singleton' } });
    }
    // Explicit projection: never leak secret columns (e.g. jwtSecret).
    return NextResponse.json(pickSiteFields(settings));
  } catch (error) {
    console.error('Error fetching site settings:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const data = pickSiteFields(body);

    const settings = await prisma.siteSetting.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });

    return NextResponse.json(pickSiteFields(settings));
  } catch (error) {
    console.error('Error saving site settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
