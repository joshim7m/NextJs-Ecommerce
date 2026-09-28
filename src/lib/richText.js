/**
 * Helpers for the rich-text HTML that Product.description / Product.specification hold.
 *
 * Pure functions with no server-only imports, so both the server actions and the client
 * components can use them.
 */

// Decoded in this order, and it matters: `&amp;` goes last. Decoding it first would turn the
// literal text `&amp;lt;` into `<` instead of into `&lt;`, i.e. it would decode one level too
// far and could emit a tag that is no longer inert in a meta attribute.
const NAMED_ENTITIES = [
  ['&nbsp;', ' '],
  ['&quot;', '"'],
  ['&#39;', "'"],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&amp;', '&'],
];

/** Tags whose presence makes a block meaningful even when it holds no text. */
const MEDIA_TAGS = /<(?:img|table|video|audio|iframe|embed|object)\b/i;

// An "empty" block: a paragraph holding nothing, a <br>, or a non-breaking space. TipTap
// emits these for a blank line and for content the author deleted, and each one renders as
// a band of dead whitespace at the top or bottom of a description.
const EMPTY_BLOCK_BODY = '<p>(?:\\s|<br\\s*/?>|&nbsp;)*<\\/p>';
// Anchored at one end, matching a run of them. These have to be applied in a loop rather
// than via one global replace: `replace` evaluates every match against the *original*
// string, so after the first block is removed the next one no longer looks like it is at
// the start, and `<p></p><p></p>text` would keep a stray paragraph.
const EMPTY_AT_START = new RegExp(`^(?:${EMPTY_BLOCK_BODY})+`, 'i');
const EMPTY_AT_END = new RegExp(`(?:${EMPTY_BLOCK_BODY})+$`, 'i');

/** Drop empty paragraphs from both ends, repeatedly, leaving interior ones untouched. */
export function trimEmptyBlocks(html) {
  let out = String(html || '').trim();
  let previous;
  do {
    previous = out;
    out = out.replace(EMPTY_AT_START, '').replace(EMPTY_AT_END, '').trim();
  } while (out !== previous);
  return out;
}

/** Rich text to plain text, for meta descriptions, JSON-LD and previews. */
export function stripHtml(html) {
  let out = String(html || '').replace(/<[^>]+>/g, ' ');
  for (const [entity, char] of NAMED_ENTITIES) out = out.split(entity).join(char);
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * True when the HTML would actually show a customer something.
 *
 * An empty TipTap document serialises to `<p></p>`, which is a non-empty *string* but an
 * empty *document*. Testing for truthiness therefore renders a blank panel instead of the
 * "No description available." fallback, and puts an empty string in the meta description.
 */
export function hasVisibleContent(html) {
  const value = String(html || '').trim();
  if (!value) return false;
  if (MEDIA_TAGS.test(value)) return true;
  return stripHtml(value).length > 0;
}

/**
 * Store `null` rather than an empty document, so "no description" has exactly one
 * representation in the database. Keeps storefront fallbacks, SEO fallbacks and the admin
 * "Empty" pill all agreeing with each other.
 *
 * Also drops empty leading/trailing paragraphs. Interior ones are left alone: they are
 * sometimes deliberate spacing between sections, and only the ends are reliably junk.
 */
export function normalizeRichText(html) {
  const value = trimEmptyBlocks(html);
  return hasVisibleContent(value) ? value : null;
}
