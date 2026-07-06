import { Languages } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "de" : "en");
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={toggleLanguage}
      className="gap-1.5 rounded-xl border-border bg-background px-2.5 shadow-xs hover:bg-muted"
      aria-label={language === "en" ? t("dashShell.language.switchToGerman") : t("dashShell.language.switchToEnglish")}
      title={t("dashShell.language.toggleAria")}
    >
      <Languages className="size-4" />
      <span className="text-xs font-medium uppercase tabular-nums">{language}</span>
    </Button>
  );
}
