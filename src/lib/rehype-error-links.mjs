// Turns an inline `CODE` in an error or deploy page into a link to that
// error's page, when CODE is exactly the errorCode of one.
//
// The "Related errors" lists on all 66 error pages named 2-5 codes each and
// linked none of them: a reader who learned that their error was "the Firefox
// equivalent" had to go back to the index and find it by hand. The deploy
// guides cite error codes the same way. Writing the links by hand would put
// 200 URLs in prose that has to stay in step with the slugs; this reads them
// from the collection instead, so a renamed page cannot leave a dead link.
//
// Matching is exact and on inline code only: a code inside <pre>, inside an
// existing link, or naming the page it is on is left alone. Near-misses such
// as SEC_ERROR_REVOKED_CERTIFICATE_OCSP (a variant, not a page) stay text.

import { readdirSync, readFileSync } from 'node:fs';

const ERRORS_DIR = new URL('../content/errors/en/', import.meta.url);

/** errorCode -> slug, read from the English entries (both locales share slugs). */
export function errorCodeIndex(dir = ERRORS_DIR) {
  const index = new Map();
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.mdx')) continue;
    const source = readFileSync(new URL(name, dir), 'utf8');
    const match = source.match(/^errorCode:\s*["']?(.+?)["']?\s*$/m);
    if (!match) throw new Error(`rehype-error-links: ${name} has no errorCode`);
    const slug = name.slice(0, -'.mdx'.length);
    if (index.has(match[1])) {
      throw new Error(`rehype-error-links: ${match[1]} is the errorCode of both ${index.get(match[1])} and ${slug}`);
    }
    index.set(match[1], slug);
  }
  return index;
}

// Which locale and page a file is, from its path under src/content.
function whereIs(filePath) {
  const m = filePath?.match(/[\\/]src[\\/]content[\\/](errors|deploy)[\\/](en|it)[\\/]([^\\/]+)\.mdx$/);
  return m ? { collection: m[1], locale: m[2], slug: m[3] } : null;
}

export default function rehypeErrorLinks() {
  const index = errorCodeIndex();
  return (tree, file) => {
    const here = whereIs(file.path);
    if (!here) return;
    const prefix = here.locale === 'en' ? '' : `/${here.locale}`;

    const walk = (node, inLinkOrPre) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type !== 'element') return child;
        const blocked = inLinkOrPre || child.tagName === 'a' || child.tagName === 'pre';
        if (!blocked && child.tagName === 'code') {
          const text = child.children.length === 1 && child.children[0].type === 'text' ? child.children[0].value : null;
          const slug = text && index.get(text);
          if (slug && !(here.collection === 'errors' && slug === here.slug)) {
            return { type: 'element', tagName: 'a', properties: { href: `${prefix}/errors/${slug}/` }, children: [child] };
          }
          return child;
        }
        walk(child, blocked);
        return child;
      });
    };
    walk(tree, false);
  };
}
