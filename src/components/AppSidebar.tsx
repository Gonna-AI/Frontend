import React, { useState } from "react"
import { createPortal } from "react-dom"
import {
    Phone,
    History,
    Mic,
    Database,
    ListOrdered,
    Scroll,
    Tags,
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
    Users,
    Wand2
} from "lucide-react"

import { useTheme } from "@/hooks/useTheme"

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
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/utils/cn"
import { useLanguage } from "@/contexts/LanguageContext"
import LanguageSwitcher from "./Layout/LanguageSwitcher"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/config/supabase"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    hasAccess?: boolean;
}

// Tabs that are always accessible without an access code
const ALWAYS_ACCESSIBLE_TABS = ['billing', 'keys', 'usage'];

export function AppSidebar({ activeTab, setActiveTab, hasAccess = false, ...props }: AppSidebarProps) {
    const { t, language, setLanguage } = useLanguage();
    const { state, isMobile } = useSidebar();
    const { isDark, toggleTheme } = useTheme();

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
                                    tooltip={t('dashboard.tab.monitor')}
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
                                    tooltip={t('dashboard.tab.config')}
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
                                    tooltip={t('dashboard.tab.history')}
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
                            {/* Setup Wizard */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'onboarding'}
                                    onClick={() => handleTabClick('onboarding')}
                                    tooltip={t('onboarding.title')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Wand2 className="text-purple-400" />
                                    <span>{t('onboarding.title')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

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

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className={isDark ? "bg-white/10" : "bg-black/5"} />

                {/* Account Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className={isDark ? "text-white/60" : "text-black/60"}>{t('sidebar.account')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className={getLockedStyles('usage')}>
                                <SidebarMenuButton
                                    isActive={activeTab === 'usage'}
                                    onClick={() => handleTabClick('usage')}
                                    tooltip={t('sidebar.usage')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <BarChart />
                                    <span>{t('sidebar.usage')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'billing'}
                                    onClick={() => handleTabClick('billing')}
                                    tooltip={t('sidebar.billing')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <CreditCard />
                                    <span>{t('sidebar.billing')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'keys'}
                                    onClick={() => handleTabClick('keys')}
                                    tooltip={t('sidebar.keys')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Key />
                                    <span>{t('sidebar.keys')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className={getLockedStyles('team')}>
                                <SidebarMenuButton
                                    isActive={activeTab === 'team'}
                                    onClick={() => handleTabClick('team')}
                                    tooltip={t('sidebar.team')}
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
                            <SidebarMenuItem className={getLockedStyles('integrations')}>
                                <SidebarMenuButton
                                    isActive={activeTab === 'integrations'}
                                    onClick={() => handleTabClick('integrations')}
                                    tooltip={t('sidebar.integrations')}
                                    className={cn(
                                        "transition-colors",
                                        isDark
                                            ? "text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-black/5 data-[active=true]:bg-black/5 data-[active=true]:text-black"
                                    )}
                                >
                                    <Link2 />
                                    <span>{t('sidebar.integrations')}</span>
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
                                            <span>{isDark ? t('sidebar.darkMode') : t('sidebar.lightMode')}</span>
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
                                    <span>{isDark ? t('sidebar.darkMode') : t('sidebar.lightMode')}</span>
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
    const { t } = useLanguage();
    const { user } = useAuth();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    if (!user) return null;

    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const email = user.email;

    const handleSignOut = async () => {
        setShowConfirm(false);
        setIsSigningOut(true);

        // ─── schedule a hard redirect as a safety net ───────────────
        // If anything below hangs or the component unmounts, this
        // guarantees the user lands on /login within 4 seconds.
        const safetyTimer = setTimeout(() => {
            window.location.href = '/login';
        }, 4000);

        try {
            // 1. Clear app-specific localStorage data (PII, configs)
            const keysToRemove: string[] = [];
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

            // 2. Attempt to sign out from Supabase — with a 3s timeout
            //    so we don't hang forever on slow/dead network
            try {
                await Promise.race([
                    supabase.auth.signOut(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Sign-out timed out')), 3000)
                    ),
                ]);
            } catch (err) {
                console.warn('Sign out API call failed/timed out, clearing session locally:', err);
            }

            // 3. Nuke ALL Supabase auth keys from storage to guarantee
            //    the session is fully destroyed locally
            const authKeysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                    authKeysToRemove.push(key);
                }
            }
            authKeysToRemove.forEach(key => localStorage.removeItem(key));

            // Also clear sessionStorage (PKCE code verifiers, etc.)
            for (let i = sessionStorage.length - 1; i >= 0; i--) {
                const key = sessionStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                    sessionStorage.removeItem(key);
                }
            }
        } catch (err) {
            console.error('Sign out exception:', err);
        } finally {
            // Cancel the safety timer — we're redirecting now
            clearTimeout(safetyTimer);
            // Brief visual delay so the user sees the spinner
            await new Promise(resolve => setTimeout(resolve, 400));
            window.location.href = '/login';
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
                            <p className="text-white text-lg font-semibold tracking-tight">{t('sidebar.signingOut')}</p>
                            <p className="text-white/50 text-sm mt-1">{t('sidebar.clearingSession')}</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Sign Out Confirmation Dialog */}
            {showConfirm && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center animate-fade-in">
                    {/* Backdrop — separate element so its click doesn't bubble into dialog */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowConfirm(false)}
                    />
                    {/* Dialog — elevated above backdrop */}
                    <div
                        className={cn(
                            "relative z-10 w-[380px] rounded-[28px] p-8 shadow-2xl border animate-scale-in",
                            isDark
                                ? "bg-[#121214] border-white/5 shadow-black/50"
                                : "bg-white border-gray-200/50 shadow-xl shadow-gray-200/50"
                        )}
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
                            {t('sidebar.confirmSignOutTitle')}
                        </h3>
                        <p className={cn(
                            "text-center text-sm mb-7",
                            isDark ? "text-zinc-400" : "text-gray-500"
                        )}>
                            {t('sidebar.confirmSignOutMessage')}
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
                                {t('sidebar.cancel')}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
                                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:-translate-y-0.5"
                            >
                                {t('sidebar.signOut')}
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
                                : "text-black/40 hover:text-red-500 hover:bg-red-500/10"
                        )}
                        title={t('sidebar.signOut')}
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </SidebarMenuItem>
        </>
    );
}
