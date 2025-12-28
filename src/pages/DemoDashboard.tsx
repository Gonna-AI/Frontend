import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '../components/AppSidebar';
import { DemoCallProvider } from '../contexts/DemoCallContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../hooks/useTheme';
import KnowledgeBase from '../components/DemoCall/KnowledgeBase';
import CallHistoryList from '../components/DemoCall/CallHistoryList';
import GroqSettingsPage from '../components/DemoCall/GroqSettings';
import TopBanner from '../components/Layout/TopBanner';
import Navbar from "../components/Layout/Header";
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

// Dashboard Views
import UsageView from '../components/DashboardViews/UsageView';
import BillingView from '../components/DashboardViews/BillingView';
import KeysView from '../components/DashboardViews/KeysView';
import MonitorView from '../components/DashboardViews/MonitorView';

function DemoDashboardContent() {
  const { isDark } = useTheme();
  // Subscribe to language changes
  useLanguage();
  const [activeTab, setActiveTab] = useState('monitor');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          <div className="sticky top-0 z-20 w-full flex-col">
            <TopBanner />
            <Navbar onMobileMenuClick={() => setSidebarOpen(!sidebarOpen)} />
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
