import React, { useState, useEffect } from "react"
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
    Key,
    BarChart,
    Sun,
    Moon
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
import UserSessionSwitcher from "./DemoCall/UserSessionSwitcher"
import LanguageSwitcher from "./Layout/LanguageSwitcher"
import { useDemoCall } from "@/contexts/DemoCallContext"

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
}

export function AppSidebar({ activeTab, setActiveTab, ...props }: AppSidebarProps) {
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
                <SidebarGroup>
                    <SidebarGroupLabel className={isDark ? "text-white/60" : "text-black/60"}>{t('sidebar.platform')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'monitor'}
                                    onClick={() => setActiveTab('monitor')}
                                    tooltip="Monitor"
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
                                    onClick={() => setActiveTab('knowledge')}
                                    tooltip="Configuration"
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
                                    onClick={() => setActiveTab('history')}
                                    tooltip="History"
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
                <SidebarGroup>
                    <SidebarGroupLabel className={isDark ? "text-white/60" : "text-black/60"}>{t('sidebar.aiBehavior')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Model Selection */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'groq_settings'}
                                    onClick={() => setActiveTab('groq_settings')}
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
                                    onClick={() => setActiveTab('system_prompt')}
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
                                    onClick={() => setActiveTab('ai_voice')}
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
                                    onClick={() => setActiveTab('context_fields')}
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
                                    onClick={() => setActiveTab('categories')}
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
                                    onClick={() => setActiveTab('priority_rules')}
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
                                    onClick={() => setActiveTab('instructions')}
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
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'usage'}
                                    onClick={() => setActiveTab('usage')}
                                    className="text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                >
                                    <BarChart />
                                    <span>Usage</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'billing'}
                                    onClick={() => setActiveTab('billing')}
                                    className="text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                >
                                    <CreditCard />
                                    <span>Billing</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'keys'}
                                    onClick={() => setActiveTab('keys')}
                                    className="text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                                >
                                    <Key />
                                    <span>Keys</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>


            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={toggleTheme}
                            className={cn(
                                "justify-between",
                                isDark
                                    ? "text-white/70 hover:text-white hover:bg-white/10"
                                    : "text-black/70 hover:text-black hover:bg-black/5"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
                            </div>
                            <div className={cn(
                                "text-xs px-1.5 py-0.5 rounded-md font-medium border",
                                isDark ? "bg-white/10 border-white/10 text-white/50" : "bg-black/5 border-black/5 text-black/50"
                            )}>
                                {isDark ? "ON" : "OFF"}
                            </div>
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
                    <SidebarMenuItem>
                        <UserSessionSwitcher
                            isDark={isDark}
                            currentUserId={getCurrentUserId()}
                            onSessionChange={switchSession}
                            currentConfig={knowledgeBase as unknown as Record<string, unknown>}
                            onSaveSession={saveKnowledgeBase}
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
