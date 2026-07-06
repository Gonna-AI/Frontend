import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Separator } from "@/components/dashboard-ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchDeviationsForProject,
  fetchLatestProject,
  subscribeToDeviations,
  type PipelineDeviationRow,
} from "@/dashboard/lib/pipelineClient";

const FALLBACK_BUCKETS = [
  { key: "highSeverity", count: 3, total: 5, impact: -900, barClass: "bg-chart-3" },
  { key: "mediumSeverity", count: 2, total: 5, impact: 1250, barClass: "bg-chart-3/75" },
  { key: "removedLineItem", count: 1, total: 5, impact: -2100, barClass: "bg-chart-3/50" },
];

function bucketize(deviations: PipelineDeviationRow[]) {
  const total = deviations.length;
  const high = deviations.filter((d) => d.severity === "high");
  const medium = deviations.filter((d) => d.severity === "medium");
  const removed = deviations.filter((d) => d.type === "REMOVED");

  const sum = (rows: PipelineDeviationRow[]) => rows.reduce((acc, r) => acc + Number(r.impact_eur), 0);

  return [
    { key: "highSeverity", count: high.length, total, impact: sum(high), barClass: "bg-chart-3" },
    { key: "mediumSeverity", count: medium.length, total, impact: sum(medium), barClass: "bg-chart-3/75" },
    { key: "removedLineItem", count: removed.length, total, impact: sum(removed), barClass: "bg-chart-3/50" },
  ];
}

function formatEur(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}€${Math.abs(Math.round(value)).toLocaleString("de-DE")}`;
}

export function IncomeBreakdown() {
  const { t } = useLanguage();
  const [buckets, setBuckets] = useState(FALLBACK_BUCKETS);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    fetchLatestProject()
      .then((project) => {
        if (cancelled || !project) return;

        const load = () => {
          fetchDeviationsForProject(project.id)
            .then((deviations) => {
              if (!cancelled && deviations.length > 0) setBuckets(bucketize(deviations));
            })
            .catch(() => undefined);
        };

        load();
        unsubscribe = subscribeToDeviations(project.id, load);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t('dashFinance.income.title')}</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-1 md:grid-cols-3">
        {buckets.map((bucket) => (
          <section className="isolate flex gap-[0.5px]" key={bucket.key}>
            <Separator
              orientation="vertical"
              className="mb-1 h-auto self-auto border-muted-foreground/50 border-l border-dashed bg-transparent"
            />
            <div className="flex min-h-24 flex-1 flex-col justify-between">
              <div className="flex min-w-0 flex-col gap-1 px-1">
                <p className="wrap-break-word text-muted-foreground text-xs leading-none">
                  {t(`dashFinance.income.${bucket.key}`)} · {t('dashFinance.income.countOfTotal').replace('{count}', String(bucket.count)).replace('{total}', String(bucket.total))}
                </p>
                <div className="text-lg leading-none tracking-tight">{formatEur(bucket.impact)}</div>
              </div>
              <div className={`-ml-0.5 h-5 rounded-sm ${bucket.barClass}`} />
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
