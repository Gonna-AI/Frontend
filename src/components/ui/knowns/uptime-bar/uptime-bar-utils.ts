export type DayStatus = "up" | "degraded" | "down" | "none";

export interface UptimeDay {
  /** "2026-07-09" (a calendar day, no time zone) or a Date (read in UTC). */
  date: string | Date;
  status: DayStatus;
  /** Minutes the service was down or degraded that day. Optional. */
  downtimeMinutes?: number;
  /** One line about what happened, shown in the tooltip. */
  note?: string;
}

export const STATUS_LABEL: Record<DayStatus, string> = { up: "Operational", degraded: "Degraded", down: "Outage", none: "No data" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 86_400_000;
const DAY_MINUTES = 1440;

/** The calendar day as [year, month 1-12, day]. A string is read as it is written, a Date in UTC, so no time zone moves it. */
export function dayParts(date: string | Date): [number, number, number] | null {
  if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** "Jul 9", or "Jul 9, 2026" with `year`. An unreadable date comes back as it was given. */
export function formatDay(date: string | Date, year = false): string {
  const p = dayParts(date);
  if (!p) return String(date);
  return `${MONTHS[p[1] - 1]} ${p[2]}${year ? `, ${p[0]}` : ""}`;
}

/** The `count` days ending on `end`, oldest first, as "YYYY-MM-DD". */
export function dayRange(end: string | Date, count: number): string[] {
  const p = dayParts(end);
  if (!p || count <= 0) return [];
  const last = Date.UTC(p[0], p[1] - 1, p[2]);
  return Array.from({ length: Math.floor(count) }, (_, i) => new Date(last - (count - 1 - i) * DAY_MS).toISOString().slice(0, 10));
}

/** "46 minutes", "1 minute", "1 hour", "1 hour 5 minutes", "24 hours". */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} ${m === 1 ? "minute" : "minutes"}`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  const hours = `${h} ${h === 1 ? "hour" : "hours"}`;
  return r === 0 ? hours : `${hours} ${r} ${r === 1 ? "minute" : "minutes"}`;
}

/**
 * Uptime over the days that have data, as a percent. A "none" day is left out. A day with downtimeMinutes counts
 * those minutes; a "down" day without them counts the whole day; "degraded" without them counts nothing, because
 * the service was still answering. null when no day has data.
 */
export function uptimePercent(days: readonly UptimeDay[]): number | null {
  const counted = days.filter((d) => d.status !== "none");
  if (counted.length === 0) return null;
  const down = counted.reduce((sum, d) => {
    const m = d.downtimeMinutes ?? (d.status === "down" ? DAY_MINUTES : 0);
    return sum + Math.min(DAY_MINUTES, Math.max(0, m));
  }, 0);
  return Math.max(0, 100 - (down / (counted.length * DAY_MINUTES)) * 100);
}

/** "99.95%", "100%", "99.99%" for 99.9999 (never rounds a real outage up to 100%). Two decimals at most, trailing zeros dropped. */
export function formatUptime(percent: number | null | undefined): string {
  if (percent === null || percent === undefined || !Number.isFinite(percent)) return "No data";
  const p = Math.min(100, Math.max(0, percent));
  const t = p >= 100 ? 100 : Math.floor(p * 100) / 100;
  return `${t.toFixed(2).replace(/\.?0+$/, "")}%`;
}

/** The days with trouble, oldest first. */
export const incidentDays = (days: readonly UptimeDay[]): UptimeDay[] => days.filter((d) => d.status === "degraded" || d.status === "down");

/** One day in words: "Jul 9, 2026: degraded, 46 minutes. Elevated errors." */
export function describeDay(d: UptimeDay): string {
  const parts = [STATUS_LABEL[d.status].toLowerCase()];
  if (d.downtimeMinutes && d.downtimeMinutes > 0 && d.status !== "up" && d.status !== "none") parts.push(formatMinutes(d.downtimeMinutes));
  const note = d.note ? ` ${d.note.trim().replace(/[.!?]?$/, ".")}` : "";
  return `${formatDay(d.date, true)}: ${parts.join(", ")}.${note}`;
}

/**
 * What a screen reader hears for the whole row, worked out from the data:
 * "99.95% uptime over 90 days. 2 incidents: Jul 9 degraded, 46 minutes; Aug 2 outage, 2 hours."
 * At most `limit` incidents are listed, newest first, then "and N more".
 */
export function summaryText(days: readonly UptimeDay[], uptime: number | null = uptimePercent(days), limit = 5): string {
  const head = uptime === null ? `No data for ${days.length} days.` : `${formatUptime(uptime)} uptime over ${days.length} days.`;
  const trouble = incidentDays(days);
  if (trouble.length === 0) return uptime === null ? head : `${head} No incidents.`;
  const shown = trouble
    .slice(-limit)
    .reverse()
    .map((d) => `${formatDay(d.date)} ${d.status === "down" ? "outage" : "degraded"}${d.downtimeMinutes ? `, ${formatMinutes(d.downtimeMinutes)}` : ""}`);
  const more = trouble.length - shown.length;
  return `${head} ${trouble.length} ${trouble.length === 1 ? "incident" : "incidents"}: ${shown.join("; ")}${more > 0 ? `; and ${more} more` : ""}.`;
}

/** Which bar the inspection moves to. Left and Right stop at the ends (no wrap); Home and End jump. Other keys: null. */
export function moveIndex(index: number, key: string, count: number): number | null {
  if (count <= 0) return null;
  const last = count - 1;
  switch (key) {
    case "ArrowLeft":
      return Math.max(0, index - 1);
    case "ArrowRight":
      return Math.min(last, index + 1);
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return null;
  }
}

/** Where the tooltip sits against its bar, so it never leaves the row: the first and last bars pin it to their edge. */
export function tooltipAlign(index: number, count: number, edge = 6): "start" | "center" | "end" {
  if (index < edge) return "start";
  if (index >= count - edge) return "end";
  return "center";
}
