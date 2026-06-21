// Version courante du contrat d'affiliation Eclosia.
// Incrémenter (et bumper la date) à chaque modification matérielle.
// Toute nouvelle version oblige les ambassadrices existantes à ré-accepter.
export const CURRENT_CONTRACT_VERSION = "v1.0-2026-06";

// Hash stable du contenu : permet de prouver a posteriori quel texte a été accepté.
// Mettre à jour ce hash si le texte est modifié (même typo) — sinon, garder identique.
export const CURRENT_CONTRACT_HASH = "eclosia-affiliation-v1.0-2026-06";

export interface ContractStatus {
  accepted: boolean;
  version?: string;
  accepted_at?: string;
  full_name?: string;
}
