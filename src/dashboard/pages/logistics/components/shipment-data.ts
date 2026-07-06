import {
  ArrowUp,
  Ban,
  CheckCircle2,
  Droplets,
  Forklift,
  type LucideIcon,
  PackageCheck,
  PenLine,
  ShieldCheck,
  Truck,
} from "lucide-react-dash";

import type { useLanguage } from "@/contexts/LanguageContext";

export type ShipmentStatus =
  | "Scheduled"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Delayed"
  | "On Hold"
  | "Customs Hold";

export type TransportMode = "land" | "air" | "sea";
export type RouteType = "road" | "flight" | "ship";
export type CustomerTier = "Priority" | "Standard" | "Non-priority";

export type GeoCoordinate = [longitude: number, latitude: number];

export type ShipmentLocation = {
  coordinates: GeoCoordinate;
  display: string;
  country: string;
  countryCode: string;
};

export type ShipmentCustomer = {
  name: string;
  initials: string;
  id: string;
  tier: CustomerTier;
  tierLabel: string;
};

export type HandlingTag = {
  label: string;
  icon: LucideIcon;
};

export type ShipmentHandling = {
  label: string;
  note: string;
  tags: HandlingTag[];
};

export type Shipment = {
  id: string;
  customer: ShipmentCustomer;
  origin: ShipmentLocation;
  destination: ShipmentLocation;
  cargo: string;
  handling: ShipmentHandling;
  weight: string;
  eta: string;
  etaMeta: string;
  status: ShipmentStatus;
  progress: number;
  mode: TransportMode;
  routeType: RouteType;
  transportNumber: string;
};

function buildCustomerAccounts(t: ReturnType<typeof useLanguage>["t"]) {
  return {
    bergmann: {
      name: "Bergmann Maschinenbau GmbH",
      initials: "BM",
      id: "THD-1001-2601-01",
      tier: "Priority" as const,
      tierLabel: t("dashLogistics.tierLabel.flagshipProjectAccount"),
    },
    weber: {
      name: "Weber Präzisionstechnik GmbH",
      initials: "WP",
      id: "THD-1002-2602-02",
      tier: "Priority" as const,
      tierLabel: t("dashLogistics.tierLabel.top1PercentByOrderVolume"),
    },
    mkAnlagenbau: {
      name: "MK Anlagenbau GmbH",
      initials: "MK",
      id: "THD-1003-2603-03",
      tier: "Priority" as const,
      tierLabel: t("dashLogistics.tierLabel.top1PercentByOrderVolume"),
    },
    thd: {
      name: "THD GmbH",
      initials: "TH",
      id: "THD-1004-2604-04",
      tier: "Standard" as const,
      tierLabel: t("dashLogistics.tierLabel.internalStockReplenishment"),
    },
    rheinmetallFertigung: {
      name: "Rheinmetall Fertigungstechnik GmbH",
      initials: "RF",
      id: "THD-1005-2605-05",
      tier: "Standard" as const,
      tierLabel: t("dashLogistics.tierLabel.recurringOrderAccount"),
    },
    vossWerkzeugbau: {
      name: "Voss Werkzeugbau GmbH",
      initials: "VW",
      id: "THD-1006-2606-06",
      tier: "Standard" as const,
      tierLabel: t("dashLogistics.tierLabel.recurringOrderAccount"),
    },
    baumannAntrieb: {
      name: "Baumann Antriebstechnik GmbH",
      initials: "BA",
      id: "THD-1007-2607-07",
      tier: "Non-priority" as const,
      tierLabel: t("dashLogistics.tierLabel.occasionalOrderAccount"),
    },
    schusterZerspanung: {
      name: "Schuster Zerspanungstechnik GmbH",
      initials: "SZ",
      id: "THD-1008-2608-08",
      tier: "Standard" as const,
      tierLabel: t("dashLogistics.tierLabel.managedOrderAccount"),
    },
    hartmannSonder: {
      name: "Hartmann Sondermaschinenbau GmbH",
      initials: "HS",
      id: "THD-1009-2609-09",
      tier: "Standard" as const,
      tierLabel: t("dashLogistics.tierLabel.managedOrderAccount"),
    },
    fennerPraezision: {
      name: "Fenner Präzisionsteile GmbH",
      initials: "FP",
      id: "THD-1010-2610-10",
      tier: "Non-priority" as const,
      tierLabel: t("dashLogistics.tierLabel.occasionalOrderAccount"),
    },
    linderCnc: {
      name: "Lindner CNC-Technik GmbH",
      initials: "LC",
      id: "THD-1011-2611-11",
      tier: "Priority" as const,
      tierLabel: t("dashLogistics.tierLabel.top1PercentByOrderVolume"),
    },
    achatzGuss: {
      name: "Achatz Präzisionsguss GmbH",
      initials: "AG",
      id: "THD-1012-2612-12",
      tier: "Non-priority" as const,
      tierLabel: t("dashLogistics.tierLabel.occasionalOrderAccount"),
    },
  } satisfies Record<string, ShipmentCustomer>;
}

