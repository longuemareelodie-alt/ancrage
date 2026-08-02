import { supabase } from "@/integrations/supabase/client";

/**
 * Inviter un proche : le lien est généré côté base, l'e-mail part via la
 * fonction d'envoi. On ne demande jamais deux fois la même info à la personne.
 */

export type InvitationRole =
  | "maman"
  | "papa"
  | "grand_parent"
  | "professionnel"
  | "autre_parent"
  | "proche"
  | "autre";

export const INVITATION_ROLES: {
  value: InvitationRole;
  label: string;
  emoji: string;
  hint: string;
}[] = [
  { value: "maman", label: "Maman", emoji: "💛", hint: "L'autre maman de l'enfant" },
  { value: "papa", label: "Papa", emoji: "💙", hint: "Le papa de l'enfant" },
  { value: "grand_parent", label: "Grand-parent", emoji: "🌿", hint: "Mamie, papi" },
  { value: "autre_parent", label: "Beau-parent", emoji: "🌸", hint: "Belle-mère, beau-père" },
  { value: "professionnel", label: "Professionnel", emoji: "🩺", hint: "Éducatrice, orthophoniste, AESH…" },
  { value: "proche", label: "Proche", emoji: "🤍", hint: "Tante, oncle, ami·e de confiance" },
  { value: "autre", label: "Autre", emoji: "✨", hint: "Quelqu'un d'important pour vous" },
];

export const roleLabel = (role: string) =>
  INVITATION_ROLES.find((r) => r.value === role)?.label ?? "Proche";

export const roleEmoji = (role: string) =>
  INVITATION_ROLES.find((r) => r.value === role)?.emoji ?? "✨";

export interface Invitation {
  id: string;
  email: string;
  role: string;
  personal_note: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

export interface InvitationPreview {
  found: boolean;
  role?: string;
  personal_note?: string | null;
  inviter_first_name?: string | null;
  invited_email?: string;
  status?: "pending" | "accepted" | "revoked" | "expired";
  expires_at?: string;
}

export const invitationUrl = (token: string) =>
  `${window.location.origin}/invitation?token=${token}`;

/** Les invitations envoyées, les plus récentes d'abord. */
export async function listMyInvitations(): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from("family_invitations")
    .select("id, email, role, personal_note, status, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as Invitation[];
}

export class InvitationError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/** Crée l'invitation puis envoie l'e-mail. */
export async function sendInvitation(params: {
  email: string;
  role: InvitationRole;
  note?: string;
  inviterFirstName?: string | null;
}): Promise<{ token: string; url: string }> {
  const { data, error } = await supabase.rpc("create_family_invitation", {
    _email: params.email,
    _role: params.role,
    _note: params.note ?? null,
  });

  if (error) {
    const raw = error.message || "";
    if (raw.includes("self_invite")) {
      throw new InvitationError(
        "self_invite",
        "C'est ta propre adresse — choisis celle de la personne à inviter.",
      );
    }
    if (raw.includes("rate_limited")) {
      throw new InvitationError(
        "rate_limited",
        "Tu as envoyé beaucoup d'invitations aujourd'hui. Réessaie demain 🌸",
      );
    }
    if (raw.includes("Adresse e-mail invalide")) {
      throw new InvitationError("invalid_email", "Cette adresse e-mail ne semble pas valide.");
    }
    throw new InvitationError("unknown", "L'invitation n'a pas pu être créée.");
  }

  const result = data as { token: string; role: string };
  const url = invitationUrl(result.token);

  const { error: mailError } = await supabase.functions.invoke(
    "send-transactional-email",
    {
      body: {
        templateName: "invitation-proche",
        recipientEmail: params.email.trim().toLowerCase(),
        idempotencyKey: `invitation-proche-${result.token}`,
        templateData: {
          inviterFirstName: params.inviterFirstName ?? null,
          roleLabel: roleLabel(result.role),
          personalNote: params.note ?? "",
          inviteUrl: url,
        },
      },
    },
  );

  if (mailError) {
    throw new InvitationError(
      "email_failed",
      "L'invitation est enregistrée mais l'e-mail n'est pas parti. Tu peux copier le lien et l'envoyer toi-même.",
    );
  }

  return { token: result.token, url };
}

export async function revokeInvitation(id: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_family_invitation", { _id: id });
  if (error) throw new InvitationError("revoke_failed", "L'invitation n'a pas pu être annulée.");
}

export async function fetchInvitationByToken(token: string): Promise<InvitationPreview> {
  const { data, error } = await supabase.rpc("get_family_invitation_by_token", {
    _token: token,
  });
  if (error) return { found: false };
  return (data ?? { found: false }) as unknown as InvitationPreview;
}

/* ------------------------------------------------------------------ *
 * Invitation en attente : chez Eclosia le compte n'existe qu'après le
 * paiement. On garde donc le jeton de côté pendant tout le parcours
 * (offre → paiement → première connexion) puis on le consomme.
 * ------------------------------------------------------------------ */

const PENDING_KEY = "eclosia_pending_invitation";

export function rememberPendingInvitation(token: string) {
  try {
    if (token) localStorage.setItem(PENDING_KEY, token);
  } catch {
    /* stockage indisponible : le lien reste utilisable manuellement */
  }
}

export function getPendingInvitation(): string | null {
  try {
    return localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

export function forgetPendingInvitation() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* rien à nettoyer */
  }
}

/**
 * Marque l'invitation comme acceptée si l'adresse du compte correspond.
 * Silencieux par nature : ça ne doit jamais gêner l'entrée dans l'app.
 */
export async function acceptPendingInvitation(): Promise<boolean> {
  const token = getPendingInvitation();
  if (!token) return false;

  const { data, error } = await supabase.rpc("accept_family_invitation", {
    _token: token,
  });
  if (error) return false;

  const result = data as { accepted?: boolean; reason?: string } | null;
  // On ne réessaie indéfiniment que si l'adresse ne correspond pas encore.
  if (result?.accepted || result?.reason === "not_found" || result?.reason === "not_valid") {
    forgetPendingInvitation();
  }
  return !!result?.accepted;
}
