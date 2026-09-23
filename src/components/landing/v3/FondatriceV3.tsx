import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";
import famille1 from "@/assets/famille/IMG_1687.jpg.asset.json";
import fondatriceVideo from "@/assets/video/eclosia-fondatrice-son5.mp4.asset.json";
import fondatricePoster from "@/assets/video/fondatrice-poster.jpg.asset.json";
import { track } from "@/lib/landingAnalytics";

const FondatriceV3 = ({
  onCTA,
  loading,
}: {
  onCTA: () => void;
  loading: boolean;
}) => (
  <Section id="fondatrice">
    <div className="grid items-start gap-9 md:grid-cols-2 md:gap-12">
      <motion.div {...fadeUp}>
        <Eyebrow>La fondatrice</Eyebrow>
        <SectionTitle>
          Pourquoi j'ai créé
          <br />
          <span className="italic text-primary-dark">Éclosia.</span>
        </SectionTitle>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/85">
          <p>
            Je suis maman de trois enfants, et nous sommes cinq enfants à la
            maison. Mes deux grands vivent avec un trouble du spectre autistique,
            une dyspraxie et une ataxie. Ma dernière est asthmatique, et une
            suspicion de trouble du neurodéveloppement est en cours.
          </p>
          <p>
            Les rendez-vous, les dossiers, les traitements, les documents, les
            démarches : tout était dans ma tête. Je ne cherchais pas une
            application de plus, je cherchais un endroit où déposer tout ça.
          </p>
          <p className="font-medium text-night">
            Je ne voulais pas créer une application de plus. Je voulais créer
            l'endroit que j'aurais aimé avoir quand tout devenait trop lourd à
            gérer.
          </p>
          <p className="text-[13px] text-muted-foreground">
            Vous ne verrez pas les visages de mes enfants, et c'est voulu : ce
            sont mes enfants avant d'être une histoire à raconter.
          </p>
        </div>
        <button
          onClick={() => {
            track("checkout_start", { from: "fondatrice" });
            onCTA();
          }}
          disabled={loading}
          className="mt-7 inline-flex min-h-[52px] items-center justify-center rounded-full bg-night px-7 text-[15px] font-medium text-night-foreground transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-60"
        >
          Découvrir Éclosia
        </button>
      </motion.div>

      <motion.div {...fadeUp} className="space-y-4">
        <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card p-1.5">
          <video
            className="w-full rounded-[1.4rem]"
            controls
            playsInline
            preload="none"
            poster={fondatricePoster.url}
          >
            <source src={fondatriceVideo.url} type="video/mp4" />
            Ton navigateur ne peut pas lire cette vidéo.
          </video>
        </div>
        <img
          src={famille1.url}
          alt="La famille de la fondatrice, visages floutés"
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full rounded-[1.5rem] border border-border/60 object-cover"
        />
      </motion.div>
    </div>
  </Section>
);

export default FondatriceV3;
