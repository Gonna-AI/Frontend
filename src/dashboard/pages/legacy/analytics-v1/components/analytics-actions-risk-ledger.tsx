
import * as React from "react";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/dashboard-ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, formatCurrency } from "@/lib/utils";

type LedgerPriorityKey = "escalate" | "coach" | "reforecast" | null;
type StageKey = "legal" | "qualification" | "negotiation" | "proposal";

type LedgerRow = {
  id: number;
  account: string;
  dealId: string;
  stageKey: StageKey;
  overdueDays: number;
  owner: string;
  idleDays: number;
  priorityKey: LedgerPriorityKey;
  riskScore: number;
};

const LEDGER_ROWS: LedgerRow[] = [
  {
    id: 1,
    account: "Oscorp Labs",
    dealId: "OPP-489",
    stageKey: "legal",
    overdueDays: 35,
    owner: "Leila Zhang",
    idleDays: 36,
    priorityKey: "escalate",
    riskScore: 81,
  },
  {
    id: 2,
    account: "Hooli AI",
    dealId: "OPP-475",
    stageKey: "qualification",
    overdueDays: 28,
    owner: "Omar Ali",
    idleDays: 33,
    priorityKey: "coach",
    riskScore: 76,
  },
  {
    id: 3,
    account: "Globex Systems",
    dealId: "OPP-447",
    stageKey: "qualification",
    overdueDays: 37,
    owner: "Sofia Bautista",
    idleDays: 34,
    priorityKey: "coach",
    riskScore: 75,
  },
  {
    id: 4,
    account: "Umbrella Corp",
    dealId: "OPP-459",
    stageKey: "legal",
    overdueDays: 24,
    owner: "Leila Zhang",
    idleDays: 29,
    priorityKey: "coach",
    riskScore: 72,
  },
  {
    id: 5,
    account: "Acme Industries",
    dealId: "OPP-421",
    stageKey: "negotiation",
    overdueDays: 32,
    owner: "Leila Zhang",
    idleDays: 31,
    priorityKey: "coach",
    riskScore: 69,
  },
  {
    id: 6,
    account: "Wayne Devices",
    dealId: "OPP-471",
    stageKey: "proposal",
    overdueDays: 22,
    owner: "Sofia Bautista",
    idleDays: 32,
    priorityKey: "reforecast",
    riskScore: 56,
  },
  {
    id: 7,
    account: "Aperture Health",
    dealId: "OPP-497",
    stageKey: "proposal",
    overdueDays: 20,
    owner: "Omar Ali",
    idleDays: 30,
    priorityKey: "reforecast",
    riskScore: 50,
  },
  {
    id: 8,
    account: "Northwind Labs",
    dealId: "OPP-438",
    stageKey: "proposal",
    overdueDays: 14,
    owner: "Julian Singh",
    idleDays: 23,
    priorityKey: null,
    riskScore: 42,
  },
  {
    id: 9,
    account: "Stark Logistics",
    dealId: "OPP-463",
    stageKey: "negotiation",
    overdueDays: 10,
    owner: "Julian Singh",
    idleDays: 21,
    priorityKey: null,
    riskScore: 39,
  },
  {
    id: 10,
    account: "Soylent Foods",
    dealId: "OPP-482",
    stageKey: "negotiation",
    overdueDays: 5,
    owner: "Julian Singh",
    idleDays: 24,
    priorityKey: null,
    riskScore: 31,
  },
];

const priorityTone: Record<Exclude<LedgerPriorityKey, null>, string> = {
  escalate: "border-destructive/35 bg-destructive/10 text-destructive",
  coach: "border-primary/35 bg-primary/10 text-primary",
  reforecast: "border-amber-500/35 bg-amber-500/10 text-amber-700",
};

