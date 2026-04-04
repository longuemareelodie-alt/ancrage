import SectionBlock from "@/components/SectionBlock";
import Footer from "@/components/Footer";

const MentionsLegales = () => (
  <div className="min-h-screen bg-background">
    <SectionBlock>
      <h1 className="text-2xl font-bold mb-6">Mentions Légales</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Page en cours de rédaction.</p>
      </div>
    </SectionBlock>
    <Footer />
  </div>
);

export default MentionsLegales;
