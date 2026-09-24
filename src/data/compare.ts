// The comparison with other certificate tools, in one place. The home shows
// one view of it (CertMate, cert-manager, Caddy, acme.sh / lego) and the
// comparison pages another (CertMate, cert-manager, Caddy, Traefik, certbot),
// in English and Italian. They used to be three hand-written tables that
// disagreed: the home gave cert-manager "15+" DNS providers and Caddy "20+",
// the comparison page "Many" and "Several".
//
// Every cell is a fact about the tool, not a judgement. The provider counts
// were checked on 24 September 2026:
//   cert-manager  pkg/issuer/acme/dns: 8 built-in solvers (acmedns, akamai,
//                 azuredns, clouddns, cloudflare, digitalocean, rfc2136,
//                 route53) plus the webhook solver
//   Caddy         github.com/caddy-dns: 96 provider modules (97 repositories,
//                 one of them a template)
//   lego          providers/dns: 223 providers
//   acme.sh       dnsapi: 198 dns_*.sh scripts
//   Traefik       go.mod depends on github.com/go-acme/lego, whose DNS
//                 providers its ACME resolver uses
//   certbot       13 certbot-dns-* plugins in the certbot repository
// Caddy (acme_ca) and Traefik (caServer) accept any ACME directory; the page
// used to say Let's Encrypt and ZeroSSL for one and Let's Encrypt for the
// other. Traefik's API is read-only: "All the following endpoints must be
// accessed with a GET HTTP request" (docs/content/reference/
// install-configuration/api-dashboard.md).

import { PROVIDER_COUNT } from '~/data/site';

export type Tool = 'certmate' | 'certManager' | 'caddy' | 'traefik' | 'certbot' | 'acmeShLego';
export type Locale = 'en' | 'it';
type Text = string | Record<Locale, string>;

export const TOOL_NAMES: Record<Tool, string> = {
  certmate: 'CertMate',
  certManager: 'cert-manager',
  caddy: 'Caddy',
  traefik: 'Traefik',
  certbot: 'certbot',
  acmeShLego: 'acme.sh / lego',
};

export const COMPARE_CHECKED: Record<Locale, string> = {
  en: 'Provider counts checked 24 September 2026, feature notes July 2026, against each project’s main branch. Open an issue if a cell is wrong and it will be fixed.',
  it: 'Conteggi dei provider verificati il 24 settembre 2026, caratteristiche a luglio 2026, sul ramo principale di ciascun progetto. Se una cella è sbagliata, apri una issue e verrà corretta.',
};

type Key =
  | 'formFactor'
  | 'outsideK8s'
  | 'webUi'
  | 'restApi'
  | 'otherHosts'
  | 'dnsProviders'
  | 'multiCa'
  | 'rbac'
  | 'mcp'
  | 'multiAccount'
  | 'storage'
  | 'oidc'
  | 'audit'
  | 'license';

const yes = { en: 'Yes', it: 'Sì' };
const no = 'No';

