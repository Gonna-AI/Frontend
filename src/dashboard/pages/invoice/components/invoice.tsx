
import * as React from "react";

import { FormProvider, useForm, useWatch } from "react-hook-form";

import {
  fetchAllProjects,
  fetchDeviationsForProject,
  fetchDocuments,
  fetchGeneratedDocs,
  fetchLineItemsForDocument,
} from "@/dashboard/lib/pipelineClient";

import { buildInvoiceValuesFromLiveData, defaultInvoiceValues, type InvoiceFormValues } from "./data";
import { InvoiceForm } from "./invoice-form";
import { InvoicePreview } from "./invoice-preview";

export function Invoice() {
  const form = useForm<InvoiceFormValues>({
    defaultValues: defaultInvoiceValues,
  });
  const invoice = useWatch({ control: form.control }) as InvoiceFormValues;

  // Seed the AB builder's initial state from live Supabase data once, on mount. The form keeps
  // using the static defaultInvoiceValues while the fetch is in flight or if it fails — the
  // builder UI/logic itself is unchanged, only its starting values come from live data.
  React.useEffect(() => {
    let cancelled = false;

    Promise.all([fetchAllProjects(), fetchDocuments()])
      .then(async ([projects, documents]) => {
        if (cancelled) return;
        const latestProject = projects[0] ?? null;
        const bestellung = documents.find((doc) => doc.kind === "bestellung") ?? null;

        const [generatedDocs, orderLineItems, deviations] = await Promise.all([
          latestProject ? fetchGeneratedDocs(latestProject.id) : Promise.resolve([]),
          bestellung ? fetchLineItemsForDocument(bestellung.id) : Promise.resolve([]),
          latestProject ? fetchDeviationsForProject(latestProject.id) : Promise.resolve([]),
        ]);
        if (cancelled) return;

        const abDraft = generatedDocs.find((doc) => doc.kind === "ab_draft") ?? null;
        const liveValues = buildInvoiceValuesFromLiveData({
          project: latestProject,
          abDraft,
          documents,
          orderLineItems,
          deviations,
        });

        form.reset(liveValues);
      })
      .catch(() => {
        // AB builder falls back to the static defaultInvoiceValues if Supabase is unreachable.
      });

    return () => {
      cancelled = true;
    };
  }, [form]);

  return (
    <FormProvider {...form}>
      <form
        className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        noValidate
        onSubmit={(event) => event.preventDefault()}
      >
        <InvoiceForm />
        <InvoicePreview invoice={invoice} />
      </form>
    </FormProvider>
  );
}
