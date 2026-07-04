
import * as React from "react";

import { useCalendarController } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import multiMonthPlugin from "@fullcalendar/react/multimonth";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { differenceInCalendarDays, endOfMonth, format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, XIcon } from "lucide-react-dash";

import { EventCalendarViews } from "@/dashboard/components/calendar/event-calendar-views";
import { Button } from "@/components/dashboard-ui/button";
import { ButtonGroup } from "@/components/dashboard-ui/button-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { fetchMilestones, subscribeToTable } from "@/dashboard/lib/pipelineClient";

import { demoEvents, mapMilestoneToEvent } from "./events-data";

// Internal-only events (standups, capacity planning) that don't come from pipeline_milestones —
// always kept alongside whatever milestone events are live/fallback.
const internalEvents = demoEvents.filter((event) => event.groupId === "standup" || !event.title.includes("–"));

const views = [
  { key: "dayGridMonth", label: "Monat" },
  { key: "timeGridWeek", label: "Woche" },
  { key: "timeGridDay", label: "Tag" },
];

const calendars = [
  { key: "all", label: "Alle Projekte" },
  { key: "work", label: "Bergmann Maschinenbau" },
  { key: "personal", label: "Weber Präzisionstechnik" },
  { key: "team", label: "MK Anlagenbau" },
  { key: "focus", label: "Intern" },
];

const plugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin];

export function Calendar() {
  const controller = useCalendarController();
  const [eventCount, setEventCount] = React.useState(0);
  const [selectedCalendar, setSelectedCalendar] = React.useState(calendars[0].key);
  const [dateInfo, setDateInfo] = React.useState(() => {
    const now = new Date();

    return {
      title: format(now, "MMMM yyyy"),
      days: differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1,
    };
  });
  const title = dateInfo.title;
  const days = dateInfo.days;

  const [events, setEvents] = React.useState(demoEvents);

  React.useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchMilestones()
        .then((milestones) => {
          if (cancelled) return;
          if (milestones.length === 0) return;
          setEvents([...milestones.map(mapMilestoneToEvent), ...internalEvents]);
        })
        .catch(() => {
          // Terminplan falls back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribe = subscribeToTable("pipeline_milestones", load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border">
      <div className="flex flex-col gap-4 border-b bg-sidebar p-4 text-sidebar-foreground lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 shrink-0 flex-col gap-1">
          <div className="font-medium text-lg leading-none">{title}</div>
          <p className="text-muted-foreground text-sm">
            {days} Tage - {eventCount} Termine
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
            <SelectTrigger className="w-full sm:w-44">
              <CalendarIcon />
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.key} value={calendar.key}>
                    {calendar.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <ButtonGroup>
            <Button size="icon" variant="outline" onClick={() => controller.prev()}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" onClick={() => controller.today()}>
              Heute
            </Button>
            <Button size="icon" variant="outline" onClick={() => controller.next()}>
              <ChevronRight />
            </Button>
          </ButtonGroup>
          <Select
            value={controller.view?.type ?? views[0].key}
            onValueChange={(value) => {
              controller.changeView(value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {views.map((v) => (
                  <SelectItem key={v.key} value={v.key}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <Plus />
            Termin hinzufügen
          </Button>
        </div>
      </div>

      <EventCalendarViews
        controller={controller}
        initialView={views[0].key}
        plugins={[...plugins]}
        popoverCloseContent={() => <XIcon className="size-5 text-muted-foreground group-hover:text-foreground" />}
        events={events}
        nowIndicator
        datesSet={(info) => {
          setDateInfo({
            title: info.view.title,
            days: differenceInCalendarDays(info.view.currentEnd, info.view.currentStart),
          });
          setEventCount(
            events.filter((event) => {
              const start = new Date(event.start);

              return start >= info.start && start < info.end;
            }).length,
          );
        }}
      />
    </div>
  );
}
