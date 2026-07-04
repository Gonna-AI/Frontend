import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/dashboard-ui/button"
import { ArrowDownIcon } from "lucide-react"

interface MessageScrollerContextValue {
  viewportRef: React.RefObject<HTMLDivElement>
  isAtBottom: boolean
  scrollToEnd: (behavior?: ScrollBehavior) => void
}

const MessageScrollerContext = React.createContext<MessageScrollerContextValue | null>(null)

function useMessageScroller() {
  const ctx = React.useContext(MessageScrollerContext)
  if (!ctx) throw new Error("useMessageScroller must be used within a MessageScrollerProvider")
  return ctx
}

function useMessageScrollerScrollable() {
  return useMessageScroller()
}

function useMessageScrollerVisibility() {
  const { isAtBottom } = useMessageScroller()
  return !isAtBottom
}

function MessageScrollerProvider({
  autoScroll = false,
  children,
}: {
  autoScroll?: boolean
  children: React.ReactNode
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = React.useState(true)

  const scrollToEnd = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = viewportRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  React.useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      setIsAtBottom(distance < 48)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    if (autoScroll) scrollToEnd("auto")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MessageScrollerContext.Provider value={{ viewportRef, isAtBottom, scrollToEnd }}>
      {children}
    </MessageScrollerContext.Provider>
  )
}

function MessageScroller({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-scroller"
      className={cn("group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden", className)}
      {...props}
    />
  )
}

function MessageScrollerViewport({ className, ...props }: React.ComponentProps<"div">) {
  const { viewportRef } = useMessageScroller()
  return (
    <div
      ref={viewportRef}
      data-slot="message-scroller-viewport"
      className={cn("size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  )
}

function MessageScrollerContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-scroller-content" className={cn("flex h-max min-h-full flex-col gap-6", className)} {...props} />
}

function MessageScrollerItem({
  className,
  scrollAnchor: _scrollAnchor = false,
  messageId,
  ...props
}: React.ComponentProps<"div"> & { scrollAnchor?: boolean; messageId?: string }) {
  return (
    <div
      data-slot="message-scroller-item"
      data-message-id={messageId}
      className={cn("min-w-0 shrink-0", className)}
      {...props}
    />
  )
}

function MessageScrollerButton({
  direction = "end",
  className,
  children,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: React.ComponentProps<"button"> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size"> & { direction?: "end" | "start" }) {
  const { isAtBottom, scrollToEnd } = useMessageScroller()
  const active = !isAtBottom

  return (
    <Button
      data-slot="message-scroller-button"
      data-direction={direction}
      variant={variant}
      size={size}
      onClick={() => scrollToEnd()}
      className={cn(
        "absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground",
        direction === "end" ? "bottom-4" : "top-4",
        active ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">{direction === "end" ? "Scroll to end" : "Scroll to start"}</span>
        </>
      )}
    </Button>
  )
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
}
