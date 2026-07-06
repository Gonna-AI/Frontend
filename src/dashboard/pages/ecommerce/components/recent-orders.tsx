"use no memo";

import * as React from "react";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUpRight, Download, MoreHorizontal } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/dashboard-ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/dashboard-ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/dashboard-ui/toggle-group";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchDocuments,
  fetchProducts,
  type PipelineDocumentRow,
  type PipelineProductRow,
  subscribeToTable,
} from "@/dashboard/lib/pipelineClient";

import { buildRecentOrdersColumns } from "./recent-orders-table/columns";
import recentOrdersData from "./recent-orders-table/data.json";
import {
  formatOrderCount,
  formatSelectedOrderCount,
  preventPaginationNavigation,
} from "./recent-orders-table/formatters";
import { type OrderFilter, type OrderRow, orderFilters } from "./recent-orders-table/schema";

const RAW_FALLBACK_ORDERS = recentOrdersData as OrderRow[];

// Maps each static demo order id to the i18n keys for its (customer, items) display text,
// so the seed snapshot in data.json renders localized instead of German-only.
const fallbackOrderTextKeys: Record<string, { customer: string; items: string }> = {
  "#PB-2201": { customer: "dashEcommerce.orderData.pb2201.customer", items: "dashEcommerce.orderData.pb2201.items" },
  "#PB-2198": { customer: "dashEcommerce.orderData.pb2198.customer", items: "dashEcommerce.orderData.pb2198.items" },
  "#PB-2194": { customer: "dashEcommerce.orderData.pb2194.customer", items: "dashEcommerce.orderData.pb2194.items" },
  "#PB-2189": { customer: "dashEcommerce.orderData.pb2189.customer", items: "dashEcommerce.orderData.pb2189.items" },
  "#PB-2183": { customer: "dashEcommerce.orderData.pb2183.customer", items: "dashEcommerce.orderData.pb2183.items" },
  "#PB-2177": { customer: "dashEcommerce.orderData.pb2177.customer", items: "dashEcommerce.orderData.pb2177.items" },
  "#PB-2170": { customer: "dashEcommerce.orderData.pb2170.customer", items: "dashEcommerce.orderData.pb2170.items" },
  "#PB-2165": { customer: "dashEcommerce.orderData.pb2165.customer", items: "dashEcommerce.orderData.pb2165.items" },
  "#PB-2159": { customer: "dashEcommerce.orderData.pb2159.customer", items: "dashEcommerce.orderData.pb2159.items" },
  "#PB-2152": { customer: "dashEcommerce.orderData.pb2152.customer", items: "dashEcommerce.orderData.pb2152.items" },
};

function buildFallbackOrders(t: ReturnType<typeof useLanguage>["t"]): OrderRow[] {
  return RAW_FALLBACK_ORDERS.map((order) => {
    const textKeys = fallbackOrderTextKeys[order.id];
    if (!textKeys) return order;

    return {
      ...order,
      customer: t(textKeys.customer),
      items: t(textKeys.items),
    };
  });
}

const orderFilterLabelKeys: Record<OrderFilter, string> = {
  All: "dashEcommerce.orders.filter.all",
  "Needs action": "dashEcommerce.orders.filter.needsAction",
  Unfulfilled: "dashEcommerce.orders.filter.unfulfilled",
  Unpaid: "dashEcommerce.orders.filter.unpaid",
  Returns: "dashEcommerce.orders.filter.returns",
};

function formatEur(value: number): string {
  return `€${Math.round(value).toLocaleString("de-DE")}`;
}

/**
 * Builds "AI-Detected Procurement Needs" rows from genuinely queried data: every long-lead
 * product becomes a procurement need (mirroring the TM-75 style long-lead alert), each paired
 * with the most recent `bestellung` document as a stand-in customer/date context when available.
 */
function buildFromLiveData(
  products: PipelineProductRow[],
  documents: PipelineDocumentRow[],
  t: ReturnType<typeof useLanguage>["t"],
): OrderRow[] {
  const longLeadProducts = products.filter((p) => p.is_long_lead);
  if (longLeadProducts.length === 0) return [];

  const bestellungen = documents.filter((d) => d.kind === "bestellung");

  return longLeadProducts.map((product, index) => {
    const relatedDoc = bestellungen.length > 0 ? bestellungen[index % bestellungen.length] : undefined;
    const payment: OrderRow["payment"] = relatedDoc?.status === "error" ? "Refunded" : "Pending";

    return {
      id: `#PROC-${product.article_no}`,
      date: relatedDoc?.uploaded_at ?? new Date().toISOString(),
      customer: relatedDoc
        ? t("dashEcommerce.orders.orderReference").replace("{number}", relatedDoc.doc_number ?? relatedDoc.id.slice(0, 8))
        : t("dashEcommerce.orders.noRelatedDocument"),
      payment,
      total: formatEur(product.unit_price),
      items: t("dashEcommerce.orders.itemsLine")
        .replace("{article}", product.article_no)
        .replace("{name}", product.name)
        .replace("{weeks}", String(product.lead_time_weeks)),
      fulfillment: "Unfulfilled",
    };
  });
}

