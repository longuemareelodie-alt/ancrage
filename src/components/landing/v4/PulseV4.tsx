import { Band, Eyebrow, H2 } from "./kit";

const STATES = [
  { dot: "🟢", name: "GO", text: "Tu as de l'élan." },
  { dot: "🟡", name: "MOYEN", text: "On avance doucement." },
  { dot: "🟠", name: "SATURÉ", text: "Une seule chose." },
  { dot: "🔴", name: "KO", text: "Cinq minutes. Tenir suffit." },
];

const PulseV4 = () => (
  <Band id="pulse" className="bg-card">
    <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-10">
      <div>
        <Eyebrow>Le cœur d'Éclosia</Eyebrow>
        <H2>
          Tu dis comment tu vas.
          <br />
          <span className="italic text-primary-dark">Éclosia adapte la suite.</span>
        </H2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/75">
          Une seule prochaine action. Jamais une liste qui t'écrase.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2.5">
        {STATES.map((s) => (
          <li
            key={s.name}
            className="rounded-xl border border-border/60 bg-background px-3.5 py-3"
          >
            <p className="text-[13px] font-semibold tracking-wide text-night">
              <span aria-hidden="true">{s.dot}</span> {s.name}
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              {s.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </Band>
);

export default PulseV4;
