# Éclosia — Personnalisation par besoins (audit + plan)

## A. Audit de l'existant (à réutiliser)

- **Accueil actuel** (`/onboarding`, 5 étapes) : rôle, formule d'appel, enfants, défis. Déjà enregistré sur le profil du compte (`caregiver_role`, `address_style`, `challenges`, `onboarding_completed_at`). On le garde et on l'enrichit, sans en créer un second.
- **Petite fenêtre de départ** (`ParentTypeOnboarding`) : profil Maman + matin type. Gardée telle quelle.
- **Navigation du bas** : 5 onglets fixes — Aujourd'hui · Moi · [+] · Famille · Autonomie · Plus. Business et Santé ne sont que dans Plus.
- **Plus** : liste de cartes (Recherche, Business, Organisation, Budget, Coffre, Santé, Ressources, Paramètres, Support).
- **PULSE** : état GO/Moyen/Saturé/KO du jour (`pulse_daily_states`) + « une prochaine action » (`useNextAction`, sources tâche, rdv, famille, business, habitude).
- **Vider ma tête** (`/pulse/vider-ma-tete`) : classe chaque phrase par mascotte, mais crée toujours une tâche.
- **Isolation** : toutes les tables sont protégées par compte (validée lors des tests précédents).

## B. Données nécessaires

Pas de nouvelle table : on ajoute des colonnes au profil existant (déjà isolé par compte, règles d'accès inchangées) :
- `active_spaces` (liste) — espaces visibles
- `preferred_needs`, `main_difficulties` (réutilise `challenges`), `organization_goal` (listes)
- `personalization_version` (nombre) et `personalization_prefs` (réserve évolutive)
- `onboarding_completed` = `onboarding_completed_at` déjà existant
- `current_energy_state` = enregistré directement dans l'état PULSE du jour (pas de doublon)

**Comptes existants** : `active_spaces` vide = « tout visible comme aujourd'hui ». Rien ne change pour eux tant qu'ils ne personnalisent pas.

## C. Ce qui change à l'écran

1. **Accueil des nouveaux comptes** : écran « Bienvenue dans Éclosia 🌸 / On ne va pas tout te montrer. Juste ce dont tu as besoin. » puis 4 questions, une par écran (ce qui prend de la place, ce qui pèse, l'objectif, l'état du jour avec couleur + texte + symbole). Les étapes rôle / appel / enfant restent ensuite, facultatives.
2. **Calcul des espaces** : Famille → Famille ; Santé → Santé ; Organisation/maison/papiers → Organisation ; organisation perso → Moi ; routines → Autonomie ; travail → Business. « Un peu de tout » n'active pas tout : les questions suivantes affinent. Aujourd'hui et Plus toujours visibles.
3. **Navigation dynamique** : Aujourd'hui · (jusqu'à 3 espaces actifs) · Plus, avec le « + » central conservé, mêmes dimensions et même alignement. Si un 4e espace est actif, il passe dans Plus en tête.
4. **Bandeau pour les comptes existants** sur Aujourd'hui : « Personnalise ton Éclosia » avec « Plus tard » (mémorisé, ne revient pas).
5. **Page « Personnaliser mon Éclosia »** (depuis Plus et Profil) : interrupteurs par espace, confirmation « Masquer cet espace ? Tes données seront conservées… » (Masquer / Annuler), section « Ajouter un espace », boutons « Modifier mes besoins » et « Refaire mes questions ».
6. **Page « Tous mes espaces »** : chaque espace avec mascotte, phrase courte, « ✓ Actif » ou « + Ajouter », et un accès direct même s'il est masqué.
7. **Plus** : cartes des espaces masqués regroupées sous « Tous mes espaces » ; toutes les fonctions restent accessibles.

## D. Aujourd'hui (P1)

- KO : « On fait simple aujourd'hui. ❤️ » + une seule action.
- Saturé : bloc réduit, sans cartes secondaires.
- GO : action principale + 2 autres.
- Les relances Business n'apparaissent que si Business est actif (les données restent).

## E. Vider ma tête (P1)

- Si une phrase cite le prénom d'un contact Business existant (« relancer Camille »), proposition « Business → Camille → Relance » : on fixe la date de relance du contact au lieu de créer une tâche.
- « rendez-vous / médecin » → proposition « Rendez-vous / Santé ».
- L'utilisatrice peut toujours choisir « garder en tâche ».

## F. Risques de régression et parades

- Navigation : un seul composant modifié, testé à 390 px avec 1, 3 et 5 espaces.
- Comptes existants : valeur vide = expérience actuelle, aucun blocage.
- Données : masquer ne touche jamais aux tables métier (vérifié par test avant/après).
- Fiche d'urgence, notifications, paiement, sécurité : non touchés.

## G. Étapes

1. P0 : colonnes du profil + petite bibliothèque des espaces (lecture/écriture, cache local).
2. P0 : accueil en 4 questions + calcul des espaces.
3. P0 : navigation dynamique + bandeau « Plus tard ».
4. P0 : Personnaliser mon Éclosia + Tous mes espaces + entrée dans Plus/Profil.
5. P1 : Aujourd'hui selon l'état et les espaces.
6. P1 : Vider ma tête relié aux contacts Business et à la Santé.
7. Tests : nouveau compte de test complet, compte existant inchangé, masquer puis réactiver Business avec données intactes, isolation entre deux comptes, captures mobile.

## Détails techniques

- Migration : `ALTER TABLE profiles ADD COLUMN active_spaces text[] NOT NULL DEFAULT '{}'`, `preferred_needs text[]`, `organization_goal text[]`, `personalization_version int DEFAULT 0`, `personalization_prefs jsonb DEFAULT '{}'`. RLS existante de `profiles` conservée.
- `src/lib/spaces.ts` : catalogue (id, libellé, mascotte, route, description), `computeSpaces(answers)`, hook `useActiveSpaces()` avec émission d'un événement pour mise à jour immédiate de la navigation.
- Fichiers touchés : `Onboarding.tsx`, `lib/onboarding.ts`, `BottomNav.tsx`, `hubs/Plus.tsx`, `Profil.tsx`, `PulseBlock.tsx`, `useNextAction.ts`, `pulse/ViderMaTete.tsx` ; nouvelles pages `/mon-eclosia` et `/mes-espaces`.
