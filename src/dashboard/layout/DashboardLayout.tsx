import { Outlet } from "react-router-dom";
import { siGithub } from "simple-icons";

import { AppSidebar } from "@/dashboard/layout/app-sidebar";
import { SimpleIcon } from "@/dashboard/components/simple-icon";
import { Button } from "@/components/dashboard-ui/button";
import { Separator } from "@/components/dashboard-ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/dashboard-ui/sidebar";
import { Toaster } from "@/components/dashboard-ui/sonner";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";
import { users } from "@/dashboard/data/users";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/dashboard/store/preferences-store";

import { AccountSwitcher } from "./account-switcher";
import { LayoutControls } from "./layout-controls";
import { SearchDialog } from "./search-dialog";
import { ThemeSwitcher } from "./theme-switcher";

export default function DashboardLayout() {
  const values = usePreferencesStore((s) => s.values);
  const { content_layout: contentLayout, navbar_style: navbarStyle, theme_preset: themePreset, font, sidebar_variant, sidebar_collapsible } = values;

  return (
    <div
      className="dashboard-root"
      data-content-layout={contentLayout}
      data-navbar-style={navbarStyle}
      data-theme-preset={themePreset}
      data-font={font}
      data-sidebar-variant={sidebar_variant}
      data-sidebar-collapsible={sidebar_collapsible}
    >
      <TooltipProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 68)",
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset
            className={cn(
              contentLayout === "centered" && "*:mx-auto *:w-full *:max-w-screen-2xl",
              "peer-data-[variant=inset]:border",
              "[--dashboard-header-height:--spacing(12)]",
              "min-w-0 overflow-x-clip",
            )}
          >
            <header
              className={cn(
                "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
                navbarStyle === "sticky" &&
                  "sticky top-0 z-50 overflow-hidden rounded-t-[inherit] bg-background/50 backdrop-blur-md",
              )}
            >
              <div className="flex w-full items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-1 lg:gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                  />
                  <SearchDialog />
                </div>
                <div className="flex items-center gap-2">
                  <LayoutControls />
                  <ThemeSwitcher />
                  <Button asChild size="icon" variant="ghost">
                    <a
                      href="https://github.com/arhamkhnz/next-shadcn-admin-dashboard"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open GitHub repository"
                    >
                      <SimpleIcon icon={siGithub} className="fill-primary-foreground" />
                    </a>
                  </Button>
                  <AccountSwitcher users={users} />
                </div>
              </div>
            </header>
            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 has-data-[content-padding=false]:p-0 md:p-6 md:has-data-[content-padding=false]:p-0">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </div>
  );
}
