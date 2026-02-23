import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import {
    Phone,
    History,
    Mic,
    Database,
    ListOrdered,
    Scroll,
    Tags,
    Save,
    Brain,
    Sparkles,
    Terminal,
    CreditCard,
    Link2,
    Key,
    BarChart,
    Sun,
    Moon,
    LogOut,
    User,
    Users
} from "lucide-react"

import { useTheme } from "@/hooks/useTheme"

import { getGroqSettings, GROQ_MODELS, GroqSettings } from "./DemoCall/GroqSettings"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarSeparator,
    SidebarMenuBadge,
    useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/utils/cn"
import { useLanguage } from "@/contexts/LanguageContext"
import LanguageSwitcher from "./Layout/LanguageSwitcher"
import { useDemoCall } from "@/contexts/DemoCallContext"
import { useAuth } from "@/contexts/AuthContext"

// Company Logo component
const ClerkTreeLogo = ({ className, isDark = true }: { className?: string; isDark?: boolean }) => (
    <svg viewBox="0 0 464 468" className={className}>
        <path
            fill={isDark ? "currentColor" : "currentColor"}
            d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
        />
    </svg>
);

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    hasAccess?: boolean;
}

// Tabs that are always accessible without an access code
const ALWAYS_ACCESSIBLE_TABS = ['billing', 'keys'];

