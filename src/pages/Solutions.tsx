import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { Zap, Brain, FileCheck, Clock, BarChart3, Shield, ArrowRight, CheckCircle2, Sparkles, ChevronRight, MousePointerClick } from 'lucide-react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import Footer from '../components/Landing/Footer';


// ────────────────────────────────────────────
// Reusable animated wrapper for scroll reveals
// ────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ────────────────────────────────
// Animated counter for stats
// ────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {isInView && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CountUp target={value} />{suffix}
        </motion.span>
      )}
    </motion.span>
  );
}

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  if (isInView && count === 0) {
    let start = 0;
    const duration = 2000;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);
  }

  return <span ref={ref}>{count}</span>;
}

// ────────────────────────────
// Animated gradient border card
// ────────────────────────────
function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(139,92,246,0.3)',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer ${className}`}
      style={{ '--glow-color': glowColor } as React.CSSProperties}
    >
      {/* Animated spotlight on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 60%)`,
        }}
      />
      {/* Border gradient */}
      <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-white/10 via-white/5 to-transparent group-hover:from-white/20 group-hover:via-white/10 transition-all duration-500">
        <div className="h-full w-full rounded-[calc(1.5rem-1px)] bg-[rgb(14,14,18)]">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// ────────────────────────────
// Main Solutions Page
// ────────────────────────────
export default function Solutions() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const [activeSolution, setActiveSolution] = useState(0);

  const solutions = [
    {
      icon: Brain,
      title: t('solutions.card1Title'),
      description: t('solutions.card1Desc'),
      features: [t('solutions.card1Feat1'), t('solutions.card1Feat2'), t('solutions.card1Feat3')],
      color: '#10b981',
      accent: 'emerald',
    },
    {
      icon: Zap,
      title: t('solutions.card2Title'),
      description: t('solutions.card2Desc'),
      features: [t('solutions.card2Feat1'), t('solutions.card2Feat2'), t('solutions.card2Feat3')],
      color: '#6366f1',
      accent: 'indigo',
    },
    {
      icon: FileCheck,
      title: t('solutions.card3Title'),
      description: t('solutions.card3Desc'),
      features: [t('solutions.card3Feat1'), t('solutions.card3Feat2'), t('solutions.card3Feat3')],
      color: '#a855f7',
      accent: 'purple',
    },
    {
      icon: Clock,
      title: t('solutions.card4Title'),
      description: t('solutions.card4Desc'),
      features: [t('solutions.card4Feat1'), t('solutions.card4Feat2'), t('solutions.card4Feat3')],
      color: '#f97316',
      accent: 'orange',
    },
    {
      icon: BarChart3,
      title: t('solutions.card5Title'),
      description: t('solutions.card5Desc'),
      features: [t('solutions.card5Feat1'), t('solutions.card5Feat2'), t('solutions.card5Feat3')],
      color: '#06b6d4',
      accent: 'cyan',
    },
    {
      icon: Shield,
      title: t('solutions.card6Title'),
      description: t('solutions.card6Desc'),
      features: [t('solutions.card6Feat1'), t('solutions.card6Feat2'), t('solutions.card6Feat3')],
      color: '#8b5cf6',
      accent: 'violet',
    },
  ];

  const stats = [
    { value: 40, suffix: '%', label: 'Faster Processing' },
    { value: 99, suffix: '%', label: 'Accuracy Rate' },
    { value: 10, suffix: 'x', label: 'ROI Increase' },
    { value: 24, suffix: '/7', label: 'Availability' },
  ];

  return (
    <div className="bg-[rgb(8,8,12)] min-h-screen relative overflow-x-hidden">
      {/* ── Background Mesh ── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[rgb(8,8,12)]" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[1200px] h-[1200px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(59,130,246,0.15) 40%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[800px] h-[800px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-xl bg-[rgb(8,8,12)]/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
              <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <span className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium whitespace-nowrap">
                {t('nav.solutions')}
              </span>
            </div>
            <LanguageSwitcher isExpanded={true} forceDark={true} />
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
           SECTION 1 — HERO
           ══════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-36 md:pt-44 pb-8 px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <Reveal>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300 tracking-wide">Enterprise AI Platform</span>
            </motion.div>
          </Reveal>

          {/* Title */}
          <Reveal delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.05]">
              <span className="bg-gradient-to-b from-white via-white/90 to-white/70 text-transparent bg-clip-text">
                {t('solutions.title1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-transparent bg-clip-text">
                {t('solutions.title2')}
              </span>
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.2}>
            <p className="mt-8 text-lg md:text-xl text-white/50 leading-relaxed max-w-3xl mx-auto">
              {t('solutions.subtitle')}
            </p>
          </Reveal>

          {/* CTA Buttons */}
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/contact')}
                className="group relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  {t('solutions.bookDemo')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/contact')}
                className="px-8 py-4 rounded-2xl font-semibold text-white/80 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
              >
                {t('solutions.contactSales')}
              </motion.button>
            </div>
          </Reveal>
        </div>
      </motion.section>


      {/* ══════════════════════════════════════════
           SECTION 3 — STATS BAR
           ══════════════════════════════════════════ */}
      <section className="relative px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white to-white/70 text-transparent bg-clip-text mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/40 font-medium tracking-wide uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 4 — BENTO SOLUTIONS GRID
           ══════════════════════════════════════════ */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <MousePointerClick className="w-3.5 h-3.5" />
                Core Capabilities
              </span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">
                  Everything You Need
                </span>
              </h2>
            </div>
          </Reveal>

          {/* Bento Grid — Asymmetric */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              const isLarge = index === 0 || index === 3;
              return (
                <Reveal key={index} delay={index * 0.08} className={isLarge ? 'lg:col-span-2 md:col-span-2' : ''}>
                  <GlowCard
                    glowColor={`${solution.color}33`}
                    onClick={() => navigate('/contact')}
                    className={`h-full ${isLarge ? 'min-h-[280px]' : 'min-h-[320px]'}`}
                  >
                    <div className="relative z-20 p-8 md:p-10 h-full flex flex-col">
                      {/* Icon + Title Row */}
                      <div className="flex items-start gap-4 mb-6">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${solution.color}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: solution.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl md:text-2xl font-bold text-white leading-tight mb-2">
                            {solution.title}
                          </h3>
                          <p className="text-base text-white/45 leading-relaxed">
                            {solution.description}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mt-auto pt-6 border-t border-white/[0.06]">
                        <div className={`grid ${isLarge ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'} gap-3`}>
                          {solution.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: solution.color }} />
                              <span className="text-sm text-white/60">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hover arrow */}
                      <div className="absolute top-8 right-8 md:top-10 md:right-10">
                        <ChevronRight
                          className="w-5 h-5 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </GlowCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 5 — INTERACTIVE FEATURE WALKTHROUGH
           ══════════════════════════════════════════ */}
      <section className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Deep Dive
              </span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">How It Works</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              {/* Left — Tab List */}
              <div className="lg:col-span-2 flex flex-col gap-2">
                {solutions.map((sol, idx) => {
                  const Icon = sol.icon;
                  const isActive = activeSolution === idx;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => setActiveSolution(idx)}
                      whileHover={{ x: 4 }}
                      className={`relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 ${isActive
                        ? 'bg-white/[0.06] border border-white/[0.1]'
                        : 'bg-transparent border border-transparent hover:bg-white/[0.03]'
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                          style={{ backgroundColor: sol.color }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: isActive ? `${sol.color}20` : 'rgba(255,255,255,0.05)' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: isActive ? sol.color : 'rgba(255,255,255,0.3)' }} />
                      </div>
                      <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>
                        {sol.title}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Right — Content Panel */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSolution}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="relative p-8 md:p-10 rounded-3xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm overflow-hidden"
                  >
                    {/* Accent glow */}
                    <div
                      className="absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl -z-10"
                      style={{ backgroundColor: solutions[activeSolution].color }}
                    />

                    <div className="flex items-center gap-3 mb-6">
                      {(() => {
                        const Icon = solutions[activeSolution].icon;
                        return (
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl"
                            style={{ backgroundColor: `${solutions[activeSolution].color}20` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: solutions[activeSolution].color }} />
                          </div>
                        );
                      })()}
                      <h3 className="text-2xl font-bold text-white">{solutions[activeSolution].title}</h3>
                    </div>

                    <p className="text-base text-white/50 leading-relaxed mb-8">
                      {solutions[activeSolution].description}
                    </p>

                    <div className="space-y-4">
                      {solutions[activeSolution].features.map((feat, idx) => (
                        <motion.div
                          key={feat}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 + 0.2 }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                        >
                          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: solutions[activeSolution].color }} />
                          <span className="text-sm font-medium text-white/70">{feat}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/contact')}
                      className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300"
                      style={{ backgroundColor: `${solutions[activeSolution].color}20`, borderColor: `${solutions[activeSolution].color}30`, borderWidth: '1px' }}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
           SECTION 6 — CTA
           ══════════════════════════════════════════ */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="relative rounded-[2rem] overflow-hidden">
              {/* Background blobs */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-600/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-600/20 blur-[100px] rounded-full" />
                <div className="absolute inset-0 bg-[rgb(14,14,18)]/80 backdrop-blur-sm" />
              </div>

              {/* Border */}
              <div className="absolute inset-0 rounded-[2rem] border border-violet-500/20" />

              <div className="relative z-10 text-center py-20 px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    {t('solutions.ctaBadge')}
                  </span>

                  <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    <span className="bg-gradient-to-b from-white to-white/80 text-transparent bg-clip-text">
                      {t('solutions.ctaTitle1')}
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-transparent bg-clip-text">
                      {t('solutions.ctaTitle2')}
                    </span>
                  </h2>

                  <p className="text-lg text-white/45 mb-12 max-w-2xl mx-auto leading-relaxed">
                    {t('solutions.ctaDesc')}{' '}
                    <span className="text-violet-400 font-bold">{t('solutions.ctaDescHighlight')}</span>{' '}
                    {t('solutions.ctaDescEnd')}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/contact')}
                      className="group relative px-10 py-4 rounded-2xl font-semibold text-white overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] rounded-2xl" />
                      <span className="relative flex items-center gap-2">
                        {t('solutions.bookDemo')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/contact')}
                      className="px-10 py-4 rounded-2xl font-semibold text-white/70 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/5 transition-all duration-300"
                    >
                      {t('solutions.contactSales')}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
