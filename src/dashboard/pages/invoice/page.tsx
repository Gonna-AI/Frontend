import { Save, Send } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

import { Invoice } from "./components/invoice";

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-3xl leading-none tracking-tight">
            {t('dashInvoice.page.title').replace('{ref}', 'AB-88431')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('dashInvoice.page.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline">
            <Save data-icon="inline-start" />
            {t('dashInvoice.page.saveDraft')}
          </Button>
          <Button type="button">
            <Send data-icon="inline-start" />
            {t('dashInvoice.page.send')}
          </Button>
        </div>
      </div>

      <Invoice />
    </div>
  );
}
