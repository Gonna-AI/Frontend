export const enDashboardKanban = {
  // Columns
  'dashKanban.column.ideas': 'Detected',
  'dashKanban.column.planned': 'Reviewed',
  'dashKanban.column.building': 'In Procurement',
  'dashKanban.column.qa': 'In Procurement (Review)',
  'dashKanban.column.shipped': 'Done',

  // Column footer task count
  'dashKanban.taskCount.singular': 'task',
  'dashKanban.taskCount.plural': 'tasks',

  // Column header actions (aria labels)
  'dashKanban.column.dragAria': 'Drag {column} column',
  'dashKanban.column.addTaskAria': 'Add task to {column}',
  'dashKanban.column.actionsAria': '{column} column actions',

  // Toolbar
  'dashKanban.toolbar.board': 'Board',
  'dashKanban.toolbar.list': 'List',
  'dashKanban.toolbar.table': 'Table',
  'dashKanban.toolbar.searchPlaceholder': 'Search tasks',
  'dashKanban.toolbar.filter': 'Filter',
  'dashKanban.toolbar.sort': 'Sort',
  'dashKanban.toolbar.addTask': 'Add task',
  'dashKanban.toolbar.addTaskMenuAria': 'Open add task menu',
  'dashKanban.toolbar.importCsv': 'Import CSV',
  'dashKanban.toolbar.addFromTemplate': 'Add from template',
  'dashKanban.toolbar.createAutomation': 'Create automation',

  // Task card
  'dashKanban.card.progress': 'Progress',
  'dashKanban.card.owner': 'Owner',
  'dashKanban.card.due': 'Due',
  'dashKanban.card.team': 'Team',
  'dashKanban.card.done': 'Done',

  // Priority labels
  'dashKanban.priority.high': 'High',
  'dashKanban.priority.medium': 'Medium',
  'dashKanban.priority.low': 'Low',

  // Team labels
  'dashKanban.team.backend': 'Backend',
  'dashKanban.team.data': 'Data',
  'dashKanban.team.design': 'Design',
  'dashKanban.team.docs': 'Docs',
  'dashKanban.team.financeOps': 'Finance Ops',
  'dashKanban.team.platform': 'Platform',
  'dashKanban.team.product': 'Product',
  'dashKanban.team.qa': 'QA',
  'dashKanban.team.security': 'Security',

  // Insight labels
  'dashKanban.insight.attachments': 'Attachments',
  'dashKanban.insight.comments': 'Comments',
  'dashKanban.insight.documents': 'Documents',

  // Task owners (role suffixes only; personal names stay as-is)
  'dashKanban.owner.al': 'Order Manager',
  'dashKanban.owner.ptl': 'Technical Lead',
  'dashKanban.owner.procurement': 'Procurement',

  // Due dates
  'dashKanban.due.kw28': 'Wk 28',
  'dashKanban.due.kw29': 'Wk 29',
  'dashKanban.due.kw30': 'Wk 30',
  'dashKanban.due.kw31': 'Wk 31',

  // Task content — ideas column
  'dashKanban.task.sondermotorTm75Bestellen.title': 'Order special motor TM-75',
  'dashKanban.task.sondermotorTm75Bestellen.description': 'Lead time 14 weeks — trigger order for Bergmann Maschinenbau (CNC package 2026).',
  'dashKanban.task.spannsystemMengeBestaetigen.title': 'Confirm clamping system quantity discrepancy (4→5) with customer',
  'dashKanban.task.spannsystemMengeBestaetigen.description': 'AI comparison A-2026-0142 vs. B-88431 shows a quantity discrepancy for SP-200, +€1,250.',
  'dashKanban.task.weberAngebotPruefen.title': 'Cross-check quote A-2026-0198 for Weber Präzisionstechnik',
  'dashKanban.task.weberAngebotPruefen.description': 'Trigger first automatic discrepancy check after order receipt.',
  'dashKanban.task.mkAnlagenbauLiefertermin.title': 'MK Anlagenbau: review delivery date shift',
  'dashKanban.task.mkAnlagenbauLiefertermin.description': 'Reconcile automatically detected date change in the order text against the quote.',

  // Task content — planned column
  'dashKanban.task.reitstockRs90Freigeben.title': 'Technically approve replacement part tailstock RS-90',
  'dashKanban.task.reitstockRs90Freigeben.description': 'RS-90 replaces RS-100 from the quote (-€900). Technical approval by the technical lead required.',
  'dashKanban.task.steuerungsverkabelungKlaeren.title': 'Clarify missing control wiring line item',
  'dashKanban.task.steuerungsverkabelungKlaeren.description': 'Control wiring is completely missing from the order (-€2,100). Follow-up with the customer required.',
  'dashKanban.task.weberKickoffVorbereiten.title': 'Prepare kickoff meeting for Weber Präzisionstechnik',
  'dashKanban.task.weberKickoffVorbereiten.description': 'Put together date proposals and agenda for Kickoff 1 (Order Manager).',

  // Task content — building column
  'dashKanban.task.zahlungskonditionenFreigeben.title': 'Internally approve payment terms change (60 days)',
  'dashKanban.task.zahlungskonditionenFreigeben.description': 'Payment term in the order text silently changed to net 60 days (original: 30 days). High relevance, low confidence.',
  'dashKanban.task.abEntwurfErstellen.title': 'Create order confirmation draft for B-88431',
  'dashKanban.task.abEntwurfErstellen.description': 'Prepare order confirmation with flagged discrepancies (RS-90, missing wiring, payment term).',
  'dashKanban.task.mkAnlagenbauEinkauf.title': 'MK Anlagenbau: request replacement parts from supplier',
  'dashKanban.task.mkAnlagenbauEinkauf.description': 'Forward the requested quantity change to the supplier and obtain confirmation.',

  // Task content — qa column
  'dashKanban.task.abweichungsberichtReview.title': 'Final review of discrepancy report for Bergmann Maschinenbau',
  'dashKanban.task.abweichungsberichtReview.description': 'Proofread all 5 discrepancies (quantity, replacement part, missing line item, date, payment term).',
  'dashKanban.task.weberKickoffBriefReview.title': 'Proofread kickoff brief for Weber Präzisionstechnik',
  'dashKanban.task.weberKickoffBriefReview.description': 'Technical sign-off on the Order Manager/Technical Lead brief before it is sent.',

  // Task content — shipped column
  'dashKanban.task.angebotBestellungAbgleich.title': 'Quote vs. order automatically reconciled',
  'dashKanban.task.angebotBestellungAbgleich.description': 'AI comparison A-2026-0142 vs. B-88431 complete: 5 discrepancies detected.',
  'dashKanban.task.zusammenfassungGeneriert.title': 'AI summary generated for Bergmann Maschinenbau',
  'dashKanban.task.zusammenfassungGeneriert.description': 'Short summary of the order status incl. discrepancies provided to Order Manager/Technical Lead.',
  'dashKanban.task.mkAnlagenbauCheckliste.title': 'MK Anlagenbau: checklist auto-generated',
  'dashKanban.task.mkAnlagenbauCheckliste.description': 'Auto-generated to-do list from the order comparison handed off to the project team.',
};
