import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";

const AllerPlusLoin = () => {
  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Tu veux aller plus loin ?</h1>
          <p className="text-muted-foreground">
            Tu peux continuer seule.
            <br />
            Ou avancer avec un cadre.
          </p>
        </div>
      </SectionBlock>

      <SectionBlock>
        <p className="mb-6 text-lg font-bold text-primary">ANCRAGE t'aide à :</p>
        <ul className="space-y-3">
          {[
            "calmer ton système nerveux",
            "comprendre l'emprise",
            "reprendre du pouvoir",
            "te reconstruire",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <CTAButton to="/parcours">Accéder à ANCRAGE — 29€</CTAButton>
        </div>
      </SectionBlock>
    </div>
  );
};

export default AllerPlusLoin;
