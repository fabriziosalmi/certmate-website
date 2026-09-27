/**
 * A documentation page built from Markdown instead of hand-written HTML.
 *
 * The 26 pages under `src/docs/` are complete HTML documents, written by hand,
 * and they are a second copy of documentation that also lives in the
 * application repository — for most topics a shorter and older copy. Measured
 * before starting: `docs/api.md` there is 10,129 words against 1,613 here.
 *
 * So the body comes from Markdown now, and this module builds the document
 * that wraps it. The important property is that NOTHING ELSE CHANGES: the
 * endpoint still emits `/docs/<slug>.html`, the shell still splices the header,
 * the footer and the "On this page" disclosure into the same four markers, and
 * every indexed URL answers exactly where it did.
 *
 * Why the page skeleton is here rather than in the Markdown. The Markdown file
 * is a byte-identical copy of the one in the application repository, so that
 * checking the two agree is a hash comparison and nothing else. Everything the
 * site needs and the repository does not — the hero icon, the subtitle under
 * the title, the meta description — stays in `src/data/docs.ts`, where it
 * already was.
 *
 * The inline stylesheet is verbatim from the hand-written pages. Nineteen of
 * the twenty-six carry exactly these 63 lines; the other seven add rules for
 * components a Markdown page does not use. Copying the majority variant is
 * what makes a migrated page look the same as it did.
 */
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

/** Verbatim from the hand-written pages. See the note above. */
const DOC_STYLE = `        .doc-content {
            max-width: 900px;
            margin: 0 auto;
            padding: var(--spacing-8) var(--spacing-4);
        }
        .doc-content h1 {
            font-size: var(--font-size-4xl);
            font-weight: 800;
            color: var(--gray-900);
            margin-bottom: var(--spacing-6);
        }
        .doc-content h2 {
            font-size: var(--font-size-3xl);
            font-weight: 700;
            color: var(--gray-900);
            margin-top: var(--spacing-12);
            margin-bottom: var(--spacing-6);
            padding-bottom: var(--spacing-3);
            border-bottom: 2px solid var(--gray-200);
        }
        .doc-content h3 {
            font-size: var(--font-size-2xl);
            font-weight: 600;
            color: var(--gray-800);
            margin-top: var(--spacing-8);
            margin-bottom: var(--spacing-4);
        }
        .doc-content p, .doc-content li {
            line-height: 1.8;
            color: var(--gray-700);
            margin-bottom: var(--spacing-4);
        }
        .doc-content code {
            background: var(--gray-100);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: var(--radius);
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
            font-weight: normal;
        }
        .doc-content pre {
            background: var(--gray-900);
            color: white;
            padding: var(--spacing-6);
            border-radius: var(--radius-lg);
            overflow-x: auto;
            margin: var(--spacing-6) 0;
        }
        .doc-content pre code {
            background: none;
            padding: 0;
            color: white;
        }
        .doc-content ul, .doc-content ol {
            margin: var(--spacing-4) 0;
            padding-left: var(--spacing-8);
        }
        .doc-content li {
            margin: var(--spacing-2) 0;
        }
    
    /* In-page TOC, injected by toc.js. Sticky right column on lg+
       viewports; collapsed to a top disclosure on smaller screens. */`;

// One processor for the whole build. `shikiConfig` matches astro.config.mjs,
// so a code block in a migrated page is highlighted exactly like one in the
// deploy guides, which are already Markdown.
let processor: Awaited<ReturnType<typeof createMarkdownProcessor>> | null = null;
async function markdown() {
  processor ??= await createMarkdownProcessor({
    shikiConfig: { theme: 'github-dark-default' },
  });
  return processor;
}

/**
 * Point a link at the page the reader can actually open.
 *
 * Inside the Markdown a cross-reference is `dns-providers.md`, which is
 * correct where the file lives: on GitHub it opens the neighbouring file. Here
 * it resolves to `/docs/dns-providers.md`, which is not in the build — the SEO
 * gate caught exactly that on the first page migrated.
 *
 * A link to a page the site publishes becomes `.html`. A link to one it does
 * not — `kubernetes.md` and `architecture.md` have no page here — goes to the
 * file on GitHub rather than to a 404, because the page it names does exist,
 * just not at this address.
 */
