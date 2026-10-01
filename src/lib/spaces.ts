/**
 * Espaces Éclosia — ce qui est visible au quotidien, propre à chaque compte.
 * Masquer un espace = le retirer de la navigation. Aucune donnée n'est touchée.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SpaceId = "moi" | "famille" | "sante" | "organisation" | "autonomie" | "business";

export const SPACES: {
  id: SpaceId;
  label: string;
  mascot: string;
  to: string;
  desc: string;
}[] = [
  { id: "moi", label: "Moi", mascot: "🐺", to: "/moi", desc: "Ton espace personnel" },
  { id: "famille", label: "Famille", mascot: "🐰", to: "/famille", desc: "Tes enfants, leurs fiches et leurs proches" },
  { id: "sante", label: "Santé", mascot: "🦌", to: "/sante", desc: "Rendez-vous, traitements et informations de santé" },
  { id: "organisation", label: "Organisation", mascot: "🦊", to: "/organisation", desc: "Agenda, tâches, maison et papiers" },
  { id: "autonomie", label: "Autonomie", mascot: "🐱", to: "/autonomie", desc: "Routines, supports et outils pour l'autonomie" },
  { id: "business", label: "Business", mascot: "🐝", to: "/business", desc: "Ton activité, tes contacts et tes relances" },
];

/** Expérience d'avant la personnalisation : rien ne change pour les comptes existants. */
export const LEGACY_SPACES: SpaceId[] = ["moi", "famille", "autonomie", "organisation", "sante", "business"];
export const LEGACY_NAV: SpaceId[] = ["moi", "famille", "autonomie"];

const ORDER = SPACES.map((s) => s.id);
export const sortSpaces = (ids: SpaceId[]) =>
  [...new Set(ids)].filter((id) => ORDER.includes(id)).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));

export const PLACE_OPTIONS = [
  { id: "famille", emoji: "👨‍👩‍👧", label: "Ma famille" },
  { id: "sante", emoji: "🩺", label: "Ma santé / mes rendez-vous" },
  { id: "maison", emoji: "🏠", label: "Ma maison et mes tâches" },
  { id: "papiers", emoji: "📄", label: "Mes papiers / administratif" },
  { id: "travail", emoji: "💼", label: "Mon travail / mon activité" },
  { id: "perso", emoji: "🐺", label: "Mon organisation personnelle" },
  { id: "autonomie", emoji: "🧩", label: "L'autonomie / les routines" },
  { id: "tout", emoji: "🌪️", label: "Un peu de tout" },
];

export const DIFFICULTY_OPTIONS = [
  { id: "oublis", emoji: "🫧", label: "J'oublie des choses" },
  { id: "par-quoi-commencer", emoji: "🧭", label: "Je ne sais pas par quoi commencer" },
  { id: "tete-pleine", emoji: "🧠", label: "J'ai trop de choses dans ma tête" },
  { id: "dispersion", emoji: "🍃", label: "Je me disperse" },
  { id: "temps", emoji: "⏳", label: "Je manque de temps" },
  { id: "eparpille", emoji: "🧺", label: "Tout est réparti à plusieurs endroits" },
  { id: "retrouver", emoji: "🔎", label: "J'ai besoin de retrouver facilement mes informations" },
];

export const GOAL_OPTIONS = [
  { id: "journee", emoji: "📅", label: "Organiser ma journée" },
  { id: "famille", emoji: "👨‍👩‍👧", label: "Gérer ma famille" },
  { id: "sante", emoji: "🩺", label: "Suivre mes rendez-vous et ma santé" },
  { id: "documents", emoji: "📄", label: "Gérer mes documents et mon administratif" },
  { id: "maison", emoji: "🏠", label: "Organiser la maison" },
  { id: "activite", emoji: "💼", label: "Gérer mon activité" },
  { id: "routines", emoji: "🧩", label: "Mettre en place des routines" },
  { id: "vider", emoji: "🧠", label: "Vider ma tête" },
];

