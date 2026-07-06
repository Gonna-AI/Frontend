
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  FileText,
  Flame,
  type LucideIcon,
  MessageSquare,
  Minus,
  Paperclip,
} from "lucide-react-dash";

import { Avatar, AvatarFallback } from "@/components/dashboard-ui/avatar";
import { Badge } from "@/components/dashboard-ui/badge";
import { Progress } from "@/components/dashboard-ui/progress";
import { Separator } from "@/components/dashboard-ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, getInitials } from "@/lib/utils";

import { taskI18nKeys, tagTones } from "./data";
import type { ColumnId, Task, TaskInsightLabel, TaskPriority } from "./types";

const priorityI18nKey: Record<TaskPriority, string> = {
  High: "dashKanban.priority.high",
  Medium: "dashKanban.priority.medium",
  Low: "dashKanban.priority.low",
};

const teamI18nKey: Record<string, string> = {
  Backend: "dashKanban.team.backend",
  Data: "dashKanban.team.data",
  Design: "dashKanban.team.design",
  Docs: "dashKanban.team.docs",
  "Finance Ops": "dashKanban.team.financeOps",
  Platform: "dashKanban.team.platform",
  Product: "dashKanban.team.product",
  QA: "dashKanban.team.qa",
  Security: "dashKanban.team.security",
};

const insightI18nKey: Record<TaskInsightLabel, string> = {
  Attachments: "dashKanban.insight.attachments",
  Comments: "dashKanban.insight.comments",
  Documents: "dashKanban.insight.documents",
};

const dueDateI18nKey: Record<string, string> = {
  "KW 28": "dashKanban.due.kw28",
  "KW 29": "dashKanban.due.kw29",
  "KW 30": "dashKanban.due.kw30",
  "KW 31": "dashKanban.due.kw31",
};

const taskInsightIcons: Record<TaskInsightLabel, LucideIcon> = {
  Attachments: Paperclip,
  Comments: MessageSquare,
  Documents: FileText,
};

const priorityBadgeConfig: Record<
  TaskPriority,
  { icon: LucideIcon; variant: "destructive" | "secondary"; className: string }
> = {
  High: {
    icon: Flame,
    variant: "destructive",
    className: "border-transparent",
  },
  Low: {
    icon: Minus,
    variant: "secondary",
    className: "bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  },
  Medium: {
    icon: ArrowUpRight,
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
};

export function TaskCard({
  task,
  columnId,
  isOverlay = false,
}: {
  task: Task;
  columnId?: ColumnId;
  isOverlay?: boolean;
}) {
  const { t } = useLanguage();
  const isDone = columnId === "shipped";
  const showBuildingDetails = columnId === "building" && typeof task.progress === "number";
  const owner = task.owner;
  const PriorityIcon = priorityBadgeConfig[task.priority].icon;
  const i18nKey = taskI18nKeys[task.id];
  const title = i18nKey ? t(`dashKanban.task.${i18nKey}.title`) : task.title;
  const description = i18nKey ? t(`dashKanban.task.${i18nKey}.description`) : task.description;
  const dueDateKey = dueDateI18nKey[task.dueDate];
  const dueDate = dueDateKey ? t(dueDateKey) : task.dueDate;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs",
        isOverlay && "w-68 rotate-1 shadow-lg",
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate font-medium text-sm leading-none">{title}</h3>
          <Badge
            variant={priorityBadgeConfig[task.priority].variant}
            className={cn(
              "shrink-0 rounded-md border-transparent px-2 font-medium",
              priorityBadgeConfig[task.priority].className,
            )}
          >
            <PriorityIcon data-icon="inline-start" />
            {t(priorityI18nKey[task.priority])}
          </Badge>
        </div>
        <p className="line-clamp-2 text-muted-foreground text-sm leading-5">{description}</p>
      </div>

      {!showBuildingDetails ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar className={cn("size-5 after:rounded-sm", owner.tone)}>
              <AvatarFallback className="rounded-sm text-[10px]">{getInitials(owner.name)}</AvatarFallback>
            </Avatar>

            <span className="text-muted-foreground text-sm">{owner.name}</span>
          </div>

          <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <span className="truncate text-sm">{dueDate}</span>
            <CalendarDays className="size-3" />
          </div>
        </div>
      ) : null}

      {showBuildingDetails ? (
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="leading-none">{t('dashKanban.card.progress')}</span>
              <span className="tabular-nums leading-none">{task.progress}%</span>
            </div>
            <Progress value={task.progress} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">{t('dashKanban.card.owner')}</span>
              <div className="flex items-center gap-1.5">
                <span className="truncate text-muted-foreground text-sm">{owner.name}</span>
                <Avatar className={cn("size-5 after:rounded-sm", owner.tone)}>
                  <AvatarFallback className="rounded-sm text-[10px]">{getInitials(owner.name)}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">{t('dashKanban.card.due')}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="truncate text-sm">{dueDate}</span>
                <CalendarDays className="size-3" />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">{t('dashKanban.card.team')}</span>
              <Badge
                variant="secondary"
                className={cn("rounded-md border-transparent px-2 font-medium", tagTones[task.team])}
              >
                {t(teamI18nKey[task.team])}
              </Badge>
            </div>
          </div>
        </div>
      ) : null}

      <Separator />

      <div>
        {isDone ? (
          <div className="flex items-center gap-1 font-medium text-green-700 text-sm dark:text-green-600">
            <BadgeCheck className="size-4" />
            {t('dashKanban.card.done')}
          </div>
        ) : null}

        {!isDone ? (
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            {task.insights.map((insight) => {
              const Icon = taskInsightIcons[insight.label];

              return (
                <span
                  key={insight.label}
                  className="flex items-center gap-1.5 text-sm"
                  title={t(insightI18nKey[insight.label])}
                >
                  <Icon className="size-3.5" />
                  {insight.count}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}
