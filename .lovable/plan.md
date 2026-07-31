# Eclosia V2 — Architecture produit pour les 10 prochaines années

## 1. Critique honnête de l'existant

**Ce qui est redondant (à fusionner)**
- 8 routes pour un seul geste émotionnel : `/emotions`, `/emotion/:x`, `/checkin`, `/historique`, `/calme`, `/comprendre`, `/avancer`, `/parcours`. Une utilisatrice épuisée ne choisit pas entre « Comprendre » et « Avancer ».
- 4 vues rétrospectives séparées : `/portrait-transformation`, `/frise-evolution`, `/livre-reconstruction`, `/statistiques`. Même donnée, 4 lectures.
- Deux annuaires de ressources : `/sante/ressources` et `/lies-autrement/ressources`.
- Deux gestions de personnes : `/famille` et `/sante/profils-familiaux`.
- Deux entrées « urgence » : `/urgence` et `/danger`.
- `/signes` = alias de `/lies-autrement/signes-nouveaux`.

**Ce qui est mal placé**
- Tout l'espace `/lies-autrement/*` : c'est un ancien produit devenu préfixe technique. Le nom ne dit rien à personne. Son journal appartient à Moi, sa LSF/activités aux Ressources, sa crise à Autonomie, sa communauté à Plus.
- Pages commerciales accessibles à une cliente déjà payante : `/aller-plus-loin`, `/comparaison`, `/pack-sante-familial`, `/charge-mentale`, `/quiz-resultat`. Vendre à quelqu'un qui a payé érode la confiance.
- `/profil`, `/profil/style`, `/parametres` : trois écrans pour un seul.

**Ce qui est inutile**
- `/post-flow`, `/danger`, `/parcours` : écrans de transition sans contenu propre.
- Le paywall interne dans `/sante` alors que l'accès est à vie.
- Les emojis dans la navigation : ils cassent la perception premium.

**Ce qui manque (et qui compte vraiment)**
- Un enfant n'est pas un « profil de santé » : ni préférences, ni sensibilités, ni centres d'intérêt, ni contacts (école, orthophoniste, AESH). C'est le manque le plus grave : Eclosia gère des dossiers, pas des enfants.
- Aucun support visuel : routines, emplois du temps, histoires sociales, récompenses. C'est le cœur du besoin neuroatypique quotidien.
- Aucune raison de revenir demain : l'accueil est un annuaire de widgets.
- Aucune notion de professionnel ni de second parent.

---

## 2. Le principe fondateur de la V2

Une seule règle d'architecture : **un écran = une intention.**

- **Aujourd'hui** = ce dont j'ai besoin maintenant
- **Moi** = comment je vais, moi
- **Famille** = tout sur une personne, au même endroit
- **Autonomie** = ce que je crée pour mon enfant
- **Plus** = ce que j'ouvre une fois par mois

Le bouton **+** porte toute la création. Conséquence directe : aucun hub n'a besoin de bouton « ajouter », donc aucun écran n'est encombré.

```text
                    ┌──────────────────┐
                    │    AUJOURD'HUI   │  cockpit adaptatif
                    └────────┬─────────┘
      ┌───────┬──────────┬───┴───┬───────────┬────────┐
      │  Moi  │ Famille  │   +   │ Autonomie │  Plus  │
      └───────┴──────────┴───────┴───────────┴────────┘
```

---

## 3. Sitemap V2

