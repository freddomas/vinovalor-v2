# Modèle de Données

Le modèle cible est décrit dans `prisma/schema.prisma`.

## Entités principales

- `User` : identité, rôle, certification, bannissement.
- `AuthIdentity` : fournisseur local ou Google.
- `Listing` : annonce, prix, stock, statut, mode de vente.
- `ListingPhoto` : photos modérées et ordonnées.
- `ListingDocument` : facture, certificat, preuve de provenance.
- `Offer` : proposition acheteur avec expiration.
- `Auction` et `Bid` : enchères atomiques.
- `Restaurant` : cave restaurant et propriétaire.
- `AuditLog` : traçabilité des actions sensibles.

## Contraintes à imposer en DB

- Prix et quantités positifs pour publication.
- Unicité provider/subject auth.
- Index sur recherche : statut, type, région, mode de vente.
- Enchère : montant supérieur au dernier montant via transaction.
- Audit non modifiable en production.

## État actuel

Le runtime v2 lit les données capturées depuis `src/data`. C'est volontaire pour preview locale, mais insuffisant pour une marketplace réelle.
