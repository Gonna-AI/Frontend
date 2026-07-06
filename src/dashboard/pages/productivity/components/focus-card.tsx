import { BellOff } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function FocusCard() {
  const { t } = useLanguage();

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{t("dashProductivity.focus.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="text-3xl tracking-tight">90:00</div>
            <Button className="min-w-24">{t("dashProductivity.focus.start")}</Button>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <BellOff className="size-3" />
            <span>{t("dashProductivity.focus.noNotifications")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
