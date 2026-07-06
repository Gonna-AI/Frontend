import { useEffect, useState } from "react";

import { ArrowRight, Clock3, Focus, TrendingUp } from "lucide-react-dash";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchAllProjects, fetchChecklistItems, subscribeToTable } from "@/dashboard/lib/pipelineClient";

export function SummaryCards() {
  const { t } = useLanguage();

  const FALLBACK_CARDS = [
    { title: t("dashProductivity.summary.today.title"), value: "3", description: t("dashProductivity.summary.today.description"), icon: Clock3 },
    { title: t("dashProductivity.summary.thisWeek.title"), value: "76%", description: t("dashProductivity.summary.thisWeek.description"), icon: TrendingUp },
    {
      title: t("dashProductivity.summary.focus.title"),
      value: t("dashProductivity.summary.focus.value"),
      description: t("dashProductivity.summary.focus.description").replace("{count}", "2"),
      icon: Focus,
    },
  ] as const;

  const [cards, setCards] = useState<{ title: string; value: string; description: string; icon: typeof Clock3 }[]>([
    ...FALLBACK_CARDS,
  ]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      Promise.all([fetchChecklistItems(), fetchAllProjects()])
        .then(([items, projects]) => {
          if (cancelled) return;
          if (items.length === 0) return;

          const open = items.filter((i) => i.status !== "done").length;
          const doneShare = items.length > 0 ? Math.round((items.filter((i) => i.status === "done").length / items.length) * 100) : 0;
          const focusProject = projects[0];
          const focusOpenCount = focusProject ? items.filter((i) => i.project_id === focusProject.id && i.status !== "done").length : 0;

          setCards([
            { title: t("dashProductivity.summary.today.title"), value: String(open), description: t("dashProductivity.summary.today.description"), icon: Clock3 },
            { title: t("dashProductivity.summary.thisWeek.title"), value: `${doneShare}%`, description: t("dashProductivity.summary.thisWeek.description"), icon: TrendingUp },
            {
              title: t("dashProductivity.summary.focus.title"),
              value: focusProject?.name ?? FALLBACK_CARDS[2].value,
              description: t("dashProductivity.summary.focus.description").replace("{count}", String(focusOpenCount)),
              icon: Focus,
            },
          ]);
        })
        .catch(() => {
          // Engineer Workload falls back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribe = subscribeToTable("pipeline_checklist_items", load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((item) => (
        <Card key={item.title} className="shadow-xs">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="grid size-7 place-items-center rounded-lg border bg-muted">
                  <item.icon className="size-4" />
                </div>
                {item.title}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="text-2xl leading-none tracking-tight">{item.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground tabular-nums leading-none">{item.description}</p>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
