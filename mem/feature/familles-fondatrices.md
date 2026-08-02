---
name: Familles Fondatrices — tarification automatique
description: Paliers de prix Éclosia (29/49/69/79/97 €), badges à vie et règles d'attribution automatique après paiement validé
type: feature
---

Le tarif d'Éclosia est décidé par la base de données, jamais à la main, jamais par code promo.

Paliers (place attribuée dans l'ordre d'arrivée) :
- 🌸 5 Familles Fondatrices → 29 € (badge « Famille Fondatrice »)
- 🌱 10 Familles Pionnières → 49 € (badge « Famille Pionnière »)
- ✨ 20 Premières Familles → 69 € (badge « Première Génération »)
- 💛 20 Familles suivantes → 79 € (badge « Première Génération »)
- 🚀 Ensuite → 97 €, sans badge

Règles :
- Le compteur n'avance qu'avec un paiement réellement validé (webhook Mollie), jamais à la création du paiement.
- Une famille n'occupe qu'une seule place, même si le webhook rejoue.
- Le tarif fondatrice et un code promo ne se cumulent jamais : on garde la meilleure remise.
- Si le tarif du moment ne peut pas être lu, on retombe sur 97 € — jamais moins cher par accident.
- Les badges restent à vie (profil, communauté, commentaires, forum).
- Avantages fondatrices : accès à vie, toutes les mises à jour, badge, accès anticipé à certaines nouveautés, possibilité de proposer des idées.
- Jamais de compte à rebours anxiogène : on affiche seulement les places restantes réelles et l'échelle complète des tarifs, annoncée à l'avance.
