# Règles Métier

## VERIFIED RULE

- Vinovalor est une marketplace d'alcools premium, pas seulement un site vitrine.
- Données capturées : 41 annonces, 6 restaurants, 15 utilisateurs publics.
- Modes capturés : 37 ventes fixes, 4 enchères.
- Types capturés : rouge, blanc, rosé, effervescent, cognac, whisky, saké.
- Google OAuth existe comme flux observé ; l'app v2 l'active quand les variables Google sont présentes.

## DERIVED RULE

- Une annonce publiable exige nom produit, type, prix positif, quantité positive, état, mode de vente et message sanitaire.
- Une annonce avec quantité nulle doit être traitée comme stock à confirmer, pas comme achat fiable.
- Une offre exige un acheteur connecté, une annonce ouverte aux offres, un montant positif et une vérification serveur.
- Une enchère exige un utilisateur autorisé, un montant strictement supérieur au prix courant et une transaction atomique en production.
- Les profils publics doivent rester limités : pas d'email, téléphone, adresse privée ni données sensibles.
- Les actions sensibles doivent être auditables : auth, publication, offre, enchère, modération, paiement.

## ASSUMPTION

- Le périmètre initial reste alcools premium, pas vin uniquement, car les données contiennent cognac, whisky et saké.
- Les restaurants sont conservés comme module différenciant, mais pas comme coeur transactionnel prioritaire.
- Le paiement réel n'est pas activé tant que le pays cible et le provider compatible alcool ne sont pas validés.

## RISK

- Le nom Vinovalor surpromet si aucun module de valorisation, preuve de provenance ou historique prix n'est ajouté.
- Une marketplace alcool sans contrôle âge/pays/licence/paiement expose un risque légal réel.
- Les enchères sans transaction DB atomique exposent race conditions et litiges.

## OPEN QUESTION

- Pays cible exact et licence alcool.
- Provider paiement et statut marketplace/séquestre.
- Niveau KYC vendeur attendu.
- Politique livraison alcool.
- Documents obligatoires de provenance.
