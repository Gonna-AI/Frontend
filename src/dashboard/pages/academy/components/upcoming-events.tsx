import { addDays, format } from "date-fns";
import { ArrowRight } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const rawUpcomingEvents = [
  { dayOffset: 6, eventKey: "event1" },
  { dayOffset: 9, eventKey: "event2" },
  { dayOffset: 12, eventKey: "event3" },
  { dayOffset: 15, eventKey: "event4" },
  { dayOffset: 18, eventKey: "event5" },
] as const;

export function UpcomingEvents() {
  const { t } = useLanguage();
  const today = new Date();

  const upcomingEvents = rawUpcomingEvents.map((item) => ({
    dayOffset: item.dayOffset,
    title: t(`dashAcademy.upcomingEvents.${item.eventKey}.title`),
    time: t(`dashAcademy.upcomingEvents.${item.eventKey}.time`),
    type: t(`dashAcademy.upcomingEvents.${item.eventKey}.type`),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{t('dashAcademy.upcomingEvents.title')}</CardTitle>
        <CardAction className="flex items-center gap-1 text-muted-foreground text-xs">
          {t('dashAcademy.upcomingEvents.viewCalendar')} <ArrowRight className="size-4" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {upcomingEvents.map((event) => {
          const eventDate = addDays(today, event.dayOffset);

          return (
            <div key={event.title} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="size-11 shrink-0 overflow-hidden rounded-sm border">
                  <div className="grid h-1/3 place-items-center border-b bg-muted font-medium text-[10px] uppercase leading-none">
                    {format(eventDate, "MMM")}
                  </div>
                  <div className="grid h-2/3 place-items-center text-lg leading-none">{format(eventDate, "d")}</div>
                </div>

                <div className="flex min-w-0 flex-col gap-1">
                  <div className="truncate font-medium text-sm leading-none">{event.title}</div>
                  <div className="text-muted-foreground text-xs leading-none">{event.time}</div>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 rounded-md px-2.5 py-1 font-medium text-[10px]">
                {event.type}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
