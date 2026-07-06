import { Quote } from "lucide-react-dash";

import { useLanguage } from "@/contexts/LanguageContext";

export function QuoteCard() {
  const { t } = useLanguage();

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="grid size-8 shrink-0 place-items-center text-muted-foreground">
          <Quote className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xl leading-none tracking-tight">{t("dashProductivity.quote.text")}</p>
          <p className="text-muted-foreground">{t("dashProductivity.quote.attribution")}</p>
        </div>
      </div>
    </section>
  );
}
