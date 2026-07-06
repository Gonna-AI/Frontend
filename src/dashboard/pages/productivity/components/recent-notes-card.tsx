import { format, isToday, isYesterday, subDays } from "date-fns";
import { BookOpen, FileText } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const today = new Date();

export function RecentNotesCard() {
  const { t } = useLanguage();

  function formatNoteDate(date: Date) {
    if (isToday(date)) return t("dashProductivity.notes.today");
    if (isYesterday(date)) return t("dashProductivity.notes.yesterday");
    return format(date, "MMM d");
  }

  const recentNotes = [
    { title: t("dashProductivity.notes.note1.title"), date: formatNoteDate(today), icon: FileText },
    { title: t("dashProductivity.notes.note2.title").replace("{month}", format(today, "MMMM")), date: formatNoteDate(subDays(today, 1)), icon: FileText },
    { title: t("dashProductivity.notes.note3.title"), date: formatNoteDate(subDays(today, 4)), icon: FileText },
    { title: t("dashProductivity.notes.note4.title"), date: formatNoteDate(subDays(today, 5)), icon: BookOpen },
  ] as const;

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{t("dashProductivity.notes.title")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            {t("dashProductivity.notes.viewAll")}
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
