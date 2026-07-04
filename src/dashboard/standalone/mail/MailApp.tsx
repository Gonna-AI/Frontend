import { SidebarProvider } from "@/components/dashboard-ui/sidebar";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";

import { mails } from "./components/data";
import { MailComponent } from "./components/mail";
import { MailSidebar } from "./components/mail-sidebar";
import { DEFAULT_MAIL_LAYOUT } from "./components/mail-layout-config";

export default function MailApp() {
  return (
    <div className="dashboard-root">
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
