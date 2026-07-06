export const deDashboardMail = {
  // page.tsx (dashboard preview wrapper)
  'dashMail.generatedDocsPreview': 'Vorschau generierter Dokumente',
  'dashMail.generatedDocsPreviewDesc': 'Dieses iframe zeigt die eigenständige Mail-Ansicht. Öffnen Sie sie im Vollbild für eine bessere Ansicht.',
  'dashMail.openInNewTab': 'Mail in neuem Tab öffnen',

  // data.tsx / mail-sidebar.tsx (nav config)
  'dashMail.inbox': 'Posteingang',
  'dashMail.priority': 'Priorität',
  'dashMail.drafts': 'Entwürfe',
  'dashMail.sent': 'Gesendet',
  'dashMail.trash': 'Papierkorb',
  'dashMail.helpFeedback': 'Hilfe & Feedback',
  'dashMail.keyboardShortcuts': 'Tastenkombinationen',
  'dashMail.folders': 'Ordner',
  'dashMail.accounts': 'Konten',
  'dashMail.addAccount': 'Konto hinzufügen',
  'dashMail.manageAccounts': 'Konten verwalten',
  'dashMail.accountSettings': 'Kontoeinstellungen',
  'dashMail.signOut': 'Abmelden',
  'dashMail.newEmail': 'Neue E-Mail',
  'dashMail.openAccountMenu': 'Menü für {label} öffnen',
  'dashMail.openAccountMenuGeneric': 'Kontomenü öffnen',
  'dashMail.selectAccount': '{label} auswählen',

  // mail-inbox.tsx
  'dashMail.inboxHeading': 'Posteingang',
  'dashMail.searchPlaceholder': 'Suchen...',
  'dashMail.pinned': 'Angeheftet',

  // mail-list.tsx
  // (group titles reuse dashMail.pinned / dashMail.inboxHeading)

  // mail-view.tsx
  'dashMail.closeMessage': 'Nachricht schließen',
  'dashMail.previousMessage': 'Vorherige Nachricht',
  'dashMail.nextMessage': 'Nächste Nachricht',
  'dashMail.pinThread': 'Thread anheften',
  'dashMail.archive': 'Archivieren',
  'dashMail.reply': 'Antworten',
  'dashMail.moreActions': 'Weitere Aktionen',
  'dashMail.replyAll': 'Allen antworten',
  'dashMail.forward': 'Weiterleiten',
  'dashMail.markAsUnread': 'Als ungelesen markieren',
  'dashMail.addLabel': 'Label hinzufügen',
  'dashMail.moveToTrash': 'In den Papierkorb verschieben',
  'dashMail.to': 'An:',
  'dashMail.cc': 'Cc:',
  'dashMail.attachments': 'Anhänge ({count})',
  'dashMail.replyPlaceholder': 'Antwort an {name} ...',
  'dashMail.noEmailSelected': 'Keine E-Mail ausgewählt',

  // mail.tsx
  'dashMail.mailMessage': 'E-Mail-Nachricht',
  'dashMail.readSelectedMessage': 'Ausgewählte E-Mail-Nachricht lesen',
  'dashMail.loadingMail': 'E-Mails werden geladen...',
} satisfies Record<string, string>;
