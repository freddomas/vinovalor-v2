# Rapport QA

## Gate Locale

Commandes minimales attendues avant livraison :

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm audit --audit-level=high
npm run qa:visual
```

Le script `qa:visual` exécute une matrice desktop, laptop, tablette, mobile, mobile minimal et paysage. Il vérifie aussi les erreurs console, erreurs page, HTTP 4xx/5xx inattendus, images cassées, overflow horizontal, texte suspect et contrôles interactifs recouverts.

## Couverture Ciblée

- Règles métier catalogue, prix, quantité, publication, RBAC, enchère et conversion en centimes.
- Sécurité auth/logout, headers, origine, provider credentials preview/désactivation explicite et rôle OAuth par défaut.
- Navigation catalogue et filtres combinés.
- Rendu visuel accueil, catalogue, fiche annonce, restaurants, enchères, vente, connexion, espace et admin.

## Captures

- `qa/screenshots/desktop-1440x900.png`
- `qa/screenshots/desktop-1920x1080.png`
- `qa/screenshots/laptop-1366x768.png`
- `qa/screenshots/tablet-1024x768.png`
- `qa/screenshots/tablet-768x1024.png`
- `qa/screenshots/mobile-430x932.png`
- `qa/screenshots/mobile-390x844.png`
- `qa/screenshots/mobile-360x800.png`
- `qa/screenshots/mobile-320x568.png`
- `qa/screenshots/mobile-landscape-932x430.png`
- `qa/screenshots/sell-desktop.png`
- `qa/screenshots/auctions-desktop.png`
- `qa/screenshots/restaurants-desktop.png`
- `qa/screenshots/listing-detail-desktop.png`
- `qa/screenshots/login-desktop.png`

## Mode Vercel

Le même runner peut tester un déploiement sans démarrer de serveur local :

```powershell
$env:QA_BASE_URL="https://vinovalor-v2.vercel.app"; npm run qa:visual
```
