import { useEffect } from "react";

import Footer from "@/components/Footer";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { track } from "@/lib/landingAnalytics";
import Nav from "@/components/landing/v5/Nav";
import MobileStickyCTA from "@/components/landing/v3/MobileStickyCTA";
import { Features, Final, Hero, Histoire, Prix, Questions, Reconnais } from "@/components/landing/v5/Sections";

/**
 * Page de vente Éclosia (V5) — courte et percutante.
 * Hero → Tu te reconnais ? → 4 blocs numérotés → histoire → tarif → questions → appel final.
 * Aucun chiffre, témoignage ou compte à rebours inventé : le tarif vient de la base.
 */

const Index = () => {
  const { startPayment, loading } = useMolliePayment();
  const onCTA = (promoCode?: unknown) =>
    startPayment({ promoCode: typeof promoCode === "string" ? promoCode : null });

  useEffect(() => {
    track("landing_view");
  }, []);

  return (
    <div className="bg-landing min-h-screen overflow-x-clip text-night-foreground">
      <Nav onCTA={onCTA} loading={loading} />
      <main className="pb-14 md:pb-0">
        <Hero onCTA={onCTA} loading={loading} />
        <Reconnais />
        <Features />
        <Histoire />
        <Prix onCTA={onCTA} loading={loading} />
        <Questions />
        <Final onCTA={onCTA} loading={loading} />
      </main>
      <div className="bg-background text-foreground">
        <Footer />
      </div>
      <MobileStickyCTA onCTA={onCTA} loading={loading} />
    </div>
  );
};

export default Index;
