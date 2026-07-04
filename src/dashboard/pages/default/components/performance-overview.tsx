
import { addHours, endOfToday, format, parseISO, subHours } from "date-fns";
import { Area, CartesianGrid, ComposedChart, Line, XAxis } from "recharts";

import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/dashboard-ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard-ui/select";

const chartValues = [
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 2, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 2, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 2, reviewNeeded: 1 },
  { documentsProcessed: 4, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 4, deviationsCaught: 2, reviewNeeded: 1 },
  { documentsProcessed: 0, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 2, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 4, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 5, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 0, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 4, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 1, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 6, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 5, deviationsCaught: 2, reviewNeeded: 1 },
  { documentsProcessed: 4, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 4, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 4, deviationsCaught: 2, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 0 },
  { documentsProcessed: 2, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 1 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
  { documentsProcessed: 3, deviationsCaught: 0, reviewNeeded: 1 },
  { documentsProcessed: 5, deviationsCaught: 1, reviewNeeded: 0 },
];

const endDate = endOfToday();
const startDate = subHours(endDate, (chartValues.length - 1) * 12);

const chartData = chartValues.map((point, index) => ({
  date: format(addHours(startDate, index * 12), "yyyy-MM-dd"),
  ...point,
}));

const chartConfig = {
  documentsProcessed: {
    label: "Documents Processed",
    color: "var(--chart-1)",
  },
  deviationsCaught: {
    label: "Deviations Caught",
    color: "var(--chart-2)",
  },
  reviewNeeded: {
    label: "Needs Human Review",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function PerformanceOverview() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Documents & Deviations</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Documents processed and deviations caught over the last 3 months</span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Select defaultValue="quarter">
            <SelectTrigger size="sm" className="w-28">
              <SelectValue placeholder="3 months" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Period</SelectLabel>
                <SelectItem value="quarter">3 months</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger size="sm" className="w-32">
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Companies</SelectLabel>
                <SelectItem value="all">All companies</SelectItem>
                <SelectItem value="thd">THD GmbH</SelectItem>
                <SelectItem value="weber">Weber Präzisionstechnik</SelectItem>
                <SelectItem value="mk">MK Anlagenbau</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            View report
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <ComposedChart data={chartData} margin={{ top: 0 }}>
            <defs>
              <linearGradient id="fillDocumentsProcessed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-documentsProcessed)" stopOpacity={0.36} />
                <stop offset="95%" stopColor="var(--color-documentsProcessed)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.5} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={48}
              tickFormatter={(value) =>
                parseISO(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-50"
                  indicator="line"
                  labelFormatter={(value) => format(parseISO(value), "d MMMM yyyy")}
                />
              }
            />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent className="mb-5 justify-end" />} />

            <Area
              dataKey="documentsProcessed"
              type="natural"
              fill="url(#fillDocumentsProcessed)"
              stroke="var(--color-documentsProcessed)"
              strokeWidth={1.25}
              dot={false}
              fillOpacity={1}
            />
            <Line
              dataKey="deviationsCaught"
              type="natural"
              stroke="var(--color-deviationsCaught)"
              strokeWidth={1.4}
              dot={false}
            />
            <Line
              dataKey="reviewNeeded"
              type="natural"
              stroke="var(--color-reviewNeeded)"
              strokeWidth={1.2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
