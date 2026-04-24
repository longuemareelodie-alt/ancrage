# Renforcer la chronologie d'activation et la preuve dans les CGV

## Objectif

Bétonner juridiquement la **renonciation au droit de rétractation** (art. L221-28 13° C. conso) en explicitant, dans les CGV, la **chronologie d'exécution** et les **éléments de preuve** (horodatages serveur + e-mail de confirmation Mollie).

## Ce qui change pour l'utilisateur

Deux sections des CGV (`/cgv`) sont enrichies, sans changement de numérotation ni de structure visuelle (mêmes classes typographiques, sommaire et ancres conservés) :

- **Article 7 — Livraison du contenu numérique → « Livraison du contenu numérique — chronologie »**
  Devient une chronologie en 4 étapes horodatées :
  1. **T0** — validation : case CGV + renonciation cochée, paiement validé sur Mollie.
  2. **T0 + qq sec.** — webhook Mollie confirmant la transaction (horodaté).
  3. **T0 + immédiat** — activation automatique de l'accès côté serveur (horodatée).
  4. **T0 + immédiat** — envoi automatique de l'**e-mail de confirmation** mentionnant date/heure, montant, référence Mollie et rappel de la renonciation : valeur de **justificatif d'achat** et de **preuve de l'exécution immédiate**.
  
  Ajout d'un paragraphe sur la **conservation des éléments probatoires** (horodatage Mollie, horodatage activation, copie technique de l'e-mail) communicables sur demande.

- **Article 8 — Droit de rétractation — renonciation expresse**
  - Rappel renforcé du fondement légal (L221-28 13°) : la rétractation **ne peut être exercée**.
  - Bloc citation (`<blockquote>`) reproduisant **mot pour mot la mention de la case à cocher** au paiement, avec accord préalable exprès + renonciation expresse.
  - Liste à puces démontrant la **chaîne probante** : case cochée AVANT paiement → exécution démarre immédiatement (horodatée) → e-mail de confirmation prouvant la date/heure du début d'exécution.
  - Conclusion explicite : dès activation, le client **ne dispose plus** du droit de rétractation.

## Détails techniques

- Fichier modifié : `src/pages/CGV.tsx` uniquement.
- Bornes de l'édition : lignes 136 → 165 (sections 7 et 8 actuelles).
- Aucun nouvel `id`, aucun changement de numérotation : le sommaire (TOC) déjà en place reste valide. Les ancres `#livraison` et `#retractation` continuent de fonctionner.
- Mêmes classes Tailwind que le reste de la page (`prose`, `text-lg font-semibold`, `list-disc/list-decimal pl-5 space-y-1`).
- Ajout d'un seul élément stylistique nouveau, déjà courant en prose : `<blockquote className="border-l-2 border-primary/40 pl-4 italic text-foreground/80">` pour mettre en avant la formule exacte de la case à cocher.
- Aucune modification de logique applicative, de routes, ou d'autres pages.

## Cohérence avec le reste du produit

- La **case à cocher** mentionnée existe déjà dans le tunnel de paiement (`Paywall.tsx`) sous forme de mention sous le bouton « 39€ ». Le texte cité dans le `<blockquote>` reprend exactement la même formulation pour garantir la cohérence juridique entre la promesse d'UI et les CGV.
- L'**e-mail de confirmation** est cohérent avec le flux Mollie déjà en place (`useMolliePayment` + edge function). Aucun changement backend nécessaire dans cette itération : on ne fait qu'**affirmer juridiquement** ce que le système fait déjà.

## Hors-scope

- Pas de modification de l'edge function Mollie ni du template de l'e-mail de confirmation. Si le contenu actuel de l'e-mail ne mentionne pas explicitement la renonciation à la rétractation, ce sera l'objet d'une itération séparée (le plan peut l'inclure si tu le souhaites).
- Pas de modification de la case à cocher du Paywall (déjà alignée sur la formulation citée).
