
import * as React from "react";

import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import { Check, ChevronsUpDown, Download } from "lucide-react-dash";
import type { DateRange } from "react-day-picker";
import { Area, ComposedChart, XAxis, YAxis } from "recharts";

import { DateRangePicker } from "@/dashboard/components/date-range-picker";
import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/dashboard-ui/chart";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/dashboard-ui/command";
import { Label } from "@/components/dashboard-ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard-ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

type RiskView = "risk-view" | "momentum" | "quality";
type FilterToggleKey = "enterpriseOnly" | "stalledOnly" | "overdueOnly" | "includeRenewals";

const FILTER_OPTION_KEYS: FilterToggleKey[] = ["enterpriseOnly", "stalledOnly", "overdueOnly", "includeRenewals"];

const RISK_VIEW_VALUES: Array<{ value: RiskView; key: "riskView" | "momentum" | "quality" }> = [
  { value: "risk-view", key: "riskView" },
  { value: "momentum", key: "momentum" },
  { value: "quality", key: "quality" },
];

const RISK_SUMMARY_METRIC_KEYS = [
  { key: "stalled", labelKey: "stalledDeals", value: "8" },
  { key: "risk", labelKey: "revenueAtRisk", value: "$1,151,000" },
  { key: "win-rate", labelKey: "winRateTrend", value: "+8.3pp" },
  { key: "cycle", labelKey: "salesCycleDrift", value: "+2.3 days" },
] as const;

export function AnalyticsOverview() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>(() => {
    const to = startOfDay(new Date());
    return { from: subDays(to, 29), to };
  });
  const [selectedFilters, setSelectedFilters] = React.useState<FilterToggleKey[]>(["includeRenewals"]);
  const [revenueSeries, setRevenueSeries] = React.useState(() => buildRevenueChartData(dateRange.from, dateRange.to));

  const handleFilterToggle = (key: FilterToggleKey, checked: boolean) => {
    setSelectedFilters((prev) => {
      if (checked) {
        return prev.includes(key) ? prev : [...prev, key];
      }
      return prev.filter((item) => item !== key);
    });
  };

  const handleDateRangeChange = (value: DateRange | undefined) => {
    if (!value?.from || !value?.to) {
      return;
    }
    const nextDateRange = { from: value.from, to: value.to };
    setDateRange(nextDateRange);
    setRevenueSeries(buildRevenueChartData(nextDateRange.from, nextDateRange.to));
  };
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <RiskViewSelect />
          <FiltersPopover selectedFilters={selectedFilters} onToggle={handleFilterToggle} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
          <Button variant="secondary">
            <Download />
            {t('dashAnalyticsV1.export')}
          </Button>
        </div>
      </div>

      <SummaryRow revenueSeries={revenueSeries} />
    </div>
  );
}

function buildRevenueChartData(from: Date, to: Date) {
  const days = eachDayOfInterval({ start: from, end: to });
  const minRevenue = 22_000;
  const maxRevenue = 32_000;
  let currentRevenue = 27_500;

  return days.map((day) => {
    const nextRevenue = currentRevenue + Math.round((Math.random() - 0.45) * 4_000);
    currentRevenue = Math.max(minRevenue, Math.min(maxRevenue, nextRevenue));

    return {
      day: format(day, "MMM d"),
      revenue: currentRevenue,
    };
  });
}

