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

const customerAccounts = {
  bergmann: {
    name: "Bergmann Maschinenbau GmbH",
    initials: "BM",
    id: "THD-1001-2601-01",
    tier: "Priority",
    tierLabel: "Flagship project account",
  },
  weber: {
    name: "Weber Präzisionstechnik GmbH",
    initials: "WP",
    id: "THD-1002-2602-02",
    tier: "Priority",
    tierLabel: "Top 1% by order volume",
  },
  mkAnlagenbau: {
    name: "MK Anlagenbau GmbH",
    initials: "MK",
    id: "THD-1003-2603-03",
    tier: "Priority",
    tierLabel: "Top 1% by order volume",
  },
  thd: {
    name: "THD GmbH",
    initials: "TH",
    id: "THD-1004-2604-04",
    tier: "Standard",
    tierLabel: "Internal stock replenishment",
  },
  rheinmetallFertigung: {
    name: "Rheinmetall Fertigungstechnik GmbH",
    initials: "RF",
    id: "THD-1005-2605-05",
    tier: "Standard",
    tierLabel: "Recurring order account",
  },
  vossWerkzeugbau: {
    name: "Voss Werkzeugbau GmbH",
    initials: "VW",
    id: "THD-1006-2606-06",
    tier: "Standard",
    tierLabel: "Recurring order account",
  },
  baumannAntrieb: {
    name: "Baumann Antriebstechnik GmbH",
    initials: "BA",
    id: "THD-1007-2607-07",
    tier: "Non-priority",
    tierLabel: "Occasional order account",
  },
  schusterZerspanung: {
    name: "Schuster Zerspanungstechnik GmbH",
    initials: "SZ",
    id: "THD-1008-2608-08",
    tier: "Standard",
    tierLabel: "Managed order account",
  },
  hartmannSonder: {
    name: "Hartmann Sondermaschinenbau GmbH",
    initials: "HS",
    id: "THD-1009-2609-09",
    tier: "Standard",
    tierLabel: "Managed order account",
  },
  fennerPraezision: {
    name: "Fenner Präzisionsteile GmbH",
    initials: "FP",
    id: "THD-1010-2610-10",
    tier: "Non-priority",
    tierLabel: "Occasional order account",
  },
  linderCnc: {
    name: "Lindner CNC-Technik GmbH",
    initials: "LC",
    id: "THD-1011-2611-11",
    tier: "Priority",
    tierLabel: "Top 1% by order volume",
  },
  achatzGuss: {
    name: "Achatz Präzisionsguss GmbH",
    initials: "AG",
    id: "THD-1012-2612-12",
    tier: "Non-priority",
    tierLabel: "Occasional order account",
  },
} satisfies Record<string, ShipmentCustomer>;

