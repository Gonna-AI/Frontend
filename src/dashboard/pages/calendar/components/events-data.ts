import { addDays, setHours, setMinutes } from "date-fns";

import type { PipelineMilestoneRow } from "@/dashboard/lib/pipelineClient";

const today = new Date();
const d = (offsetDays: number) => addDays(today, offsetDays);
const dt = (offsetDays: number, hour: number, min = 0) => setMinutes(setHours(addDays(today, offsetDays), hour), min);

/** Color hint per milestone kind — keeps live calendar events visually distinguishable by kind. */
const KIND_COLORS: Record<string, string> = {
  kickoff_1: "var(--chart-1)",
  kickoff_2: "var(--chart-2)",
  liefertermin: "var(--chart-3)",
  ab_ausstellungsfrist: "var(--chart-4)",
};

function colorForKind(kind: string | null): string | undefined {
  if (!kind) return undefined;
  return KIND_COLORS[kind.toLowerCase()];
}

export interface CalendarEvent {
  id?: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  groupId?: string;
  color?: string;
  extendedProps?: {
    kind: string | null;
    status: string;
    projectId: string;
  };
}

/** Maps a live pipeline_milestones row onto a FullCalendar EventInput. */
export function mapMilestoneToEvent(milestone: PipelineMilestoneRow): CalendarEvent {
  return {
    id: milestone.id,
    title: milestone.label,
    start: milestone.due_date ?? new Date().toISOString(),
    allDay: true,
    color: colorForKind(milestone.kind),
    extendedProps: {
      kind: milestone.kind,
      status: milestone.status,
      projectId: milestone.project_id,
    },
  };
}

export const demoEvents: CalendarEvent[] = [
  // Bergmann Maschinenbau GmbH – CNC-Paket 2026 (AI-erkannte Meilensteine)
  { title: "AB-Ausstellungsfrist – Bergmann Maschinenbau", start: d(3), allDay: true },
  { title: "KickOff 1 (AL) – Bergmann Maschinenbau", start: dt(5, 9, 30), end: dt(5, 10, 30) },
  { title: "KickOff 2 (PTL) – Bergmann Maschinenbau", start: dt(12, 10), end: dt(12, 11) },
  { title: "Liefertermin (KW 36) – Bergmann Maschinenbau", start: d(34), allDay: true },

  // Weber Präzisionstechnik GmbH
  { title: "KickOff 1 (AL) – Weber Präzisionstechnik", start: dt(8, 11), end: dt(8, 12) },
  { title: "Angebotsprüfung fällig – Weber Präzisionstechnik", start: d(15), allDay: true },
  { title: "KickOff 2 (PTL) – Weber Präzisionstechnik", start: dt(19, 14), end: dt(19, 15) },

  // MK Anlagenbau GmbH
  { title: "AB-Ausstellungsfrist – MK Anlagenbau", start: d(9), allDay: true },
  { title: "Liefertermin (KW 40) – MK Anlagenbau", start: d(45), allDay: true },

  // Internal
  { groupId: "standup", title: "Team-Standup Kostencheck Copilot", start: dt(1, 10) },
  { groupId: "standup", title: "Team-Standup Kostencheck Copilot", start: dt(8, 10) },
  { title: "Monatliche Kapazitätsplanung", start: dt(2, 9, 30), end: dt(2, 10, 30) },
];
