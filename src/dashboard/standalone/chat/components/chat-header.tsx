import { Bell, MessageSquarePlus, Search, Settings } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/dashboard-ui/input-group";
import { useLanguage } from "@/contexts/LanguageContext";

export function ChatHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) w-full items-center border-b bg-background">
      <div className="flex h-full w-full items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="text-nowrap font-medium text-base">{t('dashChat.header.title')}</h1>
          <InputGroup className="h-7 w-full max-w-sm">
            <InputGroupInput className="h-7" placeholder={t('dashChat.header.searchPlaceholder')} />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={t('dashChat.header.newConversationAria')}>
            <MessageSquarePlus />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={t('dashChat.header.notificationsAria')}>
            <Bell />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={t('dashChat.header.settingsAria')}>
            <Settings />
          </Button>
        </div>
      </div>
    </header>
  );
}
