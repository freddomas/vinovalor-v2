# Production Readiness

## Prêt

- Build Vercel compatible.
- TypeScript strict.
- Lint et tests unitaires OK.
- Captures responsive générées.
- Secrets externalisés.
- Auth locale + Google OAuth configurables.
- Pages publiques résistantes si `NEXTAUTH_SECRET` / `AUTH_SECRET` manque ; les actions protégées restent fermées.
- API route handlers disponibles.

## Non prêt pour production transactionnelle

- Pas de Postgres branché au runtime.
- Pas de migrations exécutées.
- Pas de paiement réel.
- Pas de webhooks paiement signés.
- Pas de conformité alcool pays cible.
- Pas d'upload sécurisé.
- Pas de monitoring Sentry/OpenTelemetry.
- Environnement Vercel à compléter : `NEXTAUTH_URL`, `NEXTAUTH_SECRET` ou `AUTH_SECRET`, puis OAuth Google si nécessaire.

## Étapes avant mise en ligne commerciale

1. Configurer les variables Vercel `NEXTAUTH_URL`, `NEXTAUTH_SECRET` ou `AUTH_SECRET`.
2. Ajouter Prisma CLI et repository Postgres.
3. Migrer `prisma/schema.prisma`.
4. Seed contrôlé depuis `src/data`.
5. Brancher stockage fichiers/CDN avec scan.
6. Valider pays/licence/paiement alcool.
7. Ajouter tests intégration DB et concurrence enchères.
8. Déployer preview Vercel, puis staging, puis production.
