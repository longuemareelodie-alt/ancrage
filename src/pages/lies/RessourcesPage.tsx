import { BookHeart, ExternalLink, Phone } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TROUBLES } from "@/data/troublesCatalog";

const RessourcesPage = () => {
  return (
    <LiesShell
      title="Ressources & troubles"
      subtitle="Comprendre, et trouver les bonnes adresses françaises."
      icon={<BookHeart className="h-6 w-6" />}
    >
      <p className="mb-4 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        Les fiches ci-dessous sont volontairement courtes. Elles ne remplacent jamais un avis
        médical. Les liens renvoient vers des ressources françaises reconnues.
      </p>
      <Accordion type="single" collapsible className="w-full">
        {TROUBLES.map((t) => (
          <AccordionItem key={t.key} value={t.key} className="rounded-xl border border-border px-4 mb-2 border-b">
            <AccordionTrigger className="text-left">
              <div>
                <div className="font-serif text-base text-foreground">{t.title}</div>
                <div className="mt-0.5 text-xs font-normal text-muted-foreground">{t.short}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-3 text-sm leading-relaxed text-foreground/90">{t.summary}</p>
              {t.resources.length > 0 && (
                <ul className="space-y-2">
                  {t.resources.map((r) => (
                    <li
                      key={r.label}
                      className="flex flex-col gap-1 rounded-lg bg-[hsl(var(--lies-soft))] p-3"
                    >
                      <span className="font-medium text-foreground">{r.label}</span>
                      {r.description && (
                        <span className="text-xs text-muted-foreground">{r.description}</span>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[hsl(var(--lies))] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> {new URL(r.url).hostname.replace(/^www\./, "")}
                          </a>
                        )}
                        {r.phone && (
                          <a
                            href={`tel:${r.phone.replace(/\s/g, "")}`}
                            className="inline-flex items-center gap-1 text-[hsl(var(--lies))] hover:underline"
                          >
                            <Phone className="h-3 w-3" /> {r.phone}
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </LiesShell>
  );
};

export default RessourcesPage;
