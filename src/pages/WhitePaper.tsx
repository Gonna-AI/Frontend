import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, ArrowUpRight, ChevronRight, FileText } from 'lucide-react';

export default function WhitePaper() {
    const [activeSection, setActiveSection] = useState('executive-summary');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sections = [
        { id: 'executive-summary', title: '1. Executive Summary' },
        { id: 'problem-statement', title: '2. The Problem We Are Solving' },
        { id: 'how-are-we-novel', title: '3. How Are We Novel?' },
        { id: 'proposed-ideas', title: '4. Proposed Novel Ideas' },
    ];

    // Scroll spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );

        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollTo = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#0A0D10] text-[#B0B8C4] font-sans">
            {/* Navbar matching Base UI style */}
            <header className="fixed top-0 left-0 right-0 h-14 border-b border-[#1E2530] bg-[#0A0D10]/80 backdrop-blur-md z-50 flex items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-[#B0B8C4] hover:text-white">
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link to="/" className="flex items-center gap-2 text-white font-semibold">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#007FFF] to-[#0059B2] rounded-md flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        Base UI clone for ClerkTree
                    </Link>
                    <div className="hidden lg:flex items-center ml-4 gap-1 text-sm text-[#9DA8B7]">
                        <span className="cursor-pointer hover:text-white transition-colors bg-[#171D26] px-2 py-1 rounded-md">Docs</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Components</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 bg-[#171D26] border border-[#1E2530] rounded-md px-3 py-1.5 text-sm text-[#9DA8B7] w-64 cursor-text">
                        <Search className="w-4 h-4" />
                        <span>Search...</span>
                        <span className="ml-auto text-xs border border-[#1E2530] rounded px-1">⌘K</span>
                    </div>
                    <Link to="/" className="text-sm font-medium text-white bg-[#007FFF] hover:bg-[#0059B2] px-3 py-1.5 rounded-md transition-colors">
                        Back to App
                    </Link>
                </div>
            </header>

            <div className="pt-14 flex max-w-[1440px] mx-auto min-h-screen">
                {/* Left Sidebar */}
                <aside className={`fixed lg:static top-14 bottom-0 left-0 z-40 w-64 border-r border-[#1E2530] bg-[#0A0D10] overflow-y-auto transform transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="p-4">
                        <div className="mb-6">
                            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Overview</h4>
                            <ul className="space-y-1">
                                <li>
                                    <button onClick={() => scrollTo('executive-summary')} className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${activeSection === 'executive-summary' ? 'bg-[#171D26] text-[#66B2FF] font-medium' : 'text-[#B0B8C4] hover:bg-[#11161D] hover:text-white'}`}>
                                        <FileText className="w-4 h-4" />
                                        Whitepaper
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 px-6 lg:px-12 py-10 lg:py-16 overflow-y-auto w-full lg:max-w-4xl">
                    <div className="text-sm text-[#007FFF] font-semibold tracking-wide uppercase mb-3">OVERVIEW</div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">ClerkTree Whitepaper</h1>
                    <p className="text-lg text-[#B0B8C4] mb-12 leading-relaxed max-w-2xl">
                        The Future of Operations Intelligence (OpsIntel) & Hyper-Local AI. Unveiling our vision for bridging the gap between complex operations and frontier AI.
                    </p>

                    <div className="space-y-20">
                        {/* Section 1 */}
                        <section id="executive-summary" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                1. Executive Summary
                                <a href="#executive-summary" className="opacity-0 group-hover:opacity-100 text-[#007FFF]">#</a>
                            </h2>
                            <p className="leading-relaxed mb-4 text-[#B0B8C4]">
                                ClerkTree is an Enterprise AI Platform designed to bridge the gap between complex backend operations (legal, claims processing, document review) and frontend customer engagement (hyper-local business operations).
                            </p>
                            <p className="leading-relaxed text-[#B0B8C4]">
                                By leveraging advanced Operations Intelligence (OpsIntel), ClerkTree empowers businesses to automate routine tasks, achieve faster processing times (up to 40%), and deliver 24/7 human-like conversational voice and chat support. Our mission is to transform how organizations handle their internal operations and external communications through intelligent, accessible automation.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section id="problem-statement" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-white mb-6">2. The Problem We Are Solving</h2>
                            <p className="mb-6 text-[#B0B8C4]">Businesses today face major bottlenecks that severely impact ROI and customer satisfaction:</p>

                            <div className="space-y-4">
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 hover:border-[#303B4D] transition-colors">
                                    <h3 className="text-white font-semibold mb-2">1. Backend Inefficiencies</h3>
                                    <p className="text-[#9DA8B7] text-sm leading-relaxed">Legal and claims operations are notoriously burdened by manual document review, leading to slow processing times, high error rates, and astronomical operational costs.</p>
                                </div>
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 hover:border-[#303B4D] transition-colors">
                                    <h3 className="text-white font-semibold mb-2">2. Frontend Communication Gaps</h3>
                                    <p className="text-[#9DA8B7] text-sm leading-relaxed">Local businesses (retail, restaurants, sales, salons) constantly miss calls and leads due to staff unavailability. Traditional receptionists are expensive, and rigid IVR systems frustrate customers.</p>
                                </div>
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 hover:border-[#303B4D] transition-colors">
                                    <h3 className="text-white font-semibold mb-2">3. High Barrier to Entry for AI</h3>
                                    <p className="text-[#9DA8B7] text-sm leading-relaxed">Setting up a functional, knowledgeable AI agent requires technical expertise that most small business owners lack, preventing them from adopting transformational technology.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section id="how-are-we-novel" className="scroll-mt-24 border-t border-[#1E2530] pt-16">
                            <h2 className="text-2xl font-bold text-white mb-6">3. How Are We Novel?</h2>
                            <p className="mb-8 text-[#B0B8C4]">ClerkTree's novelty lies in its dual-pronged approach, robust developer API, and focus on extreme accessibility for business owners:</p>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-white font-medium text-lg mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#007FFF]" />
                                        Comprehensive Developer API & Edge Infrastructure
                                    </h3>
                                    <p className="text-[#9DA8B7] leading-relaxed pl-3 border-l-2 border-[#1E2530] ml-[3px]">
                                        Built on high-performance Supabase Edge Functions, ClerkTree offers a rich set of APIs for both developers and enterprise use cases. This includes real-time streaming chat completions, programmatic outbound voice call initiation with dynamic context injection, and real-time dashboard analytics (sentiment, interest level, extraction of action items).
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-lg mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#007FFF]" />
                                        Conversational AI Onboarding Wizard
                                    </h3>
                                    <p className="text-[#9DA8B7] leading-relaxed pl-3 border-l-2 border-[#1E2530] ml-[3px]">
                                        We completely remove the technical friction of deploying AI. Our unique "Onboarding Wizard" allows non-technical business owners to configure their AI Receptionist simply by chatting with an AI and uploading their existing FAQs, menus, or CSVs. The Wizard automatically translates this unstructured conversational context into a strict deployment configuration—generating the Agent's Persona, Greeting, Context Fields, Categories, and Priority Rules dynamically. With one click, this configuration deploys directly to the live edge network.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-lg mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#007FFF]" />
                                        Real-Time Analytics & Lead Enrichment
                                    </h3>
                                    <p className="text-[#9DA8B7] leading-relaxed pl-3 border-l-2 border-[#1E2530] ml-[3px]">
                                        Our platform automatically enriches every interaction. Calls and chats are transcribed and analyzed in real-time, outputting structured data such as sentiment analysis (positive/neutral/negative), conversation categories (e.g., sales_followup), and extracted action items. These are fed instantly into a live, actionable dashboard.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section id="proposed-ideas" className="scroll-mt-24 border-t border-[#1E2530] pt-16">
                            <h2 className="text-2xl font-bold text-white mb-6">4. Proposed Novel Ideas to Add to the Startup</h2>
                            <p className="mb-8 text-[#B0B8C4]">To further differentiate ClerkTree and solidify its unique market position, we should explore integrating the following advanced AI features into our receptionist and operations pipeline:</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 group cursor-pointer hover:border-[#66B2FF] transition-colors">
                                    <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                                        A. Proactive Engagement & Intent Prediction
                                        <ArrowUpRight className="w-4 h-4 text-[#434D5B] group-hover:text-[#66B2FF] transition-colors" />
                                    </h4>
                                    <p className="text-[#9DA8B7] text-sm">Implement an SMS/Voice fallback that automatically reaches out to customers who abandoned a booking form or an inquiry midway. The AI can also send personalized follow-ups and automated appointment reminders to drastically reduce no-shows.</p>
                                </div>
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 group cursor-pointer hover:border-[#66B2FF] transition-colors">
                                    <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                                        B. Empathy-Driven Sentiment Routing
                                        <ArrowUpRight className="w-4 h-4 text-[#434D5B] group-hover:text-[#66B2FF] transition-colors" />
                                    </h4>
                                    <p className="text-[#9DA8B7] text-sm">Integrate real-time emotion/sentiment detection during voice calls. If a caller sounds frustrated, the AI immediately upgrades the call's priority and seamlessly routes it to a human supervisor.</p>
                                </div>
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 group cursor-pointer hover:border-[#66B2FF] transition-colors">
                                    <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                                        C. Deep Operational "Action" Integrations
                                        <ArrowUpRight className="w-4 h-4 text-[#434D5B] group-hover:text-[#66B2FF] transition-colors" />
                                    </h4>
                                    <p className="text-[#9DA8B7] text-sm">Enable "Action Hooks" in our Edge Functions where the AI can securely process payments over the phone via PCI-compliant links, or interact directly with backend POS systems in real-time.</p>
                                </div>
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 group cursor-pointer hover:border-[#66B2FF] transition-colors">
                                    <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                                        D. "Shadow Mode" Learning Algorithm
                                        <ArrowUpRight className="w-4 h-4 text-[#434D5B] group-hover:text-[#66B2FF] transition-colors" />
                                    </h4>
                                    <p className="text-[#9DA8B7] text-sm">The AI runs silently alongside human workers for document ops. Once it hits a highly accurate confidence threshold natively matching human decisions, it autonomously takes over.</p>
                                </div>
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 group cursor-pointer hover:border-[#66B2FF] transition-colors">
                                    <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                                        E. Multi-Agent Collaboration
                                        <ArrowUpRight className="w-4 h-4 text-[#434D5B] group-hover:text-[#66B2FF] transition-colors" />
                                    </h4>
                                    <p className="text-[#9DA8B7] text-sm">Create specialized micro-agents that seamlessly transfer context. Receptionist answers to qualify, Booking Agent handles the scheduling, creating an illusion of departments.</p>
                                </div>
                                <div className="bg-[#11161D] border border-[#1E2530] rounded-xl p-6 group cursor-pointer hover:border-[#66B2FF] transition-colors">
                                    <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                                        F. Hyper-Local Voice Cloning
                                        <ArrowUpRight className="w-4 h-4 text-[#434D5B] group-hover:text-[#66B2FF] transition-colors" />
                                    </h4>
                                    <p className="text-[#9DA8B7] text-sm">Allow business owners to lightly clone their own voice to preserve a highly personal local touch instead of using a generic synthetic voice.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-24 pt-8 border-t border-[#1E2530] flex items-center justify-between">
                        <p className="text-[#9DA8B7] text-sm">Was this page helpful?</p>
                        <div className="flex gap-2 text-sm font-medium">
                            <button className="px-3 py-1 bg-[#171D26] hover:bg-[#1E2530] text-white rounded-md border border-[#303B4D] transition-colors">Yes</button>
                            <button className="px-3 py-1 bg-[#171D26] hover:bg-[#1E2530] text-white rounded-md border border-[#303B4D] transition-colors">No</button>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar (Table of Contents) */}
                <aside className="hidden xl:block w-64 pt-16 px-6 border-l border-[#1E2530]">
                    <h4 className="text-sm font-semibold text-white mb-4">On this page</h4>
                    <ul className="space-y-3">
                        {sections.map((s) => (
                            <li key={s.id}>
                                <button
                                    onClick={() => scrollTo(s.id)}
                                    className={`text-sm text-left w-full hover:text-white transition-colors ${activeSection === s.id ? 'text-[#007FFF] font-medium' : 'text-[#9DA8B7]'}`}
                                >
                                    {s.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>
        </div>
    );
}
