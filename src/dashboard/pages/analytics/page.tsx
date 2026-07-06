import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

import { AnalyticsKpiStrip } from "./components/analytics-kpi-strip";
import { AnalyticsToolbar } from "./components/analytics-toolbar";
import { RealtimeVisitors } from "./components/realtime-visitors";
import { TopPages } from "./components/top-pages";
import { TopTrafficSources } from "./components/top-traffic-sources";
import { TrafficQuality } from "./components/traffic-quality";

// Import this stylesheet in any page or component that renders country flag classes.
import "@/dashboard/styles/flag-icons/flags.css";

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">{t('dashAnalytics.page.title')}</h1>
        <p className="text-muted-foreground text-sm">
          {t('dashAnalytics.page.description')}
        </p>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="gap-1">
            <TabsTrigger value="overview">{t('dashAnalytics.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="audience">{t('dashAnalytics.tabs.audience')}</TabsTrigger>
            <TabsTrigger value="acquisition">{t('dashAnalytics.tabs.acquisition')}</TabsTrigger>
            <TabsTrigger value="engagement">{t('dashAnalytics.tabs.engagement')}</TabsTrigger>
            <TabsTrigger value="conversions">{t('dashAnalytics.tabs.conversions')}</TabsTrigger>
          </TabsList>

          <AnalyticsToolbar />
        </div>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <AnalyticsKpiStrip />

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TrafficQuality />
            </div>
            <div className="xl:col-span-5">
              <RealtimeVisitors />
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TopPages />
            </div>
            <div className="xl:col-span-5 xl:col-start-8">
              <TopTrafficSources />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audience">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            {t('dashAnalytics.tabs.audienceComingSoon')}
          </div>
        </TabsContent>

        <TabsContent value="acquisition">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            {t('dashAnalytics.tabs.acquisitionComingSoon')}
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            {t('dashAnalytics.tabs.engagementComingSoon')}
          </div>
        </TabsContent>

        <TabsContent value="conversions">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            {t('dashAnalytics.tabs.conversionsComingSoon')}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
