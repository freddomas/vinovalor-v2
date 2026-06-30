from __future__ import annotations

import json
import sqlite3
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "artifacts" / "knowledge_base"


def load_json(name: str):
    return json.loads((KB / name).read_text(encoding="utf-8"))


def write_doc(name: str, content: str) -> None:
    (KB / name).write_text(content.strip() + "\n", encoding="utf-8")


def md_table(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    header = rows[0]
    sep = ["---"] * len(header)
    body = rows[1:]
    lines = ["| " + " | ".join(header) + " |", "| " + " | ".join(sep) + " |"]
    lines.extend("| " + " | ".join(str(cell) for cell in row) + " |" for row in body)
    return "\n".join(lines)


def money(value) -> str:
    if value is None:
        return "n/a"
    return f"{float(value):,.2f} EUR".replace(",", " ")


def build_schema_sql() -> str:
    return """
-- Vinovalor reconstruction schema draft.
-- Target: PostgreSQL. Adapt enum syntax/migrations to the chosen ORM.

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email CITEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer',
  is_certified BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth_identities (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL CHECK (provider IN ('local', 'google')),
  provider_subject TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  password_hash TEXT,
  UNIQUE(provider, provider_subject)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  refresh_token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  street TEXT,
  city TEXT,
  country CHAR(2),
  phone TEXT,
  photo_url TEXT,
  rating NUMERIC(3,2),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE listings (
  id UUID PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  wine_name TEXT NOT NULL,
  wine_type TEXT NOT NULL,
  vintage INTEGER,
  appellation TEXT,
  region TEXT,
  grape_variety TEXT,
  tasting_notes TEXT,
  volume_cl INTEGER NOT NULL DEFAULT 75,
  is_organic BOOLEAN NOT NULL DEFAULT false,
  has_wood_case BOOLEAN NOT NULL DEFAULT false,
  storage_conditions TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  condition_status TEXT NOT NULL,
  sale_mode TEXT NOT NULL CHECK (sale_mode IN ('FIXED', 'AUCTION')),
  allow_offers BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  reserve_price_cents INTEGER,
  target_price_cents INTEGER,
  evin_message TEXT,
  is_boosted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE listing_photos (
  id UUID PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  cdn_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES users(id),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE offers (
  id UUID PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auctions (
  id UUID PRIMARY KEY,
  listing_id UUID NOT NULL UNIQUE REFERENCES listings(id),
  reserve_price_cents INTEGER,
  target_price_cents INTEGER,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE bids (
  id UUID PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES auctions(id),
  bidder_id UUID NOT NULL REFERENCES users(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending_payment',
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewed_user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""


def main() -> None:
    summary = load_json("business_summary.json")
    listings = load_json("listings.all.json")
    restaurants = load_json("restaurants.all.json")
    users = load_json("users.all.json")
    visual_manifest = load_json("visual_manifest.json")
    api_endpoints = load_json("api_inventory.bundle.json")
    api_probe = load_json("api_probe.json")
    oauth_probe = load_json("auth_oauth_probe.json")

    public_probe = [row for row in api_probe if row.get("status_code") and row["status_code"] < 400]
    protected_probe = [row for row in api_probe if row.get("status_code") in {401, 403}]
    method_probe = [row for row in api_probe if row.get("status_code") in {404, 405}]

    wine_types = Counter(item["wineType"] for item in listings)
    regions = Counter(item["region"] for item in listings if item.get("region"))
    sale_modes = Counter(item["saleMode"] for item in listings)

    write_doc(
        "README.md",
        f"""
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

- Annonces: {summary['listings_count']}
- Restaurants: {summary['restaurants_count']}
- Utilisateurs publics: {summary['users_count']}
- Vendeurs/utilisateurs certifiés: {summary['certified_users_count']}
- Modes de vente: {dict(sale_modes)}
- Types produit: {dict(wine_types)}
- Prix min/max/moyen: {money(summary['min_price'])} / {money(summary['max_price'])} / {money(summary['average_price'])}
- Visuels uniques référencés: {summary['visual_urls_unique']}
- Visuels téléchargés/améliorés: {summary['visuals_downloaded']} / {summary['visuals_enhanced']}
- Google OAuth: redirection vérifiée = `{oauth_probe.get('verified')}`

## Limites vérifiées

- Un visuel Unsplash source renvoie HTTP 404 et n'a pas pu être téléchargé.
- Les captures rendues Chrome ont réussi pour la page d'accueil. Les autres routes n'ont pas produit de fichier stable via Chrome headless dans cet environnement.
- L'analyse ne prouve pas que tous les endpoints exposés par le front sont fonctionnels en production. Elle distingue endpoint exposé, endpoint public et endpoint protégé.
""",
    )

    api_rows = [["Endpoint", "GET status", "Lecture"]]
    for row in api_probe:
        status = str(row.get("status_code", row.get("error", "n/a")))
        if row.get("status_code") and row["status_code"] < 400:
            reading = "public ou redirection valide"
        elif row.get("status_code") in {401, 403}:
            reading = "protégé auth"
        elif row.get("status_code") in {404, 405}:
            reading = "exposé mais non consommable en GET"
        else:
            reading = "à vérifier"
        api_rows.append([row["endpoint"], status, reading])

    write_doc(
        "api_inventory.md",
        f"""
# Inventaire API

## Endpoints extraits du bundle

Nombre: {len(api_endpoints)}

{md_table(api_rows)}

## Lecture critique

- Public vérifié en GET: {len(public_probe)} endpoints.
- Protégé par auth en GET: {len(protected_probe)} endpoints.
- Exposé mais probablement mauvais verbe ou route non publique: {len(method_probe)} endpoints.

Ne pas traiter le bundle comme contrat backend final. Pour la reconstruction, rédiger un OpenAPI explicite avec méthodes, schémas, erreurs, RBAC et idempotency keys pour paiement/offres/enchères.
""",
    )

    write_doc(
        "business_logic.md",
        f"""
# Logique Métier Reconstruite

## Positionnement réel

Vinovalor n'est pas seulement un site vitrine. Les faits capturés indiquent une marketplace d'alcools premium: vins, cognacs, whiskies, sakés et caves de restaurants. Le slogan vérifié est `La vraie valeur du vin et de la cave`, mais aucun moteur de cote ou d'estimation de valeur n'a été observé.

## Données observées

- {summary['listings_count']} annonces actives capturées via `/api/listings`.
- Types: {dict(wine_types)}.
- Régions principales: {dict(regions.most_common(12))}.
- Modes de vente: {dict(sale_modes)}.
- {summary['auction_listings']} enchères et {summary['fixed_price_listings']} ventes à prix fixe.
- {summary['listings_with_restaurant']} annonces liées à un restaurant.
- {summary['listings_with_photos']} annonces avec au moins une photo.

## Workflows obligatoires

1. Inscription/connexion locale et Google OAuth.
2. Onboarding âge légal, pays, adresse et acceptation des règles alcool.
3. Recherche catalogue: type, région, appellation, millésime, prix, vendeur, restaurant, enchère.
4. Création d'annonce: brouillon, caractéristiques, prix, stock, photos, prévisualisation, publication.
5. Achat direct: panier léger, livraison, paiement, commande, suivi.
6. Offre: proposition acheteur, acceptation/refus/contre-offre vendeur, expiration.
7. Enchère: prix de réserve, prix cible, fin horodatée serveur, bids atomiques.
8. Messagerie contextualisée par annonce/commande.
9. Favoris.
10. Avis post-commande uniquement.
11. Signalement et modération.
12. Restaurants: fiche, cave associée, réservation ou retrait selon décision produit.

## Règles métier minimales

- Une annonce publiée exige vendeur, nom produit, type, prix positif, quantité positive, état, mode de vente et message sanitaire.
- Maximum 8 photos par annonce, ordre stable, modération avant mise en avant.
- Les enchères doivent être gérées par horloge serveur, transaction atomique et montant strictement supérieur au bid courant.
- Les offres expirent automatiquement et changent le stock uniquement après acceptation/paiement.
- Les avis exigent une commande terminée.
- Les signalements doivent conserver cible, motif, statut et action de modération.
- Les paiements et remboursements doivent être idempotents.
- Les données publiques utilisateur doivent être volontairement limitées.

## Décisions produit à verrouiller

- Périmètre: vin seulement ou alcools premium. Les données prouvent un périmètre plus large que le wording actuel.
- Pays cible et conformité alcool avant choix paiement/livraison.
- Restaurants: différenciateur ou distraction. Pour un MVP propre, les restaurants peuvent être phase 2.
- Promesse `Valor`: si le nom promet la valeur, il faut une cote/prix marché, sinon le branding surpromet.
""",
    )

    write_doc(
        "data_model.md",
        """
# Modèle de Données Cible

## Noyau utilisateur/auth

- `users`: identité publique, email, rôle, certification, bannissement.
- `auth_identities`: provider `local` ou `google`, subject provider, email vérifié, hash mot de passe local.
- `sessions`: refresh token hashé, rotation, révocation, expiration, empreinte appareil.
- `profiles`: bio, avatar, langue, préférences.
- `addresses`: livraison, facturation, retrait.
- `seller_verifications`: KYC, documents, statut de certification.

## Marketplace

- `listings`: fiche produit, stock, prix, mode vente, logistique, statut, conformité.
- `listing_photos`: URL, CDN, ordre, modération.
- `favorites`: relation user/listing.
- `offers`: offre, contre-offre, expiration.
- `auctions`: réserve, cible, dates serveur, statut.
- `bids`: enchères atomiques.
- `orders`, `order_items`: cycle achat, statuts, montants.
- `payments`: provider, intent, capture, refund, webhook ids.
- `wallet_accounts`, `wallet_ledger`, `withdrawals`: utile seulement si séquestre/payout marketplace.

## Communication et confiance

- `conversations`, `messages`.
- `reviews`.
- `reports`, `moderation_actions`.
- `notifications`.
- `audit_log`: auth, paiement, admin, modération.

## Restaurants

- `restaurants`: owner, fiche, adresse, photo, rating, statut.
- `restaurant_staff`: owner/manager/staff.
- `reservations`: créneau, nombre, statut.
- `restaurant_calendar_tokens`: intégration calendrier si conservée.

## SQL

Voir `rebuild_schema.sql` pour un brouillon PostgreSQL directement exploitable comme base de migration.
""",
    )

    write_doc(
        "auth_security_spec.md",
        f"""
# Authentification et Sécurité

## Faits observés

- Google OAuth existe: `/api/auth/oauth/google` renvoie HTTP {oauth_probe.get('status_code')} vers `accounts.google.com` avec scopes `openid email profile`.
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
""",
    )

    write_doc(
        "product_red_team.md",
        """
# Red-Team Produit

## Verdict

Le site actuel donne une base fonctionnelle mais pas une application premium. La donnée métier est plus riche que l'interface. Le risque principal est de reconstruire le même front joli mais sans vérité backend: conformité alcool, confiance vendeur, paiement, litiges, authenticité et livraison.

## Risques critiques

1. Conformité alcool mal cadrée: pays, âge légal, publicité, livraison, mentions sanitaires.
2. Promesse de valeur non tenue: `Valor` implique estimation/cote/provenance; rien de vérifié.
3. Authenticité faible: pas de facture, certificat, niveau, bouchon, état étiquette, provenance.
4. Paiement marketplace: alcool + séquestre + wallet = sujet juridique et provider, pas juste intégration Stripe.
5. Enchères: risque race condition, bid fantôme, horloge client, réserve mal gérée.
6. Données utilisateurs publiques: exposition de profils à limiter au strict nécessaire.
7. Photos Unsplash: apparence démo, faible crédibilité commerciale, dépendances externes fragiles.
8. Restaurants: module séduisant mais peut brouiller le MVP si la stratégie n'est pas claire.

## Critères de sortie premium

- Un acheteur comprend pourquoi il peut faire confiance au vendeur et à la bouteille.
- Un vendeur sait publier, négocier, expédier et être payé sans support manuel.
- Le paiement/livraison/litige sont traçables.
- Les annonces premium ont photos réelles, provenance, état et justificatifs.
- Les règles alcool sont intégrées dans le parcours, pas collées en footer.
- Le backend refuse les actions interdites même si l'UI est contournée.
""",
    )

    write_doc(
        "rebuild_backlog.md",
        """
# Backlog de Reconstruction

## P0 - Socle non négociable

- Modèle DB Postgres + migrations.
- Auth locale + Google OAuth avec cookies HttpOnly.
- RBAC serveur.
- Listings publics, détail annonce, recherche filtrée.
- Création annonce avec brouillon, upload photos, prévisualisation, publication.
- Profils vendeurs publics limités.
- Favoris.
- Admin minimal de modération.

## P1 - Transaction

- Achat direct.
- Paiement sandbox puis provider réel validé pour alcool/pays cible.
- Commandes et statuts.
- Livraison standard/retrait.
- Messagerie acheteur/vendeur.
- Avis post-commande.
- Signalements.

## P2 - Premium marketplace

- Offres et contre-offres.
- Enchères avec bids atomiques.
- Wallet/ledger seulement si modèle de séquestre validé juridiquement.
- Shipping rates, relais, labels.
- Notifications.
- Certification vendeur/KYC.

## P3 - Différenciation

- Restaurants et réservations.
- Caves de restaurants avec vente/retrait.
- Cote/valorisation: benchmark prix, estimation, historique.
- Documents d'authenticité, provenance et scoring confiance.
- Analytics vendeur.

## P4 - Optimisation

- Recommandations.
- Boost annonces avec règles transparentes.
- Internationalisation robuste.
- Observabilité produit: conversion, erreurs paiement, abandon publication.
""",
    )

    visual_failed = [item for item in visual_manifest if item["status"] != "downloaded"]
    write_doc(
        "visual_assets_report.md",
        f"""
# Rapport Visuels

## Résumé

- URLs visuelles uniques: {summary['visual_urls_unique']}
- Téléchargées: {summary['visuals_downloaded']}
- Améliorées localement: {summary['visuals_enhanced']}
- Indisponibles: {len(visual_failed)}
- Dossier originaux: `artifacts/visuals/original/`
- Dossier améliorés: `artifacts/visuals/enhanced/`
- Prompts par image: `artifacts/visuals/prompts/`

## Méthode

Les images récupérables ont été téléchargées en résolution supérieure quand possible, puis améliorées par pipeline local déterministe: réduction légère du bruit, contraste contrôlé, couleur légère, netteté et unsharp mask. Ce pipeline ne réinterprète pas le contenu et n'invente pas de détails. Le prompt fourni par l'utilisateur est conservé fichier par fichier.

## Limite

L'édition générative avec `image_gen` n'a pas été appliquée en lot car l'outil intégré ne fournit pas dans cette session une API de batch par chemin fichier. Les sorties livrées sont donc des restaurations techniques locales, pas des reconstructions génératives. C'est volontaire: inventer des détails aurait contredit la consigne de préserver exactement le sujet.

## Visuel indisponible

{json.dumps(visual_failed, ensure_ascii=False, indent=2)}
""",
    )

    write_doc(
        "site_capture_report.md",
        """
# Rapport de Capture du Site

## Captures réalisées

- HTML racine: `artifacts/raw/index.html`
- Headers: `artifacts/raw/headers.txt`
- Pages route-probe: `artifacts/raw/pages/`
- APIs publiques: `artifacts/raw/api/`
- Bundles/assets Next.js: `artifacts/assets/`
- Capture rendue Chrome: `artifacts/screenshots/home-desktop.png`

## Lecture visuelle vérifiée

La capture rendue montre une interface sombre noir/or, typographie premium, navigation `Découvrir`, `Rechercher`, `EN`, `Connexion`, `Inscription`, recherche centrale, mise en avant restaurant et grille de caves d'exception. L'interface est plus proche d'un prototype marketplace/restaurants que d'un produit transactionnel fini.

## Limites

Les autres routes n'ont pas généré de capture stable via Chrome headless dans cet environnement, malgré tentative. Le contenu métier a donc été consolidé principalement par APIs publiques et bundles.
""",
    )

    write_doc(
        "ux_audit.md",
        """
# Audit UX/UI Red-Team

## Faits visuels vérifiés localement

- Accueil sombre noir/or, logo `VinoValor`, navigation `Découvrir`, `Rechercher`, `EN`, `Connexion`, `Inscription`.
- Recherche centrale: `Rechercher un restaurant, un vin...`.
- Mise en avant restaurant avec image, note, ville et pays.
- Section `CAVES D'EXCEPTION PRÈS DE CHEZ VOUS`.
- Navigation basse visible sur la capture desktop: `Découvrir`, `Réservations`, `La cave`, `Enchères`, `Profil`.

## Constats recoupés par audit navigateur parallèle

- `/search` expose onglets `Vins` / `Membres`, filtres type/région/année/prix et tri.
- Les fiches restaurant exposent cave associée et CTA de réservation.
- Les fiches annonce exposent prix, vendeur, frais, sécurité, achat, offre, favori et contact vendeur.
- Les routes protégées retombent sur login sans contexte métier fort.

## Problèmes à corriger

- La navigation basse apparaît comme un élément mobile mais reste visible sur desktop: perception amateur.
- Le vocabulaire n'est pas stabilisé: `Découvrir`, `Rechercher`, `La cave`, `Explorer la cave aux vins`.
- Le compteur catalogue doit être vérifié: l'API pagine 41 annonces, mais l'interface peut afficher un total sans clarifier pagination.
- Les images Unsplash et placeholders cassent la crédibilité premium.
- Les données seed manquent d'accents dans plusieurs champs, ce qui abaisse immédiatement la perception.
- L'inscription demande trop d'information trop tôt.
- Les écrans gated doivent contextualiser l'action: réserver, enchérir, vendre, contacter.

## Direction premium

- Garder noir/or/serif, mais densifier l'information transactionnelle.
- Remplacer les images génériques par photos bouteille réelles, preuves et documents.
- Mettre la confiance au centre: provenance, conservation, vendeur certifié, protection acheteur.
- Simplifier l'onboarding: auth d'abord, profil/adresse/âge au moment de l'action.
- Rendre les règles responsive explicites: top nav desktop, bottom nav mobile uniquement.
""",
    )

    write_doc(
        "sources.md",
        """
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
""",
    )

    (KB / "rebuild_schema.sql").write_text(build_schema_sql().strip() + "\n", encoding="utf-8")

    con = sqlite3.connect(KB / "vinovalor_knowledge.sqlite")
    try:
        counts = {
            "listings": con.execute("SELECT COUNT(*) FROM listings").fetchone()[0],
            "restaurants": con.execute("SELECT COUNT(*) FROM restaurants").fetchone()[0],
            "users": con.execute("SELECT COUNT(*) FROM users").fetchone()[0],
            "visual_assets": con.execute("SELECT COUNT(*) FROM visual_assets").fetchone()[0],
        }
    finally:
        con.close()
    print(json.dumps({"generated_docs": 11, "sqlite_counts": counts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
