/**
 * 🧠 Vide-cervEAU — on écrit tout en vrac, Éclosia sépare et propose un rangement.
 *
 * Règle absolue : ne JAMAIS inventer une date, une heure ou une personne.
 * Seules les informations écrites noir sur blanc sont reprises. Quand quelque
 * chose manque (un rendez-vous sans date), l'élément est marqué « à confirmer »
 * et c'est la personne qui décide.
 *
 * Aucune IA ici : simple lecture de mots, tout se passe sur le téléphone.
 */
import { guessDomain, type PulseDomain } from "@/data/pulseMascots";

export type DumpKind = "tache" | "rdv" | "note";

export type DumpItem = {
  /** identifiant local, le temps de la confirmation */
  key: string;
  title: string;
  kind: DumpKind;
  domain: PulseDomain | null;
  /** date explicitement écrite (YYYY-MM-DD), sinon null */
  date: string | null;
  /** heure explicitement écrite (HH:MM), sinon null */
  time: string | null;
  /** enfant / personne nommée dans le texte, si elle existe dans la famille */
  profileId: string | null;
  profileName: string | null;
  /** true quand il manque une date pour en faire un vrai rendez-vous */
  needsDate: boolean;
};

/** Petits mots de départ qu'on enlève pour garder une action lisible. */
const LEAD = [
  /^(et|puis|aussi|ensuite)\s+/i,
  /^(il )?faut (que je |que j'|)/i,
  /^je dois\s+/i,
  /^j'?ai (à|a)\s+/i,
  /^penser (à|au|aux)\s+/i,
  /^ne pas oublier (de |d'|)/i,
  /^pense (à|au|aux)\s+/i,
];

const WEEKDAYS = [
  ["dimanche", 0],
  ["lundi", 1],
  ["mardi", 2],
  ["mercredi", 3],
  ["jeudi", 4],
  ["vendredi", 5],
  ["samedi", 6],
] as const;

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const iso = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** Cherche une date écrite explicitement. Rien d'inventé : null si rien. */
function findDate(text: string): string | null {
  const t = text.toLowerCase();

  if (/\baujourd'?hui\b/.test(t)) return addDays(0);
  if (/\bapr[èe]s[- ]demain\b/.test(t)) return addDays(2);
  if (/\bdemain\b/.test(t)) return addDays(1);

  // jj/mm ou jj/mm/aaaa
  const num = t.match(/\b(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?\b/);
  if (num) {
    const day = Number(num[1]);
    const month = Number(num[2]) - 1;
    const year = num[3] ? Number(num[3].length === 2 ? `20${num[3]}` : num[3]) : new Date().getFullYear();
    const d = new Date(year, month, day);
    if (!Number.isNaN(d.getTime())) return iso(d);
  }

  // « le 12 mars »
  const named = t.match(new RegExp(`\\b(\\d{1,2})\\s+(${MONTHS.join("|")})\\b`));
  if (named) {
    const d = new Date(new Date().getFullYear(), MONTHS.indexOf(named[2]), Number(named[1]));
    if (d.getTime() < Date.now() - 86400000) d.setFullYear(d.getFullYear() + 1);
    return iso(d);
  }

  // jour de la semaine → la prochaine occurrence
  for (const [word, dow] of WEEKDAYS) {
    if (new RegExp(`\\b${word}\\b`).test(t)) {
      const today = new Date().getDay();
      let delta = (dow - today + 7) % 7;
      if (delta === 0) delta = 7;
      return addDays(delta);
    }
  }
  return null;
}

/** Heure écrite : 14h, 14h30, 9 h 15. */
function findTime(text: string): string | null {
  const m = text.toLowerCase().match(/\b(\d{1,2})\s?h\s?(\d{2})?\b/);
  if (!m) return null;
  const h = Number(m[1]);
  if (h > 23) return null;
  const min = m[2] ? Number(m[2]) : 0;
  if (min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

const RDV_WORDS = /\b(rendez[- ]vous|rdv|consultation|visite chez|bilan)\b/i;
const NOTE_WORDS = /\b(retenir|noter|garder|penser au fait|idée|id[ée]e)\b/i;

/** Découpe le vrac en morceaux, sans rien perdre. */
function splitSegments(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) =>
      line.split(/\s*[;•]\s*|\s*,\s*|\s+(?:et|puis)\s+|\s*\.\s+|\s*\.$/i),
    )
    .map((s) => s.trim())
    .filter((s) => s.replace(/[^a-zà-ÿ0-9]/gi, "").length > 2);
}

function clean(segment: string): string {
  let s = segment.trim();
  for (const re of LEAD) s = s.replace(re, "");
  s = s.replace(/^[-–•*\s]+/, "").trim();
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export type FamilyPerson = { id: string; first_name: string };

/** Transforme un texte en vrac en éléments proposés (rien n'est encore enregistré). */
export function parseBrainDump(text: string, people: FamilyPerson[] = []): DumpItem[] {
  return splitSegments(text).map((segment, i) => {
    const title = clean(segment);
    const lower = segment.toLowerCase();

    const person =
      people.find((p) => {
        const name = p.first_name?.trim();
        if (!name || name.length < 2) return false;
        return new RegExp(`\\b${name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(
          lower,
        );
      }) ?? null;

    const date = findDate(segment);
    const time = findTime(segment);
    const isRdv = RDV_WORDS.test(segment) || (!!time && !!date);
    const kind: DumpKind = isRdv ? "rdv" : NOTE_WORDS.test(segment) ? "note" : "tache";

    return {
      key: `${i}-${title}`,
      title,
      kind,
      domain: guessDomain(segment),
      date,
      time,
      profileId: person?.id ?? null,
      profileName: person?.first_name ?? null,
      needsDate: kind === "rdv" && !date,
    };
  });
}

/** Petite phrase de date, en français doux. */
export function prettyDate(date: string | null, time: string | null): string | null {
  if (!date) return time ? `à ${time.replace(":", "h")}` : null;
  const d = new Date(`${date}T12:00:00`);
  const label = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return time ? `${label} à ${time.replace(":", "h")}` : label;
}
