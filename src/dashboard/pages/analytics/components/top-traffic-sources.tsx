
import { Ellipsis } from "lucide-react-dash";
import { Bar, BarChart, CartesianGrid, LabelList, type LabelProps, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/dashboard-ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

type TrafficSourceDatum = {
  label: string;
  source: string;
  visitors: number;
};

const sourcesDataBase = [
  { key: "organicSearch" as const, label: "89.4k", visitors: 89_400 },
  { key: "direct" as const, label: "55.2k", visitors: 55_200 },
  { key: "social" as const, label: "38.1k", visitors: 38_100 },
  { key: "referral" as const, label: "30.4k", visitors: 30_400 },
  { key: "paid" as const, label: "22.7k", visitors: 22_700 },
];

const campaignsDataBase = [
  { key: "springLaunch" as const, label: "16.8k", visitors: 16_800 },
  { key: "newsletter" as const, label: "12.0k", visitors: 12_000 },
  { key: "retargeting" as const, label: "7.7k", visitors: 7700 },
  { key: "brandSearch" as const, label: "5.9k", visitors: 5900 },
  { key: "partners" as const, label: "4.3k", visitors: 4300 },
];

const referrersDataBase = [
  { key: "google" as const, label: "18.4k", visitors: 18_400 },
  { key: "linkedin" as const, label: "8.9k", visitors: 8900 },
  { key: "productHunt" as const, label: "5.7k", visitors: 5700 },
  { key: "github" as const, label: "4.8k", visitors: 4800 },
  { key: "medium" as const, label: "3.6k", visitors: 3600 },
];

function renderValueLabel(props: LabelProps) {
  const { height, value, y } = props;

  return (
    <text
      className="fill-foreground"
      dominantBaseline="middle"
      dx={-6}
      fontSize={14}
      textAnchor="end"
      x="100%"
      y={Number(y) + Number(height) / 2}
    >
      {value}
    </text>
  );
}

function TrafficSourceBarChart({ chartConfig, data }: { chartConfig: ChartConfig; data: TrafficSourceDatum[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: 0,
          right: 48,
        }}
      >
        <CartesianGrid horizontal={false} vertical={false} />
        <YAxis dataKey="source" hide tickLine={false} tickMargin={10} type="category" />
        <XAxis dataKey="visitors" hide type="number" />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Bar barSize={40} dataKey="visitors" fill="var(--color-visitors)" fillOpacity={0.5} radius={8}>
          <LabelList className="fill-foreground" dataKey="source" fontSize={14} offset={12} position="insideLeft" />
          <LabelList content={renderValueLabel} dataKey="label" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function TopTrafficSources() {
  const { t } = useLanguage();

  const chartConfig: ChartConfig = {
    visitors: {
      color: "var(--chart-1)",
      label: t('dashAnalytics.traffic.chart.visitors'),
    },
  };

  const sourcesData: TrafficSourceDatum[] = sourcesDataBase.map((d) => ({
    label: d.label,
    source: t(`dashAnalytics.traffic.source.${d.key}`),
    visitors: d.visitors,
  }));

  const campaignsData: TrafficSourceDatum[] = campaignsDataBase.map((d) => ({
    label: d.label,
    source: t(`dashAnalytics.traffic.campaign.${d.key}`),
    visitors: d.visitors,
  }));

  const referrersData: TrafficSourceDatum[] = referrersDataBase.map((d) => ({
    label: d.label,
    source: t(`dashAnalytics.traffic.referrer.${d.key}`),
    visitors: d.visitors,
  }));

  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal">{t('dashAnalytics.traffic.title')}</CardTitle>
        <CardAction>
          <Ellipsis className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        <Tabs defaultValue="sources" className="flex flex-col gap-3">
          <TabsList className="w-full justify-start border-b px-2.5" variant="line">
            <TabsTrigger className="flex-none font-normal" value="sources">
              {t('dashAnalytics.traffic.tabs.sources')}
            </TabsTrigger>
            <TabsTrigger className="flex-none font-normal" value="campaigns">
              {t('dashAnalytics.traffic.tabs.campaigns')}
            </TabsTrigger>
            <TabsTrigger className="flex-none font-normal" value="referrers">
              {t('dashAnalytics.traffic.tabs.referrers')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="px-4">
            <TrafficSourceBarChart chartConfig={chartConfig} data={sourcesData} />
          </TabsContent>

          <TabsContent value="campaigns" className="px-4">
            <TrafficSourceBarChart chartConfig={chartConfig} data={campaignsData} />
          </TabsContent>
          <TabsContent value="referrers" className="px-4">
            <TrafficSourceBarChart chartConfig={chartConfig} data={referrersData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
