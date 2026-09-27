# AgentWeb

**AgentWeb** transforme le site web d’un petit commerce, d’une PME ou d’un indépendant en une interface **agent-ready** : lisible par les humains et interrogeable par des agents IA, en local et en lecture seule.

## Pitch

Les agents IA ont besoin de données structurées, fiables et à jour. AgentWeb **extrait** poliment un site existant (sans dépendre d’un CMS), **normalise** l’information dans un modèle générique d’offre marchande, **publie** des artefacts standards (`llms.txt`, Markdown, JSON-LD) et **expose** un serveur MCP en lecture seule.

## Démarrage rapide

Prérequis : Node.js ≥ 20, [pnpm](https://pnpm.io/) 9.

```bash
pnpm install
pnpm run build
pnpm test
```

### Extraire un site

```bash
pnpm exec agentweb extract https://example.com \
  --output .agentweb/output \
  --max-pages 30 \
  --delay-ms 1500
```

Options utiles :

- `--playwright` : rendu headless pour les sites très dynamiques (nécessite `pnpm exec playwright install chromium` dans le package extractor).
- Variable `AGENTWEB_LLM_API_KEY` (ou `OPENAI_API_KEY`) : point d’extension LLM optionnel (désactivé par défaut dans ce jalon).

### Publier les artefacts

```bash
pnpm exec agentweb publish \
  --input .agentweb/output/business-offer.json \
  --output .agentweb/output
```

### Serveur MCP (lecture seule)

```bash
pnpm exec agentweb serve-mcp --stdio --input examples/le-garage-toulousain/business-offer.json
```

HTTP local (tests) :

```bash
pnpm exec agentweb serve-mcp --http --port 3847 --input examples/le-garage-toulousain/business-offer.json
```

Outils exposés : `get_business_info`, `list_services`, `get_prices`, `get_opening_hours`, `search_offer`, `get_booking_options` (liens uniquement, **aucune soumission de formulaire**).

## Structure du mono-repo

| Chemin | Rôle |
|--------|------|
| `packages/core` | Modèle `BusinessOffer` et validation |
| `packages/extractor` | Crawl, HTML→Markdown, structuration heuristique |
| `packages/publisher` | `llms.txt`, pages `.md`, JSON-LD schema.org |
| `packages/mcp-server` | Serveur MCP TypeScript (stdio + HTTP local) |
| `apps/cli` | CLI `agentweb` |
| `examples/` | Instantanés d’extraction commités |

Voir [docs/architecture.md](docs/architecture.md) et [docs/roadmap.md](docs/roadmap.md).

## Exemple commité

Le dossier [`examples/le-garage-toulousain/`](examples/le-garage-toulousain/) contient un instantané issu de [legaragetoulousain.fr](https://legaragetoulousain.fr/) (démonstration locale, sans contact ni envoi de formulaire).

## Licence

Projet privé — jalon 1 POC.
