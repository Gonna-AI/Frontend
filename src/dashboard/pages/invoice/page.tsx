import { Save, Send } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";

import { Invoice } from "./components/invoice";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-3xl leading-none tracking-tight">
            Auftragsbestätigung AB-88431 (Entwurf)
          </h1>
          <p className="text-muted-foreground text-sm">
            Prüfen Sie den Entwurf der Auftragsbestätigung, kontrollieren Sie die Vorschau und geben Sie sie frei.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline">
            <Save data-icon="inline-start" />
            Als Entwurf speichern
          </Button>
          <Button type="button">
            <Send data-icon="inline-start" />
            AB versenden
          </Button>
        </div>
      </div>

      <Invoice />
    </div>
  );
}
