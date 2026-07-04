"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { updateOpportunityStage, type PipelineOpportunityRow } from "@/dashboard/lib/pipelineClient";
import { cn } from "@/lib/utils";

import { STAGE_OPTIONS, type OpportunityRow } from "./schema";

const healthStripSlots = Array.from({ length: 18 }, (_, index) => ({
  id: `strip-${index + 1}`,
  threshold: index + 1,
}));

function getHealthScore(health: OpportunityRow["health"]) {
  switch (health) {
    case "On Track":
      return 18;
    case "Needs Review":
      return 11;
    case "At Risk":
      return 7;
    case "On Hold":
      return 4;
    default:
      return 0;
  }
}

export const opportunitiesColumns: ColumnDef<OpportunityRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all opportunities"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select ${row.original.account}`}
      />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="text-sm tracking-tight">{row.original.id}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "account",
    header: "Account",
    cell: ({ row }) => <div className="font-medium text-sm">{row.original.account}</div>,
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">
            <Badge variant="outline" className="cursor-pointer rounded-full px-2.5 hover:bg-muted">
              {row.original.stage}
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={row.original.stage}
            onValueChange={(value) => {
              updateOpportunityStage(row.original.id, value as PipelineOpportunityRow["stage"]).catch(() => {
                // Best-effort — a Realtime refetch will reconcile the table if this write fails.
              });
            }}
          >
            {STAGE_OPTIONS.map((stage) => (
              <DropdownMenuRadioItem key={stage} value={stage}>
                {stage}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    filterFn: "equalsString",
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <div className="text-sm">{row.original.priority}</div>,
  },
  {
    accessorKey: "health",
    header: "Health",
    cell: ({ row }) => (
      <div className="flex items-end gap-0.5" title={row.original.health}>
        <span className="sr-only">{row.original.health}</span>
        {healthStripSlots.map((slot) => (
          <div
            key={`${row.original.id}-${slot.id}`}
            className={cn(
              "h-5 w-1 rounded-full",
              slot.threshold <= getHealthScore(row.original.health) ? "bg-green-500/85" : "bg-green-500/15",
            )}
          />
        ))}
      </div>
    ),
    filterFn: "equalsString",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => <div className="font-medium text-sm tabular-nums">{row.original.value}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Edit</div>,
    cell: () => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground hover:bg-transparent focus-visible:bg-transparent"
        >
          <Pencil />
          <span className="sr-only">Edit opportunity</span>
        </Button>
      </div>
    ),
    enableHiding: false,
  },
];
