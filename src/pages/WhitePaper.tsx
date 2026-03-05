import { useState, useEffect } from 'react';
import { ChevronRight, Hash } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { ScrollArea } from '@base-ui/react/scroll-area';
import { Accordion } from '@base-ui/react/accordion';

import SharedHeader from '../components/Layout/SharedHeader';

export default function WhitePaper() {
    const { isDark } = useTheme();
    const [activeSection, setActiveSection] = useState('executive-summary');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sections = [
        {
            group: 'Core Thesis',
            items: [
                { id: 'executive-summary', title: 'Executive Summary', level: 1 },
                { id: 'operational-disconnect', title: 'The Operational Disconnect', level: 2 },
            ]
        },
        {
            group: 'The ClerkTree Architecture',
            items: [
                { id: 'edge-compute-paradigm', title: 'Edge Computing Paradigm', level: 1 },
            ]
        },
        {
            group: 'Methodology & Novelty',
            items: [
                { id: 'the-clerktree-methodology', title: 'Methodological Approach', level: 1 },
            ]
        },
        {
            group: 'Evolutionary Trajectory',
            items: [
                { id: 'autonomous-closed-loop', title: 'Autonomous Closed-Loop Future', level: 1 },
                { id: 'multi-agent-collaboration', title: 'Multi-Agent Symbiosis', level: 2 },
            ]
        }
    ];

    const flatSections = sections.flatMap(s => s.items);

    // Scroll spy for Table of Contents
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter(e => e.isIntersecting);
                if (visibleEntries.length > 0) {
                    visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                    setActiveSection(visibleEntries[0].target.id);
                }
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );

        flatSections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100; // Account for fixed header
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    // Base UI exact styling approximation
    // Light Mode: bg white, text #1C2025, borders #E5EAF2, blue #006FEE
    // Dark Mode: bg #0B0D14, text #B2BAC2, borders #1E2530, blue #338EF7

    return (
        <div className={`min-h-screen font-sans selection:bg-blue-500/30 ${isDark ? 'bg-[#0B0D14] text-[#B2BAC2]' : 'bg-white text-[#1C2025]'}`}>

            <SharedHeader />

            <div className="flex max-w-[1440px] mx-auto pt-14">

                {/* Left Navigation Sidebar - Base UI Accordion */}
                <aside className={`fixed md:sticky top-14 left-0 h-[calc(100vh-3.5rem)] z-40 w-[240px] md:w-[260px] border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${isDark ? 'bg-[#0B0D14] border-[#1E2530]' : 'bg-white border-[#E5EAF2]'}`}>

                    <ScrollArea.Root className="w-full h-full overflow-hidden">
                        <ScrollArea.Viewport className="w-full h-full outline-none pt-6 pb-20">
                            <div className="px-4">
                                <Accordion.Root defaultValue={sections.map(s => s.group)}>
                                    {sections.map((sectionGroup) => (
                                        <Accordion.Item key={sectionGroup.group} value={sectionGroup.group} className="mb-1">
                                            <Accordion.Header>
                                                <Accordion.Trigger className={`w-full flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold tracking-wide transition-colors ${isDark ? 'text-white hover:bg-white/5' : 'text-[#1C2025] hover:bg-slate-50'
                                                    } rounded-md group`}>
                                                    {sectionGroup.group}
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-50 transition-transform duration-200 group-data-[panel-open]:rotate-90" />
                                                </Accordion.Trigger>
                                            </Accordion.Header>
                                            <Accordion.Panel className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                                                <div className="pb-1 pt-0.5">
                                                    {sectionGroup.items.map((item) => {
                                                        const isActive = activeSection === item.id;
                                                        return (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => scrollTo(item.id)}
                                                                className={`w-full text-left px-3 py-1.5 ml-1 my-0.5 rounded-md text-[14px] transition-colors relative ${isActive
                                                                    ? (isDark ? 'bg-[#006FEE]/10 text-[#338EF7] font-medium' : 'bg-blue-50 text-[#006FEE] font-medium')
                                                                    : (isDark ? 'text-[#B2BAC2] hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-[#1C2025] hover:bg-slate-50')
                                                                    } `}
                                                            >
                                                                {isActive && (
                                                                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-r-full ${isDark ? 'bg-[#338EF7]' : 'bg-[#006FEE]'}`} />
                                                                )}
                                                                {item.title}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    ))}
                                </Accordion.Root>
                            </div>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar orientation="vertical" className={`flex w-2 touch-none select-none border-l p-[1px] transition-all hover:w-2.5 ${isDark ? 'border-[#1E2530]' : 'border-transparent'}`}>
                            <ScrollArea.Thumb className={`flex-1 rounded-full relative ${isDark ? 'bg-white/20 hover:bg-white/30' : 'bg-black/20 hover:bg-black/30'}`} />
                        </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                </aside>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content Area - Exact Base UI typography approximations */}
                <main className="flex-1 min-w-0 px-5 md:px-10 lg:px-16 py-8 md:py-12 max-w-[860px]">

                    {/* Breadcrumbs */}
                    <nav className={`flex items-center text-[14px] font-medium mb-4 ${isDark ? 'text-[#338EF7]' : 'text-[#006FEE]'}`}>
                        <span className="hover:underline cursor-pointer tracking-tight">ClerkTree</span>
                        <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                        <span className="hover:underline cursor-pointer tracking-tight">Whitepaper</span>
                    </nav>

                    <h1 className={`text-4xl md:text-[40px] font-extrabold tracking-tight mb-4 leading-tight ${isDark ? 'text-white' : 'text-[#1C2025]'}`}>
                        ClerkTree Whitepaper
                    </h1>

                    <p className={`text-[17px] md:text-[19px] leading-relaxed mb-12 font-medium tracking-tight ${isDark ? 'text-[#B2BAC2]' : 'text-slate-600'}`}>
                        The Future of Operations Intelligence (OpsIntel) & Hyper-Local AI. Unveiling our vision for bridging the gap between complex operations and frontier AI.
                    </p>

                    <div className={`w-full h-px mb-12 ${isDark ? 'bg-[#1E2530]' : 'bg-[#E5EAF2]'}`} />

                    <div className="space-y-16">

                        <section id="executive-summary" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? 'text-white' : 'text-[#1C2025]'}`}>
                                <a href="#executive-summary" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-[#338EF7]' : 'text-[#006FEE]'}`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                1. Executive Summary
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 ${isDark ? 'text-[#B2BAC2]' : 'text-slate-700'}`}>
                                <p>
                                    <strong>ClerkTree</strong> is conceptually engineered as an Enterprise AI Platform that aims to obliterate the long-standing chasm between deeply complex backend operations—such as legal case management, dense medical claims processing, and intensive chronological document review—and the fluid, instantaneous demands of frontend customer engagement, characteristic of hyper-local business operations. In the contemporary, hyper-accelerated business environment, the structural inability to fluently connect internal cognitive labor with exterior customer touchpoints creates compounding, systemic inefficiencies that rapidly drain both capital and human morale.
                                </p>
                                <p>
                                    By leveraging a sophisticated orchestration layer we term <strong>Operations Intelligence (OpsIntel)</strong>, ClerkTree empowers businesses of variable scales to achieve autonomous, probabilistic routine task execution. This architectural thesis posits that by correctly structuring unstructured data on ingest, we can accelerate processing cycles by up to 40% while simultaneously achieving a statistical reduction in human fatigue-induced error rates. Furthermore, by seamlessly extending these localized intelligence models into the communication layer, we deliver 24/7 human-like conversational voice, SMS, and chat scaffolding that integrates intrinsically into legacy operations mapping without rewriting underlying CRMs.
                                </p>
                                <p>
                                    Through a radically novel combination of autonomous <strong>LLM-driven workflow execution</strong> embedded onto an inherently low-latency <strong>edge-deployed infrastructure</strong>, ClerkTree operates securely, rapidly, and autonomously. This whitepaper systematically deconstructs our core operational philosophy, examining the deeply rooted systemic structural paradoxes we aim to resolve, articulating our technical architectural heuristics, and delineating the strategic roadmap defining the evolutionary trajectory of the ClerkTree hyper-local intelligence network.
                                </p>
                            </div>
                        </section>

                        <section id="operational-disconnect" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? 'text-white' : 'text-[#1C2025]'}`}>
                                <a href="#operational-disconnect" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-[#338EF7]' : 'text-[#006FEE]'}`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                2. The Operational Disconnect
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 ${isDark ? 'text-[#B2BAC2]' : 'text-slate-700'}`}>
                                <p>
                                    The contemporary commercial infrastructure is hampered by two mutually reinforcing failure vectors: the exhaustion of analytical backend resources traversing unstructured data, and the brittle, unresponsive nature of frontend communication layers. These elements are traditionally isolated from one another in distinct operational silos, forcing a highly inefficient human translation layer.
                                </p>
                                <p>
                                    Operations fundamentally reliant on extensive knowledge work—such as legal discovery, insurance claims forensics, and complex local scheduling algorithms—are notoriously burdened by manual document handling. Highly skilled, high-salary employees are consistently relegated to the monotonous extraction of rigid variables from fluid documents. This manual parsing of unstructured language results in extreme cognitive load, generating a high statistical probability of cumulative fatigue errors while mathematically preventing non-linear scaling. The business becomes physiologically bound by the exact sum of its employees' conscious working hours.
                                </p>
                                <p>
                                    Conversely, on the customer-facing periphery, businesses endure devastating opportunity costs. Ranging from dense enterprise legal firms to localized clinical salons, organizations hemorrhage incoming sales potential when staff are distracted or after-hours constraints apply. Legacy, deterministic IVR (Interactive Voice Response) architectures ("Press 1 for Sales...") are fundamentally hostile to modern consumer neuropsychology, which strictly demands instantaneous, conversational parity. Attempting to augment this gap via entry-level cognitive labor generates extremely high turnover and training overhead. Furthermore, establishing a functional, generative AI agent traditionally necessitates an impenetrable barrier of vector database management, complex orchestration engineering, and rigid systemic integrations—a barrier strictly insurmountable for the mid-market operational managers that require the technology most urgently.
                                </p>
                            </div>
                        </section>

                        <hr className={`border-t ${isDark ? 'border-[#1E2530]' : 'border-[#E5EAF2]'}`} />

                        <section id="edge-compute-paradigm" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? 'text-white' : 'text-[#1C2025]'}`}>
                                <a href="#edge-compute-paradigm" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-[#338EF7]' : 'text-[#006FEE]'}`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                3. Edge Computing Paradigm
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 ${isDark ? 'text-[#B2BAC2]' : 'text-slate-700'}`}>
                                <p>
                                    ClerkTree subverts centralized, latent computational topologies by deploying execution logic directly to globally distributed edge nodes. This architecture is emphatically not an aesthetic decision, but a fundamental physiological necessity if artificial intelligence is to operate at the fluid cadence of human conversation. By positioning conversational acoustic modeling, speech-to-text mapping, and linguistic cognitive generation mere milliseconds structurally away from the client connection, we eradicate the uncanny pause inherent in standard cloud infrastructures.
                                </p>
                                <p>
                                    This proximity to the ingestion point empowers our auditory engine to intelligently replicate the micro-dynamics of human vocal interaction—allowing the AI to autonomously identify user interruption cues, implement conversational back-channeling ("mhmm," "I see"), and instantaneously halt generation threads to process a user's sudden change in topic. This low-latency topology operates harmoniously beneath a layer of incredibly rigid secure enclaves. Because ClerkTree handles highly sensitive data, every enterprise deployment initializes isolated Vector Retrieval-Augmented Generation (RAG) pipelines specific to individual architectural tenants.
                                </p>
                                <p>
                                    Our proprietary Omnichannel Routing Layer synthesizes this immense computational velocity. Whether a user initiates contact via high-definition SIP telephony networks, SMS, or async web protocols, the routing matrix translates the interaction into fundamentally universal, stateless JSON representations of context. This generates true spatial continuity for the customer; an AI agent operating over voice telephony intrinsically comprehends the nuance of an email sent by the same user seventy-two hours prior.
                                </p>
                            </div>
                        </section>

                        <hr className={`border-t ${isDark ? 'border-[#1E2530]' : 'border-[#E5EAF2]'}`} />

                        <section id="the-clerktree-methodology" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? 'text-white' : 'text-[#1C2025]'}`}>
                                <a href="#the-clerktree-methodology" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-[#338EF7]' : 'text-[#006FEE]'}`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                4. Methodological Approach
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 ${isDark ? 'text-[#B2BAC2]' : 'text-slate-700'}`}>
                                <p>
                                    ClerkTree differentiates itself fundamentally not simply via technical velocity, but via a methodological commitment to the absolute eradication of technological friction. This is accomplished via a dual-pronged philosophy: maintaining an uncompromising, brutally robust developer extensibility matrix, perfectly obscured by an interface demanding absolute zero technical fluency from business operators.
                                </p>
                                <p>
                                    For the enterprise deployment tier, the ClerkTree Developer API represents unrestricted architectural latitude. Rejecting the inherently brittle nature of closed SaaS logic chains, enterprise engineers are provided hyper-granular controls, capable of injecting complex, arbitrary Python and Typescript logic dynamically into the generation steps of our underlying agents. Telemetry feeds, real-time localized extraction logs, and webhook subscriptions allow large scale networks to operate ClerkTree not simply as an application layer, but as a foundational infrastructure primitive.
                                </p>
                                <p>
                                    In stark juxtaposition, the Onboarding Wizard constitutes our meta-cognition layer aimed solely at the layman business owner. It entirely obfuscates the reality of prompt engineering, schema classification, and context window mapping. Instead, the owner interacts conversationally with an architect AI, detailing their business policies, scheduling paradigms, and brand voice via natural language. The system autonomously translates this narrative into highly optimized system prompts, constructs an invisible topological knowledge map, and structurally tests the logic pathways—effectively birthing a highly competent production agent without the business owner ever perceiving a single technical mechanism. Furthermore, this agent acts dynamically as an analytical sponge; absorbing real-time communications, classifying the severity, urgency, and core topic in milliseconds, and piping highly structured, enriched JSON payloads into existing CRMs with zero intervention.
                                </p>
                            </div>
                        </section>

                        <hr className={`border-t ${isDark ? 'border-[#1E2530]' : 'border-[#E5EAF2]'}`} />

                        <section id="autonomous-closed-loop" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? 'text-white' : 'text-[#1C2025]'}`}>
                                <a href="#autonomous-closed-loop" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-[#338EF7]' : 'text-[#006FEE]'}`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                5. Autonomous Closed-Loop Future
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 ${isDark ? 'text-[#B2BAC2]' : 'text-slate-700'}`}>
                                <p>
                                    Preserving systemic advantage mandates our aggressive evolution from deterministic interaction towards autonomous, closed-loop operational workflows—a trajectory defined over our immediate 12-24 month operational timeline. The architecture will expand from passively waiting for inquiries into initiating <strong>Proactive Engagement and Rescue</strong> algorithms. If telemetry detects a customer abandoning a highly complex intake form or scheduling process, the engine will autonomously trigger sympathetic outbound SMS or Voice interventions, seamlessly reconstituting the user's abandoned context directly into a conversational interface to achieve conversion finality.
                                </p>
                                <div id="multi-agent-collaboration">
                                    <h4 className={`text-[18px] font-bold tracking-tight mb-3 mt-8 ${isDark ? 'text-white' : 'text-[#1C2025]'}`}>
                                        Multi-Agent Symbiosis & Shadow Analytics
                                    </h4>
                                    <p>
                                        We are actively dissolving the archaic concept of singular monolithic AI processing in favor of distributed, hyper-specialized swarm architectures. As an operational query ingests, a lightweight acoustic/conversational agent acts exclusively as the empathy and routing front door. Should the query necessitate deep legal or policy extraction, it probabilistically spins up and interrogates a secondary "Data Retrieval Micro-Agent" operating purely in the backend, communicating synthetically across sub-cognitive pathways, before translating the ultimate determination back through the vocalization edge interface in real-time.
                                    </p>
                                    <p className="mt-4">
                                        Critically, for stringent sectors like legal underwriting or dense claims calculation, we will deploy these capabilities initially strictly beneath a <strong>"Shadow Mode" Algorithm</strong>. The intelligence framework operates concurrently alongside human professionals, silently scoring its generative logic against the eventual human conclusion. Management interfaces subsequently render quantifiable statistical proofs—demonstrating phenomenally high accuracy congruence over thousands of parallel instances—before stakeholders consciously authorize full autonomous execution rights. Ultimately, synthesized with predictive regional scaling models and localized voice-cloning capabilities, ClerkTree will definitively merge the massive computational leverage of advanced AI networks with the deeply empathetic, hyper-specific nuance of localized human commerce.
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Pagination / Next Steps Base UI Style */}
                    <div className={`mt-20 flex gap-4 ${isDark ? 'text-[#338EF7]' : 'text-[#006FEE]'}`}>
                        <a href="#" className={`flex-1 p-4 rounded-xl border transition-colors flex flex-col items-start ${isDark ? 'border-[#1E2530] hover:border-[#338EF7] hover:bg-[#11141C]' : 'border-[#E5EAF2] hover:border-[#006FEE] hover:bg-slate-50'
                            }`}>
                            <span className={`text-[13px] font-medium mb-1 ${isDark ? 'text-[#B2BAC2]' : 'text-slate-500'}`}>Previous</span>
                            <span className="font-semibold">Dashboard Views</span>
                        </a>
                        <a href="#" className={`flex-1 p-4 rounded-xl border transition-colors flex flex-col items-end text-right justify-between ${isDark ? 'border-[#1E2530] hover:border-[#338EF7] hover:bg-[#11141C]' : 'border-[#E5EAF2] hover:border-[#006FEE] hover:bg-slate-50'
                            }`}>
                            <span className={`text-[13px] font-medium mb-1 ${isDark ? 'text-[#B2BAC2]' : 'text-slate-500'}`}>Next</span>
                            <span className="font-semibold">Get Started</span>
                        </a>
                    </div>
                </main>

                {/* Right Table of Contents (Desktop) */}
                <aside className={`hidden xl:block w-[240px] sticky top-14 h-[calc(100vh-3.5rem)] px-2 ${isDark ? 'text-[#B2BAC2]' : 'text-[#434D5B]'}`}>
                    <ScrollArea.Root className="w-full h-full overflow-hidden">
                        <ScrollArea.Viewport className="w-full h-full outline-none pt-10 pb-20 px-4">
                            <h4 className={`text-[12px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-white' : 'text-[#1C2025]'}`}>On this page</h4>
                            <ul className="space-y-0.5 border-l-[1px] relative">
                                {/* Active line indicator */}
                                <div className={`absolute left-[-1px] transition-all duration-300 w-[1px] ${isDark ? 'bg-[#338EF7]' : 'bg-[#006FEE]'}`}
                                    style={{
                                        top: `${Math.max(0, flatSections.findIndex(s => s.id === activeSection) * 26)}px`,
                                        height: '24px'
                                    }}
                                />
                                {flatSections.map((s) => {
                                    const isActive = activeSection === s.id;
                                    return (
                                        <li key={`toc-${s.id}`} className="min-h-[26px] flex items-center">
                                            <button
                                                onClick={() => scrollTo(s.id)}
                                                className={`text-left w-full pl-4 text-[13px] transition-colors leading-tight ${s.level === 2 ? 'pl-6' : ''} ${isActive
                                                    ? (isDark ? 'text-[#338EF7] font-medium' : 'text-[#006FEE] font-medium')
                                                    : (isDark ? 'hover:text-white border-[#1E2530]' : 'hover:text-[#1C2025] border-[#E5EAF2]')
                                                    }`}
                                            >
                                                {s.title}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar orientation="vertical" className={`flex w-2 touch-none select-none border-l p-[1px] transition-all hover:w-2.5 ${isDark ? 'border-[#1E2530]' : 'border-transparent'}`}>
                            <ScrollArea.Thumb className={`flex-1 rounded-full relative ${isDark ? 'bg-white/20 hover:bg-white/30' : 'bg-black/20 hover:bg-black/30'}`} />
                        </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                </aside>

            </div>
        </div>
    );
}
