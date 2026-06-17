# Gabarit de validation des témoignages

Tout témoignage publié sur la home **doit** passer la validation de
`src/lib/testimonialSchema.ts`. Les tests `src/lib/testimonialSchema.test.ts`
échouent automatiquement si un témoignage de `fr.json` viole une règle.

## Structure obligatoire

```json
{
  "name": "Prénom modifié",
  "context": "âge · enfants · situation",
  "delay": "J+5",                          // ou "Sem 2", "Semaine 3"
  "before": "Phrase courte sur l'état initial.",
  "result": "« Citation entre guillemets français. »",
  "metrics": [
    { "label": "Indicateur 1", "before": "X", "after": "Y" },
    { "label": "Indicateur 2", "before": "X", "after": "Y" },
    { "label": "Indicateur 3", "before": "X", "after": "Y" }
  ]
}
```

**Exactement 3 indicateurs.** Pas 2, pas 4.

## Bornes de longueur

| Champ | min | max |
|---|---|---|
| name | 2 | 30 |
| context | 8 | 80 |
| before | 10 | 160 |
| result | 30 | 320 |
| metrics[].label | 4 | 60 |
| metrics[].before / after | 1 | 80 |

## ❌ Interdit (= test rouge)

### Vocabulaire médical
`guéri`, `soigner`, `traitement`, `thérapie`, `diagnostic`, `dépression`,
`burn-out`, `TDAH`, `anxiété généralisée`, `antidépresseur`, `anxiolytique`,
`remplace ma thérapie`, `plus besoin de mon traitement`…

> Eclosia est un outil de bien-être. Toute formulation laissant entendre un
> soin, un diagnostic, ou une guérison expose juridiquement le projet
> (allégation de santé non autorisée).

### Promesses universelles
`garanti`, `100% des`, `toutes les mamans`, `miracle`, `instantané`,
`définitivement`…

> Chaque système nerveux a son rythme. Un témoignage individuel ne se
> généralise jamais.

### Format délai
Doit suivre `J+N` (ex. `J+5`, `J+30`) ou `Sem N` / `Semaine N`.
Pas de « tout de suite », « rapidement », « en un rien de temps ».

### Citation
La phrase de `result` doit être encadrée par des guillemets français
`« … »` — pas `"…"`, pas `« … `.

## ⚠️ Avertissements (= warning, à éviter)

### Ton off
`boostez`, `optimisez`, `performance`, `révolutionnaire`, `incroyable`,
`extraordinaire`, `le meilleur produit`…

> On reste dans la première personne, sororal, incarné. Pas de jargon
> marketing.

### Métrique sans changement
`{ before: "Pareil", after: "Pareil" }` n'apporte rien — un témoignage doit
montrer une transformation.

## ✅ Bon témoignage (exemple)

```json
{
  "name": "Camille",
  "context": "32 ans · 2 enfants (4 et 18 mois)",
  "delay": "J+5",
  "before": "Je criais 3 fois par jour. Je m'endormais en pleurant.",
  "result": "« Au 5e jour, je n'ai pas crié une seule fois. J'ai compris que je pouvais sentir la vague monter et la laisser passer. »",
  "metrics": [
    { "label": "Fréquence des crises", "before": "3/jour", "after": "0 sur 7 jours" },
    { "label": "Durée d'apaisement", "before": "45 min pour redescendre", "after": "2 min avec un ancrage" },
    { "label": "Clarté mentale au coucher", "before": "Ruminations 1h+", "after": "Endormie en 15 min" }
  ]
}
```

## Workflow recommandé

1. Recueillir le témoignage **avec consentement écrit** (utilise un formulaire
   qui mentionne l'usage marketing + droit à l'oubli).
2. Anonymiser : prénom modifié, contexte volontairement flou si nécessaire.
3. Reformuler à la 1re personne, sans toucher au sens.
4. Choisir 3 indicateurs **mesurables** observés par la personne elle-même.
5. Coller dans `fr.json` → `home.testimonials.items`.
6. `bunx vitest run src/lib/testimonialSchema` — doit être vert.
7. (Optionnel mais conseillé) garder une trace du témoignage original signé.

## Vérification rapide en console

```ts
import { validateTestimonial } from "@/lib/testimonialSchema";

const r = validateTestimonial(monTemoignage);
console.log(r.valid ? "✅ OK" : "❌ KO", r);
```
