# Règles Métier

## Positionnement Vérifié

- Vinovalor v2 reste une preview marketplace premium d'alcools, pas une marketplace transactionnelle production-ready.
- Les données locales exposent 41 annonces, 6 restaurants et 15 profils publics.
- Le périmètre produit couvre vin, champagne, cognac, whisky et saké.
- Les visuels exploitables restent dans `public/media/wines`; `artifacts/extra` sert d'inspiration métier et ne doit pas être exporté.

## Upgrade Métier Appliqué

- La proposition centrale devient `Vinovalor / La bouteille qui vous mène à table`.
- Le restaurant n'est plus un module décoratif : les fiches et la page restaurants relient cave, table, accord et lots disponibles.
- Les annonces associées à un restaurant proposent un CTA de préparation de réservation.
- Les annonces hors restaurant restent orientées achat, offre ou enchère selon leur mode.
- Le catalogue privilégie la décision : preuve, état, vendeur, stock, mode de vente, certification et prix restent visibles avant ouverture d'une fiche.

## Règles Serveur

- Une annonce publiable exige nom produit, type, prix positif, quantité positive, état, mode de vente et message sanitaire.
- Une quantité nulle est traitée comme `Stock à confirmer`, jamais comme disponibilité fiable.
- Une offre exige un acheteur connecté, une annonce ouverte aux offres, un montant positif et une validation serveur.
- Une enchère exige un utilisateur autorisé, un montant strictement supérieur au prix courant et une transaction atomique en production.
- Les profils publics ne doivent pas exposer email, téléphone, adresse privée ou données sensibles.

## Limites Production

- La réservation visible est une préparation d'intention, pas une réservation durable.
- Le paiement, la conformité alcool, l'upload sécurisé et la persistance Postgres restent des prérequis avant toute transaction réelle.
- Les calculs de valeur restent des scores de présentation, pas une cotation de marché vérifiée.
