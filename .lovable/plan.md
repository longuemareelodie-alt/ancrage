## Section "Liés autrement" — Plan de build v1 (squelette complet)

Build complet du squelette des 5 modules avec base de données, routes, navigation, et premiers contenus. Les 5 modules sont premium (PaidRoute) sauf l'entrée Communauté qui requiert en plus un opt-in "Rejoindre".

### 1. Design system — accent vert

Ajouter un token `--lies` (vert doux #7DB89F en HSL) dans `src/index.css` + `tailwind.config.ts`. Variantes utilisées uniquement dans les écrans de la section "Liés autrement" (badges, CTAs, icônes), le reste de l'app conserve violet/rose.

### 2. Navigation

- `BottomNav.tsx` : ajouter un 5ᵉ item "Liés" → `/lies-autrement`, icône `Handshake` (lucide-react), accent vert quand actif.
- Réorganisation : Accueil · Rituel · **Liés** · Santé · Espace (5 items, déjà OK pour l'écran 716px).

### 3. Routes & pages (App.tsx)

Toutes en `PaidRoute` :
- `/lies-autrement` → hub avec 5 cartes
- `/lies-autrement/lsf` + `/lies-autrement/lsf/:themeSlug`
- `/lies-autrement/ressources`
- `/lies-autrement/crise`
- `/lies-autrement/journal`
- `/lies-autrement/communaute` (gate "Rejoindre" intégré dans la page)

### 4. Base de données (migration unique)

Nouvelles tables (toutes RLS activée, `user_id uuid not null` lié à `auth.users` via `auth.uid()`) :

| Table | Usage | Politique RLS |
|---|---|---|
| `lsf_progress` | (user_id, sign_key, learned_at) UNIQUE(user_id, sign_key) | Owner CRUD |
| `private_journal_entries` | id, user_id, mode (`free`/`guided`), prompt_key nullable, content text, created_at, updated_at | Owner CRUD strict |
| `community_members` | user_id PK, joined_at, display_name | Owner select/insert ; lecture publique du `display_name` via vue limitée |
| `community_threads` | id, slug, title, description, is_active | Lecture publique (membres), insert admin |
| `community_posts` | id, thread_id, author_id, kind (`thread_post`/`free_post`/`question`), parent_id nullable, body, status (`pending`/`approved`/`rejected`/`hidden`), created_at | Auteur voit ses pending, tous les membres voient `approved`, admin voit tout & update status |
| `community_reports` | id, post_id, reporter_id, reason, created_at, resolved | Insert membre, select admin |

Données seed initiales : threads "LSF & premiers signes", "Mon enfant TSA", "Gérer le regard des autres", "Nos victoires du jour" + catalogue troubles (constante TS, pas de table).

### 5. Module 1 — LSF

- Données LSF en TS (`src/data/lsfCatalog.ts`) : 4 thèmes, 5–8 fiches par thème (~25 signes au total v1).
- Génération IA des illustrations via `imagegen--generate_image` (style cohérent : illustration plate, mains stylisées, fond doux). Stockées dans `src/assets/lsf/<slug>.png`.
- Page thème : grille de fiches, toggle "appris ✓" → `lsf_progress`.
- Barre de progression par thème.

### 6. Module 2 — Ressources & troubles

Catalogue statique TS (`src/data/troublesCatalog.ts`) avec : tsa, tdah, dys, tdi, tsl, troubles_sensoriels, troubles_emotionnels, epilepsie, handicap_moteur, surdite, troubles_rares. Pour chaque : titre, résumé 2–3 phrases, ressources FR (associations + sites + numéros). Affichage en `Accordion` shadcn.

### 7. Module 3 — Gérer une crise

Données TS (`src/data/criseScenarios.ts`) avec matrice contexte × profil parent × situation. UI : 3 selects → étapes numérotées + section "Après la crise". Bouton "Télécharger la carte d'aide PDF" → génération côté client avec `jsPDF` (déjà utilisé dans le projet via `exportCheckinsPdf`).

### 8. Module 4 — Journal privé

- Toggle Libre / Guidé (10 prompts bienveillants TS).
- Liste des entrées (date, extrait), édition, suppression.
- Stocké en clair dans `private_journal_entries` avec RLS owner-only.

### 9. Module 5 — Communauté (pré-modération)

- Page d'accueil : si pas membre → CTA "Rejoindre la communauté" (insert `community_members` + saisie `display_name`).
- 3 onglets : Fils thématiques / Posts libres / Q&R.
- Composer crée un post `status='pending'` ; affichage uniquement des `approved` + ses propres `pending` (badge "en attente").
- Bouton signaler → `community_reports`.
- Page admin `/admin/communaute-moderation` : liste pending + reports, actions approve/reject/hide.
- Notifications réponses : MVP = badge "X nouvelles réponses à vos posts" calculé au chargement (pas de push v1).

### 10. Tests & vérifs

- `bunx vitest run` pour s'assurer que les tests existants passent (nav modifiée).
- Vérification visuelle preview sur les routes clés.

### Détails techniques

- Toutes les pages utilisent `PageTransition` + sont ajoutées au `BottomNav` filter.
- Composant partagé `LiesSectionShell` pour header vert/retour cohérent.
- Pas de modification des fonctions edge existantes.
- Pas de nouveau secret requis (LOVABLE_API_KEY déjà en place pour images, mais on génère côté agent dans `src/assets/`, pas runtime).
- i18n : nouvelles clés `lies.*` ajoutées dans `fr.json` uniquement v1 (les autres langues hériteront du fr en fallback existant).

### Hors-scope v1 (à itérer ensuite)

- Notifications push réelles pour réponses communauté.
- Recherche / filtres dans les fils.
- Édition des posts approuvés.
- Versions multilingues complètes des contenus LSF/troubles/crise.
- Modération automatisée (mots-clés).

---

**Volume estimé** : ~25 fichiers créés, 1 migration, ~25 illustrations IA, ~3000 lignes ajoutées. C'est un gros build mais cohérent. Je le ferai en une passe puis on itèrera module par module sur le contenu/finition.
