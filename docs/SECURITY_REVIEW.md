# Revue Sécurité

## Contrôles Renforcés

- Les comptes locaux de démonstration sont désactivés en production.
- Les utilisateurs OAuth reçoivent le rôle minimal `guest` par défaut, pas un rôle acheteur.
- Les tentatives de connexion credentials sont soumises au rate limiting.
- Les routes mutatives vérifient l'origine avant traitement.
- Les corps JSON invalides retournent une réponse contrôlée au lieu de faire tomber la route.
- `GET /api/auth/logout` retourne `405`; la déconnexion mutative passe par `POST`.
- Les validations métier renvoient des erreurs 4xx explicites au lieu de 500 génériques.
- Les headers de sécurité incluent `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `X-DNS-Prefetch-Control`, `frame-ancestors`, `base-uri`, `object-src` et HSTS.

## Tests Ajoutés

- Headers de sécurité.
- Origine cross-site refusée.
- Credentials provider désactivé en production.
- Rôle OAuth par défaut `guest`.
- Logout `GET` refusé, logout `POST` accepté, logout cross-site refusé.

## Risques Restants

- Rate limiting mémoire insuffisant en serverless multi-instance.
- Pas encore de Postgres, transactions atomiques ni audit log durable.
- Pas encore d'upload réel, donc pas de scan MIME/virus/métadonnées.
- Pas encore de provider paiement compatible alcool.
- Deux vulnérabilités npm modérées liées à `next-auth` / `uuid`; `npm audit fix --force` force un changement majeur non acceptable.

## Verdict

Aucun high/critical connu après `npm audit --audit-level=high`. L'application est renforcée pour une preview publique, mais elle n'est pas prête pour transactions alcool réelles.
