
import { EllipsisVertical, LogOut, Settings, UserRound } from "lucide-react-dash";
import { siFacebook, siInstagram, siWhatsapp } from "simple-icons";

import { SimpleIcon } from "@/dashboard/components/simple-icon";
import { Avatar, AvatarFallback } from "@/components/dashboard-ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { Separator } from "@/components/dashboard-ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/dashboard-ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInitials } from "@/lib/utils";

import { channelItems, currentUser, navItems, viewItems } from "./data";

const channelBrandIcons = {
  whatsapp: siWhatsapp,
  instagram: siInstagram,
  facebook: siFacebook,
} as const;

const navTitleKeys: Record<string, string> = {
  inbox: "dashChat.sidebar.nav.inbox",
  mentions: "dashChat.sidebar.nav.mentions",
  snoozed: "dashChat.sidebar.nav.snoozed",
  sent: "dashChat.sidebar.nav.sent",
  all: "dashChat.sidebar.nav.allConversations",
  unassigned: "dashChat.sidebar.nav.unassigned",
};

const channelTitleKeys: Record<string, string> = {
  email: "dashChat.sidebar.channel.email",
  chat: "dashChat.sidebar.channel.chat",
  whatsapp: "dashChat.sidebar.channel.whatsapp",
  instagram: "dashChat.sidebar.channel.instagram",
  facebook: "dashChat.sidebar.channel.facebook",
  phone: "dashChat.sidebar.channel.phone",
};

const viewTitleKeys: Record<string, string> = {
  vip: "dashChat.sidebar.view.flagshipProjects",
  orders: "dashChat.sidebar.view.kostencheckReviews",
  feedback: "dashChat.sidebar.view.projectMemoryQueries",
};

export function ChatSidebar() {
  const { t } = useLanguage();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! **:data-[sidebar=sidebar]:bg-background"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => {
              const title = t(navTitleKeys[item.id] ?? item.title);
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="[&_svg]:size-3.5" size="sm" isActive={item.isActive} tooltip={title}>
                    <item.icon />
                    <span className="font-medium">{title}</span>
                  </SidebarMenuButton>
                  {item.label && <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-normal">{t('dashChat.sidebar.channelsGroup')}</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {channelItems.map((item) => {
              const title = t(channelTitleKeys[item.id] ?? item.title);
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="[&_svg]:size-3.5" size="sm" isActive={item.isActive} tooltip={title}>
                    {item.id in channelBrandIcons ? (
                      <SimpleIcon icon={channelBrandIcons[item.id as keyof typeof channelBrandIcons]} />
                    ) : (
                      <item.icon />
                    )}
                    <span className="font-medium">{title}</span>
                  </SidebarMenuButton>
                  {item.label && <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-normal">{t('dashChat.sidebar.viewsGroup')}</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {viewItems.map((item) => {
              const title = t(viewTitleKeys[item.id] ?? item.title);
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="[&_svg]:size-3.5" size="sm" isActive={item.isActive} tooltip={title}>
                    <item.icon />
                    <span className="font-medium">{title}</span>
                  </SidebarMenuButton>
                  {item.label && <SidebarMenuBadge className="font-medium">{item.label}</SidebarMenuBadge>}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar>
                    <AvatarFallback className="text-xs">{getInitials(currentUser.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{currentUser.name}</span>
                    <span className="truncate text-muted-foreground text-xs">{currentUser.email}</span>
                  </div>
                  <EllipsisVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56" side="top">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar>
                      <AvatarFallback className="text-xs">{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{currentUser.name}</span>
                      <span className="truncate text-muted-foreground text-xs">{currentUser.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserRound />
                    {t('dashChat.sidebar.account')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings />
                    {t('dashChat.sidebar.settings')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  {t('dashChat.sidebar.logOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