export function AppSidebar({ activeTab, setActiveTab, hasAccess = false, ...props }: AppSidebarProps) {
    const { t, language, setLanguage } = useLanguage();
    const { state, isMobile } = useSidebar();
    const { getCurrentUserId, switchSession, knowledgeBase, saveKnowledgeBase } = useDemoCall();
    const { isDark, toggleTheme } = useTheme();

    const [currentModelName, setCurrentModelName] = useState<string>('');

    useEffect(() => {
        // Initial load
        const loadSettings = () => {
            const settings = getGroqSettings();
            const model = GROQ_MODELS.find(m => m.id === settings.model);
            if (model) {
                // Shorten name if too long
                const shortName = model.name.replace('Llama 3.3', 'Llama 3.3').replace('Versatile', '').replace('Instant', '').trim();
                setCurrentModelName(shortName);
            }
        };
        loadSettings();

        // Listen for updates
        const handleUpdate = (e: CustomEvent<GroqSettings>) => {
            const model = GROQ_MODELS.find(m => m.id === e.detail.model);
            if (model) {
                const shortName = model.name.replace('Llama 3.3', 'Llama 3.3').replace('Versatile', '').replace('Instant', '').trim();
                setCurrentModelName(shortName);
            }
        };

        window.addEventListener('groq-settings-updated', handleUpdate as EventListener);
        return () => window.removeEventListener('groq-settings-updated', handleUpdate as EventListener);
    }, []);

    // Helper: returns disabled styles for locked tabs
    const getLockedStyles = (tabName: string) => {
        if (hasAccess || ALWAYS_ACCESSIBLE_TABS.includes(tabName)) return '';
        return 'opacity-40 pointer-events-none cursor-not-allowed select-none';
    };

    const handleTabClick = (tabName: string) => {
        if (!hasAccess && !ALWAYS_ACCESSIBLE_TABS.includes(tabName)) return;
        setActiveTab(tabName);
    };

    return (
        <Sidebar collapsible="icon" {...props} className={cn(
            "border-r transition-colors duration-300",
            isDark ? "border-white/10 bg-black" : "border-black/5 bg-white"
        )}>
            {!isMobile && (
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <div className={cn(
                                    "flex items-center gap-3 cursor-pointer",
                                    isDark ? "text-white" : "text-gray-900",
                                    state === "collapsed" && "justify-center"
                                )}>
                                    <div className="flex aspect-square items-center justify-center">
                                        <img
                                            src="/favicon.svg"
                                            alt="ClerkTree Logo"
                                            className={cn(
                                                "transition-all",
                                                isDark ? "invert-0" : "invert",
                                                state === "collapsed" ? "size-6" : "size-10"
                                            )}
                                        />
                                    </div>
                                    <div className={cn(
                                        "flex flex-col",
                                        state === "collapsed" && "hidden"
                                    )}>
                                        <span className="text-xl font-semibold tracking-tight">ClerkTree</span>
                                    </div>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
            )}
            <SidebarContent>
                {/* Main Dashboard Group */}
                <SidebarGroup className={getLockedStyles('monitor')}>
                    <SidebarGroupLabel className={isDark ? "text-white/60" : "text-black/60"}>{t('sidebar.platform')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'monitor'}
                                    onClick={() => handleTabClick('monitor')}
                                    tooltip="Monitor"
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Phone />
                                    <span>{t('dashboard.tab.monitor')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'knowledge'}
                                    onClick={() => handleTabClick('knowledge')}
                                    tooltip="Configuration"
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Brain />
                                    <span>{t('dashboard.tab.config')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'history'}
                                    onClick={() => handleTabClick('history')}
                                    tooltip="History"
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <History />
                                    <span>{t('dashboard.tab.history')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className={isDark ? "bg-white/10" : "bg-black/5"} />

                {/* AI Configuration Group */}
                <SidebarGroup className={getLockedStyles('groq_settings')}>
                    <SidebarGroupLabel className={isDark ? "text-white/60" : "text-black/60"}>{t('sidebar.aiBehavior')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Model Selection */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'groq_settings'}
                                    onClick={() => handleTabClick('groq_settings')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Sparkles className="text-purple-400" />
                                    <span>{t('sidebar.groqAi')}</span>
                                    {currentModelName && (
                                        <SidebarMenuBadge className="bg-purple-500/20 text-purple-300">
                                            {currentModelName}
                                        </SidebarMenuBadge>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'system_prompt'}
                                    onClick={() => handleTabClick('system_prompt')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Terminal />
                                    <span>{t('sidebar.systemPrompt')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'ai_voice'}
                                    onClick={() => handleTabClick('ai_voice')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Mic />
                                    <span>{t('sidebar.aiVoice')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'context_fields'}
                                    onClick={() => handleTabClick('context_fields')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Database />
                                    <span>{t('sidebar.contextFields')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'categories'}
                                    onClick={() => handleTabClick('categories')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Tags />
                                    <span>{t('sidebar.categories')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'priority_rules'}
                                    onClick={() => handleTabClick('priority_rules')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <ListOrdered />
                                    <span>{t('sidebar.priorityRules')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'instructions'}
                                    onClick={() => handleTabClick('instructions')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Scroll />
                                    <span>{t('sidebar.instructions')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Save Action */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 border border-green-500/20 mt-2"
                                >
                                    <Save />
                                    <span>{t('sidebar.saveConfig')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className={isDark ? "bg-white/10" : "bg-black/5"} />

                {/* Account Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className={isDark ? "text-white/60" : "text-black/60"}>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className={getLockedStyles('usage')}>
                                <SidebarMenuButton
                                    isActive={activeTab === 'usage'}
                                    onClick={() => handleTabClick('usage')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <BarChart />
                                    <span>Usage</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'billing'}
                                    onClick={() => handleTabClick('billing')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <CreditCard />
                                    <span>Billing</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'keys'}
                                    onClick={() => handleTabClick('keys')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Key />
                                    <span>Keys</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'team'}
                                    onClick={() => handleTabClick('team')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Users />
                                    <span>{t('sidebar.team')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'integrations'}
                                    onClick={() => handleTabClick('integrations')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Link2 />
                                    <span>Integrations</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Dark mode & Language: show inside scrollable content on mobile */}
                {isMobile && (
                    <>
                        <SidebarSeparator className={isDark ? "bg-white/10" : "bg-black/5"} />
                        <SidebarGroup>
                            <SidebarGroupLabel className={isDark ? "text-white/60" : "text-black/60"}>
                                {t('sidebar.language')} & Theme
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={toggleTheme}
                                            className={cn(
                                                isDark
                                                    ? "text-white/70 hover:text-white hover:bg-white/10"
                                                    : "text-black/70 hover:text-black hover:bg-black/5"
                                            )}
                                        >
                                            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                            <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <div className="flex items-center justify-between px-2 py-2">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                isDark ? "text-white/70" : "text-black/70"
                                            )}>
                                                {t('sidebar.language')}
                                            </span>
                                            <div className="scale-90 origin-right">
                                                <LanguageSwitcher isExpanded={true} forceDark={isDark} />
                                            </div>
                                        </div>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}

            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    {/* Dark mode & Language: show inside footer only on desktop */}
                    {!isMobile && (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={toggleTheme}
                                    className={cn(
                                        isDark
                                            ? "text-white/70 hover:text-white hover:bg-white/10"
                                            : "text-black/70 hover:text-black hover:bg-black/5"
                                    )}
                                >
                                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <div className={cn(
                                    "flex items-center transition-all duration-200",
                                    state === "collapsed" ? "justify-center py-2" : "justify-between px-2 py-2"
                                )}>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isDark ? "text-white/70" : "text-black/70",
                                        state === "collapsed" && "hidden"
                                    )}>
                                        {t('sidebar.language')}
                                    </span>

                                    {state === "collapsed" ? (
                                        <button
                                            onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                                            className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors uppercase",
                                                isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-black/5 text-black hover:bg-black/10"
                                            )}
                                        >
                                            {language}
                                        </button>
                                    ) : (
                                        <div className="scale-90 origin-right">
                                            <LanguageSwitcher isExpanded={true} forceDark={isDark} />
                                        </div>
                                    )}
                                </div>
                            </SidebarMenuItem>
                        </>
                    )}
                    <SidebarSeparator className={isDark ? "bg-white/10" : "bg-black/5"} />
                    <AuthUserSection isDark={isDark} state={state} />
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

// Separate component to use useAuth inside sidebar
function AuthUserSection({ isDark, state }: { isDark: boolean; state: string }) {
    const { user, signOut } = useAuth();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    if (!user) return null;

    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const email = user.email;

    const handleSignOut = async () => {
        setShowConfirm(false);
        setIsSigningOut(true);
        try {
            // Clear sensitive localStorage data before signing out
            // These may contain PII (call transcripts, caller names, knowledge base configs)
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.includes('call_history') ||
                    key.includes('knowledge_base') ||
                    key.includes('active_call') ||
                    key.includes('groq_settings') ||
                    key.includes('clerktree')
                )) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            await signOut();
            // Brief delay so the user sees the signing-out state
            await new Promise(resolve => setTimeout(resolve, 800));
            window.location.href = '/login';
        } catch {
            setIsSigningOut(false);
        }
    };

    return (
        <>
            {/* Signing Out Full-Screen Overlay */}
            {isSigningOut && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="flex flex-col items-center gap-5">
                        {/* Animated spinner */}
                        <div className="relative w-14 h-14">
                            <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
                            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white animate-spin" />
                            <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-red-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                        </div>
                        <div className="text-center">
                            <p className="text-white text-lg font-semibold tracking-tight">Signing out...</p>
                            <p className="text-white/50 text-sm mt-1">Clearing your session</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Sign Out Confirmation Dialog */}
            {showConfirm && createPortal(
                <div
                    className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className={cn(
                            "relative w-[380px] rounded-[28px] p-8 shadow-2xl border animate-scale-in transition-all duration-500",
                            isDark
                                ? "bg-[#121214] border-white/5 shadow-black/50"
                                : "bg-white border-gray-200/50 shadow-xl shadow-gray-200/50"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-5">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm",
                                isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                            )}>
                                <LogOut className={cn("w-5 h-5", isDark ? "text-white/70" : "text-gray-700")} />
                            </div>
                        </div>

                        {/* Text */}
                        <h3 className={cn(
                            "text-center text-lg font-bold mb-1.5 tracking-tight",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            Sign out?
                        </h3>
                        <p className={cn(
                            "text-center text-sm mb-7",
                            isDark ? "text-zinc-400" : "text-gray-500"
                        )}>
                            You'll need to sign in again to access your dashboard.
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className={cn(
                                    "flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border",
                                    isDark
                                        ? "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10"
                                        : "bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-gray-200"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:-translate-y-0.5"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <SidebarMenuItem>
                <div className={cn(
                    "flex items-center gap-3 px-2 py-2",
                    state === "collapsed" && "justify-center"
                )}>
                    {avatarUrl ? (
                        <div className="w-8 h-8 shrink-0 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] rounded-full overflow-hidden ring-1 ring-white/10 relative">
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className={cn(
                            "w-8 h-8 shrink-0 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] rounded-full flex items-center justify-center text-xs font-bold",
                            isDark ? "bg-white/10 text-white/70" : "bg-black/10 text-black/70"
                        )}>
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {state !== "collapsed" && (
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-medium truncate", isDark ? "text-white/80" : "text-black/80")}>
                                {displayName}
                            </p>
                            {email && (
                                <p className={cn("text-[10px] truncate", isDark ? "text-white/40" : "text-black/40")}>
                                    {email}
                                </p>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => setShowConfirm(true)}
                        className={cn(
                            "p-1.5 rounded-md transition-colors flex-shrink-0",
                            isDark
                                ? "text-white/40 hover:text-red-400 hover:bg-red-500/10"
                                : "text-black/40 hover:text-red-500 hover:bg-red-500/10",
                            state === "collapsed" && "hidden"
                        )}
                        title="Sign out"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </SidebarMenuItem>
        </>
    );
}
