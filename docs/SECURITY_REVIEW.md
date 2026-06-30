# Revue Sécurité

## Contrôles en place

- Pas de secrets dans le dépôt.
- `.env.example` documente les variables.
- Sessions NextAuth en cookie HttpOnly.
- Credentials locaux validés par hash PBKDF2.
- Google OAuth désactivé sans secrets, activable par variables.
- APIs mutatives protégées par session et RBAC serveur.
- Validation Zod aux frontières API.
- Rate limiting mémoire sur publication, offres et enchères.
- Headers `no-store`, `nosniff`, `Referrer-Policy`.
- Audit high/critical npm : OK.

## Risques restants

- 2 vulnérabilités modérées npm liées à `next-auth` / `uuid`; `npm audit fix --force` propose un downgrade majeur non acceptable.
- Rate limiting mémoire insuffisant en serverless multi-instance.
- Pas encore de CSRF dédié au-delà du modèle NextAuth/cookies.
- Pas d'upload réel, donc pas encore de scan MIME/virus/metadata.
- Pas de transactions DB atomiques pour enchères/offres tant que Postgres n'est pas branché.

## Verdict

Aucun risque high/critical détecté dans la base livrée. Pas prêt pour transactions réelles sans DB, paiement, conformité et upload sécurisé.
