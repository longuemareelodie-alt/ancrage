import { Band } from "./kit";

const STEPS = [
  "Tu crées ton compte.",
  "Tu ajoutes ta famille.",
  "Tu réponds à quelques questions.",
  "Éclosia te propose ta première action.",
];

const DemarrageV4 = () => (
  <Band>
    <div className="rounded-2xl border border-border/60 bg-night px-5 py-6 text-night-foreground md:px-10 md:py-8">
      <h2 className="font-serif text-[clamp(1.5rem,3.6vw,2.4rem)] leading-[1.12] tracking-[-0.01em]">
        Pas besoin de tout faire <span className="italic">aujourd'hui.</span>
      </h2>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className="rounded-xl bg-night-foreground/10 px-3.5 py-3 text-[13.5px] leading-snug"
          >
            <span className="mr-1.5 font-serif italic text-primary">
              0{i + 1}.
            </span>
            {s}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[14px] text-night-foreground/75">
        Le reste peut attendre.
      </p>
    </div>
  </Band>
);

export default DemarrageV4;
