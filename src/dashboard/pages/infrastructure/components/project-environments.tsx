import {
  ArrowUpDown,
  Bell,
  ChevronDown,
  CircleDashed,
  CircleGauge,
  Clock3,
  Copy,
  EllipsisVertical,
  FileText,
  Plus,
  RefreshCw,
  Settings,
  SquareTerminal,
  Terminal,
} from "lucide-react-dash";

import { SimpleIcon } from "@/dashboard/components/simple-icon";
import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/dashboard-ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/dashboard-ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

import type { InfrastructureEnvironment, InfrastructureGroup } from "./infrastructure-data";

const GROUP_NAME_KEYS: Record<string, string> = {
  "Kostencheck Copilot Worker": "dashInfra.groupName.kostencheckCopilotWorker",
  Inference: "dashInfra.groupName.inference",
  "Database & Realtime": "dashInfra.groupName.databaseRealtime",
  "Job Queue": "dashInfra.groupName.jobQueue",
};

const ENV_VALUE_KEYS: Record<InfrastructureEnvironment["environment"], string> = {
  Expired: "dashInfra.envValue.expired",
  Production: "dashInfra.envValue.production",
  Staging: "dashInfra.envValue.staging",
};

const STATUS_VALUE_KEYS: Record<InfrastructureEnvironment["status"], string> = {
  Online: "dashInfra.statusValue.online",
  Unhealthy: "dashInfra.statusValue.unhealthy",
  Processing: "dashInfra.statusValue.processing",
};

