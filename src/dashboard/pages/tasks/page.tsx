import { useEffect, useState } from "react";

import {
  fetchChecklistItems,
  subscribeToTable,
  type PipelineChecklistItemRow,
} from "@/dashboard/lib/pipelineClient";
import { useLanguage } from "@/contexts/LanguageContext";

import { buildLocalizedTasks, type Task } from "./components/data";
import { Tasks } from "./components/tasks";

function checklistItemToTask(item: PipelineChecklistItemRow): Task {
  const statusMap: Record<PipelineChecklistItemRow["status"], Task["status"]> = {
    open: "todo",
    in_progress: "in progress",
    done: "done",
  };

  return {
    id: item.id,
    title: item.label,
    status: statusMap[item.status],
    label: item.category ?? "review",
    priority: item.priority,
  };
}

export default function Page() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>(() => buildLocalizedTasks(t));
  const [usingLiveData, setUsingLiveData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchChecklistItems()
        .then((items) => {
          if (cancelled) return;
          if (items.length === 0) return;
          setUsingLiveData(true);
          setTasks(items.map(checklistItemToTask));
        })
        .catch(() => {
          // Keep showing the static seed rows if Supabase is briefly unreachable.
        });
    };

    load();
    const unsubscribe = subscribeToTable("pipeline_checklist_items", load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Re-localize the static seed rows whenever the language changes (live rows already
  // carry their own plain-text title from Supabase, so leave those as-is).
  useEffect(() => {
    if (usingLiveData) return;
    setTasks(buildLocalizedTasks(t));
  }, [t, usingLiveData]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl tracking-tight">{t("dashTasks.page.title")}</h2>
        <p className="text-muted-foreground">{t("dashTasks.page.subtitle")}</p>
      </div>
      <Tasks data={tasks} />
    </div>
  );
}
