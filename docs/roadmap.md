# Feuille de route AgentWeb

## Jalon 1 (actuel) — POC lecture seule local

- [x] Modèle générique d’offre marchande
- [x] Extracteur poli sans LLM par défaut
- [x] Publisher `llms.txt` / Markdown / JSON-LD
- [x] Serveur MCP read-only
- [x] CLI et exemple commité
- [x] CI basique

## Jalon 2 — Widget et expérience humaine

- Widget de chat embarquable (snippet) branché sur le MCP ou une API locale
- Thème configurable, accessibilité, mode « citation des sources »

## Jalon 3 — Back-office marchand

- Connexion du site / validation des champs extraits
- Édition des horaires, services, FAQ et liens d’action
- Historique des extractions et diff

## Jalon 4 — Politiques d’accès agents

- Allowlist / denylist d’agents et scopes par outil MCP
- Journal d’accès et consentement RGPD (finalités, durée de conservation)
- Signaux de confiance (clés agent, attestations)

## Jalon 5 — Actions contrôlées

- Connecteurs Calendly, formulaires tiers avec **validation marchand**
- Repli universel par e-mail (sans soumission automatique non approuvée)
- Workflows d’approbation avant toute action à effet de bord

## Jalon 6 — Publication hébergée

- Fichier statique / snippet JS
- Sous-domaine `agent.example.com` hébergé par la plateforme
- CDN et invalidation

## Jalon 7 — Paiements et protocoles commerce agent

- Intégration Stripe (Checkout / Elements) pour parcours payants
- Alignement protocoles émergents (ACP, UCP) quand stabilisés
- Catalogue offres synchronisé avec le modèle core

## Transversal

- Qualité d’extraction : ML léger on-prem, feedback marchand
- Multi-langue, multi-établissement
- Observabilité et SLO sur l’extracteur managé (hors scope jalon 1)
