import { Box, Container, Filter, PlusCircle, RefreshCw, Search, Server, Settings } from "lucide-react-dash";

import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/dashboard-ui/input-group";
import { Kbd } from "@/components/dashboard-ui/kbd";
import { useLanguage } from "@/contexts/LanguageContext";

export function InfrastructureHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
              {t("dashInfra.header.title")}
            </h1>
            <p className="text-muted-foreground text-sm">{t("dashInfra.header.description")}</p>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <span className="whitespace-nowrap text-muted-foreground text-sm">
              {t("dashInfra.header.lastUpdated").replace("{seconds}", "30")}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm">
                <RefreshCw />
              </Button>
              <Button variant="outline" size="icon-sm">
                <Settings data-icon="inline-start" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Container />
            {t("dashInfra.header.badge.services").replace("{count}", "3")}
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Box />
            {t("dashInfra.header.badge.components").replace("{count}", "5")}
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Server />
            {t("dashInfra.header.badge.workerNode").replace("{count}", "1")}
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <span className="size-2 rounded-full bg-green-600 dark:bg-green-500" />
            {t("dashInfra.header.badge.uptime").replace("{percent}", "99.98")}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row">
        <InputGroup className="flex-1">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder={t("dashInfra.header.searchPlaceholder")} />
          <InputGroupAddon align="inline-end">
            <Kbd>⌘ K</Kbd>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("dashInfra.header.addWorker")}
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("dashInfra.header.addInference")}
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("dashInfra.header.addDatabase")}
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("dashInfra.header.addQueueStage")}
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("dashInfra.header.addEnvironment")}
          </Button>
          <Button variant="outline">
            <Filter data-icon="inline-start" />
            {t("dashInfra.header.filters")}
          </Button>
        </div>
      </div>
    </div>
  );
}