```text
PUBLIC
  /                       landing
  /devenir-ambassadrice
  /auth /reset-password /set-password /activation-compte
  /paywall /payment-*
  /cgv /confidentialite /mentions-legales
  /fiche-urgence/:token   /unsubscribe

APP
  /aujourdhui                       cockpit

  /moi                              hub, progression émotionnelle en tête
  ├─ /moi/emotions                  note + historique + conseil (fusionne 4 routes)
  ├─ /moi/journal                   journal + prompts
  ├─ /moi/apaisement                exercices + mode survie + urgence
  ├─ /moi/chemin?vue=frise|portraits|livre|chiffres
  └─ /moi/objectifs                 nouveau : objectifs + réussites

  /famille                          sélecteur d'enfants (avatars)
  ├─ /famille/:childId?onglet=apercu|profil|sante|documents|contacts|supports|historique
  └─ /famille/coffre                coffre-fort du foyer

  /autonomie                        Studio
  ├─ /autonomie/creer/:type         routine|checklist|emploi-du-temps|histoire|recompenses|cartes
  ├─ /autonomie/support/:id         édition + aperçu imprimable
  ├─ /autonomie/bibliotheque        modèles prêts à l'emploi
  └─ /autonomie/crise               protocole de crise enfant

  /plus
  ├─ /plus/organisation             calendrier + tâches + rappels
  ├─ /plus/budget
  ├─ /plus/courses
  ├─ /plus/sante                    vue transversale (tous les membres)
  ├─ /plus/ressources               neuroatypie · LSF · activités · annuaire
  ├─ /plus/communaute
  ├─ /plus/profil                   profil + réglages + style + support
  └─ /plus/impact                   ambassadrice

ADMIN /admin/*
```

**Bilan : ~70 routes → 28.** Toutes les anciennes URL sont redirigées, aucun signet perdu.

---

## 4. Wireframes

### Aujourd'hui — cockpit adaptatif
```text
┌────────────────────────────────────┐
│ Bonjour Marie              ⚙       │
│ Vendredi 31 juillet                │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Comment tu te sens ?           │ │ 1 tap, le seul geste demandé
│ │  ○   ○   ○   ○   ○             │ │
│ └────────────────────────────────┘ │
│                                    │
│ MAINTENANT                         │
│ 14h30  Orthophoniste · Léa         │ n'apparaît que si existe
│ 18h00  Traitement du soir          │
│                                    │
│ ┌──────────────┐ ┌──────────────┐  │
│ │ Reprendre    │ │ Respirer     │  │ 2 cartes max, choisies
│ │ Routine soir │ │ 3 min        │  │ par le contexte
│ └──────────────┘ └──────────────┘  │
│                                    │
│ Cette semaine  ▓▓▓▓▓░░  5/7 jours  │
│                                    │
│ « Tu n'as pas à tout tenir. »      │
└────────────────────────────────────┘
```
Justification : jamais plus de 5 blocs, jamais de bloc vide. Les 15 informations possibles vivent dans un moteur de priorité qui n'en affiche que 4 ou 5 — ce qui est urgent, en retard, ou en cours. Un cockpit qui affiche tout n'est plus un cockpit.

### Famille — sélecteur puis fiche unique
```text
┌────────────────────────────────────┐        ┌────────────────────────────────────┐
│ Ma famille                         │        │ ←  Léa, 7 ans            ⋯         │
│                                    │        │    TSA · TDAH                      │
│  (◍)    (◍)    (◍)    ⊕            │  →     │ Aperçu Profil Santé Docs Contacts  │
│  Léa   Tom   Maman  Ajouter        │        │ ─────                              │
│                                    │        │ PROCHAIN RDV   14h30 Orthophoniste │
│ ─ Léa ──────────────────────────── │        │ TRAITEMENTS (2)                    │
│ Prochain RDV · 2 traitements       │        │ SENSIBILITÉS  bruit, lumière       │
│ Routine du soir en cours           │        │ CE QUI L'APAISE  eau, comptage     │
└────────────────────────────────────┘        │ SUPPORTS (3)   routine, EDT        │
                                              └────────────────────────────────────┘
```
Justification : aujourd'hui les infos d'un enfant sont éclatées sur 5 routes. Un parent pense « Léa », pas « ordonnances ». Le bandeau d'avatars rend le passage d'un enfant à l'autre instantané.

### Autonomie — Studio
```text
┌────────────────────────────────────┐
│ Studio                             │
│ Pour  [ Léa ▾ ]                    │
│                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │Routine││Check-││Emploi│          │
│ │      ││list  ││du tps│           │
│ └──────┘ └──────┘ └──────┘         │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │Hist. ││Récom-││Cartes│           │
│ │soc.  ││penses││visu. │           │
│ └──────┘ └──────┘ └──────┘         │
│ ┌────────────────────────────────┐ │
│ │ ✦ Créer avec l'assistant       │ │ emplacement IA, prêt
│ │   Bientôt                      │ │
│ └────────────────────────────────┘ │
│ MES SUPPORTS                       │
│ Routine du matin · Léa      ⤓ 🖨   │
└────────────────────────────────────┘
```

