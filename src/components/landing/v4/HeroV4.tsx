import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";
import { DEMO_VIDEO_URL } from "../DemoSection";
import { track } from "@/lib/landingAnalytics";
import { priceLabel, useFoundingOffer } from "./kit";

const HeroV4 = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => {
  const offer = useFoundingOffer();
  const price = priceLabel(offer);

  return (
    <section className="px-5 pb-5 pt-[68px] md:px-6 md:pb-10 md:pt-20">
      <div className="mx-auto grid w-full max-w-[1100px] items-center gap-5 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
        <div className="text-center md:text-left">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-primary-dark">
            Éclosia
          </p>
          <h1 className="mt-2 font-serif text-[clamp(1.75rem,5vw,3rem)] leading-[1.08] tracking-[-0.02em] text-night">
            Quand ta tête est pleine,{" "}
            <span className="italic text-primary-dark">Éclosia fait le tri.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/80 md:mx-0">
            Ta famille, tes rendez-vous, tes documents, ton organisation et ton
            espace à toi. Au même endroit.
          </p>

          <p className="mt-3 text-[15px] font-medium text-night">
            🌸 {price ?? "Tarif fondateur"} · accès à vie
            <span className="ml-2 text-[13px] font-normal text-muted-foreground">
              paiement unique, sans abonnement
            </span>
          </p>

          <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center md:justify-start">
            <button
              onClick={() => {
                track("hero_cta_click");
                track("checkout_start", { from: "hero" });
                onCTA();
              }}
              disabled={loading}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-night px-6 text-[15px] font-medium text-night-foreground shadow-[0_10px_34px_-16px_hsl(var(--night)/0.55)] transition-transform hover:-translate-y-[1px] disabled:opacity-60"
            >
              Je découvre Éclosia
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <Link
              to="/connexion"
              className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-border/70 bg-card/70 px-5 text-[14px] font-medium text-foreground transition-colors hover:bg-card"
            >
              Je me connecte
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[290px] sm:max-w-[420px]">
          <div className="overflow-hidden rounded-[1.4rem] border border-border/60 bg-card p-1.5 shadow-[0_24px_60px_-34px_hsl(var(--night)/0.4)]">
            <video
              src={DEMO_VIDEO_URL}
              poster={dashboardShot.url}
              controls
              playsInline
              preload="none"
              onPlay={() => track("demo_video_start")}
              onEnded={() => track("demo_video_complete")}
              className="max-h-[38vh] w-full rounded-[1.1rem] bg-secondary/40 object-contain sm:max-h-none"
            />
          </div>
          <p className="mt-2 text-center text-[12px] text-muted-foreground">
            Éclosia en vrai : tu dis comment va ta tête, elle sort une seule action.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroV4;
