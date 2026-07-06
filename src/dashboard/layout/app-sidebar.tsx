import { Link } from "react-router-dom";

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
              <Link to="/dashboard/default" className="flex items-center gap-2">
                {/* favicon.svg is drawn in solid white (built for dark surfaces) — brightness-0
                    forces it fully black on light sidebars, while dark mode keeps it white.
                    The -mt-px nudge corrects the mark sitting slightly low within its own
                    viewBox, an optical-alignment issue independent of the flex centering. */}
                <img src="/favicon.svg" alt="ClerkTree" className="-mt-px size-5 shrink-0 brightness-0 dark:brightness-100" />
                <span className="font-semibold text-base leading-none">{APP_CONFIG.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
