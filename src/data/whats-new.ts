/**
 * "What's New" cards. Listed newest-first. Only the first card (the latest
 * release) is shown inline; WhatsNew.astro collapses the rest behind a native
 * <details> disclosure. Patch releases are folded into the nearest feature card.
 *
 * The lead card is the current feature line (v2.25.x — pull-based delivery and
 * the Helm chart). Descriptions are drawn from RELEASE_NOTES.md in the app
 * repo; every claim is verifiable against the code.
 *
 * Each item maps to one card. Badge variants:
 *   - 'milestone' (highlighted v2.x release)
 *   - 'security'  (CVE / hardening / audit)
 *   - 'fix'       (bug fix release)
 *   - 'feature'   (feature delivery)
 */

import { releaseTag } from '~/data/site';

export type UpdateBadge = 'milestone' | 'security' | 'fix' | 'feature';

export interface UpdateCard {
  badge: UpdateBadge;
  badgeLabel: string;
  icon: string;
  title: string;
  description: string;
  date: string;
  highlight?: boolean;
  href?: string;
}

export const updates: UpdateCard[] = [
  {
    badge: 'security',
    badgeLabel: 'v2.26.0',
    icon: 'fa6-solid:key',
    title: 'v2.26.0 — the renewal path held to the standard of the issuance path, and two features',
    description:
      '**Read this first if you have ever shared a backup.** Every archive CertMate made before this release with the default setting (\'include_secrets=false\', which is every automatic backup) contains the private key of every certificate, although its manifest said \'secrets_masked: true\' and the interface called it share-safe; archives made by v2.22.0 or later also contain the private CA key and every client-certificate key. Encrypted \'.zip.enc\' archives are the exception. If you shared one believing it harmless, list what it holds (\'unzip -l\') and treat every key you find as exposed. From this release a share-safe backup carries no key material, says so in its manifest, and the restore refuses to lay a key-less archive over an instance that already holds certificates; disaster recovery is a deliberate \'include_secrets=true\' archive with a passphrase. The rest of the release is a set of defects with one shape: the renewal, restore and logout paths had each been checked by analogy with the path beside them. Certificates from a private ACME CA could not renew (issuance passed the trust bundle, renewal never did); a corrupt metadata file was overwritten with an empty one; the settings lock protected a snapshot rather than the file, so concurrent writes were rolled back during a long issuance; the automatic restore installed masked archives as credentials; unchecking SSO on an SSO-only instance reopened setup mode; the four PEM files could be published half-new, half-old, and never repaired. All fixed, each with a test that failed before. Two features: generic webhooks gain a payload template with placeholders, a method, first-class authentication, a timeout and a preview; and the OIDC logout now reaches the identity provider. The 2026-08-18 audit confirmed 43 findings; this release closes 16, and the 27 that remain are listed with their verified severities in certmate#591.',
    date: 'August 2026',
    highlight: true,
    href: releaseTag('v2.26.0'),
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.25.x',
    icon: 'fa6-solid:download',
    title: 'v2.25.0–2.25.4 — certificates a host can pull, and a Helm chart',
    description:
      'Deploying a certificate to another machine has usually meant the certificate manager reaching out to it, which means it holds credentials for every host it deploys to. Two users asked for the inverse from opposite directions, and it is now a supported path: `certmate cert download` fetches one file at a time, so a deploy script puts each file exactly where it belongs instead of unpacking an archive. Files are created with owner-only permissions at the moment of creation, never adjusted afterwards, so a private key is never briefly readable by other users on the machine. Paired with an API key scoped to a single domain, a target host holds one narrow credential for itself and pulls on a timer: no inbound access to the host, and no credentials for that host on the CertMate server. The certificate, chain and fullchain are readable by a viewer key; anything carrying key material requires operator. The download API also gained the legacy PKCS#1 key inline, so an automation that needs both the bundle and the traditional key makes one call instead of staging a key through a file on disk. v2.25.1 added a Helm chart, published to GHCR on every release, that encodes what CertMate is rather than emitting generic templates: it renders exactly one replica and refuses to render more, because the scheduler runs in the web process and a second replica would renew the same certificates twice against the same volume. Two patch releases followed. **v2.25.3 is a security fix**: CertMate moved to bcrypt several releases ago but never rewrote the hashes it already had, so an account created before that change kept a salted SHA-256 for ever \u2014 fast, and brute-forceable at GPU speed from a leaked settings.json. The hash is now re-derived on the next successful login, once, with nothing for an operator to do, and the write is a compare-and-set so an administrator resetting a password still wins. v2.25.2 fixed things that were never tested and therefore never worked: an image built with the advertised minimal requirements crash-looped on boot and had for months, four calls to Akamai EdgeDNS had no timeout inside the certbot hook, a dependency pin was not pinning anything because a plugin pulled a fork of the same package, and a quadratic blowup in the routine that redacts secrets from logs burned 21.6 seconds of CPU on 480 KB of hostile input \u2014 now 36 milliseconds. **v2.25.4** repaired two certificate authorities that could not issue at all: the DigiCert endpoint CertMate used stopped existing in February, when DigiCert retired the legacy CertCentral ACME service, and the Google Trust Services staging endpoint served a certificate issued for another name, so no ACME client would complete the handshake. It also shipped the Infomaniak plugin, which had been advertised as supported since the provider was added and was never actually installed in any published image. Alongside those, the documented build recipe for the AWS and GCP dependency sets was moving certbot off the version the whole stack is pinned to, in a build that reported success, and the Python version the README told you to install could not install the project at all.',
    date: 'August 2026',
    highlight: true,
    href: releaseTag('v2.25.4'),
  },
  {
    badge: 'fix',
    badgeLabel: 'v2.24.1 - v2.24.2',
    icon: 'fa6-solid:wrench',
    title: 'Two DNS providers that had never worked, and three interface faults',
    description:
      'ACME-DNS and Google Cloud DNS-01 issuance had never succeeded in any CertMate release. Both were advertised, documented and present in the settings UI, and both failed on every request: the bundled ACME-DNS plugin implements no credentials-file option at all, and certbot-dns-google expects the service-account JSON itself where CertMate was handing it an ini. Anyone who tried either and concluded they had misconfigured something had not. ACME-DNS is now driven by CertMate\'s own DNS hook with no plugin, and the Google fix was verified against a live Cloud DNS zone. Alongside them: settings could not be saved at all unless the selected CA had an email address, closing an edit left the certificate drawer stuck on the previous certificate, and a certificate being issued vanished from the list on page refresh while the server was still working on it - now the dashboard asks the server what is in flight and re-attaches, which also shows it in a session opened in another browser.',
    date: 'July 2026',
    href: releaseTag('v2.24.2'),
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.24.0',
    icon: 'fa6-solid:boxes-stacked',
    title: 'v2.24.0 — certificate discovery and inventory, and the integrations around it',
    description:
      'CertMate\'s largest feature line to date turns it from a certificate issuer into an inventory of what is actually deployed. A deep TLS probe reads the full served certificate at any host:port — the complete SAN list, serial, SHA-256 fingerprint, issuer DN, key and signature algorithm, and served chain — behind an SSRF guard that resolves the target first, refuses private/loopback/CGNAT ranges, and pins the resolved IP so a DNS rebind cannot redirect the handshake inward. A fingerprint-keyed SQLite inventory records every certificate CertMate has seen, whether it issued it or merely observed it; scheduled endpoint probing and crt.sh Certificate Transparency monitoring populate it, surfacing shadow issuance and certificates that were renewed but never deployed. An /inventory dashboard groups issued against discovered with an expiry forecast across everything, one-click adoption of a discovered certificate into managed renewal, and a cryptographic-readiness report that classifies every key and signature (weak, acceptable, modern; and flags everything classically quantum-vulnerable) and exports as JSON, CSV or a print-friendly page. Around it: PKCS#12 (.pfx) export for client certificates, a typed Kubernetes-Secret deploy target that writes renewed certs into a kubernetes.io/tls Secret via Server-Side Apply, and a SIEM audit sink that streams the signed audit trail as syslog (RFC 5424), CEF or HTTP/JSON with credentials redacted and a dead collector unable to block a certificate operation. Everything new is opt-in.',
    date: 'July 2026',
    highlight: true,
    href: releaseTag('v2.24.0'),
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.23.0',
    icon: 'fa6-solid:box-archive',
    title: 'v2.23.0 — audit retention: archiving and pruning the tamper-evident chain, on the record',
    description:
      'The last open half of the audit design: an operator can archive and remove an old prefix of the tamper-evident audit chain. Retention on a tamper-evident record is a policy question, not a disk one — you cannot make deletion impossible on a file the operator owns, but you can make it non-deniable. `python -m modules.core.audit_prune` removes a prefix that has already been exported and independently verified; without --yes it is a dry run, and it refuses more than it accepts (the archive must verify, be signed by this instance, start exactly where the chain starts, and agree with it hash-for-hash, and it will not empty the chain). The deletion is recorded in the chain that survives it — an archive entry naming the sequence range, the entry count, the head hash and the archive\'s SHA-256 — and the remainder verifies from a signed anchor, so a chain that was merely truncated cannot be passed off as a pruned one. Deliberately CLI-only, with CertMate stopped: an authenticated endpoint that deletes audit history is exactly what someone who has just compromised an administrator account would want.',
    date: 'July 2026',
    href: releaseTag('v2.23.0'),
  },
  {
    badge: 'security',
    badgeLabel: 'v2.22.0',
    icon: 'fa6-solid:clipboard-check',
    title: 'v2.22.0–2.22.1 — the audit release: silent failures made loud, and third-party-verifiable evidence',
    description:
      'A 360-degree read-only audit produced 25 findings, all fixed here, plus three follow-up audit-chain defects in v2.22.1. The common thread: almost every defect failed silently or reported the opposite of what happened. The unified backup was silently omitting the private CA key, every client certificate, the CRL and the audit chain — a documented restore came back unable to issue or revoke a single client certificate; it now carries and restores all of it, written 0600. A restored backup renews again (certbot lineage symlinks are rebuilt at restore and at the top of every renewal). A failed unattended renewal now actually sends its alert. Deleting a certificate now removes it from the external storage backend too, not just locally. Secrets are fully masked in the viewer-readable settings API. API-key expiry is validated and compared as a date rather than sorted as a string. The rate limiter can no longer be reset by varying the bearer token. And the audit trail itself gained a signed, third-party-verifiable export bundle with streaming verification, an incremental export slice that verifies instead of accusing you of tampering, and a rotated human-readable log — while the tamper-evident chain is emphatically not rotated.',
    date: 'July 2026',
    href: releaseTag('v2.22.0'),
  },
  {
    badge: 'security',
    badgeLabel: 'v2.21.4',
    icon: 'fa6-solid:user-lock',
    title: 'v2.21.4 — memory-hard password fallback, login open-redirect fix, and a first-run lockout fix',
    description:
      'Two security fixes and one onboarding fix, surfaced by a triage of the project\'s open code-scanning alerts and a reported first-run lockout; the auth changes went through two adversarial review passes. When bcrypt is unavailable the password-hashing fallback no longer stores or verifies passwords with fast, GPU-parallelizable SHA-256 — it uses hashlib.scrypt, a memory-hard KDF from the standard library, with the stored parameters bounds-checked so a corrupted settings file cannot turn every login into expensive work; passwords hashed under the old sha256:salt:hash fallback still verify after upgrade. The login page\'s safeNextUrl() now rejects the backslash open-redirect variant /\\host (which browsers normalize to //host), closing a ?next= link that bounced users off-site after they authenticated. And the Docker quick-start no longer locks new operators out: setting the documented API_BEARER_TOKEN used to push the instance past setup mode, so the create-admin form never rendered and — with local auth off — the login page refused local logins ("Local auth disabled"), even though the token itself could still create the first admin over the API. A bearer-only instance now re-surfaces that form and authenticates its two bootstrap calls with the operator\'s own token, while the world-open gate hardened in v2.21.1 is left byte-for-byte unchanged. The base image is also rebuilt on a current python:3.12-slim-trixie digest and every GitHub Action is now SHA-pinned.',
    date: 'July 2026',
    href: releaseTag('v2.21.4'),
  },
  {
    badge: 'fix',
    badgeLabel: 'v2.21.3',
    icon: 'fa6-solid:wrench',
    title: 'v2.21.3 — wildcard deployment status + rootless-podman / arbitrary-UID support',
    description:
      'Two fixes from real-world reports. Wildcard certificates no longer show a permanent false "wrong certificate" error: a wildcard does not cover its own apex (RFC 6125), so probing *.example.com at example.com mismatched on every wildcard. A wildcard without an explicit deployment host now reports a neutral "Not Verifiable"; an optional per-certificate deployment_host points the probe at a covered name; and every result carries a diagnostic mismatch_reason with the host that was probed and what did not match. Separately, rootless podman and arbitrary-UID runtimes (OpenShift) are now supported — the image\'s writable trees are group-0 owned and group-writable, so CertMate runs as any UID in group 0 with no host-side chown, while every secret stays owner-only 0600.',
    date: 'July 2026',
    highlight: true,
    href: releaseTag('v2.21.3'),
  },
  {
    badge: 'security',
    badgeLabel: 'v2.21.2',
    icon: 'fa6-solid:shield-halved',
    title: 'v2.21.2 — client-certificate lifecycle, private CA and CRL correctness',
    description:
      'The next-layer audit after v2.21.1 swept client certificates, the private CA, CRL distribution and the deployment-status cache; every defect was reproduced before it was fixed. Scheduled renewal no longer re-renews a superseded certificate forever; the TLS and client-certificate renewal jobs no longer share one lock (mTLS certificates could quietly expire unrenewed); the CA private key is written atomically at mode 0600; CRL regeneration preserves each certificate\'s real revocation date and reason and a stale CRL is regenerated on read; the CA signer no longer trusts CSR extensions, so a CSR asking for BasicConstraints(ca=True) can no longer mint a CA-capable certificate; and the deployment-status cache is evicted on issuance/renewal so the dashboard can no longer show a stale "deployed and matching" verdict.',
    date: 'July 2026',
    href: releaseTag('v2.21.2'),
  },
  {
    badge: 'security',
    badgeLabel: 'v2.21.1',
    icon: 'fa6-solid:lock',
    title: 'v2.21.1 — critical OIDC/SSO auth-bypass fix, and truth in reporting',
    description:
      'One theme: every path that could report success while silently not doing the thing now tells the truth — found by a full-project adversarial review. The headline fix is a pre-existing critical vulnerability: OIDC/SSO-only deployments were world-open. On an SSO-only box, setup mode never turned off, so every gated endpoint — read settings, download private keys, issue and delete certificates — was served to anonymous callers as admin; setup mode now also closes once OIDC is fully configured. Alongside it: renewal no-op detection was dead code in production (a --quiet flag routed the sentinel text to /dev/null) and is now artifact-based; audit-verify now fails closed on unreadable integrity evidence instead of answering "absent"; and four DNS providers (Porkbun, Vultr, ArvanCloud, Dynu) were silently broken and are now guarded by a credential-key contract test so a dead provider can no longer pass CI.',
    date: 'July 2026',
    highlight: true,
    href: releaseTag('v2.21.1'),
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.21.0',
    icon: 'fa6-solid:terminal',
    title: 'v2.21.0 — terminal SDK + CLI',
    description:
      'First-class terminal clients for the CertMate API, both on PyPI. certmate-sdk (from certmate import Client) wraps the same /api surface the MCP server drives and stays light — httpx only, no server or certbot. certmate-cli builds on it: certmate cert create/ls/info/renew/reissue/rm, dns, backup, deploy run, audit verify and health, rendering tables, with --wait to poll an async issuance and a client-side --dry-run that validates the domain and preflights the DNS provider without issuing anything. A Swagger contract test keeps the SDK in lockstep with the API. The release also fixes an audit-verify false alarm — a brand-new instance that has audited nothing (no chain file yet) now returns state=absent instead of the 409 that looked identical to a tamper.',
    date: 'July 2026',
    href: releaseTag('v2.21.0'),
  },
  {
    badge: 'security',
    badgeLabel: 'v2.20.0',
    icon: 'fa6-solid:shield-halved',
    title: 'v2.20.0 — security and reliability hardening sweep',
    description:
      'A focused hardening pass from an adversarial audit of the certificate engine, deploy hooks, storage/backup, auth/RBAC and the audit trail; every change ships with regression tests. A configured API bearer token is now enforced on every gated endpoint (an API-only operator was previously left unauthenticated); off-site S3 backups refuse to run without an encryption passphrase; renewal certbot calls are bounded by a 30-minute timeout and a host-local cross-process lock stops duplicate ACME orders under multiple workers; renewed private keys keep mode 0600; an API key can no longer be minted with a higher role or broader domain scope than its creator; and signed audit checkpoints are now actually verified on GET /api/audit/verify, so a truncation, rewind or rewrite at or below a checkpoint fails verification.',
    date: 'July 2026',
    href: releaseTag('v2.20.0'),
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.19.0',
    icon: 'fa6-solid:gauge-high',
    title: 'v2.19.0 — configurable API rate limits + rfc2136 CNAME delegation',
    description:
      'Per-endpoint API rate limits are now operator-tunable from Settings → API Keys (and GET/PUT /api/settings/rate-limits, admin) with an on/off toggle — a trusted automation fleet behind one egress IP no longer trips a hardcoded bucket, and changes apply live with no restart, sanitised on every request so a malformed entry can never disable a limit. DNS-alias (CNAME delegation) mode adds rfc2136: it writes the _acme-challenge TXT into the alias zone with a TSIG-signed dynamic update, discovering the owning zone from the server SOA, so one TSIG key can serve several zones including externally-managed domains. The v2.19.1 patch follows with a UI defect + accessibility sweep (WAI-ARIA dialogs and tabs, keyboard-operable rows, focus management) and design-token consistency.',
    date: 'June 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.19.0',
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.18.0',
    icon: 'fa6-solid:tower-broadcast',
    title: 'v2.18.0 — multi-protocol deployment probes + deploy-hook reliability',
    description:
      'The "is this certificate actually deployed?" probe grows beyond HTTPS-on-443: https-tls, plain tls, and smtp-starttls, with the port and protocol configurable per certificate from a new Probe tab. On a host that only reaches the internet through an HTTP proxy it tunnels the probe via CONNECT (HTTPS_PROXY/NO_PROXY) so the real peer certificate is still compared. The deploy-hook pipeline closes two gaps: scheduled auto-renewals now fire deploy hooks — a background renewal no longer updates the cert on disk while the live endpoint keeps serving the old one — and a failing hook surfaces its stderr from the Activity page instead of a bare exit code. v2.18.1 adds dashboard polish and translated docs (FR/IT/DE/ES).',
    date: 'June 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.18.0',
  },
  {
    badge: 'security',
    badgeLabel: 'v2.17.0',
    icon: 'fa6-solid:file-signature',
    title: 'v2.17.0 — third-party-verifiable audit trail',
    description:
      'Completes the agentic audit trail: the tamper-evident record can now be verified by a third party, off the box, without running or trusting CertMate. GET /api/audit/export returns an Ed25519-signed, self-verifying bundle — manifest, entries, signature — pinning the instance fingerprint, public key, seq range and head hash; GET /api/audit/public-key exposes the signing identity to pin out of band. A dependency-free verifier (python -m modules.core.audit_verify) checks the chain structure, manifest consistency, the Ed25519 signature and the key fingerprint. The v2.17.1 patch lands five must-fix hardenings: client-cert Common Name path traversal, a backup restore that downgraded private keys to world-readable, an unauthenticated /api/metrics, sessions that survived a user being disabled or demoted, and webhook secrets clobbered on a generic settings save.',
    date: 'June 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.17.0',
  },
  {
    badge: 'security',
    badgeLabel: 'v2.16.0',
    icon: 'fa6-solid:fingerprint',
    title: 'v2.16.0 — Agentic cert-lifecycle audit trail',
    description:
      'When an AI/MCP agent renews or replaces certificates on a schedule, "it ran" is not an audit trail. Every certificate action — create, renew, reissue, deploy, auto-renew, and unattended scheduled renewals — is now attributed to who or what acted (human, API token, or AI agent, down to the API key) and what triggered it. Entries are written into a tamper-evident SHA-256 hash chain; a standalone, dependency-free verifier (and a GET /api/audit/verify endpoint) detects any modification, deletion, or reorder. A new compliance note maps the trail honestly to NIS2, the EU AI Act Art. 50 transparency spirit, and ISO 42001. v2.16.1 also retires the discontinued BuyPass Go CA.',
    date: 'June 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.16.0',
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.15.0',
    icon: 'fa6-solid:bell',
    title: 'v2.15.0 — notifications, Grafana monitoring & MCP agent tooling',
    description:
      'Three first-class notification channels — Telegram, ntfy, Gotify — alongside Slack/Discord/webhook, with per-event filtering and a test button. An importable observability bundle: an 11-panel Grafana dashboard (inventory, days-to-expiry, status and provider breakdowns, cache, uptime) plus Prometheus alert rules, with /metrics populated. The built-in MCP server grows to 13 tools (per-domain detail, async job polling, certificate download, auto-renew toggle, DNS account listing, activity log) with an "operating CertMate with an AI agent" scheduling guide.',
    date: 'June 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.15.0',
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.13.0',
    icon: 'fa6-solid:pen-to-square',
    title: 'v2.13.0 — edit & reissue certificates in place',
    description:
      'Extend or drop a certificate\'s SAN entries — and change its DNS, alias, or CA configuration — without delete + recreate. POST /api/certificates/<domain>/reissue reissues over the existing certbot lineage; omitted fields keep the values the certificate was issued with, so expanding or shrinking a SAN set never requires re-entering DNS/alias/CA config. The old certificate keeps serving until certbot succeeds. Available in the dashboard via an Edit & Reissue action prefilled from the certificate\'s metadata.',
    date: 'June 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.13.0',
  },
  {
    badge: 'fix',
    badgeLabel: 'v2.8.3',
    icon: 'fa6-solid:wrench',
    title: 'v2.8.3 — Azure sub-delegated DNS alias fix',
    description:
      'Hotfix for Azure DNS-01 alias mode against a sub-delegated validation zone (e.g. acme-validation.example.com delegated under example.com): issuance failed because Lexicon resolves the hosted zone with tldextract, which collapses any name back to the registered domain. CertMate now sets resolve_zone_name so Lexicon resolves the real zone via a dnspython SOA lookup from the full alias FQDN. Upgrade recommended if you use Azure DNS alias mode with a delegated validation zone.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.8.3',
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.8.2',
    icon: 'fa6-solid:shield-halved',
    title: 'v2.8.2 — Security Audit Hardening & UI/UX Audit Response',
    description:
      'A comprehensive security and UI audit response bringing logical hardening to the backend. Features audit logging for storage updates, migrations, Azure Key Vault backfills, and DNS provider changes. Hardens backups with path traversal validation, aligns backup pruning/timing to UTC. Incorporates 60+ UI/UX fixes including dark mode visibility improvements, ARIA accessibility, focus trapping/restores, and spinner loading safeguards.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.8.2',
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.8.1',
    icon: 'fa6-solid:robot',
    title: 'v2.8.1 — Log Sanitizer, Zombie Certificate Scanner & MCP Server',
    description:
      'Features a Log Sanitizer to automatically redact API tokens, private keys, and PEM blocks. Adds a multi-threaded Zombie Certificate Scanner to identify and clean up orphan certificates. Introduces the CertMate MCP (Model Context Protocol) Server for integrating agentic AI assistants. Adds a Diagnostics Snapshot with a UI copy/clipboard helper.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.8.1',
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.8.0',
    icon: 'fa6-solid:file-shield',
    title: 'v2.8.0 — certificate formats, SSO user management & faster listing',
    description:
      'Encrypted Windows .pfx (PKCS#12) export written on every issuance/renewal with a stable fingerprint for polling; PKCS#1/SEC1 private-key download for legacy stacks (`?key_format=pkcs1`); `CERTMATE_CHAIN_PATH` (intermediates only) exposed to deploy hooks. SSO user-management hardening: IdP-linked accounts are badged, can\'t take a local password, and the sole remaining admin can no longer be deleted or disabled. Certificate listing replaces the per-row openssl subprocess with in-process parsing plus a cached info read, and routine backups now skip certbot scratch while keeping renewal lineage.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.8.0',
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.7.0',
    icon: 'fa6-solid:id-badge',
    title: 'v2.7.0 — OIDC / SSO authentication',
    description:
      'Authorization Code + PKCE via Authlib, IdP-claim-based role mapping (case-insensitive, first-match-wins), JIT or link-by-email provisioning with mandatory `email_verified` gate against account-takeover via self-service-signup IdPs. Dedicated audit-logged settings endpoint kept separate from the bulk settings POST so a scoped key cannot mutate OIDC config. Concurrency-safe JIT path routed through the settings RLock.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.7.0',
  },
  {
    badge: 'security',
    badgeLabel: 'Audit',
    icon: 'fa6-solid:shield-halved',
    title: 'Internal security audit — 11 findings closed in one day',
    description:
      'Four-angle audit on authz/scope coverage, secrets handling, path traversal completeness and shell injection. Closed: backup ZIP plaintext credentials (mask-by-default + admin opt-in for full DR, chmod 0600), settings-mutating routes that destroyed credentials on round-trip POST, path traversal at the WRITE boundary on `/api/certificates/create`, client-cert API role + private-key gating, certbot stderr leak on credential-file parse errors, acme-dns shared-secret masking, settings GET cross-tenant domain disclosure. ~115 regression tests added.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/pulls?q=is%3Apr+is%3Amerged+label%3Aaudit',
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.6.x',
    icon: 'fa6-solid:network-wired',
    title: 'v2.6.x — Azure Key Vault + nested-subdomain wildcards + storage hot-reload',
    description:
      'Native Azure Key Vault Certificate-object storage mode (AKS / App Service / Front Door consume it directly). Wildcard cert issuance for nested subdomains against the parent hosted zone, with per-provider zone discovery (Azure today, registry-keyed for future providers). Storage backend hot-reloads when `certificate_storage` changes — no restart required. Configurable cert key shape (RSA 2048/3072/4096 or ECDSA P-256/P-384).',
    date: 'May 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases',
  },
  {
    badge: 'fix',
    badgeLabel: 'v2.6.9',
    icon: 'fa6-solid:wrench',
    title: 'v2.6.9 — Azure DNS sp_* keys + zoneN mapping',
    description:
      '`certbot-dns-azure` 2.x expects `dns_azure_sp_client_id` / `dns_azure_sp_client_secret` and parses subscription + resource group out of `dns_azure_zoneN` lines. The previous bare-key format was silently ignored by the plugin and aborted with "No authentication methods have been configured for Azure DNS" before any DNS challenge could run.',
    date: 'May 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.6.9',
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.5.x',
    icon: 'fa6-solid:star',
    title: 'v2.5.x — UI rewrite + multi-audit response',
    description:
      'Full template sweep (51 fixes across all templates), standardized modal macro with Esc/backdrop/focus-trap, accessibility passes, deploy-hook parameter-expansion bypass closed, metadata RMW race fixed, corrupt-metadata quarantine, scheduler /health surfacing. +160 unit tests on previously-uncovered crypto-critical modules (Private CA, CSR handler, OCSP/CRL, storage backends).',
    date: 'May 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases',
  },
  {
    badge: 'feature',
    badgeLabel: 'Feature',
    icon: 'fa6-solid:certificate',
    title: 'Client Certificates Management',
    description:
      'Complete client certificate lifecycle with OCSP responder, CRL distribution, batch CSV import (up to 100 identities per call), audit logging, and per-file role gating — viewers pull cert/chain/csr, operators pull privkey, admins revoke.',
    date: 'January 2026',
  },
  {
    badge: 'security',
    badgeLabel: 'Security',
    icon: 'fa6-solid:key',
    title: 'Scoped API Keys + RBAC',
    description:
      'Three-tier role model (admin / operator / viewer) plus scoped API keys with allowed_domains enforcement. Bearer-token rotation, audit log for sensitive setting changes, per-IP rate limiting on auth endpoints.',
    date: 'December 2025',
  },
];
