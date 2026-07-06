import { Ellipsis, FileDown, FileUp, RefreshCw, Share2 } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export function AnalyticsToolbar() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue="last-4-weeks">
        <SelectTrigger className="w-34">
          <SelectValue placeholder={t('dashAnalytics.toolbar.selectRange')} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="last-7-days">{t('dashAnalytics.toolbar.last7Days')}</SelectItem>
            <SelectItem value="last-4-weeks">{t('dashAnalytics.toolbar.last4Weeks')}</SelectItem>
            <SelectItem value="last-3-months">{t('dashAnalytics.toolbar.last3Months')}</SelectItem>
            <SelectItem value="year-to-date">{t('dashAnalytics.toolbar.yearToDate')}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" aria-label={t('dashAnalytics.toolbar.moreActionsAria')}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t('dashAnalytics.toolbar.actionsLabel')}</DropdownMenuLabel>
            <DropdownMenuItem>
              <FileDown />
              {t('dashAnalytics.toolbar.exportReport')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileUp />
              {t('dashAnalytics.toolbar.importData')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 />
              {t('dashAnalytics.toolbar.shareDashboard')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <RefreshCw />
              {t('dashAnalytics.toolbar.refreshMetrics')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
