# Vinovalor v2

Refonte de Vinovalor en application web française premium, orientée marketplace de caves, vins et spiritueux vérifiés.

## Résultat livré

- Application Next.js App Router + TypeScript, compatible Vercel.
- UI française responsive desktop, laptop, tablette et mobile.
- Catalogue enrichi depuis les artefacts capturés : 41 annonces, 6 restaurants, 15 utilisateurs publics.
- Visuels améliorés copiés en local dans `public/media/wines`.
- Auth locale via NextAuth Credentials + route Google OAuth activable par variables d'environnement.
- API publiques et protégées : listings, détail annonce, restaurants, utilisateurs publics, session, offres, enchères.
- Règles métier centralisées dans `src/lib/domain.ts`.
- QA visuelle Playwright autonome avec captures dans `qa/screenshots`.

## Limite critique

Cette version est une base applicative déployable et vérifiée, mais elle ne doit pas être utilisée pour de vraies transactions alcool tant que les éléments suivants ne sont pas branchés :

- persistence Postgres réelle ;
- migrations et repository Prisma/SQL ;
- provider paiement compatible alcool/pays cible ;
- conformité légale alcool pays par pays ;
- upload sécurisé et modération réelle des documents/photos ;
- webhooks signés et idempotence paiement.

Statut honnête : **PARTIAL READY** pour une preview Vercel premium, pas encore READY pour une marketplace transactionnelle réelle.

## Démarrage local

```bash
npm install
npm run dev
```

Variables utiles : voir `.env.example`.

Comptes locaux : tous les comptes locaux utilisent le mot de passe `demo2026!`.

Compte administrateur local :

```text
admin@vinovalor.local
```

## Vérifications exécutées

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm audit --audit-level=high
npm run qa:visual
```

Résultats :

- TypeScript : OK.
- ESLint : OK.
- Unitaires Vitest : 16 tests OK.
- Build Next production : OK, 23 routes listées dont 19 pages statiques générées.
- Audit high/critical : OK ; reste 2 vulnérabilités modérées liées à `next-auth` / `uuid`.
- QA visuelle autonome : OK, voir `qa/visual-qa.json`.

Note : le runner `npm run qa:visual` est la preuve stable retenue. Il vérifie erreurs navigateur, HTTP inattendus, images cassées, texte suspect, overflow et contrôles interactifs recouverts.

## Captures QA

Captures dans `qa/screenshots/` :

- `desktop-1440x900.png`
- `desktop-1920x1080.png`
- `laptop-1366x768.png`
- `tablet-1024x768.png`
- `tablet-768x1024.png`
- `mobile-430x932.png`
- `mobile-390x844.png`
- `mobile-360x800.png`
- `mobile-320x568.png`
- `mobile-landscape-932x430.png`
- `sell-desktop.png`
- `auctions-desktop.png`
- `restaurants-desktop.png`
- `login-desktop.png`

## Structure

- `src/app/` : routes Next.js, pages et API.
- `src/components/` : composants UI.
- `src/lib/domain.ts` : règles métier, enrichissement seed, filtres, permissions.
- `src/lib/auth.ts` : configuration NextAuth Credentials + Google.
- `src/data/` : données capturées normalisées.
- `public/media/wines/` : images locales améliorées.
- `docs/` : décisions, architecture, sécurité, QA, readiness.
- `artifacts/` : base de connaissance issue de la capture initiale, conservée comme source.
- `prisma/schema.prisma` : modèle cible Postgres.

## Déploiement Vercel

1. Renseigner `NEXTAUTH_URL`, `NEXTAUTH_SECRET` ou `AUTH_SECRET`, puis éventuellement `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`. Sans secret d'auth, les pages publiques restent accessibles mais la session et les actions protégées restent désactivées.
2. Brancher Postgres avant toute transaction réelle.
3. Remplacer le repository seed par le repository DB.
4. Exécuter `npm run build`.
5. Déployer sur Vercel.

Variables minimales pour tester le compte administrateur sur Vercel :

```text
NEXTAUTH_URL=https://vinovalor-v2.vercel.app
NEXTAUTH_SECRET=<valeur aleatoire forte, 32 caracteres minimum>
```

Ne pas mettre cette valeur dans Git. Elle doit rester uniquement dans les variables d'environnement Vercel.

## Incident Vercel corrigé

Le déploiement `vinovalor-v2.vercel.app` a retourné une erreur serveur 500 au chargement public. Correctif appliqué : la lecture de session passe par `src/lib/session.ts`, qui échoue proprement en utilisateur non connecté si le secret NextAuth manque ou si NextAuth lève une exception. Les endpoints protégés retournent alors `401/403` au lieu de faire tomber la page publique.

Deuxième correctif appliqué : les endpoints NextAuth retournent maintenant `503 AUTH_NOT_CONFIGURED` si le secret d'auth manque, et la page `/connexion` affiche une erreur française exploitable au lieu de l'écran anglais générique `Server error`.

## Git

Le dépôt local a été réinitialisé proprement et poussé vers `https://github.com/freddomas/vinovalor-v2.git` sur la branche `main`.
