import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, LayoutDashboard, Copy, Check } from 'lucide-react';

type TabType = 'curl' | 'dashboard';

export default function CodeDemoSection() {
    const [activeTab, setActiveTab] = useState<TabType>('curl');
    const [copied, setCopied] = useState(false);

    const curlCode = `curl -X POST "https://api.clerktree.com/v1/agents" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "ClerkTree Voice Assistant",
    "voice": "nova",
    "capabilities": ["booking", "faqs"],
    "knowledge_base": "kb_prod_94812"
  }'`;

    const dashboardCode = `{
  "agent_id": "agt_live_93j2a",
  "status": "active",
  "recent_calls": 142,
  "average_duration": "4m 12s",
  "success_rate": "98.4%",
  "latest_transcripts": [
    "user: I'd like to book a table for 4",
    "agent: Certainly, for what time?",
    "user: 7 PM tonight",
    "agent: Perfect, your table is booked."
  ]
}`;

    const handleCopy = () => {
        const textToCopy = activeTab === 'curl' ? curlCode : dashboardCode;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative px-6 py-20 bg-[rgb(10,10,10)]">
            <div className="max-w-[1100px] mx-auto">

                {/* Outer Container */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#121214] overflow-hidden shadow-2xl p-1.5 sm:p-2">

                    {/* Top Nav Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 sm:p-4 mb-2">

                        {/* Logo/Brand */}
                        <div className="flex items-center gap-2 pl-2">
                            <svg viewBox="0 0 464 468" className="w-5 h-5">
                                <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
                            </svg>
                            <span className="font-semibold text-white tracking-wide text-[15px]">ClerkTree</span>
                        </div>

                        {/* Buttons (curl, dashboard) */}
                        <div className="flex bg-[#1A1A1C] p-1.5 rounded-xl border border-white/[0.04]">
                            <button
                                onClick={() => setActiveTab('curl')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'curl'
                                        ? 'bg-[#FFB86C] text-[#121214] shadow-[0_2px_8px_rgba(255,184,108,0.25)]'
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Terminal className="w-4 h-4" /> cURL API
                            </button>
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'dashboard'
                                        ? 'bg-[#FFB86C] text-[#121214] shadow-[0_2px_8px_rgba(255,184,108,0.25)]'
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 p-1">
                        {/* Code / Content Area (Left) */}
                        <div className="relative flex-[1.5] bg-[#0A0A0C] border border-white/[0.04] rounded-xl p-8 overflow-x-auto min-h-[400px]">

                            <button
                                onClick={handleCopy}
                                className="absolute top-6 right-6 flex items-center gap-2 px-3 py-2 bg-[#1A1A1C] hover:bg-[#252528] text-white/70 hover:text-white rounded-lg transition-colors text-xs font-semibold border border-white/10"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy Code'}
                            </button>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                    className="font-mono text-[14px] leading-[1.7] mt-12 sm:mt-8"
                                >
                                    {activeTab === 'curl' ? (
                                        <pre className="text-[#F8F8F2] whitespace-pre-wrap">
                                            <span className="text-[#FF79C6]">curl</span> -X POST <span className="text-[#F1FA8C]">"https://api.clerktree.com/v1/agents"</span> \
                                            <br />  -H <span className="text-[#F1FA8C]">"Authorization: Bearer YOUR_API_KEY"</span> \
                                            <br />  -H <span className="text-[#F1FA8C]">"Content-Type: application/json"</span> \
                                            <br />  -d <span className="text-[#F1FA8C]">{`'{
    "name": "ClerkTree Voice Assistant",
    "voice": "nova",
    "capabilities": ["booking", "faqs"],
    "knowledge_base": "kb_prod_94812"
  }'`}</span>
                                        </pre>
                                    ) : (
                                        <pre className="text-[#F8F8F2] whitespace-pre-wrap">
                                            <span className="text-[#FF79C6]">{"{"}</span>
                                            <br />  <span className="text-[#50FA7B]">"agent_id"</span>: <span className="text-[#F1FA8C]">"agt_live_93j2a"</span>,
                                            <br />  <span className="text-[#50FA7B]">"status"</span>: <span className="text-[#F1FA8C]">"active"</span>,
                                            <br />  <span className="text-[#50FA7B]">"recent_calls"</span>: <span className="text-[#BD93F9]">142</span>,
                                            <br />  <span className="text-[#50FA7B]">"success_rate"</span>: <span className="text-[#F1FA8C]">"98.4%"</span>,
                                            <br />  <span className="text-[#50FA7B]">"latest_transcript"</span>: <span className="text-[#FF79C6]">{"["}</span>
                                            <br />    <span className="text-[#F1FA8C]">  "user: I'd like to book a table for 4"</span>,
                                            <br />    <span className="text-[#F1FA8C]">  "agent: Certainly, for what time?"</span>,
                                            <br />    <span className="text-[#F1FA8C]">  "user: 7 PM tonight"</span>,
                                            <br />    <span className="text-[#F1FA8C]">  "agent: Perfect, your table is booked."</span>
                                            <br />  <span className="text-[#FF79C6]">]</span>
                                            <br /><span className="text-[#FF79C6]">{"}"}</span>
                                        </pre>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Explanation Area (Right) */}
                        <div className="flex-1 shrink-0 bg-[#0A0A0C] border border-white/[0.04] rounded-xl p-8 flex flex-col justify-start">
                            <div className="font-mono text-[14px] leading-[1.8] text-[#6272A4]">
                                <p># ClerkTree Platform</p>
                                <br />
                                <p># AI agents query ClerkTree to retrieve relevant context from your knowledge base and act on live systems in a single phone call.</p>
                                <br />
                                <p># Integration</p>
                                <br />
                                <p># To connect your backend with ClerkTree Voice Agents, you can seamlessly plug our webhook into your system or sync files securely onto our EU servers.</p>
                                <br />
                                <p className="mt-8 flex items-center gap-2 text-[#8BE9FD] group">
                                    <span className="text-xl leading-none transition-transform group-hover:translate-x-1">→</span>
                                    <a href="/docs" className="hover:underline underline-offset-4 cursor-pointer">
                                        Read more on docs.clerktree.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </section >
    );
}
