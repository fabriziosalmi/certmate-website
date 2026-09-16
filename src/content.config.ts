import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { mediaList } from './lib/media-schema';

// Locale lives in the first path segment of each entry id, e.g.
// "en/err-cert-authority-invalid" / "it/err-cert-authority-invalid".
// Routes filter by that prefix; hreflang pairs the matching slug.

const errors = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/errors' }),
  schema: z.object({
    title: z.string(),
    errorCode: z.string(),
    description: z.string(),
    summary: z.string(),
    browsers: z.array(z.string()).default([]),
    order: z.number().default(99),
    updated: z.string().optional(),
    // What this page shows as well as tells. See src/lib/media-schema.ts.
    media: mediaList,
  }),
});

const deploy = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/deploy' }),
  schema: z.object({
    title: z.string(),
    platform: z.string(),
    description: z.string(),
    summary: z.string(),
    icon: z.string().default('fa6-solid:server'),
    order: z.number().default(99),
    updated: z.string().optional(),
    media: mediaList,
  }),
});

export const collections = { errors, deploy };
