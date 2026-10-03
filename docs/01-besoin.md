# Besoin — pack visibilité IA pour garages indépendants

## En une phrase

Aider un **garage automobile indépendant en France** à rendre son site **compréhensible par Google et par les assistants IA**, via des fichiers standards (surtout **JSON-LD**), **sans** que le porteur du projet doive intervenir à chaque mise en ligne.

---

## Utilisateurs cibles

| Persona | Rôle | Ce qu’il comprend du technique |
|--------|------|--------------------------------|
| **Garagiste indépendant** | Décideur, valide nom, adresse, horaires, prestations, lien de prise de rendez-vous (RDV) | Faible : sait où est son site et son outil RDV (Calendly, formulaire, iDGARAGE, Planity, etc.) |
| **Agent IA ou moteur « lecteur »** | Consomme JSON-LD, llms.txt ou pages `.md` pour répondre à des questions (« horaires », « prix vidange », « comment prendre RDV ») | N/A (machine) |
| **Agence web / prestataire du garage** | Installe le snippet, le plugin ou les fichiers ; peut corriger la fiche avant publication | Variable |

**Hors cible MVP** : réseaux / enseignes nationales, marketplaces multi-garages, conciergerie conversationnelle sur le site.

---

## Scénarios (format utilisateur + critères d’acceptation)

### Scénario 1 — Mise en ligne initiale

**Quand** j’ouvre mon pack après achat ou essai, **je veux** que mon site soit analysé et que je valide une fiche claire (nom, adresse, téléphone, horaires, prestations, lien RDV), **pour** publier des fichiers que Google et les IA peuvent lire sans que je code.

| Étant donné… | Quand… | Alors… |
|--------------|--------|--------|
| l’URL de mon site est accessible et le crawl est autorisé (`robots.txt`) | je lance l’extraction (moi ou un agent) | je reçois une **fiche proposée** avec les champs principaux remplis ou marqués « à compléter » |
| la fiche proposée | je la valide ou corrige | les fichiers **JSON-LD**, **llms.txt** et **Markdown** sont générés **uniquement** à partir de la fiche validée |
| les fichiers générés | je les déploie selon mon type de site (WordPress, hébergement AgentWeb, etc.) | je peux contrôler le JSON-LD avec le **Rich Results Test** Google sans erreur bloquante sur les types prévus |

### Scénario 2 — Prise de rendez-vous (lien existant)

**Quand** un client ou une IA cherche comment prendre RDV, **je veux** que le lien vers **mon** outil (Calendly, formulaire, iDGARAGE, Planity…) soit explicite dans les données structurées, **pour** ne pas promettre une réservation intégrée qu’AgentWeb ne fait pas.

| Étant donné… | Quand… | Alors… |
|--------------|--------|--------|
| j’ai indiqué au moins un lien RDV validé | la publication JSON-LD est générée | le schéma inclut une **action de réservation** (`ReserveAction` / `potentialAction`) pointant vers **mon URL** (lecture seule : pas de soumission automatique) |
| un assistant IA lit mon site ou mes fichiers | on lui demande « comment prendre rendez-vous » | la réponse peut s’appuyer sur le lien RDV **sans inventer** un créneau |

### Scénario 3 — Déploiement sans Benjamin

**Quand** je suis seul ou accompagné d’un agent IA, **je veux** un mode d’installation adapté à mon site, **pour** aller en production sans ticket support systématique.

| Étant donné… | Quand… | Alors… |
|--------------|--------|--------|
| mon site est WordPress / Wix / Squarespace / Jimdo / HTML statique | je suis le guide du mode choisi | j’installe JSON-LD + llms.txt (ou équivalent accessible) **sans compte AgentWeb obligatoire** [À CLARIFIER : compte optionnel ou obligatoire pour suivi] |
| le mode « hébergement AgentWeb » | je copie le snippet ou le lien fourni | les fichiers sont servis en HTTPS et restent **synchronisés** avec ma fiche validée après mise à jour [À CLARIFIER : fréquence et déclenchement] |

