/**
 * The media declaration, exercised end to end.
 *
 * Asserting that the schema "looks right" proves nothing: what matters is
 * that a page which declares a video ends up with the structured data, ends
 * up in the media sitemap, and that a declaration pointing at a file that is
 * not there stops the build instead of publishing an empty player.
 *
 * So this builds the site twice against a temporary fixture -- once whole,
 * once with one file removed -- and asserts on the output both times. The
 * fixture is written into the tree and removed in a finally, so a crash
 * leaves nothing behind.
 *
 * Run: node scripts/check-media.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const MEDIA_DIR = 'public/media/__check__';
const ENTRY = 'src/content/deploy/en/__check__.mdx';
const BUILT = 'dist/deploy/__check__/index.html';
const SITEMAP = 'dist/sitemap-media.xml';
const CLIP = `/media/__check__/clip-16x9.mp4`;

const DESCRIBES =
  'A recording of the deployment being performed end to end, from an empty host to a certificate served over HTTPS, with each command visible as it is typed and its output shown before the next step begins.';

function run(command, args) {
  try {
    const out = execFileSync(command, args, { encoding: 'utf8', stdio: 'pipe' });
    return { ok: true, output: out };
  } catch (error) {
    return { ok: false, output: `${error.stdout || ''}${error.stderr || ''}` };
  }
}

/**
 * Build, then run the head gate over what was built.
 *
 * Both, because they fail at different moments and the distinction matters: a
 * declaration pointing at a file that never existed is caught by the content
 * schema at build time, while a file deleted later is caught only by reading
 * the output, since Astro re-uses the cached collection entry.
 */
function build() {
  const built = run('npx', ['astro', 'build']);
  if (!built.ok) return built;
  return run('node', ['scripts/check-seo.mjs']);
}

function writeFixture() {
  mkdirSync(MEDIA_DIR, { recursive: true });
  // Placeholders: the schema checks that a declared file exists, which is the
  // property under test. Their contents are never decoded.
  writeFileSync(`${MEDIA_DIR}/clip-16x9.mp4`, 'placeholder');
  writeFileSync(`${MEDIA_DIR}/clip-9x16.mp4`, 'placeholder');
  writeFileSync(`${MEDIA_DIR}/poster.png`, 'placeholder');
  writeFileSync(
    `${MEDIA_DIR}/en.vtt`,
    'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nDeploying CertMate behind nginx.\n',
  );
  writeFileSync(
    ENTRY,
    `---
title: "Media check"
platform: "Check"
description: "A fixture used by scripts/check-media.mjs. Not published."
summary: "A fixture used by scripts/check-media.mjs."
order: 999
media:
  - type: video
    title: "Deploying CertMate behind nginx"
    describes: "${DESCRIBES}"
    poster: /media/__check__/poster.png
    durationSeconds: 95
    uploadDate: "2026-09-11"
    sources:
      - aspect: "16:9"
        src: ${CLIP}
        width: 1920
        height: 1080
      - aspect: "9:16"
        src: /media/__check__/clip-9x16.mp4
        width: 1080
        height: 1920
    captions:
      - lang: en
        src: /media/__check__/en.vtt
---

A fixture page.
`,
  );
}

function cleanup() {
  rmSync(MEDIA_DIR, { recursive: true, force: true });
  rmSync(ENTRY, { force: true });
  rmSync('dist/deploy/__check__', { recursive: true, force: true });
}

const problems = [];

try {
  writeFixture();

  const whole = build();
  if (!whole.ok) {
    problems.push(`a page declaring media that exists did not build:\n${whole.output.slice(-1200)}`);
  } else {
    if (!existsSync(BUILT)) {
      problems.push(`${BUILT} was not produced`);
    } else {
      const html = readFileSync(BUILT, 'utf8');
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => {
          try {
            return JSON.parse(m[1]);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      const video = blocks.find((b) => b['@type'] === 'VideoObject');
      if (!video) {
        problems.push('the page has no VideoObject structured data');
      } else {
        if (video.duration !== 'PT1M35S') problems.push(`duration is ${video.duration}, expected PT1M35S`);
        if (!String(video.thumbnailUrl || '').endsWith('/media/__check__/poster.png')) {
          problems.push(`thumbnailUrl is ${video.thumbnailUrl}`);
        }
        if (!String(video.contentUrl || '').endsWith(CLIP)) {
          problems.push(`contentUrl is ${video.contentUrl}`);
        }
        if (video.description !== DESCRIBES) problems.push('description is not the declared describes text');
      }
      if (!html.includes('<track') || !html.includes('/media/__check__/en.vtt')) {
        problems.push('the captions track is not rendered');
      }
      if (!html.includes(DESCRIBES.slice(0, 40))) {
        problems.push('describes is in the structured data but not on the page, where a reader would see it');
      }
    }

    const sitemap = existsSync(SITEMAP) ? readFileSync(SITEMAP, 'utf8') : '';
    if (!sitemap.includes('<video:video>')) problems.push('the media sitemap has no <video:video> entry');
    if (!sitemap.includes(`<video:content_loc>https://www.certmate.org${CLIP}`)) {
      problems.push('the media sitemap does not carry the clip URL');
    }
    if (!sitemap.includes('<video:duration>95</video:duration>')) {
      problems.push('the media sitemap does not carry the duration in seconds');
    }
  }

  // The failure that matters: a declaration pointing at nothing.
  rmSync(`${MEDIA_DIR}/poster.png`, { force: true });
  const broken = build();
  if (broken.ok) {
    problems.push('removing a declared media file did not fail the build');
  } else if (!broken.output.includes('poster.png')) {
    problems.push(
      `the build failed without naming the missing file, so the message does not say what to fix:\n${broken.output.slice(-600)}`,
    );
  }
} finally {
  cleanup();
}

if (problems.length) {
  console.error('\nMedia gate failed:\n');
  for (const problem of problems) console.error('  ' + problem);
  console.error(`\n${problems.length} problem(s).\n`);
  process.exit(1);
}

console.log('Media gate passed (declared media renders, is described, is in the sitemap, and a missing file stops the build).');
