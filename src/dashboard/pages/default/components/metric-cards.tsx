import { AlertTriangle, FileStack, TrendingDown, TrendingUp, Timer } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function MetricCards() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <FileStack className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>{t("dashDefault.metric.documentsProcessed.label")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">142</div>
            <Badge>
              <TrendingUp className="size-3" />
              +12.5%
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("dashDefault.metric.documentsProcessed.description")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <AlertTriangle className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>{t("dashDefault.metric.deviationsCaught.label")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">37</div>
            <Badge variant="destructive">
              <TrendingUp className="size-3" />
              +20%
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("dashDefault.metric.deviationsCaught.description")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <TrendingDown className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>{t("dashDefault.metric.atRisk.label")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">€48,600</div>
            <Badge>
              <TrendingUp className="size-3" />
              +12.5%
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("dashDefault.metric.atRisk.description")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Timer className="size-4" />
            </div>
          </CardTitle>
          <CardDescription>{t("dashDefault.metric.hoursSaved.label")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">96</div>
            <Badge>
              <TrendingUp className="size-3" />
              +4.5%
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{t("dashDefault.metric.hoursSaved.description")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
