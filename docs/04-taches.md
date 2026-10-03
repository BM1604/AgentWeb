# Plan de tâches — MVP pack visibilité IA

Tâches **petites**, ordonnées, avec critère de fin **observable par Benjamin** (sans lire le code). `[P]` = peut avancer en parallèle si les dépendances sont prêtes.

Légende scénarios : **S1** mise en ligne initiale · **S2** RDV · **S3** déploiement autonome · **S4** conformité · **S5** qualité CI.

---

## Tranche 0 — Squelette bout en bout (priorité absolue)

| # | Tâche | Scén. | Critère de fin pour Benjamin |
|---|--------|-------|------------------------------|
| 0.1 | Choisir **un garage pilote** (France, indépendant, site public, outil RDV identifiable) avec accord écrit | S1 | Nom + URL + outil RDV notés dans un fichier `docs/pilote.md` [création lors de l’implémentation] |
| 0.2 | Lancer extraction jalon 1 sur l’URL pilote (local) | S1 | Fichier `business-offer.json` produit ; nombre de pages > 0 |
| 0.3 | Produire une **fiche de validation** (tableau lisible : nom, adresse, tél, horaires, 5 prestations, lien RDV) | S1, S5 | PDF ou Markdown rempli **à la main** par Benjamin ou le garagiste avec « OK / à corriger » |
| 0.4 | Générer JSON-LD + llms.txt + md depuis la fiche corrigée | S1 | Dossier zip avec les 3 types de fichiers |
| 0.5 | Publier sur un **mode minimal** (ex. fichiers déposés sur le site pilote **avec accord**, ou préprod) | S3 | URL publique du JSON-LD ou page test accessible |
| 0.6 | Passer le **Rich Results Test** Google sur l’URL pilote | S1 | Capture d’écran ou lien de résultat sans erreur critique sur `AutoRepair` / horaires |
| 0.7 | Poser **une question réelle** à un assistant IA (ChatGPT, Claude, etc.) sur horaires ou RDV | S1, S2 | Réponse alignée avec la fiche validée (note Oui/Non + capture) |

**Fin de tranche 0** : Benjamin peut montrer à un garage « avant / après » sur **un** cas réel, sans promettre le produit fini.

---

## Tranche 1 — Registre unique et JSON-LD garage complet

| # | Tâche | Scén. | Critère de fin pour Benjamin |
|---|--------|-------|------------------------------|
| 1.1 | Définir schémas **Zod** canoniques (identité, contact, horaires, offres, FAQ, actions) | S1, S4 | Document auto-généré ou liste des champs exportée depuis une commande `describe-schema` |
| 1.2 | Brancher validation : toute fiche invalide refuse la publication avec message clair | S1 | Test manuel : retirer le téléphone → message d’erreur compréhensible |
| 1.3 | Générer JSON-LD avec **`ReserveAction`** (ou équivalent) vers URL RDV validée | S2 | Rich Results Test montre une action de réservation ou champ `potentialAction` visible dans le JSON |
| 1.4 | Aligner llms.txt et md **uniquement** depuis le registre (supprimer champs « en dur » dupliqués) | S1 | Modifier un horaire dans la fiche → les 3 sorties changent ensemble |
| 1.5 `[P]` | Appliquer `docs/conventions.md` aux outils MCP existants | S4 | Appel MCP exemple renvoie `{ok:true,data}` |

---

## Tranche 2 — Validation garagiste et parcours produit

| # | Tâche | Scén. | Critère de fin pour Benjamin |
|---|--------|-------|------------------------------|
| 2.1 | Écran ou fichier **brouillon vs publié** (statuts) | S1 | Benjamin voit « brouillon » puis « publié » avec date |
| 2.2 | Bouton ou commande **« Valider et publier »** | S1 | Impossible de publier sans étape de validation explicite |
| 2.3 | Export zip prêt pour déploiement | S3 | Zip téléchargé contient jsonld + llms.txt + md + README d’installation 1 page |
| 2.4 `[P]` | Texte RGPD court (quoi, pourquoi, combien de temps) | S4 | Une page `docs/rgpd-client.md` validée par Benjamin |

