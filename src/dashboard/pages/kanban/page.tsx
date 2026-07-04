import { useEffect, useState } from "react";

import { fetchChecklistItems, subscribeToTable } from "@/dashboard/lib/pipelineClient";

import { initialBoard as fallbackBoard } from "./components/data";
import { Kanban } from "./components/kanban";
import type { BoardState } from "./components/types";
import { checklistItemsToBoard } from "./components/utils";

export default function Page() {
  const [board, setBoard] = useState<BoardState>(fallbackBoard);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchChecklistItems()
        .then((items) => {
          if (cancelled) return;
          if (items.length === 0) return;
          setBoard(checklistItemsToBoard(items));
        })
        .catch(() => {
          // Keep showing the static seed board if Supabase is briefly unreachable.
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
    <div data-content-padding="false">
      <Kanban initialBoard={board} />
    </div>
  );
}
