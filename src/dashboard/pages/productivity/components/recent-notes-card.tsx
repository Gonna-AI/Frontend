import { format, isToday, isYesterday, subDays } from "date-fns";
import { BookOpen, FileText } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";

const today = new Date();

function formatNoteDate(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

const recentNotes = [
  { title: "Kostencheck-Regeln für Sondermotoren", date: formatNoteDate(today), icon: FileText },
  { title: `Lieferzeiten TM-75 – ${format(today, "MMMM")}`, date: formatNoteDate(subDays(today, 1)), icon: FileText },
  { title: "Abweichungen der letzten Woche", date: formatNoteDate(subDays(today, 4)), icon: FileText },
  { title: "AB-Vorlagen für THD GmbH", date: formatNoteDate(subDays(today, 5)), icon: BookOpen },
] as const;

export function RecentNotesCard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {recentNotes.map((note) => (
          <div key={note.title} className="flex items-start gap-4">
            <note.icon className="size-5 text-muted-foreground" />
            <div className="min-w-0">
              <div className="truncate font-medium text-sm leading-none">{note.title}</div>
              <div className="text-muted-foreground text-xs">{note.date}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
