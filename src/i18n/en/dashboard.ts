// Workspace strings. Loaded on demand with the dashboard, never with the public site.
import { enDashboardAcademy } from './dashboard-academy';
import { enDashboardAnalyticsV1 } from './dashboard-analytics-v1';
import { enDashboardAnalytics } from './dashboard-analytics';
import { enDashboardCalendar } from './dashboard-calendar';
import { enDashboardChat } from './dashboard-chat';
import { enDashboardCrm } from './dashboard-crm';
import { enDashboardDefault } from './dashboard-default';
import { enDashboardEcommerce } from './dashboard-ecommerce';
import { enDashboardFinance } from './dashboard-finance';
import { enDashboardInfrastructure } from './dashboard-infrastructure';
import { enDashboardInvoice } from './dashboard-invoice';
import { enDashboardKanban } from './dashboard-kanban';
import { enDashboardLogistics } from './dashboard-logistics';
import { enDashboardMail } from './dashboard-mail';
import { enDashboardProductivity } from './dashboard-productivity';
import { enDashboardRoles } from './dashboard-roles';
import { enDashboardShell } from './dashboard-shell';
import { enDashboardTasks } from './dashboard-tasks';
import { enDashboardUsers } from './dashboard-users';

export const enDashboard: Record<string, string> = {
    ...enDashboardAcademy,
    ...enDashboardAnalyticsV1,
    ...enDashboardAnalytics,
    ...enDashboardCalendar,
    ...enDashboardChat,
    ...enDashboardCrm,
    ...enDashboardDefault,
    ...enDashboardEcommerce,
    ...enDashboardFinance,
    ...enDashboardInfrastructure,
    ...enDashboardInvoice,
    ...enDashboardKanban,
    ...enDashboardLogistics,
    ...enDashboardMail,
    ...enDashboardProductivity,
    ...enDashboardRoles,
    ...enDashboardShell,
    ...enDashboardTasks,
    ...enDashboardUsers,
};
