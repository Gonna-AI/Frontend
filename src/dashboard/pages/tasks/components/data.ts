import { ArrowDown, ArrowRight, ArrowUp, CheckCircle, Circle, CircleOff, HelpCircle, Timer } from "lucide-react-dash";
import { z } from "zod";

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
});

export type Task = z.infer<typeof taskSchema>;

const tasksData = [
  {
    id: "CHK-88431-1",
    title: "Sondermotor TM-75 bestellen — Lieferzeit 14 Wochen",
    status: "todo",
    label: "procurement",
    priority: "high",
  },
  {
    id: "CHK-88431-2",
    title: "Abweichung Spannsystem-Menge (4→5) mit Kunde bestätigen",
    status: "todo",
    label: "review",
    priority: "medium",
  },
  {
    id: "CHK-88431-3",
    title: "Ersatzartikel Reitstock RS-90 technisch freigeben",
    status: "todo",
    label: "engineering",
    priority: "high",
  },
  {
    id: "CHK-88431-4",
    title: "Fehlende Position Steuerungsverkabelung klären",
    status: "todo",
    label: "review",
    priority: "high",
  },
  {
    id: "CHK-88431-5",
    title: "Zahlungskonditionen-Änderung (60 Tage) intern freigeben",
    status: "todo",
    label: "finance",
    priority: "high",
  },
  {
    id: "CHK-88431-6",
    title: "AB-Entwurf für B-88431 final gegenlesen und freigeben",
    status: "in progress",
    label: "review",
    priority: "high",
  },
  {
    id: "CHK-88431-7",
    title: "KickOff-Brief für AL/PTL versenden",
    status: "backlog",
    label: "review",
    priority: "medium",
  },
  {
    id: "CHK-0198-1",
    title: "Weber Präzisionstechnik: Angebot A-2026-0198 mit Bestellung abgleichen",
    status: "in progress",
    label: "review",
    priority: "medium",
  },
  {
    id: "CHK-0198-2",
    title: "Weber Präzisionstechnik: Ersatzteil-Rückfrage an Einkauf weiterleiten",
    status: "todo",
    label: "procurement",
    priority: "medium",
  },
  {
    id: "CHK-0198-3",
    title: "Weber Präzisionstechnik: KickOff-Termin (PTL) abstimmen",
    status: "backlog",
    label: "review",
    priority: "low",
  },
  {
    id: "CHK-2044-1",
    title: "MK Anlagenbau: Liefertermin-Verschiebung mit Kunde klären",
    status: "todo",
    label: "review",
    priority: "medium",
  },
  {
    id: "CHK-2044-2",
    title: "MK Anlagenbau: Ersatzteile beim Zulieferer anfragen",
    status: "in progress",
    label: "procurement",
    priority: "medium",
  },
  {
    id: "CHK-2044-3",
    title: "MK Anlagenbau: Zahlungskonditionen intern dokumentieren",
    status: "done",
    label: "finance",
    priority: "low",
  },
  {
    id: "CHK-2044-4",
    title: "MK Anlagenbau: Abweichungsbericht archivieren",
    status: "done",
    label: "review",
    priority: "low",
  },
];

export const tasks = z.array(taskSchema).parse(tasksData);

export const labels = [
  {
    value: "procurement",
    label: "Beschaffung",
  },
  {
    value: "review",
    label: "Prüfung",
  },
  {
    value: "engineering",
    label: "Technik",
  },
  {
    value: "finance",
    label: "Finanzen",
  },
];

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: HelpCircle,
  },
  {
    value: "todo",
    label: "Offen",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Bearbeitung",
    icon: Timer,
  },
  {
    value: "done",
    label: "Erledigt",
    icon: CheckCircle,
  },
  {
    value: "canceled",
    label: "Storniert",
    icon: CircleOff,
  },
];

export const priorities = [
  {
    label: "Niedrig",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Mittel",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "Hoch",
    value: "high",
    icon: ArrowUp,
  },
];
