import { Badge } from "@/components/dashboard-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function OverviewKpis() {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="grid grid-cols-1 xl:grid-cols-8">
        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">{t('dashFinance.kpi.quoteValue')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="text-3xl leading-none tracking-tight">€40,000</div>
              <p className="text-muted-foreground text-xs">{t('dashFinance.kpi.quoteValueSubtext')}</p>
            </div>
            <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">{t('dashFinance.kpi.quoted')}</Badge>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal">{t('dashFinance.kpi.orderValue')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl leading-none tracking-tight">€38,250</div>
              <p className="text-muted-foreground text-xs">{t('dashFinance.kpi.orderValueSubtext')}</p>
            </div>
            <Badge variant="destructive" className="bg-destructive/10 text-destructive">
              -€1,750
            </Badge>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 ring-0 xl:col-span-4 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">{t('dashFinance.kpi.netOrderImpact')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl leading-none tracking-tight">-€1,750</div>
              <p className="text-muted-foreground text-xs">{t('dashFinance.kpi.netOrderImpactSubtext')}</p>
            </div>
            <Badge variant="destructive" className="bg-destructive/10 text-destructive">
              4.4%
            </Badge>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 ring-0 xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-normal">{t('dashFinance.kpi.deviationsFound')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl leading-none tracking-tight">5</div>
              <p className="text-muted-foreground text-xs">{t('dashFinance.kpi.deviationsFoundSubtext')}</p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">{t('dashFinance.kpi.review')}</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
