
import * as React from "react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/dashboard-ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchShipments, subscribeToTable, type PipelineShipmentRow } from "@/dashboard/lib/pipelineClient";

import { buildShipments, type Shipment, type ShipmentStatus } from "./shipment-data";
import { ShipmentDetails } from "./shipment-details";
import { ShipmentList } from "./shipment-list";

const DB_STATUS_TO_SHIPMENT_STATUS: Record<PipelineShipmentRow["status"], ShipmentStatus> = {
  pending: "Scheduled",
  in_transit: "In Transit",
  delivered: "Delivered",
  on_hold: "On Hold",
};

// The two Bergmann Maschinenbau shipments in the static seed (TM-75 delivery, RS-90 substitute)
// correspond 1:1 to the two rows seeded in pipeline_shipments — match by cargo keyword and
// overlay their live status so this page reflects real writes without discarding the rest of
// the richer static route/handling detail that has no live backing yet.
function applyLiveStatus(shipments: Shipment[], liveRows: PipelineShipmentRow[] | null): Shipment[] {
  if (!liveRows || liveRows.length === 0) return shipments;

  const tm75Row = liveRows.find((row) => row.note?.includes("Liefertermin"));
  const rs90Row = liveRows.find((row) => row.note?.includes("RS-90"));

  return shipments.map((shipment) => {
    if (shipment.cargo.includes("TM-75") && tm75Row) {
      return { ...shipment, status: DB_STATUS_TO_SHIPMENT_STATUS[tm75Row.status] };
    }
    if (shipment.cargo.includes("RS-90") && rs90Row) {
      return { ...shipment, status: DB_STATUS_TO_SHIPMENT_STATUS[rs90Row.status] };
    }
    return shipment;
  });
}

export function Logistics() {
  const { t } = useLanguage();
  const staticShipments = React.useMemo(() => buildShipments(t), [t]);
  const [liveRows, setLiveRows] = React.useState<PipelineShipmentRow[] | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = React.useState<string | null>(staticShipments[0].id);

  React.useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchShipments()
        .then((rows) => {
          if (!cancelled) setLiveRows(rows);
        })
        .catch(() => {
          // Deliveries falls back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribe = subscribeToTable("pipeline_shipments", load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const shipments = React.useMemo(() => applyLiveStatus(staticShipments, liveRows), [staticShipments, liveRows]);
  const selectedShipment = shipments.find((shipment) => shipment.id === selectedShipmentId) ?? shipments[0];

  function handleSelectShipment(shipmentId: string) {
    setSelectedShipmentId(shipmentId);

    if (window.innerWidth < 1024) {
      setDetailsOpen(true);
    }
  }

  return (
    <>
      <div
        data-content-padding="false"
        className="grid h-[calc(100dvh-var(--dashboard-header-height))] overflow-hidden lg:grid-cols-[400px_minmax(0,1fr)] lg:divide-x"
      >
        <div className="h-full overflow-hidden">
          <ShipmentList
            shipments={shipments}
            selectedShipmentId={selectedShipmentId}
            onSelectShipment={handleSelectShipment}
          />
        </div>
        <div className="hidden h-full overflow-hidden lg:block">
          <ShipmentDetails shipment={selectedShipment} />
        </div>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side="right"
          className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:w-3/4"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>
              {selectedShipment
                ? t("dashLogistics.sheet.titleWithId").replace("{id}", selectedShipment.id)
                : t("dashLogistics.sheet.titleFallback")}
            </SheetTitle>
            <SheetDescription>{t("dashLogistics.sheet.description")}</SheetDescription>
          </SheetHeader>
          <ShipmentDetails shipment={selectedShipment} />
        </SheetContent>
      </Sheet>
    </>
  );
}
