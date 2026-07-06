export const enDashboardMail = {
  // page.tsx (dashboard preview wrapper)
  'dashMail.generatedDocsPreview': 'Generated documents preview',
  'dashMail.generatedDocsPreviewDesc': 'This iframe shows the standalone mail screen. Open it in full screen for a better view.',
  'dashMail.openInNewTab': 'Open mail in a new tab',

  // data.tsx / mail-sidebar.tsx (nav config)
  'dashMail.inbox': 'Inbox',
  'dashMail.priority': 'Priority',
  'dashMail.drafts': 'Drafts',
  'dashMail.sent': 'Sent',
  'dashMail.trash': 'Trash',
  'dashMail.helpFeedback': 'Help & feedback',
  'dashMail.keyboardShortcuts': 'Keyboard shortcuts',
  'dashMail.folders': 'Folders',
  'dashMail.accounts': 'Accounts',
  'dashMail.addAccount': 'Add account',
  'dashMail.manageAccounts': 'Manage accounts',
  'dashMail.accountSettings': 'Account settings',
  'dashMail.signOut': 'Sign out',
  'dashMail.newEmail': 'New email',
  'dashMail.openAccountMenu': 'Open menu for {label}',
  'dashMail.openAccountMenuGeneric': 'Open account menu',
  'dashMail.selectAccount': 'Select {label}',

  // mail-inbox.tsx
  'dashMail.inboxHeading': 'Inbox',
  'dashMail.searchPlaceholder': 'Search...',
  'dashMail.pinned': 'Pinned',

  // mail-list.tsx
  // (group titles reuse dashMail.pinned / dashMail.inboxHeading)

  // mail-view.tsx
  'dashMail.closeMessage': 'Close message',
  'dashMail.previousMessage': 'Previous message',
  'dashMail.nextMessage': 'Next message',
  'dashMail.pinThread': 'Pin thread',
  'dashMail.archive': 'Archive',
  'dashMail.reply': 'Reply',
  'dashMail.moreActions': 'More actions',
  'dashMail.replyAll': 'Reply all',
  'dashMail.forward': 'Forward',
  'dashMail.markAsUnread': 'Mark as unread',
  'dashMail.addLabel': 'Add label',
  'dashMail.moveToTrash': 'Move to trash',
  'dashMail.to': 'To:',
  'dashMail.cc': 'Cc:',
  'dashMail.attachments': 'Attachments ({count})',
  'dashMail.replyPlaceholder': 'Reply {name}...',
  'dashMail.noEmailSelected': 'No email selected',

  // mail.tsx
  'dashMail.mailMessage': 'Mail message',
  'dashMail.readSelectedMessage': 'Read the selected email message',
  'dashMail.loadingMail': 'Loading mail...',
} satisfies Record<string, string>;