export const shipments: Shipment[] = [
  {
    id: "THD-01-2601",
    customer: customerAccounts.bergmann,
    origin: {
      display: "Sondermotoren-Zulieferer, Nürnberg",
      country: "Germany",
      countryCode: "DE",
      coordinates: [11.0767, 49.4521],
    },
    destination: {
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    cargo: "Sondermotor TM-75 (Bergmann CNC-Paket 2026)",
    handling: {
      label: "Long-lead special order",
      note: "Lieferzeit KW 38 auf KW 36 vorgezogen — Kostencheck hat Terminänderung erkannt.",
      tags: [
        { label: "Do not stack", icon: Ban },
        { label: "Keep upright", icon: ArrowUp },
        { label: "Signature required", icon: PenLine },
      ],
    },
    weight: "340 kg",
    eta: "KW 36",
    etaMeta: "Vorgezogen von KW 38",
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
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    destination: {
      display: "Bergmann Maschinenbau GmbH, Augsburg",
      country: "Germany",
      countryCode: "DE",
      coordinates: [10.8978, 48.3705],
    },
    cargo: "RS-90 Reitstock (substituiert, Kostencheck erkannt)",
    handling: {
      label: "Substituted part",
      note: "RS-90 statt RS-100 geliefert — Freigabe durch PTL erforderlich vor Versand.",
      tags: [
        { label: "Forklift only", icon: Forklift },
        { label: "Secure load", icon: ShieldCheck },
        { label: "Do not tip", icon: Ban },
      ],
    },
    weight: "1,120 kg",
    eta: "11:20 AM",
    etaMeta: "Tomorrow",
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
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    destination: {
      display: "Weber Präzisionstechnik GmbH, Stuttgart",
      country: "Germany",
      countryCode: "DE",
      coordinates: [9.1829, 48.7758],
    },
    cargo: "SP-200 Spannsystem",
    handling: {
      label: "Precision tooling",
      note: "Spannsystem in Schutzverpackung bis zur Übergabe belassen.",
      tags: [
        { label: "Keep dry", icon: Droplets },
        { label: "Seal intact", icon: ShieldCheck },
        { label: "Standard handoff", icon: PackageCheck },
      ],
    },
    weight: "180 kg",
    eta: "09:15 PM",
    etaMeta: "Delivered Yesterday",
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
      display: "Rundschalttisch-Fertigung, Villingen-Schwenningen",
      country: "Germany",
      countryCode: "DE",
      coordinates: [8.4614, 48.0622],
    },
    destination: {
      display: "MK Anlagenbau GmbH, Mannheim",
      country: "Germany",
      countryCode: "DE",
      coordinates: [8.4660, 49.4875],
    },
    cargo: "RT-450 Rundschalttisch",
    handling: {
      label: "Heavy machinery",
      note: "Rundschalttisch auf Palette sichern vor Straßentransport.",
      tags: [
        { label: "Forklift only", icon: Forklift },
        { label: "Secure load", icon: ShieldCheck },
        { label: "Do not tip", icon: Ban },
      ],
    },
    weight: "2,650 kg",
    eta: "06:10 PM",
    etaMeta: "Today",
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
      display: "Steuerungsverkabelung-Zulieferer, Regensburg",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.1017, 49.0134],
    },
    destination: {
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    cargo: "Steuerungsverkabelung, Lagerauffüllung",
    handling: {
      label: "Standard freight",
      note: "Kartons trocken halten und vor direkter Sonneneinstrahlung schützen.",
      tags: [
        { label: "Keep dry", icon: Droplets },
        { label: "Do not crush", icon: Ban },
        { label: "Standard handoff", icon: PackageCheck },
      ],
    },
    weight: "420 kg",
    eta: "09:30 AM",
    etaMeta: "Friday",
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
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    destination: {
      display: "Rheinmetall Fertigungstechnik GmbH, Kassel",
      country: "Germany",
      countryCode: "DE",
      coordinates: [9.4797, 51.3127],
    },
    cargo: "RT-350 Rundschalttisch",
    handling: {
      label: "Heavy bulk cargo",
      note: "Mit Hebezeug laden und gegen Verrutschen sichern.",
      tags: [
        { label: "Heavy lift", icon: Forklift },
        { label: "Secure load", icon: ShieldCheck },
        { label: "Do not stack", icon: Ban },
      ],
    },
    weight: "2,180 kg",
    eta: "03:40 PM",
    etaMeta: "Departing Today",
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
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    destination: {
      display: "Voss Werkzeugbau GmbH, Solingen",
      country: "Germany",
      countryCode: "DE",
      coordinates: [7.0844, 51.1657],
    },
    cargo: "SP-150 Spannsystem",
    handling: {
      label: "Sensitive precision tooling",
      note: "Versiegelt lassen bis zur Zollkontrolle bzw. Wareneingangsprüfung.",
      tags: [
        { label: "Seal intact", icon: ShieldCheck },
        { label: "Keep upright", icon: ArrowUp },
        { label: "Signature required", icon: PenLine },
      ],
    },
    weight: "95 kg",
    eta: "Pending",
    etaMeta: "Wareneingang",
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
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    destination: {
      display: "Baumann Antriebstechnik GmbH, Ulm",
      country: "Germany",
      countryCode: "DE",
      coordinates: [9.9877, 48.4011],
    },
    cargo: "TM-75 Sondermotor",
    handling: {
      label: "Standard freight",
      note: "Kartons trocken halten und Empfänger vor Zustellung anrufen.",
      tags: [
        { label: "Keep dry", icon: Droplets },
        { label: "Call before delivery", icon: Truck },
        { label: "Standard handoff", icon: PackageCheck },
      ],
    },
    weight: "310 kg",
    eta: "02:15 PM",
    etaMeta: "Today",
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
      display: "Präzisionsguss-Zulieferer, Chemnitz",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.9214, 50.8278],
    },
    destination: {
      display: "Schuster Zerspanungstechnik GmbH, Dresden",
      country: "Germany",
      countryCode: "DE",
      coordinates: [13.7373, 51.0504],
    },
    cargo: "Präzisionsteile, Rohguss",
    handling: {
      label: "Industrial parts",
      note: "Paletten sichern und bearbeitete Oberflächen vor Feuchtigkeit schützen.",
      tags: [
        { label: "Secure load", icon: ShieldCheck },
        { label: "Keep dry", icon: Droplets },
        { label: "Forklift only", icon: Forklift },
      ],
    },
    weight: "1,640 kg",
    eta: "05:50 PM",
    etaMeta: "Wednesday",
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
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    destination: {
      display: "Hartmann Sondermaschinenbau GmbH, Nürnberg",
      country: "Germany",
      countryCode: "DE",
      coordinates: [11.0767, 49.4521],
    },
    cargo: "RT-450 Rundschalttisch, RS-100 Reitstock",
    handling: {
      label: "High-value precision cargo",
      note: "Versiegelte Fracht bis zur unterschriebenen Übergabe belassen.",
      tags: [
        { label: "Do not stack", icon: Ban },
        { label: "Keep upright", icon: ArrowUp },
        { label: "Signature required", icon: PenLine },
      ],
    },
    weight: "3,050 kg",
    eta: "08:30 PM",
    etaMeta: "Delivered Yesterday",
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
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    destination: {
      display: "Lindner CNC-Technik GmbH, München",
      country: "Germany",
      countryCode: "DE",
      coordinates: [11.582, 48.1351],
    },
    cargo: "SP-200 Spannsystem, Steuerungsverkabelung",
    handling: {
      label: "Standard freight",
      note: "Fracht trocken halten und Palettenanzahl bei Übergabe prüfen.",
      tags: [
        { label: "Keep dry", icon: Droplets },
        { label: "Count on arrival", icon: CheckCircle2 },
        { label: "Standard handoff", icon: PackageCheck },
      ],
    },
    weight: "540 kg",
    eta: "01:05 PM",
    etaMeta: "Today",
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
      display: "THD GmbH, Straubing",
      country: "Germany",
      countryCode: "DE",
      coordinates: [12.5731, 48.8807],
    },
    destination: {
      display: "Achatz Präzisionsguss GmbH, Passau",
      country: "Germany",
      countryCode: "DE",
      coordinates: [13.4312, 48.5667],
    },
    cargo: "RS-90 Reitstock",
    handling: {
      label: "Fragile precision cargo",
      note: "Blanket wrap verwenden und nicht auf bearbeiteten Flächen stapeln.",
      tags: [
        { label: "Do not stack", icon: Ban },
        { label: "Keep dry", icon: Droplets },
        { label: "Two-person lift", icon: Truck },
      ],
    },
    weight: "890 kg",
    eta: "08:20 AM",
    etaMeta: "Tomorrow",
    status: "Delayed",
    progress: 39,
    mode: "land",
    routeType: "road",
    transportNumber: "R-PA 7729",
  },
];
