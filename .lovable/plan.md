# Améliorer la lecture des CGV — table des matières + retour en haut

## Objectif

Rendre la page `/cgv` (17 sections, ~327 lignes) navigable rapidement :
- une **table des matières** cliquable en haut de page, qui amène à la section correspondante via une ancre ;
- un **bouton flottant « ↑ Haut de page »** qui apparaît après quelques centaines de pixels de scroll.

## Ce qui change pour l'utilisateur

- En arrivant sur la page, juste sous le titre et la date de mise à jour, un encadré « Sommaire » liste les 17 sections. Un clic fait défiler en douceur jusqu'à la section visée.
- Pendant la lecture, un petit bouton rond apparaît en bas à droite dès que l'on a scrollé. Un clic ramène en haut de la page (avec un défilement fluide).
- Sur mobile, le sommaire reste lisible (liste compacte sur une colonne), sur desktop il s'affiche sur deux colonnes pour limiter la hauteur.
- L'URL reflète la section consultée (ex. `/cgv#contact-support`), ce qui permet de partager un lien direct vers une section.

## Détails techniques

### 1. Structure des sections (`src/pages/CGV.tsx`)

- Extraire la liste des 17 sections dans une constante `sections` en haut du fichier :
  ```ts
  const sections = [
    { id: "objet", title: "1. Objet" },
    { id: "editeur-contact", title: "2. Éditeur et contact" },
    // … jusqu'à 17. Droit applicable et juridiction compétente
  ];
  ```
- Ajouter `id={section.id}` sur chaque balise `<section>` existante + `scroll-mt-24` (Tailwind) pour compenser tout offset visuel lors d'un saut d'ancre.
- Conserver les classes typographiques actuelles (cohérence avec Mentions légales déjà alignée).

### 2. Composant Table des matières (inline dans `CGV.tsx`)

- Encadré `rounded-xl border border-border bg-card/50 p-4 md:p-5 mb-8`.
- Titre « Sommaire » (`text-sm font-semibold text-foreground mb-3`).
- Liste `<ol>` en `grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-sm`.
- Chaque item : `<a href={`#${id}`} className="text-muted-foreground hover:text-primary hover:underline transition-colors">`.
- Cliquer sur un lien laisse le navigateur gérer l'ancre native ; le défilement fluide est obtenu via CSS global `html { scroll-behavior: smooth; }` (à ajouter dans `src/index.css` s'il n'y est pas déjà).

### 3. Bouton « Retour en haut »

- Nouveau composant léger `src/components/BackToTop.tsx` (réutilisable) :
  - State `visible` mis à jour via un listener `scroll` passif.
  - Apparaît dès `window.scrollY > 400`.
  - Bouton rond `fixed bottom-6 right-6 z-40 size-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform`.
  - Icône `ArrowUp` de `lucide-react`.
  - `aria-label="Retour en haut de page"`.
  - `onClick` : `window.scrollTo({ top: 0, behavior: "smooth" })`.
  - Respect de `prefers-reduced-motion` : si actif, `behavior: "auto"`.
- Importé et monté dans `CGV.tsx` (et réutilisable plus tard sur `MentionsLegales` / `Confidentialite` si souhaité).

### 4. Accessibilité & perfs

- Liens ancres = navigation native, fonctionne sans JS.
- `scroll-behavior: smooth` global, désactivé automatiquement via `@media (prefers-reduced-motion: reduce)` dans `index.css`.
- Listener `scroll` en `{ passive: true }` pour ne pas bloquer le scroll.

## Fichiers touchés

- `src/pages/CGV.tsx` — ajout des `id`, du sommaire, import du bouton.
- `src/components/BackToTop.tsx` — nouveau composant.
- `src/index.css` — ajout de `html { scroll-behavior: smooth; }` + override `prefers-reduced-motion` (si pas déjà présent).

## Hors-scope

- Pas de mise en surbrillance dynamique de la section active dans le sommaire (scroll-spy) — non demandé, ajout possible plus tard.
- Pas d'application au sommaire de Mentions légales / Confidentialité dans cette itération (peut être fait ensuite avec le même composant).
