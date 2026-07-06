import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { MoreHorizontal } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import type { useLanguage } from "@/contexts/LanguageContext";

import type { OrderRow } from "./schema";

function formatOrderDate(date: string) {
  return format(parseISO(date), "h:mm a, d MMM yyyy");
}

function PaymentBadge({ status, t }: { status: OrderRow["payment"]; t: ReturnType<typeof useLanguage>["t"] }) {
  if (status === "Paid") {
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        {t("dashEcommerce.orders.badge.paid")}
      </Badge>
    );
  }

  if (status === "Refunded") {
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        {t("dashEcommerce.orders.badge.refunded")}
      </Badge>
    );
  }

  return (
    <Badge
      className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
      variant="outline"
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t("dashEcommerce.orders.badge.pending")}
    </Badge>
  );
}

function FulfillmentBadge({ status, t }: { status: OrderRow["fulfillment"]; t: ReturnType<typeof useLanguage>["t"] }) {
  if (status === "Fulfilled") {
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        {t("dashEcommerce.orders.badge.fulfilled")}
      </Badge>
    );
  }

  if (status === "Returned") {
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        {t("dashEcommerce.orders.badge.returned")}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <span className="size-1.5 rounded-full bg-current" />
      {t("dashEcommerce.orders.badge.unfulfilled")}
    </Badge>
  );
}

export function buildRecentOrdersColumns(t: ReturnType<typeof useLanguage>["t"]): ColumnDef<OrderRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="w-10">
          <Checkbox
            aria-label={t("dashEcommerce.orders.selectAllAria")}
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-10">
          <Checkbox
            aria-label={t("dashEcommerce.orders.selectOneAria").replace("{id}", row.original.id)}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: "id",
      header: t("dashEcommerce.orders.column.need"),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="font-medium leading-none">{row.original.id}</div>
          <div className="text-muted-foreground text-xs">{row.original.items}</div>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "customer",
      header: t("dashEcommerce.orders.column.project"),
    },
    {
      id: "statusSummary",
      header: t("dashEcommerce.orders.column.status"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PaymentBadge status={row.original.payment} t={t} />
          <FulfillmentBadge status={row.original.fulfillment} t={t} />
        </div>
      ),
      filterFn: (row, _columnId, value) => {
        if (value === "Needs action") {
          return (
            row.original.payment === "Pending" ||
            row.original.payment === "Refunded" ||
            row.original.fulfillment === "Unfulfilled" ||
            row.original.fulfillment === "Returned"
          );
        }

        if (value === "Unfulfilled") {
          return row.original.fulfillment === "Unfulfilled";
        }

        if (value === "Unpaid") {
          return row.original.payment === "Pending";
        }

        if (value === "Returns") {
          return row.original.payment === "Refunded" || row.original.fulfillment === "Returned";
        }

        return true;
      },
    },
    {
      accessorKey: "total",
      header: () => <div className="w-28">{t("dashEcommerce.orders.column.value")}</div>,
      cell: ({ row }) => <div className="w-28 tabular-nums">{row.original.total}</div>,
    },
    {
      accessorKey: "date",
      header: () => <div className="w-44">{t("dashEcommerce.orders.column.detectedAt")}</div>,
      cell: ({ row }) => <div className="w-44 text-muted-foreground">{formatOrderDate(row.original.date)}</div>,
    },
    {
      id: "actions",
      header: () => <div className="flex w-full justify-end">{t("dashEcommerce.orders.column.actions")}</div>,
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex w-full justify-end">
              <Button aria-label={t("dashEcommerce.orders.actionsAria")} size="icon-sm" variant="ghost">
                <MoreHorizontal />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>{t("dashEcommerce.orders.menu.actions")}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>{t("dashEcommerce.orders.menu.viewNeed")}</DropdownMenuItem>
              <DropdownMenuItem>{t("dashEcommerce.orders.menu.orderNow")}</DropdownMenuItem>
              <DropdownMenuItem>{t("dashEcommerce.orders.menu.copyNeedId")}</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];
}
