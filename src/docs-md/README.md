# Synced documentation

Every `.md` here is a **byte-identical copy** of a file in the application
repository, under `docs/`. Nothing in this directory is written or edited here.

That is the whole point. The site and the application each used to carry their
own documentation for the same topics, and the two drifted: measured before
this started, the site's API page was 1,613 words against 10,129 in the
repository, and nine topics existed only here, with nothing in the application
to check them against.

A copy is only safe when it is mechanical. `scripts/check-docs-sync.mjs`
compares each file here with the one it came from, byte for byte, and fails if
they differ — whether because the application moved on or because somebody
edited this one.

**To change a page, change it in `fabriziosalmi/certmate` under `docs/`.**

Everything the site needs and the application does not — the hero icon, the
subtitle, the meta description written for search — lives in `src/data/docs.ts`
instead, so that the comparison above stays a hash and never becomes a merge.
