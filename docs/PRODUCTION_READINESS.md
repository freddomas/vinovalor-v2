# Production Readiness

## Prêt

- Build Vercel compatible.
- TypeScript strict.
- Lint et tests unitaires OK.
- Captures responsive générées.
- Secrets externalisés.
- Auth locale + Google OAuth configurables.
- API route handlers disponibles.

## Non prêt pour production transactionnelle

- Pas de Postgres branché au runtime.
- Pas de migrations exécutées.
- Pas de paiement réel.
- Pas de webhooks paiement signés.
- Pas de conformité alcool pays cible.
- Pas d'upload sécurisé.
- Pas de monitoring Sentry/OpenTelemetry.
- Dépôt Git local à réparer avant push.

## Étapes avant mise en ligne commerciale

1. Réparer Git local ou recloner le dépôt GitHub.
2. Ajouter Prisma CLI et repository Postgres.
3. Migrer `prisma/schema.prisma`.
4. Seed contrôlé depuis `src/data`.
5. Brancher stockage fichiers/CDN avec scan.
6. Valider pays/licence/paiement alcool.
7. Ajouter tests intégration DB et concurrence enchères.
8. Déployer preview Vercel, puis staging, puis production.
