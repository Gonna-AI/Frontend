
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle2 as CircleCheckIcon, InfoIcon, AlertTriangle as TriangleAlertIcon, XOctagon as OctagonXIcon, Loader2Icon } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useTheme()

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
