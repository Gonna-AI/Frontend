// Workspace strings. Loaded on demand with the dashboard, never with the public site.
import { deDashboardAcademy } from './dashboard-academy';
import { deDashboardAnalyticsV1 } from './dashboard-analytics-v1';
import { deDashboardAnalytics } from './dashboard-analytics';
import { deDashboardCalendar } from './dashboard-calendar';
import { deDashboardChat } from './dashboard-chat';
import { deDashboardCrm } from './dashboard-crm';
import { deDashboardDefault } from './dashboard-default';
import { deDashboardEcommerce } from './dashboard-ecommerce';
import { deDashboardFinance } from './dashboard-finance';
import { deDashboardInfrastructure } from './dashboard-infrastructure';
import { deDashboardInvoice } from './dashboard-invoice';
import { deDashboardKanban } from './dashboard-kanban';
import { deDashboardLogistics } from './dashboard-logistics';
import { deDashboardMail } from './dashboard-mail';
import { deDashboardProductivity } from './dashboard-productivity';
import { deDashboardRoles } from './dashboard-roles';
import { deDashboardShell } from './dashboard-shell';
import { deDashboardTasks } from './dashboard-tasks';
import { deDashboardUsers } from './dashboard-users';

export const deDashboard: Record<string, string> = {
    ...deDashboardAcademy,
    ...deDashboardAnalyticsV1,
    ...deDashboardAnalytics,
    ...deDashboardCalendar,
    ...deDashboardChat,
    ...deDashboardCrm,
    ...deDashboardDefault,
    ...deDashboardEcommerce,
    ...deDashboardFinance,
    ...deDashboardInfrastructure,
    ...deDashboardInvoice,
    ...deDashboardKanban,
    ...deDashboardLogistics,
    ...deDashboardMail,
    ...deDashboardProductivity,
    ...deDashboardRoles,
    ...deDashboardShell,
    ...deDashboardTasks,
    ...deDashboardUsers,
};
