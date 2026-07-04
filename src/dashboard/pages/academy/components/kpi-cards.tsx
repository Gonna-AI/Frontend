import { useEffect, useState } from "react";

import { ArrowUp, Info } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { fetchAllChatMessages, fetchAllProjects, fetchHistoricalProjects, subscribeToTable } from "@/dashboard/lib/pipelineClient";

interface LiveStats {
  totalProjects: number;
  indexedCount: number;
  copilotQueries: number;
  activeProjectsToday: number;
}

export function KpiCards() {
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      Promise.all([fetchHistoricalProjects(), fetchAllChatMessages(), fetchAllProjects()])
        .then(([historical, messages, projects]) => {
          if (cancelled) return;
          if (historical.length === 0) return;

          setLive({
            totalProjects: historical.length,
            indexedCount: historical.filter((p) => p.embedding !== null).length,
            copilotQueries: messages.filter((m) => m.role === "user").length,
            activeProjectsToday: projects.filter((p) => p.status === "active").length,
          });
        })
        .catch(() => {
          // Project Memory falls back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubHistorical = subscribeToTable("pipeline_historical_projects", load);
    const unsubMessages = subscribeToTable("pipeline_chat_messages", load);

    return () => {
      cancelled = true;
      unsubHistorical();
      unsubMessages();
    };
  }, []);

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projects Indexed</CardTitle>
            <CardAction>
              <Info className="size-3 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xl text-foreground leading-none tracking-tight">
                {live ? live.indexedCount : 0}
                <span className="text-muted-foreground text-lg">/{live ? live.totalProjects : 12}</span>
              </span>
              {live && live.indexedCount === 0 && (
                <Badge className="rounded-sm border-amber-600/50 bg-amber-500/10 px-1 font-normal text-amber-700 text-xs dark:border-amber-800/50 dark:bg-amber-500/15 dark:text-amber-300">
                  Pending
                </Badge>
              )}
              {!live && (
                <Badge className="rounded-sm border-green-600/50 bg-green-500/10 px-1 font-normal text-green-700 text-xs dark:border-green-800/50 dark:bg-green-500/15 dark:text-green-300">
                  <ArrowUp />
                  2.8%
                </Badge>
              )}
            </div>
            <div className="text-right text-muted-foreground text-xs">
              {live && live.indexedCount === 0
                ? "embeddings pending — VPS worker not yet deployed"
                : "across 3 monitored companies"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg. Retrieval Hit Rate</CardTitle>
            <CardAction>
              <Info className="size-3 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xl text-foreground leading-none tracking-tight">94.2%</span>
              <Badge className="rounded-sm border-green-600/50 bg-green-500/10 px-1 font-normal text-green-700 text-xs dark:border-green-800/50 dark:bg-green-500/15 dark:text-green-300">
                <ArrowUp />
                1.1%
              </Badge>
            </div>
            <div className="text-right text-muted-foreground text-xs">
              seeded estimate — pg_trgm retrieval is live, this % isn&apos;t tracked yet
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Copilot Queries</CardTitle>
            <CardAction>
              <Info className="size-3 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="text-3xl text-foreground leading-none tracking-tight">{live ? live.copilotQueries : 81}</div>

            <div className="text-right text-muted-foreground text-xs">{live ? "live count, all threads" : "63 answered · 18 escalated"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Projects</CardTitle>
            <CardAction>
              <Info className="size-3 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="text-3xl text-foreground leading-none tracking-tight">{live ? live.activeProjectsToday : 5}</div>

            <div className="text-right text-muted-foreground text-xs">{live ? "status = active" : "1 processing · 3 in review · 1 flagged"}</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
