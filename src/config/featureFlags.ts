/**
 * Feature flags — bascules build-time pour piloter les rollouts de manière
 * progressive et permettre un rollback rapide via redéploiement.
 *
 * Règles d'usage :
 *  - Une seule source de vérité par feature ; ne pas dupliquer la valeur.
 *  - Tout consommateur doit lire la constante via import nommé pour bénéficier
 *    du tree-shaking et de la propagation statique.
 *  - Les flags ici sont lus uniquement par le front. La garde équivalente
 *    côté webhook Mollie est portée par le secret runtime
 *    `PAYMENT_FIRST_ENABLED` (cf. supabase/functions/mollie-webhook/index.ts).
 *  - Pour basculer : modifier la valeur, redéployer (~2 min). Aucun changement
 *    de schéma ni de données nécessaire.
 *
 * Historique :
 *  - L1 (introduction) : le flag est défini mais aucun composant ne le lit
 *    encore. Permet d'aligner le code front sans changer le comportement.
 *  - L2 : Auth.tsx et Index.tsx liront `PAYMENT_FIRST_ENABLED` pour basculer
 *    sur le parcours paiement-d'abord. Le code de signup classique reste
 *    présent derrière la branche `false` comme filet de sécurité.
 */

/**
 * Active le parcours « paiement d'abord » côté UI :
 *  - Index.tsx : CTA principal pointe directement sur le paiement Mollie.
 *  - Auth.tsx : masque le formulaire signup classique, affiche uniquement
 *    le login + lien vers le CTA d'achat.
 *
 * Mis à `false` en L1 (préparation, pas encore de lecteur). Sera basculé à
 * `true` en L2 après validation des durcissements webhook.
 */
export const PAYMENT_FIRST_ENABLED = false as const;
