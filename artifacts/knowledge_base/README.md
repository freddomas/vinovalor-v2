# Vinovalor Knowledge Base

Capture source: `https://vinovalor.vercel.app/`

## Artefacts principaux

- `vinovalor_knowledge.sqlite`: base SQLite consolidée pour exploration locale.
- `listings.all.json`, `restaurants.all.json`, `users.all.json`: données API publiques normalisées.
- `listings.csv`, `restaurants.csv`, `users.csv`: exports tabulaires.
- `visual_manifest.json`: inventaire des visuels, originaux, versions améliorées et prompts.
- `api_inventory.bundle.json`, `api_probe.json`: endpoints exposés par le bundle et statuts GET observés.
- `business_logic.md`: logique métier reconstruite.
- `data_model.md`: modèle de données cible.
- `auth_security_spec.md`: auth Google + comptes locaux + sécurité.
- `api_inventory.md`: lecture humaine de l'API.
- `product_red_team.md`: critique red-team.
- `rebuild_backlog.md`: plan de reconstruction priorisé.
- `visual_assets_report.md`: état des images et vidéos.
- `site_capture_report.md`: preuves de capture.
- `rebuild_schema.sql`: brouillon SQL PostgreSQL.

## Résumé vérifié

- Annonces: 41
- Restaurants: 6
- Utilisateurs publics: 15
- Vendeurs/utilisateurs certifiés: 6
- Modes de vente: {'FIXED': 37, 'AUCTION': 4}
- Types produit: {'RED': 17, 'COGNAC': 3, 'SPARKLING': 4, 'WHITE': 9, 'WHISKY': 4, 'SAKE': 2, 'ROSE': 2}
- Prix min/max/moyen: 14.00 EUR / 15 000.00 EUR / 876.34 EUR
- Visuels uniques référencés: 21
- Visuels téléchargés/améliorés: 20 / 20
- Google OAuth: redirection vérifiée = `True`

## Limites vérifiées

- Un visuel Unsplash source renvoie HTTP 404 et n'a pas pu être téléchargé.
- Les captures rendues Chrome ont réussi pour la page d'accueil. Les autres routes n'ont pas produit de fichier stable via Chrome headless dans cet environnement.
- L'analyse ne prouve pas que tous les endpoints exposés par le front sont fonctionnels en production. Elle distingue endpoint exposé, endpoint public et endpoint protégé.
