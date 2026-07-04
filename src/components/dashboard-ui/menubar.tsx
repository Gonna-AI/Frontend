
import * as React from "react"
import { Menubar as MenubarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon, ChevronRightIcon } from "lucide-react-dash"

const Menubar = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Root>, React.ComponentProps<typeof MenubarPrimitive.Root>>(
  ({ className,
  ...props }, ref) => {
    return (
    <MenubarPrimitive.Root
      ref={ref}
      data-slot="menubar"
      className={cn(
        "flex h-8 items-center gap-0.5 rounded-lg border p-[3px]",
        className
      )}
      {...props}
    />
    )
  }
)
Menubar.displayName = "Menubar"

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

const MenubarRadioGroup = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.RadioGroup>, React.ComponentProps<typeof MenubarPrimitive.RadioGroup>>(
  ({ ...props }, ref) => {
    return (
    <MenubarPrimitive.RadioGroup
      ref={ref} data-slot="menubar-radio-group" {...props} />
    )
  }
)
MenubarRadioGroup.displayName = "MenubarRadioGroup"

const MenubarTrigger = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Trigger>, React.ComponentProps<typeof MenubarPrimitive.Trigger>>(
  ({ className,
  ...props }, ref) => {
    return (
    <MenubarPrimitive.Trigger
      ref={ref}
      data-slot="menubar-trigger"
      className={cn(
        "flex items-center rounded-sm px-1.5 py-[2px] text-sm font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",
        className
      )}
      {...props}
    />
    )
  }
)
MenubarTrigger.displayName = "MenubarTrigger"

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn("z-50 min-w-36 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95", className )}
        {...props}
      />
    </MenubarPortal>
  )
}

const MenubarItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Item>, React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}>(
  ({ className,
  inset,
  variant = "default",
  ...props }, ref) => {
    return (
    <MenubarPrimitive.Item
      ref={ref}
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/menubar-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...props}
    />
    )
  }
)
MenubarItem.displayName = "MenubarItem"

const MenubarCheckboxItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.CheckboxItem>, React.ComponentProps<typeof MenubarPrimitive.CheckboxItem> & {
  inset?: boolean
}>(
  ({ className,
  children,
  checked,
  inset,
  ...props }, ref) => {
    return (
    <MenubarPrimitive.CheckboxItem
      ref={ref}
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon
          />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
    )
  }
)
MenubarCheckboxItem.displayName = "MenubarCheckboxItem"

const MenubarRadioItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.RadioItem>, React.ComponentProps<typeof MenubarPrimitive.RadioItem> & {
  inset?: boolean
}>(
  ({ className,
  children,
  inset,
  ...props }, ref) => {
    return (
    <MenubarPrimitive.RadioItem
      ref={ref}
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon
          />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
    )
  }
)
MenubarRadioItem.displayName = "MenubarRadioItem"

const MenubarLabel = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Label>, React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}>(
  ({ className,
  inset,
  ...props }, ref) => {
    return (
    <MenubarPrimitive.Label
      ref={ref}
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-sm font-medium data-inset:pl-7",
        className
      )}
      {...props}
    />
    )
  }
)
MenubarLabel.displayName = "MenubarLabel"

const MenubarSeparator = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Separator>, React.ComponentProps<typeof MenubarPrimitive.Separator>>(
  ({ className,
  ...props }, ref) => {
    return (
    <MenubarPrimitive.Separator
      ref={ref}
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
    )
  }
)
MenubarSeparator.displayName = "MenubarSeparator"

const MenubarShortcut = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className,
  ...props }, ref) => {
    return (
    <span
      ref={ref}
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",
        className
      )}
      {...props}
    />
    )
  }
)
MenubarShortcut.displayName = "MenubarShortcut"

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

const MenubarSubTrigger = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubTrigger>, React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}>(
  ({ className,
  inset,
  children,
  ...props }, ref) => {
    return (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenubarPrimitive.SubTrigger>
    )
  }
)
MenubarSubTrigger.displayName = "MenubarSubTrigger"

const MenubarSubContent = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubContent>, React.ComponentProps<typeof MenubarPrimitive.SubContent>>(
  ({ className,
  ...props }, ref) => {
    return (
    <MenubarPrimitive.SubContent
      ref={ref}
      data-slot="menubar-sub-content"
      className={cn("z-50 min-w-32 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
    )
  }
)
MenubarSubContent.displayName = "MenubarSubContent"

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
