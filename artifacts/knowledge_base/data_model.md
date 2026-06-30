# Modèle de Données Cible

## Noyau utilisateur/auth

- `users`: identité publique, email, rôle, certification, bannissement.
- `auth_identities`: provider `local` ou `google`, subject provider, email vérifié, hash mot de passe local.
- `sessions`: refresh token hashé, rotation, révocation, expiration, empreinte appareil.
- `profiles`: bio, avatar, langue, préférences.
- `addresses`: livraison, facturation, retrait.
- `seller_verifications`: KYC, documents, statut de certification.

## Marketplace

- `listings`: fiche produit, stock, prix, mode vente, logistique, statut, conformité.
- `listing_photos`: URL, CDN, ordre, modération.
- `favorites`: relation user/listing.
- `offers`: offre, contre-offre, expiration.
- `auctions`: réserve, cible, dates serveur, statut.
- `bids`: enchères atomiques.
- `orders`, `order_items`: cycle achat, statuts, montants.
- `payments`: provider, intent, capture, refund, webhook ids.
- `wallet_accounts`, `wallet_ledger`, `withdrawals`: utile seulement si séquestre/payout marketplace.

## Communication et confiance

- `conversations`, `messages`.
- `reviews`.
- `reports`, `moderation_actions`.
- `notifications`.
- `audit_log`: auth, paiement, admin, modération.

## Restaurants

- `restaurants`: owner, fiche, adresse, photo, rating, statut.
- `restaurant_staff`: owner/manager/staff.
- `reservations`: créneau, nombre, statut.
- `restaurant_calendar_tokens`: intégration calendrier si conservée.

## SQL

Voir `rebuild_schema.sql` pour un brouillon PostgreSQL directement exploitable comme base de migration.
