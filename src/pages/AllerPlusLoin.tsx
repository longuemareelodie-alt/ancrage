import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import Breadcrumb from "@/components/Breadcrumb";
import { useMolliePayment } from "@/hooks/useMolliePayment";

const AllerPlusLoin = () => {
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  const handlePayment = () => {
    startPayment();
  };

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Aller plus loin" }]} />
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Tu peux continuer seule…</h1>
          <p className="text-muted-foreground">
            Mais tu vas continuer à :
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• douter</li>
            <li>• rechuter</li>
            <li>• t'épuiser</li>
            <li>• chercher sans trouver</li>
          </ul>
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Ou tu peux avancer avec un cadre</p>
          <div className="space-y-1 text-muted-foreground">
            <p>👉 clair</p>
            <p>👉 guidé</p>
            <p>👉 sécurisé</p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock variant="blue">
        <p className="mb-6 text-lg font-bold text-primary">ANCRAGE t'aide à :</p>
        <ul className="space-y-3">
          {[
            "calmer ton système nerveux",
            "comprendre ce que tu as vécu",
            "reprendre du pouvoir",
            "te reconstruire sans t'effondrer",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-1 text-sm text-muted-foreground">
          <p>👉 Même si aujourd'hui tu es perdue</p>
          <p>👉 Même si tu n'as plus d'énergie</p>
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-6 text-center">
          <p className="text-lg font-bold text-primary">
            Tu n'as pas besoin d'aller bien pour commencer.
          </p>
          <div className="space-y-2">
            <p className="font-semibold">Tu peux commencer maintenant</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>👉 sans te justifier</p>
              <p>👉 sans te forcer</p>
              <p>👉 sans te mettre en danger</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <CTAButton to="#" onClick={handlePayment} loading={paymentLoading}>Je veux me sentir mieux — 57€</CTAButton>
            <p className="text-xs text-muted-foreground">Paiement unique. Accès à vie. 100% sécurisé via Mollie.</p>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
};

export default AllerPlusLoin;
