# Sitemap XML pour l'indexation

## Objectif

Faciliter l'indexation par Google/Bing des pages publiques de l'app, en particulier les pages légales demandées (`/cgv`, `/confidentialite`, `/mentions-legales`).

## Approche

Sitemap **statique** servi depuis `public/sitemap.xml` (route automatique `/sitemap.xml` avec Vite, aucune config serveur nécessaire). Plus simple et plus performant qu'une route React (les crawlers ont besoin de XML brut, pas d'une SPA).

Domaine canonique utilisé : `https://www.digitalmamanlibre.com`.

## Modifications

### 1. Création de `public/sitemap.xml`

Liste les pages **publiques et indexables** uniquement (on exclut les pages protégées par auth comme `/dashboard`, `/profil`, `/sante/*`, `/checkin`, etc., qui n'apportent rien à un crawler).

URLs incluses :
- `/` (priorité 1.0)
- `/comparaison` (0.8)
- `/aller-plus-loin` (0.7)
- `/paywall` (0.7)
- `/auth` (0.5)
- `/cgv` (0.4)
- `/confidentialite` (0.4)
- `/mentions-legales` (0.4)

Format XML standard `sitemaps.org` avec `<lastmod>` à la date du jour, `<changefreq>` et `<priority>`.

### 2. Mise à jour de `public/robots.txt`

Ajout de la ligne :
```
Sitemap: https://www.digitalmamanlibre.com/sitemap.xml
```

## Détails techniques

- Vite sert automatiquement tout le contenu de `public/` à la racine → `/sitemap.xml` sera accessible sans configuration de route.
- Pas besoin de toucher à `App.tsx` ni à `index.html`.
- Pas de génération dynamique : la liste de pages publiques est stable, un fichier statique suffit. Si on ajoute une page publique plus tard, il faudra mettre à jour le sitemap manuellement (mention dans le commentaire en tête du fichier).

## Hors scope

- Pas de soumission automatique à Google Search Console (à faire par l'utilisateur).
- Pas de sitemap multilingue (à voir quand l'i18n EN sera en place).
- Pas d'inclusion des pages authentifiées (non pertinent SEO).
