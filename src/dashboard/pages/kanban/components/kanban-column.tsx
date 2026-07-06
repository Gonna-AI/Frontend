
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { GripVertical, MoreVertical, Plus } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

import { SortableTaskCard } from "./sortable-task-card";
import type { Column, Task } from "./types";

const columnI18nKey: Record<Column["id"], string> = {
  ideas: "dashKanban.column.ideas",
  planned: "dashKanban.column.planned",
  building: "dashKanban.column.building",
  qa: "dashKanban.column.qa",
  shipped: "dashKanban.column.shipped",
};

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  const columnTitle = t(columnI18nKey[column.id]);

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn(
        "flex min-h-0 flex-col rounded-t-xl border bg-muted/50 transition-colors",
        isOver && "bg-muted/70",
        isDragging && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="-ml-2 cursor-grab text-foreground/70 active:cursor-grabbing"
              aria-label={t('dashKanban.column.dragAria').replace('{column}', columnTitle)}
              {...attributes}
              {...listeners}
            >
              <GripVertical />
            </Button>
            <h2 className="truncate font-medium text-base leading-none">{columnTitle}</h2>
          </div>
          <p className="text-muted-foreground text-sm tabular-nums leading-none">
            {tasks.length} {tasks.length === 1 ? t('dashKanban.taskCount.singular') : t('dashKanban.taskCount.plural')}
          </p>
        </div>
        <div className="-mr-2 flex items-center gap-0.5 text-muted-foreground">
          <Button variant="ghost" size="icon-sm" aria-label={t('dashKanban.column.addTaskAria').replace('{column}', columnTitle)}>
            <Plus />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={t('dashKanban.column.actionsAria').replace('{column}', columnTitle)}>
            <MoreVertical />
          </Button>
        </div>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} columnId={column.id} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
