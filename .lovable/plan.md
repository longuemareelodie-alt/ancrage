# Évolution majeure d'Éclosia — en partant de l'existant

## Ce qui existe déjà (on ne le refait pas)
- **Aujourd'hui** : GO / Moyen / Saturé / KO, UNE prochaine action, « Je m'y mets », ✓, « Plus tard » mémorisé, dictée, écoute à voix haute.
- **Vider ma tête** : tri en vrac, confirmation avant enregistrement dans tes tâches, agenda et notes.
- **Moi** : humeur, journal, objectifs, apaisement, chemin/évolution.
- **Famille** : une fiche par enfant avec « Son jour », tâches, notes, santé, rendez-vous, partage avec un proche.
- **Autonomie** : Studio de supports avec export PDF.
- **Organisation** : tâches, agenda, courses, budget.
- **Mascottes** : animations douces, « Ton équipe » cliquable, réglage « réduire les animations » respecté.
- **Barre du bas** : 6 colonnes égales, + centré.

## Ce qu'on ajoute, par lots (dans ton ordre de priorité)

**Lot 1 — Aujourd'hui (P0)**
- Le bouton « Plus tard » devient « Reporter ↩ ».
- En KO : deux accès « M'apaiser » et « Vider ma tête », rien d'autre.
- En GO : la prochaine action reste en tête, puis un lien discret « Voir 2 autres » (jamais en Saturé ni en KO).
- Vider ma tête reconnaît aussi les phrases Business (« relancer Camille demain ») et propose de les classer en Business.

**Lot 2 — Moi (P1)**
- « De quoi ai-je besoin maintenant ? » : 5 raccourcis (M'apaiser, Vider ma tête, Choisir une priorité, Créer un support, Écrire).
- **Habitudes** : nouvelle grille de la semaine à cocher (eau, traitement, temps pour moi…). Un jour vide reste neutre, sans rouge et sans compteur de série.
- **Objectifs** : on ajoute le pourquoi, 3 à 5 étapes et une progression douce à l'écran objectifs actuel.
- Une habitude du jour pas encore cochée peut devenir la prochaine action, mais seulement en GO ou Moyen.

**Lot 3 — Business (P2), un nouvel espace privé**
- Accès : Plus → Business. La barre du bas ne change pas. L'Abeille devient la mascotte Argent / Business.
- **Mes contacts** : fiche simple (prénom, nom, Instagram, TikTok, email, source, dernier échange, prochaine action, date de relance, notes), avec modification et suppression.
- **Pipeline** : colonnes, avec deux modèles au choix, « Activité classique » ou « MLM / affiliation ». Sur téléphone, on change l'étape d'un contact en un toucher.
- **Qui dois-je relancer ?** : les relances du jour. Elles remontent dans la prochaine action d'Aujourd'hui.
- **Mes clientes** : statuts Active / À suivre / Ancienne, date de suivi.
- **Mon équipe** : partenaires, avec « À accompagner cette semaine ».
- **Activité** : compteurs du jour et de la semaine calculés à partir de ce que tu as saisi : conversations, relances, ventes, nouveaux contacts, chiffre d'affaires. Aucun objectif chiffré imposé, aucun classement.
- **Calendrier Business** : les relances et suivis sont affichés dans ton agenda existant.
- Garde-fous : pas de message automatique, pas d'envoi en masse, pas de pression.

**Lot 4 — Finitions (P3)**
- Mascottes : apparition fluide, réaction quand on ouvre une section.
- Vérification complète sur iPhone (390 px) de chaque nouvel écran et de la barre du bas.

## Ce qui ne bouge pas
Le paiement, les CGV, les comptes, les données existantes, le design (crème, rose poudré, bleu marine) et la page de vente.

## Détails techniques
- Nouvelles tables avec RLS limitées à leur propriétaire, et GRANT à `authenticated` : `habits`, `habit_checks` (unique habit_id + day), `business_contacts` (kind: prospect | cliente | partenaire, stage, pipeline_model, next_action, followup_date, champs réseaux), `business_interactions` (type: conversation | relance | vente | presentation, amount_cents, date) pour les statistiques d'Activité.
- `personal_goals` : ajout des colonnes nullables `why` et `steps jsonb`.
- `useNextAction` : nouvelles sources de candidats, `business` (followup_date ≤ aujourd'hui, domaine argent) et `habitude` (GO et Moyen uniquement). Les filtres d'effort par état ne changent pas.
- `brainDump` : règles Business ajoutées (relancer, story, lien, répondre), et création d'une relance sur un contact reconnu, après confirmation.
- Routes `/business`, `/business/contacts`, `/business/pipeline`, `/business/relances`, `/business/clientes`, `/business/equipe`, `/business/activite`, construites sur `HubShell`. Entrée ajoutée dans le menu Plus.
- Chaque lot : typecheck, build, test Playwright à 390 px avec une vraie session.
