import { useEffect, useState } from "react";

import { ArrowDownRight, ArrowUpRight, Ellipsis } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { fetchAllDeviations, fetchDocuments, subscribeToTable } from "@/dashboard/lib/pipelineClient";
import { useLanguage } from "@/contexts/LanguageContext";

interface LiveStats {
  documentsProcessed: number;
  avgConfidencePct: number;
  deviationRatePct: number;
}

export function AnalyticsKpiStrip() {
  const { t } = useLanguage();
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      Promise.all([fetchDocuments(), fetchAllDeviations()])
        .then(([documents, deviations]) => {
          if (cancelled) return;
          if (documents.length === 0) return;

          const avgConfidence =
            deviations.length > 0
              ? (deviations.reduce((sum, d) => sum + Number(d.confidence), 0) / deviations.length) * 100
              : 0;

          setLive({
            documentsProcessed: documents.length,
            avgConfidencePct: avgConfidence,
            deviationRatePct: (deviations.length / documents.length) * 100,
          });
        })
        .catch(() => {
          // AI Performance falls back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribeDocs = subscribeToTable("pipeline_documents", load);
    const unsubscribeDeviations = subscribeToTable("pipeline_deviations", load);

    return () => {
      cancelled = true;
      unsubscribeDocs();
      unsubscribeDeviations();
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid divide-y *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t('dashAnalytics.kpi.pagesParsed')}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">1,240</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight />
                2.8%
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t('dashAnalytics.kpi.pagesParsed.from')} <span className="text-foreground">1,206</span>
              </span>
              <span>•</span>
              <span>{t('dashAnalytics.kpi.pagesParsed.note')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t('dashAnalytics.kpi.documentsProcessed')}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">{live ? live.documentsProcessed : 312}</div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight />
                2.1%
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t('dashAnalytics.kpi.pagesParsed.from')} <span className="text-foreground">305</span>
              </span>
              <span>•</span>
              <span>{live ? t('dashAnalytics.kpi.documentsProcessed.liveNote') : t('dashAnalytics.kpi.documentsProcessed.staticNote')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t('dashAnalytics.kpi.avgProcessingTime')}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">48s</div>
              <Badge className="bg-destructive/10 text-destructive">
                <ArrowDownRight />
                3.3%
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t('dashAnalytics.kpi.pagesParsed.from')} <span className="text-foreground">50s</span>
              </span>
              <span>•</span>
              <span>{t('dashAnalytics.kpi.avgProcessingTime.note')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t('dashAnalytics.kpi.avgExtractionConfidence')}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">
                {live ? `${live.avgConfidencePct.toFixed(1)}%` : "94.2%"}
              </div>
              <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUpRight />
                4.2%
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t('dashAnalytics.kpi.pagesParsed.from')} <span className="text-foreground">90.4%</span>
              </span>
              <span>•</span>
              <span>{live ? t('dashAnalytics.kpi.avgExtractionConfidence.liveNote') : t('dashAnalytics.kpi.avgExtractionConfidence.staticNote')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal text-sm">{t('dashAnalytics.kpi.deviationRate')}</CardTitle>
            <CardAction>
              <Ellipsis className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl leading-none tracking-tight">
                {live ? `${live.deviationRatePct.toFixed(1)}%` : "8.4%"}
              </div>
              <Badge className="bg-destructive/10 text-destructive">
                <ArrowDownRight />
                5.6%
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>
                {t('dashAnalytics.kpi.pagesParsed.from')} <span className="text-foreground">8.9%</span>
              </span>
              <span>•</span>
              <span>{live ? t('dashAnalytics.kpi.deviationRate.liveNote') : t('dashAnalytics.kpi.deviationRate.staticNote')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
