
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
  return (
    <div className={cn("flex h-full flex-col py-3", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Back to conversations"
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
                <Button variant="ghost" size="icon-sm" aria-label="Call">
                  <PhoneCall />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Tag">
                  <Tag />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tag</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Snooze">
                  <AlarmClock />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Snooze</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={onOpenContact}>
                    <UserRound />
                    View profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy />
                    Copy email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag />
                    Mark priority
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">Block contact</DropdownMenuItem>
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
            <MessageScrollerContent className="gap-6 px-2 py-8">
              <Marker variant="separator">
                <MarkerContent>May 6, 2026</MarkerContent>
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

                      <MessageContent>
                        <BubbleGroup>
                          <Bubble variant={isOutbound ? "default" : "muted"} align={message.align}>
                            <BubbleContent>{message.text}</BubbleContent>
                            {message.reaction ? (
                              <BubbleReactions aria-label={`Reaction: ${message.reaction}`} align={reactionAlign}>
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
                    <MessageContent>
                      <BubbleGroup>
                        <Bubble variant="muted" align="start">
                          <BubbleContent>
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
        <Tabs defaultValue="reply" className="gap-0 rounded-md border">
          <TabsList
            variant="line"
            className="w-full justify-start gap-2 border-b px-3 **:data-[slot=tabs-trigger]:border-x-0 **:data-[slot=tabs-trigger]:px-6 group-data-horizontal/tabs:h-10"
          >
            <TabsTrigger value="reply" className="flex-none px-1">
              Reply
            </TabsTrigger>
            <TabsTrigger value="note" className="flex-none px-1">
              Internal note
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reply" className="m-0">
            <MessageComposer placeholder="Type your message..." onSubmit={onSendMessage} disabled={isPending} />
          </TabsContent>
          <TabsContent value="note" className="m-0">
            <MessageComposer placeholder="Write an internal note..." />
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
      <InputGroup className="border-0 bg-transparent shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-0 has-[[data-slot][aria-invalid=true]]:border-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot][aria-invalid=true]]:ring-0 dark:bg-transparent dark:has-[[data-slot][aria-invalid=true]]:ring-0">
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
          className="min-h-14 px-3 py-2.5 text-sm ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:aria-invalid:ring-0"
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton aria-label="Format" type="button" size="icon-sm">
            <Type />
          </InputGroupButton>
          <InputGroupButton aria-label="Emoji" type="button" size="icon-sm">
            <Smile />
          </InputGroupButton>
          <InputGroupButton aria-label="Attach file" type="button" size="icon-sm">
            <Paperclip />
          </InputGroupButton>
          <InputGroupButton aria-label="Insert link" type="button" size="icon-sm">
            <Link />
          </InputGroupButton>
          <InputGroupButton aria-label="AI assist" type="button" size="icon-sm" variant="outline">
            <Sparkles />
          </InputGroupButton>
          <InputGroupButton type="submit" variant="default" size="icon-sm" className="ml-auto" disabled={disabled}>
            <Send />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
