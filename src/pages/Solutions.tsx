import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { Zap, Brain, FileCheck, Clock, BarChart3, Shield, ArrowRight, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import Footer from '../components/Landing/Footer';
import { NumberTicker } from '../components/ui/number-ticker';
import SEO from '../components/SEO';

// ─────────────────────────────────────
// Scroll-triggered reveal
// ─────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────
// Subtle hover card (no heavy glow)
// ─────────────────────────────────────
function Card({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      onClick={onClick}
      className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors duration-300 cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────
// Main component
// ─────────────────────────────────────
export default function Solutions() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeSolution, setActiveSolution] = useState(0);

  const solutions = [
    {
      icon: Brain,
      title: t('solutions.card1Title'),
      description: t('solutions.card1Desc'),
      features: [t('solutions.card1Feat1'), t('solutions.card1Feat2'), t('solutions.card1Feat3')],
      color: '#34d399',
    },
    {
      icon: Zap,
      title: t('solutions.card2Title'),
      description: t('solutions.card2Desc'),
      features: [t('solutions.card2Feat1'), t('solutions.card2Feat2'), t('solutions.card2Feat3')],
      color: '#818cf8',
    },
    {
      icon: FileCheck,
      title: t('solutions.card3Title'),
      description: t('solutions.card3Desc'),
      features: [t('solutions.card3Feat1'), t('solutions.card3Feat2'), t('solutions.card3Feat3')],
      color: '#c084fc',
    },
    {
      icon: Clock,
      title: t('solutions.card4Title'),
      description: t('solutions.card4Desc'),
      features: [t('solutions.card4Feat1'), t('solutions.card4Feat2'), t('solutions.card4Feat3')],
      color: '#fb923c',
    },
    {
      icon: BarChart3,
      title: t('solutions.card5Title'),
      description: t('solutions.card5Desc'),
      features: [t('solutions.card5Feat1'), t('solutions.card5Feat2'), t('solutions.card5Feat3')],
      color: '#22d3ee',
    },
    {
      icon: Shield,
      title: t('solutions.card6Title'),
      description: t('solutions.card6Desc'),
      features: [t('solutions.card6Feat1'), t('solutions.card6Feat2'), t('solutions.card6Feat3')],
      color: '#a78bfa',
    },
  ];

  const stats = [
    { value: 40, suffix: '%', label: 'Faster Processing' },
    { value: 99, suffix: '%', label: 'Accuracy Rate' },
    { value: 10, suffix: 'x', label: 'ROI Increase' },
    { value: 24, suffix: '/7', label: 'Availability' },
  ];

  return (
    <div className="bg-[#0A0A0A] min-h-screen relative overflow-x-hidden">
      <SEO
        title="Solutions"
        description="Explore ClerkTree's AI-powered solutions for claims processing, legal automation, and document review. See how we can help your business."
        canonical="https://clerktree.com/solutions"
      />
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[#0A0A0A]/80 border-b border-white/[0.06]">
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
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium whitespace-nowrap">
                {t('nav.solutions')}
              </span>
            </div>
            <LanguageSwitcher isExpanded={true} forceDark={true} />
          </div>
        </div>
      </header>

      {/* ════════════════════════════
           HERO
         ════════════════════════════ */}
      <section className="relative pt-32 md:pt-40 pb-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] mb-8">
              <Sparkles className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-medium text-white/50 tracking-wide uppercase">Enterprise AI Platform</span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="text-white">
                {t('solutions.title1')}
              </span>
              <br />
              <span className="text-white/40">
                {t('solutions.title2')}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 text-base md:text-lg text-white/35 leading-relaxed max-w-2xl mx-auto">
              {t('solutions.subtitle')}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/contact')}
                className="group px-7 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                {t('solutions.bookDemo')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/contact')}
                className="px-7 py-3.5 rounded-xl text-sm font-semibold text-white/60 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white/80 transition-all duration-300"
              >
                {t('solutions.contactSales')}
              </motion.button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════
           STATS
         ════════════════════════════ */}
      <section className="relative px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    <NumberTicker value={stat.value} className="text-white" delay={0.2 + i * 0.1} />
                    <span className="text-white/40">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-white/30 font-medium tracking-wide uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════
           SOLUTIONS GRID
         ════════════════════════════ */}
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Core Capabilities
              </h2>
              <p className="mt-3 text-base text-white/30">
                Six pillars powering modern claims operations.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Reveal key={index} delay={index * 0.06}>
                  <Card onClick={() => navigate('/contact')} className="h-full">
                    <div className="p-7 flex flex-col h-full">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-5">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${solution.color}10` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: solution.color }} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 group-hover:translate-x-0.5 transition-all mt-1" />
                      </div>

                      {/* Title & desc */}
                      <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
                        {solution.title}
                      </h3>
                      <p className="text-sm text-white/35 leading-relaxed mb-6 flex-grow">
                        {solution.description}
                      </p>

                      {/* Features */}
                      <div className="pt-5 border-t border-white/[0.05] space-y-2.5">
                        {solution.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: solution.color, opacity: 0.7 }} />
                            <span className="text-xs text-white/45">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════
           INTERACTIVE DEEP DIVE
         ════════════════════════════ */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How It Works</h2>
              <p className="mt-3 text-base text-white/30">Explore each solution in detail.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid lg:grid-cols-5 gap-6 items-start">
              {/* Left tabs */}
              <div className="lg:col-span-2 flex flex-col gap-1">
                {solutions.map((sol, idx) => {
                  const Icon = sol.icon;
                  const isActive = activeSolution === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveSolution(idx)}
                      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${isActive
                        ? 'bg-white/[0.05] border border-white/[0.08]'
                        : 'border border-transparent hover:bg-white/[0.02]'
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-white/60"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: isActive ? `${sol.color}12` : 'rgba(255,255,255,0.03)' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: isActive ? sol.color : 'rgba(255,255,255,0.2)' }} />
                      </div>
                      <span className={`text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/30'}`}>
                        {sol.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right panel */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSolution}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      {(() => {
                        const Icon = solutions[activeSolution].icon;
                        return (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${solutions[activeSolution].color}12` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: solutions[activeSolution].color }} />
                          </div>
                        );
                      })()}
                      <h3 className="text-xl font-semibold text-white">{solutions[activeSolution].title}</h3>
                    </div>

                    <p className="text-sm text-white/40 leading-relaxed mb-6">
                      {solutions[activeSolution].description}
                    </p>

                    <div className="space-y-3">
                      {solutions[activeSolution].features.map((feat, idx) => (
                        <motion.div
                          key={feat}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 + 0.15 }}
                          className="flex items-center gap-3 p-3.5 rounded-lg border border-white/[0.04] bg-white/[0.02]"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: solutions[activeSolution].color, opacity: 0.7 }} />
                          <span className="text-sm text-white/50">{feat}</span>
                        </motion.div>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate('/contact')}
                      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white/70 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white transition-all duration-200"
                    >
                      Learn More
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════
           CTA
         ════════════════════════════ */}
      <section className="relative px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 md:p-16 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-white/40 text-xs font-medium mb-6">
                {t('solutions.ctaBadge')}
              </span>

              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                <span className="text-white">{t('solutions.ctaTitle1')}</span>
                <br />
                <span className="text-white/40">{t('solutions.ctaTitle2')}</span>
              </h2>

              <p className="text-sm md:text-base text-white/30 mb-10 max-w-xl mx-auto leading-relaxed">
                {t('solutions.ctaDesc')}{' '}
                <span className="text-white/60 font-semibold">{t('solutions.ctaDescHighlight')}</span>{' '}
                {t('solutions.ctaDescEnd')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/contact')}
                  className="group px-8 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  {t('solutions.bookDemo')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/contact')}
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white/50 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white/70 transition-all duration-300"
                >
                  {t('solutions.contactSales')}
                </motion.button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
