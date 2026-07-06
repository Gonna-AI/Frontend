import { AlertTriangleIcon, Copy, Plane, Ship, Star, Truck } from "lucide-react-dash";

import { Alert, AlertDescription, AlertTitle } from "@/components/dashboard-ui/alert";
import { Avatar, AvatarFallback } from "@/components/dashboard-ui/avatar";
import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Separator } from "@/components/dashboard-ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

import type { Shipment } from "./shipment-data";
import { ShipmentRouteMap } from "./shipment-route-map";

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

const statusBadgeClasses: Record<Shipment["status"], string> = {
  Scheduled: "border-muted bg-muted/50 text-muted-foreground",
  "In Transit": "border-primary/20 bg-primary/10 text-primary",
  "Out for Delivery": "border-primary/20 bg-primary/10 text-primary",
  Delivered: "border-green-600/20 bg-green-600/10 text-green-600",
  Delayed: "border-destructive/20 bg-destructive/10 text-destructive",
  "On Hold": "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Customs Hold": "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

type ShipmentDetailsProps = {
  shipment: Shipment | null;
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

const tierLabelKeys: Record<Shipment["customer"]["tier"], string> = {
  Priority: "dashLogistics.tier.priority",
  Standard: "dashLogistics.tier.standard",
  "Non-priority": "dashLogistics.tier.nonPriority",
};

const tierDescriptionKeys: Record<string, string> = {
  "Flagship project account": "dashLogistics.tierLabel.flagshipProjectAccount",
  "Top 1% by order volume": "dashLogistics.tierLabel.top1PercentByOrderVolume",
  "Internal stock replenishment": "dashLogistics.tierLabel.internalStockReplenishment",
  "Recurring order account": "dashLogistics.tierLabel.recurringOrderAccount",
  "Occasional order account": "dashLogistics.tierLabel.occasionalOrderAccount",
  "Managed order account": "dashLogistics.tierLabel.managedOrderAccount",
};

const handlingLabelKeys: Record<string, string> = {
  "Long-lead special order": "dashLogistics.handling.longLeadSpecialOrder",
  "Substituted part": "dashLogistics.handling.substitutedPart",
  "Precision tooling": "dashLogistics.handling.precisionTooling",
  "Heavy machinery": "dashLogistics.handling.heavyMachinery",
  "Standard freight": "dashLogistics.handling.standardFreight",
  "Heavy bulk cargo": "dashLogistics.handling.heavyBulkCargo",
  "Sensitive precision tooling": "dashLogistics.handling.sensitivePrecisionTooling",
  "Industrial parts": "dashLogistics.handling.industrialParts",
  "High-value precision cargo": "dashLogistics.handling.highValuePrecisionCargo",
  "Fragile precision cargo": "dashLogistics.handling.fragilePrecisionCargo",
};

const tagLabelKeys: Record<string, string> = {
  "Do not stack": "dashLogistics.tag.doNotStack",
  "Keep upright": "dashLogistics.tag.keepUpright",
  "Signature required": "dashLogistics.tag.signatureRequired",
  "Forklift only": "dashLogistics.tag.forkliftOnly",
  "Secure load": "dashLogistics.tag.secureLoad",
  "Do not tip": "dashLogistics.tag.doNotTip",
  "Keep dry": "dashLogistics.tag.keepDry",
  "Seal intact": "dashLogistics.tag.sealIntact",
  "Standard handoff": "dashLogistics.tag.standardHandoff",
  "Heavy lift": "dashLogistics.tag.heavyLift",
  "Do not crush": "dashLogistics.tag.doNotCrush",
  "Call before delivery": "dashLogistics.tag.callBeforeDelivery",
  "Count on arrival": "dashLogistics.tag.countOnArrival",
  "Two-person lift": "dashLogistics.tag.twoPersonLift",
};

const etaMetaLabelKeys: Record<string, string> = {
  Today: "dashLogistics.etaMeta.today",
  Tomorrow: "dashLogistics.etaMeta.tomorrow",
  "Delivered Yesterday": "dashLogistics.etaMeta.deliveredYesterday",
  "Departing Today": "dashLogistics.etaMeta.departingToday",
  Friday: "dashLogistics.etaMeta.friday",
  Wednesday: "dashLogistics.etaMeta.wednesday",
};

const modeLabelKeys: Record<Shipment["mode"], string> = {
  land: "dashLogistics.mode.land",
  air: "dashLogistics.mode.air",
  sea: "dashLogistics.mode.sea",
};

const routeTypeLabelKeys: Record<Shipment["routeType"], string> = {
  road: "dashLogistics.routeType.road",
  flight: "dashLogistics.routeType.flight",
  ship: "dashLogistics.routeType.ship",
};

function translateOrFallback(t: (key: string) => string, dict: Record<string, string>, value: string) {
  const key = dict[value];
  return key ? t(key) : value;
}

function getContactLabel(t: (key: string) => string, mode: Shipment["mode"]) {
  if (mode === "land") {
    return t("dashLogistics.contact.callDriver");
  }

  if (mode === "air") {
    return t("dashLogistics.contact.callAirlineSupport");
  }

  return t("dashLogistics.contact.callCaptain");
}

function getTransportNumberLabel(t: (key: string) => string, mode: Shipment["mode"]) {
  if (mode === "land") {
    return t("dashLogistics.transportNumber.vehicle");
  }

  if (mode === "air") {
    return t("dashLogistics.transportNumber.flight");
  }

  return t("dashLogistics.transportNumber.vessel");
}

function EmptyShipmentOverview() {
  const { t } = useLanguage();

  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-dashed text-muted-foreground text-sm">
      {t("dashLogistics.empty.selectShipment")}
    </div>
  );
}

function ShipmentOverview({ shipment }: { shipment: Shipment }) {
  const { t } = useLanguage();
  const ContactIcon = modeIcons[shipment.mode];
  const contactLabel = getContactLabel(t, shipment.mode);
  const transportNumberLabel = getTransportNumberLabel(t, shipment.mode);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2">
          <h1 className="font-medium text-lg tabular-nums tracking-tight sm:text-xl">#{shipment.id}</h1>
          <Button variant="ghost" size="icon-sm" aria-label={t("dashLogistics.overview.copyIdAria")}>
            <Copy />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Badge variant="outline" className={cn("gap-1.5", statusBadgeClasses[shipment.status])}>
            <span className={cn("size-1.5 rounded-full bg-current", progressRingClasses[shipment.status])} />
            {t(statusLabelKeys[shipment.status])}
          </Badge>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground tabular-nums">
            {t("dashLogistics.overview.percentComplete").replace("{percent}", String(shipment.progress))}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground tabular-nums">
            {t("dashLogistics.overview.etaWithMeta")
              .replace("{eta}", shipment.eta)
              .replace("{etaMeta}", translateOrFallback(t, etaMetaLabelKeys, shipment.etaMeta))}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-9 after:rounded-sm">
            <AvatarFallback className="rounded-sm">{shipment.customer.initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <div className="font-medium text-sm leading-none">{shipment.customer.name}</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs tabular-nums leading-none tracking-tight">{shipment.customer.id}</span>{" "}
              <Copy className="size-3" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary">
            <Star />
            {t(tierLabelKeys[shipment.customer.tier])}
          </Badge>
          <div className="text-muted-foreground text-xs leading-none">
            {translateOrFallback(t, tierDescriptionKeys, shipment.customer.tierLabel)}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex min-w-0 flex-col gap-8">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h2 className="font-medium">{t("dashLogistics.overview.cargoDetails")}</h2>

          <Button variant="outline" size="sm" className="w-fit">
            <ContactIcon data-icon="inline-start" />
            {contactLabel}
          </Button>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-1 xl:gap-2">
            <div className="text-muted-foreground text-xs leading-none md:invisible md:text-sm">
              {t("dashLogistics.overview.cargo")}
            </div>
            <div className="min-w-0 truncate text-sm leading-none" title={shipment.cargo}>
              {shipment.cargo}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="text-muted-foreground text-xs leading-none md:text-sm">
              {t("dashLogistics.overview.totalWeight")}
            </div>
            <div className="text-sm leading-none">{shipment.weight}</div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="text-muted-foreground text-xs leading-none md:text-sm">
              {t("dashLogistics.overview.transportMode")}
            </div>
            <div className="min-w-0 truncate text-sm leading-none">
              {t(modeLabelKeys[shipment.mode])} · {t(routeTypeLabelKeys[shipment.routeType])}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="text-muted-foreground text-xs leading-none md:text-sm">{transportNumberLabel}</div>
            <div className="min-w-0 truncate text-sm leading-none">{shipment.transportNumber}</div>
          </div>

          <div className="flex min-w-0 flex-col gap-2 xl:text-right">
            <div className="text-muted-foreground text-xs leading-none md:text-sm">
              {t("dashLogistics.overview.status")}
            </div>
            <div className="text-sm leading-none">
              {t("dashLogistics.overview.percentComplete").replace("{percent}", String(shipment.progress))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
        <AlertTriangleIcon />
        <AlertTitle>{translateOrFallback(t, handlingLabelKeys, shipment.handling.label)}</AlertTitle>
        <AlertDescription className="space-y-2">
          <div className="border-amber-900 text-amber-900 leading-none dark:border-amber-50 dark:text-amber-50">
            {shipment.handling.note}
          </div>

          <Separator className="bg-amber-800 dark:bg-amber-50" />

          <div className="flex flex-wrap gap-2">
            {shipment.handling.tags.map(({ icon: TagIcon, label }) => (
              <Badge
                className="rounded-sm border-amber-200 bg-background/50 text-amber-900 dark:border-amber-900 dark:text-amber-50"
                key={label}
                variant="outline"
              >
                <TagIcon data-icon="inline-start" />
                {tagLabelKeys[label] ? t(tagLabelKeys[label]) : label}
              </Badge>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  if (!shipment) {
    return (
      <div className="grid h-full min-h-0 min-w-0 grid-rows-[320px_1fr] overflow-hidden lg:grid-rows-[420px_1fr]">
        <div className="min-h-0 overflow-hidden">
          <ShipmentRouteMap shipment={null} />
        </div>
        <div className="min-h-0 overflow-hidden p-4">
          <EmptyShipmentOverview />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 min-w-0 grid-rows-[320px_1fr] overflow-hidden lg:grid-rows-[420px_1fr]">
      <div className="min-h-0 overflow-hidden">
        <ShipmentRouteMap shipment={shipment} />
      </div>
      <div className="min-h-0 overflow-hidden">
        <div className="h-full min-h-0 min-w-0 py-2">
          <Tabs defaultValue="overview" className="h-full min-w-0 gap-0">
            <TabsList
              className="h-auto min-h-8 w-full justify-start gap-2 overflow-x-auto border-b px-4 **:data-[slot=tabs-trigger]:h-8 **:data-[slot=tabs-trigger]:text-xs sm:gap-4 sm:**:data-[slot=tabs-trigger]:text-sm"
              variant="line"
            >
              <TabsTrigger className="flex-none" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="route">
                Route
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="cargo">
                Cargo
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="documents">
                Documents
              </TabsTrigger>
              <TabsTrigger className="flex-none" value="activity">
                Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent className="min-h-0 min-w-0 overflow-auto p-4" value="overview">
              <ShipmentOverview shipment={shipment} />
            </TabsContent>
            <TabsContent className="min-w-0 p-4" value="route">
              <div className="grid h-full place-items-center rounded-md border border-dashed text-muted-foreground text-sm">
                Route view coming soon.
              </div>
            </TabsContent>
            <TabsContent className="min-w-0 p-4" value="cargo">
              <div className="grid h-full place-items-center rounded-md border border-dashed text-muted-foreground text-sm">
                Cargo view coming soon.
              </div>
            </TabsContent>
            <TabsContent className="min-w-0 p-4" value="documents">
              <div className="grid h-full place-items-center rounded-md border border-dashed text-muted-foreground text-sm">
                Documents view coming soon.
              </div>
            </TabsContent>
            <TabsContent className="min-w-0 p-4" value="activity">
              <div className="grid h-full place-items-center rounded-md border border-dashed text-muted-foreground text-sm">
                Activity view coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
