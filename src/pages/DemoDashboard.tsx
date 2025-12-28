import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '../components/AppSidebar';
import { DemoCallProvider } from '../contexts/DemoCallContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../hooks/useTheme';
import KnowledgeBase from '../components/DemoCall/KnowledgeBase';
import CallHistoryList from '../components/DemoCall/CallHistoryList';
import GroqSettingsPage from '../components/DemoCall/GroqSettings';
import TopBanner from '../components/Layout/TopBanner';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

// Dashboard Views
import UsageView from '../components/DashboardViews/UsageView';
import BillingView from '../components/DashboardViews/BillingView';
import KeysView from '../components/DashboardViews/KeysView';
import MonitorView from '../components/DashboardViews/MonitorView';

function DemoDashboardContent() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('monitor');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get tab label using translation keys matching the sidebar
  const getTabLabel = (tab: string): string => {
    const labelMap: Record<string, string> = {
      monitor: t('dashboard.tab.monitor'),
      history: t('history.title'),
      knowledge: t('config.title'),
      system_prompt: t('sidebar.systemPrompt'),
      ai_voice: t('sidebar.aiVoice'),
      context_fields: t('sidebar.contextFields'),
      categories: t('sidebar.categories'),
      priority_rules: t('sidebar.priorityRules'),
      instructions: t('sidebar.instructions'),
      groq_settings: t('sidebar.groqAi'),
      usage: 'Usage',
      billing: 'Billing',
      keys: 'API Keys',
    };
    return labelMap[tab] || tab;
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className={cn(
        "flex min-h-screen w-full",
        isDark ? "bg-[#0A0A0A]" : "bg-gray-50"
      )}>
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Sticky Header Container */}
          <div className="sticky top-0 z-[200] w-full flex flex-col">
            <TopBanner />
            {/* Top Bar with Trigger */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3 border-b backdrop-blur-md",
              isDark ? "bg-[rgb(10,10,10)]/80 border-white/10" : "bg-white/80 border-black/10"
            )}>
              <div className="flex items-center gap-4">
                <SidebarTrigger className={isDark ? "text-white" : "text-black"} />
                <h1 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-black")}>
                  {getTabLabel(activeTab)}
                </h1>
                <button
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/10 text-black/60"
                  )}
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <a
                href="/docs"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
                )}
              >
                Docs
              </a>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
            <div className="max-w-7xl mx-auto w-full pb-10">
              {/* Dynamically render content based on activeTab */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'monitor' && <MonitorView isDark={isDark} />}

                {activeTab === 'history' && <CallHistoryList isDark={isDark} />}

                {/* Knowledge Base Sections */}
                {activeTab === 'knowledge' && <KnowledgeBase isDark={isDark} activeSection="prompt" />}
                {activeTab === 'system_prompt' && <KnowledgeBase isDark={isDark} activeSection="prompt" />}
                {activeTab === 'ai_voice' && <KnowledgeBase isDark={isDark} activeSection="voice" />}
                {activeTab === 'context_fields' && <KnowledgeBase isDark={isDark} activeSection="fields" />}
                {activeTab === 'categories' && <KnowledgeBase isDark={isDark} activeSection="categories" />}
                {activeTab === 'priority_rules' && <KnowledgeBase isDark={isDark} activeSection="rules" />}
                {activeTab === 'instructions' && <KnowledgeBase isDark={isDark} activeSection="instructions" />}

                {activeTab === 'groq_settings' && <GroqSettingsPage isDark={isDark} />}

                {/* New Account Sections */}
                {activeTab === 'usage' && <UsageView isDark={isDark} />}
                {activeTab === 'billing' && <BillingView isDark={isDark} />}
                {activeTab === 'keys' && <KeysView isDark={isDark} />}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function DemoDashboard() {
  return (
    <DemoCallProvider>
      <DemoDashboardContent />
    </DemoCallProvider>
  );
}
