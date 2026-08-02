/**
 * Accueil personnalisé Éclosia — rôle, façon d'être appelé, défis du quotidien.
 *
 * Tout est enregistré dans le profil (backend) et mis en cache localement
 * pour que l'application puisse s'adapter immédiatement, hors ligne compris.
 * L'utilisateur peut quitter et reprendre à tout moment : le brouillon est
 * conservé localement.
 */

import { supabase } from "@/integrations/supabase/client";

export type CaregiverRole =
  | "maman"
  | "papa"
  | "deux-parents"
  | "grand-parent"
  | "parent-accueil"
  | "professionnel"
  | "autre"
  | "prenom-seul";

export type AddressStyle =
  | "prenom"
  | "maman"
  | "papa"
  | "maman-prenom"
  | "papa-prenom"
  | "personnalise";

export interface OnboardingState {
  step: number;
  role: CaregiverRole | null;
  addressStyle: AddressStyle | null;
  addressCustom: string;
  challenges: string[];
  completed: boolean;
}

export const CAREGIVER_ROLES: { id: CaregiverRole; emoji: string; label: string }[] = [
  { id: "maman", emoji: "👩", label: "Maman" },
  { id: "papa", emoji: "👨", label: "Papa" },
  { id: "deux-parents", emoji: "👩‍❤️‍👨", label: "Deux parents" },
  { id: "grand-parent", emoji: "👵", label: "Grand-parent" },
  { id: "parent-accueil", emoji: "👨‍👩‍👧", label: "Parent d'accueil" },
  { id: "professionnel", emoji: "🧑‍⚕️", label: "Professionnel" },
  { id: "autre", emoji: "❤️", label: "Autre responsable légal" },
  { id: "prenom-seul", emoji: "✨", label: "Je préfère être appelé·e par mon prénom" },
];

export const ADDRESS_STYLES: { id: AddressStyle; label: string; hint: string }[] = [
  { id: "prenom", label: "Mon prénom", hint: "« Bonjour Léa »" },
  { id: "maman", label: "Maman", hint: "« Bonjour Maman »" },
  { id: "papa", label: "Papa", hint: "« Bonjour Papa »" },
  { id: "maman-prenom", label: "Maman + prénom", hint: "« Bonjour Maman Léa »" },
  { id: "papa-prenom", label: "Papa + prénom", hint: "« Bonjour Papa Léa »" },
  { id: "personnalise", label: "Personnalisé", hint: "Comme tu veux" },
];

export const CHALLENGES: { id: string; emoji: string; label: string }[] = [
  { id: "charge-mentale", emoji: "🧠", label: "Charge mentale" },
  { id: "organisation", emoji: "📅", label: "Organisation" },
  { id: "emotions", emoji: "💗", label: "Émotions" },
  { id: "crises", emoji: "🌪️", label: "Crises" },
  { id: "sommeil", emoji: "🌙", label: "Sommeil" },
  { id: "autonomie", emoji: "🌱", label: "Autonomie" },
  { id: "communication", emoji: "💬", label: "Communication" },
  { id: "ecole", emoji: "🎒", label: "École" },
  { id: "administratif", emoji: "📄", label: "Administratif" },
  { id: "budget", emoji: "💰", label: "Budget" },
  { id: "rendez-vous", emoji: "⏰", label: "Rendez-vous" },
  { id: "autre", emoji: "✨", label: "Autre" },
];

const DRAFT_KEY = "eclosia_onboarding_draft";
export const ONBOARDING_DONE_KEY = "eclosia_onboarding_done";
const ADDRESS_CACHE_KEY = "eclosia_address_label";

export const EMPTY_ONBOARDING: OnboardingState = {
  step: 0,
  role: null,
  addressStyle: null,
  addressCustom: "",
  challenges: [],
  completed: false,
};

export function loadDraft(): OnboardingState {
  if (typeof window === "undefined") return EMPTY_ONBOARDING;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_ONBOARDING;
    return { ...EMPTY_ONBOARDING, ...(JSON.parse(raw) as Partial<OnboardingState>) };
  } catch {
    return EMPTY_ONBOARDING;
  }
}

export function saveDraft(state: OnboardingState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    /* espace local plein — sans conséquence */
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(ONBOARDING_DONE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingDone() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_DONE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Construit la formule d'appel utilisée partout dans l'application. */
export function buildAddressLabel(
  style: AddressStyle | null,
  custom: string,
  firstName: string
): string {
  const prenom = (firstName || "").trim();
  switch (style) {
    case "maman":
      return "Maman";
    case "papa":
      return "Papa";
    case "maman-prenom":
      return prenom ? `Maman ${prenom}` : "Maman";
    case "papa-prenom":
      return prenom ? `Papa ${prenom}` : "Papa";
    case "personnalise":
      return custom.trim() || prenom;
    case "prenom":
    default:
      return prenom;
  }
}

/** Formule d'appel mise en cache — lisible instantanément par le tableau de bord. */
export function getCachedAddressLabel(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(ADDRESS_CACHE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function cacheAddressLabel(label: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADDRESS_CACHE_KEY, label);
  } catch {
    /* ignore */
  }
}

export interface ChildDraft {
  firstName: string;
  birthDate: string;
  gender: string;
  pronouns: string;
  diagnoses: string;
  sensitivities: string;
  interests: string;
  strengths: string;
  goals: string;
}

export const emptyChild = (): ChildDraft => ({
  firstName: "",
  birthDate: "",
  gender: "",
  pronouns: "",
  diagnoses: "",
  sensitivities: "",
  interests: "",
  strengths: "",
  goals: "",
});

const splitList = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Enregistre les préférences d'accueil et les profils enfants. */
export async function persistOnboarding(
  state: OnboardingState,
  children: ChildDraft[]
): Promise<{ ok: boolean }> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return { ok: false };

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", uid)
      .maybeSingle();

    const label = buildAddressLabel(
      state.addressStyle,
      state.addressCustom,
      profile?.first_name ?? ""
    );
    cacheAddressLabel(label);

    await supabase
      .from("profiles")
      .update({
        caregiver_role: state.role,
        address_style: state.addressStyle,
        address_custom: state.addressCustom || null,
        challenges: state.challenges,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("user_id", uid);

    const rows = children
      .filter((c) => c.firstName.trim())
      .map((c) => ({
        user_id: uid,
        first_name: c.firstName.trim(),
        relation: "enfant",
        birth_date: c.birthDate || null,
        diagnosis_tags: splitList(c.diagnoses),
        sensitivities: splitList(c.sensitivities),
        interests: splitList(c.interests),
        preferences: [c.gender, c.pronouns].filter(Boolean).join(" · "),
        notes: [
          c.strengths ? `Forces : ${c.strengths}` : "",
          c.goals ? `Objectifs : ${c.goals}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      }));

    if (rows.length) {
      await supabase.from("family_medical_profiles").insert(rows);
    }

    markOnboardingDone();
    clearDraft();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
