
import * as React from "react";

import { Label, Pie, PieChart } from "recharts";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/dashboard-ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";

type BalanceKey = "investment" | "main" | "reserve" | "savings";

// Field names kept from the original account-allocation shape; each "account" now
// represents one of the 5 planted deviations on the Bergmann Maschinenbau project,
// sized by absolute € impact (or a nominal weight for the two €0-line-impact clause changes).
const balanceData: {
  accountKey: "controlWiringRemoved" | "spQtyChange" | "rsSwap" | "deliveryDateChange";
  amount: number;
  key: BalanceKey;
  percentage: number;
}[] = [
  {
    accountKey: "controlWiringRemoved",
    amount: 2_100,
    key: "main",
    percentage: 44.2,
  },
  {
    accountKey: "spQtyChange",
    amount: 1_250,
    key: "savings",
    percentage: 26.3,
  },
  {
    accountKey: "rsSwap",
    amount: 900,
    key: "investment",
    percentage: 18.9,
  },
  {
    accountKey: "deliveryDateChange",
    amount: 500,
    key: "reserve",
    percentage: 10.5,
  },
];

type Currency = "EUR" | "GBP" | "USD";

const totalBalance = balanceData.reduce((total, item) => total + item.amount, 0);

export function BalanceDistributionCard() {
  const { t } = useLanguage();
  const [currency, setCurrency] = React.useState<Currency>("EUR");

  const chartConfig = {
    amount: {
      label: t('dashFinance.balance.eurImpact'),
    },
    investment: {
      color: "var(--chart-1)",
      label: t('dashFinance.balance.rsSwap'),
    },
    main: {
      color: "var(--chart-2)",
      label: t('dashFinance.balance.controlWiringRemoved'),
    },
    reserve: {
      color: "var(--chart-3)",
      label: t('dashFinance.balance.deliveryDateChange'),
    },
    savings: {
      color: "var(--chart-4)",
      label: t('dashFinance.balance.spQtyChange'),
    },
  } satisfies ChartConfig;

  const currencies: Record<Currency, { label: string }> = {
    EUR: {
      label: t('dashFinance.balance.eurImpact'),
    },
    GBP: {
      label: t('dashFinance.balance.gbpImpact'),
    },
    USD: {
      label: t('dashFinance.balance.usdImpact'),
    },
  };

  const getAccountColor = (key: BalanceKey) => {
    const config = chartConfig[key];

    return "color" in config ? config.color : undefined;
  };

  const chartData = balanceData.map((item) => ({
    ...item,
    account: t(`dashFinance.balance.${item.accountKey}`),
    fill: getAccountColor(item.key),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t('dashFinance.balance.title')}</CardTitle>
        <CardAction>
          <Select onValueChange={(value) => setCurrency(value as Currency)} value={currency}>
            <SelectTrigger className="w-36" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(currencies).map(([value, item]) => (
                  <SelectItem key={value} value={value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="grid items-center gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-50">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="w-52" nameKey="account" />}
            />
            <Pie
              cornerRadius={6}
              data={chartData}
              dataKey="amount"
              innerRadius={65}
              nameKey="account"
              outerRadius={90}
              paddingAngle={2}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (!(viewBox && "cx" in viewBox && "cy" in viewBox)) {
                    return null;
                  }

                  return (
                    <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                      <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy ?? 0) - 8}>
                        {t('dashFinance.balance.total')}
                      </tspan>
                      <tspan
                        className="fill-foreground font-medium text-lg tabular-nums"
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 14}
                      >
                        {formatCurrency(totalBalance, { currency, noDecimals: true })}
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex min-w-0 flex-col gap-3">
          {chartData.map((item) => (
            <div className="grid grid-cols-[1fr_auto] items-end gap-3" key={item.key}>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1">
                  <span aria-hidden="true" className="h-2 w-1 rounded-full" style={{ backgroundColor: item.fill }} />
                  <p className="truncate text-muted-foreground text-xs">{item.account}</p>
                </div>
                <p className="font-medium tabular-nums">
                  {formatCurrency(item.amount, { currency, noDecimals: true })}
                </p>
              </div>
              <div className="font-medium tabular-nums">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
