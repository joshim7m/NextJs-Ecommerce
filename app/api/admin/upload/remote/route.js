import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/catalog/auth';
import { fetchRemoteImage } from '@/src/lib/uploads/remoteImage';
import { storeImage } from '@/src/lib/uploads/storeImage';

export const runtime = 'nodejs';
export const maxDuration = 60;

// A pasted description can carry a dozen images; cap the batch so one paste cannot
// turn into an unbounded fan-out of outbound requests.
const MAX_URLS_PER_REQUEST = 20;

function parseUrlList(body) {
  const raw = Array.isArray(body?.urls) ? body.urls : body?.url != null ? [body.url] : [];
  return raw
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .slice(0, MAX_URLS_PER_REQUEST);
}

/**
 * Re-host images that a pasted description points at a third-party CDN.
 *
 * Responds with a `results` array positionally aligned to the `urls` that were sent, so the
 * editor can rewrite the right <img> for each source and report per-image failures. Entries
 * are `{ url, path }` on success and `{ url, error }` on failure — a partial batch still
 * returns 200, because dropping one broken image should not lose the whole paste.
 */
export async function POST(request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const urls = parseUrlList(body);
  if (urls.length === 0) {
    return NextResponse.json({ error: 'No URLs provided.' }, { status: 400 });
  }

  const folder = body.folder || 'products';
  const results = [];

  for (const url of urls) {
    try {
      const { buffer, extension } = await fetchRemoteImage(url);
      results.push({ url, path: await storeImage(buffer, extension, folder) });
    } catch (err) {
      results.push({ url, error: err.message });
    }
  }

  if (!results.some((r) => r.path)) {
    return NextResponse.json({ error: 'All downloads failed.', results }, { status: 400 });
  }

  return NextResponse.json({ results });
}
