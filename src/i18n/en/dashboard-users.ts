export const enDashboardUsers = {
  // users.tsx
  'dashUsers.heading': 'Team & Contacts',
  'dashUsers.description': 'Manage THD team members, roles, and customer contacts across projects.',
  'dashUsers.searchPlaceholder': 'Search team & contacts...',
  'dashUsers.hide': 'Hide',
  'dashUsers.customize': 'Customize',
  'dashUsers.export': 'Export',
  'dashUsers.addContact': 'Add Contact',
  'dashUsers.roleLabel': 'Role:',
  'dashUsers.teamLabel': 'Team:',
  'dashUsers.statusLabel': 'Status:',
  'dashUsers.workspaceLabel': 'Workspace:',
  'dashUsers.selectedCount': '{count} selected',
  'dashUsers.listView': 'List view',
  'dashUsers.gridView': 'Grid view',
  'dashUsers.filterAll': 'All',

  // users-columns.tsx
  'dashUsers.column.user': 'User',
  'dashUsers.column.roleTeam': 'Role / Team',
  'dashUsers.column.team': 'Team',
  'dashUsers.column.workspace': 'Workspace',
  'dashUsers.column.status': 'Status',
  'dashUsers.column.joinedDate': 'Joined date',
  'dashUsers.column.actions': 'Actions',
  'dashUsers.selectAllAria': 'Select all users',
  'dashUsers.selectRowAria': 'Select {name}',
  'dashUsers.openActionsAria': 'Open actions for {name}',
  'dashUsers.action.viewProfile': 'View profile',
  'dashUsers.action.editUser': 'Edit user',
  'dashUsers.action.manageTeam': 'Manage team',
  'dashUsers.action.resendInvite': 'Resend invite',
  'dashUsers.action.deactivateUser': 'Deactivate user',

  // status labels (badge display text; underlying filter/type values stay in English)
  'dashUsers.status.active': 'Active',
  'dashUsers.status.pendingInvite': 'Pending invite',
  'dashUsers.status.deactivated': 'Deactivated',
  'dashUsers.status.locked': 'Locked',
  'dashUsers.status.suspended': 'Suspended',

  // users-table.tsx
  'dashUsers.table.noResults': 'No results.',
  'dashUsers.table.rowsPerPage': 'Rows per page',
  'dashUsers.table.pageOf': 'Page {current} of {total}',
} satisfies Record<string, string>;
