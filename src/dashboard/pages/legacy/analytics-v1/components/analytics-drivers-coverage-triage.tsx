import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function DriversCoverageTriage() {
  const { t } = useLanguage();

  const leverOptions = [
    {
      key: "deal",
      label: t('dashAnalyticsV1.coverage.lever.deal.label'),
      value: t('dashAnalyticsV1.coverage.lever.deal.value').replace('{value}', '$72,133'),
      context: t('dashAnalyticsV1.coverage.lever.deal.context'),
    },
    {
      key: "conversion",
      label: t('dashAnalyticsV1.coverage.lever.conversion.label'),
      value: t('dashAnalyticsV1.coverage.lever.conversion.value').replace('{value}', '$49,182'),
      context: t('dashAnalyticsV1.coverage.lever.conversion.context'),
    },
    {
      key: "cycle",
      label: t('dashAnalyticsV1.coverage.lever.cycle.label'),
      value: t('dashAnalyticsV1.coverage.lever.cycle.value').replace('{value}', '$90,167'),
      context: t('dashAnalyticsV1.coverage.lever.cycle.context'),
    },
  ] as const;

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{t('dashAnalyticsV1.coverage.title')}</CardTitle>
        <CardDescription>{t('dashAnalyticsV1.coverage.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="destructive" className="rounded-md font-medium">
            {t('dashAnalyticsV1.coverage.badge.atRisk')}
          </Badge>
          <Badge variant="outline" className="font-medium tabular-nums">
            {t('dashAnalyticsV1.coverage.badge.ratio')}
          </Badge>
          <Badge variant="outline" className="font-medium tabular-nums">
            {t('dashAnalyticsV1.coverage.badge.gap').replace('{value}', '$222,930')}
          </Badge>
          <Badge variant="outline" className="font-medium tabular-nums">
            {t('dashAnalyticsV1.coverage.badge.dealsEta')}
          </Badge>
        </div>

        <p className="text-muted-foreground text-xs">
          {t('dashAnalyticsV1.coverage.summary')}
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {leverOptions.map((lever) => (
            <div key={lever.key} className="space-y-1 rounded-md border bg-muted/20 px-2.5 py-2">
              <p className="text-muted-foreground text-xs">{lever.label}</p>
              <p className="font-semibold text-sm tabular-nums">{lever.value}</p>
              <p className="text-muted-foreground text-xs">{lever.context}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              {t('dashAnalyticsV1.coverage.owner')} <span className="font-medium text-foreground">{t('dashAnalyticsV1.coverage.ownerName')}</span>
            </span>
            <span className="text-muted-foreground">
              {t('dashAnalyticsV1.coverage.focus')} <span className="text-foreground">{t('dashAnalyticsV1.coverage.focusValue')}</span>
            </span>
            <span className="text-muted-foreground">
              {t('dashAnalyticsV1.coverage.due')} <span className="text-foreground">{t('dashAnalyticsV1.coverage.dueValue')}</span>
            </span>
          </div>
          <Button variant="secondary" size="sm" className="h-7 px-3 text-xs">
            {t('dashAnalyticsV1.coverage.openTop5')}
          </Button>
        </div>

        <div className="space-y-1 rounded-md border border-dashed bg-muted/10 px-3 py-2.5">
          <p className="text-muted-foreground text-xs">
            {t('dashAnalyticsV1.coverage.fastestPath')} <span className="font-medium text-foreground">{t('dashAnalyticsV1.coverage.fastestPathValue')}</span> {t('dashAnalyticsV1.coverage.fastestPathSuffix')}
          </p>
          <p className="text-muted-foreground text-xs">
            {t('dashAnalyticsV1.coverage.prioritySequence')} <span className="text-foreground">{t('dashAnalyticsV1.coverage.prioritySequenceValue')}</span> {t('dashAnalyticsV1.coverage.prioritySequenceSuffix')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
