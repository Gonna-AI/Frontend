
import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard-ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/dashboard-ui/input-group"
import { SearchIcon, CheckIcon } from "lucide-react-dash"

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentProps<typeof CommandPrimitive>>(
  ({ className,
  ...props }, ref) => {
    return (
    <CommandPrimitive
      ref={ref}
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground",
        className
      )}
      {...props}
    />
    )
  }
)
Command.displayName = "Command"

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof CommandPrimitive.Input>>(
  ({ className,
  ...props }, ref) => {
    return (
    <div
      ref={ref} data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
    )
  }
)
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentProps<typeof CommandPrimitive.List>>(
  ({ className,
  ...props }, ref) => {
    return (
    <CommandPrimitive.List
      ref={ref}
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className
      )}
      {...props}
    />
    )
  }
)
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentProps<typeof CommandPrimitive.Empty>>(
  ({ className,
  ...props }, ref) => {
    return (
    <CommandPrimitive.Empty
      ref={ref}
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
    )
  }
)
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentProps<typeof CommandPrimitive.Group>>(
  ({ className,
  ...props }, ref) => {
    return (
    <CommandPrimitive.Group
      ref={ref}
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
    )
  }
)
CommandGroup.displayName = "CommandGroup"

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, React.ComponentProps<typeof CommandPrimitive.Separator>>(
  ({ className,
  ...props }, ref) => {
    return (
    <CommandPrimitive.Separator
      ref={ref}
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
    )
  }
)
CommandSeparator.displayName = "CommandSeparator"

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentProps<typeof CommandPrimitive.Item>>(
  ({ className,
  children,
  ...props }, ref) => {
    return (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
    )
  }
)
CommandItem.displayName = "CommandItem"

const CommandShortcut = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className,
  ...props }, ref) => {
    return (
    <span
      ref={ref}
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground",
        className
      )}
      {...props}
    />
    )
  }
)
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
