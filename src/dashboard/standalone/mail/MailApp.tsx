import { useLayoutEffect } from "react";

import "@/dashboard/styles/dashboard-theme.css";
import { SidebarProvider } from "@/components/dashboard-ui/sidebar";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";

import { mails } from "./components/data";
import { MailComponent } from "./components/mail";
import { MailSidebar } from "./components/mail-sidebar";
import { DEFAULT_MAIL_LAYOUT } from "./components/mail-layout-config";

export default function MailApp() {
  const isDashboardPreview =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "dashboard";

  useLayoutEffect(() => {
    if (!isDashboardPreview) return;

    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";

    return () => {
      document.documentElement.style.colorScheme = "";
    };
  }, [isDashboardPreview]);

  return (
    <div className="dashboard-root h-dvh bg-background text-foreground" data-dashboard-preview={isDashboardPreview ? "true" : undefined}>
      <TooltipProvider>
        <div className="relative h-dvh min-h-0 overflow-hidden">
          <SidebarProvider className="h-full min-h-0">
            <MailSidebar />
            <div className="size-full">
              <MailComponent mails={mails} defaultLayout={[...DEFAULT_MAIL_LAYOUT]} />
            </div>
          </SidebarProvider>
        </div>
      </TooltipProvider>
    </div>
  );
}
