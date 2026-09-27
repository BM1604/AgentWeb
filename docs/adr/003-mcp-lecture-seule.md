# ADR 003 — MCP en lecture seule

## Statut

Accepté (jalon 1)

## Contexte

Les agents ne doivent pas soumettre de formulaires ni agir au nom du garage sans consentement explicite.

## Décision

Le serveur MCP n’expose que des **lectures** et des **liens** (`get_booking_options`). Aucun POST vers des formulaires tiers, aucune prise de RDV automatique.

## Conséquences

- Parcours réservation = URL renvoyée à l’utilisateur ou à un connecteur futur validé.
- Surface d’attaque réduite pour le jalon 1.
