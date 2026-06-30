# Décisions

## DECISION 1 - Greenfield

Le dépôt ne contenait pas d'application exploitable. La reconstruction part donc d'un socle Next.js neuf, en conservant `artifacts/` comme source.

## DECISION 2 - Marketplace alcool premium

Le périmètre retenu est alcools premium, pas vin uniquement, car les données capturées contiennent cognac, whisky et saké.

## DECISION 3 - Pas de paiement réel

Le paiement réel est bloqué tant que provider, pays cible, licences et obligations alcool ne sont pas validés.

## DECISION 4 - Auth

NextAuth Credentials permet les comptes locaux avec mot de passe transmis. Google OAuth est activable par variables d'environnement.

## DECISION 5 - QA visuelle autonome

Le runner Playwright standard restait suspendu dans cet environnement. Un script `tools/visual_qa.mjs` démarre Next, lance Chromium, capture les viewports et vérifie l'absence d'overflow horizontal.
