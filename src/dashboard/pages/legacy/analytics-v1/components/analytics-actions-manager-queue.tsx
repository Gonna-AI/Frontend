import { Badge } from "@/components/dashboard-ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";

const NEXT_INTERVENTIONS = [
  {
    dealId: "OPP-489",
    priorityKey: "escalate" as const,
    owner: "Leila Zhang",
    risk: 81,
    recommendationKey: "escalate" as const,
  },
  {
    dealId: "OPP-475",
    priorityKey: "coach" as const,
    owner: "Omar Ali",
    risk: 76,
    recommendationKey: "coach" as const,
  },
  {
    dealId: "OPP-447",
    priorityKey: "coach" as const,
    owner: "Sofia Bautista",
    risk: 75,
    recommendationKey: "coach" as const,
  },
] as const;

export function ActionsManagerQueue() {
  const { t } = useLanguage();

  return (
    <Card className="h-full shadow-xs">
      <CardHeader>
        <CardTitle>{t('dashAnalyticsV1.managerQueue.title')}</CardTitle>
        <CardDescription>{t('dashAnalyticsV1.managerQueue.description')}</CardDescription>
      </CardHeader>

      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex h-full flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <StatCard label={t('dashAnalyticsV1.managerQueue.stat.actionableDeals')} value="7" />
            <StatCard label={t('dashAnalyticsV1.managerQueue.stat.revenueInPlay')} value={formatCurrency(811000, { noDecimals: true })} mono />
            <StatCard label={t('dashAnalyticsV1.managerQueue.stat.ownersEngaged')} value="3" />
            <StatCard label={t('dashAnalyticsV1.managerQueue.stat.medianRisk')} value="72" mono />
          </div>

          <div className="space-y-2 rounded-md border bg-muted/20 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">{t('dashAnalyticsV1.managerQueue.interventionMix')}</p>
              <Badge variant="outline" className="h-5 px-2 text-[11px] tabular-nums">
                {t('dashAnalyticsV1.managerQueue.escalateBadge').replace('{value}', formatCurrency(174000, { noDecimals: true }))}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between rounded-md border bg-background/70 px-2.5 py-1.5">
                <span className="text-xs">{t('dashAnalyticsV1.managerQueue.escalate')}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t('dashAnalyticsV1.managerQueue.dealsShare')
                    .replace('{count}', '1')
                    .replace('{pct}', '14')
                    .replace('{value}', formatCurrency(174000, { noDecimals: true }))}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-background/70 px-2.5 py-1.5">
                <span className="text-xs">{t('dashAnalyticsV1.managerQueue.coach')}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t('dashAnalyticsV1.managerQueue.dealsShare')
                    .replace('{count}', '4')
                    .replace('{pct}', '57')
                    .replace('{value}', formatCurrency(478000, { noDecimals: true }))}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-background/70 px-2.5 py-1.5">
                <span className="text-xs">{t('dashAnalyticsV1.managerQueue.reforecast')}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t('dashAnalyticsV1.managerQueue.dealsShare')
                    .replace('{count}', '2')
                    .replace('{pct}', '29')
                    .replace('{value}', formatCurrency(159000, { noDecimals: true }))}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-md border bg-muted/20 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">{t('dashAnalyticsV1.managerQueue.managerFocus')}</p>
              <span className="text-muted-foreground text-xs tabular-nums">{t('dashAnalyticsV1.managerQueue.thisForecastCycle')}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2 rounded-md border bg-background/70 px-2.5 py-1.5">
                <span>{t('dashAnalyticsV1.managerQueue.coachQueue')}</span>
                <span className="text-muted-foreground tabular-nums">
                  {t('dashAnalyticsV1.managerQueue.dealsValue')
                    .replace('{count}', '4')
                    .replace('{value}', formatCurrency(478000, { noDecimals: true }))}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-md border bg-background/70 px-2.5 py-1.5">
                <span>{t('dashAnalyticsV1.managerQueue.primaryOwner')}</span>
                <span className="text-muted-foreground tabular-nums">
                  {t('dashAnalyticsV1.managerQueue.ownerDeals').replace('{owner}', 'Leila Zhang').replace('{count}', '3')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-md border bg-background/70 px-2.5 py-1.5">
                <span>{t('dashAnalyticsV1.managerQueue.stalePipeline')}</span>
                <span className="text-muted-foreground tabular-nums">
                  {t('dashAnalyticsV1.managerQueue.dealsValue')
                    .replace('{count}', '8')
                    .replace('{value}', formatCurrency(1151000, { noDecimals: true }))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-muted-foreground text-xs">{t('dashAnalyticsV1.managerQueue.nextInterventions')}</p>

            {NEXT_INTERVENTIONS.map((item) => (
              <div key={`${item.priorityKey}-${item.dealId}`} className="space-y-1 rounded-md border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{item.dealId}</span>
                  <Badge variant="outline" className="h-5 px-2 text-[11px]">
                    {t(`dashAnalyticsV1.managerQueue.${item.priorityKey}`)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t('dashAnalyticsV1.managerQueue.ownerRisk').replace('{owner}', item.owner).replace('{risk}', String(item.risk))}
                </p>
                <p className="text-xs">{t(`dashAnalyticsV1.managerQueue.recommendation.${item.recommendationKey}`)}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
            <span className="text-muted-foreground text-xs">{t('dashAnalyticsV1.managerQueue.noActionMonitor')}</span>
            <span className="font-medium text-xs tabular-nums">{t('dashAnalyticsV1.managerQueue.dealsCount').replace('{count}', '3')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border bg-muted/20 px-2.5 py-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={mono ? "font-semibold text-base tabular-nums" : "font-semibold text-base"}>{value}</p>
    </div>
  );
}
