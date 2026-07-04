import { useLayoutEffect, useMemo } from "react";

import "@/dashboard/styles/dashboard-theme.css";
import { SidebarProvider } from "@/components/dashboard-ui/sidebar";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";

import { Chat } from "./components/chat";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { conversations as staticConversations } from "./components/data";
import { useLiveCopilot } from "./components/use-live-copilot";

export default function ChatApp() {
  const isDashboardPreview =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "dashboard";
  const { liveConversation, sendMessage } = useLiveCopilot();

  useLayoutEffect(() => {
    if (!isDashboardPreview) return;

    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";

    return () => {
      document.documentElement.style.colorScheme = "";
    };
  }, [isDashboardPreview]);

  // Swap in the live, Supabase-backed conversation for the default seeded thread; fall back to
  // the fully static list untouched if the live fetch failed or hasn't resolved yet.
  const conversations = useMemo(() => {
    if (!liveConversation) return staticConversations;
    return [liveConversation, ...staticConversations.slice(1)];
  }, [liveConversation]);

  return (
    <div className="dashboard-root h-dvh bg-background text-foreground" data-dashboard-preview={isDashboardPreview ? "true" : undefined}>
      <TooltipProvider>
        <div className="h-dvh [--header-height:calc(--spacing(14))]">
          <SidebarProvider className="flex h-full flex-col">
            <ChatHeader />
            <div className="flex flex-1 min-h-0">
              <ChatSidebar />
              <Chat conversations={conversations} onSendMessage={sendMessage} />
            </div>
          </SidebarProvider>
        </div>
      </TooltipProvider>
    </div>
  );
}
