import { addDays, format } from "date-fns";
import { ClipboardCheck, Globe, Orbit, Plus } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Progress } from "@/components/dashboard-ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const today = new Date();

export function ProjectsSection() {
  const { t } = useLanguage();

  const projects = [
    {
      title: t("dashProductivity.projects.project1.title"),
      status: t("dashProductivity.projects.status.inProgress"),
      description: t("dashProductivity.projects.project1.description"),
      progress: 68,
      due: t("dashProductivity.projects.due").replace("{date}", format(addDays(today, 9), "MMM d")),
      icon: Orbit,
    },
    {
      title: t("dashProductivity.projects.project2.title"),
      status: t("dashProductivity.projects.status.planning"),
      description: t("dashProductivity.projects.project2.description"),
      progress: 42,
      due: t("dashProductivity.projects.due").replace("{date}", format(addDays(today, 21), "MMM d")),
      icon: Globe,
    },
    {
      title: t("dashProductivity.projects.project3.title"),
      status: t("dashProductivity.projects.status.planning"),
      description: t("dashProductivity.projects.project3.description"),
      progress: 31,
      due: t("dashProductivity.projects.due").replace("{date}", format(addDays(today, 18), "MMM d")),
      icon: ClipboardCheck,
    },
  ] as const;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl tracking-tight">{t("dashProductivity.projects.heading")}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="active">
            <SelectTrigger className="w-28">
              <SelectValue placeholder={t("dashProductivity.projects.filter.active")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="active">{t("dashProductivity.projects.filter.active")}</SelectItem>
                <SelectItem value="planning">{t("dashProductivity.projects.filter.planning")}</SelectItem>
                <SelectItem value="completed">{t("dashProductivity.projects.filter.completed")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Plus data-icon="inline-start" />
            {t("dashProductivity.projects.newButton")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.title} className="min-w-0 shadow-xs">
            <CardHeader className="gap-2">
              <CardTitle className="min-w-0">
                <div className="flex min-w-0 items-start gap-2">
                  <project.icon className="size-4 text-muted-foreground" />
                  <span className="min-w-0 break-words">{project.title}</span>
                </div>
              </CardTitle>
              <CardAction className="min-w-0">
                <Badge variant="outline" className="max-w-full truncate">
                  {project.status}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="text-sm leading-none">{project.description}</div>
                <div className="flex items-center gap-3">
                  <Progress value={project.progress} className="h-2" />
                  <span className="shrink-0 text-sm">{project.progress}%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-2.5">
              <span className="text-muted-foreground">{project.due}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
