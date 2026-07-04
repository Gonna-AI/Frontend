import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/dashboard-ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react-dash"

const Pagination = React.forwardRef<HTMLElement, React.ComponentProps<"nav">>(
  ({ className, ...props }, ref) => {
    return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
    )
  }
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className,
  ...props }, ref) => {
    return (
    <ul
      ref={ref}
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
    )
  }
)
PaginationContent.displayName = "PaginationContent"

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

const PaginationLink = React.forwardRef<React.ElementRef<typeof Button>, PaginationLinkProps>(
  ({ className,
  isActive,
  size = "icon",
  ...props }, ref) => {
    return (
    <Button
      ref={ref}
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
    )
  }
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = React.forwardRef<React.ElementRef<typeof PaginationLink>, React.ComponentProps<typeof PaginationLink> & { text?: string }>(
  ({ className,
  text = "Previous",
  ...props }, ref) => {
    return (
    <PaginationLink
      ref={ref}
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
    )
  }
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef<React.ElementRef<typeof PaginationLink>, React.ComponentProps<typeof PaginationLink> & { text?: string }>(
  ({ className,
  text = "Next",
  ...props }, ref) => {
    return (
    <PaginationLink
      ref={ref}
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
    )
  }
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className,
  ...props }, ref) => {
    return (
    <span
      ref={ref}
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More pages</span>
    </span>
    )
  }
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
