# Project Memory

## Core
Règle d'or Éclosia : toute feature/écran doit ENLEVER une charge mentale, sinon simplifier ou supprimer. Voir mem://preference/eclosia-philosophie.
Ton : tutoiement, doux, jamais culpabilisant ni médical. UI crème/rose poudré/bleu nuit, très arrondie, animations lentes, minimaliste.
Jamais de confettis ni d'états vides « Aucune donnée » : célébrations discrètes + `SoftEmptyState`. Voir mem://design/effet-waouh.
LSF sign illustrations: 1:1 768px JPG, cream bg #FBF6EC, peach skin #F4C9B8, warm brown line #7A5240, coral motion accents #E08F7E. No text in image. See mem://design/lsf-illustrations.
To audit/regen LSF illustrations, run `node scripts/check-lsf-illustrations.mjs` (use `--check` for audit only). See mem://reference/lsf-illustrations-check.

## Memories
- [Philosophie produit Éclosia](mem://preference/eclosia-philosophie) — Règle d'or, ton de voix, interdits, principes UI/onboarding.
- [Familles Fondatrices](mem://feature/familles-fondatrices) — Paliers 29/49/69/79/97 €, badges à vie, attribution automatique après paiement validé, non-cumul promo.
- [Inviter un proche](mem://feature/inviter-un-proche) — Invitation e-mail depuis le profil, rôles disponibles, lien 30 jours, garde-fous anti-spam, pas encore de partage de droits.
- [LSF illustration style](mem://design/lsf-illustrations) — Full charter for per-sign visuals (format, palette, composition, prompt template, fallback). Mirrors docs/lsf-illustration-style.md.
- [LSF illustrations check script](mem://reference/lsf-illustrations-check) — Audit + auto-regen of src/assets/lsf/*.jpg via AI Gateway (Nano Banana) with retry/backoff. Run after adding signs.
