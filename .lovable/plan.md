# Renforcer la clause de juridiction compétente (article 17 des CGV)

## Audit de la clause actuelle

La clause actuelle (art. 17) est **déjà conforme dans son fond** à l'article R. 631-3 du Code de la consommation : elle laisse au consommateur le choix entre les juridictions de droit commun (CPC) et celles prévues par R. 631-3, sans clause attributive abusive.

Trois améliorations restent souhaitables pour la rendre **irréprochable** :

1. **Médiation préalable** — la formulation actuelle « les parties s'efforceront de trouver une solution amiable **avant** toute action judiciaire » peut être lue comme une **clause limitative d'accès au juge**, potentiellement abusive (art. R. 212-1 10° C. conso). À reformuler en démarche **facultative** et **sans préjudice** du droit de saisir directement le juge.

2. **Juridictions du CPC à expliciter** — rappeler que le consommateur peut aussi saisir le tribunal du domicile du défendeur (art. 42 CPC) ou du lieu d'exécution de la prestation de service (art. 46 CPC), pour éviter qu'une omission soit interprétée comme une exclusion.

3. **Litiges transfrontaliers** — ajouter un renvoi au Règlement (UE) n° 1215/2012 « Bruxelles I bis » (art. 18) qui permet au consommateur résidant dans un autre État membre de l'UE de saisir les juridictions de son propre État. Pertinent vu que le service est accessible en ligne dans toute l'UE.

## Ce qui change pour l'utilisateur

L'article 17 (`#droit-juridiction`) est restructuré en 4 paragraphes clairs, sans changement de numérotation ni d'ancre :

- **Droit applicable** : droit français (inchangé).
- **Résolution amiable** : reformulée en démarche **facultative**, renvoyant à la médiation prévue à l'article 15, et **sans préjudice** du droit de saisir directement le juge.
- **Juridiction compétente** (R. 631-3) : choix explicite du consommateur entre :
  - les juridictions du CPC (lieu du défendeur art. 42, lieu d'exécution art. 46) ;
  - le lieu où il demeurait à la conclusion du contrat ;
  - le lieu de survenance du fait dommageable.
  
  Avec une phrase de fermeture : « Aucune clause [...] ne saurait être interprétée comme limitant ce choix ou comme imposant la compétence exclusive d'une juridiction au consommateur. »
- **Litiges transfrontaliers** : nouveau paragraphe rappelant le bénéfice de l'art. 18 du Règlement Bruxelles I bis pour les consommateurs résidant dans un autre État membre de l'UE.

## Détails techniques

- Fichier modifié : `src/pages/CGV.tsx` uniquement.
- Bornes : lignes 412–430 (article 17 actuel).
- Mêmes classes Tailwind que le reste de la page (`text-lg font-semibold`, `list-disc pl-5 space-y-1`).
- Ancre `#droit-juridiction` et entrée du sommaire conservées.
- Aucune autre section, route ou fichier modifié.

## Hors-scope

- Pas de modification des autres articles des CGV.
- Pas de modification de la section médiation (art. 15) — référencée mais inchangée dans cette itération.
