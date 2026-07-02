# Audit UI/UX

## Refonte Appliquée

- Accueil reconstruit autour d'un parcours clair : bouteille, cave, table, partenaire.
- Hero renforcé avec signal produit immédiat, recherche, preuve et accès catalogue.
- Page restaurants transformée en expérience `choisir une table par sa cave`.
- Fiches annonces enrichies avec CTA contextuel achat, enchère ou préparation de réservation.
- Catalogue remonté comme surface de décision : filtres visibles, métriques compactes, reset clair, état vide exploitable.
- Barre mobile stabilisée pour éviter les recouvrements de contrôles interactifs.
- Breakpoint 320px corrigé : les filtres secondaires deviennent un rail horizontal pour préserver l'accès sans masquer des champs sous la navigation.

## Garde-Fous

- Pas de texte marketing prétendant que la marketplace est prête pour transactions réelles.
- Pas de héros décoratif abstrait : les pages s'appuient sur visuels et données produit.
- Les cartes restent informatives, pas seulement esthétiques.
- Les composants mobiles évitent les recouvrements détectés par Playwright.

## Limites

- La réservation reste une préfiguration UI sans écriture durable.
- Le module de valorisation prix marché reste à construire si l'objectif devient la cotation réelle.
- Une bottom sheet de filtres serait meilleure qu'un rail horizontal pour une phase post-preview.

## Preuves

- Captures : `qa/screenshots/`.
- Manifeste : `qa/visual-qa.json`.
