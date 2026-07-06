
import { type FormEvent, useState } from "react";

import {
  AlarmClock,
  ArrowLeft,
  Copy,
  Flag,
  Link,
  MoreHorizontal,
  Paperclip,
  PhoneCall,
  Send,
  Smile,
  Sparkles,
  Tag,
  Type,
  UserRound,
} from "lucide-react-dash";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/dashboard-ui/avatar";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/dashboard-ui/bubble";
import { Button } from "@/components/dashboard-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/dashboard-ui/input-group";
import { Marker, MarkerContent } from "@/components/dashboard-ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/dashboard-ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/dashboard-ui/message-scroller";
import { Separator } from "@/components/dashboard-ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dashboard-ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, getInitials } from "@/lib/utils";

import { type Message as ChatMessage, type Contact, currentUser } from "./data";

interface ChatThreadProps {
  contact: Contact;
  messages: ChatMessage[];
  onOpenContact?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
  /** When set, the composer submits through this instead of being a no-op (wires up askCopilot). */
  onSendMessage?: (text: string) => Promise<void> | void;
  /** True while waiting on the assistant's reply — shows a typing indicator bubble. */
  isPending?: boolean;
}

export function ChatThread({
  contact,
  messages,
  onOpenContact,
  onBack,
  showBackButton,
  className,
  onSendMessage,
  isPending,
}: ChatThreadProps) {
  const { t } = useLanguage();

  return (
    <div className={cn("flex h-full min-w-0 flex-col py-3", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label={t('dashChat.thread.backAria')}
                onClick={onBack}
              >
                <ArrowLeft />
              </Button>
            )}
            <Avatar className="size-8">
              <AvatarFallback className="bg-background text-foreground">{getInitials(contact.name)}</AvatarFallback>
              <AvatarBadge className="bg-green-600 dark:bg-green-800" />
            </Avatar>
            <div>
              <div className="font-medium text-sm">{contact.name}</div>
              <div className="text-muted-foreground text-xs leading-3">{contact.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('dashChat.thread.callAria')}>
                  <PhoneCall />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashChat.thread.callTooltip')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('dashChat.thread.tagAria')}>
                  <Tag />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashChat.thread.tagTooltip')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('dashChat.thread.snoozeAria')}>
                  <AlarmClock />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashChat.thread.snoozeTooltip')}</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t('dashChat.thread.moreActionsAria')}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={onOpenContact}>
                    <UserRound />
                    {t('dashChat.thread.viewProfile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy />
                    {t('dashChat.thread.copyEmail')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag />
                    {t('dashChat.thread.markPriority')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">{t('dashChat.thread.blockContact')}</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />
      </div>

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-5 px-2 py-6">
              <Marker variant="separator">
                <MarkerContent>{t('dashChat.thread.dateMarker')}</MarkerContent>
              </Marker>

              {messages.map((message) => {
                const isOutbound = message.align === "end";
                const reactionAlign = isOutbound ? "start" : "end";
                const senderName = isOutbound ? currentUser.name : contact.name;

                return (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={String(message.id)}
                    scrollAnchor={message.align === "end"}
                  >
                    <Message align={message.align}>
                      <MessageAvatar>
                        <Avatar>
                          <AvatarFallback
                            className={cn(
                              "bg-muted text-foreground text-xs",
                              isOutbound && "bg-primary text-primary-foreground",
                            )}
                          >
                            {getInitials(senderName)}
                          </AvatarFallback>
                        </Avatar>
                      </MessageAvatar>

                      <MessageContent className="max-w-full">
                        <BubbleGroup>
                          <Bubble
                            variant={isOutbound ? "default" : "muted"}
                            align={message.align}
                            className="max-w-[min(80%,42rem)]"
                          >
                            <BubbleContent className="min-w-12 whitespace-pre-wrap break-words [overflow-wrap:break-word]">
                              {message.text}
                            </BubbleContent>
                            {message.reaction ? (
                              <BubbleReactions
                                aria-label={t('dashChat.thread.reactionAria').replace('{reaction}', message.reaction)}
                                align={reactionAlign}
                              >
                                <span>{message.reaction}</span>
                              </BubbleReactions>
                            ) : null}
                          </Bubble>
                        </BubbleGroup>
                        <MessageFooter>{message.time}</MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}

              {isPending && (
                <MessageScrollerItem messageId="copilot-typing" scrollAnchor>
                  <Message align="start">
                    <MessageAvatar>
                      <Avatar>
                        <AvatarFallback className="bg-muted text-foreground text-xs">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent className="max-w-full">
                      <BubbleGroup>
                        <Bubble variant="muted" align="start" className="max-w-[min(80%,42rem)]">
                          <BubbleContent className="min-w-12">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-current" />
                            </span>
                          </BubbleContent>
                        </Bubble>
                      </BubbleGroup>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="px-2">
        <Tabs defaultValue="reply" className="gap-2 rounded-xl border bg-background p-2 shadow-xs">
          <TabsList
            className="h-8 w-fit justify-start"
          >
            <TabsTrigger value="reply" className="h-7 flex-none px-3 text-xs">
              {t('dashChat.thread.tabReply')}
            </TabsTrigger>
            <TabsTrigger value="note" className="h-7 flex-none px-3 text-xs">
              {t('dashChat.thread.tabInternalNote')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reply" className="m-0">
            <MessageComposer
              placeholder={t('dashChat.thread.composerPlaceholder')}
              onSubmit={onSendMessage}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="note" className="m-0">
            <MessageComposer placeholder={t('dashChat.thread.notePlaceholder')} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MessageComposer({
  placeholder,
  onSubmit,
  disabled,
}: {
  placeholder: string;
  onSubmit?: (text: string) => Promise<void> | void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    if (onSubmit) {
      setValue("");
      void onSubmit(trimmed);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <InputGroup className="rounded-lg border bg-background shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot][aria-invalid=true]]:ring-0 dark:bg-input/20 dark:has-[[data-slot][aria-invalid=true]]:ring-0">
        <InputGroupTextarea
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          className="min-h-16 px-3 py-2.5 text-sm ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:aria-invalid:ring-0"
        />
        <InputGroupAddon align="block-end" className="flex-wrap justify-end border-t px-2 py-2">
          <InputGroupButton aria-label={t('dashChat.thread.formatAria')} type="button" size="icon-sm">
            <Type />
          </InputGroupButton>
          <InputGroupButton aria-label={t('dashChat.thread.emojiAria')} type="button" size="icon-sm">
            <Smile />
          </InputGroupButton>
          <InputGroupButton aria-label={t('dashChat.thread.attachFileAria')} type="button" size="icon-sm">
            <Paperclip />
          </InputGroupButton>
          <InputGroupButton aria-label={t('dashChat.thread.insertLinkAria')} type="button" size="icon-sm">
            <Link />
          </InputGroupButton>
          <InputGroupButton aria-label={t('dashChat.thread.aiAssistAria')} type="button" size="icon-sm" variant="outline">
            <Sparkles />
          </InputGroupButton>
          <InputGroupButton type="submit" variant="default" size="icon-sm" className="ml-auto" disabled={disabled}>
            <Send />
            <span className="sr-only">{t('dashChat.thread.sendSr')}</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
