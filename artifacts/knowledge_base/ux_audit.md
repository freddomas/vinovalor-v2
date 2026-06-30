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
