import {
  ChevronRight,
  ClipboardList,
  FileCheck2,
  FileClock,
  FileSearch,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Send,
} from "lucide-react-dash";

import { Avatar, AvatarFallback } from "@/components/dashboard-ui/avatar";
import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Field } from "@/components/dashboard-ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/dashboard-ui/input-group";
import { useLanguage } from "@/contexts/LanguageContext";

const contacts = [
  { id: 1, initials: "AL" },
  { id: 2, initials: "PTL" },
  { id: 3, initials: "MJ" },
  { id: 4, initials: "ED" },
];

export function QuickActions() {
  const { t } = useLanguage();

  const shortcuts = [
    { id: 1, label: t('dashFinance.quickActions.summary'), icon: FileText },
    { id: 2, label: t('dashFinance.quickActions.kickoffBrief'), icon: Send },
    { id: 3, label: t('dashFinance.quickActions.deviationReport'), icon: FileSearch },
    { id: 4, label: t('dashFinance.quickActions.orderConfirmationDraft'), icon: FileCheck2 },
    { id: 5, label: t('dashFinance.quickActions.rerunDiff'), icon: RefreshCw },
    { id: 6, label: t('dashFinance.quickActions.reviewQueue'), icon: ClipboardList },
    { id: 7, label: t('dashFinance.quickActions.pending'), icon: FileClock },
    { id: 8, label: t('dashFinance.quickActions.more'), icon: MoreHorizontal },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">{t('dashFinance.quickActions.sendToAlPtl')}</CardTitle>
          <CardAction>
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {contacts.map((contact) => (
                  <Avatar key={contact.id} className="size-7 border-2 border-background">
                    <AvatarFallback className="text-[10px]">{contact.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <ChevronRight className="size-4" />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal">
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>#</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="B-88431" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{t('dashFinance.quickActions.order')}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <Button>{t('dashFinance.quickActions.send')}</Button>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-normal">{t('dashFinance.quickActions.generatedDocuments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <div key={shortcut.id} className="flex flex-col items-center gap-2.5">
                  <Button variant="outline" className="size-12 rounded-full">
                    <Icon className="size-5" />
                  </Button>
                  <span className="text-center text-muted-foreground text-xs">{shortcut.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