//: A relative path to a neighbouring Markdown file, and nothing else.
//:
//: Built from named parts rather than written as one literal, because the
//: parts are what make the rewrite below safe and a reader should be able to
//: see them: `PATH` admits no colon, so `javascript:` cannot reach the href it
//: produces, and `FRAGMENT` admits no quote, so it cannot close the attribute.
//: The lookahead skips links that are already absolute, root-relative or
//: in-page — those are not cross-references to rewrite.
const PATH = '[A-Za-z0-9._/-]+';
const FRAGMENT = '#[A-Za-z0-9._-]*';
const CROSS_REFERENCE = new RegExp(
  `href="(?!https?:|/|#)(${PATH})\\.md(${FRAGMENT})?"`,
  'g',
);

//: The same two alphabets, applied again to what the match produced.
//:
//: The regex above already constrains them, so this is a second check of the
//: same thing — which is the point. It means the value put into an href is
//: validated where it is used, rather than being safe only because of a
//: pattern forty lines away that someone may later widen. A value that fails
//: it is left exactly as it was found.
const SAFE_PATH = new RegExp(`^${PATH}$`);
const SAFE_FRAGMENT = new RegExp(`^${FRAGMENT}$`);

function rewriteCrossReferences(html: string, published: ReadonlySet<string>): string {
  return html.replace(CROSS_REFERENCE, (whole, path: string, fragment = '') => {
    if (!SAFE_PATH.test(path)) return whole;
    if (fragment !== '' && !SAFE_FRAGMENT.test(fragment)) return whole;

    // Both branches below build an href by interpolation, which is a shape
    // worth flagging. `path` and `fragment` were matched by CROSS_REFERENCE
    // and then re-tested against SAFE_PATH / SAFE_FRAGMENT immediately above;
    // neither alphabet admits a colon or a quote, so a `javascript:` URL
    // cannot reach here and the value cannot close the attribute. Validating
    // a relative path before it becomes an href is what the rule asks for.
    // Written as two returns rather than a ternary so each line can carry its
    // own marker.
    const slug = path.split('/').pop() ?? path;
    if (published.has(slug)) {
      // slopless-disable-next-line VBC-944 -- validated by SAFE_PATH / SAFE_FRAGMENT above
      return `href="${slug}.html${fragment}"`;
    }
    // slopless-disable-next-line VBC-944 -- validated by SAFE_PATH / SAFE_FRAGMENT above
    return `href="${REPO_DOCS}/${path}.md${fragment}"`;
  });
}

/** Where a page this site does not publish can still be read. */
const REPO_DOCS = 'https://github.com/fabriziosalmi/certmate/blob/main/docs';

/**
 * Drop the document's own `<h1>`.
 *
 * The hero above the content already renders the title, from `src/data/docs.ts`
 * — the hand-written pages put it there and nowhere else. Leaving the
 * Markdown's `# Title` in as well would print it twice, and the second one
 * would be the one the "On this page" list linked to.
 */
function withoutLeadingH1(html: string): string {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/, '');
}

export type DocHero = {
  /** Shown in the hero. Not the `<title>`, which carries the site suffix. */
  heading: string;
  /** The sentence under it. Not the meta description, which is written for search. */
  subtitle: string;
  /** Font Awesome class, e.g. `fas fa-code`. Inlined as SVG by the shell. */
  icon: string;
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The full HTML document for one Markdown page, ready for `applyShell`.
 *
 * `applyShell` swaps four markers — SITE_HEADER, SITE_FOOTER, `</head>` and
 * `</body>` — and throws when it does not find exactly one of each. That is the
 * contract this function has to satisfy, and it is why the markers are written
 * out here rather than assumed.
 */
export async function renderDocPage(
  source: string,
  opts: { title: string; hero: DocHero; published: ReadonlySet<string> },
): Promise<string> {
  const rendered = await (await markdown()).render(source);
  const body = rewriteCrossReferences(withoutLeadingH1(rendered.code), opts.published);
  const icon = escapeHtml(opts.hero.icon);
  const heading = escapeHtml(opts.hero.heading);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(opts.title)}</title>
    <link rel="stylesheet" href="../assets/styles.css">
    <link rel="preload" as="style" href="vendor/fonts/fonts.css" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="vendor/fonts/fonts.css"></noscript>
    <style>
${DOC_STYLE}
    </style>
</head>
<body>
    <!-- SITE_HEADER: the site header, rendered by src/lib/docs-shell.ts -->

    <main id="main-content">
        <section class="docs-hero">
            <div class="container">
                <h1 class="docs-title"><i class="${icon}"></i> ${heading}</h1>
                <p class="docs-subtitle">${escapeHtml(opts.hero.subtitle)}</p>
            </div>
        </section>

        <section class="doc-content">
${body}
        </section>
    </main>

    <!-- SITE_FOOTER: the site footer, rendered by src/lib/docs-shell.ts -->
</body>
</html>
`;
}