export function ActionsRiskLedger() {
  const { t } = useLanguage();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "riskScore", desc: true }]);

  const nextActionForRow = (row: LedgerRow) => {
    if (row.priorityKey === "escalate") return t('dashAnalyticsV1.riskLedger.nextAction.escalate');
    if (row.priorityKey === "coach") return t('dashAnalyticsV1.riskLedger.nextAction.coach');
    if (row.priorityKey === "reforecast") return t('dashAnalyticsV1.riskLedger.nextAction.reforecast');
    return t('dashAnalyticsV1.riskLedger.nextAction.none');
  };

  const ledgerColumns: ColumnDef<LedgerRow>[] = [
    {
      accessorKey: "account",
      header: t('dashAnalyticsV1.riskLedger.column.account'),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <p className="font-medium text-sm">{row.original.account}</p>
          <p className="text-muted-foreground text-xs">
            {row.original.dealId} · {t(`dashAnalyticsV1.riskLedger.stage.${row.original.stageKey}`)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "blocker",
      header: t('dashAnalyticsV1.riskLedger.column.blocker'),
      cell: ({ row }) => (
        <div className="max-w-44 whitespace-normal text-xs">
          {t('dashAnalyticsV1.riskLedger.blocker.overdueBy').replace('{days}', String(row.original.overdueDays))}
        </div>
      ),
    },
    {
      accessorKey: "owner",
      header: t('dashAnalyticsV1.riskLedger.column.owner'),
      cell: ({ row }) => <span className="text-xs">{row.original.owner}</span>,
    },
    {
      accessorKey: "idleDays",
      header: t('dashAnalyticsV1.riskLedger.column.idleDays'),
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.idleDays}d</span>,
    },
    {
      accessorKey: "closeVariance",
      header: t('dashAnalyticsV1.riskLedger.column.closeVariance'),
      cell: ({ row }) => (
        <span className="text-xs tabular-nums">
          {t('dashAnalyticsV1.riskLedger.closeVariance.overdue').replace('{days}', String(row.original.overdueDays))}
        </span>
      ),
    },
    {
      accessorKey: "nextAction",
      header: t('dashAnalyticsV1.riskLedger.column.nextAction'),
      cell: ({ row }) => (
        <div className="flex max-w-64 flex-col gap-1 whitespace-normal">
          {row.original.priorityKey ? (
            <Badge variant="outline" className={cn("text-[10px] uppercase", priorityTone[row.original.priorityKey])}>
              {t(`dashAnalyticsV1.riskLedger.priority.${row.original.priorityKey}`)}
            </Badge>
          ) : null}
          <p className="text-xs">{nextActionForRow(row.original)}</p>
        </div>
      ),
    },
    {
      accessorKey: "riskScore",
      header: ({ column }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="-mr-2 h-8 px-2 text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('dashAnalyticsV1.riskLedger.column.riskLadder')}
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Badge
            variant="outline"
            className={cn(
              "min-w-12 justify-center font-medium tabular-nums",
              row.original.riskScore >= 80 && "border-destructive/35 bg-destructive/10 text-destructive",
              row.original.riskScore >= 65 &&
                row.original.riskScore < 80 &&
                "border-amber-500/35 bg-amber-500/10 text-amber-700",
            )}
          >
            {row.original.riskScore}
          </Badge>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: LEDGER_ROWS,
    columns: ledgerColumns,
    getRowId: (row) => String(row.id),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="min-w-0 shadow-xs">
      <CardHeader>
        <CardTitle>{t('dashAnalyticsV1.riskLedger.title')}</CardTitle>
        <CardDescription>{t('dashAnalyticsV1.riskLedger.description')}</CardDescription>
        <CardAction>
          <Badge variant="outline" className="font-medium tabular-nums">
            {t('dashAnalyticsV1.riskLedger.accountsCount').replace('{count}', String(LEDGER_ROWS.length))}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-4 sm:divide-x sm:divide-border/60">
          <LedgerStat
            label={t('dashAnalyticsV1.riskLedger.stat.criticalAccounts.label')}
            value="1"
            detail={t('dashAnalyticsV1.riskLedger.stat.criticalAccounts.detail')}
          />
          <LedgerStat
            label={t('dashAnalyticsV1.riskLedger.stat.escalationsDue.label')}
            value="1"
            detail={t('dashAnalyticsV1.riskLedger.stat.escalationsDue.detail')}
          />
          <LedgerStat
            label={t('dashAnalyticsV1.riskLedger.stat.medianInactivity.label')}
            value="31d"
            detail={t('dashAnalyticsV1.riskLedger.stat.medianInactivity.detail')}
          />
          <LedgerStat
            label={t('dashAnalyticsV1.riskLedger.stat.overdueRevenue.label')}
            value={formatCurrency(1084000, { noDecimals: true })}
            detail={t('dashAnalyticsV1.riskLedger.stat.overdueRevenue.detail')}
          />
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LedgerStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1 px-0 sm:px-3 last:sm:pr-0 first:sm:pl-0">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold text-base tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{detail}</p>
    </div>
  );
}
