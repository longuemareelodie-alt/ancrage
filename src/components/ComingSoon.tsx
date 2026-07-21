import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComingSoon({ title, emoji, description }: { title: string; emoji: string; description: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center space-y-6"
      >
        <div className="text-6xl">{emoji}</div>
        <div>
          <h1 className="font-playfair text-3xl text-foreground mb-3">{title}</h1>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4" /> Bientôt disponible
        </div>
        <div className="pt-4">
          <Button asChild variant="ghost"><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> Retour à l'accueil</Link></Button>
        </div>
      </motion.div>
    </div>
  );
}
