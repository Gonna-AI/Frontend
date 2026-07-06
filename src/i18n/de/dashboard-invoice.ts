export const deDashboardInvoice = {
  // page.tsx
  'dashInvoice.page.title': 'Auftragsbestätigung AB-88431 (Entwurf)',
  'dashInvoice.page.subtitle': 'Prüfen, bearbeiten und geben Sie die generierte Auftragsbestätigung frei.',
  'dashInvoice.page.description': 'Prüfen Sie den Entwurf der Auftragsbestätigung, kontrollieren Sie die Vorschau und geben Sie sie frei.',
  'dashInvoice.page.saveDraft': 'Als Entwurf speichern',
  'dashInvoice.page.send': 'AB versenden',

  // client-selector.tsx
  'dashInvoice.client.heading': 'Kunde',
  'dashInvoice.client.addNew': 'Neuen Kunden hinzufügen',
  'dashInvoice.client.selectLabel': 'Kunde',
  'dashInvoice.client.label': 'Kunde',
  'dashInvoice.client.selectPlaceholder': 'Kunde auswählen',

  // invoice-adjustments.tsx
  'dashInvoice.adjustments.heading': 'Anpassungen',
  'dashInvoice.adjustments.tax': 'Steuer',
  'dashInvoice.adjustments.selectTax': 'Steuer auswählen',
  'dashInvoice.adjustments.discount': 'Rabatt',
  'dashInvoice.adjustments.discountType': 'Rabattart',
  'dashInvoice.adjustments.discountTypePlaceholder': 'Rabattart',
  'dashInvoice.adjustments.fixedAmount': 'Festbetrag',
  'dashInvoice.adjustments.percent': 'Prozent',
  'dashInvoice.adjustments.value': 'Wert',
  'dashInvoice.adjustments.discountValueAria': 'Rabattwert',

  // invoice-details.tsx
  'dashInvoice.details.referenceNumber': 'Referenznummer',
  'dashInvoice.details.issuedDate': 'Ausstellungsdatum',
  'dashInvoice.details.dueDate': 'Fälligkeitsdatum',
  'dashInvoice.details.pickDate': 'Datum auswählen',

  // invoice-form.tsx
  'dashInvoice.form.tabInvoice': 'Auftragsbestätigung',
  'dashInvoice.form.tabPayment': 'Zahlung',
  'dashInvoice.form.tabBusiness': 'Unternehmen',

  // invoice-items.tsx
  'dashInvoice.items.heading': 'Auftragspositionen',
  'dashInvoice.items.addItem': 'Position hinzufügen',
  'dashInvoice.items.description': 'Beschreibung',
  'dashInvoice.items.units': 'Menge',
  'dashInvoice.items.unitCost': 'Einzelpreis',
  'dashInvoice.items.lineTotal': 'Gesamtbetrag',
  'dashInvoice.items.lineTotalMobile': 'Gesamtbetrag',
  'dashInvoice.items.reorderAria': '{id} neu anordnen',
  'dashInvoice.items.descriptionAria': 'Beschreibung für Position {index}',
  'dashInvoice.items.quantityAria': 'Menge für Position {index}',
  'dashInvoice.items.unitPriceAria': 'Einzelpreis für Position {index}',
  'dashInvoice.items.removeAria': 'Position {index} entfernen',

  // invoice-paper.tsx
  'dashInvoice.paper.title': 'Auftragsbestätigung',
  'dashInvoice.paper.reference': 'Referenz',
  'dashInvoice.paper.issued': 'Ausgestellt',
  'dashInvoice.paper.paymentDue': 'Zahlungsziel',
  'dashInvoice.paper.paymentAccount': 'Zahlungskonto',
  'dashInvoice.paper.iban': 'IBAN',
  'dashInvoice.paper.from': 'Von',
  'dashInvoice.paper.billTo': 'Auftraggeber',
  'dashInvoice.paper.vatId': 'USt-IdNr.',
  'dashInvoice.paper.summary': 'Zusammenfassung',
  'dashInvoice.paper.discount': 'Rabatt',
  'dashInvoice.paper.discountWithPercent': 'Rabatt {percent}%',
  'dashInvoice.paper.description': 'Beschreibung',
  'dashInvoice.paper.quantity': 'Menge',
  'dashInvoice.paper.unitPrice': 'Einzelpreis',
  'dashInvoice.paper.total': 'Gesamt',
  'dashInvoice.paper.netAmount': 'Nettobetrag',
  'dashInvoice.paper.grandTotal': 'Gesamtbetrag',
  'dashInvoice.paper.footerNote': 'Vorbehaltlich Klärung der markierten Abweichungen.',
  'dashInvoice.paper.issuedBy': 'Ausgestellt von {name}',

  // invoice-preview.tsx
  'dashInvoice.preview.heading': 'Vorschau',
  'dashInvoice.preview.print': 'Drucken',
  'dashInvoice.preview.downloadPdf': 'PDF herunterladen',
  'dashInvoice.preview.loading': 'Vorschau wird geladen',
} satisfies Record<string, string>;
