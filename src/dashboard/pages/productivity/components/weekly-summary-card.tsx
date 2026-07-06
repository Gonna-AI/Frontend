import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Progress } from "@/components/dashboard-ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

export function WeeklySummaryCard() {
  const { t } = useLanguage();

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{t("dashProductivity.weeklySummary.title")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            {t("dashProductivity.weeklySummary.viewAll")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("dashProductivity.weeklySummary.description")}</p>
        <div className="flex flex-col gap-2">
          <div className="font-medium">{t("dashProductivity.weeklySummary.hoursSaved").replace("{hours}", "18.5")}</div>
          <Progress value={78} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
