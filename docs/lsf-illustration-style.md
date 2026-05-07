# Charte visuelle — Illustrations LSF

Ce document définit le style des illustrations IA générées pour remplacer les
emojis sur chaque fiche signe (`src/assets/lsf/<key>.jpg`). Il s'aligne sur les
illustrations existantes (ex. `bebe-manger.jpg`, `emo-calme.jpg`) pour garantir
une cohérence visuelle parfaite à travers les ~187 fiches.

---

## 1. Format technique

| Paramètre        | Valeur                                                             |
| ---------------- | ------------------------------------------------------------------ |
| Ratio            | **1:1** (carré)                                                    |
| Dimensions       | **768 × 768 px** (généré) — affiché en `h-14 w-14` à `h-16 w-16`   |
| Extension        | `.jpg` (qualité 85 %, ~80–120 Ko)                                  |
| Chemin           | `src/assets/lsf/<key>.jpg` (clé identique à `LsfSign.key`)         |
| Outil            | `imagegen--generate_image` · model `fast` · `transparent_background: false` |
| Background       | Fond plein crème (PAS transparent — le carré crème fait partie du style) |

---

## 2. Palette

Limitée, douce, complémentaire des tokens `--lies` / `--lies-soft` du design system.

| Rôle                    | Couleur                           | Hex       |
| ----------------------- | --------------------------------- | --------- |
| Fond                    | Crème très clair                  | `#FBF6EC` |
| Peau (mains)            | Rose pêche pâle                   | `#F4C9B8` |
| Trait principal         | Brun chaud très doux              | `#7A5240` |
| Accent (flèches, pointillés mouvement) | Corail délavé          | `#E08F7E` |
| Ombres légères          | Beige rosé                        | `#E8C9B8` |

**Interdit** : noir pur, blanc pur, dégradés saturés, néons, ombres dures.

---

## 3. Composition

- **Sujet centré** (mains seules, ou mains + visage simplifié si nécessaire au signe).
- **Marges généreuses** : ~15 % de fond crème vide tout autour. Jamais de
  rognage qui touche le bord.
- **Vue frontale** depuis le point de vue de l'observateur (comme face à un signeur).
- **Pas de texte dans l'image** : le label apparaît dans l'UI, jamais incrusté.
  (Les anciens fichiers avec un mot incrusté — type `emo-calme.jpg` — sont à
  régénérer sans texte.)
- **Mouvement** indiqué par : flèches fines corail, pointillés courbes, ou
  doublement subtil de la main (motion ghost à 30 % d'opacité).

---

## 4. Trait & rendu

- Style **illustration ligne claire** : trait fin (1.5–2 px à 768 px), continu,
  légèrement organique (pas vectoriel parfait).
- **Aplats doux** sans hachures ni textures grain.
- Léger ombrage pastel sous les doigts pour donner du volume — jamais de
  modelé réaliste.
- **Aucun réalisme photographique**, aucun rendu 3D, aucun style cartoon
  exagéré (pas de gros yeux, pas de visages chibis).

---

## 5. Prompt template

À utiliser tel quel avec `imagegen--generate_image` (model `fast`, 768×768,
`transparent_background: false`) :

```
Soft hand-drawn illustration of {{GESTURE_DESCRIPTION_FR}}, clean line-art
style, thin warm brown outline (#7A5240), pale peachy-pink skin tone (#F4C9B8),
soft cream background (#FBF6EC) filling the whole square frame, centered
composition with generous margins. Subtle coral arrows or dotted curves
(#E08F7E) to indicate motion if relevant. No text, no letters, no caption,
no watermark. Front view from the observer's perspective. Square 1:1 format.
Calm, warm, pedagogical, suitable for a parenting app teaching baby sign
language to French families.
```

Remplacer `{{GESTURE_DESCRIPTION_FR}}` par le champ `gesture` du signe
(ex. `"a flat hand with joined fingers moving toward the mouth"`).

---

## 6. Affichage dans l'UI

Déjà câblé dans `LsfTheme.tsx` et `SignesNouveaux.tsx` via le composant
`<LsfSignImage>` (à créer si pas encore présent) :

- **Conteneur** : `h-16 w-16 rounded-xl bg-[hsl(var(--lies-soft))] overflow-hidden`
- **Image** : `h-full w-full object-cover` + `loading="lazy"`
- **Fallback** : si l'image manque, afficher l'emoji du signe à `text-3xl`
  centré dans le même conteneur (déjà géré).

---

## 7. Workflow de production

1. Repérer les signes sans illustration (clés présentes dans `lsfNewSigns.ts`
   sans fichier dans `src/assets/lsf/`).
2. Pour chaque signe : générer l'image avec le prompt ci-dessus + la
   description `gesture` traduite en anglais.
3. Sauver à `src/assets/lsf/<key>.jpg`.
4. Importer dans `lsfNewSigns.ts` (ou un map dédié) et passer `image` au
   composant.
5. QA : les nouvelles fiches doivent être visuellement indistinguables des
   anciennes posées côte à côte.

---

## 8. Régressions à corriger sur l'existant

- Les anciennes images contenant du texte incrusté (ex. mot "calm" sous les
  mains de `emo-calme.jpg`) doivent être régénérées **sans texte** lors d'un
  prochain pass, pour être cohérentes avec la règle « jamais de texte dans
  l'image ».
