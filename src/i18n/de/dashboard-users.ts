export const deDashboardUsers = {
  // users.tsx
  'dashUsers.heading': 'Team & Kontakte',
  'dashUsers.description': 'Verwalten Sie THD-Teammitglieder, Rollen und Kundenkontakte über alle Projekte hinweg.',
  'dashUsers.searchPlaceholder': 'Team & Kontakte durchsuchen...',
  'dashUsers.hide': 'Ausblenden',
  'dashUsers.customize': 'Anpassen',
  'dashUsers.export': 'Exportieren',
  'dashUsers.addContact': 'Kontakt hinzufügen',
  'dashUsers.roleLabel': 'Rolle:',
  'dashUsers.teamLabel': 'Team:',
  'dashUsers.statusLabel': 'Status:',
  'dashUsers.workspaceLabel': 'Arbeitsbereich:',
  'dashUsers.selectedCount': '{count} ausgewählt',
  'dashUsers.listView': 'Listenansicht',
  'dashUsers.gridView': 'Rasteransicht',
  'dashUsers.filterAll': 'Alle',

  // users-columns.tsx
  'dashUsers.column.user': 'Benutzer',
  'dashUsers.column.roleTeam': 'Rolle / Team',
  'dashUsers.column.team': 'Team',
  'dashUsers.column.workspace': 'Arbeitsbereich',
  'dashUsers.column.status': 'Status',
  'dashUsers.column.joinedDate': 'Beigetreten am',
  'dashUsers.column.actions': 'Aktionen',
  'dashUsers.selectAllAria': 'Alle Benutzer auswählen',
  'dashUsers.selectRowAria': '{name} auswählen',
  'dashUsers.openActionsAria': 'Aktionen für {name} öffnen',
  'dashUsers.action.viewProfile': 'Profil ansehen',
  'dashUsers.action.editUser': 'Benutzer bearbeiten',
  'dashUsers.action.manageTeam': 'Team verwalten',
  'dashUsers.action.resendInvite': 'Einladung erneut senden',
  'dashUsers.action.deactivateUser': 'Benutzer deaktivieren',

  // status labels (badge display text; underlying filter/type values stay in English)
  'dashUsers.status.active': 'Aktiv',
  'dashUsers.status.pendingInvite': 'Einladung ausstehend',
  'dashUsers.status.deactivated': 'Deaktiviert',
  'dashUsers.status.locked': 'Gesperrt',
  'dashUsers.status.suspended': 'Suspendiert',

  // users-table.tsx
  'dashUsers.table.noResults': 'Keine Ergebnisse.',
  'dashUsers.table.rowsPerPage': 'Zeilen pro Seite',
  'dashUsers.table.pageOf': 'Seite {current} von {total}',
} satisfies Record<string, string>;
