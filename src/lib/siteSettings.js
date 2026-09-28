import { cache } from 'react';
import prisma from '@/src/lib/prisma';

/**
 * Public origin used as the last fallback when neither the DB `siteUrl` nor
 * NEXT_PUBLIC_SITE_URL is configured.
 */
export const DEFAULT_SITE_URL = 'https://radiantpicks.com';

/**
 * SiteSetting singleton, cached per request. Layouts, generateMetadata and
 * page components can all call this — React `cache()` de-duplicates the DB
 * lookup so a single request performs it exactly once.
 */
export const getSiteSettings = cache(async () => {
  try {
    return (await prisma.siteSetting.findUnique({ where: { id: 'singleton' } })) || {};
  } catch {
    return {};
  }
});

/**
 * Brand name with NO hardcoded fallback — callers degrade gracefully when
 * unset, so the storefront never shows a stale brand after a rename.
 */
export function siteNameOf(settings) {
  return settings?.siteName || '';
}

/**
 * Brand used for the global title template/suffix: the admin "SEO & Sharing"
 * `metaTitle` override first, then the site name.
 */
export function brandOf(settings) {
  return (settings?.metaTitle || '').trim() || siteNameOf(settings);
}

/**
 * `{pageTitle} | {brand}` — degrades to whichever side is available, never
 * emitting a dangling separator.
 */
export function buildTitle(pageTitle, settings) {
  const brand = brandOf(settings);
  if (pageTitle && brand) return `${pageTitle} | ${brand}`;
  return pageTitle || brand;
}

/**
 * Normalizes a configured origin: adds a missing scheme, keeps any sub-path
 * (self-hosted sub-directory installs), and drops the trailing slash. Returns
 * null when the value is not a usable URL, so a bad admin entry can never take
 * the storefront down.
 */
export function normalizeSiteUrl(value) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    // `new URL` accepts some nonsense (e.g. "ht!tp://bad url" -> host "ht!tp"),
    // so require a sane hostname: no odd sub-delims, and a dotted host (or
    // localhost / a bare IP) so a typo can never become the canonical origin.
    const { hostname } = url;
    if (!/^[a-z0-9.-]+$/i.test(hostname)) return null;
    if (!hostname.includes('.') && hostname !== 'localhost') return null;
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    return null;
  }
}

/**
 * Public origin, resolved per request: DB `siteUrl` (admin-managed, overrides
 * live without a rebuild) → NEXT_PUBLIC_SITE_URL env → default. Async because
 * the DB value may change the canonical host at runtime.
 */
export async function getSiteUrl() {
  const settings = await getSiteSettings();
  return (
    normalizeSiteUrl(settings?.siteUrl) ||
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    DEFAULT_SITE_URL
  );
}

/** metadataBase for Next.js metadata resolution. */
export async function getMetadataBase() {
  return new URL(await getSiteUrl());
}

/**
 * Global keywords from the admin SEO settings (comma-separated), else the
 * provided default list.
 */
export function keywordsOf(settings, fallback = []) {
  const raw = (settings?.metaKeywords || '').trim();
  if (!raw) return fallback;
  return raw.split(',').map((k) => k.trim()).filter(Boolean);
}

/**
 * Default sharing image: the admin-uploaded `ogImage` if set, otherwise the
 * dynamic OG image route built from `params`.
 */
export async function ogImageUrl(settings, params = {}) {
  if (settings?.ogImage) return settings.ogImage;
  const qs = new URLSearchParams(
    Object.entries({ siteName: settings?.siteName || '', ...params })
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return `${await getSiteUrl()}/api/og${qs ? `?${qs}` : ''}`;
}
