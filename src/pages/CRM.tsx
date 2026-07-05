import { type ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  Database,
  GitMerge,
  Globe,
  Layers,
  MessageSquare,
  Puzzle,
  Shield,
  SlidersHorizontal,
  Workflow,
  Zap,
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Header, Footer } from '../components/Landing/AgeroChrome';
import SEO from '../components/SEO';
import { cn } from '../lib/utils';
import './LandingFramer.css';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, transform: 'translateY(12px)' }}
      animate={
        inView
          ? { opacity: 1, transform: 'translateY(0px)' }
          : { opacity: 0, transform: 'translateY(12px)' }
      }
      transition={{
        duration: shouldReduce ? 0 : 0.42,
        delay: shouldReduce ? 0 : delay,
        ease: EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionEyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-px w-6 shrink-0 bg-[#FF8A5B]" />
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm">
        {children}
      </p>
    </div>
  );
}

function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgba(19,19,19,0.08)] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

const CORE_FEATURES = [
  {
    icon: Database,
    title: 'Custom Objects & Fields',
    description:
      'Define your entire data model in code — deals, contacts, accounts, or any custom entity your business demands. Typed fields, relations, and indexes deployed like the rest of your stack.',
  },
  {
    icon: Layers,
    title: 'Smart Views & Filters',
    description:
      'Kanban pipelines, table grids, timeline boards. Every dataset gets multiple views with persistent filters, sorting, and grouping configured per user and team.',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description:
      'Logic-based triggers, field conditions, branching actions, and escalation paths. Automate follow-ups, routing, and status transitions without a single line of config sprawl.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Agents & Chat',
    description:
      'Native AI agents read and write your CRM in natural language. Ask questions, create records, summarize pipelines, and surface insights — all from a chat interface.',
  },
  {
    icon: Zap,
    title: 'Real-Time Sync',
    description:
      'Live data across every screen. Changes propagate instantly to all collaborators — no stale caches, no refresh-to-see-updates, no polling hacks.',
  },
  {
    icon: Shield,
    title: 'Self-Hosted or Cloud',
    description:
      'Run on your own infrastructure with full data sovereignty, or let us host it. Either way, you own the schema, the data, and the deployment pipeline.',
  },
];

const AI_CAPABILITIES = [
  {
    icon: MessageSquare,
    title: 'Natural Language Queries',
    body: '"Show me all deals over $50k that stalled in Q3" — your CRM answers in plain English.',
  },
  {
    icon: Puzzle,
    title: 'MCP-Native Integration',
    body: 'Expose your CRM data directly to Claude, ChatGPT, or Cursor. Your AI assistant can read and write records via OAuth.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Context-Aware Enrichment',
    body: 'AI agents pull from emails, calls, and documents to auto-fill fields, flag anomalies, and suggest next actions.',
  },
  {
    icon: Globe,
    title: 'Voice & Omnichannel',
    body: 'Wire ClerkTree voice agents directly into your CRM. Every call logged, transcribed, and mapped to the right deal automatically.',
  },
];

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Discover',
    description:
      'We map your existing data model, team workflows, and integration points. Every custom CRM starts with a structured discovery session — no generic templates.',
  },
  {
    number: '02',
    title: 'Build',
    description:
      "Custom objects, views, and automations are implemented as versioned code. You get a real deployment pipeline, not a ClickOps configuration you can't audit.",
  },
  {
    number: '03',
    title: 'Integrate',
    description:
      'AI agents, voice pipelines, documents, and external APIs are wired into your CRM. The whole system ships as a single coherent product.',
  },
];

const STACK_BADGES = [
  'TypeScript',
  'React',
  'NestJS',
  'PostgreSQL',
  'Redis',
  'GraphQL',
  'Docker',
  'REST / MCP',
];

