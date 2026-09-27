# ADR 002 — Structuration sans LLM par défaut

## Statut

Accepté (jalon 1)

## Contexte

Contraintes : pas de service payant obligatoire, pas de secret en clair, POC reproductible hors ligne.

## Décision

La structuration vers `BusinessOffer` repose sur **JSON-LD**, **microdonnées HTML** et **heuristiques** (listes, horaires FR, liens d’action). Un hook LLM optionnel existe mais n’est appelé que si `AGENTWEB_LLM_API_KEY` ou `OPENAI_API_KEY` est défini.

## Conséquences

- Qualité variable selon la richesse sémantique du site source.
- Coût nul et confidentialité maximale en local.
- Amélioration future via jalon back-office + LLM opt-in marchand.
