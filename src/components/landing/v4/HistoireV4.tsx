import { useState } from "react";
import famille from "@/assets/famille/IMG_2117.jpg.asset.json";
import { Band, Eyebrow, H2 } from "./kit";

const HistoireV4 = () => {
  const [open, setOpen] = useState(false);

  return (
    <Band id="fondatrice">
      <div className="grid gap-5 md:grid-cols-[1fr_0.8fr] md:items-center md:gap-10">
        <div>
          <Eyebrow>Mon histoire</Eyebrow>
          <H2>Pourquoi j'ai créé Éclosia.</H2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/80">
            Je ne voulais pas créer une application de plus. Je voulais créer
            l'endroit que j'aurais aimé avoir quand tout devenait trop lourd à
            gérer.
          </p>
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            Élodie — fondatrice d'Éclosia
          </p>

          {open && (
            <div className="mt-3 space-y-2.5 text-[14px] leading-relaxed text-foreground/75">
              <p>
                Je suis maman de trois enfants, et nous sommes cinq enfants à la
                maison. Mes deux grands vivent avec un trouble du spectre
                autistique, une dyspraxie et une ataxie. Ma dernière est
                asthmatique, et une suspicion de trouble du neurodéveloppement
                est en cours.
              </p>
              <p>
                Vous ne verrez pas les visages de mes enfants, et c'est voulu :
                ce sont mes enfants avant d'être une histoire à raconter.
                Éclosia est née de ce réflexe-là — protéger ce qui compte, et
                tout garder au même endroit.
              </p>
            </div>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-[13.5px] font-medium text-primary-dark underline underline-offset-4"
          >
            {open ? "Replier" : "Découvrir mon histoire →"}
          </button>
        </div>

        <img
          src={famille.url}
          alt="La fondatrice d'Éclosia avec ses enfants, visages volontairement floutés"
          loading="lazy"
          className="w-full rounded-2xl border border-border/60 object-cover shadow-[0_20px_50px_-32px_hsl(var(--night)/0.4)]"
        />
      </div>
    </Band>
  );
};

export default HistoireV4;
