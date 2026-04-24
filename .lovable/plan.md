# Tester les liens légaux du Paywall (desktop + mobile)

## Objectif

Garantir, via un test automatisé qui s'exécute à chaque modification du code, que les **trois liens légaux** présents sur la page Paywall (`/paywall`) sont bien :

1. **Présents** dans le DOM,
2. **Cliquables** (visibles, non bloqués par CSS),
3. **Fonctionnels** : leur clic navigue effectivement vers `/cgv`, `/confidentialite` et `/mentions-legales`,
4. **Identiques en desktop et en mobile** (viewport 375×812 — iPhone X / standard mobile).

## Ce qui change pour l'utilisateur

Aucun changement visible dans l'app. Un nouveau fichier de test est ajouté au projet. Il s'exécute en local et en CI :

- vérifie chaque lien individuellement (CGV, Confidentialité, Mentions légales) ;
- vérifie qu'ils sont **présents simultanément** (URL cohérentes) ;
- simule un **clic réel** (avec `userEvent`) et vérifie que la navigation aboutit ;
- rejoue le même test en **viewport mobile 375×812** pour valider la version mobile.

Si demain quelqu'un casse un lien (mauvais href, lien retiré, lien masqué en CSS sur mobile…), le test échoue immédiatement.

## Détails techniques

### Fichier ajouté

`src/pages/Paywall.test.tsx` — nouveau test Vitest + React Testing Library.

### Approche

- **Mock de `useAuth`** (utilisateur non connecté, suffisant pour tester l'affichage des liens, sans toucher Supabase).
- **Mock de `useMolliePayment`** (pas d'appel réseau).
- Rendu via `<MemoryRouter>` avec des **routes-cibles factices** (`/cgv`, `/confidentialite`, `/mentions-legales`) qui rendent un texte sentinelle (ex. `PAGE_CGV`). Permet de prouver que le clic a bien navigué, sans charger les vraies pages (qui ont d'autres dépendances).
- **Helper `setViewport(width, height)`** qui modifie `window.innerWidth/Height` et déclenche un `resize` pour tester le mobile.
- Pour chaque lien : `findByRole("link")` filtré par `href`, vérification de `toBeVisible()`, vérification que `pointer-events` ≠ `none` et `display` ≠ `none`, puis `userEvent.click(link)` et `findByText(...)` sur le contenu de la route cible.

### Setup déjà en place dans le projet

- `vitest.config.ts` ✅
- `src/test/setup.ts` ✅
- Dépendances `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` ✅

### Dépendance à ajouter

- `@testing-library/user-event` (pour simuler des clics réalistes). Pas encore listé dans `package.json` — à installer via `bun add -d @testing-library/user-event`.

### Comment exécuter

- `bun run test:watch` (script déjà présent dans `package.json`),
- ou via l'outil `lovable-exec test` (qui appelle vitest).

## Hors-scope

- Pas de test E2E réseau (pas de Playwright/Cypress).
- Pas de modification de la page Paywall ni des composants liés — uniquement l'ajout d'un fichier de test.
- Pas de test des liens du Footer ni de la page Auth (peut être ajouté ensuite avec le même pattern si tu veux).
