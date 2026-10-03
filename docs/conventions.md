# Conventions communes — outils AgentWeb (MCP, CLI, API, UI)

Convention partagée avec l’écosystème **Markets Dashboard** : même forme de réponses, mêmes codes d’erreur, même journal, pour que des agents IA puissent enchaîner plusieurs produits sans réapprendre un format.

**Termes** :

- **Outil** : fonction exposée (CLI, HTTP, ou MCP) avec un nom stable.
- **Registre** : liste des outils et de leurs schémas d’entrée/sortie, dérivée du registre Zod métier pour les données, et d’un schéma d’enveloppe pour les réponses.
- **read** : lecture sans effet de bord.
- **action** : peut déclencher un effet (hors MVP pack visibilité, sauf « publier » avec confirmation).
- **JSONL** : un objet JSON par ligne (journal).

---

## Nommage des outils

- Format : **`snake_case`**, verbe + objet : `get_opening_hours`, `list_services`, `publish_validated_offer`.
- Chaque entrée du registre porte un **statut** :
  - `read` — consultation uniquement ;
  - `action` — modification, publication, envoi, etc.
- **Règle** : aucun outil `action` ne s’exécute sans **confirmation** explicite (`confirmed: true` dans les arguments, ou étape UI « Je confirme »).

Exemples jalon 1 → cible :

| Actuel (MCP) | Statut cible |
|--------------|--------------|
| `get_business_info` | read |
| `list_services` | read |
| `get_prices` | read |
| `get_opening_hours` | read |
| `search_offer` | read |
| `get_booking_options` | read |
| *(futur)* `publish_validated_offer` | action — **NEEDS_CONFIRMATION** sans `confirmed` |

---

## Enveloppe de réponse

### Succès

```json
{
  "ok": true,
  "data": { }
}
```

`data` contient le payload métier (fiche, liste de services, chemins de fichiers publiés, etc.).

### Erreur

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ARGUMENT",
    "message": "Message lisible en français pour un humain.",
    "retryable": false,
    "details": { }
  }
}
```

- **`details`** : optionnel, pour champs invalides, identifiants, etc.
- **`retryable`** : `true` si un nouvel essai plus tard peut réussir (réseau, rate limit).

### Codes stables (`error.code`)

| Code | Usage |
|------|--------|
| `INVALID_ARGUMENT` | Paramètre manquant, fiche invalide, schéma Zod non respecté |
| `NOT_FOUND` | Ressource absente (fiche, site, fichier publié) |
| `RATE_LIMITED` | Trop d’appels crawl ou API |
| `NEEDS_CONFIRMATION` | Action demandée sans confirmation |
| `INTERNAL` | Erreur inattendue (bug, dépendance down) |

Les clients (UI, MCP, agent) ne doivent pas se baser sur le texte de `message` pour la logique — seulement sur `code`.

---

## Journal JSONL (un objet par appel d’outil)

Fichier ou flux stdout dédié, une ligne = un appel.

Champs obligatoires :

| Champ | Type | Description |
|-------|------|-------------|
| `ts` | string ISO 8601 | Horodatage UTC |
| `tool` | string | Nom de l’outil (`get_opening_hours`, …) |
| `status` | string | `started` ou `finished` (ou une ligne unique `finished` seule si simplifié) |
| `args` | object | Arguments **secrets masqués** (`***`) |
| `ok` | boolean | Résultat final |
| `error_code` | string? | Présent si `ok: false` |
| `duration_ms` | number | Durée totale |
| `caller` | string | `ui` \| `mcp` \| `agent` \| `cli` |
| `confirmed` | boolean? | Pour les `action` |

Exemple :

```json
{"ts":"2026-10-03T19:30:00.000Z","tool":"publish_validated_offer","status":"finished","args":{"garage_id":"pilote-01","confirmed":true},"ok":true,"duration_ms":842,"caller":"agent","confirmed":true}
```

**RGPD** : ne pas journaliser le contenu intégral des pages crawlées ; privilégier identifiants et hashes.

---

## Jeu d’évaluation (YAML ou JSON)

Fichier versionné, exécuté en CI, **score par champ**.

Structure d’un cas :

```yaml
id: le_garage_toulousain
input:
  url: https://legaragetoulousain.fr/
  max_pages: 30
expected:
  identity.name: "Le Garage Toulousain"  # tolérance possible
  contact.phone:
    - "05 32 78 39 99"
  opening_hours.summary_contains: "08:00"
  action_links.booking_url_contains: "rendez-vous"
  offers.min_count: 5
tolerance:
  identity.name: fuzzy  # ou exact, regex, optional
```

Champs évalués recommandés pour le MVP garage :

- `identity.name`
- `contact.address` (localité + code postal)
- `contact.phone`
- `opening_hours` (au moins un créneau lun–ven)
- `offers` (liste non vide, ou `min_count`)
- `offers.with_price` (optionnel)
- `action_links.booking` (URL présente)

**Sortie CI** : tableau `id × champ → score` + agrégat ; option LLM : second rapport si `AGENTWEB_LLM_API_KEY` défini, sinon étape ignorée (`skipped`).

---

## Cohérence avec le registre Zod

1. Les champs dans `expected` du jeu d’éval correspondent aux **chemins Zod** du registre unique.  
2. Les projections JSON-LD / llms.txt ne définissent **pas** de nouveaux chemins d’évaluation.  
3. Tout nouvel outil MCP est déclaré dans le registre avec `read` ou `action` avant publication.

---

## État jalon 1 (écart)

| Convention | Jalon 1 |
|------------|---------|
| `{ok, data}` | Non — JSON brut dans MCP |
| Codes d’erreur stables | Non — exceptions texte |
| Journal JSONL | Absent |
| Jeu d’éval CI | Absent |
| Confirmation actions | N/A (lecture seule) |

La tranche 1 du plan (`docs/04-taches.md`) vise à fermer cet écart.
