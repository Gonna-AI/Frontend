import { useEffect, useState } from "react";

import { ArrowUpRight, PackageCheck, PackageX, TriangleAlert } from "lucide-react-dash";
import { Label, Pie, PieChart } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { type ChartConfig, ChartContainer } from "@/components/dashboard-ui/chart";
import { Separator } from "@/components/dashboard-ui/separator";
import { fetchProducts, type PipelineProductRow, subscribeToTable } from "@/dashboard/lib/pipelineClient";

const GAUGE_SEGMENT_COUNT = 32;
const DELAYED_LEAD_TIME_WEEKS = 12;

const FALLBACK_COUNTS = { "in-stock": 760, "low-stock": 320, "out-of-stock": 160 };

function buildGaugeSegments(counts: { "in-stock": number; "low-stock": number; "out-of-stock": number }) {
  const totalUnits = counts["in-stock"] + counts["low-stock"] + counts["out-of-stock"];
  const availablePercent = totalUnits > 0 ? Math.round((counts["in-stock"] / totalUnits) * 100) : 0;
  const inStockSegments = totalUnits > 0 ? Math.round((counts["in-stock"] / totalUnits) * GAUGE_SEGMENT_COUNT) : 0;
  const lowStockSegments = totalUnits > 0 ? Math.round((counts["low-stock"] / totalUnits) * GAUGE_SEGMENT_COUNT) : 0;

  function getGaugeSegmentStatus(index: number) {
    if (index < inStockSegments) return "in-stock";
    if (index < inStockSegments + lowStockSegments) return "low-stock";
    return "out-of-stock";
  }

  const gaugeSegments = Array.from({ length: GAUGE_SEGMENT_COUNT }, (_, index) => {
    const status = getGaugeSegmentStatus(index);
    return {
      fill: `var(--color-${status})`,
      id: `segment-${index + 1}`,
      status,
      value: 1,
    };
  });

  return { availablePercent, gaugeSegments };
}

function buildFromProducts(products: PipelineProductRow[]) {
  if (products.length === 0) return null;

  const onTime = products.filter((p) => !p.is_long_lead && p.lead_time_weeks < DELAYED_LEAD_TIME_WEEKS).length;
  const longLead = products.filter((p) => p.is_long_lead).length;
  const delayed = products.filter((p) => !p.is_long_lead && p.lead_time_weeks >= DELAYED_LEAD_TIME_WEEKS).length;

  return { "in-stock": onTime, "low-stock": longLead, "out-of-stock": delayed };
}

const inventorySummaryMeta = [
  { key: "in-stock" as const, icon: PackageCheck, label: "On time" },
  { key: "low-stock" as const, icon: TriangleAlert, label: "Long-lead items" },
  { key: "out-of-stock" as const, icon: PackageX, label: "Delayed" },
];

const chartConfig = {
  "in-stock": {
    label: "In stock",
    color: "var(--chart-2)",
  },
  "low-stock": {
    label: "Low stock",
    color: "var(--chart-1)",
  },
  "out-of-stock": {
    label: "Out of stock",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

export function Inventory() {
  const [counts, setCounts] = useState(FALLBACK_COUNTS);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchProducts()
        .then((rows) => {
          const built = buildFromProducts(rows);
          if (!cancelled && built) setCounts(built);
        })
        .catch(() => {
          // Fall back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribe = subscribeToTable("pipeline_products", load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const { availablePercent, gaugeSegments } = buildGaugeSegments(counts);
  const inventorySummary = inventorySummaryMeta.map((item) => ({ ...item, value: counts[item.key] }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Long-Lead Item Tracking</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {availablePercent}% on time
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChartContainer config={chartConfig} className="mx-auto h-30 w-full">
          <PieChart>
            <Pie
              cx="50%"
              cy="100%"
              cornerRadius={6}
              data={gaugeSegments}
              dataKey="value"
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              startAngle={180}
              stroke="var(--card)"
              strokeWidth={1}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                        <tspan
                          className="fill-foreground font-medium text-2xl tabular-nums"
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                        >
                          {availablePercent}%
                        </tspan>
                        <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy || 0) + 38}>
                          On time
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <Separator />

        <div className="grid grid-cols-3 divide-x">
          {inventorySummary.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-3 text-center">
              <div className="grid size-9 place-items-center rounded-full bg-muted">
                <item.icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-muted-foreground text-xs leading-none">{item.label}</div>
                <div className="font-medium text-sm tabular-nums">{item.value.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
