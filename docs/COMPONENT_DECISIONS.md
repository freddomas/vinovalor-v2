# Décisions Composants

- Pas de bibliothèque UI lourde : CSS propriétaire pour réduire dépendances et garder une identité Vinovalor.
- Icônes `lucide-react` pour actions et signaux métier.
- Cartes uniquement pour objets répétés ou panneaux outils.
- Tables limitées à l'administration avec scroll horizontal contrôlé.
- Les CTA sensibles redirigent vers connexion si l'utilisateur n'est pas authentifié.
- Les APIs mutatives existent pour valider les règles serveur, mais ne prétendent pas persister sans Postgres.
