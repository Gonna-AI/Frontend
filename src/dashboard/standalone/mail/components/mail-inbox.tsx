
import { Ellipsis, RotateCcw, Search, SlidersHorizontal } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/dashboard-ui/input-group";
import { Separator } from "@/components/dashboard-ui/separator";
import { SidebarTrigger } from "@/components/dashboard-ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

import type { Mail } from "./data";
import { MailList } from "./mail-list";

interface MailInboxProps {
  mails: Mail[];
  onSelectMail?: (mail: Mail) => void;
}

export function MailInbox({ mails, onSelectMail }: MailInboxProps) {
  const pinnedMails = mails.filter((mail) => mail.isPinned);
  const unpinnedMails = mails.filter((mail) => !mail.isPinned);
  const { t } = useLanguage();

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 pt-3">
      <div className="flex min-w-0 items-center justify-between gap-4 px-2">
        <div className="flex min-w-0 items-center">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 ml-1 h-4 data-vertical:self-center" />
          <h1 className="min-w-0 truncate font-medium text-xl leading-none">{t('dashMail.inboxHeading')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm">
            <SlidersHorizontal />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <RotateCcw />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Ellipsis />
          </Button>
        </div>
      </div>

      <div className="px-2">
        <Separator />
      </div>

      <div className="px-2">
        <InputGroup className="h-7 w-full rounded-md">
          <InputGroupInput className="h-7" placeholder={t('dashMail.searchPlaceholder')} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <MailList
          groups={[
            {
              id: "pinned",
              title: t('dashMail.pinned'),
              items: pinnedMails,
            },
            {
              id: "inbox",
              title: t('dashMail.inboxHeading'),
              items: unpinnedMails,
            },
          ]}
          onSelectMail={onSelectMail}
        />
      </div>
    </div>
  );
}
