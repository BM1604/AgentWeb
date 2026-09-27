# ADR 001 — Mono-repo pnpm et TypeScript

## Statut

Accepté (jalon 1)

## Contexte

Plusieurs composants partagent le même modèle de données (core, extractor, publisher, MCP, CLI).

## Décision

Mono-repo **pnpm workspaces**, packages en **TypeScript ESM**, build `tsc` par package.

## Conséquences

- Typage partagé sans publication npm intermédiaire.
- CI unique `pnpm install && pnpm test`.
- Versions Node ≥ 20 requises.
