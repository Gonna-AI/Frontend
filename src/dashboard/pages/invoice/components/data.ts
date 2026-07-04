import { addDays, format } from "date-fns";

import type {
  PipelineDeviationRow,
  PipelineDocumentRow,
  PipelineGeneratedDocRow,
  PipelineLineItemRow,
  PipelineProjectRow,
} from "@/dashboard/lib/pipelineClient";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTaxOption {
  id: string;
  name: string;
  rate: number;
}

export type InvoiceDiscountType = "fixed" | "percent";

export const INVOICE_PAPER_WIDTH = 816;
export const INVOICE_PAPER_HEIGHT = 1056;
export const INVOICE_PAPER_SCALE = 0.6;

export interface InvoiceFromDetails {
  name: string;
  email: string;
  phone: string;
  website: string;
  addressLines: string[];
  taxId: string;
  paymentAccountName: string;
  routingNumber: string;
  issuerName: string;
}

export interface InvoiceToDetails {
  id: string;
  name: string;
  email: string;
  addressLines: string[];
  taxId: string;
}

export interface InvoiceFormValues {
  referenceNumber: string;
  issuedDate: string;
  paymentDueDate: string;
  from: InvoiceFromDetails;
  to: InvoiceToDetails;
  taxId: string;
  discountType: InvoiceDiscountType;
  discountValue: number;
  items: InvoiceLineItem[];
  /** AB intro/summary text — seeded from the live pipeline_generated_docs "ab_draft" content when available. */
  introText?: string;
}

const today = new Date();

export const defaultInvoiceValues: InvoiceFormValues = {
  referenceNumber: "AB-88431",
  issuedDate: format(today, "yyyy-MM-dd"),
  paymentDueDate: format(addDays(today, 60), "yyyy-MM-dd"),
  from: {
    name: "THD GmbH",
    email: "auftragswesen@thd-gmbh.de",
    phone: "+49-731-555-0142",
    website: "thd-gmbh.de",
    addressLines: ["Industriestraße 14", "89073 Ulm"],
    taxId: "DE-VAT-142837690",
    paymentAccountName: "THD GmbH Geschäftskonto",
    routingNumber: "DE84 6305 0000 0001 2345 67",
    issuerName: "Auftragsleitung THD",
  },
  to: {
    id: "bergmann-maschinenbau",
    name: "Bergmann Maschinenbau GmbH",
    email: "einkauf@bergmann-maschinenbau.de",
    addressLines: ["Fertigungsweg 7", "86159 Augsburg", "Germany"],
    taxId: "DE-VAT-284917365",
  },
  taxId: "vat",
  discountType: "fixed",
  discountValue: 0,
  items: [
    {
      id: "rt-450",
      description: "RT-450 Rundtisch (gemäß Angebot A-2026-0142)",
      quantity: 1,
      unitPrice: 18400,
    },
    {
      id: "sp-200",
      description: "Spannsystem SP-200 (Menge abweichend: Angebot 4 → Bestellung 5, +1.250 €)",
      quantity: 5,
      unitPrice: 1250,
    },
    {
      id: "rs-90",
      description: "Reitstock RS-90 (Ersatzartikel für RS-100 lt. Angebot, -900 €, techn. Freigabe erforderlich)",
      quantity: 1,
      unitPrice: 3600,
    },
    {
      id: "inbetriebnahme",
      description: "Inbetriebnahme vor Ort",
      quantity: 1,
      unitPrice: 2800,
    },
    {
      id: "tm-75",
      description: "Sondermotor TM-75 (Lieferzeit 14 Wochen)",
      quantity: 1,
      unitPrice: 5200,
    },
  ],
};

export const invoiceTaxOptions: InvoiceTaxOption[] = [
  {
    id: "vat",
    name: "USt.",
    rate: 19,
  },
  {
    id: "reduced-vat",
    name: "Erm. USt.",
    rate: 7,
  },
  {
    id: "reverse-charge",
    name: "Reverse Charge",
    rate: 0,
  },
  {
    id: "none",
    name: "Keine Steuer",
    rate: 0,
  },
];

