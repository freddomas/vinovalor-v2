# Authentification et Sécurité

## Faits observés

- Google OAuth existe: `/api/auth/oauth/google` renvoie HTTP 307 vers `accounts.google.com` avec scopes `openid email profile`.
- Le bundle expose auth locale: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/me`, reset/forgot/confirm.
- Le front contient des usages de `localStorage` pour brouillon d'annonce et, d'après l'analyse bundle/subagents, des tokens peuvent être manipulés côté client. Pour la reconstruction premium, ne pas stocker d'access token durable en `localStorage`.

## Spécification recommandée

- Auth locale: email/password, confirmation email, reset token court, hash Argon2id ou bcrypt coût fort.
- Auth Google: OAuth Authorization Code, liaison avec `auth_identities`.
- Sessions: cookies `HttpOnly`, `Secure`, `SameSite=Lax` ou `Strict`; refresh token hashé côté serveur.
- Rotation refresh token à chaque usage; révocation à logout, changement mot de passe, anomalie.
- CSRF explicite si cookies sur endpoints mutatifs.
- RBAC serveur strict: guest, buyer, seller, certified_seller, restaurant_owner, restaurant_staff, moderator, admin, support.
- Rate limiting: login, register, reset password, upload, offre, enchère, paiement.
- Journal d'audit: auth, paiement, enchère, modération, admin.
- Uploads: type MIME réel, taille max, scan, stripping metadata sensible, CDN privé/public selon besoin.
- Anti-IDOR: ne jamais filtrer uniquement côté UI; vérifier ownership côté API.

## Erreurs à ne pas reproduire

- UI-only guards sans contrôle backend.
- Tokens persistants en stockage JavaScript.
- Endpoints admin/modération sans RBAC explicite.
- Bids/offres non transactionnels.
- Webhooks paiement sans signature et idempotence.
