# Design System

## Langage visuel

- Signature sombre, brass, papier et vin profond.
- Serif utilisée pour titres courts et marque.
- Sans-serif pour interfaces et données opérationnelles.
- Pas de template admin générique.
- Pas de navigation basse desktop.

## Tokens

- `--ink`, `--wine`, `--brass`, `--paper`, `--sage`, `--blue`.
- Rayon principal : `8px`.
- Ombres limitées aux cartes répétées et panneaux outils.

## Composants

- `Header` : navigation desktop + action recherche + mobile nav dédiée.
- `ListingCard` : preuve, vendeur, prix, stock, mode de vente.
- `FilterBar` : recherche dense et responsive.
- `AuthForm` : connexion locale + Google OAuth optionnel.
- `SellForm` : validation annonce côté serveur.
- `BidPanel` : enchère contrôlée côté serveur.

## Responsive

- Desktop : nav horizontale, grilles 3 colonnes.
- Tablette : grilles 2 colonnes, nav compacte.
- Mobile : nav basse fixe, filtres empilés, cartes verticales.
