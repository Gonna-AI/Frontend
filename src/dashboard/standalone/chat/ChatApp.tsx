import { SidebarProvider } from "@/components/dashboard-ui/sidebar";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";

import { Chat } from "./components/chat";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { conversations } from "./components/data";

export default function ChatApp() {
  return (
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
  );
}
