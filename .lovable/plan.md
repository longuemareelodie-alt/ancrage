## Module "Comment tu te sens ?" — Plan de build

Nouveau module émotionnel pour l'enfant, accessible depuis l'accueil et depuis "Liés autrement", avec 5 parcours adaptés par tranche d'âge et historique persistant.

### 1. Base de données (1 migration)

Nouvelle table `child_emotion_entries` (RLS owner-only) :
- `user_id uuid not null` (le parent / compte)
- `age_band text` ('0_3', '3_6', '6_9', '9_12', '12_plus')
- `emotion text` (clé normalisée : happy, sad, angry, scared, overwhelmed, unknown, frustrated, ashamed, lonely, misunderstood, empty, anxious, flooded)
- `intensity int null` (1–5 ou 1–3)
- `body_location text null` ('belly', 'head', 'throat', 'hands', 'all')
- `observed_signs text[] null` (pour 0–3 ans)
- `note text null` (journal libre 9–12 et 12+)
- `is_crisis boolean default false`
- `needs_parent boolean default false` (bouton ado "J'ai besoin d'aide")
- `created_at timestamptz default now()`

Policies : owner CRUD. Index sur `(user_id, created_at desc)`.

### 2. Données statiques (TS)

`src/data/childEmotionsCatalog.ts` :
- Liste des 6 émotions de base (3–9 ans) avec emoji + couleur + libellé.
- Roue élargie 9–12 et 12+ (12 émotions).
- Signes observables 0–3 ans.
- Pour chaque émotion : phrase à dire au parent + geste concret + (si applicable) exercice simple.
- Mapping crise : émotions noir/rouge ou intensité ≥4 → flag.

### 3. Routes & navigation

Dans `App.tsx`, ajouter sous `PaidRoute` :
- `/comment-tu-te-sens` → page avec sélection d'âge, puis sous-flux selon âge.
- `/comment-tu-te-sens/historique` → vue parent 7j / 30j.

Ajouter une carte dans `LiesAutrementHome.tsx` (icône 🌈, titre "Comment tu te sens ?", desc fournie) qui pointe vers `/comment-tu-te-sens`.

Ajouter un bouton vert (#7DB89F via token `--lies`) sur la page d'accueil (`Index.tsx`), sous les CTAs existants : icône 🌈, "Mon enfant — comment il se sent ?" + sous-titre "Aide-le à mettre des mots · 30 sec".

### 4. Composants

Sous `src/components/feelings/` :
- `AgeBandPicker.tsx` — sélecteur 5 tranches (gros boutons emoji).
- `Observations0_3.tsx` — checkboxes signes + résultat parent.
- `Faces6.tsx` — grille 6 visages colorés (3–6 et étape 1 de 6–9).
- `IntensityPicker.tsx` — 3 niveaux (6–9) ou 5 niveaux (9–12, 12+).
- `BodyLocationPicker.tsx` — 5 zones du corps.
- `EmotionWheel.tsx` — roue 12 émotions (9–12, 12+).
- `JournalField.tsx` — textarea optionnelle.
- `ParentGuidance.tsx` — bloc "À dire / À faire / Exercice / C'est une crise" → lien `/lies-autrement/crise`.
- `TeenSelfHelp.tsx` — exercices autonomes + bouton "J'ai besoin d'aide" (insère entrée avec `needs_parent=true`).
- `EmotionHistory.tsx` — onglets 7j/30j + barres simples (recharts déjà présent) des émotions dominantes.

Sous `src/pages/feelings/` :
- `FeelingsHome.tsx` — orchestrateur, gère étape âge → sous-flux.
- `FeelingsHistory.tsx` — page historique.

### 5. Logique de sauvegarde

Hook `useChildEmotionEntry` : insert dans `child_emotion_entries` à la fin de chaque flux (ou à chaque "J'ai besoin d'aide" pour les ados). Toast de confirmation discret.

### 6. Design

- Vert doux `--lies` déjà défini, réutilisé.
- Visages : emojis Unicode pour v1 (rapide, accessible) avec halos colorés en HSL via tokens — illustrations watercolor à itérer ensuite.
- Boutons larges (min h-16), tap-friendly mobile, contrast AA.
- Réutilise `LiesShell` pour cohérence.

### 7. Hors scope v1

- Notification push réelle au parent depuis le bouton ado (insère seulement la ligne `needs_parent=true` ; v1 = badge "ton enfant a demandé de l'aide" dans dashboard parent à itérer ensuite).
- Profils enfants multiples (v1 = une seule entrée liée au compte parent).
- Illustrations watercolor custom (v1 = emojis + halos colorés).

### Détails techniques

- Migration Supabase unique, RLS strict owner.
- Pas de nouveau secret.
- Pas de nouvelle dépendance (recharts déjà présent).
- i18n : nouvelles clés `feelings.*` dans `fr.json` uniquement v1.
- Tests : un spec vitest léger pour la logique "is_crisis" (mapping émotion+intensité → flag).

**Volume** : ~12 fichiers créés, 1 migration, ~700 lignes.
