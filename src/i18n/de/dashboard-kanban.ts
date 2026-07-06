export const deDashboardKanban = {
  // Columns
  'dashKanban.column.ideas': 'Erkannt',
  'dashKanban.column.planned': 'Geprüft',
  'dashKanban.column.building': 'In Beschaffung',
  'dashKanban.column.qa': 'In Beschaffung (Prüfung)',
  'dashKanban.column.shipped': 'Erledigt',

  // Column footer task count
  'dashKanban.taskCount.singular': 'Aufgabe',
  'dashKanban.taskCount.plural': 'Aufgaben',

  // Column header actions (aria labels)
  'dashKanban.column.dragAria': 'Spalte {column} verschieben',
  'dashKanban.column.addTaskAria': 'Aufgabe zu {column} hinzufügen',
  'dashKanban.column.actionsAria': 'Aktionen für Spalte {column}',

  // Toolbar
  'dashKanban.toolbar.board': 'Board',
  'dashKanban.toolbar.list': 'Liste',
  'dashKanban.toolbar.table': 'Tabelle',
  'dashKanban.toolbar.searchPlaceholder': 'Aufgaben durchsuchen',
  'dashKanban.toolbar.filter': 'Filter',
  'dashKanban.toolbar.sort': 'Sortieren',
  'dashKanban.toolbar.addTask': 'Aufgabe hinzufügen',
  'dashKanban.toolbar.addTaskMenuAria': 'Menü zum Hinzufügen von Aufgaben öffnen',
  'dashKanban.toolbar.importCsv': 'CSV importieren',
  'dashKanban.toolbar.addFromTemplate': 'Aus Vorlage hinzufügen',
  'dashKanban.toolbar.createAutomation': 'Automatisierung erstellen',

  // Task card
  'dashKanban.card.progress': 'Fortschritt',
  'dashKanban.card.owner': 'Verantwortlich',
  'dashKanban.card.due': 'Fällig',
  'dashKanban.card.team': 'Team',
  'dashKanban.card.done': 'Erledigt',

  // Priority labels
  'dashKanban.priority.high': 'Hoch',
  'dashKanban.priority.medium': 'Mittel',
  'dashKanban.priority.low': 'Niedrig',

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
  'dashKanban.insight.attachments': 'Anhänge',
  'dashKanban.insight.comments': 'Kommentare',
  'dashKanban.insight.documents': 'Dokumente',

  // Task owners (role suffixes only; personal names stay as-is)
  'dashKanban.owner.al': 'AL',
  'dashKanban.owner.ptl': 'PTL',
  'dashKanban.owner.procurement': 'Einkauf',

  // Due dates
  'dashKanban.due.kw28': 'KW 28',
  'dashKanban.due.kw29': 'KW 29',
  'dashKanban.due.kw30': 'KW 30',
  'dashKanban.due.kw31': 'KW 31',

  // Task content — ideas column
  'dashKanban.task.sondermotorTm75Bestellen.title': 'Sondermotor TM-75 bestellen',
  'dashKanban.task.sondermotorTm75Bestellen.description': 'Lieferzeit 14 Wochen — Bestellung für Bergmann Maschinenbau (CNC-Paket 2026) auslösen.',
  'dashKanban.task.spannsystemMengeBestaetigen.title': 'Abweichung Spannsystem-Menge (4→5) mit Kunde bestätigen',
  'dashKanban.task.spannsystemMengeBestaetigen.description': 'AI-Vergleich A-2026-0142 vs. B-88431 zeigt Mengenabweichung SP-200, +1.250 €.',
  'dashKanban.task.weberAngebotPruefen.title': 'Angebot A-2026-0198 für Weber Präzisionstechnik gegenprüfen',
  'dashKanban.task.weberAngebotPruefen.description': 'Erste automatische Abweichungsprüfung nach Bestelleingang anstoßen.',
  'dashKanban.task.mkAnlagenbauLiefertermin.title': 'MK Anlagenbau: Liefertermin-Verschiebung sichten',
  'dashKanban.task.mkAnlagenbauLiefertermin.description': 'Automatisch erkannte Terminänderung im Bestelltext gegen Angebot abgleichen.',

  // Task content — planned column
  'dashKanban.task.reitstockRs90Freigeben.title': 'Ersatzartikel Reitstock RS-90 technisch freigeben',
  'dashKanban.task.reitstockRs90Freigeben.description': 'RS-90 ersetzt RS-100 aus dem Angebot (-900 €). Technische Freigabe durch PTL erforderlich.',
  'dashKanban.task.steuerungsverkabelungKlaeren.title': 'Fehlende Position Steuerungsverkabelung klären',
  'dashKanban.task.steuerungsverkabelungKlaeren.description': 'Steuerungsverkabelung fehlt vollständig in der Bestellung (-2.100 €). Rückfrage beim Kunden nötig.',
  'dashKanban.task.weberKickoffVorbereiten.title': 'KickOff-Termin für Weber Präzisionstechnik vorbereiten',
  'dashKanban.task.weberKickoffVorbereiten.description': 'Terminvorschläge und Agenda für KickOff 1 (AL) zusammenstellen.',

  // Task content — building column
  'dashKanban.task.zahlungskonditionenFreigeben.title': 'Zahlungskonditionen-Änderung (60 Tage) intern freigeben',
  'dashKanban.task.zahlungskonditionenFreigeben.description': 'Zahlungsziel im Bestelltext still auf 60 Tage netto geändert (Original: 30 Tage). Hohe Relevanz, niedrige Konfidenz.',
  'dashKanban.task.abEntwurfErstellen.title': 'AB-Entwurf für B-88431 erstellen',
  'dashKanban.task.abEntwurfErstellen.description': 'Auftragsbestätigung mit markierten Abweichungen (RS-90, fehlende Verkabelung, Zahlungsziel) vorbereiten.',
  'dashKanban.task.mkAnlagenbauEinkauf.title': 'MK Anlagenbau: Ersatzteile beim Zulieferer anfragen',
  'dashKanban.task.mkAnlagenbauEinkauf.description': 'Angefragte Mengenänderung an Zulieferer weiterleiten und Bestätigung einholen.',

  // Task content — qa column
  'dashKanban.task.abweichungsberichtReview.title': 'Abweichungsbericht Bergmann Maschinenbau final prüfen',
  'dashKanban.task.abweichungsberichtReview.description': 'Alle 5 Abweichungen (Menge, Ersatzartikel, fehlende Position, Termin, Zahlungsziel) gegenlesen.',
  'dashKanban.task.weberKickoffBriefReview.title': 'KickOff-Brief für Weber Präzisionstechnik gegenlesen',
  'dashKanban.task.weberKickoffBriefReview.description': 'AL/PTL-Brief vor Versand fachlich freigeben.',

  // Task content — shipped column
  'dashKanban.task.angebotBestellungAbgleich.title': 'Angebot vs. Bestellung automatisch abgeglichen',
  'dashKanban.task.angebotBestellungAbgleich.description': 'AI-Vergleich A-2026-0142 vs. B-88431 abgeschlossen: 5 Abweichungen erkannt.',
  'dashKanban.task.zusammenfassungGeneriert.title': 'AI-Zusammenfassung für Bergmann Maschinenbau generiert',
  'dashKanban.task.zusammenfassungGeneriert.description': 'Kurzfassung der Auftragslage inkl. Abweichungen für AL/PTL bereitgestellt.',
  'dashKanban.task.mkAnlagenbauCheckliste.title': 'MK Anlagenbau: Checkliste automatisch erzeugt',
  'dashKanban.task.mkAnlagenbauCheckliste.description': 'Auto-generierte To-do-Liste aus Bestellvergleich an Projektteam übergeben.',
};
