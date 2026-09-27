# Qualité d’extraction — jalon 1 (tests manuels locaux)

Paramètres communs : `--delay-ms 1500`, respect `robots.txt`, aucune soumission de formulaire.

## legaragetoulousain.fr (WordPress, ~23 pages)

| Critère | Résultat |
|---------|----------|
| Pages crawlées | 23 via sitemap / liens |
| Secteur | `auto_repair` (heuristique contenu) |
| Téléphone / e-mail | Oui |
| Horaires lun–ven 8h–12h / 14h–18h | Oui (phrase contact, regex FR) |
| Lien RDV | Oui (`/prendre-rendez-vous/`, Calendly détecté) |
| Prestations | Partiel — cartes « Nos services » + listes ; quelques descriptions longues classées comme offres |
| Prix | Faible — ex. 480 € éthanol ; la plupart des tarifs ne sont pas en liste |
| FAQ | Non (pas de bloc FAQ structuré sur le site) |
| Nom affiché | Slogan marketing du `<title>` (limite connue) |

## carrosserie-saintsimon.fr (PHP fait main, ~7 pages)

| Critère | Résultat |
|---------|----------|
| Pages | 7 |
| Identité | Correcte (« Carrosserie Saint-Simon ») |
| Contact | Téléphone |
| Prestations | Listes à puces nombreuses mais peu structurées |
| Prix | Aucun extrait |
| Horaires | Non détectés (texte peu explicite dans le crawl) |
| RDV | Lien contact |

## garage-toulouse.fr (LMSOFT, 15 pages testées)

| Critère | Résultat |
|---------|----------|
| Pages | 15 (plafond test) |
| Titre | Très long (SEO agressif) — heuristique titre insuffisante |
| Offres / prix | Riche — 172 entrées dont 32 avec prix (grilles LMSOFT) |
| Bruit | Risque de doublons et libellés marketing |
| Horaires | Non détectés sur l’échantillon |

## Synthèse

L’extracteur est **fonctionnel et générique** mais la **qualité dépend fortement** du balisage (JSON-LD, listes, formulations d’horaires). Les sites avec grilles tarifaires HTML denses (LMSOFT) produisent beaucoup d’offres ; les sites WordPress marketing produisent un bon corpus Markdown et des liens d’action, avec structuration métier encore bruitée.
