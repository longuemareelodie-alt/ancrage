# Vérification & relance des illustrations LSF

Script : [`scripts/check-lsf-illustrations.mjs`](../scripts/check-lsf-illustrations.mjs)

## Ce que ça fait

1. **Parse** `src/data/lsfCatalog.ts` + `src/data/lsfNewSigns.ts` pour lister
   tous les signes (≈ 186) avec leur `key`, `label`, `gesture`.
2. **Audite** le dossier `src/assets/lsf/` :
   - Fichier manquant
   - Trop petit (< 4 Ko)
   - Format non reconnu (header ni JPEG/PNG/WebP)
3. **Régénère** chaque image manquante ou cassée via l'AI Gateway
   (`google/gemini-2.5-flash-image`, alias Nano Banana), avec :
   - prompt construit selon la charte `docs/lsf-illustration-style.md`,
   - **retry exponentiel** : 3 tentatives, backoff 2s → 4s → 8s,
   - throttle 800 ms entre signes pour éviter le rate limit,
   - revérification du fichier écrit (taille minimale).
4. Écrit un rapport JSON détaillé dans `/tmp/lsf-illustrations-report.json`
   (clés : `ok`, `missing`, `broken`, `regenerated`, `failed`).

## Usage

```bash
# Audit seul (exit 1 si manquantes/cassées)
node scripts/check-lsf-illustrations.mjs --check

# Audit + régénération automatique
LOVABLE_API_KEY=… node scripts/check-lsf-illustrations.mjs

# Cibler quelques clés
node scripts/check-lsf-illustrations.mjs --only=new-bebe-pipi,emo-aime

# Tout régénérer (ignore l'audit)
LOVABLE_API_KEY=… node scripts/check-lsf-illustrations.mjs --force
```

Dans la sandbox Lovable, `LOVABLE_API_KEY` est déjà disponible — il suffit de
lancer le script tel quel.

## Codes de sortie

| Code | Signification                                            |
| ---- | -------------------------------------------------------- |
| 0    | Tout est OK (ou tout a été régénéré avec succès)         |
| 1    | Audit : il manque/casse des images. Régénération : échecs définitifs |
| 2    | `LOVABLE_API_KEY` manquant alors qu'on doit régénérer    |
| 99   | Erreur fatale (parse, IO majeure)                        |

## Quand le lancer

- Après ajout de nouveaux signes dans `lsfCatalog.ts` / `lsfNewSigns.ts`.
- Si un build échoue avec « Cannot find module '@/assets/lsf/xxx.jpg' ».
- En CI léger pour garantir l'intégrité du dossier `src/assets/lsf/`.
