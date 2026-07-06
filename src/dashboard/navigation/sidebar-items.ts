import {
  Banknote,
  Calendar,
  ChartBar,
  CheckSquare,
  Forklift,
  Gauge,
  GraduationCap,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Lock,
  type LucideIcon,
  Mail,
  MessageSquare,
  ReceiptText,
  Server,
  ShoppingBag,
  SquareArrowUpRight,
  Users,
} from "lucide-react-dash";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  titleKey: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  titleKey: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  labelKey?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    labelKey: "dashShell.nav.group.dashboards",
    items: [
      {
        id: "default",
        title: "Command Center",
        titleKey: "dashShell.nav.item.default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        id: "crm",
        title: "Sales Pipeline",
        titleKey: "dashShell.nav.item.crm",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
      {
        id: "finance",
        title: "Kostencheck",
        titleKey: "dashShell.nav.item.finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
      {
        id: "analytics",
        title: "AI Performance",
        titleKey: "dashShell.nav.item.analytics",
        url: "/dashboard/analytics",
        icon: Gauge,
      },
      {
        id: "productivity",
        title: "Engineer Workload",
        titleKey: "dashShell.nav.item.productivity",
        url: "/dashboard/productivity",
        icon: ListTodo,
      },
      {
        id: "ecommerce",
        title: "Products & Procurement",
        titleKey: "dashShell.nav.item.ecommerce",
        url: "/dashboard/ecommerce",
        icon: ShoppingBag,
      },
      {
        id: "academy",
        title: "Project Memory",
        titleKey: "dashShell.nav.item.academy",
        url: "/dashboard/academy",
        icon: GraduationCap,
      },
      {
        id: "logistics",
        title: "Deliveries",
        titleKey: "dashShell.nav.item.logistics",
        url: "/dashboard/logistics",
        icon: Forklift,
      },
      {
        id: "infrastructure",
        title: "Live Stack",
        titleKey: "dashShell.nav.item.infrastructure",
        url: "/dashboard/infrastructure",
        icon: Server,
        badge: "new",
      },
      {
        id: "analytics-v1",
        title: "Analytics",
        titleKey: "dashShell.nav.item.analyticsV1",
        url: "/dashboard/analytics-v1",
        icon: Gauge,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    labelKey: "dashShell.nav.group.pages",
    items: [
      {
        id: "email",
        title: "Generated Documents",
        titleKey: "dashShell.nav.item.email",
        url: "/dashboard/mail",
        icon: Mail,
      },
      {
        id: "chat",
        title: "Copilot",
        titleKey: "dashShell.nav.item.chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      {
        id: "calendar",
        title: "Terminplan",
        titleKey: "dashShell.nav.item.calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        id: "kanban",
        title: "KickOff Board",
        titleKey: "dashShell.nav.item.kanban",
        url: "/dashboard/kanban",
        icon: Kanban,
      },
      {
        id: "tasks",
        title: "Checklisten",
        titleKey: "dashShell.nav.item.tasks",
        url: "/dashboard/tasks",
        icon: CheckSquare,
        badge: "new",
      },
      {
        id: "invoice",
        title: "Auftragsbestätigung (AB)",
        titleKey: "dashShell.nav.item.invoice",
        url: "/dashboard/invoice",
        icon: ReceiptText,
      },
      {
        id: "users",
        title: "Team & Contacts",
        titleKey: "dashShell.nav.item.users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        id: "roles",
        title: "Access Control",
        titleKey: "dashShell.nav.item.roles",
        url: "/dashboard/roles",
        icon: Lock,
      },
    ],
  },
  {
    id: 3,
    label: "Misc",
    labelKey: "dashShell.nav.group.misc",
    items: [
      {
        id: "others",
        title: "Others",
        titleKey: "dashShell.nav.item.others",
        url: "/dashboard/coming-soon",
        icon: SquareArrowUpRight,
        badge: "soon",
        disabled: true,
      },
    ],
  },
];
