
import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/dashboard-ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/dashboard-ui/input-group"
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react-dash"

const Combobox = ComboboxPrimitive.Root

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

const ComboboxTrigger = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Trigger>, ComboboxPrimitive.Trigger.Props>(
  ({ className,
  children,
  ...props }, ref) => {
    return (
    <ComboboxPrimitive.Trigger
      ref={ref}
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
    )
  }
)
ComboboxTrigger.displayName = "ComboboxTrigger"

const ComboboxClear = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Clear>, ComboboxPrimitive.Clear.Props>(
  ({ className, ...props }, ref) => {
    return (
    <ComboboxPrimitive.Clear
      ref={ref}
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
    )
  }
)
ComboboxClear.displayName = "ComboboxClear"

const ComboboxInput = React.forwardRef<React.ElementRef<typeof InputGroup>, ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
}>(
  ({ className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props }, ref) => {
    return (
    <InputGroup
      ref={ref} className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
    )
  }
)
ComboboxInput.displayName = "ComboboxInput"

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn("group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

const ComboboxList = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.List>, ComboboxPrimitive.List.Props>(
  ({ className, ...props }, ref) => {
    return (
    <ComboboxPrimitive.List
      ref={ref}
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
      {...props}
    />
    )
  }
)
ComboboxList.displayName = "ComboboxList"

const ComboboxItem = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Item>, ComboboxPrimitive.Item.Props>(
  ({ className,
  children,
  ...props }, ref) => {
    return (
    <ComboboxPrimitive.Item
      ref={ref}
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
    )
  }
)
ComboboxItem.displayName = "ComboboxItem"

const ComboboxGroup = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Group>, ComboboxPrimitive.Group.Props>(
  ({ className, ...props }, ref) => {
    return (
    <ComboboxPrimitive.Group
      ref={ref}
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
    )
  }
)
ComboboxGroup.displayName = "ComboboxGroup"

const ComboboxLabel = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.GroupLabel>, ComboboxPrimitive.GroupLabel.Props>(
  ({ className,
  ...props }, ref) => {
    return (
    <ComboboxPrimitive.GroupLabel
      ref={ref}
      data-slot="combobox-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
    )
  }
)
ComboboxLabel.displayName = "ComboboxLabel"

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
}

const ComboboxEmpty = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Empty>, ComboboxPrimitive.Empty.Props>(
  ({ className, ...props }, ref) => {
    return (
    <ComboboxPrimitive.Empty
      ref={ref}
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    />
    )
  }
)
ComboboxEmpty.displayName = "ComboboxEmpty"

const ComboboxSeparator = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Separator>, ComboboxPrimitive.Separator.Props>(
  ({ className,
  ...props }, ref) => {
    return (
    <ComboboxPrimitive.Separator
      ref={ref}
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
    )
  }
)
ComboboxSeparator.displayName = "ComboboxSeparator"

const ComboboxChips = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Chips>, React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props>(
  ({ className,
  ...props }, ref) => {
    return (
    <ComboboxPrimitive.Chips
      ref={ref}
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
    )
  }
)
ComboboxChips.displayName = "ComboboxChips"

const ComboboxChip = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Chip>, ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
}>(
  ({ className,
  children,
  showRemove = true,
  ...props }, ref) => {
    return (
    <ComboboxPrimitive.Chip
      ref={ref}
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
    )
  }
)
ComboboxChip.displayName = "ComboboxChip"

const ComboboxChipsInput = React.forwardRef<React.ElementRef<typeof ComboboxPrimitive.Input>, ComboboxPrimitive.Input.Props>(
  ({ className,
  ...props }, ref) => {
    return (
    <ComboboxPrimitive.Input
      ref={ref}
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...props}
    />
    )
  }
)
ComboboxChipsInput.displayName = "ComboboxChipsInput"

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
