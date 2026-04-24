# Aligner le rendu visuel de Mentions légales sur CGV

## Constat

Après comparaison ligne par ligne des classes Tailwind utilisées dans `src/pages/CGV.tsx` et `src/pages/MentionsLegales.tsx`, les deux pages utilisent **déjà les mêmes classes** pour tous les éléments communs :

| Élément | Classes (identiques sur les deux pages) |
|---|---|
| Wrapper page | `min-h-screen bg-background` |
| Container | `max-w-3xl mx-auto` (dans `SectionBlock`) |
| H1 | `text-2xl md:text-3xl font-bold mb-2 text-foreground` |
| Date | `text-sm text-muted-foreground` |
| Container prose | `prose prose-sm md:prose-base max-w-none text-foreground/90 space-y-6` |
| H2 sections | `text-lg font-semibold text-foreground` |
| Listes `<ul>` | `list-disc pl-5 space-y-1` |
| Listes `<ol>` | `list-decimal pl-5 space-y-1` |
| Liens | `underline hover:text-primary` |
| Blockquote | `border-l-2 border-primary/40 pl-4 italic text-foreground/80` |
| Footer | `<Footer />` présent sur les deux |

## Seule différence détectée

La marge sous la date :
- **CGV** : `mb-6`
- **MentionsLegales** : `mb-8`

CGV utilise `mb-6` parce qu'un bloc sommaire (`mb-8`) suit juste après et apporte le spacing supplémentaire. MentionsLegales a `mb-8` pour compenser l'absence de sommaire — ce qui est en réalité **correct visuellement** : le rendu actuel est cohérent.

## Modification proposée

Pour une **stricte uniformité de classes** (ce que tu demandes), une seule ligne à corriger dans `src/pages/MentionsLegales.tsx` :

```diff
- <p className="text-sm text-muted-foreground mb-8">
+ <p className="text-sm text-muted-foreground mb-6">
```

Aucune autre modification n'est nécessaire — wrappers, tailles, couleurs, spacing, listes, titres, liens et blockquotes sont déjà alignés.

## Note

Si tu préfères conserver un spacing visuellement équilibré (la date en `mb-8` quand il n'y a pas de sommaire), on peut au contraire **garder `mb-8`** : le rendu reste harmonieux, c'est juste une classe différente. Dis-moi laquelle des deux options tu veux :

- **Option A** (par défaut, ce que je vais appliquer) : aligner sur `mb-6` pour une uniformité stricte des classes.
- **Option B** : garder `mb-8` sur Mentions légales pour compenser visuellement l'absence de sommaire.