const ROWS: Record<Key, { label: Text; cells: Partial<Record<Tool, Text>> }> = {
  formFactor: {
    label: { en: 'Primary form factor', it: 'Forma principale' },
    cells: {
      certmate: { en: 'Standalone app (UI + REST API)', it: 'App standalone (UI + API REST)' },
      certManager: { en: 'Kubernetes controller', it: 'Controller Kubernetes' },
      caddy: 'Web server',
      traefik: 'Reverse proxy',
      certbot: { en: 'CLI client', it: 'Client CLI' },
    },
  },
  outsideK8s: {
    label: { en: 'Runs without Kubernetes', it: 'Funziona fuori da Kubernetes' },
    cells: { certmate: yes, certManager: no, caddy: yes, traefik: yes, certbot: yes, acmeShLego: yes },
  },
  webUi: {
    label: { en: 'Web UI', it: 'Interfaccia web' },
    cells: {
      certmate: yes,
      certManager: { en: 'No (kubectl only)', it: 'No (solo kubectl)' },
      caddy: { en: 'No (config-file driven)', it: 'No (file di configurazione)' },
      traefik: { en: 'Dashboard (limited)', it: 'Dashboard (limitata)' },
      certbot: { en: 'No (CLI only)', it: 'No (solo CLI)' },
      acmeShLego: { en: 'No (CLI only)', it: 'No (solo CLI)' },
    },
  },
  restApi: {
    label: { en: 'REST API', it: 'API REST' },
    cells: {
      certmate: { en: 'Yes (OpenAPI)', it: 'Sì (OpenAPI)' },
      certManager: { en: 'Kubernetes API (CRDs)', it: 'API Kubernetes (CRD)' },
      caddy: { en: 'Yes (admin endpoint)', it: 'Sì (endpoint admin)' },
      traefik: { en: 'Read-only API', it: 'API in sola lettura' },
      certbot: no,
      acmeShLego: no,
    },
  },
  otherHosts: {
    label: { en: 'Manages certs for other/3rd-party hosts', it: 'Gestisce certificati per altri host' },
    cells: {
      certmate: { en: 'Yes (deploy hooks)', it: 'Sì (deploy hook)' },
      certManager: { en: 'In-cluster', it: 'Nel cluster' },
      caddy: { en: 'Self only', it: 'Solo sé stesso' },
      traefik: { en: 'Proxied apps', it: 'App in proxy' },
      certbot: { en: 'Self only', it: 'Solo sé stesso' },
    },
  },
  dnsProviders: {
    label: { en: 'DNS-01 providers', it: 'Provider DNS-01' },
    cells: {
      certmate: String(PROVIDER_COUNT),
      certManager: { en: '8 built in, more via webhooks', it: '8 integrati, altri via webhook' },
      caddy: { en: '90+ (caddy-dns modules)', it: '90+ (moduli caddy-dns)' },
      traefik: '200+ (lego)',
      certbot: { en: '13 official plugins, more third-party', it: '13 plugin ufficiali, altri di terze parti' },
      acmeShLego: '190+ (acme.sh) / 200+ (lego)',
    },
  },
  multiCa: {
    label: {
      en: 'Multi-CA (LE / ZeroSSL / Google / DigiCert / SSL.com / Sectigo / Actalis / private)',
      it: 'Multi-CA (LE / ZeroSSL / Google / DigiCert / SSL.com / Sectigo / Actalis / privata)',
    },
    cells: {
      certmate: yes,
      certManager: { en: 'Yes (issuers)', it: 'Sì (issuer)' },
      caddy: { en: 'Any ACME CA', it: 'Qualsiasi CA ACME' },
      traefik: { en: 'Any ACME CA', it: 'Qualsiasi CA ACME' },
      certbot: { en: 'Any ACME CA', it: 'Qualsiasi CA ACME' },
    },
  },
  rbac: {
    label: { en: 'RBAC / scoped API keys', it: 'RBAC / API key con scope' },
    cells: {
      certmate: yes,
      certManager: { en: 'Kubernetes RBAC', it: 'RBAC Kubernetes' },
      caddy: no,
      traefik: no,
      certbot: no,
    },
  },
  mcp: {
    label: { en: 'MCP server (LLM / agent operations)', it: 'Server MCP (LLM / agenti)' },
    cells: {
      certmate: { en: 'Yes (first-party)', it: 'Sì (ufficiale)' },
      certManager: no,
      caddy: no,
      acmeShLego: no,
    },
  },
  multiAccount: {
    label: { en: 'Multi-account per DNS provider', it: 'Più account per provider DNS' },
    cells: {
      certmate: yes,
      certManager: { en: 'One Issuer per credential', it: 'Un Issuer per credenziale' },
      caddy: { en: 'Partial', it: 'Parziale' },
      acmeShLego: no,
    },
  },
  storage: {
    label: { en: 'Storage backends', it: 'Backend di archiviazione' },
    cells: {
      certmate: 'Filesystem + Azure KV + AWS SM + Vault + Infisical + S3-compatible',
      certManager: 'Kubernetes Secrets',
      caddy: 'Filesystem',
      acmeShLego: 'Filesystem',
    },
  },
  oidc: {
    label: 'OIDC / SSO',
    cells: {
      certmate: { en: 'Yes (v2.7.0+)', it: 'Sì (v2.7.0+)' },
      certManager: { en: 'Via cluster RBAC', it: 'Tramite RBAC del cluster' },
      caddy: no,
      acmeShLego: no,
    },
  },
  audit: {
    label: {
      en: 'Tamper-evident, independently verifiable audit trail',
      it: 'Audit trail a prova di manomissione, verificabile da terzi',
    },
    cells: {
      certmate: {
        en: 'Yes (Ed25519-signed export + standalone verifier)',
        it: 'Sì (export firmato Ed25519 + verificatore autonomo)',
      },
      certManager: no,
      caddy: no,
      acmeShLego: no,
    },
  },
  license: {
    label: { en: 'License', it: 'Licenza' },
    cells: {
      certmate: 'MIT',
      certManager: 'Apache-2.0',
      caddy: 'Apache-2.0',
      traefik: 'MIT',
      certbot: 'Apache-2.0',
      acmeShLego: 'GPL-3.0 / MIT',
    },
  },
};

export const HOME_VIEW = {
  tools: ['certmate', 'certManager', 'caddy', 'acmeShLego'] as Tool[],
  rows: [
    'webUi',
    'restApi',
    'mcp',
    'multiAccount',
    'storage',
    'oidc',
    'audit',
    'dnsProviders',
    'outsideK8s',
    'license',
  ] as Key[],
};

export const PAGE_VIEW = {
  tools: ['certmate', 'certManager', 'caddy', 'traefik', 'certbot'] as Tool[],
  rows: [
    'formFactor',
    'outsideK8s',
    'webUi',
    'restApi',
    'otherHosts',
    'dnsProviders',
    'multiCa',
    'rbac',
    'license',
  ] as Key[],
};

const say = (t: Text, locale: Locale) => (typeof t === 'string' ? t : t[locale]);

/**
 * The table for one view, in one language. A view asking for a cell the data
 * does not have fails the build.
 */
export function compareTable(view: { tools: Tool[]; rows: Key[] }, locale: Locale) {
  return {
    columns: view.tools.map((tool) => TOOL_NAMES[tool]),
    rows: view.rows.map((key) => {
      const row = ROWS[key];
      return {
        label: say(row.label, locale),
        cells: view.tools.map((tool) => {
          const cell = row.cells[tool];
          if (cell === undefined) throw new Error(`src/data/compare.ts: row '${key}' has no cell for ${tool}`);
          return say(cell, locale);
        }),
      };
    }),
  };
}
