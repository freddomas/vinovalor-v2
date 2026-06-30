# Architecture

## Stack retenu

- Next.js 15 App Router.
- TypeScript strict.
- CSS propriétaire dans `src/app/globals.css`.
- NextAuth v4 : Credentials local + Google OAuth optionnel.
- Zod pour validation d'entrée API.
- Vitest pour règles métier.
- Playwright pour QA visuelle et navigation.
- Vercel comme cible de déploiement.

## Découpage

- `src/app` : routes pages et route handlers.
- `src/components` : composants visuels réutilisables.
- `src/lib/domain.ts` : règles métier, RBAC, enrichissement données.
- `src/lib/auth.ts` : auth locale et Google.
- `src/lib/security.ts` : hashing, headers, utilitaires sécurité.
- `src/data` : seed capturé.
- `prisma/schema.prisma` : modèle Postgres cible.

## Flux

1. Les pages publiques lisent les annonces enrichies depuis le domaine.
2. Les APIs publiques exposent listings, restaurants et utilisateurs publics filtrés.
3. Les APIs mutatives vérifient session, rôle, rate limit et schéma Zod.
4. Les workflows transactionnels retournent `validated` tant que Postgres réel n'est pas branché.

## Direction production

Le prochain palier doit remplacer le repository seed par Postgres/Prisma avec transactions pour offres, commandes, enchères et audit logs.
