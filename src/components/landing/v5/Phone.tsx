import { Menu } from "lucide-react";
import { MASCOTS } from "@/data/pulseMascots";

/**
 * Téléphones de la page de vente : écrans reconstruits fidèlement à partir
 * de l'interface réelle d'Éclosia (mêmes libellés, mêmes couleurs), avec
 * des prénoms d'exemple. Aucune donnée réelle d'utilisatrice.
 */

const m = (domain: string) => MASCOTS.find((x) => x.domain === domain)!;

export const Phone = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative aspect-[9/19] w-[230px] shrink-0 rounded-[2.3rem] bg-night p-[7px] shadow-phone sm:w-[250px] ${className}`}
    aria-hidden="true"
  >
    <div className="relative flex h-full flex-col overflow-hidden rounded-[1.9rem] bg-background text-foreground">
      <div className="absolute left-1/2 top-2 z-10 h-[18px] w-[70px] -translate-x-1/2 rounded-full bg-night" />
      <div className="flex items-center justify-between px-4 pb-2 pt-9">
        <Menu className="h-3.5 w-3.5 text-night/70" />
        <span className="font-wide text-[10px] font-bold tracking-[0.18em] text-night">ÉCLOSIA</span>
        <span className="rounded-full bg-primary/25 px-2 py-0.5 text-[8.5px] font-medium text-night">Elo ✿</span>
      </div>
      <div className="flex-1 overflow-hidden px-3.5 pb-4">{children}</div>
    </div>
  </div>
);

const Title = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div className="mb-2.5">
    <p className="font-serif text-[17px] italic leading-tight text-night">{children}</p>
    {sub && <p className="mt-0.5 text-[9.5px] text-muted-foreground">{sub}</p>}
  </div>
);

const Mascot = ({ domain, size = 26 }: { domain: string; size?: number }) => {
  const x = m(domain);
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${x.tint}`} style={{ width: size, height: size }}>
      <img src={x.image} alt="" width={size - 4} height={size - 4} className="object-contain" loading="lazy" />
    </span>
  );
};

/* 01 — Aujourd'hui */
export const ScreenToday = () => (
  <>
    <Title sub="Mardi · bonne soirée Elo">Aujourd'hui</Title>
    <p className="text-[9.5px] font-medium text-night">Comment fonctionne ta tête ?</p>
    <div className="mt-1.5 grid grid-cols-4 gap-1">
      {[
        ["🟢", "GO"],
        ["🟡", "Moyen"],
        ["🟠", "Saturé"],
        ["🔴", "KO"],
      ].map(([e, l]) => (
        <span
          key={l}
          className={`rounded-xl py-1.5 text-center text-[8.5px] font-medium ${
            l === "Moyen" ? "bg-night text-night-foreground" : "bg-card text-night"
          }`}
        >
          <span className="block text-[11px]">{e}</span>
          {l}
        </span>
      ))}
    </div>
    <div className="mt-3 rounded-2xl border border-primary/30 bg-card p-3">
      <p className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-primary-dark">Ta prochaine action</p>
      <div className="mt-1.5 flex items-start gap-2">
        <Mascot domain="sante" size={30} />
        <div>
          <p className="text-[12px] font-semibold leading-snug text-night">Appeler l'orthoptiste de Léo</p>
          <p className="text-[9px] text-muted-foreground">≈ 10 min · Santé</p>
        </div>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        <span className="flex-1 rounded-full bg-night py-1.5 text-center text-[9.5px] font-medium text-night-foreground">C'est fait ✓</span>
        <span className="rounded-full border border-border px-2.5 py-1.5 text-[9.5px] text-night">Reporter ↩</span>
      </div>
    </div>
    <div className="mt-2.5 rounded-2xl bg-card p-3">
      <p className="text-[11px] font-semibold text-night">Besoin d'aide maintenant ?</p>
      <p className="text-[9px] text-muted-foreground">Décris-moi ce qui se passe.</p>
      <div className="mt-2 flex gap-1.5">
        <span className="flex-1 rounded-full bg-background py-1.5 text-center text-[9px] text-night">✍️ Écrire</span>
        <span className="flex-1 rounded-full bg-background py-1.5 text-center text-[9px] text-night">🎙️ Dicter</span>
      </div>
    </div>
  </>
);

