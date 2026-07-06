
import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, RotateCcw } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { updateChecklistItemStatus } from "@/dashboard/lib/pipelineClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

import { getLocalizedLabels, getLocalizedPriorities, getLocalizedStatuses, type Task } from "./data";

// Tasks has 5 display statuses, pipeline_checklist_items only has 3 — collapse the same way the
// Kanban board does (backlog/todo -> open, "in progress" -> in_progress, done/canceled -> done).
const taskStatusToChecklistStatus: Record<string, "open" | "in_progress" | "done"> = {
  backlog: "open",
  todo: "open",
  "in progress": "in_progress",
  done: "done",
  canceled: "done",
};

const statusStyles: Record<string, string> = {
  backlog: "border-muted-foreground/20 bg-muted text-muted-foreground",
  todo: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "in progress": "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  done: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
  canceled: "border-muted-foreground/20 bg-muted text-muted-foreground",
};

function SortIcon({ sortDirection }: { sortDirection: false | "asc" | "desc" }) {
  if (sortDirection === "desc") {
    return <ArrowDown data-icon="inline-end" />;
  }

  if (sortDirection === "asc") {
    return <ArrowUp data-icon="inline-end" />;
  }

  return <ArrowUpDown data-icon="inline-end" />;
}

function TitleColumnHeader({ column }: { column: Column<Task, unknown> }) {
  const { t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground data-[state=open]:bg-accent">
          {t("dashTasks.column.title")}
          <SortIcon sortDirection={column.getIsSorted()} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => column.toggleSorting(false)}>
          <ArrowUp />
          {t("dashTasks.column.sortAscending")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => column.toggleSorting(true)}>
          <ArrowDown />
          {t("dashTasks.column.sortDescending")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => column.clearSorting()}>
          <RotateCcw />
          {t("dashTasks.column.sortReset")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function useTaskColumns(): ColumnDef<Task>[] {
  const { t } = useLanguage();
  const labels = getLocalizedLabels(t);
  const statuses = getLocalizedStatuses(t);
  const priorities = getLocalizedPriorities(t);

  return [
    {
      id: "select",
      size: 44,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("dashTasks.column.selectAllAria")}
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("dashTasks.column.selectRowAria")}
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: t("dashTasks.column.position"),
      size: 170,
      minSize: 140,
      cell: ({ row }) => {
        const id = String(row.getValue("id"));
        return (
          <div className="w-32 max-w-32 truncate font-mono text-muted-foreground text-sm" title={id}>
            {id}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => <TitleColumnHeader column={column} />,
      size: 520,
      minSize: 320,
      cell: ({ row }) => {
        const label = labels.find((label) => label.value === row.original.label);

        return (
          <div className="flex min-w-0 max-w-full items-center gap-2">
            {label && (
              <Badge className="shrink-0 rounded-sm bg-transparent" variant="outline">
                {label.label}
              </Badge>
            )}
            <span className="min-w-0 flex-1 truncate font-medium text-sm" title={String(row.getValue("title"))}>
              {row.getValue("title")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("dashTasks.column.status"),
      size: 150,
      cell: ({ row }) => {
        const status = statuses.find((status) => status.value === row.getValue("status"));

        if (!status) {
          return null;
        }

        return (
          <Badge className={cn("gap-1.5 rounded-sm border font-medium", statusStyles[status.value])} variant="outline">
            {status.icon && <status.icon className="size-4" />}
            {status.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "priority",
      header: t("dashTasks.column.priority"),
      size: 150,
      cell: ({ row }) => {
        const priority = priorities.find((priority) => priority.value === row.getValue("priority"));

        if (!priority) {
          return null;
        }

        return (
          <div className="flex items-center gap-2 text-sm">
            {priority.icon && <priority.icon className="size-4 text-muted-foreground" />}
            {priority.label}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      size: 70,
      cell: ({ row }) => {
        const task = row.original as Task;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground data-[state=open]:bg-muted">
                  <MoreHorizontal />
                  <span className="sr-only">{t("dashTasks.rowActions.openMenuAria")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>{t("dashTasks.rowActions.edit")}</DropdownMenuItem>
                <DropdownMenuItem>{t("dashTasks.rowActions.duplicate")}</DropdownMenuItem>
                <DropdownMenuItem>{t("dashTasks.rowActions.favorite")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>{t("dashTasks.rowActions.status")}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={task.status}
                      onValueChange={(value) => {
                        updateChecklistItemStatus(task.id, taskStatusToChecklistStatus[value]).catch(() => {
                          // Best-effort — a Realtime refetch will reconcile the table if this write fails.
                        });
                      }}
                    >
                      {statuses.map((status) => (
                        <DropdownMenuRadioItem key={status.value} value={status.value}>
                          {status.icon && <status.icon className="mr-2 size-4" />}
                          {status.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>{t("dashTasks.rowActions.category")}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={task.label}>
                      {labels.map((label) => (
                        <DropdownMenuRadioItem key={label.value} value={label.value}>
                          {label.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {t("dashTasks.rowActions.delete")}
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
