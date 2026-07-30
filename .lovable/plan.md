# Eclosia — Refonte complète de l'expérience

## 1. Diagnostic de l'existant

L'app compte aujourd'hui ~70 routes accumulées par couches successives. Trois problèmes structurels :

**Doublons réels identifiés dans le code**
- `/ancrage/*` (layout + palette + nav dédiés) duplique `/dashboard`, `/famille`, `/coffre`, `/profil`. Deux applications cohabitent.
- `/signes` et `/lies-autrement/signes-nouveaux` pointent sur le même composant.
- `/emotions`, `/checkin`, `/historique`, `/comprendre`, `/avancer`, `/parcours`, `/calme` = 7 routes pour un seul geste : « je note comment je vais et je reçois de l'aide ».
- `/sante/profils-familiaux` et `/famille` gèrent tous les deux des profils de personnes.
- `/sante/ressources` et `/lies-autrement/ressources` = deux annuaires de ressources.
- `/portrait-transformation`, `/frise-evolution`, `/livre-reconstruction`, `/statistiques` = 4 vues rétrospectives séparées.
- Pages marketing internes exposées à l'utilisateur connecté : `/aller-plus-loin`, `/comparaison`, `/pack-sante-familial`, `/charge-mentale`, `/quiz-resultat`.

**Problème de modèle mental**
La nav actuelle est organisée par *objets* (émotions, budget, coffre) et non par *besoins*. L'utilisatrice doit traduire son besoin en nom de module.

**Problème d'entrée quotidienne**
Rien ne donne une raison de revenir demain. Le dashboard est un annuaire de widgets, pas un compagnon.

---

## 2. Nouvelle architecture — 5 hubs + 1 geste

Principe : **5 onglets maximum**, chacun répondant à un besoin exprimable en une phrase par un parent épuisé. La communauté et l'affiliation ne sont pas des onglets (usage occasionnel) mais vivent dans le hub Moi et le profil.

```text
                    ┌─────────────────────┐
                    │      AUJOURD'HUI    │  ← écran d'ouverture
                    │  (Accueil vivant)   │
                    └──────────┬──────────┘
                               │
   ┌──────────┬────────────┬───┴────┬────────────┬──────────┐
   │   Moi    │  Famille   │Autonomie│ Organiser  │Ressources│
   └──────────┴────────────┴─────────┴────────────┴──────────┘
                               │
                        (bouton central +)
                     geste rapide contextuel
```

### Navigation principale (bottom bar, 5 items + action centrale)

| Onglet | Question à laquelle il répond | Route |
|---|---|---|
| Aujourd'hui | « Qu'est-ce qui compte maintenant ? » | `/aujourdhui` |
| Moi | « Comment je vais, moi ? » | `/moi` |
| Famille | « Où sont les infos de mes enfants ? » | `/famille` |
| Autonomie | « Comment je l'aide à faire seul ? » | `/autonomie` |
| Plus | Organisation + Ressources + Communauté + Réglages | `/plus` |

Le bouton central **+** (flottant, au-dessus de la barre) ouvre une feuille de 4 gestes rapides : *Noter une émotion · Ajouter un rendez-vous · Déposer un document · Écrire au journal*. C'est la réponse directe à « limiter le nombre de clics » : les 4 actions les plus fréquentes sont à 2 taps depuis n'importe quel écran.

---

## 3. Sitemap complet

