# Carte des couches — existant jalon 1 et marché

**Date de vérification locale** : exécution sur la branche `cursor/agentweb-milestone-1-poc-0c05` (PR #1), machine de développement AgentWeb.

**Commandes exécutées** :

```bash
pnpm install          # OK ; binaire `agentweb` absent tant que le CLI n’est pas compilé
pnpm test             # ÉCHEC sans build (packages extractor/publisher : entrée @agentweb/core introuvable)
pnpm run build && pnpm test   # OK — 12 tests passent (core 4, extractor 3, publisher 2, mcp-server 1, cli 0)
pnpm run lint         # OK
node apps/cli/dist/cli.js publish -i examples/le-garage-toulousain/business-offer.json -o /tmp/...  # OK — 26 fichiers
```

**Note CLI** : après `pnpm install` seul, `pnpm exec agentweb` échoue (`dist/cli.js` manquant). Le README suppose un `build` préalable ; la CI enchaîne bien `build` puis `test`.

---

## (a) Inventaire honnête de l’existant — jalon 1

Légende : **Branché** = utilisé en bout de chaîne sur l’exemple ou la CLI ; **Simulé** = présent mais sans effet réel ; **Absent** = non livré ; **Cassé** = ne fonctionne pas dans le scénario documenté sans contournement.

| Fonction | Statut | Preuve / commentaire |
|----------|--------|----------------------|
| Modèle `BusinessOffer` (TypeScript) | Branché | `packages/core` ; exemple `examples/le-garage-toulousain/business-offer.json` |
| Validation métier | Branché (partiel) | `validateBusinessOffer` manuelle — **pas encore Zod / registre unique** (objectif MVP) |
| Crawl poli (sitemap, BFS, délai, `robots.txt`) | Branché | Code `packages/extractor` ; rapport manuel `docs/extraction-qualite-jalon1.md` |
| HTML → Markdown | Branché | Pages dans l’exemple commité |
| Structuration sans LLM (JSON-LD entrant, regex horaires FR, listes) | Branché | Qualité variable selon site |
| Enrichissement LLM | Simulé | `maybeEnrichWithLlm` retourne l’offre inchangée même avec clé API |
| Playwright (sites dynamiques) | Absent par défaut | Option `--playwright` ; Chromium non installé dans l’environnement standard |
| Publisher `llms.txt` | Branché | Regénération CLI OK sur l’exemple |
| Publisher pages `.md` | Branché | 23 pages dans l’exemple |
| Publisher JSON-LD (`AutoRepair`, horaires, `OfferCatalog`, `FAQPage`) | Branché (lacunes MVP) | Pas de `ReserveAction` / `potentialAction` vers RDV ; prix parfois omis dans le graphe |
| CLI `extract` | Branché | Non re-testé en live sur URL externe (contrainte : pas de crawl public imposé ici) ; code + doc PR #1 |
| CLI `publish` | Branché | Vérifié via `node apps/cli/dist/cli.js` |
| CLI `serve-mcp` | Branché | stdio + HTTP local ; 6 outils lecture seule |
| Serveur MCP | Branché | `get_business_info`, `list_services`, `get_prices`, `get_opening_hours`, `search_offer`, `get_booking_options` |
| Format de réponse outils `{ok, data}` / codes d’erreur stables | Absent | MCP renvoie du JSON texte brut ; pas de journal JSONL |
| Back-office / validation garagiste | Absent | — |
| Modes de publication (WP, snippet, guides) | Absent | — |
| Jeu d’évaluation ~10 garages en CI | Absent | Seulement notes manuelles sur 3 sites |
| Hébergement / rafraîchissement / supervision | Absent | — |
| Widget chat / concierge | Absent | Hors MVP |
| CI GitHub Actions | Branché | `install` → `build` → `lint` → `test` |

### Synthèse existant

Le jalon 1 est un **POC local crédible** : extraire → modèle → publier → MCP lecture. Pour le **pack visibilité IA vendable**, il manque surtout : **registre Zod unique**, **validation marchand**, **JSON-LD RDV complet**, **déploiement autonome**, **évaluation figée**, **maintenance hébergée**.

---

## (b) Carte des couches — solutions de référence marché

**Légende colonne « Connu / déduit / inconnu »** : **Connu** = documenté publiquement ou observé sur un site ; **Déduit** = inférence à partir du produit ; **Inconnu** = non vérifié dans ce document.

### Génération llms.txt (généraliste)

| Fonction visible | Interface | Logique | Données | Infrastructure | Connu / déduit / inconnu |
|------------------|-----------|---------|---------|----------------|---------------------------|
| Fichier `llms.txt` à la racine du site | Upload manuel ou générateur web | Agrégation URL / titres / résumés | Sitemap, pages crawlées | Hébergement chez le client | Connu (écosystème llmstxt.org) |
| Mise à jour | Souvent manuelle | Re-crawl à la demande | Contenu site | — | Déduit |
| Validation garagiste | Rare | — | — | — | Déduit |
| Lien avec JSON-LD | Souvent absent | Formats indépendants | Doublon possible | — | Déduit |

### Plugins SEO WordPress (Yoast SEO, Rank Math, etc.)

| Fonction visible | Interface | Logique | Données | Infrastructure | Connu / déduit / inconnu |
|------------------|-----------|---------|---------|----------------|---------------------------|
| JSON-LD `LocalBusiness` / organisation | Admin WP | Templates par type de page | Champs saisis + contenu WP | Hébergement client | Connu |
| Horaires, FAQ, fil d’Ariane | Métadonnées éditeur | Règles SEO | Base WP | — | Connu |
| Pack garage (`AutoRepair`, catalogue) | Partiel | Extensions ou saisie manuelle | Souvent incomplet pour offres/prix | — | Déduit |
| llms.txt | Absent ou addon tiers | — | — | — | Déduit |
| Déploiement autonome par IA | Faible | UI humaine WP | — | — | Déduit |

### Google Business Profile (GBP)

| Fonction visible | Interface | Logique | Données | Infrastructure | Connu / déduit / inconnu |
|------------------|-----------|---------|---------|----------------|---------------------------|
| Fiche Maps / recherche Google | App Google / dashboard | Modération Google | Nom, adresse, téléphone, horaires, catégories | Google | Connu |
| Cohérence avec le site | Aucune API obligatoire pour le MVP | Comparaison manuelle | NAP (name, address, phone) | — | Connu |
| Prix / prestations détaillées | Limité | Champs fixes | Pas un catalogue complet | — | Connu |
| llms.txt / JSON-LD site | Indirect | Google lit surtout le site crawlé + GBP | — | — | Déduit |

### Solutions « agent-ready » / concurrents (catégorie émergente)

| Fonction visible | Interface | Logique | Données | Infrastructure | Connu / déduit / inconnu |
|------------------|-----------|---------|---------|----------------|---------------------------|
| Fichiers pour IA + parfois MCP | Dashboard SaaS | Crawl + normalisation | Site client | Cloud éditeur | Déduit (marché en mouvement) |
| Chat concierge | Widget JS | LLM + RAG | Site + docs | CDN | Déduit — **hors MVP AgentWeb** |
| Actions (RDV, paiement) | Intégrations | OAuth / API partenaires | Agendas, Stripe | — | Inconnu / variable |

### Exemple garage : Cars Automobile (Toulouse)

Site public [cars-automobile.fr](https://www.cars-automobile.fr/) — garage indépendant déjà doté d’un **llms.txt** riche ([`/llms.txt`](https://www.cars-automobile.fr/llms.txt)) : adresse, téléphone, liste de services, liens internes. **JSON-LD** sur les pages : **déduit** (présence typique SEO auto ; non audité ligne par ligne ici). Utile comme **référence de rendu cible** pour le pack AgentWeb (qualité rédactionnelle + structure llms.txt).

| Fonction visible | Interface | Logique | Données | Infrastructure | Connu / déduit / inconnu |
|------------------|-----------|---------|---------|----------------|---------------------------|
| llms.txt détaillé | Fichier statique | Contenu rédigé / généré | Services, zone, USP | Hébergement client | **Connu** (fichier public) |
| JSON-LD local + services | Balises HTML | SEO agence ou outil | NAP, offres | — | Déduit |
| Prise de RDV | Formulaire site | Pas dans llms.txt seul | URL formulaire | — | Déduit |

### AgentWeb jalon 1 (comparaison)

| Fonction visible | Interface | Logique | Données | Infrastructure | Connu / déduit / inconnu |
|------------------|-----------|---------|---------|----------------|---------------------------|
| Extraction → modèle → fichiers | CLI locale | Heuristiques + JSON-LD entrant | `BusinessOffer` | Machine développeur | **Connu** (ce dépôt) |
| llms.txt + md + jsonld | Fichiers sortie | Génération depuis modèle | Instantané crawl | Local | Connu |
| MCP lecture | Client MCP | 6 outils | Même modèle | stdio / HTTP local | Connu |
| Validation garagiste | — | — | — | — | Absent |
| Hébergement | — | — | — | — | Absent |

---

## Couches cachées indispensables (souvent oubliées en vente)

1. **Normalisation et déduplication** — fusion listes Markdown + JSON-LD + bruit SEO (titres longs, doublons).  
2. **Registre de schémas** — une modification de champ doit regénérer JSON-LD, llms.txt, tests, doc.  
3. **Pipeline « proposition → validation → publication »** — état, diff, horodatage, auteur.  
4. **Distribution** — injection dans `<head>`, racine web pour `llms.txt`, CORS/cache CDN si hébergement AgentWeb.  
5. **Observabilité** — journaux JSONL, alertes si crawl échoue ou score CI chute.  
6. **Conformité** — registre des traitements, durée de conservation des crawls [À CLARIFIER].  

---

## Données souvent introuvables ou payantes

| Donnée | Problème |
|--------|----------|
| Prix à jour | Souvent absents ou « sur devis » sur le site |
| Horaires précis | Images, PDF, widgets non structurés |
| Lien RDV unique | Plusieurs boutons (Calendly + formulaire + téléphone) |
| Avis clients | APIs Google payantes / conditions d’usage |
| Stock pièces / créneaux agenda | Hors site public — **hors MVP** |

---

## Risques

| Risque | Impact |
|--------|--------|
| Qualité d’extraction insuffisante sans validation | Fiche publiée fausse → perte de confiance + SEO négatif |
| Promesse llms.txt = trafic | Réclamation client ; principe #8 |
| Déploiement WordPress / Wix hétérogène | Support élevé si pas de guides clairs |
| Coût hébergement + re-crawl non chiffré | Marge négative |
| Sites bloquant le user-agent | Extraction vide ; besoin parcours manuel |
| Divergence GBP ↔ site | Google peut afficher des incohérences |