export function RecentOrders() {
  const { t } = useLanguage();
  const [liveOrders, setLiveOrders] = React.useState<OrderRow[]>([]);
  const recentOrdersColumns = React.useMemo(() => buildRecentOrdersColumns(t), [t]);

  React.useEffect(() => {
    let cancelled = false;

    const load = () => {
      Promise.all([fetchProducts(), fetchDocuments()])
        .then(([products, documents]) => {
          if (!cancelled) setLiveOrders(buildFromLiveData(products, documents, t));
        })
        .catch(() => {
          // Fall back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribeProducts = subscribeToTable("pipeline_products", load);
    const unsubscribeDocuments = subscribeToTable("pipeline_documents", load);

    return () => {
      cancelled = true;
      unsubscribeProducts();
      unsubscribeDocuments();
    };
  }, [t]);

  const fallbackOrders = React.useMemo(() => buildFallbackOrders(t), [t]);
  const recentOrders = liveOrders.length > 0 ? liveOrders : fallbackOrders;

  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: recentOrders,
    columns: recentOrdersColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const activeFilter = (table.getColumn("statusSummary")?.getFilterValue() as OrderFilter | undefined) ?? "All";
  const orderCount = table.getFilteredRowModel().rows.length;
  const selectedOrderCount = table.getSelectedRowModel().rows.length;
  const visibleOrderCount = table.getRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();
  const orderCountDescription =
    selectedOrderCount > 0
      ? formatSelectedOrderCount(selectedOrderCount, t)
      : formatOrderCount(activeFilter, orderCount, t);
  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 3) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    if (currentPage <= 2) return [1, 2, 3];
    if (currentPage >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];

    return [currentPage - 1, currentPage, currentPage + 1];
  }, [currentPage, pageCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">
          {t("dashEcommerce.orders.title")}
        </CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {orderCountDescription}
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          <Button aria-label={t("dashEcommerce.orders.openAria")} size="icon-sm" variant="outline">
            <ArrowUpRight />
          </Button>
          <Button aria-label={t("dashEcommerce.orders.downloadAria")} size="icon-sm" variant="outline">
            <Download />
          </Button>
          <Button size="icon-sm" variant="outline">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex items-center justify-between px-4">
          <ToggleGroup
            className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
            onValueChange={(value) => {
              if (!value) return;
              table.getColumn("statusSummary")?.setFilterValue(value === "All" ? undefined : value);
              table.setPageIndex(0);
            }}
            size="sm"
            spacing={1}
            type="single"
            value={activeFilter}
          >
            {orderFilters.map((filter) => (
              <ToggleGroupItem key={filter} value={filter}>
                {t(orderFilterLabelKeys[filter])}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => table.getColumn("date")?.toggleSorting(table.getColumn("date")?.getIsSorted() === "asc")}
          >
            <ArrowUpDown />
          </Button>
        </div>

        <div className="overflow-hidden">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:px-4 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={table.getVisibleLeafColumns().length}>
                    {t("dashEcommerce.orders.noOrdersFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-4 px-4 pb-1">
          <p className="text-muted-foreground text-sm">
            {t("dashEcommerce.orders.viewingSummary")
              .replace("{visible}", String(visibleOrderCount))
              .replace("{total}", orderCount.toLocaleString())}
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-1.5">
              <PaginationItem>
                <PaginationPrevious
                  className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : undefined}
                  href="#"
                  onClick={(event) => {
                    preventPaginationNavigation(event);
                    table.previousPage();
                  }}
                />
              </PaginationItem>
              {pageNumbers[0] > 1 ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              {pageNumbers.map((pageNumber) => (
                <PaginationItem key={`page-${pageNumber}`}>
                  <PaginationLink
                    href="#"
                    isActive={table.getState().pagination.pageIndex === pageNumber - 1}
                    onClick={(event) => {
                      preventPaginationNavigation(event);
                      table.setPageIndex(pageNumber - 1);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {pageNumbers[pageNumbers.length - 1] < pageCount ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationNext
                  className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : undefined}
                  href="#"
                  onClick={(event) => {
                    preventPaginationNavigation(event);
                    table.nextPage();
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
