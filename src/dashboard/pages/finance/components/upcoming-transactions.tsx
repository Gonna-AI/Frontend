
import { addDays, format, set } from "date-fns";
import { ChevronRight, FileSearch, FileText, Send, Zap } from "lucide-react-dash";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/dashboard-ui/item";
import { useLanguage } from "@/contexts/LanguageContext";

export function UpcomingTransactions() {
  const { t } = useLanguage();

  const transactions = [
    {
      id: 1,
      title: t('dashFinance.documents.summary'),
      date: format(set(addDays(new Date(), -2), { hours: 14, minutes: 45 }), "hh.mm a '•' MMMM dd, yyyy"),
      icon: FileText,
    },
    {
      id: 2,
      title: t('dashFinance.documents.deviationReport'),
      date: format(set(addDays(new Date(), -2), { hours: 15, minutes: 10 }), "hh.mm a '•' MMMM dd, yyyy"),
      icon: FileSearch,
    },
    {
      id: 3,
      title: t('dashFinance.documents.kickoffBrief'),
      date: format(set(addDays(new Date(), -1), { hours: 9, minutes: 0 }), "hh.mm a '•' MMMM dd, yyyy"),
      icon: Send,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t('dashFinance.documents.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="flex items-baseline text-3xl leading-none tracking-tight">
              <span className="font-normal">4</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-none">
              {t('dashFinance.documents.generatedFor').split('{company}')[0]}
              <span className="font-medium text-foreground">Bergmann Maschinenbau</span>
              {t('dashFinance.documents.generatedFor').split('{company}')[1]}
            </p>
          </div>
          <div className="flex w-max items-center gap-2 rounded-md border border-border bg-muted/70 px-2 py-1.5 text-sm">
            <Zap className="size-4 fill-primary text-primary" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{t('dashFinance.documents.orderConfirmationDraft')}</span> {t('dashFinance.documents.stillPending')}
            </span>
          </div>
        </div>

        <ItemGroup>
          {transactions.map((transaction) => (
            <Item key={transaction.id} variant="outline" size="xs">
              <ItemMedia>
                <div className="grid size-9 place-items-center rounded-md border bg-background">
                  <transaction.icon className="size-4 text-muted-foreground" />
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{transaction.title}</ItemTitle>
                <ItemDescription>{transaction.date}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-5 text-muted-foreground" />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
