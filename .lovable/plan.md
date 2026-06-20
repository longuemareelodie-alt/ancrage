
# Programme Ambassadrices Eclosia

Une cliente premium devient automatiquement ambassadrice. Elle reçoit un lien unique. Chaque maman qu'elle aide à rejoindre Eclosia est comptée et déclenche une commission, validée 14 jours après le paiement (le temps qu'un remboursement ne soit plus possible).

## Vocabulaire (impact, jamais commercial)

- Pas de "ventes" → **"mamans accompagnées"**
- Pas de "commission" → **"contribution reçue"** (mais on garde "commission" en interne BDD)
- Pas de "niveau / palier commercial" → **"cercle"** : 🌱 Graine · 🌸 Fleur · 💛 Fondatrice
- Pas de "filleule" → **"maman recommandée"**
- Le tableau s'appelle **"Mon Impact"**

## Les trois cercles (acquis à vie, jamais de retour en arrière)

| Cercle | Mamans accompagnées | Part reversée |
|---|---|---|
| 🌱 Graine | 0 à 4 | 20 % |
| 🌸 Fleur | 5 à 14 | 25 % |
| 💛 Fondatrice | 15 et + | 30 % |

Le passage de cercle est automatique dès que le seuil est franchi par une commission **validée** (pas seulement en attente).

## Parcours utilisateur

1. **Activation** : dès qu'une utilisatrice devient premium, son profil reçoit un `referral_code` unique (ex. `ECL-MARIE-7F2A`) et un lien `https://eclosiia.lovable.app/?ref=ECL-MARIE-7F2A`.
2. **Partage** : depuis "Mon Impact", elle copie son lien, partage par WhatsApp / Instagram / mail (boutons de partage natifs).
3. **Attribution** : quand quelqu'un visite avec `?ref=CODE`, on stocke le code en cookie 30 jours + localStorage. Au moment du paiement Mollie, on rattache la commande au code.
4. **Création commission** : webhook Mollie marque la commission `pending`, montant = part du cercle × prix payé.
5. **Validation** : un cron quotidien passe les commissions `pending` de + de 14 jours en `validated` → met à jour le compteur du cercle et déclenche éventuellement un passage de cercle.
6. **Tableau de bord "Mon Impact"** affiche : mamans accompagnées · cercle actuel · part actuelle · total reversé (validé) · en attente · progression vers le prochain cercle.

## Versement automatique — décision à prendre

Tu as choisi "versement automatique". Mollie permet les **payouts** vers ton propre compte, mais **pas vers les comptes des ambassadrices** sans passer par Mollie Connect (offre marchande, KYC par ambassadrice, IBAN vérifié, contrat). C'est lourd à déployer.

Je propose une **approche hybride réaliste** qui reste "automatique" du point de vue de l'ambassadrice :

- L'ambassadrice renseigne son IBAN + nom dans son profil (chiffré côté BDD).
- Dès qu'une commission est validée, elle est ajoutée à son solde "disponible".
- Le 1er de chaque mois, un cron génère automatiquement un **ordre de virement** (CSV SEPA) pour toutes les ambassadrices avec solde ≥ 20 €, te l'envoie par mail, et marque les commissions `paid`. Tu fais l'import dans ta banque (1 clic, format standard SEPA XML).
- Côté ambassadrice c'est invisible : elle voit "versement programmé le X" puis "versé le Y".

Si tu veux **vrai versement 100 % automatique sans toi**, il faut activer Mollie Connect (ou Stripe Connect) : prévoir 2-3 semaines de dev en plus, KYC obligatoire pour chaque ambassadrice, et frais Mollie par transfert. Je peux le faire dans une 2e phase.

**Cette première version livre tout sauf le déclenchement bancaire — je te demanderai confirmation sur l'approche SEPA avant de l'implémenter.**

## Implémentation technique

### Base de données (nouvelles tables)

- `ambassador_profiles` : `user_id` (PK), `referral_code` unique, `current_tier` (graine/fleur/fondatrice), `validated_referrals_count`, `iban_encrypted`, `iban_holder_name`, `joined_at`
- `ambassador_referrals` : `id`, `ambassador_user_id`, `referred_user_id`, `referral_code_used`, `payment_id` (Mollie), `amount_paid_cents`, `commission_rate`, `commission_cents`, `status` (pending/validated/paid/refunded), `validated_at`, `paid_at`, `created_at`
- `ambassador_payouts` : `id`, `ambassador_user_id`, `amount_cents`, `referral_ids` (array), `sepa_batch_id`, `status` (scheduled/sent/failed), `created_at`, `paid_at`

RLS : chaque ambassadrice voit uniquement ses propres lignes. Service role pour webhooks et cron. Admin peut tout voir.

### Fonctions edge (Supabase)

- `create-ambassador-profile` : déclenchée à l'activation premium → génère code unique.
- Modif `mollie-webhook` : si payment metadata contient `ref_code`, crée une ligne `ambassador_referrals` en `pending`.
- `validate-ambassador-referrals` (cron quotidien) : passe en `validated` les `pending` de + de 14 jours, met à jour le compteur et le cercle.
- `generate-monthly-payouts` (cron mensuel, 1er du mois) : crée les `ambassador_payouts`, génère SEPA XML, envoie par mail à l'admin.
- `get-ambassador-dashboard` : retourne toutes les stats agrégées pour "Mon Impact".

### Frontend

- **Capture du `?ref=`** : nouveau hook `useReferralTracking` dans `App.tsx`, lit `searchParams`, stocke en cookie 30j.
- **Envoi au paiement** : modif `useMolliePayment` pour passer le code en metadata Mollie.
- **Page `/mon-impact`** (nouvelle route protégée) : affiche les 5 stats + lien + boutons partage + barre de progression vers prochain cercle + IBAN form + historique des mamans recommandées (anonymisé : "Une maman t'a rejoint le X").
- **Lien dans le Dashboard** : carte "🌱 Mon Impact" visible uniquement pour les ambassadrices (= tous les premium).
- **Page admin `/admin/ambassadrices`** : vue d'ensemble, validations manuelles si besoin, déclenchement payout.

### Design

Cohérent avec l'existant : palette rose/sauge, polices Playfair + sans-serif body, cartes `rounded-[2rem]` avec `bg-card`, `shadow-soft`. Les trois cercles avec un dégradé doux (vert tendre → rose → ambre). Animations légères (framer-motion déjà utilisé).

## Découpage en livraisons

1. **Migration BDD** + RLS + GRANT — j'envoie pour ton approbation en premier.
2. **Tracking referral frontend + intégration paiement Mollie + webhook**.
3. **Page "Mon Impact"** complète + carte dashboard.
4. **Crons de validation** (J+14) **et de payout mensuel**.
5. **Page admin** + tests.

## Questions ouvertes avant de coder

1. Confirme l'approche SEPA mensuelle (vs Mollie Connect plus tard) ?
2. Seuil minimum de versement : **20 €** ok ou autre montant ?
3. Le code referral : généré (`ECL-XXXX`) ou laisser la maman choisir son code personnalisé ?
4. Pour une maman qui s'inscrit via un lien puis ne paie qu'1 mois après : on attribue toujours la commission ? (J'ai prévu cookie 30j — confirme.)
