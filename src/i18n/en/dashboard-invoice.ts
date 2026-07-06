export const enDashboardInvoice = {
  // page.tsx
  'dashInvoice.page.title': 'Order Confirmation AB-88431 (Draft)',
  'dashInvoice.page.subtitle': 'Review, edit, and release the generated order confirmation.',
  'dashInvoice.page.description': 'Review the order confirmation draft, check the preview, and release it.',
  'dashInvoice.page.saveDraft': 'Save as Draft',
  'dashInvoice.page.send': 'Send AB',

  // client-selector.tsx
  'dashInvoice.client.heading': 'Client',
  'dashInvoice.client.addNew': 'Add New Client',
  'dashInvoice.client.selectLabel': 'Client',
  'dashInvoice.client.label': 'Client',
  'dashInvoice.client.selectPlaceholder': 'Select client',

  // invoice-adjustments.tsx
  'dashInvoice.adjustments.heading': 'Adjustments',
  'dashInvoice.adjustments.tax': 'Tax',
  'dashInvoice.adjustments.selectTax': 'Select tax',
  'dashInvoice.adjustments.discount': 'Discount',
  'dashInvoice.adjustments.discountType': 'Discount type',
  'dashInvoice.adjustments.discountTypePlaceholder': 'Discount type',
  'dashInvoice.adjustments.fixedAmount': 'Fixed amount',
  'dashInvoice.adjustments.percent': 'Percent',
  'dashInvoice.adjustments.value': 'Value',
  'dashInvoice.adjustments.discountValueAria': 'Discount value',

  // invoice-details.tsx
  'dashInvoice.details.referenceNumber': 'Reference Number',
  'dashInvoice.details.issuedDate': 'Issued Date',
  'dashInvoice.details.dueDate': 'Due Date',
  'dashInvoice.details.pickDate': 'Pick a date',

  // invoice-form.tsx
  'dashInvoice.form.tabInvoice': 'Order Confirmation',
  'dashInvoice.form.tabPayment': 'Payment',
  'dashInvoice.form.tabBusiness': 'Company',

  // invoice-items.tsx
  'dashInvoice.items.heading': 'Order Line Items',
  'dashInvoice.items.addItem': 'Add Line Item',
  'dashInvoice.items.description': 'Description',
  'dashInvoice.items.units': 'Units',
  'dashInvoice.items.unitCost': 'Unit cost',
  'dashInvoice.items.lineTotal': 'Line Total',
  'dashInvoice.items.lineTotalMobile': 'Line total',
  'dashInvoice.items.reorderAria': 'Reorder {id}',
  'dashInvoice.items.descriptionAria': 'Item {index} description',
  'dashInvoice.items.quantityAria': 'Item {index} quantity',
  'dashInvoice.items.unitPriceAria': 'Item {index} unit price',
  'dashInvoice.items.removeAria': 'Remove item {index}',

  // invoice-paper.tsx
  'dashInvoice.paper.title': 'Order Confirmation',
  'dashInvoice.paper.reference': 'Reference',
  'dashInvoice.paper.issued': 'Issued',
  'dashInvoice.paper.paymentDue': 'Payment Due',
  'dashInvoice.paper.paymentAccount': 'Payment Account',
  'dashInvoice.paper.iban': 'IBAN',
  'dashInvoice.paper.from': 'From',
  'dashInvoice.paper.billTo': 'Bill To',
  'dashInvoice.paper.vatId': 'VAT ID',
  'dashInvoice.paper.summary': 'Summary',
  'dashInvoice.paper.discount': 'Discount',
  'dashInvoice.paper.discountWithPercent': 'Discount {percent}%',
  'dashInvoice.paper.description': 'Description',
  'dashInvoice.paper.quantity': 'Quantity',
  'dashInvoice.paper.unitPrice': 'Unit Price',
  'dashInvoice.paper.total': 'Total',
  'dashInvoice.paper.netAmount': 'Net Amount',
  'dashInvoice.paper.grandTotal': 'Grand Total',
  'dashInvoice.paper.footerNote': 'Subject to resolution of the flagged deviations.',
  'dashInvoice.paper.issuedBy': 'Issued by {name}',

  // invoice-preview.tsx
  'dashInvoice.preview.heading': 'Preview',
  'dashInvoice.preview.print': 'Print',
  'dashInvoice.preview.downloadPdf': 'Download PDF',
  'dashInvoice.preview.loading': 'Loading Preview',
} satisfies Record<string, string>;
