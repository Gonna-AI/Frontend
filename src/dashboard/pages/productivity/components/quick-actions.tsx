import { CheckSquare, FileText, Focus, Orbit, Upload } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function QuickActions() {
  const { t } = useLanguage();

  const quickActions = [
    { label: t("dashProductivity.quickActions.newNote"), icon: FileText },
    { label: t("dashProductivity.quickActions.newReviewPoint"), icon: CheckSquare },
    { label: t("dashProductivity.quickActions.newProject"), icon: Orbit },
    { label: t("dashProductivity.quickActions.newGoal"), icon: Focus },
    { label: t("dashProductivity.quickActions.uploadDocument"), icon: Upload },
  ] as const;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl tracking-tight">{t("dashProductivity.quickActions.heading")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {quickActions.map((action) => (
          <Button key={action.label} variant="outline" className="h-auto min-h-10 justify-start gap-2 px-3">
            <action.icon data-icon="inline-start" />
            <span className="min-w-0 truncate">{action.label}</span>
          </Button>
        ))}
      </div>
    </section>
  );
}