export function buildShipments(t: ReturnType<typeof useLanguage>["t"]): Shipment[] {
  const customerAccounts = buildCustomerAccounts(t);

  return [
    {
      id: "THD-01-2601",
      customer: customerAccounts.bergmann,
      origin: {
        display: t("dashLogistics.shipmentData.loc.customMotorSupplierNuremberg"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [11.0767, 49.4521],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      cargo: t("dashLogistics.shipmentData.cargo.tm75BergmannPackage"),
      handling: {
        label: t("dashLogistics.handling.longLeadSpecialOrder"),
        note: t("dashLogistics.shipmentData.note.tm75ScheduleChange"),
        tags: [
          { label: t("dashLogistics.tag.doNotStack"), icon: Ban },
          { label: t("dashLogistics.tag.keepUpright"), icon: ArrowUp },
          { label: t("dashLogistics.tag.signatureRequired"), icon: PenLine },
        ],
      },
      weight: "340 kg",
      eta: "KW 36",
      etaMeta: t("dashLogistics.etaMeta.movedUpFromKw38"),
      status: "In Transit",
      progress: 65,
      mode: "land",
      routeType: "road",
      transportNumber: "R-NBG 4471",
    },
    {
      id: "THD-02-2602",
      customer: customerAccounts.bergmann,
      origin: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.bergmannAugsburg"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [10.8978, 48.3705],
      },
      cargo: t("dashLogistics.shipmentData.cargo.rs90Substituted"),
      handling: {
        label: t("dashLogistics.handling.substitutedPart"),
        note: t("dashLogistics.shipmentData.note.rs90Approval"),
        tags: [
          { label: t("dashLogistics.tag.forkliftOnly"), icon: Forklift },
          { label: t("dashLogistics.tag.secureLoad"), icon: ShieldCheck },
          { label: t("dashLogistics.tag.doNotTip"), icon: Ban },
        ],
      },
      weight: "1,120 kg",
      eta: "11:20 AM",
      etaMeta: t("dashLogistics.etaMeta.tomorrow"),
      status: "On Hold",
      progress: 42,
      mode: "land",
      routeType: "road",
      transportNumber: "R-STR 2290",
    },
    {
      id: "THD-03-2603",
      customer: customerAccounts.weber,
      origin: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.weberStuttgart"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [9.1829, 48.7758],
      },
      cargo: t("dashLogistics.shipmentData.cargo.sp200"),
      handling: {
        label: t("dashLogistics.handling.precisionTooling"),
        note: t("dashLogistics.shipmentData.note.sp200Protective"),
        tags: [
          { label: t("dashLogistics.tag.keepDry"), icon: Droplets },
          { label: t("dashLogistics.tag.sealIntact"), icon: ShieldCheck },
          { label: t("dashLogistics.tag.standardHandoff"), icon: PackageCheck },
        ],
      },
      weight: "180 kg",
      eta: "09:15 PM",
      etaMeta: t("dashLogistics.etaMeta.deliveredYesterday"),
      status: "Delivered",
      progress: 100,
      mode: "land",
      routeType: "road",
      transportNumber: "R-STG 1187",
    },
    {
      id: "THD-04-2604",
      customer: customerAccounts.mkAnlagenbau,
      origin: {
        display: t("dashLogistics.shipmentData.loc.rotaryTableManufacturingVillingen"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [8.4614, 48.0622],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.mkAnlagenbauMannheim"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [8.466, 49.4875],
      },
      cargo: t("dashLogistics.shipmentData.cargo.rt450"),
      handling: {
        label: t("dashLogistics.handling.heavyMachinery"),
        note: t("dashLogistics.shipmentData.note.rt450Secure"),
        tags: [
          { label: t("dashLogistics.tag.forkliftOnly"), icon: Forklift },
          { label: t("dashLogistics.tag.secureLoad"), icon: ShieldCheck },
          { label: t("dashLogistics.tag.doNotTip"), icon: Ban },
        ],
      },
      weight: "2,650 kg",
      eta: "06:10 PM",
      etaMeta: t("dashLogistics.etaMeta.today"),
      status: "In Transit",
      progress: 28,
      mode: "land",
      routeType: "road",
      transportNumber: "R-MA 3381",
    },
    {
      id: "THD-05-2605",
      customer: customerAccounts.thd,
      origin: {
        display: t("dashLogistics.shipmentData.loc.controlWiringSupplierRegensburg"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.1017, 49.0134],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      cargo: t("dashLogistics.shipmentData.cargo.controlWiringStockReplenishment"),
      handling: {
        label: t("dashLogistics.handling.standardFreight"),
        note: t("dashLogistics.shipmentData.note.keepDrySunlight"),
        tags: [
          { label: t("dashLogistics.tag.keepDry"), icon: Droplets },
          { label: t("dashLogistics.tag.doNotCrush"), icon: Ban },
          { label: t("dashLogistics.tag.standardHandoff"), icon: PackageCheck },
        ],
      },
      weight: "420 kg",
      eta: "09:30 AM",
      etaMeta: t("dashLogistics.etaMeta.friday"),
      status: "Scheduled",
      progress: 12,
      mode: "land",
      routeType: "road",
      transportNumber: "R-REG 0894",
    },
    {
      id: "THD-06-2606",
      customer: customerAccounts.rheinmetallFertigung,
      origin: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.rheinmetallKassel"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [9.4797, 51.3127],
      },
      cargo: t("dashLogistics.shipmentData.cargo.rt350"),
      handling: {
        label: t("dashLogistics.handling.heavyBulkCargo"),
        note: t("dashLogistics.shipmentData.note.liftingEquipment"),
        tags: [
          { label: t("dashLogistics.tag.heavyLift"), icon: Forklift },
          { label: t("dashLogistics.tag.secureLoad"), icon: ShieldCheck },
          { label: t("dashLogistics.tag.doNotStack"), icon: Ban },
        ],
      },
      weight: "2,180 kg",
      eta: "03:40 PM",
      etaMeta: t("dashLogistics.etaMeta.departingToday"),
      status: "Scheduled",
      progress: 18,
      mode: "land",
      routeType: "road",
      transportNumber: "R-KS 5502",
    },
    {
      id: "THD-07-2607",
      customer: customerAccounts.vossWerkzeugbau,
      origin: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.vossSolingen"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [7.0844, 51.1657],
      },
      cargo: t("dashLogistics.shipmentData.cargo.sp150"),
      handling: {
        label: t("dashLogistics.handling.sensitivePrecisionTooling"),
        note: t("dashLogistics.shipmentData.note.sealedCustoms"),
        tags: [
          { label: t("dashLogistics.tag.sealIntact"), icon: ShieldCheck },
          { label: t("dashLogistics.tag.keepUpright"), icon: ArrowUp },
          { label: t("dashLogistics.tag.signatureRequired"), icon: PenLine },
        ],
      },
      weight: "95 kg",
      eta: "Pending",
      etaMeta: t("dashLogistics.etaMeta.goodsReceipt"),
      status: "Customs Hold",
      progress: 33,
      mode: "land",
      routeType: "road",
      transportNumber: "R-SG 2217",
    },
    {
      id: "THD-08-2608",
      customer: customerAccounts.baumannAntrieb,
      origin: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.baumannUlm"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [9.9877, 48.4011],
      },
      cargo: t("dashLogistics.shipmentData.cargo.tm75"),
      handling: {
        label: t("dashLogistics.handling.standardFreight"),
        note: t("dashLogistics.shipmentData.note.keepDryCallRecipient"),
        tags: [
          { label: t("dashLogistics.tag.keepDry"), icon: Droplets },
          { label: t("dashLogistics.tag.callBeforeDelivery"), icon: Truck },
          { label: t("dashLogistics.tag.standardHandoff"), icon: PackageCheck },
        ],
      },
      weight: "310 kg",
      eta: "02:15 PM",
      etaMeta: t("dashLogistics.etaMeta.today"),
      status: "Out for Delivery",
      progress: 88,
      mode: "land",
      routeType: "road",
      transportNumber: "R-UL 8834",
    },
    {
      id: "THD-09-2609",
      customer: customerAccounts.schusterZerspanung,
      origin: {
        display: t("dashLogistics.shipmentData.loc.precisionCastingSupplierChemnitz"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.9214, 50.8278],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.schusterDresden"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [13.7373, 51.0504],
      },
      cargo: t("dashLogistics.shipmentData.cargo.precisionPartsRawCastings"),
      handling: {
        label: t("dashLogistics.handling.industrialParts"),
        note: t("dashLogistics.shipmentData.note.securePalletsMoisture"),
        tags: [
          { label: t("dashLogistics.tag.secureLoad"), icon: ShieldCheck },
          { label: t("dashLogistics.tag.keepDry"), icon: Droplets },
          { label: t("dashLogistics.tag.forkliftOnly"), icon: Forklift },
        ],
      },
      weight: "1,640 kg",
      eta: "05:50 PM",
      etaMeta: t("dashLogistics.etaMeta.wednesday"),
      status: "In Transit",
      progress: 54,
      mode: "land",
      routeType: "road",
      transportNumber: "R-DD 6642",
    },
    {
      id: "THD-10-2610",
      customer: customerAccounts.hartmannSonder,
      origin: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.hartmannNuremberg"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [11.0767, 49.4521],
      },
      cargo: t("dashLogistics.shipmentData.cargo.rt450Rs100"),
      handling: {
        label: t("dashLogistics.handling.highValuePrecisionCargo"),
        note: t("dashLogistics.shipmentData.note.sealedSignedHandover"),
        tags: [
          { label: t("dashLogistics.tag.doNotStack"), icon: Ban },
          { label: t("dashLogistics.tag.keepUpright"), icon: ArrowUp },
          { label: t("dashLogistics.tag.signatureRequired"), icon: PenLine },
        ],
      },
      weight: "3,050 kg",
      eta: "08:30 PM",
      etaMeta: t("dashLogistics.etaMeta.deliveredYesterday"),
      status: "Delivered",
      progress: 100,
      mode: "land",
      routeType: "road",
      transportNumber: "R-N 9021",
    },
    {
      id: "THD-11-2611",
      customer: customerAccounts.linderCnc,
      origin: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.lindnerMunich"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [11.582, 48.1351],
      },
      cargo: t("dashLogistics.shipmentData.cargo.sp200ControlWiring"),
      handling: {
        label: t("dashLogistics.handling.standardFreight"),
        note: t("dashLogistics.shipmentData.note.dryPalletCount"),
        tags: [
          { label: t("dashLogistics.tag.keepDry"), icon: Droplets },
          { label: t("dashLogistics.tag.countOnArrival"), icon: CheckCircle2 },
          { label: t("dashLogistics.tag.standardHandoff"), icon: PackageCheck },
        ],
      },
      weight: "540 kg",
      eta: "01:05 PM",
      etaMeta: t("dashLogistics.etaMeta.today"),
      status: "In Transit",
      progress: 71,
      mode: "land",
      routeType: "road",
      transportNumber: "R-M 4415",
    },
    {
      id: "THD-12-2612",
      customer: customerAccounts.achatzGuss,
      origin: {
        display: t("dashLogistics.shipmentData.loc.thdStraubing"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [12.5731, 48.8807],
      },
      destination: {
        display: t("dashLogistics.shipmentData.loc.achatzPassau"),
        country: "Germany",
        countryCode: "DE",
        coordinates: [13.4312, 48.5667],
      },
      cargo: t("dashLogistics.shipmentData.cargo.rs90"),
      handling: {
        label: t("dashLogistics.handling.fragilePrecisionCargo"),
        note: t("dashLogistics.shipmentData.note.blanketWrap"),
        tags: [
          { label: t("dashLogistics.tag.doNotStack"), icon: Ban },
          { label: t("dashLogistics.tag.keepDry"), icon: Droplets },
          { label: t("dashLogistics.tag.twoPersonLift"), icon: Truck },
        ],
      },
      weight: "890 kg",
      eta: "08:20 AM",
      etaMeta: t("dashLogistics.etaMeta.tomorrow"),
      status: "Delayed",
      progress: 39,
      mode: "land",
      routeType: "road",
      transportNumber: "R-PA 7729",
    },
  ];
}