export const invoiceClients: InvoiceToDetails[] = [
  {
    id: "weber-praezisionstechnik",
    name: "Weber Präzisionstechnik GmbH",
    email: "einkauf@weber-praezisionstechnik.de",
    addressLines: ["Werkstraße 21", "73728 Esslingen am Neckar", "Germany"],
    taxId: "DE-VAT-193857462",
  },
  defaultInvoiceValues.to,
  {
    id: "mk-anlagenbau",
    name: "MK Anlagenbau GmbH",
    email: "ap@mk-anlagenbau.de",
    addressLines: ["Anlagenring 5", "44145 Dortmund", "Germany"],
    taxId: "DE-VAT-357291846",
  },
];

export function getLineAmount(item?: InvoiceLineItem) {
  if (!item) return 0;

  const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
  const unitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;

  return quantity * unitPrice;
}

export function getInvoiceItems(invoice: InvoiceFormValues) {
  return invoice.items;
}

export function getInvoiceSubtotal(invoice: InvoiceFormValues) {
  return getInvoiceItems(invoice).reduce((subtotal, item) => subtotal + getLineAmount(item), 0);
}

export function getInvoiceTaxOption(invoice: InvoiceFormValues) {
  return invoiceTaxOptions.find((taxOption) => taxOption.id === invoice.taxId) ?? invoiceTaxOptions[0];
}

export function getInvoiceTax(invoice: InvoiceFormValues) {
  const taxRate = getInvoiceTaxOption(invoice).rate;

  return Math.max(getInvoiceSubtotal(invoice) - getInvoiceDiscount(invoice), 0) * (taxRate / 100);
}

export function getInvoiceDiscount(invoice: InvoiceFormValues) {
  const subtotal = getInvoiceSubtotal(invoice);
  const discountValue = Number.isFinite(invoice.discountValue) ? invoice.discountValue : 0;
  const discount = invoice.discountType === "percent" ? subtotal * (discountValue / 100) : discountValue;

  return Math.min(Math.max(discount, 0), subtotal);
}

export function getInvoiceTotal(invoice: InvoiceFormValues) {
  return Math.max(getInvoiceSubtotal(invoice) - getInvoiceDiscount(invoice), 0) + getInvoiceTax(invoice);
}

/** Builds the AB's real line items from the order document's AI-extracted rows, annotating
 * each with the matching deviation (if the Kostencheck diff flagged one) so the builder shows
 * exactly what the AI found — not a hand-written description. */
function lineItemsFromLiveData(
  orderLineItems: PipelineLineItemRow[],
  deviations: PipelineDeviationRow[],
): InvoiceLineItem[] {
  const deviationByOrderLineItem = new Map(
    deviations.filter((d) => d.order_line_item_id).map((d) => [d.order_line_item_id, d]),
  );

  return orderLineItems.map((item) => {
    const deviation = item.id ? deviationByOrderLineItem.get(item.id) : undefined;
    const description = deviation ? `${item.description} (${deviation.description})` : item.description ?? "—";

    return {
      id: item.id,
      description,
      quantity: item.qty ?? 0,
      unitPrice: item.unit_price ?? 0,
    };
  });
}

/**
 * Seeds initial AB builder form state from live Supabase data: the latest project, its
 * "ab_draft" generated doc content (intro/summary text), the matching bestellung document's
 * doc_number (reference), and — the actual point of an AI-generated AB — the order's real
 * AI-extracted line items, each annotated with whatever Kostencheck deviation the diff engine
 * found for it. Only the from/tax/discount setup (company letterhead, VAT rate, payment terms)
 * stays the static demo default, since none of that is something the AI derives.
 */
export function buildInvoiceValuesFromLiveData(params: {
  project: PipelineProjectRow | null;
  abDraft: PipelineGeneratedDocRow | null;
  documents: PipelineDocumentRow[];
  orderLineItems: PipelineLineItemRow[];
  deviations: PipelineDeviationRow[];
}): InvoiceFormValues {
  const { project, abDraft, documents, orderLineItems, deviations } = params;

  const bestellung = documents.find((doc) => doc.kind === "bestellung") ?? null;
  const referenceNumber = bestellung?.doc_number ?? defaultInvoiceValues.referenceNumber;

  const matchingClient = project?.customer_name
    ? invoiceClients.find((client) => client.name === project.customer_name)
    : undefined;

  const items = orderLineItems.length > 0 ? lineItemsFromLiveData(orderLineItems, deviations) : defaultInvoiceValues.items;

  return {
    ...defaultInvoiceValues,
    referenceNumber,
    to: matchingClient ?? defaultInvoiceValues.to,
    introText: abDraft?.content ?? undefined,
    items,
  };
}
