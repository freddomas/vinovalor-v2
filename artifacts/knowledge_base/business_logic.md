# Logique Métier Reconstruite

## Positionnement réel

Vinovalor n'est pas seulement un site vitrine. Les faits capturés indiquent une marketplace d'alcools premium: vins, cognacs, whiskies, sakés et caves de restaurants. Le slogan vérifié est `La vraie valeur du vin et de la cave`, mais aucun moteur de cote ou d'estimation de valeur n'a été observé.

## Données observées

- 41 annonces actives capturées via `/api/listings`.
- Types: {'RED': 17, 'COGNAC': 3, 'SPARKLING': 4, 'WHITE': 9, 'WHISKY': 4, 'SAKE': 2, 'ROSE': 2}.
- Régions principales: {'bordeaux': 9, 'bourgogne': 6, 'rhone': 5, 'japan': 4, 'sud-ouest': 3, 'champagne': 3, 'loire': 3, 'scotland': 2, 'provence': 2, 'alsace': 2, 'morocco': 1, 'languedoc': 1}.
- Modes de vente: {'FIXED': 37, 'AUCTION': 4}.
- 4 enchères et 37 ventes à prix fixe.
- 13 annonces liées à un restaurant.
- 40 annonces avec au moins une photo.

## Workflows obligatoires

1. Inscription/connexion locale et Google OAuth.
2. Onboarding âge légal, pays, adresse et acceptation des règles alcool.
3. Recherche catalogue: type, région, appellation, millésime, prix, vendeur, restaurant, enchère.
4. Création d'annonce: brouillon, caractéristiques, prix, stock, photos, prévisualisation, publication.
5. Achat direct: panier léger, livraison, paiement, commande, suivi.
6. Offre: proposition acheteur, acceptation/refus/contre-offre vendeur, expiration.
7. Enchère: prix de réserve, prix cible, fin horodatée serveur, bids atomiques.
8. Messagerie contextualisée par annonce/commande.
9. Favoris.
10. Avis post-commande uniquement.
11. Signalement et modération.
12. Restaurants: fiche, cave associée, réservation ou retrait selon décision produit.

## Règles métier minimales

- Une annonce publiée exige vendeur, nom produit, type, prix positif, quantité positive, état, mode de vente et message sanitaire.
- Maximum 8 photos par annonce, ordre stable, modération avant mise en avant.
- Les enchères doivent être gérées par horloge serveur, transaction atomique et montant strictement supérieur au bid courant.
- Les offres expirent automatiquement et changent le stock uniquement après acceptation/paiement.
- Les avis exigent une commande terminée.
- Les signalements doivent conserver cible, motif, statut et action de modération.
- Les paiements et remboursements doivent être idempotents.
- Les données publiques utilisateur doivent être volontairement limitées.

## Décisions produit à verrouiller

- Périmètre: vin seulement ou alcools premium. Les données prouvent un périmètre plus large que le wording actuel.
- Pays cible et conformité alcool avant choix paiement/livraison.
- Restaurants: différenciateur ou distraction. Pour un MVP propre, les restaurants peuvent être phase 2.
- Promesse `Valor`: si le nom promet la valeur, il faut une cote/prix marché, sinon le branding surpromet.
