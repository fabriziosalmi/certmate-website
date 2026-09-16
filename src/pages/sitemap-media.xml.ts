/**
 * A sitemap for the media the pages declare.
 *
 * Separate from the one @astrojs/sitemap builds, and deliberately so: that
 * integration discovers page routes and serialises loc and alternates, with
 * no way to attach a <video:video> or an <image:image> child. The main
 * sitemap declared the video and image namespaces and used neither -- four
 * namespaces, zero entries -- which is the state this replaces.
 *
 * Only pages that actually declare media appear here. An empty urlset is the
 * correct output for a site with no media yet, and is what this returns
 * today: the declaration mechanism exists before the files do, which is the
 * point of building it now.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, localizedPath } from '../i18n';
import { absolute, isoDuration, type MediaItem } from '../lib/media';

type Entry = { url: string; media: MediaItem[] };

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function entries(): Promise<Entry[]> {
  const rows: Entry[] = [];
  for (const [collection, prefix] of [
    ['errors', '/errors'],
    ['deploy', '/deploy'],
  ] as const) {
    for (const entry of await getCollection(collection)) {
      const media = (entry.data as { media?: MediaItem[] }).media ?? [];
      if (media.length === 0) continue;
      const [locale, ...rest] = entry.id.split('/');
      const localPath = `${prefix}/${rest.join('/')}`;
      rows.push({
        url: SITE + localizedPath(locale === 'it' ? 'it' : 'en', localPath),
        media,
      });
    }
  }
  // Sorted so two builds of the same content produce the same bytes.
  return rows.sort((a, b) => a.url.localeCompare(b.url));
}

function videoNode(url: string, item: Extract<MediaItem, { type: 'video' }>): string {
  return [
    '    <video:video>',
    `      <video:thumbnail_loc>${escapeXml(absolute(SITE, item.poster))}</video:thumbnail_loc>`,
    `      <video:title>${escapeXml(item.title)}</video:title>`,
    `      <video:description>${escapeXml(item.describes)}</video:description>`,
    `      <video:content_loc>${escapeXml(absolute(SITE, item.sources[0].src))}</video:content_loc>`,
    `      <video:player_loc>${escapeXml(url)}</video:player_loc>`,
    `      <video:duration>${item.durationSeconds}</video:duration>`,
    `      <video:publication_date>${item.uploadDate}</video:publication_date>`,
    '    </video:video>',
  ].join('\n');
}

function imageNode(item: Extract<MediaItem, { type: 'image' }>): string {
  return [
    '    <image:image>',
    `      <image:loc>${escapeXml(absolute(SITE, item.src))}</image:loc>`,
    `      <image:title>${escapeXml(item.alt)}</image:title>`,
    '    </image:image>',
  ].join('\n');
}

export const GET: APIRoute = async () => {
  const rows = await entries();
  const urls = rows.map((row) => {
    const children = row.media
      .map((item) =>
        item.type === 'video'
          ? videoNode(row.url, item)
          : item.type === 'image'
            ? imageNode(item)
            : null,
      )
      .filter((node): node is string => node !== null);
    // A page whose only media is a document has nothing this sitemap can
    // carry: there is no document extension. It is left out rather than
    // emitted as a bare <url>, which would duplicate the main sitemap.
    if (children.length === 0) return null;
    return [`  <url>`, `    <loc>${escapeXml(row.url)}</loc>`, ...children, '  </url>'].join('\n');
  }).filter((node): node is string => node !== null);

  // The three xmlns values below are XML namespace names, not addresses:
  // nothing fetches them, and they are the exact strings the sitemap protocol
  // defines. Serving the same schema over https does not change them, and
  // rewriting them would produce a sitemap whose video and image elements no
  // longer belong to any namespace Google recognises.
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    // slopless-disable-next-line VBC-034 -- XML namespace name, fixed by the sitemap protocol
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    // slopless-disable-next-line VBC-034 -- XML namespace name, fixed by the sitemap protocol
    '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"',
    // slopless-disable-next-line VBC-034 -- XML namespace name, fixed by the sitemap protocol
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};

// isoDuration is exported by the media module for the JSON-LD; the sitemap
// wants plain seconds, which is why it is not used here.
void isoDuration;
