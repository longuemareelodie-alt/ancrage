import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Section, fadeUp } from "../primitives";
import { track } from "@/lib/landingAnalytics";

const AmbassadriceTeaser = () => (
  <Section id="ambassadrice">
    <motion.div
      {...fadeUp}
      className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-[1.75rem] border border-border/60 bg-card px-6 py-7 text-center md:flex-row md:justify-between md:text-left"
    >
      <p className="text-[15px] leading-relaxed text-foreground/85">
        Tu utilises Éclosia et tu veux la faire découvrir ?
      </p>
      <Link
        to="/devenir-ambassadrice"
        onClick={() => track("ambassador_click")}
        className="inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
      >
        Découvrir le programme Ambassadrice
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </motion.div>
  </Section>
);

export default AmbassadriceTeaser;
