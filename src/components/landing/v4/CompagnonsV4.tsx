import { MASCOTS } from "@/data/pulseMascots";
import { mascotAliveClass, mascotDelay } from "@/lib/mascotMotion";
import { Band, Eyebrow, H2 } from "./kit";

const CompagnonsV4 = () => (
  <Band className="bg-card">
    <div className="grid gap-5 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-10">
      <div>
        <Eyebrow>Les six compagnons</Eyebrow>
        <H2>Six compagnons. Un seul espace.</H2>
        <p className="mt-2 text-[14px] leading-relaxed text-foreground/75">
          Choisis qui t'accompagne dans chaque domaine, ou laisse Éclosia
          décider.
        </p>
      </div>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {MASCOTS.map((m, i) => (
          <li key={m.domain} className="text-center">
            <div
              className={`mascot-tap mx-auto flex h-14 w-14 items-center justify-center rounded-full ${m.tint}`}
            >
              <span className={mascotAliveClass(m.domain)} style={mascotDelay(i)}>
                <img
                  src={m.image}
                  alt={m.name}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-12 w-12 object-contain"
                />
              </span>
            </div>
            <p className="mt-1 text-[12.5px] font-medium text-night">{m.name}</p>
            <p className="text-[11.5px] text-muted-foreground">{m.label}</p>
          </li>
        ))}
      </ul>
    </div>
  </Band>
);

export default CompagnonsV4;
