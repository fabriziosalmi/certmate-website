# Analisi SEO di certmate-website

Misurato sul commit `0540ca2`, sull'output di `npm run build`, non sul sorgente.
Ogni difetto porta il comando che lo dimostra e il numero che ne esce.

Il numero "dopo" resta vuoto finche' la correzione non e' misurata: una casella
vuota vuol dire non ancora fatto, non gia' a posto.

## Come rifare le misure

```bash
npm run build
node scripts/seo-inventory.mjs        # -> seo/inventory.json, 40 pagine
```

L'inventario legge `dist/`, non `src/`: un crawler vede l'HTML costruito, quindi
e' quello che va misurato. Le date vengono da `git log`, non da `mtime`, cosi'
due esecuzioni danno lo stesso file.

---

## Prima di tutto: due numeri del brief non si riproducono

Il brief dichiara 7.448 parole per le pagine Astro e 7.006 per le statiche, e ne
conclude che le pagine `/docs/` sono meta' del testo del sito. Sul commit citato
quel confronto mette insieme due cose diverse.

```bash
cat src/content/errors/*/*.md* src/content/deploy/*/*.md* | wc -w   # 7448
cat public/docs/*.html | wc -w                                      # 8940
```

7.448 e' **esattamente** il conteggio grezzo dei markdown sorgente: prosa, senza
markup. Il numero delle statiche cade invece nell'intervallo dei conteggi grezzi
dell'HTML (5.360 senza `<style>` e senza `index.html`, fino a 8.940 con tutto),
che includono markup e CSS inline. Non riproduco 7.006 con nessuna variante che
ho provato, e lo dico invece di sceglierne una che ci somigli.

Misurato allo stesso modo sui due lati, cioe' testo estratto dall'HTML costruito
dopo aver tolto script, style e cornice:

| | pagine Astro | pagine statiche `/docs/` |
| :--- | ---: | ---: |
| parole di testo reale | 17.191 | 3.692 |
| quota del testo del sito | 82% | **18%** |

Le statiche non sono meta' del sito: sono meno di un quinto. E il dettaglio
conta piu' del totale.

```bash
node -e "require('./seo/inventory.json').filter(r=>r.url.startsWith('/docs/')).forEach(r=>console.log(r.words, r.url))"
```

| pagina | parole |
| :--- | ---: |
| `/docs/storage-backends.html` | 79 |
| `/docs/backup-recovery.html` | 81 |
| `/docs/docker-deployment.html` | 89 |
| `/docs/` | 127 |
| `/docs/troubleshooting.html` | 136 |
| `/docs/contributing.html` | 155 |
| `/docs/getting-started.html` | 472 |
| `/docs/dns-providers.html` | 613 |
| `/docs/security.html` | 866 |
| `/docs/api-reference.html` | 1.074 |

**Sei pagine su dieci stanno sotto le 160 parole.** Questo cambia l'ordine del
lavoro: mettere una description e un canonical su una pagina da 79 parole non la
rende competitiva per niente. La metadata manca davvero (difetto 3), ma da sola
non e' la leva.

---

## I difetti, in ordine di quanto costano

### 1. Il canonical contraddice la sitemap su 27 pagine su 30

```bash
node -e "
const rows=require('./seo/inventory.json'), fs=require('fs');
const locs=new Set([...fs.readFileSync('dist/sitemap-0.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
console.log(rows.filter(r=>r.canonical&&!locs.has(r.canonical)).length);"
```

| | prima | dopo |
| :--- | ---: | ---: |
| pagine il cui canonical non compare nella sitemap | **27 / 30** | |

Le pagine sono pubblicate come directory (`/deploy/aws/`), la sitemap dichiara la
forma con lo slash, il tag in pagina dichiara quella senza:

```
canonical: https://www.certmate.org/deploy/aws
sitemap:   https://www.certmate.org/deploy/aws/
```

Il sito e' su GitHub Pages, e la forma senza slash non esiste:

```bash
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://www.certmate.org/deploy/aws
# 301 -> https://www.certmate.org/deploy/aws/
```

Quindi il segnale piu' forte di canonicalizzazione punta a un URL che rimanda
alla pagina stessa, mentre il segnale piu' debole punta a quello giusto. La
documentazione di Google lo nomina come cosa da non fare:

