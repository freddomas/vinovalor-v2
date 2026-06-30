# Sources et Preuves

## Sources locales capturées

- `https://vinovalor.vercel.app/`
- `https://vinovalor.vercel.app/api/listings`
- `https://vinovalor.vercel.app/api/restaurants`
- `https://vinovalor.vercel.app/api/users`
- `https://vinovalor.vercel.app/api/auth/oauth/google`
- Bundles Next.js sous `artifacts/assets/`
- Capture rendue `artifacts/screenshots/home-desktop.png`

## Sources externes utiles pour cadrage

- Service-Public Entreprendre, licences de débit de boissons: https://entreprendre.service-public.fr/vosdroits/F22379
- Stripe restricted businesses: https://stripe.com/legal/restricted-businesses
- Stripe Bancontact documentation: https://docs.stripe.com/payments/bancontact

## Niveau de preuve

- Les chiffres annonces/restaurants/users viennent des APIs publiques capturées.
- Les endpoints non publics viennent du bundle et de la sonde GET; ils restent à convertir en contrat OpenAPI.
- Les points conformité/paiement sont des risques de cadrage, pas un avis juridique.
