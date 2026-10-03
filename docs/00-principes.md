# Principes non négociables — pack visibilité IA (MVP)

Ces règles découlent des décisions validées par Benjamin. Toute évolution du produit doit pouvoir s’y conformer ou faire l’objet d’une décision explicite.

1. **Cible et périmètre produit** — Le MVP est un **pack visibilité IA** pour **garages automobiles indépendants en France** (hors enseignes et réseaux nationaux). On ne promet pas un concierge, un chat, des paiements, ni une intégration directe aux agendas des garages.

2. **Standards existants, pas un format propriétaire** — AgentWeb **génère et maintient** ce que Google et les agents attendent déjà : **JSON-LD schema.org** en priorité (`AutoRepair` / `LocalBusiness`, horaires, catalogue d’offres, FAQ, action de réservation), puis **llms.txt** et pages **Markdown**. La cohérence avec la **fiche Google Business Profile** (nom, adresse, téléphone, horaires) est un objectif, pas une garantie automatique.

3. **Une seule source de vérité en code** — Tous les champs métier (identité, contact, horaires, prestations, prix, liens RDV, FAQ) doivent vivre dans un **registre unique** (schémas **Zod** validés). De ce registre dérivent JSON-LD, llms.txt, documentation, tests, et plus tard les outils MCP. **Aucun schéma dupliqué à la main** (ni JSON-LD, ni types MCP) sans passer par ce registre.

4. **Publication autonome** — Un client ou un **agent IA** doit pouvoir **déployer sans intervention de Benjamin** : plugin WordPress, fichiers hébergés par AgentWeb (lien ou snippet), ou guide par éditeur de site (Wix, Squarespace, Jimdo, site fait main). Les limites de chaque mode doivent être documentées honnêtement.

5. **Validation humaine avant mise en ligne** — La fiche extraite du site est **relue et validée par le garagiste** (ou son prestataire web) avant publication. L’extraction automatique est une proposition, pas la vérité publiée.

6. **Qualité mesurée, pas vendue au feeling** — Un **jeu d’évaluation figé** (~10 vrais sites de garages) avec valeurs de référence et **score par champ** tourne en CI. L’enrichissement par **LLM** (clé en variable d’environnement) est **optionnel** et mesuré contre ce même jeu.

7. **Squelette bout en bout avant l’élargissement** — Avant d’ajouter des fonctionnalités « vitrine », un **parcours complet** doit exister sur **un vrai garage** : extraction → fiche validée → fichiers publiés → contrôle **Rich Results Test** (Google) → question réelle posée à un assistant IA.

8. **Honnêteté commerciale** — Le **JSON-LD** aide le référencement structuré Google (effet connu à l’échelle du web). L’effet du **llms.txt** sur le trafic ou les réponses IA **n’est pas prouvé à grande échelle**. **Aucune promesse de trafic**, de positionnement garanti, ni de « référencement IA magique ».

9. **Sécurité, RGPD et secrets** — Données personnelles minimisées, finalité claire (visibilité du garage), pas de secret en clair dans le dépôt ou les journaux. Pas de déploiement public ni de service payant **sans accord explicite** de Benjamin pour cette phase de cadrage.

10. **Maintenance dimensionnée** — L’offre inclut une vision **rafraîchissement périodique**, **détection de changements** sur le site source, **supervision** et **coût par client** estimé (hypothèses documentées), pour éviter une vente « one-shot » impossible à tenir sans support.
