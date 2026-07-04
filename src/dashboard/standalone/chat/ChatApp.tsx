import { useLayoutEffect } from "react";

import { SidebarProvider } from "@/components/dashboard-ui/sidebar";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";

import { Chat } from "./components/chat";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { conversations } from "./components/data";

export default function ChatApp() {
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
    <div className="dashboard-root" data-dashboard-preview={isDashboardPreview ? "true" : undefined}>
      <TooltipProvider>
        <div className="h-dvh [--header-height:calc(--spacing(14))]">
          <SidebarProvider className="flex h-full flex-col">
            <ChatHeader />
            <div className="flex flex-1 min-h-0">
              <ChatSidebar />
              <Chat conversations={conversations} />
            </div>
          </SidebarProvider>
        </div>
      </TooltipProvider>
    </div>
  );
}
