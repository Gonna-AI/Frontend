import * as React from "react"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

const CollapsibleTrigger = React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>, React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>>(
  ({ ...props }, ref) => {
    return (
    <CollapsiblePrimitive.CollapsibleTrigger
      ref={ref}
      data-slot="collapsible-trigger"
      {...props}
    />
    )
  }
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>, React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>>(
  ({ ...props }, ref) => {
    return (
    <CollapsiblePrimitive.CollapsibleContent
      ref={ref}
      data-slot="collapsible-content"
      {...props}
    />
    )
  }
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