> "Don't specify different URLs as canonical for the same page using different
> canonicalization techniques (for example, don't specify one URL in a sitemap,
> but a different URL for that same page using `rel="canonical"`)."
>
> -- [Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

Sulla stessa pagina, la sitemap e' classificata come "a weak signal", meno
potente del `rel="canonical"`.

Questo difetto non era nel brief e colpisce le trenta pagine considerate a
posto, non le dieci considerate rotte.

### 2. Gli hreflang puntano quasi tutti a redirect, e la home inglese non risponde

```bash
node -e "
const {load}=require('cheerio'),fs=require('fs');let t=0,s=0;
for(const r of require('./seo/inventory.json')){const q=load(fs.readFileSync('dist/'+r.builtFrom,'utf8'));
for(const e of q('link[rel=alternate][hreflang]').toArray()){t++;if(!q(e).attr('href').endsWith('/'))s++;}}
console.log(s+'/'+t);"
```

| | prima | dopo |
| :--- | ---: | ---: |
| href hreflang che puntano a un URL con redirect | **79 / 81** | |
| pagine con un alternato dichiarato ma non ricambiato | **1** (`/`) | |

La home italiana dichiara `en` verso `https://www.certmate.org/`; la home inglese
non dichiara niente. Google tratta gli annotamenti non reciproci come inesistenti:

> "If two pages don't both point to each other, the tags will be ignored."
>
> -- [Localized versions of your pages](https://developers.google.com/search/docs/specialty/international/localized-versions)

La stessa pagina richiede che ogni versione elenchi anche se stessa. `/privacy/` e
`/security/` non hanno hreflang e va bene: non esiste una versione italiana.

### 3. Le dieci pagine `/docs/` non hanno nessun metadato

```bash
node -e "
const r=require('./seo/inventory.json').filter(x=>x.url.startsWith('/docs/'));
const n=k=>r.filter(x=>x[k]&&(!Array.isArray(x[k])||x[k].length)).length;
console.log('description',n('description'),'canonical',n('canonical'),'og:image',n('ogImage'),'json-ld',n('jsonLdTypes'),'su',r.length);"
```

| | prima | dopo |
| :--- | ---: | ---: |
| `meta description` | **0 / 10** | |
| `rel=canonical` | **0 / 10** | |
| `og:image` | **0 / 10** | |
| JSON-LD | **0 / 10** | |

Non sono viste dall'integrazione sitemap di Astro (sono HTML costruito altrove) e
sono state aggiunte a mano con `customPages`: sono nella sitemap e nessun
template le tocca.

### 4. La stessa pagina a due URL, senza niente che dica quale vale

```bash
curl -s -o /dev/null -w "/docs/index.html %{http_code}\n" https://www.certmate.org/docs/index.html
curl -s -o /dev/null -w "/docs/          %{http_code}\n" https://www.certmate.org/docs/
grep -c "docs/index.html" dist/sitemap-0.xml
```

Rispondono entrambe 200, nessuna delle due ha un canonical, e la sitemap dichiara
la variante con `index.html`.

### 5. I tag della scheda social usano `property=` invece di `name=`

```bash
node -e "console.log(require('./seo/inventory.json').reduce((a,r)=>{const k=r.twitterCardAttribute||'(nessuno)';a[k]=(a[k]||0)+1;return a;},{}))"
# { property: 30, '(nessuno)': 10 }
```

| | prima | dopo |
| :--- | ---: | ---: |
| pagine con `twitter:card` su `name=` | **0 / 40** | |

Da verificare sulla documentazione X prima di chiamarlo difetto: molti parser
accettano `property=` come ripiego. Segnato come da confermare, non come rotto.

### 6. La sitemap dichiara quattro namespace e non ne usa nessuno

```bash
head -c 400 dist/sitemap-0.xml | tr '>' '\n' | grep xmlns
for t in xhtml:link image:image video:video lastmod changefreq priority; do printf "%-12s %s\n" "$t" "$(grep -c $t dist/sitemap-0.xml)"; done
```

| | prima | dopo |
| :--- | ---: | ---: |
| namespace dichiarati (`news`, `xhtml`, `image`, `video`) | 4 | |
| namespace usati | **0** | |
| URL con `lastmod` | **0 / 40** | |

### 7. Una sola immagine social e una sola riga di keywords per tutto il sito

```bash
node -e "
const r=require('./seo/inventory.json'), u=k=>new Set(r.map(x=>x[k]).filter(Boolean)).size;
console.log('og:image distinti',u('ogImage'),'| pagine senza og:image',r.filter(x=>!x.ogImage).length);
console.log('keywords distinte',u('keywords'),'| pagine con keywords',r.filter(x=>x.keywords).length);"
```

| | prima | dopo |
| :--- | ---: | ---: |
| `og:image` distinti su 40 pagine | **1** (piu' 10 pagine senza) | |
| valori distinti di `meta keywords` | **1** (su 30 pagine) | |

`meta keywords` non lo usa nessun motore: va tolto, non migliorato.

---

## Cosa non ho ancora misurato

- Le nove domande senza pagina citate dal brief: non ho verificato la fonte da
  cui risulta che vengano cercate. Il volume di ricerca non e' misurabile da
  questo repo e il brief non dice da dove viene.
- Core Web Vitals e peso delle pagine: fuori dal perimetro chiesto.
- Se le pagine passano il Rich Results Test: richiede lo strumento di Google su
  URL pubblici, e le correzioni non sono ancora pubblicate.