```text
PUBLIC
  /                        Landing (conservée telle quelle)
  /devenir-ambassadrice
  /auth  /reset-password  /set-password  /activation-compte
  /paywall
  /cgv  /confidentialite  /mentions-legales
  /fiche-urgence/:token    partage public fiche médicale
  /unsubscribe

APP (connecté + payant)
  /aujourdhui                        ← nouvel écran racine
  ├─ (redirection depuis /dashboard)

  /moi
  ├─ /moi/emotions                   fusionne emotions + checkin + emotion/:id
  ├─ /moi/journal                    fusionne journal + comment-tu-te-sens (adulte)
  ├─ /moi/apaisement                 fusionne calme + urgence + comprendre + avancer
  └─ /moi/chemin                     fusionne frise + livre + portrait + statistiques + historique
       ?vue=frise|livre|portraits|chiffres

  /famille
  ├─ /famille/:profileId             fiche unifiée d'un membre
  │    ?onglet=infos|sante|documents|ordonnances|urgence
  ├─ /famille/contacts               nouveau : médecins, école, aidants
  └─ /famille/coffre                 coffre-fort foyer (ex /coffre)

  /autonomie
  ├─ /autonomie/routines
  ├─ /autonomie/emploi-du-temps      pictogrammes visuels
  ├─ /autonomie/recompenses
  ├─ /autonomie/histoires-sociales
  ├─ /autonomie/checklists
  ├─ /autonomie/crise                ex /lies-autrement/crise
  ├─ /autonomie/emotions-enfant      ex /comment-tu-te-sens (version enfant)
  └─ /autonomie/studio               génération de supports PDF (+ emplacement IA)

  /organisation
  ├─ /organisation/calendrier        fusionne organisation + sante/rendez-vous
  ├─ /organisation/taches
  ├─ /organisation/rappels           médicaments + factures + renouvellements
  └─ /organisation/budget

  /ressources
  ├─ /ressources/neuroatypie         ex lies-autrement/ressources (troubles)
  ├─ /ressources/lsf                 + /lsf/:theme + flashcards
  ├─ /ressources/activites
  └─ /ressources/annuaire            fusionne sante/ressources (numéros utiles FR)

  /communaute
  ├─ /communaute/echanges            ex lies-autrement/communaute
  └─ /communaute/defis               nouveau

  /profil
  ├─ /profil/reglages                fusionne parametres + profil/style
  ├─ /profil/impact                  ambassadrice (ex /mon-impact)
  └─ /profil/impact/contrat

ADMIN  /admin/* (inchangé)
```

### Redirections à mettre en place (aucun lien cassé, aucun signet perdu)

`/dashboard`→`/aujourdhui` · `/emotions`,`/checkin`→`/moi/emotions` · `/historique`,`/statistiques`,`/frise-evolution`,`/livre-reconstruction`,`/portrait-transformation`→`/moi/chemin` · `/calme`,`/urgence`,`/comprendre`,`/avancer`,`/parcours`→`/moi/apaisement` · `/coffre`→`/famille/coffre` · `/sante/*`→`/famille/:id?onglet=…` · `/lies-autrement/*`→ hub correspondant · `/ancrage/*`→ équivalent app principale · `/signes`→`/ressources/lsf` · `/budget`→`/organisation/budget` · `/mon-impact`→`/profil/impact`

---

## 4. Écrans supprimés / fusionnés

**À supprimer purement**
- Tout l'espace `/ancrage/*` (6 écrans) — doublon complet avec sa propre palette, source d'incohérence visuelle.
- `/signes` (alias redondant).
- `/aller-plus-loin`, `/comparaison`, `/pack-sante-familial`, `/charge-mentale` en tant que routes app — contenu marketing, à replier dans la landing.
- `/post-flow`, `/danger` — remplacés par l'écran d'apaisement unifié.

**À fusionner**
| Avant | Après |
|---|---|
| emotions + emotion/:x + checkin | `/moi/emotions` (une page, historique inline) |
| calme + urgence + comprendre + avancer + parcours + danger | `/moi/apaisement` |
| frise + livre + portrait + statistiques + historique | `/moi/chemin` (4 vues, un sélecteur) |
| famille + sante/profils-familiaux + carnet + documents + ordonnances + fiche-medicale | `/famille/:id` (fiche à onglets) |
| organisation + sante/rendez-vous + sante/medicaments | `/organisation/calendrier` + `/organisation/rappels` |
| sante/ressources + lies-autrement/ressources | `/ressources/annuaire` + `/ressources/neuroatypie` |
| parametres + profil + profil/style | `/profil` |

**Bilan : ~70 routes → ~34 routes**, dont 5 hubs.

---

## 5. Wireframes