export default function CRM() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  // suppress unused-variable warning while keeping hook available for future use
  void shouldReduce;

  return (
    <div className="agero-works relative min-h-screen overflow-x-hidden">
      <SEO
        title="AI-Native CRM — ClerkTree"
        description="ClerkTree builds enterprise CRM systems designed for the AI era. Custom objects, AI agents, workflow automation, and full self-hosting — deployed as code."
        canonical="https://clerktree.com/crm"
      />
      {/* ── Atmosphere ──────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute left-[-14rem] top-[16rem] h-[32rem] w-[32rem] rounded-full bg-[#FF8A5B]/10 blur-[160px]" />
        <div className="absolute right-[-10rem] top-[8rem] h-[26rem] w-[26rem] rounded-full bg-[rgba(19,19,19,0.04)] blur-[130px]" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-[#FF8A5B]/8 blur-[140px]" />
      </div>

      <div className="agero-top-area agero-top-area-with-hero relative z-10">
        <Header />

        {/* ── Hero ─────────────────────────────────────── */}
        <section
          className="mx-auto flex max-w-7xl flex-col items-center justify-center px-5 pb-10 pt-6 text-center"
          aria-labelledby="crm-hero-heading"
        >
          <Reveal>
            <SectionEyebrow className="mx-auto mb-6">
              CRM Platform
            </SectionEyebrow>
          </Reveal>

          <Reveal delay={0.08}>
            <h1
              id="crm-hero-heading"
              className="text-balance text-[clamp(2.8rem,1.2rem+5.5vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-[rgb(19,19,19)]"
            >
              CRM Built for the{' '}
              <span className="text-[#FF8A5B]">AI Era</span>
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mx-auto mt-6 max-w-2xl text-[clamp(1rem,0.9rem+0.4vw,1.2rem)] leading-relaxed text-[rgba(19,19,19,0.55)]">
              We design and deploy enterprise CRM systems where every record, workflow, and pipeline
              is natively connected to AI. Custom-built to your data model. Versioned like code.
              Deployed on your terms.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/contact')}
                className="group inline-flex items-center gap-2 rounded-full bg-[#FF8A5B] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(255,138,91,0.35)] transition-all duration-200 hover:bg-[#FF9E70] hover:shadow-[0_0_38px_rgba(255,138,91,0.5)]"
              >
                Start a conversation
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/solutions')}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(19,19,19,0.12)] bg-[rgba(19,19,19,0.04)] px-7 py-3.5 text-sm font-semibold text-[rgba(19,19,19,0.8)] backdrop-blur-sm transition-all duration-200 hover:border-[rgba(19,19,19,0.18)] hover:bg-[rgba(19,19,19,0.07)] hover:text-[rgb(19,19,19)]"
              >
                See all solutions
              </button>
            </div>
          </Reveal>

          {/* Floating stat pills */}
          <Reveal delay={0.28}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
              {[
                { value: '100%', label: 'Custom data model' },
                { value: 'Code-first', label: 'Versioned deploys' },
                { value: 'AI-native', label: 'MCP + agents built in' },
                { value: 'No lock-in', label: 'Self-hosted option' },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className="flex items-center gap-2 rounded-full border border-[rgba(19,19,19,0.1)] bg-[rgba(19,19,19,0.04)] px-4 py-2 text-sm backdrop-blur-sm"
                >
                  <span className="font-semibold text-[#FFB286]">{pill.value}</span>
                  <span className="text-[rgba(19,19,19,0.5)]">{pill.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <div className="agero-hero-video-slot mx-auto max-w-7xl px-5" aria-hidden="true" />
      </div>

      <div className="relative z-10">
        {/* ── Problem banner ───────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 pb-24">
          <Reveal>
            <div className="rounded-3xl border border-[rgba(19,19,19,0.08)] bg-[linear-gradient(135deg,#ffffff_0%,#f7f7f7_100%)] p-8 sm:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(19,19,19,0.4)]">
                  The problem with off-the-shelf CRMs
                </p>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] text-[rgb(19,19,19)] sm:text-4xl">
                  Your business isn't generic.{' '}
                  <span className="text-[rgba(19,19,19,0.4)]">Your CRM shouldn't be either.</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[rgba(19,19,19,0.5)] sm:text-lg">
                  Salesforce, HubSpot, and Pipedrive were designed for an average company.
                  You end up hacking fields into shapes they weren't meant for, paying per seat for
                  features you don't need, and integrating AI on top of a system that was never designed for it.
                  We build from first principles — your schema, your workflows, your rules.
                </p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { problem: 'Rigid data models', fix: 'Code-defined schema' },
                  { problem: 'AI bolted on after', fix: 'Agents native from day one' },
                  { problem: 'Opaque pricing', fix: 'You own the infra' },
                  { problem: 'No audit trail', fix: 'Every change versioned' },
                ].map((item) => (
                  <div
                    key={item.problem}
                    className="rounded-xl border border-[rgba(19,19,19,0.06)] bg-[rgba(19,19,19,0.03)] p-4 text-center"
                  >
                    <p className="text-xs text-[rgba(19,19,19,0.35)] line-through">{item.problem}</p>
                    <p className="mt-1.5 text-sm font-medium text-[#FFB286]">{item.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Core Features ─────────────────────────────── */}
        <section
          className="mx-auto max-w-7xl px-5 pb-28"
          aria-labelledby="features-heading"
        >
          <Reveal className="mb-12">
            <SectionEyebrow>Platform capabilities</SectionEyebrow>
            <h2
              id="features-heading"
              className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] text-[rgb(19,19,19)] sm:text-5xl"
            >
              Everything a modern CRM needs
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[rgba(19,19,19,0.5)] sm:text-lg">
              Built on an enterprise-grade foundation — and customised to your exact requirements before
              the first line of production code ships.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={i * 0.05}>
                <GlassCard className="group flex h-full flex-col gap-4 transition-all duration-300 hover:border-[rgba(19,19,19,0.16)] hover:shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF8A5B]/20 bg-[#FF8A5B]/10">
                    <feat.icon className="h-5 w-5 text-[#FF8A5B]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[rgb(19,19,19)]">{feat.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[rgba(19,19,19,0.5)]">{feat.description}</p>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── AI-Native ─────────────────────────────────── */}
        <section
          className="mx-auto max-w-7xl px-5 pb-28"
          aria-labelledby="ai-heading"
        >
          <div className="overflow-hidden rounded-3xl border border-[rgba(19,19,19,0.08)] bg-[linear-gradient(145deg,#ffffff_0%,#f7f7f7_100%)]">
            <div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, #FF8A5B 40%, #FFB286 60%, transparent 100%)',
                opacity: 0.35,
              }}
            />
            <div className="p-8 sm:p-14">
              <Reveal>
                <SectionEyebrow>AI-Native</SectionEyebrow>
                <h2
                  id="ai-heading"
                  className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] text-[rgb(19,19,19)] sm:text-5xl"
                >
                  Your CRM speaks{' '}
                  <span className="text-[#FF8A5B]">AI fluently</span>
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[rgba(19,19,19,0.5)] sm:text-lg">
                  AI isn't added on top of our CRM — it's designed in from the start. Every object,
                  field, and workflow is exposed to your AI stack via a native integration layer that
                  lets language models read and write your data in real time.
                </p>
              </Reveal>

              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                {AI_CAPABILITIES.map((cap, i) => (
                  <Reveal key={cap.title} delay={i * 0.06}>
                    <div className="flex gap-4 rounded-2xl border border-[rgba(19,19,19,0.06)] bg-[rgba(19,19,19,0.03)] p-5 transition-colors duration-200 hover:border-[#FF8A5B]/20 hover:bg-[#FF8A5B]/5">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF8A5B]/12">
                        <cap.icon className="h-4 w-4 text-[#FF8A5B]" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[rgb(19,19,19)]">{cap.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-[rgba(19,19,19,0.5)]">{cap.body}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Natural language demo chip */}
              <Reveal delay={0.25}>
                <div className="mt-10 rounded-2xl border border-[rgba(19,19,19,0.1)] bg-[rgba(19,19,19,0.04)] p-5 backdrop-blur-sm">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(19,19,19,0.3)]">
                    Example query
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF8A5B]/20 text-[10px] font-bold text-[#FF8A5B]">
                      AI
                    </div>
                    <p className="font-mono text-sm leading-relaxed text-[rgba(19,19,19,0.7)]">
                      "Show me all active deals over $100k where the last touch was more than 14 days
                      ago, grouped by account owner — and draft a follow-up for each one."
                    </p>
                  </div>
                  <div className="mt-4 flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(19,19,19,0.07)] text-[10px] font-bold text-[rgba(19,19,19,0.4)]">
                      CRM
                    </div>
                    <p className="text-sm leading-relaxed text-[rgba(19,19,19,0.5)]">
                      Found <span className="text-[#FFB286] font-medium">12 deals</span> matching criteria.
                      Drafting personalised follow-ups for each account owner…
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── How we build ──────────────────────────────── */}
        <section
          className="mx-auto max-w-7xl px-5 pb-28"
          aria-labelledby="process-heading"
        >
          <Reveal className="mb-14">
            <SectionEyebrow>How we build</SectionEyebrow>
            <h2
              id="process-heading"
              className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] text-[rgb(19,19,19)] sm:text-5xl"
            >
              From discovery to deployment
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[rgba(19,19,19,0.5)] sm:text-lg">
              Every CRM we build is a bespoke engagement — no starter templates recycled from a previous client.
            </p>
          </Reveal>

          <div className="relative grid gap-6 lg:grid-cols-3">
            <div
              className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-9 hidden h-px lg:block"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,138,91,0.25) 30%, rgba(255,138,91,0.25) 70%, transparent)',
              }}
              aria-hidden="true"
            />

            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 0.1}>
                <GlassCard className="relative flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FF8A5B]/30 bg-[#FF8A5B]/10 text-sm font-bold text-[#FF8A5B]">
                      {step.number}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-[#FF8A5B]/20 to-transparent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(19,19,19)]">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[rgba(19,19,19,0.5)]">
                      {step.description}
                    </p>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Tech stack ───────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 pb-28">
          <Reveal>
            <div className="rounded-3xl border border-[rgba(19,19,19,0.08)] bg-[linear-gradient(135deg,#ffffff_0%,#f7f7f7_100%)] p-8 sm:p-12">
              <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-lg">
                  <SectionEyebrow>Tech stack</SectionEyebrow>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[rgb(19,19,19)] sm:text-4xl">
                    Production-grade from day one
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-[rgba(19,19,19,0.5)]">
                    We don't assemble your CRM from SaaS patchwork. Everything is built on a battle-tested,
                    open foundation using the same tooling your engineering team already knows.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 lg:justify-end">
                  {STACK_BADGES.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-[rgba(19,19,19,0.1)] bg-[rgba(19,19,19,0.04)] px-4 py-1.5 text-xs font-semibold text-[rgba(19,19,19,0.6)] backdrop-blur-sm transition-colors duration-200 hover:border-[#FF8A5B]/30 hover:text-[#FFB286]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    layer: 'Presentation',
                    icon: Layers,
                    items: ['React UI', 'Custom views', 'Mobile-ready'],
                  },
                  {
                    layer: 'Intelligence',
                    icon: BrainCircuit,
                    items: ['AI agents', 'MCP server', 'NLP queries'],
                  },
                  {
                    layer: 'Data',
                    icon: Database,
                    items: ['PostgreSQL', 'GraphQL API', 'Redis cache'],
                  },
                ].map((arch, i) => (
                  <div
                    key={arch.layer}
                    className={cn(
                      'rounded-xl border p-4',
                      i === 1
                        ? 'border-[#FF8A5B]/20 bg-[#FF8A5B]/6'
                        : 'border-[rgba(19,19,19,0.06)] bg-[rgba(19,19,19,0.03)]',
                    )}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <arch.icon className="h-4 w-4 text-[#FF8A5B]" aria-hidden="true" />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(19,19,19,0.5)]">
                        {arch.layer}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {arch.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-[rgba(19,19,19,0.7)]">
                          <span className="h-1 w-1 rounded-full bg-[#FF8A5B]/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Integration section ───────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 pb-28">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MessageSquare,
                title: 'Voice & Call Logs',
                desc: 'Every ClerkTree voice call is automatically logged, transcribed, and linked to the right CRM record.',
              },
              {
                icon: GitMerge,
                title: 'Email & Calendar',
                desc: 'Two-way sync with Gmail and Google Calendar. Meetings and emails surface in the deal timeline without manual entry.',
              },
              {
                icon: Puzzle,
                title: 'Third-Party APIs',
                desc: 'Connect payment processors, ERPs, support tools, or any REST/GraphQL API your business runs on.',
              },
              {
                icon: Globe,
                title: 'Webhook Ecosystem',
                desc: 'Every record change can trigger external workflows — Slack alerts, Zapier, custom servers, or direct database writes.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <GlassCard className="flex flex-col gap-3">
                  <item.icon className="h-5 w-5 text-[#FF8A5B]" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-[rgb(19,19,19)]">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-[rgba(19,19,19,0.45)]">{item.desc}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 pb-28" aria-labelledby="cta-heading">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-3xl border border-[rgba(19,19,19,0.08)] p-10 text-center sm:p-16"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(255,138,91,0.12) 0%, transparent 65%), linear-gradient(145deg, #ffffff 0%, #f7f7f7 100%)',
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 5%, #FF8A5B 40%, #FFB286 60%, transparent 95%)',
                  opacity: 0.5,
                }}
                aria-hidden="true"
              />

              <SectionEyebrow className="justify-center mb-6">
                Get started
              </SectionEyebrow>

              <h2
                id="cta-heading"
                className="text-balance text-4xl font-semibold tracking-[-0.05em] text-[rgb(19,19,19)] sm:text-5xl"
              >
                Ready to build your CRM?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[rgba(19,19,19,0.5)] sm:text-lg">
                Tell us about your data model, team size, and integration requirements.
                We'll scope a custom CRM that ships as real software — not a no-code approximation.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#FF8A5B] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_32px_rgba(255,138,91,0.4)] transition-all duration-200 hover:bg-[#FF9E70] hover:shadow-[0_0_44px_rgba(255,138,91,0.55)]"
                >
                  Book a discovery call
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
                <button
                  onClick={() => navigate('/solutions')}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(19,19,19,0.12)] bg-[rgba(19,19,19,0.04)] px-8 py-4 text-sm font-semibold text-[rgba(19,19,19,0.75)] backdrop-blur-sm transition-all duration-200 hover:border-[rgba(19,19,19,0.2)] hover:bg-[rgba(19,19,19,0.07)] hover:text-[rgb(19,19,19)]"
                >
                  Explore all solutions
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[rgba(19,19,19,0.3)]">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3 w-3" aria-hidden="true" /> SOC 2 aligned
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3" aria-hidden="true" /> Self-hosted option
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3" aria-hidden="true" /> 4-week first milestone
                </span>
              </div>
            </div>
          </Reveal>
        </section>

      </div>

      <Footer />
    </div>
  );
}
