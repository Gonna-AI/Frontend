import { format } from "date-fns";
import { Download, RotateCw, Settings2 } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

import { BalanceDistributionCard } from "./components/balance-distribution-card";
import { FinanceNotification } from "./components/finance-notification";
import { IncomeBreakdown } from "./components/income-breakdown";
import { OverviewKpis } from "./components/overview-kpis";
import { QuickActions } from "./components/quick-actions";
import { TransactionsOverviewCard } from "./components/transactions-overview-card";
import { UpcomingTransactions } from "./components/upcoming-transactions";
import { Wallet } from "./components/wallet";

export default function Page() {
  const { t } = useLanguage();
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">Kostencheck</h1>
        <p className="text-muted-foreground text-sm">{formattedDate}</p>
      </div>

      <Tabs defaultValue="30-days" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList variant="line">
            <TabsTrigger value="30-days">{t('dashFinance.tab.dashboard')}</TabsTrigger>
            <TabsTrigger value="12-months">{t('dashFinance.tab.companies')}</TabsTrigger>
            <TabsTrigger value="custom">{t('dashFinance.tab.deviations')}</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <RotateCw className="size-4" />
              <span>{t('dashFinance.updatedMinAgo')}</span>
            </div>
            <Button size="sm" variant="outline">
              <Settings2 />
              {t('dashFinance.settings')}
            </Button>
            <Button size="sm" variant="outline">
              <Download data-icon="inline-start" />
              {t('dashFinance.export')}
            </Button>
          </div>
        </div>

        <TabsContent value="30-days" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-6">
              <OverviewKpis />
            </div>

            <div className="flex flex-col gap-4 xl:col-span-6">
              <IncomeBreakdown />
              <FinanceNotification />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TransactionsOverviewCard />
            </div>
            <div className="xl:col-span-5">
              <BalanceDistributionCard />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <Wallet />
            </div>
            <div className="xl:col-span-4">
              <UpcomingTransactions />
            </div>
            <div className="xl:col-span-4">
              <QuickActions />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="12-months">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            {t('dashFinance.companiesComingSoon')}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            {t('dashFinance.deviationsComingSoon')}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
