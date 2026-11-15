"use client";
/** @registry name="uptime-bar" type="ui" title="Uptime bar" description="One row of day bars for one service: up, degraded, down or no data, with the uptime percent, a tooltip on hover or focus, one tab stop with Left, Right, Home and End to inspect days, Enter to select one, and a screen reader summary worked out from the data. Bars thin out on a narrow container, never a horizontal scroll." */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/knowns/utils";
import {
  STATUS_LABEL,
  describeDay,
  formatDay,
  formatMinutes,
  formatUptime,
  moveIndex,
  summaryText,
  tooltipAlign,
  uptimePercent,
  type DayStatus,
  type UptimeDay,
} from "./uptime-bar-utils";

export type { DayStatus, UptimeDay } from "./uptime-bar-utils";

export interface UptimeBarProps {
  /** One entry per day, oldest first. Any count; 90 is the usual. */
  days: UptimeDay[];
  /** The service, e.g. "Model endpoint". */
  label?: string;
  /** A muted line next to the label, e.g. "model-a". */
  sublabel?: string;
  /** Overrides the uptime worked out from `days`. */
  uptime?: number | null;
  /** Show the uptime percent. Default true. */
  showUptime?: boolean;
  /** The left end of the row. Default: "<n> days ago". */
  startLabel?: string;
  /** The right end of the row. Default "Today". Pass "" to hide both. */
  endLabel?: string;
  /** Bar height: sm 24px, md 32px. Default "md". */
  /** Soften the "up" days so only trouble stands out. Default false. */
  quiet?: boolean;
  size?: "sm" | "md";
  /** Enter (or a click) on a day. The row stays one tab stop; the inspected day is the one you pass here. */
  onDaySelect?: (day: UptimeDay, index: number) => void;
  /** Name for the row when there is no `label`. */
  "aria-label"?: string;
  className?: string;
}

const BAR: Record<DayStatus, string> = {
  up: "bg-emerald-500 dark:bg-emerald-500/90",
  degraded: "bg-amber-500 dark:bg-amber-500/90",
  down: "bg-red-500 dark:bg-red-500/90",
  none: "bg-muted-foreground/25",
};
const TIP_POS = { start: "left-0", center: "-translate-x-1/2", end: "right-0" } as const;

export function UptimeBar({ days, label, sublabel, uptime, showUptime = true, startLabel, endLabel = "Today", size = "md", quiet = false, onDaySelect, "aria-label": ariaLabel, className }: UptimeBarProps) {
  const uid = useId();
  const n = days.length;
  const computed = useMemo(() => (uptime === undefined ? uptimePercent(days) : uptime), [days, uptime]);
  const summary = useMemo(() => summaryText(days, computed), [days, computed]);
  const [hover, setHover] = useState<number | null>(null);
  const [cursor, setCursor] = useState(Math.max(0, n - 1));
  const [focused, setFocused] = useState(false);
  const lastShown = useRef<number | null>(null);

  // The data can change length under us (a period switch): keep the cursor on a real bar.
  useEffect(() => {
    setCursor((c) => Math.min(Math.max(0, n - 1), c));
  }, [n]);

  if (n === 0) return null;
  const shown = hover ?? (focused ? cursor : null);
  if (shown !== null) lastShown.current = shown;
  // The tooltip stays mounted after the last bar so it can fade out where it was.
  const at = shown ?? (lastShown.current !== null ? Math.min(lastShown.current, n - 1) : null);
  const day = at === null ? null : days[at];
  const optId = (i: number) => `${uid}-d${i}`;
  const name = label ?? ariaLabel ?? "Uptime";
  const start = startLabel ?? `${n} days ago`;
  const h = size === "sm" ? "h-6" : "h-8";

  return (
    <div className={cn("@container w-full", className)}>
      {(label || sublabel || showUptime) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-[14px] leading-5">
            {label && <span className="font-medium tracking-[-0.01em]">{label}</span>}
            {sublabel && <span className={cn("text-[13px] text-muted-foreground", label && "ml-2")}>{sublabel}</span>}
          </p>
          {showUptime && (
            <p className="flex-none text-[14px] leading-5 tabular-nums">
              {formatUptime(computed)}
              <span className="sr-only"> uptime</span>
            </p>
          )}
        </div>
      )}

      <div className="relative">
        <div
          role="listbox"
          tabIndex={0}
          aria-label={`${name}. ${summary}`}
          aria-orientation="horizontal"
          aria-activedescendant={focused ? optId(cursor) : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onMouseLeave={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const day = days[cursor];
              if (onDaySelect && day) onDaySelect(day, cursor);
              return;
            }
            const next = moveIndex(cursor, e.key, n);
            if (next === null) return;
            e.preventDefault();
            setCursor(next);
            setHover(null);
          }}
          className={cn("flex w-full items-stretch gap-px rounded-sm outline-none @md:gap-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring", h)}
        >
          {days.map((d, i) => (
            // Focus stays on the listbox; options are reached with aria-activedescendant, so they are not tab stops.
            // eslint-disable-next-line jsx-a11y/interactive-supports-focus
            <div
              key={`${String(d.date)}-${i}`}
              id={optId(i)}
              role="option"
              aria-selected={focused && i === cursor}
              aria-label={describeDay(d)}
              onMouseEnter={() => setHover(i)}
              onClick={() => {
                setCursor(i);
                onDaySelect?.(d, i);
              }}
              className={cn(
                "min-w-[2px] flex-1 rounded-[2px] transition-opacity duration-(--kn-dur-fast) ease-(--kn-ease-out) @md:rounded-[3px]",
                BAR[d.status],
                quiet && d.status === "up" && "opacity-45",
                onDaySelect && "cursor-pointer",
                shown !== null && i !== shown && "opacity-50",
              )}
            />
          ))}
        </div>

        {day && at !== null && (
          <div
            aria-hidden="true"
            style={tooltipAlign(at, n) === "center" ? { left: `${((at + 0.5) / n) * 100}%` } : undefined}
            className={cn(
              "pointer-events-none absolute bottom-full z-10 mb-2 w-max max-w-[min(18rem,90cqw)] rounded-lg bg-foreground px-3 py-2 text-[13px] leading-5 text-background transition-opacity duration-(--kn-dur-fast) ease-(--kn-ease-out)",
              shown === null ? "opacity-0" : "opacity-100",
              TIP_POS[tooltipAlign(at, n)],
            )}
          >
            <p className="font-medium">{formatDay(day.date, true)}</p>
            <p className="flex items-center gap-1.5">
              <span className={cn("size-2 flex-none rounded-full", BAR[day.status])} />
              {STATUS_LABEL[day.status]}
              {day.downtimeMinutes && day.status !== "up" && day.status !== "none" ? <span className="opacity-75"> · {formatMinutes(day.downtimeMinutes)}</span> : null}
            </p>
            {day.note && <p className="opacity-75">{day.note}</p>}
          </div>
        )}
      </div>

      {endLabel !== "" && (
        <div className="mt-2 flex justify-between gap-3 text-[13px] text-muted-foreground" aria-hidden="true">
          <span>{start}</span>
          <span>{endLabel}</span>
        </div>
      )}
    </div>
  );
}

export default UptimeBar;