### Scénario 4 — Confiance et conformité

**Quand** je publie des données sur mon garage, **je veux** savoir ce qui est stocké et pourquoi, **pour** respecter le **RGPD** et ne pas exposer de secrets.

| Étant donné… | Quand… | Alors… |
|--------------|--------|--------|
| une extraction ou publication | elle s’exécute | seules les données **publiques ou validées** du garage entrent dans les fichiers ; pas de clé API en clair dans les journaux |
| un journal technique existe | un appel outil est fait | chaque ligne est **JSONL** avec statut, durée, appelant (interface / MCP / agent), secrets masqués |

### Scénario 5 — Suivi de la qualité (équipe produit / Benjamin)

**Quand** le produit évolue, **je veux** voir si l’extraction se dégrade, **pour** ne pas vendre un pack qui régresse silencieusement.

| Étant donné… | Quand… | Alors… |
|--------------|--------|--------|
| le jeu d’évaluation (~10 garages) | la CI s’exécute | un **score par champ** (nom, adresse, téléphone, horaires, prestations, prix, lien RDV) est produit et comparable d’un commit à l’autre |
| une clé LLM est présente en CI (optionnel) | le pipeline LLM est activé | le même score est calculé et **documenté** à part du chemin sans LLM |

---

## Hors périmètre (MVP)

- Concierge / chat embarqué sur le site  
- MCP d’**actions** (réserver, payer, envoyer un formulaire)  
- Intégration directe aux agendas (Google Calendar, logiciels garage)  
- Paiements en ligne  
- Le **MCP lecture seule** du jalon 1 reste un **complément**, non prioritaire pour la vente du pack  

---

## Critères de réussite mesurables

| Critère | Mesure |
|---------|--------|
| Parcours bout en bout | 1 garage réel : extraction → validation → publication → Rich Results Test OK sur les types cibles → 1 question IA avec réponse alignée sur la fiche |
| Jeu d’évaluation | ≥ 10 sites ; score moyen par champ documenté ; pas de régression non expliquée en CI |
| Déploiement | ≥ 3 modes documentés (ex. WordPress, snippet AgentWeb, guide éditeur) avec limites listées |
| Autonomie | Benjamin n’est pas requis pour la mise en ligne standard [À CLARIFIER : périmètre du support inclus] |
| Commercial | Documentation client sans promesse de trafic ; mention explicite sur llms.txt |

---

## Contraintes

- Pas de déploiement public ni de compte/service payant créés dans cette phase sans accord de Benjamin  
- Pas de contact commercial ou technique externe (garages, APIs tierces) sans accord  
- RGPD : minimisation, information du garage, durée de conservation [À CLARIFIER]  
- Aucun secret en clair dans le dépôt, les artefacts clients ou les journaux  

---

## Points [À CLARIFIER] pour Benjamin

- **[À CLARIFIER : prix de vente]** — forfait, abonnement, ou les deux ?  
- **[À CLARIFIER : canal d’acquisition]** — vente directe, partenaires (agences auto), place de marché ?  
- **[À CLARIFIER : facturation et TVA]** — micro-entreprise, facture récurrente, essai gratuit ?  
- **[À CLARIFIER : compte client]** — obligatoire pour hébergement AgentWeb ou publication 100 % chez le garage ?  
- **[À CLARIFIER : fréquence de rafraîchissement]** — hebdomadaire, mensuelle, à la demande ?  
- **[À CLARIFIER : support inclus]** — que se passe-t-il si le crawl échoue ou si le site bloque les robots ?  
- **[À CLARIFIER : périmètre géographique marketing]** — France entière confirmée ; langue des fichiers (français uniquement ?)  
- **[À CLARIFIER : relation Google Business Profile]** — simple recommandation de cohérence ou checklist obligatoire avant publication ?