const PLACE_MAP: Record<string, SpaceId | null> = {
  famille: "famille", sante: "sante", maison: "organisation", papiers: "organisation",
  travail: "business", perso: "moi", autonomie: "autonomie", tout: null,
};
const GOAL_MAP: Record<string, SpaceId> = {
  journee: "organisation", famille: "famille", sante: "sante", documents: "organisation",
  maison: "organisation", activite: "business", routines: "autonomie", vider: "moi",
};

/** « Un peu de tout » n'active rien seul : ce sont les autres réponses qui affinent. */
export function computeSpaces(places: string[], difficulties: string[], goals: string[]): SpaceId[] {
  const out: SpaceId[] = [];
  places.forEach((p) => { const s = PLACE_MAP[p]; if (s) out.push(s); });
  goals.forEach((g) => { const s = GOAL_MAP[g]; if (s) out.push(s); });
  if (difficulties.includes("retrouver") || difficulties.includes("eparpille")) out.push("organisation");
  if (difficulties.includes("tete-pleine") || difficulties.includes("dispersion")) out.push("moi");
  const sorted = sortSpaces(out);
  return sorted.length ? sorted : ["moi", "famille", "organisation"];
}

/* ---------------- Préférences du compte ---------------- */

type Prefs = { spaces: SpaceId[]; personalized: boolean; version: number; uid: string | null };
const EVENT = "eclosia:spaces";
const cacheKey = (uid: string) => `eclosia_spaces_${uid}`;
let current: Prefs = { spaces: LEGACY_SPACES, personalized: false, version: 0, uid: null };

function readCache(uid: string): Prefs | null {
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    return raw ? { ...(JSON.parse(raw) as Prefs), uid } : null;
  } catch {
    return null;
  }
}

function publish(p: Prefs) {
  current = p;
  try {
    if (p.uid) localStorage.setItem(cacheKey(p.uid), JSON.stringify(p));
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Lecture instantanée (ex. : prochaine action). */
export const getActiveSpacesNow = () => current;
export const isSpaceActive = (id: SpaceId) => current.spaces.includes(id);

export async function loadSpaces(): Promise<Prefs> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id ?? null;
  if (!uid) return current;
  if (current.uid !== uid) {
    const cached = readCache(uid);
    current = cached ?? { spaces: LEGACY_SPACES, personalized: false, version: 0, uid };
  }
  const { data } = await supabase
    .from("profiles")
    .select("active_spaces, personalization_version")
    .eq("user_id", uid)
    .maybeSingle();
  if (data) {
    const list = sortSpaces((data.active_spaces ?? []) as SpaceId[]);
    const personalized = (data.personalization_version ?? 0) > 0;
    publish({
      uid,
      version: data.personalization_version ?? 0,
      personalized,
      spaces: personalized ? list : LEGACY_SPACES,
    });
  }
  return current;
}

/** Enregistre les espaces visibles. Ne touche à aucune autre table. */
export async function saveSpaces(
  spaces: SpaceId[],
  extra: { preferred_needs?: string[]; challenges?: string[]; organization_goal?: string[] } = {},
) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false };
  const list = sortSpaces(spaces);
  const { error } = await supabase
    .from("profiles")
    .update({ active_spaces: list, personalization_version: 1, ...extra })
    .eq("user_id", uid);
  if (error) return { ok: false };
  publish({ uid, spaces: list, personalized: true, version: 1 });
  return { ok: true };
}

export function useActiveSpaces() {
  const [prefs, setPrefs] = useState<Prefs>(current);
  useEffect(() => {
    const on = () => setPrefs({ ...current });
    window.addEventListener(EVENT, on);
    void loadSpaces().then(on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const toggle = useCallback(
    (id: SpaceId, on: boolean) =>
      saveSpaces(on ? [...current.spaces, id] : current.spaces.filter((s) => s !== id)),
    [],
  );
  return { ...prefs, toggle };
}

/** Espaces affichés dans la barre du bas (3 au maximum, pour qu'elle respire). */
export function navSpaces(p: Prefs): SpaceId[] {
  if (!p.personalized) return LEGACY_NAV;
  return p.spaces.slice(0, 3);
}

export const bannerDismissKey = (uid: string) => `eclosia_personalize_later_${uid}`;
