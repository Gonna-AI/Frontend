
import * as React from "react";

import { Download, Printer } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { ButtonGroup } from "@/components/dashboard-ui/button-group";
import { useLanguage } from "@/contexts/LanguageContext";

import { INVOICE_PAPER_HEIGHT, INVOICE_PAPER_SCALE, INVOICE_PAPER_WIDTH, type InvoiceFormValues } from "./data";
import { InvoicePaper } from "./invoice-paper";
import { PrintInvoice } from "./print-invoice";
import { useVisibleCenterPosition } from "./use-visible-center-position";

function handlePrint() {
  window.print();
}

export function InvoicePreview({ invoice }: { invoice: InvoiceFormValues }) {
  const previewBodyRef = React.useRef<HTMLDivElement>(null);
  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  });
  const { t } = useLanguage();

  return (
    <>
      <PrintInvoice invoice={invoice} />
      <div className="flex flex-col rounded-xl border bg-card">
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="font-medium text-lg">{t('dashInvoice.preview.heading')}</h2>
          <ButtonGroup>
            <Button type="button" variant="outline" onClick={handlePrint}>
              <Printer data-icon="inline-start" />
              {t('dashInvoice.preview.print')}
            </Button>
            <Button type="button" variant="outline">
              <Download data-icon="inline-start" />
              {t('dashInvoice.preview.downloadPdf')}
            </Button>
          </ButtonGroup>
        </div>

        <div
          ref={previewBodyRef}
          className="@container/preview relative min-h-[calc(100svh-15rem)] flex-1 rounded-b-xl bg-stone-200 p-4 dark:bg-stone-800"
        >
          {paperLayout === null ? (
            <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
              {t('dashInvoice.preview.loading')}
            </div>
          ) : null}
          <div
            style={{
              height: paperLayout
                ? INVOICE_PAPER_HEIGHT * paperLayout.scale
                : INVOICE_PAPER_HEIGHT * INVOICE_PAPER_SCALE,
              top: paperLayout?.top ?? "50%",
              transform: paperLayout === null ? "translate(-50%, -50%)" : "translateX(-50%)",
              width: paperLayout ? INVOICE_PAPER_WIDTH * paperLayout.scale : INVOICE_PAPER_WIDTH * INVOICE_PAPER_SCALE,
            }}
            className="absolute left-1/2 opacity-0 data-[ready=true]:opacity-100"
            data-ready={paperLayout !== null}
          >
            <div
              style={{ transform: `scale(${paperLayout?.scale ?? INVOICE_PAPER_SCALE})` }}
              className="origin-top-left"
            >
              <InvoicePaper invoice={invoice} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
