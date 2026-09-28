import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * Server-side image download for the product description editor.
 *
 * When a merchandiser pastes a description copied from another store, its images point at
 * that store's CDN. Storing those URLs as-is means the storefront hotlinks a third party:
 * the copy breaks when they move the file, and their uptime becomes our SEO problem. So the
 * editor asks the server to re-host each remote image through our own upload directory.
 *
 * That makes this an outbound fetch driven by user input, i.e. an SSRF sink, so every hop is
 * validated: scheme, credentials, DNS result, redirect target, body size, declared type, and
 * finally the bytes themselves. `fetchRemoteImage` refuses rather than degrades — a caller
 * that gets an exception knows the image was not stored.
 */

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // matches the 5MB cap in /api/admin/upload
const DEFAULT_TIMEOUT_MS = 15000;
const MAX_REDIRECTS = 3;

const EXT_BY_CONTENT_TYPE = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function isBlockedIPv4(ip) {
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true; // unparseable -> refuse
  }
  const [a, b, c] = octets;

  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // private
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local, incl. 169.254.169.254 cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  // 192.0.0.0/24 is reserved, but only that /24 — 192.0.77.48 (s.w.org) is real public space.
  if (a === 192 && b === 0 && c === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking 198.18/15
  if (a >= 224) return true; // multicast, reserved, broadcast
  return false;
}

/** Expand any textual IPv6 form (including `::` compression and a trailing dotted-quad) to 16 bytes. */
function expandIPv6(input) {
  let text = String(input).split('%')[0]; // drop any zone index

  // `::ffff:127.0.0.1` -> `::ffff:7f00:1`
  if (/\d{1,3}(\.\d{1,3}){3}$/.test(text)) {
    const cut = text.lastIndexOf(':');
    const parts = text.slice(cut + 1).split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
    const high = ((parts[0] << 8) | parts[1]).toString(16);
    const low = ((parts[2] << 8) | parts[3]).toString(16);
    text = `${text.slice(0, cut + 1)}${high}:${low}`;
  }

  const halves = text.split('::');
  if (halves.length > 2) return null;

  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 0) return null;

  const groups = [
    ...head,
    ...(halves.length === 2 ? Array(Math.max(missing, 0)).fill('0') : []),
    ...tail,
  ];
  if (groups.length !== 8) return null;

  const bytes = [];
  for (const group of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return null;
    const value = parseInt(group, 16);
    bytes.push((value >> 8) & 0xff, value & 0xff);
  }
  return bytes;
}

function isBlockedIPv6(ip) {
  const bytes = expandIPv6(ip);
  if (!bytes) return true; // unparseable -> refuse

  if (bytes.every((b) => b === 0)) return true; // ::
  if (bytes.slice(0, 15).every((b) => b === 0) && bytes[15] === 1) return true; // ::1

  // IPv4-mapped (::ffff:a.b.c.d) and IPv4-compatible addresses smuggle a v4 target,
  // so check the embedded address rather than the v6 prefix.
  const first10Zero = bytes.slice(0, 10).every((b) => b === 0);
  const isV4Mapped = first10Zero && bytes[10] === 0xff && bytes[11] === 0xff;
  const isV4Compat = bytes.slice(0, 12).every((b) => b === 0);
  if (isV4Mapped || isV4Compat) {
    return isBlockedIPv4(`${bytes[12]}.${bytes[13]}.${bytes[14]}.${bytes[15]}`);
  }

  if ((bytes[0] & 0xfe) === 0xfc) return true; // fc00::/7 unique-local
  if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0x80) return true; // fe80::/10 link-local
  if (bytes[0] === 0xff) return true; // ff00::/8 multicast
  return false;
}

function isBlockedAddress(ip) {
  const family = net.isIP(ip);
  if (family === 4) return isBlockedIPv4(ip);
  if (family === 6) return isBlockedIPv6(ip);
  return true;
}

/**
 * Resolve `rawUrl` and prove it points at a public host. Throws with a human-readable reason
 * otherwise. Every redirect hop goes through this again, so a public URL cannot bounce an
 * internal one into being fetched.
 */
export async function assertPublicHttpUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl));
  } catch {
    throw new Error('not a valid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('only http and https URLs are allowed');
  }
  if (url.username || url.password) {
    throw new Error('URLs with embedded credentials are not allowed');
  }

  const host = url.hostname.replace(/^\[|\]$/g, ''); // strip IPv6 brackets

  if (net.isIP(host)) {
    if (isBlockedAddress(host)) throw new Error('private or reserved address');
    return url;
  }

  let records;
  try {
    records = await dns.lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error('host could not be resolved');
  }
  if (!records.length) throw new Error('host did not resolve');

  // Every A/AAAA answer must be public: a name resolving to one public and one internal
  // address is exactly the rebinding shape we are guarding against.
  for (const { address } of records) {
    if (isBlockedAddress(address)) throw new Error('private or reserved address');
  }

  return url;
}

/** Read at most `maxBytes`, cancelling the stream as soon as the cap is passed. */
async function readCapped(response, maxBytes) {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new Error(`image is larger than ${Math.round(maxBytes / 1024 / 1024)}MB`);
  }
  if (!response.body) throw new Error('empty response');

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`image is larger than ${Math.round(maxBytes / 1024 / 1024)}MB`);
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

/** Content-Type is attacker-controlled, so confirm the bytes really are the claimed image. */
function sniffImage(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('latin1'))) {
    return 'image/gif';
  }
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') {
    return 'image/webp';
  }
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString('latin1') === 'ftyp') {
    const brand = buffer.subarray(8, 12).toString('latin1');
    if (['avif', 'avis'].includes(brand)) return 'image/avif';
  }
  // SVG is text; look for a root <svg> element near the start, skipping a BOM/whitespace.
  const head = buffer.subarray(0, 1024).toString('utf8').replace(/^﻿/, '');
  if (/<svg[\s>]/i.test(head)) return 'image/svg+xml';
  return null;
}

/**
 * Download a remote image after validating it. Resolves to `{ buffer, extension, contentType }`.
 */
export async function fetchRemoteImage(rawUrl, options = {}) {
  const { maxBytes = DEFAULT_MAX_BYTES, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  let target = String(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const url = await assertPublicHttpUrl(target);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(url, {
        redirect: 'manual', // re-validate each hop instead of following blindly
        signal: controller.signal,
        headers: { accept: 'image/*' },
      });

      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get('location');
        if (!location) throw new Error('redirect without a target');
        target = new URL(location, url).toString();
        continue; // loop re-validates `target`
      }

      if (!response.ok) throw new Error(`source returned HTTP ${response.status}`);

      const declaredType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (declaredType && !EXT_BY_CONTENT_TYPE[declaredType === 'image/jpg' ? 'image/jpeg' : declaredType]) {
        throw new Error(`unsupported content type${declaredType ? ` (${declaredType})` : ''}`);
      }

      const buffer = await readCapped(response, maxBytes);
      if (buffer.length === 0) throw new Error('empty image');

      const sniffed = sniffImage(buffer);
      if (!sniffed) throw new Error('response was not a recognised image');

      return { buffer, contentType: sniffed, extension: EXT_BY_CONTENT_TYPE[sniffed] };
    } catch (err) {
      if (err?.name === 'AbortError') throw new Error(`timed out after ${timeoutMs}ms`);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(`too many redirects (max ${MAX_REDIRECTS})`);
}