function SummaryRow({ revenueSeries }: { revenueSeries: Array<{ day: string; revenue: number }> }) {
  const { t } = useLanguage();
  const revenueChartConfig = {
    revenue: {
      label: t('dashAnalyticsV1.summary.chart.revenue'),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const revenueValues = revenueSeries.map((point) => point.revenue);
  const minRevenue = Math.min(...revenueValues);
  const maxRevenue = Math.max(...revenueValues);
  const midpoint = (minRevenue + maxRevenue) / 2;
  const halfRange = Math.max((maxRevenue - minRevenue) * 1.6, 4_500);

  return (
    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-3">
      <div className="min-w-0 space-y-2">
        <div>
          <div className="font-medium text-muted-foreground text-sm">{t('dashAnalyticsV1.summary.revenue')}</div>
          <div className="font-semibold text-3xl tabular-nums tracking-tight sm:text-4xl">$1,248,000</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">+9.4%</Badge>
          <Badge variant="secondary">+$107,000</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
          <span>{t('dashAnalyticsV1.summary.previous').replace('{value}', '$1,141,000')}</span>
          <Badge variant="outline" className="font-medium text-xs">
            {t('dashAnalyticsV1.filters.riskLadder30')}
          </Badge>
        </div>
        <div>
          <ChartContainer config={revenueChartConfig} className="h-10 w-full rounded-md border">
            <ComposedChart data={revenueSeries} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={[midpoint - halfRange, midpoint + halfRange]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="revenue"
                type="natural"
                fill="var(--color-revenue)"
                fillOpacity={0.14}
                stroke="var(--color-revenue)"
              />
            </ComposedChart>
          </ChartContainer>
          <span className="text-muted-foreground text-xs">{t('dashAnalyticsV1.summary.selectedRange')}</span>
        </div>
      </div>

      <Card className="min-w-0 py-4 shadow-xs 2xl:col-span-2">
        <CardHeader className="px-4">
          <CardTitle>{t('dashAnalyticsV1.summary.riskSummary.title')}</CardTitle>
          <CardDescription>{t('dashAnalyticsV1.summary.riskSummary.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 2xl:grid-cols-4 2xl:gap-0 2xl:divide-x 2xl:[&>div:first-child]:pl-0 2xl:[&>div:last-child]:pr-0 2xl:[&>div]:px-5">
          {RISK_SUMMARY_METRIC_KEYS.map((item) => (
            <div key={item.key} className="min-w-0 space-y-1">
              <div className="text-muted-foreground text-sm">{t(`dashAnalyticsV1.summary.metric.${item.labelKey}`)}</div>
              <div className="font-semibold text-2xl tabular-nums leading-tight">{item.value}</div>
              <div className="text-muted-foreground text-xs">{t('dashAnalyticsV1.summary.comparatorLabel')}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RiskViewSelect() {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("risk-view");
  const listId = React.useId();

  const riskViews = RISK_VIEW_VALUES.map((view) => ({
    value: view.value,
    label: t(`dashAnalyticsV1.riskView.${view.key}.label`),
    description: t(`dashAnalyticsV1.riskView.${view.key}.description`),
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-controls={listId}
          aria-expanded={open}
          className="w-54 justify-between"
        >
          <div className="flex items-center gap-2">
            <div
              className="size-2 rounded-full bg-primary"
              style={{
                boxShadow: "0 0 8px color-mix(in oklab, var(--primary) 50%, transparent)",
              }}
            />
            {riskViews.find((view) => view.value === value)?.label}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-54 p-0">
        <Command>
          <CommandList id={listId}>
            <CommandGroup>
              {riskViews.map((view) => (
                <CommandItem
                  key={view.value}
                  value={view.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span>{view.label}</span>
                    <span className="text-muted-foreground text-xs">{view.description}</span>
                  </div>
                  <Check className={cn("ml-auto", value === view.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FiltersPopover({
  selectedFilters,
  onToggle,
}: {
  selectedFilters: FilterToggleKey[];
  onToggle: (key: FilterToggleKey, checked: boolean) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const activeCount = selectedFilters.length;

  const filterOptions = FILTER_OPTION_KEYS.map((key) => ({
    key,
    label: t(`dashAnalyticsV1.filters.${key}.label`),
    summaryLabel: t(`dashAnalyticsV1.filters.${key}.summary`),
  }));

  const summarizeFilterState = () => {
    if (selectedFilters.length === 0) {
      return t('dashAnalyticsV1.filters.allDeals');
    }
    return filterOptions
      .filter((item) => selectedFilters.includes(item.key))
      .map((item) => item.summaryLabel)
      .join(" · ");
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" aria-expanded={open}>
            {t('dashAnalyticsV1.filters.button')}
            <Badge className="tabular-nums" variant="secondary">
              {activeCount}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{t('dashAnalyticsV1.filters.title')}</h3>
              <Badge variant="outline" className="font-medium text-xs tabular-nums">
                {t('dashAnalyticsV1.filters.riskLadder30')}
              </Badge>
            </div>
            <div className="space-y-3">
              {filterOptions.map((item) => (
                <FilterToggle
                  key={item.key}
                  id={item.key}
                  label={item.label}
                  checked={selectedFilters.includes(item.key)}
                  onCheckedChange={(checked) => onToggle(item.key, checked)}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground text-sm">
        {t('dashAnalyticsV1.filters.showing')} <span className="font-medium">{summarizeFilterState()}</span>
      </span>
    </div>
  );
}

function FilterToggle({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex cursor-pointer items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(Boolean(value))} />
      <Label htmlFor={id} className="cursor-pointer font-normal text-sm">
        {label}
      </Label>
    </div>
  );
}
