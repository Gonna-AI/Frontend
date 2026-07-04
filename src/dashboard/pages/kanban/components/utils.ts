import type { PipelineChecklistItemRow } from "@/dashboard/lib/pipelineClient";

import { checklistStatusToColumnId, columnIds, fallbackTaskOwners } from "./data";
import type { BoardState, ColumnId, Task, TaskPriority, TaskTeam } from "./types";

function isColumnId(id: string): id is ColumnId {
  return columnIds.includes(id as ColumnId);
}

export function findColumnId(board: BoardState, id: string): ColumnId | undefined {
  if (isColumnId(id)) return id;
  return columnIds.find((columnId) => board[columnId].some((task) => task.id === id));
}

export function findTask(board: BoardState, id: string) {
  for (const columnId of columnIds) {
    const task = board[columnId].find((item) => item.id === id);
    if (task) return task;
  }
  return undefined;
}

const priorityLabel: Record<PipelineChecklistItemRow["priority"], TaskPriority> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const categoryTeam: Record<string, TaskTeam> = {
  procurement: "Product",
  review: "QA",
  engineering: "Backend",
  finance: "Finance Ops",
};

const ownerPool = Object.values(fallbackTaskOwners);

function ownerForItem(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ownerPool[hash % ownerPool.length];
}

function progressForStatus(status: PipelineChecklistItemRow["status"]): number {
  if (status === "done") return 100;
  if (status === "in_progress") return 45;
  return 5;
}

/** Maps live pipeline_checklist_items rows onto the board's 5-column shape (see data.ts for the
 * column <-> status mapping). Cards land in the column their current DB status designates. */
export function checklistItemsToBoard(items: PipelineChecklistItemRow[]): BoardState {
  const board: BoardState = { ideas: [], planned: [], building: [], qa: [], shipped: [] };

  for (const item of items) {
    const columnId = checklistStatusToColumnId[item.status];
    const task: Task = {
      id: item.id,
      title: item.label,
      description: item.label,
      priority: priorityLabel[item.priority] ?? "Medium",
      dueDate: new Date(item.created_at).toLocaleDateString("de-DE", { year: "numeric", month: "short" }),
      progress: progressForStatus(item.status),
      owner: ownerForItem(item.id),
      team: categoryTeam[item.category ?? ""] ?? "Product",
      insights: [],
    };
    board[columnId].push(task);
  }

  return board;
}
