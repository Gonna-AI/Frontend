import { ArrowDown, ArrowRight, ArrowUp, CheckCircle, Circle, CircleOff, HelpCircle, Timer } from "lucide-react-dash";
import { z } from "zod";

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
});

export type Task = z.infer<typeof taskSchema>;

// Seed rows reference an i18n key (titleKey) instead of a literal title — buildLocalizedTasks()
// below resolves the key with t() so the demo/mock data is translated along with the rest of the UI.
const tasksSeed = [
  {
    id: "CHK-88431-1",
    titleKey: "dashTasks.task.chk884311.title",
    status: "todo",
    label: "procurement",
    priority: "high",
  },
  {
    id: "CHK-88431-2",
    titleKey: "dashTasks.task.chk884312.title",
    status: "todo",
    label: "review",
    priority: "medium",
  },
  {
    id: "CHK-88431-3",
    titleKey: "dashTasks.task.chk884313.title",
    status: "todo",
    label: "engineering",
    priority: "high",
  },
  {
    id: "CHK-88431-4",
    titleKey: "dashTasks.task.chk884314.title",
    status: "todo",
    label: "review",
    priority: "high",
  },
  {
    id: "CHK-88431-5",
    titleKey: "dashTasks.task.chk884315.title",
    status: "todo",
    label: "finance",
    priority: "high",
  },
  {
    id: "CHK-88431-6",
    titleKey: "dashTasks.task.chk884316.title",
    status: "in progress",
    label: "review",
    priority: "high",
  },
  {
    id: "CHK-88431-7",
    titleKey: "dashTasks.task.chk884317.title",
    status: "backlog",
    label: "review",
    priority: "medium",
  },
  {
    id: "CHK-0198-1",
    titleKey: "dashTasks.task.chk01981.title",
    status: "in progress",
    label: "review",
    priority: "medium",
  },
  {
    id: "CHK-0198-2",
    titleKey: "dashTasks.task.chk01982.title",
    status: "todo",
    label: "procurement",
    priority: "medium",
  },
  {
    id: "CHK-0198-3",
    titleKey: "dashTasks.task.chk01983.title",
    status: "backlog",
    label: "review",
    priority: "low",
  },
  {
    id: "CHK-2044-1",
    titleKey: "dashTasks.task.chk20441.title",
    status: "todo",
    label: "review",
    priority: "medium",
  },
  {
    id: "CHK-2044-2",
    titleKey: "dashTasks.task.chk20442.title",
    status: "in progress",
    label: "procurement",
    priority: "medium",
  },
  {
    id: "CHK-2044-3",
    titleKey: "dashTasks.task.chk20443.title",
    status: "done",
    label: "finance",
    priority: "low",
  },
  {
    id: "CHK-2044-4",
    titleKey: "dashTasks.task.chk20444.title",
    status: "done",
    label: "review",
    priority: "low",
  },
];

// Build the localized fallback/demo task list. Call with the t() function from useLanguage().
export function buildLocalizedTasks(t: (key: string) => string): Task[] {
  return z.array(taskSchema).parse(
    tasksSeed.map(({ titleKey, ...rest }) => ({
      ...rest,
      title: t(titleKey),
    })),
  );
}

const labelsSeed = [
  {
    value: "procurement",
    labelKey: "dashTasks.label.procurement",
  },
  {
    value: "review",
    labelKey: "dashTasks.label.review",
  },
  {
    value: "engineering",
    labelKey: "dashTasks.label.engineering",
  },
  {
    value: "finance",
    labelKey: "dashTasks.label.finance",
  },
];

const statusesSeed = [
  {
    value: "backlog",
    labelKey: "dashTasks.status.backlog",
    icon: HelpCircle,
  },
  {
    value: "todo",
    labelKey: "dashTasks.status.todo",
    icon: Circle,
  },
  {
    value: "in progress",
    labelKey: "dashTasks.status.inProgress",
    icon: Timer,
  },
  {
    value: "done",
    labelKey: "dashTasks.status.done",
    icon: CheckCircle,
  },
  {
    value: "canceled",
    labelKey: "dashTasks.status.canceled",
    icon: CircleOff,
  },
];

const prioritiesSeed = [
  {
    labelKey: "dashTasks.priority.low",
    value: "low",
    icon: ArrowDown,
  },
  {
    labelKey: "dashTasks.priority.medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    labelKey: "dashTasks.priority.high",
    value: "high",
    icon: ArrowUp,
  },
];

// Localized getters. Call with the t() function from useLanguage() to resolve display labels.
export function getLocalizedLabels(t: (key: string) => string) {
  return labelsSeed.map(({ labelKey, ...rest }) => ({ ...rest, label: t(labelKey) }));
}

export function getLocalizedStatuses(t: (key: string) => string) {
  return statusesSeed.map(({ labelKey, ...rest }) => ({ ...rest, label: t(labelKey) }));
}

export function getLocalizedPriorities(t: (key: string) => string) {
  return prioritiesSeed.map(({ labelKey, ...rest }) => ({ ...rest, label: t(labelKey) }));
}
