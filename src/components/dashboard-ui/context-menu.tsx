
import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react-dash"

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

const ContextMenuTrigger = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Trigger>, React.ComponentProps<typeof ContextMenuPrimitive.Trigger>>(
  ({ className,
  ...props }, ref) => {
    return (
    <ContextMenuPrimitive.Trigger
      ref={ref}
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
    />
    )
  }
)
ContextMenuTrigger.displayName = "ContextMenuTrigger"

const ContextMenuGroup = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Group>, React.ComponentProps<typeof ContextMenuPrimitive.Group>>(
  ({ ...props }, ref) => {
    return (
    <ContextMenuPrimitive.Group
      ref={ref} data-slot="context-menu-group" {...props} />
    )
  }
)
ContextMenuGroup.displayName = "ContextMenuGroup"

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

const ContextMenuRadioGroup = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.RadioGroup>, React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>>(
  ({ ...props }, ref) => {
    return (
    <ContextMenuPrimitive.RadioGroup
      ref={ref}
      data-slot="context-menu-radio-group"
      {...props}
    />
    )
  }
)
ContextMenuRadioGroup.displayName = "ContextMenuRadioGroup"

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn("z-50 max-h-(--radix-context-menu-content-available-height) min-w-36 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

const ContextMenuItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Item>, React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}>(
  ({ className,
  inset,
  variant = "default",
  ...props }, ref) => {
    return (
    <ContextMenuPrimitive.Item
      ref={ref}
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/context-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
    )
  }
)
ContextMenuItem.displayName = "ContextMenuItem"

const ContextMenuSubTrigger = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>, React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}>(
  ({ className,
  inset,
  children,
  ...props }, ref) => {
    return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
    )
  }
)
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger"

const ContextMenuSubContent = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.SubContent>, React.ComponentProps<typeof ContextMenuPrimitive.SubContent>>(
  ({ className,
  ...props }, ref) => {
    return (
    <ContextMenuPrimitive.SubContent
      ref={ref}
      data-slot="context-menu-sub-content"
      className={cn("z-50 min-w-32 origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
    )
  }
)
ContextMenuSubContent.displayName = "ContextMenuSubContent"

const ContextMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>, React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> & {
  inset?: boolean
}>(
  ({ className,
  children,
  checked,
  inset,
  ...props }, ref) => {
    return (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon
          />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
    )
  }
)
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem"

const ContextMenuRadioItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.RadioItem>, React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
  inset?: boolean
}>(
  ({ className,
  children,
  inset,
  ...props }, ref) => {
    return (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon
          />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
    )
  }
)
ContextMenuRadioItem.displayName = "ContextMenuRadioItem"

const ContextMenuLabel = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Label>, React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}>(
  ({ className,
  inset,
  ...props }, ref) => {
    return (
    <ContextMenuPrimitive.Label
      ref={ref}
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
    )
  }
)
ContextMenuLabel.displayName = "ContextMenuLabel"

const ContextMenuSeparator = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Separator>, React.ComponentProps<typeof ContextMenuPrimitive.Separator>>(
  ({ className,
  ...props }, ref) => {
    return (
    <ContextMenuPrimitive.Separator
      ref={ref}
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
    )
  }
)
ContextMenuSeparator.displayName = "ContextMenuSeparator"

const ContextMenuShortcut = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className,
  ...props }, ref) => {
    return (
    <span
      ref={ref}
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
    )
  }
)
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
