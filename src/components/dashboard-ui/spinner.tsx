import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react-dash"

const Spinner = React.forwardRef<React.ElementRef<typeof Loader2Icon>, React.ComponentProps<"svg">>(
  ({ className, ...props }, ref) => {
    return (
    <Loader2Icon
      ref={ref} data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }
