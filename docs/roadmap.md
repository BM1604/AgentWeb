# Feuille de route AgentWeb

> **Recentrage produit (2026)** : priorité au **MVP vendable « pack visibilité IA »** pour garages automobiles indépendants en France. Voir `docs/00-principes.md`, `docs/01-besoin.md`, `docs/04-taches.md`.

---

## MVP — Pack visibilité IA (en cours de cadrage → implémentation)

Objectif : JSON-LD schema.org **en priorité**, puis llms.txt et Markdown, avec **validation garagiste** et **déploiement autonome**.

- [ ] Registre unique **Zod** (fiche garage) — dérivé JSON-LD, llms.txt, tests, MCP
- [ ] JSON-LD complet garage (`AutoRepair`, horaires, `OfferCatalog`, FAQ, **`ReserveAction`** vers outil RDV existant)
- [ ] Parcours **brouillon → validation → publication**
- [ ] Jeu d’évaluation ~10 garages + **score par champ** en CI
- [ ] Squelette **bout en bout** sur un garage pilote (Rich Results Test + question IA)
- [ ] Guides de publication (WordPress, Wix, Squarespace, Jimdo, HTML) + spec hébergement AgentWeb
- [ ] Rafraîchissement périodique, détection de changements, estimation coût/client
- [ ] Documentation commerciale **sans promesse de trafic** (llms.txt : effet non prouvé à grande échelle)

**Complément non prioritaire** : serveur MCP **lecture seule** (jalon 1 déjà livré).

---

## Jalon 1 (livré) — POC lecture seule local

- [x] Modèle générique d’offre marchande (`BusinessOffer`)
- [x] Extracteur poli sans LLM par défaut
- [x] Publisher `llms.txt` / Markdown / JSON-LD (sans `ReserveAction`)
- [x] Serveur MCP read-only
- [x] CLI et exemple commité (`examples/le-garage-toulousain/`)
- [x] CI basique (`build`, `lint`, `test`)
- [x] Doc technique : `docs/architecture.md` (jalon 1), ADR, rapport qualité

Inventaire honnête post-tests : `docs/02-carte-des-couches.md`.

---

## Après le MVP — Concierge et expérience conversationnelle

*(Anciennement « jalon 2 » — **repoussé** jusqu’à MVP pack rentable et support maîtrisé.)*

- Widget de chat embarquable (snippet) branché sur données validées / MCP
- Thème configurable, accessibilité, citations des sources

---

## Jalons ultérieurs (inchangés dans l’intention, dates non engagées)

### Back-office marchand étendu

- Historique des extractions et diff
- Édition fine horaires, services, FAQ

### Politiques d’accès agents

- Allowlist / scopes par outil MCP
- Journal d’accès et consentement RGPD affiné

### Actions contrôlées

- Connecteurs tiers avec **validation marchand**
- Pas de soumission automatique non approuvée

### Publication hébergée (scale)

- CDN, invalidation, sous-domaines dédiés

### Paiements et protocoles commerce agent

- Stripe et protocoles émergents quand stabilisés

### Transversal

- Multi-établissement, multi-langue
- Observabilité et SLO sur extracteur managé

---

## Index documentation cadrage MVP

| Document | Contenu |
|----------|---------|
| [00-principes.md](00-principes.md) | Règles non négociables |
| [01-besoin.md](01-besoin.md) | Utilisateurs, scénarios, hors périmètre |
| [02-carte-des-couches.md](02-carte-des-couches.md) | Existant vérifié + marché |
| [03-architecture.md](03-architecture.md) | Cible technique et publication |
| [04-taches.md](04-taches.md) | Plan de tâches |
| [conventions.md](conventions.md) | Outils, erreurs, journal, évaluation |

Architecture détaillée du POC jalon 1 : [architecture.md](architecture.md).
