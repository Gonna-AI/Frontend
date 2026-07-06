
import { format } from "date-fns/format";
import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Forward,
  MailOpen,
  Paperclip,
  Pin,
  Reply,
  ReplyAll,
  Send,
  Smile,
  Tag,
  Trash2,
  X,
} from "lucide-react-dash";

import { SimpleIcon } from "@/dashboard/components/simple-icon";
import { Avatar, AvatarFallback } from "@/components/dashboard-ui/avatar";
import { Button } from "@/components/dashboard-ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/dashboard-ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/dashboard-ui/input-group";
import { Separator } from "@/components/dashboard-ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dashboard-ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

import type { Mail } from "./data";
import { useMail } from "./use-mail";

interface MailDisplayProps {
  mail: Mail | null;
  onClose?: () => void;
}

export function MailView({ mail, onClose }: MailDisplayProps) {
  const [, setMail] = useMail();
  const { t } = useLanguage();

  function handleClose() {
    setMail({ selected: null });
    onClose?.();
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 px-2 py-3">
      <div className="flex min-w-0 items-center">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t('dashMail.closeMessage')} onClick={handleClose}>
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('dashMail.closeMessage')}</TooltipContent>
          </Tooltip>
          <Separator className="h-4 data-vertical:self-center" orientation="vertical" />
          <div className="flex items-center gap-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('dashMail.previousMessage')}>
                  <ChevronLeft />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashMail.previousMessage')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('dashMail.nextMessage')}>
                  <ChevronRight />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashMail.nextMessage')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t('dashMail.pinThread')}>
                <Pin />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('dashMail.pinThread')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t('dashMail.archive')}>
                <Archive />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('dashMail.archive')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t('dashMail.reply')}>
                <Reply />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('dashMail.reply')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={t('dashMail.moreActions')}>
                    <EllipsisVertical />
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <ReplyAll />
                    {t('dashMail.replyAll')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward />
                    {t('dashMail.forward')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <MailOpen />
                    {t('dashMail.markAsUnread')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Tag />
                    {t('dashMail.addLabel')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent>{t('dashMail.moreActions')}</TooltipContent>
          </Tooltip>
          <Separator className="h-4 data-vertical:self-center" orientation="vertical" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t('dashMail.moveToTrash')}>
                <Trash2 className="text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('dashMail.moveToTrash')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {mail ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="min-w-0 truncate font-medium leading-none" title={mail.subject}>
                {mail.subject}
              </div>

              <div className="text-muted-foreground text-xs leading-none">
                {format(new Date(mail.receivedAt), "EEE, d MMM yyyy, h:mm a")}
              </div>
            </div>

            <Separator />

            <div className="flex min-w-0 gap-2">
              <Avatar className="size-9 after:rounded-sm">
                <AvatarFallback className="rounded-sm bg-background">{mail.from.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex h-full min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="min-w-0 truncate text-xs">{mail.from.name}</div>
                  <Separator className="h-3 data-vertical:self-center" orientation="vertical" />
                  <div className="min-w-0 truncate text-muted-foreground text-xs">{mail.from.email}</div>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div className="min-w-0 truncate text-muted-foreground text-xs">
                    {t('dashMail.to')}{" "}
                    <span className="text-foreground">{mail.to.map((recipient) => recipient.name).join(", ")}</span>
                  </div>

                  {mail.cc?.length ? (
                    <div className="min-w-0 truncate text-muted-foreground text-xs">
                      {t('dashMail.cc')}{" "}
                      <span className="text-foreground">{mail.cc.map((recipient) => recipient.name).join(", ")}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator />

            {mail.attachments?.length ? (
              <>
                <Collapsible defaultOpen>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "group p-0 font-normal text-muted-foreground",
                        "hover:bg-transparent hover:text-muted-foreground dark:hover:bg-transparent",
                        "data-[state=open]:bg-transparent data-[state=open]:text-muted-foreground",
                      )}
                    >
                      {t('dashMail.attachments').replace('{count}', String(mail.attachments.length))}
                      <ChevronDown className="group-data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-2">
                      {mail.attachments.map((attachment) => (
                        <Button size="xs" variant="secondary" key={attachment.id}>
                          <SimpleIcon icon={attachment.icon} className="size-3 fill-current" />
                          <span className="font-normal">{attachment.name}</span>
                          <span className="font-normal text-muted-foreground">{attachment.size}</span>
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-2" />
              </>
            ) : null}

            <div className="scrollbar-none min-h-0 min-w-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words text-sm">{mail.body}</div>

            <div className="mt-auto flex flex-col gap-3">
              <Separator />
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Reply />
                </InputGroupAddon>
                <InputGroupInput className="text-xs" placeholder={t('dashMail.replyPlaceholder').replace('{name}', mail.from.name)} />
                <InputGroupAddon className="gap-1" align="inline-end">
                  <InputGroupButton variant="ghost">
                    <Smile />
                  </InputGroupButton>
                  <InputGroupButton variant="ghost">
                    <Paperclip />
                  </InputGroupButton>
                  <InputGroupButton variant="ghost">
                    <Send />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground text-sm">{t('dashMail.noEmailSelected')}</div>
        )}
      </div>
    </div>
  );
}
