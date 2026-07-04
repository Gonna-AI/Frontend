import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";

import { AnalyticsKpiStrip } from "./components/analytics-kpi-strip";
import { AnalyticsToolbar } from "./components/analytics-toolbar";
import { RealtimeVisitors } from "./components/realtime-visitors";
import { TopPages } from "./components/top-pages";
import { TopTrafficSources } from "./components/top-traffic-sources";
import { TrafficQuality } from "./components/traffic-quality";

// Import this stylesheet in any page or component that renders country flag classes.
import "@/dashboard/styles/flag-icons/flags.css";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">AI Performance</h1>
        <p className="text-muted-foreground text-sm">
          Monitor Kostencheck Copilot's extraction pipeline: throughput, confidence, and deviation quality in one view.
        </p>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audience">Documents</TabsTrigger>
            <TabsTrigger value="acquisition">Deviations</TabsTrigger>
            <TabsTrigger value="engagement">Pipeline</TabsTrigger>
            <TabsTrigger value="conversions">Reviews</TabsTrigger>
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
            Documents view coming soon.
          </div>
        </TabsContent>

        <TabsContent value="acquisition">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            Deviations view coming soon.
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            Pipeline view coming soon.
          </div>
        </TabsContent>

        <TabsContent value="conversions">
          <div className="flex h-64 items-center justify-center rounded-xl border border-border border-dashed text-muted-foreground">
            Reviews view coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
