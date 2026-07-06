import { AlertTriangle } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/dashboard-ui/item";
import { useLanguage } from "@/contexts/LanguageContext";

export function FinanceNotification() {
  const { t } = useLanguage();

  return (
    <Item className="rounded-xl" variant="outline">
      <ItemMedia variant="icon">
        <AlertTriangle />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{t('dashFinance.notification.title')}</ItemTitle>
        <ItemDescription>
          {t('dashFinance.notification.description')}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          {t('dashFinance.notification.viewDetails')}
        </Button>
      </ItemActions>
    </Item>
  );
}
