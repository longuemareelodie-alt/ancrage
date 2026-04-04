import { motion } from "framer-motion";
import { Phone, MessageSquare, Shield } from "lucide-react";

const emergencyNumbers = [
  { label: "SAMU", number: "15", href: "tel:15" },
  { label: "Police", number: "17", href: "tel:17" },
  { label: "Pompiers", number: "18", href: "tel:18" },
  { label: "Violences Femmes Info", number: "3919", href: "tel:3919" },
  { label: "Prévention Suicide", number: "3114", href: "tel:3114" },
  { label: "Allô enfance en danger", number: "119", href: "tel:119" },
  { label: "Urgence par SMS / chat", number: "114", href: "sms:114", isSms: true },
];

const EmergencySection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="px-6 py-12 bg-destructive/5"
    >
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            Besoin d'aide immédiatement ?
          </h2>
          <p className="text-sm text-muted-foreground">
            Si tu es en danger ou en détresse, tu peux contacter immédiatement :
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>👉 Tu n'es pas seule</p>
            <p>👉 De l'aide existe maintenant</p>
            <p>👉 Tu peux appeler OU écrire si parler est impossible</p>
          </div>
        </div>

        <div className="space-y-2">
          {emergencyNumbers.map((item) => (
            <a
              key={item.number}
              href={item.href}
              className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm transition-colors hover:bg-secondary"
            >
              {item.isSms ? (
                <MessageSquare className="h-5 w-5 shrink-0 text-destructive" />
              ) : (
                <Phone className="h-5 w-5 shrink-0 text-destructive" />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.label}</p>
              </div>
              <span className="text-lg font-bold text-destructive">{item.number}</span>
            </a>
          ))}
        </div>

        <div className="space-y-2 text-center text-xs text-muted-foreground">
          <p>👉 Appels gratuits · Confidentiels · Disponibles 24h/24 pour la plupart</p>
          <p className="font-semibold">Ta sécurité passe avant tout.</p>
        </div>

        <div className="rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
          Cet outil ne remplace pas un accompagnement médical, juridique ou psychologique.
        </div>
      </div>
    </motion.section>
  );
};

export default EmergencySection;
