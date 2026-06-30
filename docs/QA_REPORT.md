# Rapport QA

## Commandes passées

- `npm run typecheck` : OK.
- `npm run lint` : OK.
- `npm run test` : 9 tests OK.
- `npm run build` : OK.
- `npm audit --audit-level=high` : OK, 2 vulnérabilités modérées restantes.
- `npm run qa:visual` : OK.

## Tests unitaires

Couverture ciblée :

- volumes capturés ;
- filtres catalogue ;
- prix/quantité invalides ;
- annonce minimale publiable ;
- matrice RBAC ;
- enchère supérieure ;
- conversion centimes ;
- vérification password hash ;
- lookup annonce.

## QA visuelle

Captures :

- `qa/screenshots/desktop-1440x900.png`
- `qa/screenshots/laptop-1366x768.png`
- `qa/screenshots/tablet-1024x768.png`
- `qa/screenshots/mobile-430x932.png`
- `qa/screenshots/mobile-390x844.png`
- `qa/screenshots/sell-desktop.png`
- `qa/screenshots/auctions-desktop.png`
- `qa/screenshots/restaurants-desktop.png`
- `qa/screenshots/login-desktop.png`

Le script vérifie aussi l'absence d'overflow horizontal significatif.

## Limite du runner Playwright

`playwright test` standard a exécuté les tests navigation avec succès dans les logs, mais le process est resté suspendu dans cet environnement après réutilisation serveur. `tools/visual_qa.mjs` remplace ce point pour la preuve stable.
