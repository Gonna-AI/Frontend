import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  Hash,
  Copy,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { Accordion } from "@base-ui/react/accordion";
import { Tooltip } from "@base-ui/react/tooltip";

export default function WhitePaper() {
  const { isDark, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("executive-summary");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    {
      group: "Overview",
      items: [
        { id: "executive-summary", title: "Executive Summary", level: 1 },
        { id: "problem-statement", title: "The Problem", level: 1 },
        { id: "how-are-we-novel", title: "How Are We Novel?", level: 1 },
        { id: "proposed-ideas", title: "Proposed Ideas", level: 1 },
      ],
    },
    {
      group: "Core Problems",
      items: [
        {
          id: "backend-inefficiencies",
          title: "Backend Inefficiencies",
          level: 2,
        },
        { id: "frontend-gaps", title: "Frontend Gaps", level: 2 },
        { id: "barrier-to-ai", title: "AI Barriers", level: 2 },
      ],
    },
    {
      group: "Technological Novelty",
      items: [
        { id: "dev-api", title: "Developer API & Edge", level: 2 },
        { id: "onboarding-wizard", title: "Onboarding Wizard", level: 2 },
        { id: "analytics", title: "Real-Time Analytics", level: 2 },
      ],
    },
    {
      group: "Advanced Integration Ideas",
      items: [
        { id: "proactive-engagement", title: "Proactive Engagement", level: 2 },
        { id: "sentiment-routing", title: "Sentiment Routing", level: 2 },
        { id: "action-integrations", title: "Action Integrations", level: 2 },
        { id: "shadow-mode", title: "Shadow Mode Algorithm", level: 2 },
        { id: "multi-agent", title: "Multi-Agent Collaboration", level: 2 },
        { id: "voice-cloning", title: "Voice Cloning", level: 2 },
      ],
    },
  ];

  const flatSections = sections.flatMap((s) => s.items);

  // Scroll spy for Table of Contents
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px" },
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
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  // Base UI exact styling approximation
  // Light Mode: bg white, text #1C2025, borders #E5EAF2, blue #006FEE
  // Dark Mode: bg #0B0D14, text #B2BAC2, borders #1E2530, blue #338EF7

  return (
    <div
      className={`min-h-screen font-sans selection:bg-blue-500/30 ${isDark ? "bg-[#0B0D14] text-[#B2BAC2]" : "bg-white text-[#1C2025]"}`}
    >
      {/* Header - Base UI Style EXACT */}
      <header
        className={`fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between border-b px-4 md:px-6 backdrop-blur-[8px] transition-colors ${
          isDark
            ? "bg-[#0B0D14]/80 border-[#1E2530]"
            : "bg-white/80 border-[#E5EAF2]"
        }`}
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-1.5 -ml-1.5 rounded-md ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-[#1C2025]"}`}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Logo Area */}
          <Link
            to="/"
            className={`flex items-center gap-2 font-bold text-base tracking-tight ${isDark ? "text-white" : "text-[#1C2025]"}`}
          >
            <div className="w-6 h-6 bg-[#006FEE] rounded flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 22H22L12 2Z" fill="white" />
              </svg>
            </div>
            ClerkTree
          </Link>

          {/* Desktop Main Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 text-[14px] font-medium">
            <Link
              to="/"
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                isDark
                  ? "text-[#338EF7] bg-[#006FEE]/10"
                  : "text-[#006FEE] bg-blue-50"
              }`}
            >
              Docs
            </Link>
            <Link
              to="/dashboard"
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                isDark
                  ? "text-[#B2BAC2] hover:text-white hover:bg-white/5"
                  : "text-slate-600 hover:text-[#1C2025] hover:bg-slate-50"
              }`}
            >
              App
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Bar */}
          <button
            className={`hidden lg:flex items-center gap-2 px-2.5 py-1.5 w-[200px] xl:w-[240px] rounded-md border text-[14px] transition-all shadow-sm ${
              isDark
                ? "bg-[#11141C] border-[#1E2530] hover:border-[#338EF7]/50 text-[#6B7A90]"
                : "bg-white border-[#E5EAF2] hover:border-blue-400 text-slate-400"
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search</span>
            <div
              className={`px-1.5 py-[1px] text-[11px] font-medium rounded border ${
                isDark
                  ? "bg-[#1E2530] border-[#2A3441] text-[#B2BAC2]"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              ⌘K
            </div>
          </button>

          <div
            className={`w-px h-5 mx-1 hidden md:block ${isDark ? "bg-[#1E2530]" : "bg-[#E5EAF2]"}`}
          ></div>

          <Tooltip.Provider delay={200}>
            <div className="flex items-center gap-0.5">
              <Tooltip.Root>
                <Tooltip.Trigger
                  onClick={toggleTheme}
                  className={`p-1.5 md:p-2 rounded-md transition-colors border border-transparent ${
                    isDark
                      ? "text-[#B2BAC2] hover:bg-[#1E2530]"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {isDark ? (
                    <Sun className="w-[18px] h-[18px]" />
                  ) : (
                    <Moon className="w-[18px] h-[18px]" />
                  )}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Positioner>
                    <Tooltip.Popup
                      className={`px-2 py-1 text-xs rounded z-[60] shadow-md animate-in fade-in zoom-in-95 duration-200 ${
                        isDark
                          ? "bg-white text-black"
                          : "bg-gray-900 text-white"
                      }`}
                    >
                      <Tooltip.Arrow
                        className={isDark ? "fill-white" : "fill-gray-900"}
                      />
                      Toggle theme
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          </Tooltip.Provider>
        </div>
      </header>

      <div className="flex max-w-[1440px] mx-auto pt-14">
        {/* Left Navigation Sidebar - Base UI Accordion */}
        <aside
          className={`fixed md:sticky top-14 left-0 h-[calc(100vh-3.5rem)] z-40 w-[240px] md:w-[260px] border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } ${isDark ? "bg-[#0B0D14] border-[#1E2530]" : "bg-white border-[#E5EAF2]"}`}
        >
          <ScrollArea.Root className="w-full h-full overflow-hidden">
            <ScrollArea.Viewport className="w-full h-full outline-none pt-6 pb-20">
              <div className="px-4">
                <Accordion.Root defaultValue={sections.map((s) => s.group)}>
                  {sections.map((sectionGroup) => (
                    <Accordion.Item
                      key={sectionGroup.group}
                      value={sectionGroup.group}
                      className="mb-1"
                    >
                      <Accordion.Header>
                        <Accordion.Trigger
                          className={`w-full flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold tracking-wide transition-colors ${
                            isDark
                              ? "text-white hover:bg-white/5"
                              : "text-[#1C2025] hover:bg-slate-50"
                          } rounded-md group`}
                        >
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
                                className={`w-full text-left px-3 py-1.5 ml-1 my-0.5 rounded-md text-[14px] transition-colors relative ${
                                  isActive
                                    ? isDark
                                      ? "bg-[#006FEE]/10 text-[#338EF7] font-medium"
                                      : "bg-blue-50 text-[#006FEE] font-medium"
                                    : isDark
                                      ? "text-[#B2BAC2] hover:text-white hover:bg-white/5"
                                      : "text-slate-600 hover:text-[#1C2025] hover:bg-slate-50"
                                }`}
                              >
                                {isActive && (
                                  <span
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-r-full ${isDark ? "bg-[#338EF7]" : "bg-[#006FEE]"}`}
                                  />
                                )}
                                {item.title}
                              </button>
                            );
                          })}
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className={`flex w-2 touch-none select-none border-l p-[1px] transition-all hover:w-2.5 ${isDark ? "border-[#1E2530]" : "border-transparent"}`}
            >
              <ScrollArea.Thumb
                className={`flex-1 rounded-full relative ${isDark ? "bg-white/20 hover:bg-white/30" : "bg-black/20 hover:bg-black/30"}`}
              />
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
          <nav
            className={`flex items-center text-[14px] font-medium mb-4 ${isDark ? "text-[#338EF7]" : "text-[#006FEE]"}`}
          >
            <span className="hover:underline cursor-pointer tracking-tight">
              ClerkTree
            </span>
            <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
            <span className="hover:underline cursor-pointer tracking-tight">
              Whitepaper
            </span>
          </nav>

          <h1
            className={`text-4xl md:text-[40px] font-extrabold tracking-tight mb-4 leading-tight ${isDark ? "text-white" : "text-[#1C2025]"}`}
          >
            ClerkTree Whitepaper
          </h1>

          <p
            className={`text-[17px] md:text-[19px] leading-relaxed mb-12 font-medium tracking-tight ${isDark ? "text-[#B2BAC2]" : "text-slate-600"}`}
          >
            The Future of Operations Intelligence (OpsIntel) & Hyper-Local AI.
            Unveiling our vision for bridging the gap between complex operations
            and frontier AI.
          </p>

          <div
            className={`w-full h-px mb-12 ${isDark ? "bg-[#1E2530]" : "bg-[#E5EAF2]"}`}
          />

          <div className="space-y-16">
            <section id="executive-summary" className="scroll-mt-24 group">
              <h2
                className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? "text-white" : "text-[#1C2025]"}`}
              >
                <a
                  href="#executive-summary"
                  className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-[#338EF7]" : "text-[#006FEE]"}`}
                >
                  <Hash className="w-5 h-5 -mt-0.5" />
                </a>
                1. Executive Summary
              </h2>
              <div
                className={`text-[16px] leading-7 space-y-4 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
              >
                <p>
                  ClerkTree is an Enterprise AI Platform designed to bridge the
                  gap between complex backend operations (legal, claims
                  processing, document review) and frontend customer engagement
                  (hyper-local business operations).
                </p>
                <p>
                  By leveraging advanced Operations Intelligence (OpsIntel),
                  ClerkTree empowers businesses to automate routine tasks,
                  achieve faster processing times (up to 40%), and deliver 24/7
                  human-like conversational voice and chat support. Our mission
                  is to transform how organizations handle their internal
                  operations and external communications through intelligent,
                  accessible automation.
                </p>
              </div>
            </section>

            <section id="problem-statement" className="scroll-mt-24 group">
              <h2
                className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? "text-white" : "text-[#1C2025]"}`}
              >
                <a
                  href="#problem-statement"
                  className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-[#338EF7]" : "text-[#006FEE]"}`}
                >
                  <Hash className="w-5 h-5 -mt-0.5" />
                </a>
                2. The Problem We Are Solving
              </h2>
              <p
                className={`text-[16px] leading-7 mb-6 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
              >
                Businesses today face major bottlenecks that severely impact ROI
                and customer satisfaction:
              </p>

              <div className="space-y-8">
                <div id="backend-inefficiencies" className="scroll-mt-24">
                  <h3
                    className={`text-[19px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    1. Backend Inefficiencies
                  </h3>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    Legal and claims operations are notoriously burdened by
                    manual document review, leading to slow processing times,
                    high error rates, and astronomical operational costs.
                  </p>
                </div>

                <div id="frontend-gaps" className="scroll-mt-24">
                  <h3
                    className={`text-[19px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    2. Frontend Communication Gaps
                  </h3>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    Local businesses (retail, restaurants, sales, salons)
                    constantly miss calls and leads due to staff unavailability.
                    Traditional receptionists are expensive, turnover is high,
                    and rigid IVR (Interactive Voice Response) systems
                    frustrate.
                  </p>
                </div>

                <div id="barrier-to-ai" className="scroll-mt-24">
                  <h3
                    className={`text-[19px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    3. High Barrier to Entry for AI
                  </h3>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    Setting up a functional, knowledgeable AI agent requires
                    prompt engineering, knowledge graph construction, and deep
                    technical expertise that most small business owners
                    inherently lack.
                  </p>
                </div>
              </div>
            </section>

            <hr
              className={`border-t ${isDark ? "border-[#1E2530]" : "border-[#E5EAF2]"}`}
            />

            <section id="how-are-we-novel" className="scroll-mt-24 group">
              <h2
                className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? "text-white" : "text-[#1C2025]"}`}
              >
                <a
                  href="#how-are-we-novel"
                  className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-[#338EF7]" : "text-[#006FEE]"}`}
                >
                  <Hash className="w-5 h-5 -mt-0.5" />
                </a>
                3. How Are We Novel?
              </h2>
              <p
                className={`text-[16px] leading-7 mb-6 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
              >
                ClerkTree's novelty lies in its dual-pronged approach, robust
                developer API, and focus on extreme accessibility for business
                owners.
              </p>

              {/* Base UI style info boxes (Callouts) */}
              <div className="space-y-4">
                <div
                  id="dev-api"
                  className={`scroll-mt-24 p-5 rounded-lg border flex gap-3 items-start ${isDark ? "bg-[#0B1527] border-[#153460]" : "bg-[#F0F7FF] border-[#CCE3FD]"}`}
                >
                  <div
                    className={`mt-0.5 rounded p-1 ${isDark ? "bg-[#153460] text-[#338EF7]" : "bg-[#CCE3FD] text-[#006FEE]"}`}
                  >
                    <Copy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      className={`text-[15px] font-bold mb-1 ${isDark ? "text-white" : "text-[#004493]"}`}
                    >
                      Comprehensive Developer API & Edge Infrastructure
                    </h3>
                    <p
                      className={`text-[14px] leading-6 ${isDark ? "text-[#8492A6]" : "text-[#0059B2]"}`}
                    >
                      Built on high-performance Supabase Edge Functions,
                      ClerkTree offers a rich set of APIs for both developers
                      and enterprise use cases.
                    </p>
                  </div>
                </div>

                <div
                  id="onboarding-wizard"
                  className={`scroll-mt-24 p-5 rounded-lg border flex gap-3 items-start ${isDark ? "bg-[#121B10] border-[#1C3A16]" : "bg-[#F3FAF0] border-[#D0F2C2]"}`}
                >
                  <div
                    className={`mt-0.5 rounded p-1 ${isDark ? "bg-[#1C3A16] text-[#45D483]" : "bg-[#D0F2C2] text-[#127F3B]"}`}
                  >
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      className={`text-[15px] font-bold mb-1 ${isDark ? "text-white" : "text-[#0D5F2A]"}`}
                    >
                      Conversational AI Onboarding Wizard
                    </h3>
                    <p
                      className={`text-[14px] leading-6 ${isDark ? "text-[#8AA181]" : "text-[#127F3B]"}`}
                    >
                      We completely remove the technical friction of deploying
                      AI. Our unique "Onboarding Wizard" allows non-technical
                      business owners to configure their AI simply by chatting.
                    </p>
                  </div>
                </div>

                <div
                  id="analytics"
                  className={`scroll-mt-24 p-5 rounded-lg border flex gap-3 items-start ${isDark ? "bg-[#21160D] border-[#4A260F]" : "bg-[#FFF8F0] border-[#FCE1B6]"}`}
                >
                  <div
                    className={`mt-0.5 rounded p-1 ${isDark ? "bg-[#4A260F] text-[#F5A524]" : "bg-[#FCE1B6] text-[#B85D09]"}`}
                  >
                    <Menu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      className={`text-[15px] font-bold mb-1 ${isDark ? "text-white" : "text-[#8F4806]"}`}
                    >
                      Real-Time Analytics & Lead Enrichment
                    </h3>
                    <p
                      className={`text-[14px] leading-6 ${isDark ? "text-[#A88C78]" : "text-[#B85D09]"}`}
                    >
                      Our platform automatically enriches every interaction.
                      Calls and chats are transcribed and analyzed in real-time,
                      outputting structured data.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <hr
              className={`border-t ${isDark ? "border-[#1E2530]" : "border-[#E5EAF2]"}`}
            />

            <section id="proposed-ideas" className="scroll-mt-24 group">
              <h2
                className={`text-2xl md:text-[28px] font-bold tracking-tight mb-4 flex items-center -ml-6 pl-6 relative ${isDark ? "text-white" : "text-[#1C2025]"}`}
              >
                <a
                  href="#proposed-ideas"
                  className={`absolute left-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-[#338EF7]" : "text-[#006FEE]"}`}
                >
                  <Hash className="w-5 h-5 -mt-0.5" />
                </a>
                4. Proposed Novel Ideas
              </h2>
              <p
                className={`text-[16px] leading-7 mb-8 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
              >
                To further differentiate ClerkTree and solidify its unique
                market position, we should explore integrating the following
                advanced AI features into our receptionist and operations
                pipeline:
              </p>

              <div className="space-y-8">
                <div id="proactive-engagement" className="scroll-mt-24">
                  <h4
                    className={`text-[18px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    A. Proactive Engagement
                  </h4>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    Instead of just answering calls, the AI Receptionist can
                    engage proactively. Implement an SMS/Voice fallback that
                    automatically reaches out to customers who abandoned a
                    booking form.
                  </p>
                </div>

                <div id="sentiment-routing" className="scroll-mt-24">
                  <h4
                    className={`text-[18px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    B. Empathy-Driven Sentiment Routing
                  </h4>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    ClerkTree already analyzes sentiment post-call. We should
                    integrate real-time emotion/sentiment detection during voice
                    calls (via acoustic and linguistic cues).
                  </p>
                </div>

                <div id="action-integrations" className="scroll-mt-24">
                  <h4
                    className={`text-[18px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    C. Action Integrations
                  </h4>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    Go beyond just syncing with a calendar or CRM. Enable
                    "Action Hooks" in our Edge Functions where the AI
                    Receptionist can securely process payments.
                  </p>
                </div>

                <div id="shadow-mode" className="scroll-mt-24">
                  <h4
                    className={`text-[18px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    D. Shadow Mode Learning Algorithm
                  </h4>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    For claims and legal operations, implement a "Shadow Mode."
                    The AI runs silently alongside human workers, predicting the
                    human's classification or decision on documents.
                  </p>
                </div>

                <div id="multi-agent" className="scroll-mt-24">
                  <h4
                    className={`text-[18px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    E. Multi-Agent Collaboration
                  </h4>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    Create specialized micro-agents forming a swarm
                    architecture. The primitive "Receptionist Agent" answers the
                    phone and qualifies the lead, then seamlessly transfers the
                    context to a hyper-specialized "Booking Agent".
                  </p>
                </div>

                <div id="voice-cloning" className="scroll-mt-24">
                  <h4
                    className={`text-[18px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-[#1C2025]"}`}
                  >
                    F. Hyper-Local Voice Cloning
                  </h4>
                  <p
                    className={`text-[16px] leading-7 ${isDark ? "text-[#B2BAC2]" : "text-slate-700"}`}
                  >
                    Since ClerkTree targets local operations, allow business
                    owners to lightly clone their own voice to preserve the
                    deeply personal "local" touch.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Pagination / Next Steps Base UI Style */}
          <div
            className={`mt-20 flex gap-4 ${isDark ? "text-[#338EF7]" : "text-[#006FEE]"}`}
          >
            <a
              href="#"
              className={`flex-1 p-4 rounded-xl border transition-colors flex flex-col items-start ${
                isDark
                  ? "border-[#1E2530] hover:border-[#338EF7] hover:bg-[#11141C]"
                  : "border-[#E5EAF2] hover:border-[#006FEE] hover:bg-slate-50"
              }`}
            >
              <span
                className={`text-[13px] font-medium mb-1 ${isDark ? "text-[#B2BAC2]" : "text-slate-500"}`}
              >
                Previous
              </span>
              <span className="font-semibold">Dashboard Views</span>
            </a>
            <a
              href="#"
              className={`flex-1 p-4 rounded-xl border transition-colors flex flex-col items-end text-right justify-between ${
                isDark
                  ? "border-[#1E2530] hover:border-[#338EF7] hover:bg-[#11141C]"
                  : "border-[#E5EAF2] hover:border-[#006FEE] hover:bg-slate-50"
              }`}
            >
              <span
                className={`text-[13px] font-medium mb-1 ${isDark ? "text-[#B2BAC2]" : "text-slate-500"}`}
              >
                Next
              </span>
              <span className="font-semibold">Get Started</span>
            </a>
          </div>
        </main>

        {/* Right Table of Contents (Desktop) */}
        <aside
          className={`hidden xl:block w-[240px] sticky top-14 h-[calc(100vh-3.5rem)] px-2 ${isDark ? "text-[#B2BAC2]" : "text-[#434D5B]"}`}
        >
          <ScrollArea.Root className="w-full h-full overflow-hidden">
            <ScrollArea.Viewport className="w-full h-full outline-none pt-10 pb-20 px-4">
              <h4
                className={`text-[12px] font-bold uppercase tracking-widest mb-3 ${isDark ? "text-white" : "text-[#1C2025]"}`}
              >
                On this page
              </h4>
              <ul className="space-y-0.5 border-l-[1px] relative">
                {/* Active line indicator */}
                <div
                  className={`absolute left-[-1px] transition-all duration-300 w-[1px] ${isDark ? "bg-[#338EF7]" : "bg-[#006FEE]"}`}
                  style={{
                    top: `${Math.max(0, flatSections.findIndex((s) => s.id === activeSection) * 26)}px`,
                    height: "24px",
                  }}
                />
                {flatSections.map((s) => {
                  const isActive = activeSection === s.id;
                  return (
                    <li
                      key={`toc-${s.id}`}
                      className="min-h-[26px] flex items-center"
                    >
                      <button
                        onClick={() => scrollTo(s.id)}
                        className={`text-left w-full pl-4 text-[13px] transition-colors leading-tight ${s.level === 2 ? "pl-6" : ""} ${
                          isActive
                            ? isDark
                              ? "text-[#338EF7] font-medium"
                              : "text-[#006FEE] font-medium"
                            : isDark
                              ? "hover:text-white border-[#1E2530]"
                              : "hover:text-[#1C2025] border-[#E5EAF2]"
                        }`}
                      >
                        {s.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className={`flex w-2 touch-none select-none border-l p-[1px] transition-all hover:w-2.5 ${isDark ? "border-[#1E2530]" : "border-transparent"}`}
            >
              <ScrollArea.Thumb
                className={`flex-1 rounded-full relative ${isDark ? "bg-white/20 hover:bg-white/30" : "bg-black/20 hover:bg-black/30"}`}
              />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </aside>
      </div>
    </div>
  );
}
