# Audit UI/UX

## Problèmes corrigés

- Navigation basse supprimée du desktop.
- Routes protégées contextualisées : vendre/admin/espace.
- Catalogue enrichi avec preuve, score, stock, vendeur et mode de vente.
- Visuels distants remplacés par copies locales améliorées pour éviter les ruptures réseau.
- Textes techniques retirés de l'écran connexion.
- Bouton connexion rendu lisible sur topbar sombre.
- Stock zéro affiché comme `Stock à confirmer`.

## Points encore faibles

- Les données capturées restent incomplètes sur provenance et documents réels.
- La promesse de valorisation exige un module prix marché/historique non encore implémenté.
- Le mobile utilise une nav basse fixe : utilisable, mais une bottom sheet de filtres serait meilleure en phase suivante.

## Preuves

- Captures finales : `qa/screenshots/`.
- Manifeste QA : `qa/visual-qa.json`.
