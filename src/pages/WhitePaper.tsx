import { useState, useEffect } from 'react';
import { ChevronRight, Hash, Menu, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { ScrollArea } from '@base-ui/react/scroll-area';
import { Accordion } from '@base-ui/react/accordion';

import SharedHeader from '../components/Layout/SharedHeader';

export default function WhitePaper() {
    const { isDark } = useTheme();
    const [activeSection, setActiveSection] = useState('abstract');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sections = [
        {
            group: 'Overview',
            items: [
                { id: 'abstract', title: 'Abstract', level: 1 },
                { id: 'problem', title: 'Problem Landscape', level: 1 },
                { id: 'principles', title: 'Design Principles', level: 1 },
            ]
        },
        {
            group: 'System Architecture',
            items: [
                { id: 'architecture', title: 'System Architecture', level: 1 },
                { id: 'data-security', title: 'Data Lifecycle & Security', level: 1 },
                { id: 'orchestration', title: 'Orchestration & Intelligence', level: 2 },
            ]
        },
        {
            group: 'Operations',
            items: [
                { id: 'governance', title: 'Governance & Human Oversight', level: 1 },
                { id: 'deployment', title: 'Deployment Modes', level: 1 },
            ]
        },
        {
            group: 'Evidence & Roadmap',
            items: [
                { id: 'evaluation', title: 'Evaluation Framework', level: 1 },
                { id: 'roadmap', title: 'Roadmap', level: 1 },
                { id: 'conclusion', title: 'Conclusion', level: 1 },
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

    return (
        <div className={`min-h-screen font-sans selection:bg-[#FF8A5B]/30 ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#0A0A0A] text-white'}`}>

            <SharedHeader />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-12rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-[#FF8A5B]/10 blur-[140px]" />
                <div className="absolute right-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-white/6 blur-[120px]" />
                <div className="absolute bottom-[-8rem] left-1/2 h-[24rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#FF8A5B]/6 blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }} />
            </div>

            <div className="relative z-10 flex max-w-[1480px] mx-auto pt-20">

                {/* Left Navigation Sidebar - Base UI Accordion */}
                <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] z-40 w-[250px] md:w-[270px] border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } bg-[#0A0A0A] border-white/10`}>

                    <ScrollArea.Root className="w-full h-full overflow-hidden">
                        <ScrollArea.Viewport className="w-full h-full outline-none pt-6 pb-20">
                            <div className="px-4">
                                <div className="flex items-center justify-between px-2 pb-3 md:hidden">
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">Contents</p>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <Accordion.Root defaultValue={sections.map(s => s.group)}>
                                    {sections.map((sectionGroup) => (
                                        <Accordion.Item key={sectionGroup.group} value={sectionGroup.group} className="mb-1">
                                            <Accordion.Header>
                                                <Accordion.Trigger className={`w-full flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold tracking-wide transition-colors text-white hover:bg-white/5 rounded-md group`}>
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
                                                                    ? 'bg-[#FF8A5B]/10 text-[#FFB286] font-medium'
                                                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                                                    } `}
                                                            >
                                                                {isActive && (
                                                                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-r-full bg-[#FF8A5B]`} />
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
                        <ScrollArea.Scrollbar orientation="vertical" className={`flex w-2 touch-none select-none border-l p-[1px] transition-all hover:w-2.5 border-white/10`}>
                            <ScrollArea.Thumb className={`flex-1 rounded-full relative bg-white/20 hover:bg-white/30`} />
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

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 px-5 md:px-10 lg:px-16 py-8 md:py-12 max-w-[920px]">

                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                        >
                            <Menu className="h-4 w-4" />
                            Contents
                        </button>
                        <div className="text-xs text-white/40">Last updated March 10, 2026</div>
                    </div>

                    {/* Hero */}
                    <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#141414_0%,#0C0C0C_100%)] p-6 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm">
                            Whitepaper
                        </p>
                        <h1 className="mt-4 text-balance text-4xl md:text-[44px] font-semibold tracking-[-0.05em] text-white">
                            Operations Intelligence for Real‑World Frontlines
                        </h1>
                        <p className="mt-4 text-[16px] md:text-[18px] leading-relaxed text-white/60 max-w-2xl">
                            This paper explains how ClerkTree turns messy conversations and documents into structured operational decisions.
                            It covers the architecture, governance model, and deployment patterns that make AI useful in production environments.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/50">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Last updated March 10, 2026</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Reading time ~12 min</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Version 1.0</span>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {[
                            { title: 'Operational Clarity', desc: 'Normalize unstructured inputs into a single, auditable timeline.' },
                            { title: 'Latency-Aware Intelligence', desc: 'Edge-first routing keeps conversational loops human-fast.' },
                            { title: 'Governed Autonomy', desc: 'Confidence thresholds and human review prevent uncontrolled automation.' },
                        ].map((card) => (
                            <div key={card.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                                <p className="text-sm font-semibold text-white">{card.title}</p>
                                <p className="mt-2 text-sm text-white/60 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 space-y-16">

                        <section id="abstract" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#abstract" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                1. Abstract
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    This whitepaper presents ClerkTree’s approach to Operations Intelligence: a unified system that turns conversations, documents, and events
                                    into structured decisions and automated actions. The goal is to connect frontline interactions (calls, chats, forms, emails) with the
                                    operational back office in a way that is fast, reliable, and auditable.
                                </p>
                                <p>
                                    Instead of treating AI as a chat surface, we describe a production‑grade stack: ingestion and normalization, intelligence extraction,
                                    policy‑driven orchestration, and action execution with human oversight. The design prioritizes latency (so conversations feel natural),
                                    governance (so decisions are inspectable), and integration (so existing systems are not replaced).
                                </p>
                                <p>
                                    The remainder of this paper outlines the problem landscape, architectural components, governance model, deployment modes, and
                                    a practical evaluation framework to measure business impact.
                                </p>
                            </div>
                        </section>

                        <section id="problem" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#problem" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                2. Problem Landscape
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    Operations teams are forced to reconcile two incompatible worlds: unstructured frontline inputs and structured back‑office systems.
                                    The manual translation between them creates delays, errors, and poor customer experiences.
                                </p>
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 space-y-4">
                                    <p className="text-sm uppercase tracking-[0.2em] text-white/40">Observed constraints</p>
                                    <ul className="space-y-2 text-sm text-white/65">
                                        <li>• High‑value staff spend hours converting calls and documents into system fields.</li>
                                        <li>• Customer interactions are lost outside business hours or during peak demand.</li>
                                        <li>• Traditional IVR and rigid bots cannot handle nuance or exceptions.</li>
                                        <li>• Integration projects are heavy, delaying any AI adoption.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className={`border-t border-white/10`} />

                        <section id="principles" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#principles" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                3. Design Principles
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    The architecture is guided by principles that keep AI useful in production settings.
                                </p>
                                <ul className="space-y-2 text-sm text-white/65">
                                    <li>• <strong className="text-white">Latency first:</strong> conversational systems must respond in human‑time.</li>
                                    <li>• <strong className="text-white">Structured outputs:</strong> every interaction yields fields, events, and audit trails.</li>
                                    <li>• <strong className="text-white">Policy‑driven orchestration:</strong> rules govern when AI acts vs. routes to humans.</li>
                                    <li>• <strong className="text-white">Composable integration:</strong> adapters connect to existing CRMs and systems of record.</li>
                                    <li>• <strong className="text-white">Safety by design:</strong> confidence thresholds, monitoring, and rollback paths.</li>
                                </ul>
                            </div>
                        </section>

                        <hr className={`border-t border-white/10`} />

                        <section id="architecture" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#architecture" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                4. System Architecture
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    ClerkTree is built as a layered system that converts unstructured input into deterministic action.
                                    Each layer is independent, measurable, and replaceable.
                                </p>
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
                                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Pipeline</p>
                                    <ol className="mt-4 space-y-2 text-sm text-white/70">
                                        <li>1. <strong className="text-white">Ingest:</strong> voice, chat, email, forms, and documents.</li>
                                        <li>2. <strong className="text-white">Normalize:</strong> transcribe, tag entities, and align context.</li>
                                        <li>3. <strong className="text-white">Understand:</strong> extract fields, intent, sentiment, and risk.</li>
                                        <li>4. <strong className="text-white">Orchestrate:</strong> route decisions through policy logic.</li>
                                        <li>5. <strong className="text-white">Act:</strong> update systems, trigger workflows, or notify humans.</li>
                                        <li>6. <strong className="text-white">Learn:</strong> monitor outcomes and refine thresholds.</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        <hr className={`border-t border-white/10`} />

                        <section id="data-security" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#data-security" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                5. Data Lifecycle & Security
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    ClerkTree treats data as a lifecycle, not a storage bucket. Inputs are minimized, classified, and retained only as long as needed to support
                                    compliance or operational accuracy. Each tenant is isolated end‑to‑end, with access controls and audit trails.
                                </p>
                                <ul className="space-y-2 text-sm text-white/65">
                                    <li>• Tenant‑isolated embeddings and retrieval indexes.</li>
                                    <li>• Event‑level audit logs for every automation.</li>
                                    <li>• Configurable retention and export policies.</li>
                                    <li>• Secure connectors with scoped, revocable credentials.</li>
                                </ul>
                            </div>
                        </section>

                        <section id="orchestration" className="scroll-mt-24 group">
                            <h3 className="text-xl font-semibold tracking-tight text-white mb-3">
                                Orchestration & Intelligence
                            </h3>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    The orchestration layer is the decision engine. It translates extracted context into actions using rules, confidence thresholds, and routing logic.
                                    When confidence is low, the system escalates; when confidence is high, it executes.
                                </p>
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
                                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Decision flow</p>
                                    <ul className="mt-4 space-y-2 text-sm text-white/70">
                                        <li>• Intent classification and risk scoring.</li>
                                        <li>• Policy checks for compliance and consent.</li>
                                        <li>• Routing to humans, queues, or automated actions.</li>
                                        <li>• Feedback capture to improve future decisions.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className={`border-t border-white/10`} />

                        <section id="governance" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#governance" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                6. Governance & Human Oversight
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    AI should not be a black box in operational systems. ClerkTree is built for human control,
                                    with measurable thresholds and clear override paths.
                                </p>
                                <ul className="space-y-2 text-sm text-white/65">
                                    <li>• Confidence gating before actions execute.</li>
                                    <li>• Human review queues for sensitive cases.</li>
                                    <li>• Explainable logs for every decision.</li>
                                    <li>• Rollback and escalation controls.</li>
                                </ul>
                            </div>
                        </section>

                        <section id="deployment" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#deployment" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                7. Deployment Modes
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    Deployments adapt to the maturity and regulatory environment of each organization.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        { title: 'Cloud', desc: 'Rapid onboarding with secure tenant isolation and managed updates.' },
                                        { title: 'VPC / Private', desc: 'Dedicated environments for regulated data flows.' },
                                        { title: 'Edge‑Enhanced', desc: 'Low‑latency routing for voice and real‑time workflows.' },
                                        { title: 'Hybrid', desc: 'Split sensitive data paths and public‑facing channels.' },
                                    ].map((mode) => (
                                        <div key={mode.title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
                                            <p className="text-sm font-semibold text-white">{mode.title}</p>
                                            <p className="mt-2 text-sm text-white/60 leading-relaxed">{mode.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <hr className={`border-t border-white/10`} />

                        <section id="evaluation" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#evaluation" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                8. Evaluation Framework
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    Success is measured by operational outcomes, not model novelty. ClerkTree uses a mixed metrics model
                                    spanning latency, accuracy, and business impact.
                                </p>
                                <ul className="space-y-2 text-sm text-white/65">
                                    <li>• Response latency per channel (voice, SMS, chat).</li>
                                    <li>• Field extraction accuracy and correction rate.</li>
                                    <li>• Human override frequency and reasons.</li>
                                    <li>• Time‑to‑resolution and throughput impact.</li>
                                </ul>
                            </div>
                        </section>

                        <section id="roadmap" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#roadmap" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                9. Roadmap
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    Near‑term development focuses on deeper integrations, stronger governance tooling, and more proactive
                                    orchestration patterns.
                                </p>
                                <ul className="space-y-2 text-sm text-white/65">
                                    <li>• Expanded connectors for CRM, ticketing, and claims systems.</li>
                                    <li>• Real‑time capacity signaling to optimize routing decisions.</li>
                                    <li>• Automated QA workflows for regulated industries.</li>
                                    <li>• Multimodal intelligence across voice, text, and document streams.</li>
                                </ul>
                            </div>
                        </section>

                        <section id="conclusion" className="scroll-mt-24 group">
                            <h2 className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative text-white`}>
                                <a href="#conclusion" className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF8A5B]`}>
                                    <Hash className="w-5 h-5 -mt-0.5" />
                                </a>
                                10. Conclusion
                            </h2>
                            <div className={`text-[16px] leading-relaxed space-y-6 text-white/70`}>
                                <p>
                                    ClerkTree is designed to close the gap between frontline interaction and operational execution.
                                    By combining structured extraction, policy‑aware orchestration, and human‑controlled automation,
                                    it provides a path to safe, scalable AI in real‑world operations.
                                </p>
                            </div>
                        </section>

                    </div>

                    {/* Pagination / Next Steps Base UI Style */}
                    <div className={`mt-20 grid gap-4 sm:grid-cols-2`}>
                        <a href="/contact" className={`p-5 rounded-2xl border border-white/10 bg-white/[0.04] transition-colors flex flex-col items-start hover:border-white/20`}>
                            <span className={`text-[12px] font-medium mb-1 text-white/50`}>Next step</span>
                            <span className="font-semibold text-white">Talk to the ClerkTree team</span>
                        </a>
                        <a href="/docs" className={`p-5 rounded-2xl border border-white/10 bg-white/[0.04] transition-colors flex flex-col items-end text-right hover:border-white/20`}>
                            <span className={`text-[12px] font-medium mb-1 text-white/50`}>Learn more</span>
                            <span className="font-semibold text-white">Explore the API documentation</span>
                        </a>
                    </div>
                </main>

                {/* Right Table of Contents (Desktop) */}
                <aside className={`hidden xl:block w-[240px] sticky top-16 h-[calc(100vh-4rem)] px-2 text-white/70`}>
                    <ScrollArea.Root className="w-full h-full overflow-hidden">
                        <ScrollArea.Viewport className="w-full h-full outline-none pt-10 pb-20 px-4">
                            <h4 className={`text-[12px] font-bold uppercase tracking-widest mb-3 text-white`}>On this page</h4>
                            <ul className="space-y-0.5 border-l-[1px] border-white/10 relative">
                                {/* Active line indicator */}
                                <div className={`absolute left-[-1px] transition-all duration-300 w-[1px] bg-[#FF8A5B]`}
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
                                                    ? 'text-[#FFB286] font-medium'
                                                    : 'hover:text-white'
                                                    }`}
                                            >
                                                {s.title}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar orientation="vertical" className={`flex w-2 touch-none select-none border-l p-[1px] transition-all hover:w-2.5 border-white/10`}>
                            <ScrollArea.Thumb className={`flex-1 rounded-full relative bg-white/20 hover:bg-white/30`} />
                        </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                </aside>

            </div>
        </div>
    );
}