/* 01 bis — Aujourd'hui en mode KO : l'écran se simplifie */
export const ScreenTodayKO = () => (
  <>
    <Title sub="Mardi · prends soin de toi">Aujourd'hui</Title>
    <div className="grid grid-cols-4 gap-1">
      {[
        ["🟢", "GO"],
        ["🟡", "Moyen"],
        ["🟠", "Saturé"],
        ["🔴", "KO"],
      ].map(([e, l]) => (
        <span
          key={l}
          className={`rounded-xl py-1.5 text-center text-[8.5px] font-medium ${
            l === "KO" ? "bg-night text-night-foreground" : "bg-card text-night"
          }`}
        >
          <span className="block text-[11px]">{e}</span>
          {l}
        </span>
      ))}
    </div>
    <div className="mt-3 rounded-2xl bg-primary/15 p-3.5 text-center">
      <Mascot domain="moi" size={40} />
      <p className="mt-2 font-serif text-[15px] italic leading-snug text-night">On fait simple aujourd'hui. ❤️</p>
      <p className="mt-1 text-[9.5px] text-muted-foreground">Une seule chose, 5 minutes maximum.</p>
    </div>
    <div className="mt-2.5 rounded-2xl border border-primary/30 bg-card p-3">
      <p className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-primary-dark">Ta prochaine action</p>
      <p className="mt-1 text-[12px] font-semibold text-night">Boire un grand verre d'eau</p>
      <p className="text-[9px] text-muted-foreground">≈ 2 min · Moi</p>
    </div>
    <div className="mt-2.5 flex gap-1.5">
      <span className="flex-1 rounded-full bg-night py-2 text-center text-[9.5px] font-medium text-night-foreground">M'apaiser</span>
      <span className="flex-1 rounded-full border border-border py-2 text-center text-[9.5px] text-night">Vider ma tête</span>
    </div>
  </>
);

/* 02 — Enfants */
export const ScreenChild = () => (
  <>
    <Title sub="Pour Léo · 6 ans · question 3 sur 8">On m'a poussé</Title>
    <div className="rounded-2xl bg-card p-3 text-center">
      <p className="text-[13px] font-semibold leading-snug text-night">Tu avais envie ?</p>
      <p className="mt-1 text-[9px] text-primary-dark">🔊 Écouter</p>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2">
      {[
        ["👍", "Oui"],
        ["👎", "Non"],
      ].map(([e, l]) => (
        <span key={l} className={`rounded-2xl py-4 text-center ${l === "Non" ? "bg-primary/25 ring-2 ring-primary" : "bg-card"}`}>
          <span className="block text-[30px] leading-none">{e}</span>
          <span className="mt-1.5 block text-[11px] font-medium text-night">{l}</span>
        </span>
      ))}
    </div>
    <span className="mt-2 block rounded-2xl bg-card py-2.5 text-center text-[10.5px] text-night">🤷 Je ne sais pas</span>
    <div className="mt-3 rounded-2xl border border-border/70 p-2.5">
      <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Profil de Léo</p>
      <p className="mt-1 text-[9.5px] leading-snug text-night">Pictogrammes · 2 choix max · photo du doudou</p>
    </div>
  </>
);

/* 03 — Vider ma tête */
export const ScreenDump = () => (
  <>
    <Title sub="Écris tout en vrac, je range.">Vider ma tête</Title>
    <div className="rounded-2xl bg-card p-2.5 text-[9.5px] leading-relaxed text-night/80">
      relancer Camille pour sa commande, rdv dentiste de Jade jeudi, racheter du pain…
      <span className="mt-1 block text-right text-[9px] text-primary-dark">🎙️ Dicter</span>
    </div>
    <p className="mt-2.5 text-[9.5px] font-medium text-night">Éclosia a trié :</p>
    <ul className="mt-1.5 space-y-1.5">
      {[
        ["argent", "Business → Camille → Relance"],
        ["sante", "Rendez-vous / Santé · Jade"],
        ["maison", "Tâche · Maison"],
      ].map(([d, l]) => (
        <li key={l} className="flex items-center gap-2 rounded-xl bg-card px-2 py-1.5">
          <Mascot domain={d} size={22} />
          <span className="text-[9.5px] font-medium text-night">{l}</span>
        </li>
      ))}
    </ul>
    <span className="mt-3 block rounded-full bg-night py-2 text-center text-[10px] font-medium text-night-foreground">Tout ranger</span>
  </>
);

/* 04 — Business */
export const ScreenBusiness = () => (
  <>
    <Title sub="Ton activité, sans charge mentale.">Business</Title>
    <div className="flex gap-1">
      {["Contacts", "Relances", "Clientes", "Équipe"].map((t) => (
        <span
          key={t}
          className={`rounded-full px-2 py-1 text-[8.5px] font-medium ${t === "Relances" ? "bg-night text-night-foreground" : "bg-card text-night"}`}
        >
          {t}
        </span>
      ))}
    </div>
    <ul className="mt-2.5 space-y-1.5">
      {[
        ["Camille", "À relancer aujourd'hui", "bg-primary/25"],
        ["Inès", "Prospect · rappel jeudi", "bg-card"],
        ["Sarah", "Cliente active", "bg-card"],
        ["Léa", "À suivre", "bg-card"],
      ].map(([n, s, bg]) => (
        <li key={n} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${bg}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-[9.5px] font-semibold text-night">{n[0]}</span>
          <span>
            <span className="block text-[10.5px] font-semibold text-night">{n}</span>
            <span className="block text-[8.5px] text-muted-foreground">{s}</span>
          </span>
        </li>
      ))}
    </ul>
    <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-primary/30 p-2">
      <Mascot domain="argent" size={22} />
      <span className="text-[9px] leading-snug text-night">La relance de Camille remonte dans ta prochaine action.</span>
    </div>
  </>
);
