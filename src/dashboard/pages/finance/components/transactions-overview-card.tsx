
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/dashboard-ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
const weekStart = Date.UTC(2026, 0, 5);

const chartData = [
  { date: "2026-01-05T02:24:00Z", cumulativeImpact: 1478, monthlyImpact: 4433 },
  { date: "2026-01-05T08:52:48Z", cumulativeImpact: 2594 },
  { date: "2026-01-05T15:21:36Z", cumulativeImpact: 4754 },
  { date: "2026-01-05T21:50:24Z", cumulativeImpact: 5707 },
  { date: "2026-01-06T04:19:12Z", cumulativeImpact: 7627 },
  { date: "2026-01-06T10:48:00Z", cumulativeImpact: 9192 },
  { date: "2026-01-06T17:16:48Z", cumulativeImpact: 10115 },
  { date: "2026-01-06T23:45:36Z", cumulativeImpact: 11976 },
  { date: "2026-01-07T06:14:24Z", cumulativeImpact: 12856 },
  { date: "2026-01-07T12:43:12Z", cumulativeImpact: 14563, monthlyImpact: 5120 },
  { date: "2026-01-07T19:12:00Z", cumulativeImpact: 15510 },
  { date: "2026-01-08T01:40:48Z", cumulativeImpact: 16502 },
  { date: "2026-01-08T08:09:36Z", cumulativeImpact: 18189 },
  { date: "2026-01-08T14:38:24Z", cumulativeImpact: 20716 },
  { date: "2026-01-08T21:07:12Z", cumulativeImpact: 21776 },
  { date: "2026-01-09T03:36:00Z", cumulativeImpact: 23044 },
  { date: "2026-01-09T10:04:48Z", cumulativeImpact: 25155 },
  { date: "2026-01-09T16:33:36Z", cumulativeImpact: 27933 },
  { date: "2026-01-09T23:02:24Z", cumulativeImpact: 29939 },
  { date: "2026-01-10T05:31:12Z", cumulativeImpact: 31569, monthlyImpact: 4888 },
  { date: "2026-01-10T12:00:00Z", cumulativeImpact: 34407 },
  { date: "2026-01-10T18:28:48Z", cumulativeImpact: 35306 },
  { date: "2026-01-11T00:57:36Z", cumulativeImpact: 37899 },
  { date: "2026-01-11T07:26:24Z", cumulativeImpact: 39305 },
  { date: "2026-01-11T13:55:12Z", cumulativeImpact: 40408 },
  { date: "2026-01-11T20:24:00Z", cumulativeImpact: 41456 },
  { date: "2026-01-12T02:52:48Z", cumulativeImpact: 42901 },
  { date: "2026-01-12T09:21:36Z", cumulativeImpact: 45406 },
  { date: "2026-01-12T15:50:24Z", cumulativeImpact: 46585 },
  { date: "2026-01-12T22:19:12Z", cumulativeImpact: 48600, monthlyImpact: 6045 },
].map((item: { date: string; cumulativeImpact: number; monthlyImpact?: number }) => ({
  date: item.date,
  cumulativeImpact: item.cumulativeImpact,
  monthlyImpact: item.monthlyImpact,
  timestamp: Date.parse(item.date),
}));

const weekdayTicks = Array.from({ length: 7 }, (_, index) => weekStart + (index + 0.5) * DAY_MS);

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "long",
});

const formatWeekday = (value: number) => weekdayFormatter.format(new Date(value));

const chartDomain = [weekStart, weekStart + 7 * DAY_MS];
const formatTooltipCurrency = (value: number | string) => formatCurrency(Number(value), { noDecimals: true });

export function TransactionsOverviewCard() {
  const { t } = useLanguage();

  const chartConfig = {
    cumulativeImpact: {
      color: "var(--chart-4)",
      label: t('dashFinance.transactionsOverview.cumulativeImpact'),
    },
    monthlyImpact: {
      color: "var(--chart-2)",
      label: t('dashFinance.transactionsOverview.newThisMonth'),
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t('dashFinance.transactionsOverview.title')}</CardTitle>
        <CardAction>
          <Select defaultValue="weekly">
            <SelectTrigger className="w-28" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="weekly">{t('dashFinance.transactionsOverview.weekly')}</SelectItem>
                <SelectItem value="monthly">{t('dashFinance.transactionsOverview.monthly')}</SelectItem>
                <SelectItem value="yearly">{t('dashFinance.transactionsOverview.yearly')}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-50 w-full">
          <LineChart accessibilityLayer data={chartData} margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="timestamp"
              domain={chartDomain}
              scale="time"
              tickFormatter={formatWeekday}
              tickLine={false}
              tickMargin={10}
              ticks={weekdayTicks}
              tick={{ fontSize: 12 }}
              type="number"
            />
            <YAxis hide axisLine={false} tickLine={false} tickMargin={10} tick={{ fontSize: 12 }} />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  hideLabel
                  label={label}
                  payload={payload?.map((item) => ({
                    ...item,
                    value: typeof item.value === "number" ? formatTooltipCurrency(item.value) : item.value,
                  }))}
                />
              )}
            />
            <Line
              connectNulls
              dataKey="monthlyImpact"
              dot={false}
              stroke="var(--color-monthlyImpact)"
              strokeDasharray="5 5"
              strokeLinecap="round"
              strokeWidth={1}
              type="linear"
            />
            <Line
              dataKey="cumulativeImpact"
              dot={false}
              stroke="var(--color-cumulativeImpact)"
              strokeLinecap="round"
              strokeWidth={3}
              type="linear"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
