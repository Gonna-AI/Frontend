
import * as React from "react";

import { Calendar1, Plus } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

type Task = {
  title: string;
  tag: string;
  time: string;
  checked: boolean;
};

export function TasksSection() {
  const { t } = useLanguage();

  const tasks: Task[] = [
    { title: t("dashProductivity.tasks.task1.title"), tag: t("dashProductivity.tasks.tag.kostencheck"), time: "10:00 AM", checked: false },
    { title: t("dashProductivity.tasks.task2.title"), tag: t("dashProductivity.tasks.tag.kostencheck"), time: "11:30 AM", checked: true },
    { title: t("dashProductivity.tasks.task3.title"), tag: t("dashProductivity.tasks.tag.kostencheck"), time: "2:00 PM", checked: false },
    { title: t("dashProductivity.tasks.task4.title"), tag: t("dashProductivity.tasks.tag.kostencheck"), time: "4:30 PM", checked: false },
    { title: t("dashProductivity.tasks.task5.title"), tag: t("dashProductivity.tasks.tag.kostencheck"), time: "6:00 PM", checked: false },
  ];

  const [items, setItems] = React.useState(tasks);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl tracking-tight">{t("dashProductivity.tasks.heading")}</h2>
        <div className="flex items-center gap-2">
          <Select defaultValue="today">
            <SelectTrigger className="w-30">
              <SelectValue placeholder={t("dashProductivity.tasks.filter.today")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="today">{t("dashProductivity.tasks.filter.today")}</SelectItem>
                <SelectItem value="tomorrow">{t("dashProductivity.tasks.filter.tomorrow")}</SelectItem>
                <SelectItem value="this-week">{t("dashProductivity.tasks.filter.thisWeek")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <Plus data-icon="inline-start" />
            {t("dashProductivity.tasks.newButton")}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
        <div className="divide-y">
          {items.map((task) => (
            <div key={task.title} className="flex items-center gap-2 p-4">
              <Checkbox
                checked={task.checked}
                aria-label={task.title}
                onCheckedChange={(checked) => {
                  setItems((current) =>
                    current.map((item) => (item.title === task.title ? { ...item, checked: checked === true } : item)),
                  );
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                    <span className="truncate text-sm">{task.title}</span>
                    <Badge variant="outline" className="px-3 py-1 font-normal">
                      {task.tag}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-muted-foreground text-sm">
                    <span>{task.time}</span>
                    <Calendar1 className="size-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
