import { format } from "date-fns";
import { Settings2 } from "lucide-react-dash";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/dashboard-ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { Separator } from "@/components/dashboard-ui/separator";

import { CustomerReviews } from "./components/customer-reviews";
import { Inventory } from "./components/inventory";
import { KpiStrip } from "./components/kpi-strip";
import { RecentOrders } from "./components/recent-orders";
import { StoreTraffic } from "./components/store-traffic";
import { TopProducts } from "./components/top-products";
import { TrafficSources } from "./components/traffic-sources";

export default function Page() {
  const { t } = useLanguage();
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">{t("dashEcommerce.page.title")}</h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-2 lg:w-fit">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-34" id="ecommerce-period" size="sm">
              <SelectValue placeholder={t("dashEcommerce.page.periodPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="this-month">{t("dashEcommerce.page.period.thisMonth")}</SelectItem>
                <SelectItem value="last-month">{t("dashEcommerce.page.period.lastMonth")}</SelectItem>
                <SelectItem value="last-30-days">{t("dashEcommerce.page.period.last30Days")}</SelectItem>
                <SelectItem value="year-to-date">{t("dashEcommerce.page.period.yearToDate")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue="all-channels">
            <SelectTrigger className="w-40" id="ecommerce-channel" size="sm">
              <SelectValue placeholder={t("dashEcommerce.page.channelPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all-channels">{t("dashEcommerce.page.channel.allChannels")}</SelectItem>
                <SelectItem value="online-store">{t("dashEcommerce.page.channel.onlineStore")}</SelectItem>
                <SelectItem value="marketplace">{t("dashEcommerce.page.channel.marketplace")}</SelectItem>
                <SelectItem value="social">{t("dashEcommerce.page.channel.social")}</SelectItem>
                <SelectItem value="retail">{t("dashEcommerce.page.channel.retail")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" />

          <Button size="icon-sm" variant="outline">
            <Settings2 />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <KpiStrip />
        <div className="xl:col-span-5">
          <StoreTraffic />
        </div>
        <div className="xl:col-span-7">
          <TrafficSources />
        </div>
        <div className="xl:col-span-4">
          <TopProducts />
        </div>
        <div className="xl:col-span-4">
          <Inventory />
        </div>
        <div className="xl:col-span-4">
          <CustomerReviews />
        </div>
        <div className="xl:col-span-12">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
