---
name: Effet waouh (Chapitre 6)
description: Règles des états vides, célébrations discrètes, badges émotionnels privés et petits messages d'Éclosia.
type: design
---

## Interdits
- Jamais de confettis ni d'effet bruyant. Célébration = animation douce (< 200 ms d'entrée), micro-vibration (`haptic` de `src/lib/feedback.ts`), un petit mot.
- Jamais « Aucune donnée », « Erreur », « Alerte », ni rouge vif. Préférer orange doux, bleu, rose, vert.

## États vides
Utiliser `src/components/SoftEmptyState.tsx` : emoji + une phrase humaine + un seul geste.
Références : journal → 💛 « Chaque histoire commence quelque part. » / émotions → 🌸 « Comment te sens-tu aujourd'hui ? » / routines → ✨ « Les petites habitudes créent les grands progrès. »

## Badges émotionnels
`src/lib/gentleBadges.ts` — privés, non compétitifs, acquis à vie, stockés localement. Appeler `celebrate("<key>")` après une première fois ; l'hôte global `GentleCelebration` (monté dans `App.tsx`) affiche la carte. Page : `/moi/badges` (« Mes petits moments »).

## Petits messages
`src/components/SoftWhisper.tsx` — quelques mots, une fois par jour maximum, environ un jour sur deux. Jamais plus de deux lignes.

## Objectifs
Toujours montrer le chemin parcouru avant ce qui reste.
