import { Plane, Search, Ship, SlidersHorizontal, Truck } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/dashboard-ui/input-group";
import { ScrollArea } from "@/components/dashboard-ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

import type { Shipment } from "./shipment-data";

const modeIcons = {
  air: Plane,
  land: Truck,
  sea: Ship,
} as const;

const progressRingClasses: Record<Shipment["status"], string> = {
  Scheduled: "text-muted-foreground",
  "In Transit": "text-primary",
  "Out for Delivery": "text-primary",
  Delivered: "text-green-600",
  Delayed: "text-destructive",
  "On Hold": "text-amber-500",
  "Customs Hold": "text-amber-500",
};

const statusLabelKeys: Record<Shipment["status"], string> = {
  Scheduled: "dashLogistics.status.scheduled",
  "In Transit": "dashLogistics.status.inTransit",
  "Out for Delivery": "dashLogistics.status.outForDelivery",
  Delivered: "dashLogistics.status.delivered",
  Delayed: "dashLogistics.status.delayed",
  "On Hold": "dashLogistics.status.onHold",
  "Customs Hold": "dashLogistics.status.customsHold",
};

function getProgressRingClass(status: Shipment["status"]) {
  return cn(
    "grid size-3 place-items-center rounded-full p-[0.5px] bg-[conic-gradient(currentColor_0deg_var(--angle),transparent_var(--angle)_360deg)]",
    progressRingClasses[status],
  );
}

const etaMetaLabelKeys: Record<string, string> = {
  Today: "dashLogistics.etaMeta.today",
  Tomorrow: "dashLogistics.etaMeta.tomorrow",
  "Delivered Yesterday": "dashLogistics.etaMeta.deliveredYesterday",
  "Departing Today": "dashLogistics.etaMeta.departingToday",
  Friday: "dashLogistics.etaMeta.friday",
  Wednesday: "dashLogistics.etaMeta.wednesday",
};

function translateEtaMeta(t: (key: string) => string, etaMeta: string) {
  const key = etaMetaLabelKeys[etaMeta];
  return key ? t(key) : etaMeta;
}

type ShipmentCardProps = {
  active?: boolean;
  onSelectShipment: (shipmentId: Shipment["id"]) => void;
  shipment: Shipment;
};

type ShipmentListProps = {
  onSelectShipment: (shipmentId: Shipment["id"]) => void;
  selectedShipmentId: Shipment["id"] | null;
  shipments: Shipment[];
};

function ShipmentCard({ shipment, active, onSelectShipment }: ShipmentCardProps) {
  const { t } = useLanguage();
  const angle = (shipment.progress / 100) * 360;
  const Icon = modeIcons[shipment.mode];

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={(event) => {
        event.currentTarget.blur();
        onSelectShipment(shipment.id);
      }}
      className={cn(
        "flex w-full min-w-0 flex-col gap-5 overflow-hidden rounded-xl border p-3 text-left transition-colors",
        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active && "border-primary bg-muted/50",
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0 truncate">#{shipment.id}</div>

        <div className="flex shrink-0 items-center gap-1">
          <div
            style={{ "--angle": `${angle}deg` } as React.CSSProperties}
            className={getProgressRingClass(shipment.status)}
          >
            <div className="grid size-2 place-items-center rounded-full bg-card">
              <div className="size-1 rounded-full bg-current" />
            </div>
          </div>
          <div className="text-muted-foreground text-xs">{t(statusLabelKeys[shipment.status])}</div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className={cn(`flag:${shipment.origin.countryCode.toUpperCase()}`, "rounded-xs text-3xl outline")} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate font-medium text-xs leading-none">{shipment.origin.country},</div>
            <div className="truncate text-muted-foreground text-xs">{shipment.origin.display}</div>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-1.5 text-right">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate font-medium text-xs leading-none">{shipment.destination.country},</div>
            <div className="truncate text-muted-foreground text-xs">{shipment.destination.display}</div>
          </div>
          <div
            className={cn(`flag:${shipment.destination.countryCode.toUpperCase()}`, "rounded-xs text-3xl outline")}
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <span
          className="h-px min-w-0 border-foreground border-t border-dashed"
          style={{ flexGrow: shipment.progress, flexBasis: 0 }}
        />
        <Icon className={cn("size-3.5", shipment.mode === "air" && "rotate-45")} />
        <span
          className="h-px min-w-0 border-border border-t border-dashed"
          style={{ flexGrow: 100 - shipment.progress, flexBasis: 0 }}
        />
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0">
          <div className="text-muted-foreground text-xs leading-none">{t("dashLogistics.list.cargoLabel")}</div>
          <div className="truncate text-sm tracking-tight">{shipment.cargo}</div>
        </div>
        <div className="max-w-[45%] text-right">
          <div className="text-muted-foreground text-xs leading-none">{t("dashLogistics.list.etaLabel")}</div>
          <div className="text-sm tabular-nums tracking-tight">
            {shipment.eta}
            {shipment.etaMeta && (
              <span className="ml-1 font-normal text-muted-foreground text-xs">
                {translateEtaMeta(t, shipment.etaMeta)}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function ShipmentList({ shipments, selectedShipmentId, onSelectShipment }: ShipmentListProps) {
  const { t } = useLanguage();

  return (
    <Card className="h-full rounded-none ring-0">
      <CardHeader>
        <CardTitle className="font-normal text-xl">{t("dashLogistics.list.title")}</CardTitle>
        <CardAction>
          <Button size="icon-sm" variant="ghost">
            <SlidersHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden px-0">
        <Tabs defaultValue="all" className="min-w-0">
          <TabsList
            className="h-auto min-h-8 w-full justify-start overflow-x-auto border-b px-4 **:data-[slot=tabs-trigger]:h-8"
            variant="line"
          >
            <TabsTrigger className="text-xs" value="all">
              {t("dashLogistics.list.tabs.all").replace("{count}", "12")}
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="in-transit">
              {t("dashLogistics.list.tabs.inTransit").replace("{count}", "4")}
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="delivered">
              {t("dashLogistics.list.tabs.delivered").replace("{count}", "2")}
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="delayed">
              {t("dashLogistics.list.tabs.delayed").replace("{count}", "1")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="px-4">
          <InputGroup className="h-8">
            <InputGroupInput
              className="h-8"
              aria-label={t("dashLogistics.list.searchAria")}
              placeholder={t("dashLogistics.list.searchPlaceholder")}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <ScrollArea className="h-0 flex-1">
          <div className="flex flex-col gap-4 px-4">
            {shipments.map((shipment) => (
              <ShipmentCard
                active={shipment.id === selectedShipmentId}
                key={shipment.id}
                shipment={shipment}
                onSelectShipment={onSelectShipment}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