### Aujourd'hui — l'écran qui donne envie de revenir
```text
┌──────────────────────────────────────┐
│  Bonjour Marie                   ⚙   │  ← salutation selon l'heure
│  Jeudi 30 juillet                    │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Comment tu te sens ?          │  │  ← carte respirante, 1 tap
│  │   😌   🙂   😐   😞   😩       │  │     Le seul geste demandé.
│  └────────────────────────────────┘  │
│                                      │
│  À VENIR AUJOURD'HUI                 │
│  ● 14h30  Orthophoniste — Léa       │
│  ● 18h00  Médicament du soir        │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │ Routine  │  │ Journal  │         │  ← 2 raccourcis appris
│  │ du soir  │  │ 3 j. 🔥  │         │     du comportement réel
│  └──────────┘  └──────────┘         │
│                                      │
│  « Tu n'as pas à tout tenir. »       │  ← respiration éditoriale
│                                      │
├──────────────────────────────────────┤
│ 🏠   ❤️    ⊕    👨‍👩‍👧   ⋯          │
└──────────────────────────────────────┘
```
Règle : maximum 5 blocs, jamais de scroll infini. Si rien n'est prévu, l'écran le dit avec douceur (« Rien de prévu aujourd'hui. Profite. ») plutôt que d'afficher des cases vides.

### Hub type (Moi / Famille / Autonomie)
```text
┌──────────────────────────────────────┐
│  Moi                                 │  ← titre large, serif
│  Ton espace, à ton rythme.           │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ❤️  Mes émotions               │  │
│  │    Dernière note : hier         │ →│
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ✍️  Mon journal                │  │
│  │    12 entrées                   │ →│
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🌙  M'apaiser maintenant       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🕰️  Mon chemin                 │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```
Chaque carte affiche **une donnée vivante** (dernière activité, compteur) — c'est ce qui distingue un hub premium d'un menu.

### Fiche membre — `/famille/:id`
```text
┌──────────────────────────────────────┐
│  ←   Léa, 7 ans                  ⋯   │
│      TSA · TDAH                      │
│  ┌────┬──────┬───────────┬────────┐  │
│  │Infos│Santé│ Documents │Urgence│  │  ← onglets, pas de re-navigation
│  └────┴──────┴───────────┴────────┘  │
│                                      │
│  PROCHAIN RENDEZ-VOUS                │
│  14h30 · Orthophoniste               │
│                                      │
│  TRAITEMENTS EN COURS            (2) │
│  ...                                 │
│  ORDONNANCES                     (5) │
│  ...                                 │
└──────────────────────────────────────┘
```
Tout ce qui concerne une personne est **à un seul endroit**. Aujourd'hui c'est éclaté sur 5 routes.

### Studio d'autonomie
```text
┌──────────────────────────────────────┐
│  Créer un support                    │
│  Pour : [ Léa ▾ ]                    │
│                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Routine │ │Emploi  │ │Histoire│   │
│  │        │ │du temps│ │sociale │   │
│  └────────┘ └────────┘ └────────┘   │
│  ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Récomp. │ │Check-  │ │  ✨    │   │
│  │        │ │list    │ │ Aide IA│   │  ← emplacement réservé
│  └────────┘ └────────┘ └────────┘   │
│                                      │
│  MES SUPPORTS                        │
│  📄 Routine du matin — Léa      ⤓   │
└──────────────────────────────────────┘
```
Emplacement IA prévu dès maintenant (carte désactivée « Bientôt »), sans dépendance technique.

---

## 6. Parcours utilisateur idéal

**Jour 1 (onboarding, 90 secondes)** — Prénom → « Qui est concerné ? » (création du 1er profil enfant + trouble) → « Qu'est-ce qui te pèse le plus en ce moment ? » (3 choix) → l'app pré-remplit Aujourd'hui avec 2 actions pertinentes. Aucun tour guidé de 12 étapes.

**Jour type (30 secondes)** — Ouvre → tape une humeur → voit ses 2 rendez-vous → referme. C'est tout, et c'est suffisant pour créer l'habitude.

**Moment de crise (3 secondes)** — Un accès permanent à « M'apaiser » depuis le bouton +, disponible sur tous les écrans. Aucune recherche.

**Semaine 2** — Une notification douce hebdomadaire : « Ta semaine en 3 lignes » → renvoie vers `/moi/chemin`.

---

## 7. Système visuel unifié

- **Palette** : fond ivoire chaud, sauge comme couleur d'accent unique, encre sombre adoucie. Une seule teinte d'accent par hub (Moi = blush, Famille = sauge, Autonomie = sable, Organisation = ciel, Ressources = neutre) — appliquée uniquement à l'icône et aux états actifs, jamais aux fonds pleins.
- **Espace** : padding de section 24px minimum, respiration verticale 32px entre blocs. Aucun écran dense.
- **Cartes** : rayon 20px, bordure 1px très claire, ombre quasi nulle, élévation au tap uniquement.
- **Typographie** : serif pour les titres de hub (voix humaine), sans-serif pour tout le reste. 3 tailles seulement.
- **Icônes** : Lucide, trait 1.75, une seule famille — suppression des emojis en navigation (ils cassent la cohérence premium), conservés seulement dans les contenus destinés aux enfants.
- **Animations** : fondu + translation 8px, 350ms, courbe douce. Jamais de rebond. Respect de `prefers-reduced-motion`.
- **Tous les hubs partagent un composant `HubShell` unique** — c'est ce qui garantit l'uniformité des écrans sur la durée.

---

## 8. Améliorations UX supplémentaires

1. **États vides rédigés** : chaque écran vide dit quoi faire en une phrase chaleureuse.
2. **Reprise contextuelle** : l'app se souvient du dernier écran et le propose dans Aujourd'hui.
3. **Recherche unique** (Plus → 🔍) : cherche dans documents, profils, journal, ressources. Un seul champ pour tout.
4. **Aucun paywall dans l'app** : l'accès étant à vie, les cadenas actuels dans `/sante` disparaissent une fois payant.
5. **Mode hors-ligne** pour la fiche d'urgence et les routines (déjà un service worker en place).
6. **Notifications** : maximum 1 par jour, jamais culpabilisantes.

---

## 9. Évolutions futures que l'architecture accueille sans refonte

- Assistant IA : s'insère comme 6e carte du Studio + bouton dans le journal.
- Partage co-parent / AESH : onglet supplémentaire sur la fiche membre.
- Suivi scolaire (PPS, GEVA-Sco) : sous-section de Famille.
- Défis communautaires : déjà prévu dans `/communaute/defis`.
- Version enfant (tablette) : `/autonomie` en plein écran, sans nav parent.

---

## 10. Plan de mise en œuvre (technique)

**Étape 1 — Fondations** : créer `HubShell`, `HubCard`, `AppShell` (nav 5 onglets + bouton +) ; ajouter les tokens de couleur par hub dans `index.css`.

**Étape 2 — Nouvelle nav & Aujourd'hui** : remplacer `BottomNav`, créer `/aujourdhui` à partir du contenu de `Dashboard.tsx`.

**Étape 3 — Hubs** : créer les 6 pages hub, qui pointent d'abord vers les pages existantes (aucune régression fonctionnelle).

**Étape 4 — Fusions** : `/moi/chemin` à onglets, `/famille/:id` à onglets, `/moi/apaisement`, `/moi/emotions`.

**Étape 5 — Nettoyage** : redirections dans `App.tsx`, suppression d'`/ancrage/*` et des alias, mise à jour du sitemap.

**Étape 6 — Autonomie** : Studio + routines + emplois du temps + récompenses (le seul vrai nouveau développement).

Chaque étape est livrable indépendamment et laisse l'app fonctionnelle.

---

## Question avant de démarrer

L'étape 6 (Studio d'autonomie, routines, emplois du temps visuels, histoires sociales, récompenses, check-lists) représente un module entièrement nouveau avec sa propre base de données. Le reste (étapes 1 à 5) est une réorganisation de l'existant.

Dis-moi si je commence par les étapes 1 à 5 (refonte de l'expérience sur l'existant, résultat visible immédiatement) ou si tu veux que le Studio d'autonomie soit inclus dans la même livraison.
