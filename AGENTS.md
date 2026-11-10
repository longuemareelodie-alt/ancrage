- Visible spaces are stored per account on `profiles.active_spaces` (version 0 = legacy full nav); hiding a space only changes navigation, never business data — keeps existing accounts unchanged and data safe.
- "Éclosia m'aide maintenant" (src/lib/helpNow.ts) is a deterministic rule-based matcher over the signed-in account's own data, no AI call — reliability first, extensible rule by rule.

- Child situations live in `child_situations` (one per event) + `child_situation_observations` (append-only, "Refaire" always inserts) — history is never overwritten.
- Child adaptation (`src/lib/childAdapt.ts`) and situation rules (`src/data/situationTemplates.ts`) are deterministic, no AI; pictograms (`src/data/pictograms.ts`) carry source/licence so only commercially licensed sets get added.
- The sales page (src/pages/Index.tsx) uses the components in src/components/landing/v5; its phone visuals are coded mock screens of the real UI with sample first names (no real user data, no screenshots to keep up to date).
