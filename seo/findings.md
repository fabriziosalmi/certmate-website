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
| pagine il cui canonical non compare nella sitemap | **27 / 30** | **0 / 40** |

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
| href hreflang che puntano a un URL con redirect | **79 / 81** | **0 / 84** |
| pagine con un alternato dichiarato ma non ricambiato | **1** (`/`) | **0** |

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
| `meta description` | **0 / 10** | **10 / 10** |
| `rel=canonical` | **0 / 10** | **10 / 10** |
| `og:image` | **0 / 10** | **10 / 10** |
| JSON-LD | **0 / 10** | **10 / 10** |

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

| | prima | dopo |
| :--- | ---: | ---: |
| occorrenze di `docs/index.html` nella sitemap | **1** | **0** |
| pagine `/docs/` con un canonical | **0 / 10** | **10 / 10** |

La forma annunciata e' `/docs/`. `/docs/index.html` continua a rispondere 200,
perche' e' un URL gia' indicizzato e toglierlo sarebbe la cosa che va evitata,
ma ora dichiara come canonical `/docs/` e non compare piu' nella sitemap.

### 5. I tag della scheda social usano `property=` invece di `name=`

```bash
node -e "console.log(require('./seo/inventory.json').reduce((a,r)=>{const k=r.twitterCardAttribute||'(nessuno)';a[k]=(a[k]||0)+1;return a;},{}))"
# { property: 30, '(nessuno)': 10 }
```

| | prima | dopo |
| :--- | ---: | ---: |
| pagine con `twitter:card` su `name=` | **0 / 40** | **40 / 40** |

Da verificare sulla documentazione X prima di chiamarlo difetto: molti parser
accettano `property=` come ripiego. Segnato come da confermare, non come rotto.

### 6. La sitemap dichiara quattro namespace e non ne usa nessuno

```bash
head -c 400 dist/sitemap-0.xml | tr '>' '\n' | grep xmlns
# grep -c conta le righe, e la sitemap e' una riga sola: serve grep -o.
for t in 'xhtml:link' 'image:image' 'video:video' '<lastmod>'; do printf "%-14s %s\n" "$t" "$(grep -o "$t" dist/sitemap-0.xml | wc -l | tr -d ' ')"; done
```

| | prima | dopo |
| :--- | ---: | ---: |
| namespace dichiarati (`news`, `xhtml`, `image`, `video`) | 4 | 4 |
| namespace usati | **0** | 0 (in `sitemap-0.xml`) |
| URL con `lastmod` | **0 / 40** | **40 / 40**, 8 date distinte |

### 7. Una sola immagine social e una sola riga di keywords per tutto il sito

```bash
node -e "
const r=require('./seo/inventory.json'), u=k=>new Set(r.map(x=>x[k]).filter(Boolean)).size;
console.log('og:image distinti',u('ogImage'),'| pagine senza og:image',r.filter(x=>!x.ogImage).length);
console.log('keywords distinte',u('keywords'),'| pagine con keywords',r.filter(x=>x.keywords).length);"
```

