import { useEffect, useState } from "react";

import {
  fetchChecklistItems,
  subscribeToTable,
  type PipelineChecklistItemRow,
} from "@/dashboard/lib/pipelineClient";

import { tasks as fallbackTasks, type Task } from "./components/data";
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
  const [tasks, setTasks] = useState<Task[]>(fallbackTasks);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchChecklistItems()
        .then((items) => {
          if (cancelled) return;
          if (items.length === 0) return;
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl tracking-tight">Checklisten</h2>
        <p className="text-muted-foreground">
          Automatisch generierte To-dos aus dem Abgleich von Angebot und Bestellung.
        </p>
      </div>
      <Tasks data={tasks} />
    </div>
  );
}
