import { type ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  GitBranch,
  MessageSquareText,
  Shield,
} from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import SharedHeader from '../components/Layout/SharedHeader';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO';
import { NumberTicker } from '../components/ui/number-ticker';
import { cn } from '../lib/utils';

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
      initial={{ opacity: 0, transform: 'translateY(10px)' }}
      animate={
        inView
          ? { opacity: 1, transform: 'translateY(0px)' }
          : { opacity: 0, transform: 'translateY(10px)' }
      }
      transition={{
        duration: shouldReduce ? 0 : 0.38,
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

export default function Solutions() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const shouldReduce = useReducedMotion();

  const stats = [
    {
      value: 31,
      suffix: '%',
      label: t('solutions.stat1Label'),
      description: t('solutions.stat1Desc'),
      numberClass: 'text-[#FF8A5B] drop-shadow-[0_6px_22px_rgba(255,138,91,0.35)]',
      suffixClass: 'text-[#FFB286]',
    },
    {
      value: 92,
      suffix: '%',
      label: t('solutions.stat2Label'),
      description: t('solutions.stat2Desc'),
      numberClass: 'text-white drop-shadow-[0_6px_22px_rgba(255,255,255,0.18)]',
      suffixClass: 'text-white/60',
    },
    {
      value: 2.4,
      suffix: 'x',
      decimalPlaces: 1,
      label: t('solutions.stat3Label'),
      description: t('solutions.stat3Desc'),
      numberClass: 'text-white drop-shadow-[0_6px_22px_rgba(255,255,255,0.18)]',
      suffixClass: 'text-white/60',
    },
    {
      value: 24,
      suffix: '/7',
      label: t('solutions.stat4Label'),
      description: t('solutions.stat4Desc'),
      numberClass: 'text-white drop-shadow-[0_6px_22px_rgba(255,255,255,0.18)]',
      suffixClass: 'text-white/60',
    },
  ];

  const steps = [
    {
      icon: MessageSquareText,
      title: t('solutions.step1Title'),
      description: t('solutions.step1Desc'),
    },
    {
      icon: GitBranch,
      title: t('solutions.step2Title'),
      description: t('solutions.step2Desc'),
    },
    {
      icon: Shield,
      title: t('solutions.step3Title'),
      description: t('solutions.step3Desc'),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
      <SEO
        title="Solutions"
        description="Explore ClerkTree's autonomous operations solutions across voice agents, document intelligence, workflow orchestration, and enterprise monitoring."
        canonical="https://clerktree.com/solutions"
      />
      <SharedHeader />

      {/* ── Atmosphere layer ─────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute left-[-12rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-[#FF8A5B]/8 blur-[140px]" />
        <div className="absolute right-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-white/6 blur-[120px]" />
        <div className="absolute bottom-[-8rem] left-1/2 h-[24rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#FF8A5B]/6 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      <main className="relative z-10">

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section className="px-4 pb-12 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:px-8 lg:pt-40">
          <div className="mx-auto max-w-[92rem]">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">

              {/* Left: Copy */}
              <Reveal>
                <div className="max-w-3xl">
                  <SectionEyebrow>{t('solutions.eyebrow')}</SectionEyebrow>

                  <h1 className="mt-5 text-balance text-[2.6rem] font-semibold tracking-[-0.06em] text-white sm:mt-6 sm:text-6xl md:text-7xl xl:text-[5.75rem] xl:leading-[0.96]">
                    {t('solutions.title1')}
                    <br />
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 100%)' }}
                    >
                      {t('solutions.title2')}
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-[0.98rem]/7 text-white/55 sm:mt-6 sm:text-lg/8 md:text-xl/9">
                    {t('solutions.subtitle')}
                  </p>

                  <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row">
                    <motion.button
                      onClick={() => navigate('/contact')}
                      whileTap={shouldReduce ? {} : { scale: 0.97 }}
                      transition={{ duration: 0.12, ease: 'easeOut' }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A5B] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#E7794C] sm:w-auto"
                      style={{ boxShadow: '0 0 26px rgba(255,138,91,0.28), 0 2px 8px rgba(0,0,0,0.3)' }}
                    >
                      {t('solutions.bookDemo')}
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/contact')}
                      whileTap={shouldReduce ? {} : { scale: 0.97 }}
                      transition={{ duration: 0.12, ease: 'easeOut' }}
                      className="w-full rounded-xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.04] hover:border-white/20 hover:text-white sm:w-auto"
                    >
                      {t('solutions.contactSales')}
                    </motion.button>
                  </div>
                </div>
              </Reveal>

              {/* Right: Image card — clean, no overlaid text */}
              <Reveal delay={0.1}>
                <div className="relative min-h-[23rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#1A1A1A_0%,#23120B_45%,#0B0B0B_100%)] sm:min-h-[28rem] sm:rounded-[2rem] lg:min-h-[40rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,91,0.18),transparent_45%)]" />
                  <img
                    src="/callsumary.png"
                    alt="ClerkTree call summary and extracted data interface"
                    className="absolute inset-0 h-full w-full object-cover object-left-top"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(10,10,10,0.72)_0%,rgba(10,10,10,0.22)_44%,rgba(10,10,10,0.06)_78%)]" />
                </div>
              </Reveal>
            </div>

            {/* ── Stats: unified dashboard panel ───────────── */}
            <Reveal delay={0.14} className="mt-8">
              <div
                className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] sm:rounded-[2rem]"
                style={{ background: 'linear-gradient(180deg, rgba(255,138,91,0.055) 0%, rgba(255,255,255,0.018) 50%, rgba(255,255,255,0.01) 100%)' }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF8A5B]/35 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#FF8A5B]/10 to-transparent" />

                <div className="grid grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={cn(
                        'relative p-6 sm:p-8',
                        index < 3 ? 'xl:border-r xl:border-white/[0.07]' : '',
                        index < 2 ? 'border-b border-white/[0.07] xl:border-b-0' : '',
                        index % 2 === 0 ? 'border-r border-white/[0.07] xl:border-r-0' : '',
                        index < 3 ? 'xl:border-r' : '',
                      )}
                    >
                      <div className="flex items-end gap-1">
                        <NumberTicker
                          value={stat.value}
                          decimalPlaces={stat.decimalPlaces ?? 0}
                          className={`${stat.numberClass} text-[2.4rem] font-semibold tracking-[-0.08em] sm:text-5xl`}
                          delay={0.18 + index * 0.06}
                        />
                        <span className={cn('mb-1 text-xl font-semibold tracking-[-0.04em] sm:text-2xl', stat.suffixClass)}>
                          {stat.suffix}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold tracking-[-0.01em] text-white sm:text-base">
                        {stat.label}
                      </h3>
                      <p className="mt-1.5 text-[0.8rem] leading-6 text-white/50">
                        {stat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ PLATFORM ══════════════════════════════════════ */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-[92rem]">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">

              <Reveal>
                <div className="rounded-[1.75rem] border border-white/[0.07] bg-[linear-gradient(145deg,#141414_0%,#1E120C_100%)] p-6 sm:rounded-[2rem] sm:p-10">
                  <SectionEyebrow>{t('solutions.platformEyebrow')}</SectionEyebrow>
                  <h2 className="mt-5 max-w-2xl text-balance text-[2rem] font-semibold tracking-[-0.05em] text-white sm:mt-6 sm:text-5xl lg:text-[3.3rem] lg:leading-[1.02]">
                    {t('solutions.platformTitle')}
                  </h2>
                  <p className="mt-4 max-w-2xl text-[0.98rem]/7 text-white/55 sm:mt-5 sm:text-lg/8">
                    {t('solutions.platformDesc')}
                  </p>

                  {/* Steps: connector line + icon only (no step numbers) */}
                  <div className="relative mt-8 sm:mt-10">
                    <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-[#FF8A5B]/40 via-white/10 to-transparent" />

                    <div className="space-y-3">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <Reveal key={step.title} delay={0.06 + index * 0.07}>
                            <div className="relative flex items-start gap-4">
                              {/* Icon circle node on the connector line */}
                              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#0A0A0A]">
                                <Icon className="h-4 w-4 text-[#FF8A5B]" />
                              </div>

                              <div className="flex-1 rounded-[1.25rem] border border-white/[0.07] bg-black/20 p-4 sm:p-5">
                                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-white/50">{step.description}</p>
                              </div>
                            </div>
                          </Reveal>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[linear-gradient(145deg,#151515_0%,#0B0B0B_100%)] sm:min-h-[34rem] sm:rounded-[2rem] lg:min-h-[44rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,91,0.12),transparent_38%)]" />
                  <img
                    src="/graphofsimilarpeople.png"
                    alt="ClerkTree cluster graph view"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.08)_0%,rgba(10,10,10,0)_40%,rgba(10,10,10,0.72)_100%)]" />
                  <div className="absolute bottom-3 left-3 right-3 rounded-[1.35rem] border border-white/10 bg-black/60 p-4 backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:rounded-[1.5rem] sm:p-5">
                    <div className="absolute inset-x-0 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-[#FF8A5B]/40 to-transparent" />
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF8A5B]">
                      {t('solutions.graphEyebrow')}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                      {t('solutions.graphTitle')}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
                      {t('solutions.processDesc')}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ SHOWCASE ══════════════════════════════════════ */}
        <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-[92rem]">
            <Reveal>
              <div className="mb-8 sm:mb-10">
                <SectionEyebrow>{t('solutions.showcaseEyebrow')}</SectionEyebrow>
                <h2 className="mt-5 max-w-4xl text-balance text-[2rem] font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-[3.15rem] lg:leading-[1.03]">
                  {t('solutions.showcaseTitle')}
                </h2>
              </div>
            </Reveal>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
              <Reveal>
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[linear-gradient(145deg,#171717_0%,#0C0C0C_100%)] p-6 sm:rounded-[2rem] sm:p-10">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <SectionEyebrow>{t('solutions.showcaseCard1Title')}</SectionEyebrow>
                  <p className="mt-4 max-w-xl text-[0.98rem]/7 text-white/55 sm:mt-5 sm:text-lg/8">
                    {t('solutions.showcaseCard1Desc')}
                  </p>
                  <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-white/[0.07] shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:mt-8 sm:rounded-[1.6rem]">
                    <img
                      src="/clusterrescueforhighrisk.png"
                      alt="ClerkTree cluster rescue workflow"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </div>
              </Reveal>

              <div className="grid gap-6">
                <Reveal delay={0.08}>
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[linear-gradient(145deg,#151515_0%,#1D120C_100%)] p-6 sm:rounded-[2rem] sm:p-10">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF8A5B]/20 to-transparent" />
                    <div className="grid gap-6 sm:gap-8 md:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)] md:items-end lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)]">
                      <div>
                        <SectionEyebrow>{t('solutions.showcaseCard2Title')}</SectionEyebrow>
                        <p className="mt-4 max-w-2xl text-[0.98rem]/7 text-white/55 sm:mt-5 sm:text-lg/8">
                          {t('solutions.showcaseCard2Desc')}
                        </p>
                      </div>
                      <div className="flex justify-center md:justify-end">
                        <div className="w-full max-w-[14rem] overflow-hidden rounded-[1.4rem] border border-white/[0.07] shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:max-w-[18rem] sm:rounded-[1.6rem]">
                          <img
                            src="/cluster-copilot.png"
                            alt="ClerkTree cluster copilot recommendations"
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.12}>
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[linear-gradient(145deg,#141414_0%,#0B1220_100%)] p-6 sm:rounded-[2rem] sm:p-10">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />
                    <SectionEyebrow>{t('solutions.showcaseCard3Title')}</SectionEyebrow>
                    <p className="mt-4 max-w-2xl text-[0.98rem]/7 text-white/55 sm:mt-5 sm:text-lg/8">
                      {t('solutions.showcaseCard3Desc')}
                    </p>
                    <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-white/[0.07] shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:mt-8 sm:rounded-[1.6rem]">
                      <img
                        src="/graphofcalls.png"
                        alt="ClerkTree call volume trend graph"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════ */}
        <section className="px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div
                className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] sm:rounded-[2rem]"
                style={{ background: 'linear-gradient(145deg, #171717 0%, #1E120C 100%)' }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,138,91,0.12) 0%, transparent 70%)' }}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF8A5B]/50 to-transparent" />

                <div className="relative p-6 text-center sm:p-12 lg:p-16">
                  <SectionEyebrow className="justify-center">{t('solutions.ctaBadge')}</SectionEyebrow>
                  <h2 className="mt-5 text-balance text-[2rem] font-semibold tracking-[-0.05em] text-white sm:mt-6 sm:text-5xl lg:text-[3.15rem] lg:leading-[1.03]">
                    {t('solutions.ctaTitle1')}
                    <br />
                    <span className="text-white/80">{t('solutions.ctaTitle2')}</span>
                  </h2>
                  <p className="mx-auto mt-4 max-w-3xl text-[0.98rem]/7 text-white/55 sm:mt-5 sm:text-lg/8">
                    {t('solutions.ctaDesc')}{' '}
                    <span className="font-semibold text-white">{t('solutions.ctaDescHighlight')}</span>{' '}
                    {t('solutions.ctaDescEnd')}
                  </p>

                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
                    <motion.button
                      onClick={() => navigate('/contact')}
                      whileTap={shouldReduce ? {} : { scale: 0.97 }}
                      transition={{ duration: 0.12, ease: 'easeOut' }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A5B] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#E7794C] sm:w-auto"
                      style={{ boxShadow: '0 0 26px rgba(255,138,91,0.3), 0 2px 8px rgba(0,0,0,0.3)' }}
                    >
                      {t('solutions.bookDemo')}
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/contact')}
                      whileTap={shouldReduce ? {} : { scale: 0.97 }}
                      transition={{ duration: 0.12, ease: 'easeOut' }}
                      className="w-full rounded-xl border border-white/10 px-8 py-3.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.04] hover:border-white/20 hover:text-white sm:w-auto"
                    >
                      {t('solutions.contactSales')}
                    </motion.button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
