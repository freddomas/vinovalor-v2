# Inventaire API

## Endpoints extraits du bundle

Nombre: 34

| Endpoint | GET status | Lecture |
| --- | --- | --- |
| /api/auctions/my | 401 | protégé auth |
| /api/auth/confirm | 404 | exposé mais non consommable en GET |
| /api/auth/forgot-password | 404 | exposé mais non consommable en GET |
| /api/auth/login | 405 | exposé mais non consommable en GET |
| /api/auth/logout | 404 | exposé mais non consommable en GET |
| /api/auth/me | 401 | protégé auth |
| /api/auth/oauth/google | 307 | public ou redirection valide |
| /api/auth/refresh | 405 | exposé mais non consommable en GET |
| /api/auth/register | 405 | exposé mais non consommable en GET |
| /api/auth/reset-password | 404 | exposé mais non consommable en GET |
| /api/favorites | 401 | protégé auth |
| /api/listings | 200 | public ou redirection valide |
| /api/listings/mine | 401 | protégé auth |
| /api/messages | 401 | protégé auth |
| /api/messages/new | 405 | exposé mais non consommable en GET |
| /api/notifications | 401 | protégé auth |
| /api/orders | 401 | protégé auth |
| /api/payments/confirm-mock | 405 | exposé mais non consommable en GET |
| /api/payments/create-intent | 405 | exposé mais non consommable en GET |
| /api/reports | 401 | protégé auth |
| /api/reservations | 401 | protégé auth |
| /api/restaurants | 200 | public ou redirection valide |
| /api/restaurateur/calendar-token | 401 | protégé auth |
| /api/restaurateur/reservations | 401 | protégé auth |
| /api/shipping/labels | 405 | exposé mais non consommable en GET |
| /api/shipping/rates | 405 | exposé mais non consommable en GET |
| /api/shipping/relays | 400 | à vérifier |
| /api/upload | 405 | exposé mais non consommable en GET |
| /api/users | 200 | public ou redirection valide |
| /api/users/me | 401 | protégé auth |
| /api/users/me/addresses | 401 | protégé auth |
| /api/wallet | 401 | protégé auth |
| /api/wallet/pay | 405 | exposé mais non consommable en GET |
| /api/wallet/withdraw | 405 | exposé mais non consommable en GET |

## Lecture critique

- Public vérifié en GET: 4 endpoints.
- Protégé par auth en GET: 14 endpoints.
- Exposé mais probablement mauvais verbe ou route non publique: 15 endpoints.

Ne pas traiter le bundle comme contrat backend final. Pour la reconstruction, rédiger un OpenAPI explicite avec méthodes, schémas, erreurs, RBAC et idempotency keys pour paiement/offres/enchères.