export function ProjectEnvironments({ group }: { group: InfrastructureGroup }) {
  const { t } = useLanguage();
  const groupNameKey = GROUP_NAME_KEYS[group.name];
  const localizedGroupName = groupNameKey ? t(groupNameKey) : group.name;

  return (
    <Collapsible
      defaultOpen
      className="flex flex-col overflow-hidden rounded-xl border bg-card py-3 text-card-foreground data-[state=open]:gap-3 data-[state=open]:pb-0"
    >
      <div className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="group -ml-2 h-auto w-full justify-start gap-2 px-2 py-1 hover:bg-transparent aria-expanded:bg-transparent sm:flex-1"
          >
            <ChevronDown className="group-data-[state=open]:rotate-180" />
            <div className="flex min-w-0 items-baseline gap-1.5 text-left">
              <span className="shrink-0 font-medium leading-none">{group.organization}</span>
              <span className="min-w-0 truncate text-muted-foreground text-sm">({localizedGroupName})</span>
            </div>
          </Button>
        </CollapsibleTrigger>
        <div className="flex w-full items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          <Button variant="ghost" size="sm" className="-ml-1.5 sm:ml-0">
            <Plus data-icon="inline-start" />
            {t("dashInfra.group.addEnvironment")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuGroup>
                {group.rows.length > 0 ? (
                  <DropdownMenuItem>
                    <FileText />
                    {t("dashInfra.group.activityLogs")}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem>
                  <Terminal />
                  {t("dashInfra.group.openConsole")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  {t("dashInfra.group.projectSettings")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCw />
                  {t("dashInfra.group.syncStatus")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  {t("dashInfra.group.manageAlerts")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Copy />
                  {t("dashInfra.group.copyProjectId")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CollapsibleContent>
        {group.rows.length > 0 ? <EnvironmentTable rows={group.rows} /> : <EmptyProjectState />}
      </CollapsibleContent>
    </Collapsible>
  );
}

function EnvironmentTable({ rows }: { rows: InfrastructureEnvironment[] }) {
  const { t } = useLanguage();

  return (
    <div className="scrollbar-thin overflow-x-auto [scrollbar-color:var(--border)_transparent] **:data-[slot=table-container]:overflow-visible [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1">
      <Table className="min-w-[1700px] table-fixed **:data-[slot='table-cell']:px-5 **:data-[slot='table-head']:px-5">
        <colgroup>
          <col className="w-90" />
          <col className="w-40" />
          <col className="w-42" />
          <col className="w-35" />
          <col className="w-35" />
          <col className="w-38" />
          <col className="w-98" />
          <col className="w-55" />
          <col className="w-18" />
        </colgroup>
        <TableHeader className="bg-muted/50 [&_tr]:border-y">
          <TableRow>
            <TableHead className="font-medium">
              <span className="inline-flex items-center gap-1">
                {t("dashInfra.table.domain")} <ArrowUpDown className="size-4" />
              </span>
            </TableHead>
            <TableHead>{t("dashInfra.table.platform")}</TableHead>
            <TableHead>{t("dashInfra.table.environment")}</TableHead>
            <TableHead>{t("dashInfra.table.health")}</TableHead>
            <TableHead>{t("dashInfra.table.latency")}</TableHead>
            <TableHead>{t("dashInfra.table.uptime")}</TableHead>
            <TableHead>{t("dashInfra.table.resources")}</TableHead>
            <TableHead>{t("dashInfra.table.server")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className="**:data-[slot='table-row']:hover:bg-transparent">
          {rows.map((row) => (
            <TableRow key={row.domain}>
              <TableCell>
                <span className="block truncate font-medium" title={t(row.domainKey)}>
                  {t(row.domainKey)}
                </span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2 font-medium text-muted-foreground">
                  <SimpleIcon icon={row.platform.icon} className="size-4 fill-current" />
                  {row.platform.name}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={row.environment === "Expired" ? "destructive" : "secondary"}
                  className={cn(
                    "rounded-sm px-1.5 py-0.5",
                    row.environment === "Production" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    row.environment === "Staging" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                  )}
                >
                  {t(ENV_VALUE_KEYS[row.environment])}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={row.status === "Unhealthy" ? "destructive" : "secondary"}
                  className={cn(
                    "rounded-sm px-1.5 py-0.5",
                    row.status === "Online" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    row.status === "Processing" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      row.status === "Online" && "bg-emerald-500",
                      row.status === "Processing" && "bg-amber-500",
                      row.status === "Unhealthy" && "bg-destructive",
                    )}
                  />
                  {t(STATUS_VALUE_KEYS[row.status])}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground tabular-nums">
                  <CircleGauge className="size-4" />
                  {row.latency}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground tabular-nums">
                  <Clock3 className="size-4" />
                  {row.uptime}
                </span>
              </TableCell>
              <TableCell>
                <div className="grid grid-cols-3 gap-4">
                  <ResourceMeter label={t("dashInfra.resource.cpu")} value={row.resources.cpu} />
                  <ResourceMeter label={t("dashInfra.resource.ram")} value={row.resources.ram} />
                  <ResourceMeter label={t("dashInfra.resource.disk")} value={row.resources.disk} />
                </div>
              </TableCell>
              <TableCell>
                <span className="flex flex-col font-medium">
                  {t(row.serverKey)}
                  <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <span
                      aria-hidden="true"
                      className={cn("shrink-0 rounded-xs text-sm ring-1 ring-foreground/10", `flag:${row.countryCode}`)}
                    />
                    {row.countryCode} · {t(row.planKey)}
                  </span>
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="-mr-2">
                      <SquareTerminal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <FileText />
                        {t("dashInfra.row.viewLogs")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Terminal />
                        {t("dashInfra.row.openConsole")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw />
                        {t("dashInfra.row.restart")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Copy />
                        {t("dashInfra.row.copyUrl")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ResourceMeter({ label, value }: { label: string; value: number }) {
  const isCritical = value >= 70;
  const isWarning = value >= 55;

  return (
    <span className="min-w-0 space-y-1">
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-medium text-emerald-600 tabular-nums dark:text-emerald-400",
            isWarning && "text-amber-600 dark:text-amber-400",
            isCritical && "text-destructive",
          )}
        >
          {value}%
        </span>
      </span>
      <span className="block h-1.5 overflow-hidden rounded-full bg-muted-foreground/20">
        <span
          className={cn(
            "block h-full rounded-full bg-emerald-500",
            isWarning && "bg-amber-500",
            isCritical && "bg-destructive",
          )}
          style={{ width: `${value}%` }}
        />
      </span>
    </span>
  );
}

function EmptyProjectState() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-24 items-center justify-center border-t bg-muted/50 p-4">
      <div className="flex items-center gap-2">
        <CircleDashed className="size-4" />
        <p className="font-medium text-sm">{t("dashInfra.empty.noEnvironments")}</p>
      </div>
    </div>
  );
}
