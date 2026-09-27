# ADR 004 — Crawl poli et user-agent identifiable

## Statut

Accepté (jalon 1)

## Contexte

L’extracteur interroge des sites de petits commerces en production.

## Décision

- Respect de `robots.txt` (désactivable uniquement pour tests internes).
- Délai par défaut **1500 ms** entre requêtes, plafond de pages configurable.
- User-agent : `AgentWeb/0.1 (local-extractor; +https://github.com/agentweb)`.
- Pas de soumission de formulaires, pas de contournement d’auth.

## Conséquences

- Extractions lentes mais responsables.
- Sites très larges tronqués au `maxPages`.
