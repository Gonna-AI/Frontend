import { useEffect, useState } from "react";

import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchOpportunities, subscribeToTable, type PipelineOpportunityRow } from "@/dashboard/lib/pipelineClient";

interface LiveStats {
  anfragen: number;
  angeboteOffen: number;
  bestellungenInBearbeitung: number;
  conversionPct: number;
}

function computeStats(rows: PipelineOpportunityRow[]): LiveStats {
  const anfragen = rows.filter((r) => r.stage === "Anfrage").length;
  const angeboteOffen = rows.filter((r) => r.stage === "Angebot").length;
  const bestellungenInBearbeitung = rows.filter((r) => r.stage === "Bestellung").length;
  const ab = rows.filter((r) => r.stage === "AB").length;

  return {
    anfragen,
    angeboteOffen,
    bestellungenInBearbeitung,
    conversionPct: rows.length > 0 ? (ab / rows.length) * 100 : 0,
  };
}

export function KpiCards() {
  const { t } = useLanguage();
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchOpportunities()
        .then((rows) => {
          if (cancelled) return;
          if (rows.length === 0) return;
          setLive(computeStats(rows));
        })
        .catch(() => {
          // Sales Pipeline KPIs fall back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribe = subscribeToTable("pipeline_crm_opportunities", load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-3xl tracking-tight">{t("dashCrm.kpi.heading")}</h2>
        <p className="text-muted-foreground text-sm">{t("dashCrm.kpi.subheading")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>{t("dashCrm.kpi.requestsThisMonth")}</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none tracking-tight">{live ? live.anfragen : 37}</span>

              <Badge
                variant="outline"
                className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
              >
                <TrendingUp />
                {live ? t("dashCrm.kpi.live") : "+12%"}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="font-medium text-foreground">{live ? "—" : "33"}</span>{" "}
              <span className="text-muted-foreground">
                {live ? t("dashCrm.kpi.currentPipeline") : t("dashCrm.kpi.lastMonth")}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("dashCrm.kpi.openQuotes")}</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none tracking-tight">{live ? live.angeboteOffen : 14}</span>

              <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                <TrendingDown />
                {live ? t("dashCrm.kpi.live") : "-2.5%"}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="font-medium text-foreground">{live ? "—" : "16"}</span>{" "}
              <span className="text-muted-foreground">
                {live ? t("dashCrm.kpi.currentPipeline") : t("dashCrm.kpi.lastMonth")}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("dashCrm.kpi.ordersInProgress")}</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none tracking-tight">{live ? live.bestellungenInBearbeitung : 9}</span>

              <Badge
                variant="outline"
                className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
              >
                <TrendingUp />
                {live ? t("dashCrm.kpi.live") : "+2"}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="font-medium text-foreground">{live ? "—" : "7"}</span>{" "}
              <span className="text-muted-foreground">
                {live ? t("dashCrm.kpi.currentPipeline") : t("dashCrm.kpi.lastMonth")}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("dashCrm.kpi.conversionRate")}</CardDescription>
            <CardAction>
              <ArrowUpRight className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none tracking-tight">
                {live ? `${live.conversionPct.toFixed(1)}%` : "24.3%"}
              </span>

              <Badge
                variant="outline"
                className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-900/40 dark:bg-green-500/15 dark:text-green-300"
              >
                <TrendingUp />
                {live ? t("dashCrm.kpi.live") : "+1.6%"}
              </Badge>
            </div>
            <p className="text-sm">
              <span className="font-medium text-foreground">{live ? "—" : "22.7%"}</span>{" "}
              <span className="text-muted-foreground">
                {live ? t("dashCrm.kpi.shareAtAbStage") : t("dashCrm.kpi.lastMonth")}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
