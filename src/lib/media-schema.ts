/**
 * What media a page has, declared by the page, rendered by the layout.
 *
 * The problem this solves is not "how do I put a video on a page". It is that
 * every new kind of media otherwise means editing a template, and by the
 * third kind the site has two ways of doing everything. A page says what it
 * has; the layout, the structured data and the media sitemap all read the
 * same declaration.
 *
 * Three rules are enforced here rather than remembered.
 *
 * 1. The declaration is content, not presentation. There is nowhere in this
 *    schema to put a width in pixels, a colour or a position. Intrinsic
 *    dimensions of a video or an image are not presentation: they are facts
 *    about the file, and structured data wants them.
 *
 * 2. A declared file that does not exist fails the build, naming the file.
 *    The alternative is an empty player in production, which nobody sees
 *    until a reader does.
 *
 * 3. The text around the media is required. Outside YouTube, nothing
 *    understands a video: everything indexes the words next to it. `describes`
 *    is mandatory and has a floor, because a two-word caption is the same as
 *    nothing. For an image the required text is `alt`, which has a job in the
 *    page as well as outside it.
 *
 * Paths are declared in full rather than derived from a base name and a
 * convention. The generator that produces these files was not available to
 * read when this was written, and a convention invented here that did not
 * match it would be worse than a little repetition.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro:content';

/** Everything referenced here is served from public/. */
const PUBLIC_DIR = 'public';

/**
 * A site-absolute path to a file that must exist under public/.
 *
 * `extension` is checked before existence because the two failures want
 * different words: a .srt where a .vtt belongs is a file that exists and
 * cannot be used, which is a more confusing state than a file that is absent.
 */
function publicFile(what: string, extension?: { suffix: string; because: string }) {
  let base = z
    .string()
    .startsWith('/', `${what} must be a site-absolute path, for example /media/foo.mp4`);
  if (extension) base = base.endsWith(extension.suffix, extension.because);
  return base
    .refine((value) => existsSync(join(PUBLIC_DIR, value)), (value) => ({
      message:
        `${what} declares ${value}, and ${join(PUBLIC_DIR, value)} does not exist. ` +
        `Add the file or remove the declaration: a media entry that points at nothing ` +
        `renders an empty box in production and is found by a reader, not by a build.`,
    }));
}

/**
 * The paragraph that carries the meaning of the media.
 *
 * The floor is deliberate and is the point of the field. A crawler that
 * cannot open an MP4 has only this; "a short demo" tells it nothing, and a
 * page whose media is its only substance ranks for nothing.
 */
const describes = z
  .string()
  .min(120, 'describes must say what the media actually shows, in at least 120 characters: it is what a search engine reads instead of the file');

const videoSource = z.object({
  /** The shape the file is cut for. Which one a layout shows is its business. */
  aspect: z.enum(['16:9', '9:16']),
  src: publicFile('a video source'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const caption = z.object({
  lang: z.enum(['en', 'it']),
  /** WebVTT. A .srt file is not something a browser can display. */
  src: publicFile('a captions track', {
    suffix: '.vtt',
    because:
      'captions must be WebVTT: browsers cannot display a .srt track, so a page that ships only .srt has no captions',
  }),
});

const video = z.object({
  type: z.literal('video'),
  title: z.string().min(1),
  describes,
  sources: z.array(videoSource).min(1),
  poster: publicFile('a video poster'),
  captions: z.array(caption).min(1, 'a video needs at least one captions track'),
  durationSeconds: z.number().int().positive(),
  /** ISO date. Required by Google for a VideoObject. */
  uploadDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'uploadDate must be YYYY-MM-DD'),
  /** A full transcript, if there is one. Worth more than the video to a crawler. */
  transcript: publicFile('a transcript').optional(),
});

const image = z.object({
  type: z.literal('image'),
  src: publicFile('an image'),
  /** The required text for an image: read aloud, and read by crawlers. */
  alt: z.string().min(15, 'alt must describe the image, not name it'),
  caption: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const document = z.object({
  type: z.literal('document'),
  title: z.string().min(1),
  describes,
  src: publicFile('a document'),
  pages: z.number().int().positive(),
  /** Only PDF for now; adding a format means deciding how it is offered. */
  format: z.literal('application/pdf').default('application/pdf'),
});

export const mediaItem = z.discriminatedUnion('type', [video, image, document]);
export const mediaList = z.array(mediaItem).default([]);

export type MediaItem = z.infer<typeof mediaItem>;
export type VideoMedia = z.infer<typeof video>;
export type ImageMedia = z.infer<typeof image>;
export type DocumentMedia = z.infer<typeof document>;
