---
name: LSF illustrations check script
description: Audit + auto-regen of src/assets/lsf/*.jpg via AI Gateway (Nano Banana) with retry/backoff. Run after adding signs.
type: reference
---
Script: `scripts/check-lsf-illustrations.mjs` (doc: `docs/lsf-illustrations-check.md`).

What it does:
- Parses `src/data/lsfCatalog.ts` + `src/data/lsfNewSigns.ts` to list all sign keys + gestures.
- Audits `src/assets/lsf/<key>.jpg`: missing, too small (<4KB), or unknown header (accepts JPEG/PNG/WebP magic bytes).
- Regenerates broken/missing via `google/gemini-2.5-flash-image` using the LSF illustration charter prompt, with 3-attempt exponential backoff (2s/4s/8s) and 800ms throttle between signs.
- Writes JSON report to `/tmp/lsf-illustrations-report.json`.

Usage:
- `node scripts/check-lsf-illustrations.mjs --check` → audit only (exit 1 if issues)
- `node scripts/check-lsf-illustrations.mjs` → audit + regen (LOVABLE_API_KEY auto-available in sandbox)
- `--only=key1,key2` to target specific signs
- `--force` to regenerate everything

When to run: after adding new signs, when build fails on missing `@/assets/lsf/*.jpg` import, or as periodic integrity check.
