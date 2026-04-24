import { useTranslation } from "react-i18next";
import { Check, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  type SupportedLanguage,
} from "@/i18n/config";

interface LanguageSwitcherProps {
  variant?: "default" | "compact";
  className?: string;
}

const LanguageSwitcher = ({
  variant = "default",
  className = "",
}: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const current = (SUPPORTED_LANGUAGES as readonly string[]).includes(i18n.language)
    ? (i18n.language as SupportedLanguage)
    : "fr";

  const handleChange = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("nav.language")}
        className={[
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
          className,
        ].join(" ")}
      >
        <Languages className="h-3.5 w-3.5" aria-hidden="true" />
        {variant === "default" ? (
          <span className="uppercase">{current}</span>
        ) : (
          <span className="sr-only">{t("nav.language")}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => handleChange(lng)}
            className="flex items-center justify-between gap-3"
          >
            <span>{LANGUAGE_LABELS[lng]}</span>
            {current === lng && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
