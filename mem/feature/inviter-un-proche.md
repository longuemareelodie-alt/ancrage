---
name: Inviter un proche
description: Flux d'invitation par e-mail depuis le profil (rôles disponibles, lien 30 jours, garde-fous anti-spam)
type: feature
---

Depuis le profil, la personne invite un proche par e-mail en choisissant son rôle :
Maman, Papa, Grand-parent, Beau-parent, Professionnel, Proche, Autre.

Règles :
- Trois champs maximum : e-mail, rôle, petit mot optionnel (500 caractères).
- Le lien d'invitation est unique et valable 30 jours ; page publique `/invitation?token=…`.
- Impossible de s'inviter soi-même ; 20 invitations maximum par 24 h ; réinviter la même adresse remplace l'invitation en attente.
- L'invitation n'expose jamais l'adresse e-mail de l'invitante, seulement son prénom.
- L'invitation ne donne pas encore accès aux données de la famille : elle invite à créer son propre espace. Le partage de droits reste à construire.
- Comptes créés après paiement uniquement : la page d'invitation mène à l'offre, jamais à une inscription directe.
- Le jeton est mémorisé côté navigateur pendant tout le parcours (offre → paiement → 1re connexion) puis l'invitation passe automatiquement en « acceptée » si l'adresse du compte correspond.