| | prima | dopo |
| :--- | ---: | ---: |
| `og:image` distinti su 40 pagine | **1** (piu' 10 pagine senza) | **40** (0 senza) |
| valori distinti di `meta keywords` | **1** (su 30 pagine) | **0** (su 0 pagine) |

`meta keywords` non lo usa nessun motore: va tolto, non migliorato.

### 8. Il marcatore del prodotto era su 30 pagine su 40

```bash
node -e "
const r=require('./seo/inventory.json'), has=t=>r.filter(x=>x.jsonLdTypes.includes(t)).length;
console.log('SoftwareApplication', has('SoftwareApplication'), '| BreadcrumbList', has('BreadcrumbList'),
            '| senza nulla', r.filter(x=>!x.jsonLdTypes.length).length, '| totale', r.length);
console.log(r.filter(x=>x.jsonLdTypes.includes('SoftwareApplication')).map(x=>x.url).join(' '));"
grep -rl 'aggregateRating' dist --include='*.html' | wc -l
# SoftwareApplication 3 | BreadcrumbList 37 | senza nulla 2 | totale 40
# / /cert-manager-alternative/ /it/cert-manager-alternative/
# 0
```

| | prima | dopo |
| :--- | ---: | ---: |
| pagine con `SoftwareApplication` | **30 / 40** | **3 / 40** |
| pagine con `BreadcrumbList` | 27 / 40 | **37 / 40** |
| pagine senza alcun dato strutturato | 0 | 2 |
| pagine con `aggregateRating` o `review` | **0** | **0** |

`BaseLayout` lo emetteva su ogni pagina che rende. Quindi l'informativa privacy,
la politica di sicurezza, sei spiegazioni di errori SSL in due lingue e otto
guide al deploy dichiaravano ciascuna di essere un'applicazione software gratuita
con licenza MIT, 29 provider DNS e OIDC. Google dice entrambe le meta' del
perche' non va:

> "Put the structured data on the page that it describes, unless specified
> otherwise by the documentation."
>
> "Your structured data must be a true representation of the page content."
>
> -- [Structured data general guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

Le tre rimaste sono la home inglese e le due pagine di confronto, che mostrano
davvero le funzionalita' di CertMate nel corpo visibile. La home italiana non e'
tra queste: e' un indice di cosa esiste in italiano e non mostra nessun elenco
di funzionalita', quindi marcarla violerebbe la regola sul contenuto che il
lettore non vede.

Le due rimaste senza niente sono `/privacy/` e `/security/`. Non esiste un tipo
della galleria per un'informativa o per una politica di sicurezza, e quelle due
pagine non disegnano nessuna traccia di navigazione, quindi un `BreadcrumbList`
li' sarebbe marcatura per contenuto invisibile. Non dichiarano nulla, ed e'
corretto cosi'.

Cosa questo **non** compra, detto perche' nessuno se lo aspetti: la
documentazione di Google sul tipo Software App richiede `name`, `offers.price` e
**uno tra `aggregateRating` e `review`**. Il sito non ha valutazioni, su nessuna
pagina, e inventarne non e' sul tavolo. Quindi nessuna pagina e' eleggibile al
rich result Software App, e non lo era nemmeno prima di questa modifica. Il
blocco resta dov'e' vero perche' descrive l'entita', non perche' porti stelline.

### 9. Il generatore della scheda social girava per caso

```bash
node -e "const p=require('./package.json');console.log('sharp dichiarato:', 'sharp' in {...p.dependencies, ...p.devDependencies})"
node -e "console.log(require.resolve('sharp'))"
```

| | prima | dopo |
| :--- | ---: | ---: |
| `sharp` dichiarato in `package.json` | **no** | si' |
| invocazione | `prebuild: npm run og \|\| true` | passo di `build` |

`scripts/build-og.mjs` importa `sharp`, che non era una dipendenza dichiarata:
funzionava solo perche' `sharp` e' una dipendenza transitiva di Astro. E veniva
invocato con `|| true`, quindi qualunque fallimento era silenzioso. Il commento
nel file diceva che cosi' la scheda "non puo' piu' restare indietro rispetto a
una release": con quelle due condizioni poteva eccome, senza che nessuno lo
vedesse. Oggi la scheda committata coincideva con quella rigenerata, quindi la
deriva non era in atto: la difesa pero' non reggeva.

### 10. La CI faceva un clone superficiale

```bash
grep -A8 'actions/checkout@11d5' .github/workflows/deploy.yml | grep fetch-depth
git rev-parse --is-shallow-repository
```

| | prima | dopo |
| :--- | ---: | ---: |
| `fetch-depth` su `actions/checkout` | predefinito (**1**) | `0` |

Questo non era un difetto finche' nessuno leggeva la storia di git. Lo e'
diventato nel momento in cui il `lastmod` viene dalla data del sorgente: con un
clone a un commit solo, `git log` risponde quella data per ogni file, e le 40
pagine avrebbero dichiarato tutte la stessa data di modifica, proprio sulla sola
macchina che pubblica. Il `build` ora si rifiuta di partire su un clone
superficiale invece di pubblicare quella data.

### 11. Due difetti erano nei miei strumenti, non nel sito

Vanno scritti qui perche' in entrambi i casi la misura diceva "a posto".

**L'inventario cercava la documentazione dove non e' piu'.** Dopo che i dieci
file `docs` sono stati spostati da `public/` a `src/docs/`, la mappa URL ->
sorgente continuava a guardare in `public/docs/`: tutte e dieci le righe
riportavano `source: null` e il riepilogo stampava lo stesso "40 pages".
Misurato: 10 righe su 10 senza sorgente, oggi 0 su 40. La mappa ora e' una sola,
in `scripts/lib/page-sources.mjs`, condivisa con la sitemap, cosi' le due non
possono essere in disaccordo.

**Il controllo del file media mancante non controllava niente.** La prima
versione di `scripts/check-media.mjs` cancellava un poster dichiarato e la build
passava lo stesso: Astro tiene in cache la validazione delle collection, quindi
cancellare un file senza toccare la pagina che lo dichiara riusa la voce in
cache e il controllo Zod non gira mai. La garanzia scritta nello schema era
falsa esattamente nel caso per cui era stata scritta. Ora il controllo legge
anche l'output costruito, dove una cache non puo' arrivare.

### 12. Link interni: misurati, e sono a posto

```bash
node -e "
const {load}=require('cheerio'),fs=require('fs'),path=require('path');
const ok=p=>{p=p.replace(/[?#].*\$/,'');if(p===''||p.endsWith('/'))p+='index.html';
  return fs.existsSync(path.join('dist',p.replace(/^\//,'')))};
let n=0,bad=0;
for(const r of require('./seo/inventory.json')){const q=load(fs.readFileSync('dist/'+r.builtFrom,'utf8'));
 for(const a of q('a[href]').toArray()){const h=q(a).attr('href');
  if(!h||/^(https?:|mailto:|tel:|javascript:|#)/.test(h))continue;n++;
  if(!ok(new URL(h,'https://x'+r.url).pathname))bad++;}}
console.log(n,'link interni,',bad,'rotti');"
```

| | valore |
| :--- | ---: |
| link interni controllati | 634 |
| link interni rotti | **0** |

Nessun difetto da correggere, ma il controllo entra nel gate: e' esattamente il
difetto che aveva prodotto `/it` inesistente mentre tredici pagine nella sitemap
lo linkavano da intestazione e briciole di pane.

---

## Cosa non ho fatto, e perche'

Questo elenco non e' una formalita': e' la parte del lavoro che resta aperta, e
sapere quale, e' l'unico modo per decidere se vale la pena.

**Le pagine mancanti (punto 5 del brief). Non fatte.** Il brief elenca domande
senza pagina e chiede le bozze. Non ho trovato, in questo repo, nessuna prova
misurabile che quelle domande vengano cercate: il volume di ricerca non si
ricava dal codice, e il brief non dice da dove venga. L'unica prova che il repo
puo' dare e' un link interno verso una pagina che non c'e', ed e' stata cercata:
634 link interni, 0 rotti (difetto 12). Scrivere cinque pagine su questa base
sarebbe esattamente "una nuova pagina creata solo per avere una pagina in piu'",
che il brief stesso esclude. Cosa la sbloccherebbe: le query di Search Console,
o anche solo i log di ricerca interna di pagefind, che darebbero le domande
poste da chi e' gia' sul sito.

**Nessun consolidamento di pagine.** Era consentito ("se ce bisogno di
consolidare pages in un unico contenitore solido io lo farei"). Non l'ho fatto
perche' non ho trovato il caso: nessuna coppia di pagine ha la stessa
description, e ogni pagina d'errore copre un codice diverso. Se due pagine si
facessero concorrenza sulla stessa query non lo saprei da qui, serve Search
Console.

**Sei titoli sono identici a coppie.** Sono le sei pagine d'errore in inglese e
in italiano: il titolo e' il codice d'errore, che e' lo stesso nelle due lingue.
Non li ho differenziati perche' sono pagine indicizzate, il rischio di toccare i
loro titoli e' quello che mi e' stato chiesto di evitare, e il guadagno non lo
so misurare da qui. Gli hreflang gia' dicono a Google che sono la stessa pagina
in due lingue.

**Undici description superano i 160 caratteri.** Google le tronca, non le
penalizza. Riscriverle e' lavoro di copy su pagine indicizzate a fronte di un
guadagno che non ho modo di misurare, quindi le ho lasciate e le segnalo.

**Il Rich Results Test non e' stato eseguito.** Richiede lo strumento di Google
su URL pubblici, e niente di tutto questo e' pubblicato. Finche' non lo e', su
questo posso dire solo cosa dice la documentazione, non cosa risponde lo
strumento.

**"Due build a un giorno di distanza danno la stessa sitemap": verificato a
meta'.** Ho misurato che due build consecutive dello stesso checkout danno una
sitemap byte per byte identica (sha256 `9925aa71...`), e che l'unico ingresso
delle date e' la storia di git, non l'orologio. Non ho fatto passare un giorno
vero ne' ho falsificato l'orologio di sistema, quindi la parte "un giorno dopo"
e' un'inferenza dalla costruzione, non una misura.

**`sitemap-media.xml` e' vuoto, ed e' corretto.** Lo schema media, il componente,
il JSON-LD e la sitemap video esistono e sono verificati da
`scripts/check-media.mjs`, che costruisce una pagina di esempio con un video
finto, controlla il `VideoObject`, la traccia dei sottotitoli, il testo di
`describes` visibile in pagina e la voce `<video:video>`, poi cancella un file e
controlla che la build fallisca dicendo quale manca. Non ho aggiunto nessun media
vero: non ne esiste uno in questo repo e inventarlo non e' il mio mestiere.

**I quattro namespace inutilizzati in `sitemap-0.xml` restano.** Li scrive
l'integrazione `@astrojs/sitemap`, non il sito. Toglierli vorrebbe dire
riscrivere l'XML dopo la build per un difetto che non costa niente. I namespace
video e image, quando serviranno davvero, sono in `sitemap-media.xml`.

**Il sito dichiara la v2.26.3 mentre l'applicazione e' alla v2.32.1.** E'
`src/data/site.ts`, lo vedono la scheda social, il JSON-LD e le pagine. Non l'ho
toccato: non e' un difetto SEO, esiste gia' `scripts/check-facts.mjs` per questa
classe di cose, e gli annunci di release restano manuali.

**Core Web Vitals, peso delle pagine, accessibilita'.** Fuori dal perimetro
chiesto. Le 40 card social aggiungono 2,0 MB all'artefatto pubblicato, che e'
peso di deploy e non peso di pagina: ogni pagina ne carica una sola, e solo
quando qualcuno condivide il link.

**Nessun URL indicizzato e' cambiato, niente e' stato pubblicato, DNS non
toccato.** `/docs/index.html` continua a rispondere 200 all'indirizzo che ha
sempre avuto: e' l'intera ragione per cui quelle dieci pagine sono costruite da
un endpoint e non da una rotta.
