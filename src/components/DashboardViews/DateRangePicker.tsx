import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useLanguage } from "../../contexts/LanguageContext";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  isDark?: boolean;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  isDark = true,
}: DateRangePickerProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selection, setSelection] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: startDate, end: endDate });
  const [viewDate, setViewDate] = useState(new Date(startDate)); // Month to show (1st of 2)
  const containerRef = useRef<HTMLDivElement>(null);

  // Helpers
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay(); // 0 = Sun

  const getMonthData = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    // Previous month padding
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, date: new Date(year, month, i) });
    }
    // Next month padding (optional, usually simple grid is enough)
    return days;
  };

  const formatDate = (date: Date) => {
    const locale = language === "de" ? "de-DE" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatMonthYear = (date: Date) => {
    const locale = language === "de" ? "de-DE" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const handleDateClick = (date: Date) => {
    if (!selection.start || (selection.start && selection.end)) {
      // New range start
      setSelection({ start: date, end: null });
    } else {
      // Complete range
      let start = selection.start;
      let end = date;
      if (end < start) {
        [start, end] = [end, start];
      }
      setSelection({ start, end });
      onChange(start, end);
      // Optionally close? Let's keep open for manual verify or close after delay?
      // Better to close explicitly or clicking outside.
    }
  };

  const isSelected = (date: Date) => {
    if (!selection.start) return false;
    if (selection.end) {
      return (
        date.getTime() === selection.start.getTime() ||
        date.getTime() === selection.end.getTime()
      );
    }
    return date.getTime() === selection.start.getTime();
  };

  const isInRange = (date: Date) => {
    if (!selection.start || !selection.end) return false;
    return date > selection.start && date < selection.end;
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync external props if needed, but local state drives selection during open
  useEffect(() => {
    if (!isOpen) {
      setSelection({ start: startDate, end: endDate });
    }
  }, [isOpen, startDate, endDate]);

  const renderMonth = (offset: number) => {
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth() + offset;
    // Adjust for year rollover handled by Date constructor automatically?
    // new Date(2025, 12, 1) -> Jan 2026. Yes.
    const d = new Date(currentYear, currentMonth, 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    const days = getMonthData(year, month);
    const weeks = [];
    const week = [];

    // Headers
    const weekDays = [
      t("dateRange.su"),
      t("dateRange.mo"),
      t("dateRange.tu"),
      t("dateRange.we"),
      t("dateRange.th"),
      t("dateRange.fr"),
      t("dateRange.sa"),
    ];

    return (
      <div className="w-[300px] p-2">
        <div
          className={cn(
            "text-center font-medium mb-4",
            isDark ? "text-white" : "text-black",
          )}
        >
          {formatMonthYear(d)}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((wd) => (
            <div
              key={wd}
              className={cn(
                "h-8 flex items-center justify-center text-xs text-white/40",
                isDark ? "text-white/40" : "text-black/40",
              )}
            >
              {wd}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2">
          {days.map((item, idx) => {
            if (!item.date) return <div key={idx} />; // spacer
            const isSel = isSelected(item.date);
            const isRange = isInRange(item.date);

            return (
              <button
                key={idx}
                onClick={() => item.date && handleDateClick(item.date)}
                className={cn(
                  "h-9 w-full flex items-center justify-center text-sm rounded-md transition-all relative z-10",
                  isSel
                    ? "bg-white text-black font-semibold"
                    : isRange
                      ? "bg-white/10 text-white rounded-none mx-[-2px] w-[calc(100%+4px)] z-0"
                      : "text-white hover:bg-white/10",
                  !isDark &&
                    !isSel &&
                    !isRange &&
                    "text-black hover:bg-black/5",
                  !isDark && isRange && "bg-black/5 text-black",
                  !isDark && isSel && "bg-black text-white",
                )}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors",
          isDark
            ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
            : "bg-black/5 border-black/10 text-black hover:bg-black/10",
        )}
      >
        <CalendarIcon className="w-4 h-4 text-white/40" />
        <span>
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 p-4 rounded-xl border z-50 shadow-2xl flex flex-col gap-4",
            isDark ? "bg-[#111] border-white/10" : "bg-white border-black/10",
          )}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-white/10 rounded-md"
            >
              <ChevronLeft
                className={cn("w-5 h-5", isDark ? "text-white" : "text-black")}
              />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-white/10 rounded-md"
            >
              <ChevronRight
                className={cn("w-5 h-5", isDark ? "text-white" : "text-black")}
              />
            </button>
          </div>

          <div className="flex gap-4 md:flex-row flex-col">
            {renderMonth(0)}
            <div className={cn("w-px bg-white/10 hidden md:block")} />
            {renderMonth(1)}
          </div>
        </div>
      )}
    </div>
  );
}