### Bouton + — feuille contextuelle
```text
┌────────────────────────────────────┐
│ Que souhaites-tu faire ?           │
│ ── Suggéré maintenant ──           │  soir → routine du soir en tête
│ ○ Noter une émotion                │  contexte /famille/:id → l'enfant
│ ○ Reprendre la routine du soir     │  est présélectionné
│ ── Créer ──                        │
│ ○ Rendez-vous  ○ Document          │
│ ○ Routine      ○ Checklist         │
│ ○ Histoire sociale ○ Récompenses   │
└────────────────────────────────────┘
```
Justification : 10 actions listées à plat = une nouvelle charge cognitive. Deux suggestions contextuelles en tête, le reste replié.

---

## 5. Parcours utilisateur idéal

- **Jour 1 (90 s)** — prénom → premier enfant (prénom, âge, diagnostic optionnel) → « qu'est-ce qui pèse le plus ? » → Aujourd'hui déjà pré-rempli avec 2 actions utiles. Pas de tour guidé.
- **Jour type (30 s)** — ouvre, tape une humeur, voit ses 2 échéances, referme.
- **Crise (3 s)** — Apaisement accessible depuis le + sur tous les écrans.
- **Dimanche (5 min)** — prépare la semaine : un support imprimé au Studio.
- **Semaine 4** — « Ta transformation en 3 lignes » → `/moi/chemin`.

---

## 6. Système visuel

Fond ivoire chaud, encre adoucie, sauge en accent unique. Une teinte par espace, appliquée à l'icône et aux états actifs seulement. Cartes rayon 20px, bordure 1px, ombre quasi nulle. Serif pour les titres d'espace, sans-serif ailleurs, 3 tailles. Icônes Lucide trait 1.75, zéro emoji en navigation. Transitions fondu + 8px, 350ms, `prefers-reduced-motion` respecté. Tous les hubs passent par `HubShell` — c'est ce qui garantit l'uniformité dans le temps.

---

## 7. Ce que l'architecture accueille sans refonte

| Évolution | Point d'entrée déjà prévu |
|---|---|
| IA | carte Studio + assistant journal, sans nouvelle route |
| Professionnels | rôle `professional` + onglet Partage sur `/famille/:id` |
| Second parent | foyer partagé, la fiche enfant est déjà l'unité de partage |
| Suivi scolaire (PPS, GEVA-Sco) | onglet supplémentaire sur la fiche enfant |
| Nouveaux modules | entrée dans `/plus`, jamais dans la barre |

---

## 8. Mise en œuvre (technique)

1. **Fondations** — moteur de priorité `useTodayFeed`, `+` contextuel, tokens par espace.
2. **Aujourd'hui** — cockpit adaptatif à la place du dashboard-annuaire.
3. **Famille** — table `child_profiles` enrichie (préférences, sensibilités, apaisants, intérêts) + `child_contacts` ; fiche à onglets ; sélecteur d'avatars.
4. **Moi** — fusion emotions/checkin/historique/comprendre/avancer ; `/moi/objectifs`.
5. **Autonomie** — tables `supports`, `support_items`, `reward_boards` ; 6 créateurs + aperçu imprimable + bibliothèque de modèles.
6. **Plus** — regroupement organisation/budget/courses/santé/ressources/communauté/profil.
7. **Nettoyage** — 28 routes, redirections exhaustives, suppression de `/lies-autrement/*` et des pages commerciales internes.

Chaque étape est livrable seule et laisse l'app fonctionnelle.

---

## Décision à prendre

Les étapes 1, 2, 4, 6, 7 réorganisent l'existant sans nouvelle base de données — visible immédiatement.
Les étapes 3 (fiche enfant enrichie) et 5 (Studio d'Autonomie) créent de nouvelles tables et de vrais nouveaux écrans : c'est le plus gros du travail, et c'est aussi ce qui différenciera Eclosia.

Dis-moi si je livre d'abord la réorganisation (1-2-4-6-7) ou si j'attaque directement Famille + Studio.
