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

/** Builds the demo events list with localized titles. Pass the `t` function from `useLanguage()`. */
export function getDemoEvents(t: (key: string) => string): CalendarEvent[] {
  return [
    // Bergmann Maschinenbau GmbH – CNC-Paket 2026 (AI-erkannte Meilensteine)
    { title: t("dashCalendar.event.abDeadlineBergmann"), start: d(3), allDay: true },
    { title: t("dashCalendar.event.kickoff1Bergmann"), start: dt(5, 9, 30), end: dt(5, 10, 30) },
    { title: t("dashCalendar.event.kickoff2Bergmann"), start: dt(12, 10), end: dt(12, 11) },
    { title: t("dashCalendar.event.deliveryBergmann"), start: d(34), allDay: true },

    // Weber Präzisionstechnik GmbH
    { title: t("dashCalendar.event.kickoff1Weber"), start: dt(8, 11), end: dt(8, 12) },
    { title: t("dashCalendar.event.quoteReviewWeber"), start: d(15), allDay: true },
    { title: t("dashCalendar.event.kickoff2Weber"), start: dt(19, 14), end: dt(19, 15) },

    // MK Anlagenbau GmbH
    { title: t("dashCalendar.event.abDeadlineMk"), start: d(9), allDay: true },
    { title: t("dashCalendar.event.deliveryMk"), start: d(45), allDay: true },

    // Internal
    { groupId: "standup", title: t("dashCalendar.event.standup"), start: dt(1, 10) },
    { groupId: "standup", title: t("dashCalendar.event.standup"), start: dt(8, 10) },
    { title: t("dashCalendar.event.capacityPlanning"), start: dt(2, 9, 30), end: dt(2, 10, 30) },
  ];
}
