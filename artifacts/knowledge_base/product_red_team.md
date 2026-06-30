# Red-Team Produit

## Verdict

Le site actuel donne une base fonctionnelle mais pas une application premium. La donnée métier est plus riche que l'interface. Le risque principal est de reconstruire le même front joli mais sans vérité backend: conformité alcool, confiance vendeur, paiement, litiges, authenticité et livraison.

## Risques critiques

1. Conformité alcool mal cadrée: pays, âge légal, publicité, livraison, mentions sanitaires.
2. Promesse de valeur non tenue: `Valor` implique estimation/cote/provenance; rien de vérifié.
3. Authenticité faible: pas de facture, certificat, niveau, bouchon, état étiquette, provenance.
4. Paiement marketplace: alcool + séquestre + wallet = sujet juridique et provider, pas juste intégration Stripe.
5. Enchères: risque race condition, bid fantôme, horloge client, réserve mal gérée.
6. Données utilisateurs publiques: exposition de profils à limiter au strict nécessaire.
7. Photos Unsplash: apparence démo, faible crédibilité commerciale, dépendances externes fragiles.
8. Restaurants: module séduisant mais peut brouiller le MVP si la stratégie n'est pas claire.

## Critères de sortie premium

- Un acheteur comprend pourquoi il peut faire confiance au vendeur et à la bouteille.
- Un vendeur sait publier, négocier, expédier et être payé sans support manuel.
- Le paiement/livraison/litige sont traçables.
- Les annonces premium ont photos réelles, provenance, état et justificatifs.
- Les règles alcool sont intégrées dans le parcours, pas collées en footer.
- Le backend refuse les actions interdites même si l'UI est contournée.
