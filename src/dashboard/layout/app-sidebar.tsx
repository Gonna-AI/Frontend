import { Link } from "react-router-dom";
import { Command } from "lucide-react-dash";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/dashboard-ui/sidebar";
import { APP_CONFIG } from "@/dashboard/data/app-config";
import { sidebarItems } from "@/dashboard/navigation/sidebar-items";
import { usePreferencesStore } from "@/dashboard/store/preferences-store";
import { useAuth } from "@/contexts/AuthContext";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { SidebarSupportCard } from "./sidebar-support-card";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const variant = usePreferencesStore((s) => s.values.sidebar_variant);
  const collapsible = usePreferencesStore((s) => s.values.sidebar_collapsible);
  const { user } = useAuth();

  const currentUser = {
    name: (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email?.split("@")[0] || "Account",
    email: user?.email ?? "",
    avatar: (user?.user_metadata?.avatar_url as string | undefined) ?? "",
  };

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/dashboard/default">
                <Command />
                <span className="font-semibold text-base">{APP_CONFIG.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSupportCard />
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
