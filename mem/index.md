# Project Memory

## Core
LSF sign illustrations: 1:1 768px JPG, cream bg #FBF6EC, peach skin #F4C9B8, warm brown line #7A5240, coral motion accents #E08F7E. No text in image. See mem://design/lsf-illustrations.
To audit/regen LSF illustrations, run `node scripts/check-lsf-illustrations.mjs` (use `--check` for audit only). See mem://reference/lsf-illustrations-check.

## Memories
- [LSF illustration style](mem://design/lsf-illustrations) — Full charter for per-sign visuals (format, palette, composition, prompt template, fallback). Mirrors docs/lsf-illustration-style.md.
- [LSF illustrations check script](mem://reference/lsf-illustrations-check) — Audit + auto-regen of src/assets/lsf/*.jpg via AI Gateway (Nano Banana) with retry/backoff. Run after adding signs.
