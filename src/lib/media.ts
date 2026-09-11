/**
 * Turning a declared media item into the things that consume it.
 *
 * Split from media-schema.ts on purpose: the schema reaches the filesystem to
 * check that a declared file exists, and a component importing that would
 * drag node:fs into a browser bundle. The type import below is erased at
 * build time, so this module stays pure.
 */
import type { MediaItem } from './media-schema';

export type { MediaItem, VideoMedia, ImageMedia, DocumentMedia } from './media-schema';

/** Absolute URL for a site-absolute path. */
export function absolute(site: string, path: string): string {
  return `${site.replace(/\/$/, '')}${path}`;
}

/** ISO 8601 duration, which is what schema.org asks for. */
export function isoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m > 0 ? `${m}M` : ''}${s}S`;
}

/**
 * The structured data for one media item.
 *
 * VideoObject and ImageObject are both in Google's current rich-result
 * gallery. DigitalDocument is not: it is emitted because it is the honest
 * schema.org type for a downloadable document and other consumers read it,
 * not because it produces anything in Search.
 */
export function mediaJsonLd(item: MediaItem, site: string, pageUrl: string): Record<string, unknown> {
  if (item.type === 'video') {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: item.title,
      description: item.describes,
      thumbnailUrl: absolute(site, item.poster),
      uploadDate: item.uploadDate,
      duration: isoDuration(item.durationSeconds),
      contentUrl: absolute(site, item.sources[0].src),
      embedUrl: pageUrl,
      ...(item.transcript ? { transcript: absolute(site, item.transcript) } : {}),
    };
  }
  if (item.type === 'image') {
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: absolute(site, item.src),
      description: item.alt,
      width: item.width,
      height: item.height,
      ...(item.caption ? { caption: item.caption } : {}),
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: item.title,
    description: item.describes,
    url: absolute(site, item.src),
    encodingFormat: item.format,
    numberOfPages: item.pages,
  };
}
