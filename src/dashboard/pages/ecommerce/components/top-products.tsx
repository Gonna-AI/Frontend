import { useEffect, useState } from "react";

import { ArrowUpRight } from "lucide-react-dash";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Separator } from "@/components/dashboard-ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchProducts, type PipelineProductRow, subscribeToTable } from "@/dashboard/lib/pipelineClient";

const CHART_COLORS = ["var(--chart-3)", "var(--chart-2)", "var(--chart-1)", "var(--chart-4)", "var(--chart-5)"];

function formatEur(value: number): string {
  return `€${Math.round(value).toLocaleString("de-DE")}`;
}

function buildFallbackCategories(t: (key: string) => string) {
  return [
    { name: t("dashEcommerce.topProducts.category.rotaryTables"), share: 44, color: "var(--chart-3)" },
    { name: t("dashEcommerce.topProducts.category.clampingSystems"), share: 32, color: "var(--chart-2)" },
    { name: t("dashEcommerce.topProducts.category.customMotors"), share: 24, color: "var(--chart-1)" },
  ];
}

function buildFallbackProducts(t: (key: string) => string) {
  return [
    {
      name: t("dashEcommerce.topProducts.product.rt450"),
      category: t("dashEcommerce.topProducts.category.rotaryTables"),
      share: "31%",
      sales: "€18,500",
    },
    {
      name: t("dashEcommerce.topProducts.product.sp200"),
      category: t("dashEcommerce.topProducts.category.clampingSystems"),
      share: "24%",
      sales: "€1,250",
    },
    {
      name: t("dashEcommerce.topProducts.product.tm75"),
      category: t("dashEcommerce.topProducts.category.customMotors"),
      share: "18%",
      sales: "€6,400",
    },
  ];
}

function buildFromProducts(products: PipelineProductRow[], t: (key: string) => string) {
  if (products.length === 0) return null;

  const otherCategoryLabel = t("dashEcommerce.topProducts.category.other");
  const byCategory = new Map<string, number>();
  for (const product of products) {
    const category = product.category ?? otherCategoryLabel;
    byCategory.set(category, (byCategory.get(category) ?? 0) + product.unit_price);
  }

  const totalValue = products.reduce((sum, p) => sum + p.unit_price, 0);
  if (totalValue <= 0) return null;

  const categories = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      share: Math.round((value / totalValue) * 100),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  const topProducts = [...products]
    .sort((a, b) => b.unit_price - a.unit_price)
    .slice(0, 3)
    .map((product) => ({
      name: `${product.article_no} ${product.name}`,
      category: product.category ?? otherCategoryLabel,
      share: `${Math.round((product.unit_price / totalValue) * 100)}%`,
      sales: formatEur(product.unit_price),
    }));

  const topShare = categories.reduce((sum, c) => sum + c.share, 0);
  const totalLabel = `${Math.min(topShare, 100)}% ${t("dashEcommerce.topProducts.totalLabelSuffix")}`;

  return { categories, products: topProducts, totalLabel };
}

export function TopProducts() {
  const { t } = useLanguage();
  const [live, setLive] = useState<ReturnType<typeof buildFromProducts>>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchProducts()
        .then((rows) => {
          if (!cancelled) setLive(buildFromProducts(rows, t));
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
  }, [t]);

  const categories = live?.categories ?? buildFallbackCategories(t);
  const products = live?.products ?? buildFallbackProducts(t);
  const totalLabel = live?.totalLabel ?? t("dashEcommerce.topProducts.totalLabelFallback");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">
          {t("dashEcommerce.topProducts.title")}
        </CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalLabel}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div
            aria-label={t("dashEcommerce.topProducts.chartAriaLabel")}
            className="flex h-2 gap-1 overflow-hidden bg-muted"
            role="img"
          >
            {categories.map((category) => (
              <div
                aria-hidden="true"
                key={category.name}
                className="rounded-md"
                style={{
                  backgroundColor: category.color,
                  width: `${category.share}%`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <div className="flex items-center gap-1" key={category.name}>
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-muted-foreground text-xs">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3">
          <div className="text-muted-foreground text-xs">{t("dashEcommerce.topProducts.columnProducts")}</div>
          <div className="text-muted-foreground text-xs">{t("dashEcommerce.topProducts.columnShare")}</div>
          <div className="text-muted-foreground text-xs">{t("dashEcommerce.topProducts.columnSales")}</div>

          {products.map((product) => (
            <div className="contents text-sm" key={product.name}>
              <div className="min-w-0">
                <div className="truncate font-medium">{product.name}</div>
                <div className="text-muted-foreground text-xs">{product.category}</div>
              </div>
              <div className="self-center text-muted-foreground tabular-nums">{product.share}</div>
              <div className="self-center font-medium tabular-nums">{product.sales}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
