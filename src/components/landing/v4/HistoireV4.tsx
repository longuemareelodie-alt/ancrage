import { useState } from "react";
import famille from "@/assets/famille/IMG_2117.jpg.asset.json";
import fondatriceVideo from "@/assets/video/eclosia-fondatrice-son5.mp4.asset.json";
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

        <div>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card p-1.5 shadow-[0_20px_50px_-32px_hsl(var(--night)/0.4)]">
            <video
              src={fondatriceVideo.url}
              poster={famille.url}
              controls
              playsInline
              preload="none"
              className="w-full rounded-[0.9rem]"
            />
          </div>
          <p className="mt-2 text-center text-[12px] text-muted-foreground">
            Une minute et demie, avec le son : pourquoi Éclosia existe.
          </p>
        </div>
      </div>
    </Band>
  );
};

export default HistoireV4;
