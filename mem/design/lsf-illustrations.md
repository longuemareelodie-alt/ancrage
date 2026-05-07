---
name: LSF illustration style
description: Visual rules for per-sign LSF illustrations (square 1:1 768px, cream bg #FBF6EC, peach skin #F4C9B8, warm brown line #7A5240, coral motion accents #E08F7E, no text in image). Full charter at docs/lsf-illustration-style.md.
type: design
---
Toutes les illustrations de signes LSF (`src/assets/lsf/<key>.jpg`) suivent une
charte unique :

- **Format** : 1:1, 768×768 px, JPG ~85 %, fond plein crème (PAS transparent).
- **Palette** : crème `#FBF6EC` · peau `#F4C9B8` · trait brun chaud `#7A5240`
  · accent corail `#E08F7E`. Pas de noir/blanc purs, pas de néons.
- **Style** : ligne claire dessinée à la main, trait fin, aplats doux,
  composition centrée avec marges généreuses, vue frontale.
- **Mouvement** : flèches fines corail ou pointillés courbes, jamais agressif.
- **Texte interdit dans l'image** (le label vient de l'UI).
- **Outil** : `imagegen--generate_image` model `fast`,
  `transparent_background: false`. Prompt template documenté dans
  `docs/lsf-illustration-style.md` (section 5).
- **Affichage** : conteneur `h-16 w-16 rounded-xl bg-[hsl(var(--lies-soft))]`,
  `object-cover`, fallback emoji si image manquante.