---

## Tranche 3 — Jeu d’évaluation et CI

| # | Tâche | Scén. | Critère de fin pour Benjamin |
|---|--------|-------|------------------------------|
| 3.1 | Constituer **~10 URLs** garages indépendants FR + fichier **références** (nom, adresse, tél, horaires, prestations, prix si connus, RDV) | S5 | Fichier `eval/garages.yaml` versionné ; Benjamin reconnaît ≥ 3 garages |
| 3.2 | Commande `agentweb eval` (ou équivalent) : score **par champ** | S5 | Sortie tableau : champ → % ou note /10 |
| 3.3 | Brancher la commande en **CI** sur chaque PR | S5 | Badge ou log CI affiche le score ; échec si régression configurée |
| 3.4 `[P]` | Pipeline LLM optionnel (env) avec rapport séparé | S5 | Avec clé : second score ; sans clé : skip documenté |

---

## Tranche 4 — Déploiement autonome (documentation + premiers automatismes)

| # | Tâche | Scén. | Critère de fin pour Benjamin |
|---|--------|-------|------------------------------|
| 4.1 | Guide **WordPress** (plugin ou functions.php + llms.txt) | S3 | Non-dev suit le guide en < 30 min sur site test |
| 4.2 `[P]` | Guide **Wix** | S3 | Même critère |
| 4.3 `[P]` | Guide **Squarespace** | S3 | Même critère |
| 4.4 `[P]` | Guide **Jimdo** + **HTML statique** | S3 | Même critère |
| 4.5 | Spécification **hébergement AgentWeb** (URL, snippet, refresh) | S3 | Maquette ou doc : ce que voit le client + coût hypothèse (principe maintenance #10) |
| 4.6 | Guide **agent IA** (étapes, vérifications, échecs fréquents) | S3 | Un agent peut suivre la checklist sans question à Benjamin |

---

## Tranche 5 — Maintenance et commercialisation honnête

| # | Tâche | Scén. | Critère de fin pour Benjamin |
|---|--------|-------|------------------------------|
| 5.1 | Document **fiche commerciale** (inclus / exclus, pas de promesse trafic) | S1 | Une page prête pour site vitrine AgentWeb |
| 5.2 | Procédure **re-crawl** + alerte changement | #10 | Simulation : modification téléphone sur site pilote → alerte ou brouillon |
| 5.3 | Estimation **coût par client** mise à jour | #10 | Tableau €/mois avec hypothèses listées |
| 5.4 `[P]` | MCP lecture seule documenté comme **option** | — | Page « bonus MCP » séparée du pack principal |

---

## Analyse de cohérence

### Couverture des scénarios

| Scénario | Tâches qui le couvrent |
|----------|-------------------------|
| S1 Mise en ligne | 0.1–0.7, 1.x, 2.x, 5.1 |
| S2 RDV | 0.7, 1.3 |
| S3 Déploiement autonome | 0.5, 2.3, 4.x |
| S4 Conformité | 1.5, 2.4, conventions |
| S5 Qualité CI | 0.3, 3.x |

### Tâches sans scénario direct

| Tâche | Justification |
|-------|----------------|
| 5.2, 5.3 | Principe #10 maintenance (transversal) |
| 5.4 | Complément non prioritaire (décision produit) |

Aucune tâche orpheline hors 5.4 (explicitement secondaire).

### `[À CLARIFIER]` restants (après ce cadrage)

Reprise de `docs/01-besoin.md` — **non résolus par des tâches techniques** :

1. Prix de vente et modèle (forfait / abonnement)  
2. Canal d’acquisition clients  
3. Facturation / TVA  
4. Compte client obligatoire ou non  
5. Fréquence de rafraîchissement incluse  
6. Périmètre support humain  
7. Langue(s) des fichiers  
8. Niveau d’exigence Google Business Profile  
9. Tarif hébergement AgentWeb passé au client (lié 5.3)  
10. Durée conservation des crawls (RGPD)

**Prochaine action recommandée pour Benjamin** : valider le **garage pilote** (0.1) et trancher **prix + refresh inclus** avant de coder la tranche 4.5 (hébergement).
