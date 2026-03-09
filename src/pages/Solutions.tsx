import { type ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type LucideIcon,
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  LifeBuoy,
  MessageSquareText,
  Shield,
  Zap,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import SharedHeader from '../components/Layout/SharedHeader';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO';
import { NumberTicker } from '../components/ui/number-ticker';

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

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm">
      {children}
    </p>
  );
}

type Capability = {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  accentClass: string;
  accentSurface: string;
};

export default function Solutions() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const stats = [
    {
      value: 31,
      suffix: '%',
      label: t('solutions.stat1Label'),
      description: t('solutions.stat1Desc'),
      numberClass: 'text-[#FF8A5B]',
      lineClass: 'bg-[#FF8A5B]',
    },
    {
      value: 92,
      suffix: '%',
      label: t('solutions.stat2Label'),
      description: t('solutions.stat2Desc'),
      numberClass: 'text-white',
      lineClass: 'bg-[#FF8A5B]/80',
    },
    {
      value: 2.4,
      suffix: 'x',
      decimalPlaces: 1,
      label: t('solutions.stat3Label'),
      description: t('solutions.stat3Desc'),
      numberClass: 'text-white',
      lineClass: 'bg-[#FF8A5B]/65',
    },
    {
      value: 24,
      suffix: '/7',
      label: t('solutions.stat4Label'),
      description: t('solutions.stat4Desc'),
      numberClass: 'text-white',
      lineClass: 'bg-[#FF8A5B]/50',
    },
  ];

  const capabilities: Capability[] = [
    {
      icon: MessageSquareText,
      title: t('solutions.card1Title'),
      description: t('solutions.card1Desc'),
      features: [t('solutions.card1Feat1'), t('solutions.card1Feat2'), t('solutions.card1Feat3')],
      accentClass: 'text-[#FF8A5B]',
      accentSurface: 'bg-[#FF8A5B]/10',
    },
    {
      icon: Zap,
      title: t('solutions.card2Title'),
      description: t('solutions.card2Desc'),
      features: [t('solutions.card2Feat1'), t('solutions.card2Feat2'), t('solutions.card2Feat3')],
      accentClass: 'text-amber-300',
      accentSurface: 'bg-amber-300/10',
    },
    {
      icon: GitBranch,
      title: t('solutions.card3Title'),
      description: t('solutions.card3Desc'),
      features: [t('solutions.card3Feat1'), t('solutions.card3Feat2'), t('solutions.card3Feat3')],
      accentClass: 'text-sky-300',
      accentSurface: 'bg-sky-300/10',
    },
    {
      icon: LifeBuoy,
      title: t('solutions.card4Title'),
      description: t('solutions.card4Desc'),
      features: [t('solutions.card4Feat1'), t('solutions.card4Feat2'), t('solutions.card4Feat3')],
      accentClass: 'text-emerald-300',
      accentSurface: 'bg-emerald-300/10',
    },
    {
      icon: Activity,
      title: t('solutions.card5Title'),
      description: t('solutions.card5Desc'),
      features: [t('solutions.card5Feat1'), t('solutions.card5Feat2'), t('solutions.card5Feat3')],
      accentClass: 'text-cyan-300',
      accentSurface: 'bg-cyan-300/10',
    },
    {
      icon: Shield,
      title: t('solutions.card6Title'),
      description: t('solutions.card6Desc'),
      features: [t('solutions.card6Feat1'), t('solutions.card6Feat2'), t('solutions.card6Feat3')],
      accentClass: 'text-orange-200',
      accentSurface: 'bg-orange-200/10',
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#0A0A0A]">
      <SEO
        title="Solutions"
        description="Explore ClerkTree's autonomous operations solutions across voice agents, document intelligence, workflow orchestration, and enterprise monitoring."
        canonical="https://clerktree.com/solutions"
      />
      <SharedHeader />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-[#FF8A5B]/8 blur-[140px]" />
        <div className="absolute right-[-10rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-white/6 blur-[120px]" />
        <div className="absolute bottom-[-8rem] left-1/2 h-[24rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#FF8A5B]/6 blur-[120px]" />
      </div>

      <main className="relative z-10">
        <section className="px-4 pb-12 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:px-8 lg:pt-40">
          <div className="mx-auto max-w-[92rem]">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
              <Reveal>
                <div className="max-w-3xl">
                  <SectionEyebrow>{t('solutions.eyebrow')}</SectionEyebrow>
                  <h1 className="mt-5 text-balance text-[2.6rem] font-semibold tracking-[-0.06em] text-white sm:mt-6 sm:text-6xl md:text-7xl xl:text-[5.75rem] xl:leading-[0.96]">
                    {t('solutions.title1')}
                    <br />
                    <span className="text-white/85">{t('solutions.title2')}</span>
                  </h1>
                  <p className="mt-5 max-w-2xl text-[0.98rem]/7 text-white/60 sm:mt-6 sm:text-lg/8 md:text-xl/9">
                    {t('solutions.subtitle')}
                  </p>

                  <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row">
                    <button
                      onClick={() => navigate('/contact')}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A5B] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#E7794C] sm:w-auto"
                    >
                      {t('solutions.bookDemo')}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate('/contact')}
                      className="w-full rounded-xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.04] hover:text-white sm:w-auto"
                    >
                      {t('solutions.contactSales')}
                    </button>
                  </div>

                  <div className="mt-7 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
                    {[t('solutions.heroTag1'), t('solutions.heroTag2'), t('solutions.heroTag3')].map((tag) => (
                      <div
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/55"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="relative min-h-[23rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#1A1A1A_0%,#23120B_45%,#0B0B0B_100%)] sm:min-h-[28rem] sm:rounded-[2rem] lg:min-h-[40rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,91,0.18),transparent_45%)]" />
                  <img
                    src="/callsumary.png"
                    alt="ClerkTree call summary and extracted data interface"
                    className="absolute inset-0 h-full w-full object-cover object-left-top"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(10,10,10,0.72)_0%,rgba(10,10,10,0.22)_44%,rgba(10,10,10,0.06)_78%)]" />
                  <div className="absolute bottom-4 left-4 right-4 hidden gap-3 sm:grid sm:grid-cols-3">
                    {capabilities.slice(0, 3).map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.title}
                          className={`rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md ${index === 2 ? 'col-span-2 sm:col-span-1' : ''}`}
                        >
                          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.accentSurface}`}>
                            <Icon className={`h-4 w-4 ${item.accentClass}`} />
                          </div>
                          <p className="mt-3 text-sm font-medium text-white">{item.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.16} className="mt-8">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-[1.75rem] border border-[#FF8A5B]/12 bg-[linear-gradient(180deg,rgba(255,138,91,0.07)_0%,rgba(255,255,255,0.025)_38%,rgba(255,255,255,0.015)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,138,91,0.08)] backdrop-blur-sm sm:p-6"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FF8A5B]/14 via-[#FF8A5B]/4 to-transparent" />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center">
                        <div className={`h-1.5 w-12 rounded-full ${stat.lineClass}`} />
                      </div>

                      <div className="mt-6 flex items-end gap-1.5 sm:mt-7">
                        <NumberTicker
                          value={stat.value}
                          decimalPlaces={stat.decimalPlaces ?? 0}
                          className={`${stat.numberClass} text-[2.6rem] font-semibold tracking-[-0.08em] sm:text-5xl`}
                          delay={0.12 + index * 0.04}
                        />
                        <span className="mb-1 text-lg font-semibold tracking-[-0.05em] text-[#FF8A5B]/78 sm:text-2xl">
                          {stat.suffix}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-medium tracking-[-0.02em] text-white/92 sm:mt-4 sm:text-lg">
                        {stat.label}
                      </h3>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-white/44">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-[92rem]">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
              <Reveal>
                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#141414_0%,#1E120C_100%)] p-6 sm:rounded-[2rem] sm:p-10">
                  <SectionEyebrow>{t('solutions.platformEyebrow')}</SectionEyebrow>
                  <h2 className="mt-5 max-w-2xl text-balance text-[2rem] font-semibold tracking-[-0.05em] text-white sm:mt-6 sm:text-5xl lg:text-[3.3rem] lg:leading-[1.02]">
                    {t('solutions.platformTitle')}
                  </h2>
                  <p className="mt-4 max-w-2xl text-[0.98rem]/7 text-white/60 sm:mt-5 sm:text-lg/8">
                    {t('solutions.platformDesc')}
                  </p>

                  <div className="mt-8 space-y-4 sm:mt-10">
                    {steps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.title}
                          className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 sm:p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF8A5B]/10 sm:h-11 sm:w-11">
                              <Icon className="h-5 w-5 text-[#FF8A5B]" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-white sm:text-lg">{step.title}</h3>
                              <p className="mt-2 text-sm leading-7 text-white/55">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#151515_0%,#0B0B0B_100%)] sm:min-h-[34rem] sm:rounded-[2rem] lg:min-h-[44rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,91,0.12),transparent_38%)]" />
                  <img
                    src="/graphofsimilarpeople.png"
                    alt="ClerkTree cluster graph view"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.08)_0%,rgba(10,10,10,0)_40%,rgba(10,10,10,0.65)_100%)]" />
                  <div className="absolute bottom-3 left-3 right-3 rounded-[1.35rem] border border-white/10 bg-black/55 p-4 backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:rounded-[1.5rem] sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF8A5B]">
                      {t('solutions.graphEyebrow')}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                      {t('solutions.graphTitle')}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                      {t('solutions.processDesc')}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

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
                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#171717_0%,#0C0C0C_100%)] p-6 sm:rounded-[2rem] sm:p-10">
                  <SectionEyebrow>{t('solutions.showcaseCard1Title')}</SectionEyebrow>
                  <p className="mt-4 max-w-xl text-[0.98rem]/7 text-white/60 sm:mt-5 sm:text-lg/8">
                    {t('solutions.showcaseCard1Desc')}
                  </p>

                  <div className="mt-6 overflow-hidden rounded-[1.55rem] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:mt-8 sm:rounded-[1.75rem]">
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
                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#151515_0%,#1D120C_100%)] p-6 sm:rounded-[2rem] sm:p-10">
                    <div className="grid gap-6 sm:gap-8 md:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)] md:items-end lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)]">
                      <div>
                        <SectionEyebrow>{t('solutions.showcaseCard2Title')}</SectionEyebrow>
                        <p className="mt-4 max-w-2xl text-[0.98rem]/7 text-white/60 sm:mt-5 sm:text-lg/8">
                          {t('solutions.showcaseCard2Desc')}
                        </p>
                      </div>

                      <div className="flex justify-center md:justify-end">
                        <div className="w-full max-w-[14rem] overflow-hidden rounded-[1.55rem] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:max-w-[18rem] sm:rounded-[1.75rem]">
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
                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#141414_0%,#0B1220_100%)] p-6 sm:rounded-[2rem] sm:p-10">
                    <SectionEyebrow>{t('solutions.showcaseCard3Title')}</SectionEyebrow>
                    <p className="mt-4 max-w-2xl text-[0.98rem]/7 text-white/60 sm:mt-5 sm:text-lg/8">
                      {t('solutions.showcaseCard3Desc')}
                    </p>

                    <div className="mt-6 overflow-hidden rounded-[1.55rem] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:mt-8 sm:rounded-[1.75rem]">
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

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-[92rem]">
            <Reveal>
              <div className="mb-8 sm:mb-10">
                <SectionEyebrow>{t('solutions.capabilitiesEyebrow')}</SectionEyebrow>
                <h2 className="mt-5 max-w-4xl text-balance text-[2rem] font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-[3.15rem] lg:leading-[1.03]">
                  {t('solutions.capabilitiesTitle')}
                </h2>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {capabilities.map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <Reveal key={capability.title} delay={index * 0.05}>
                    <article className="group h-full rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#141414_0%,#0C0C0C_100%)] p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.03] sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${capability.accentSurface}`}>
                          <Icon className={`h-5 w-5 ${capability.accentClass}`} />
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-white/45" />
                      </div>

                      <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-white sm:mt-6 sm:text-xl">
                        {capability.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-white/52">
                        {capability.description}
                      </p>

                      <div className="mt-7 space-y-3 border-t border-white/8 pt-6">
                        {capability.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${capability.accentClass}`} />
                            <span className="text-sm text-white/62">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#171717_0%,#1E120C_100%)] p-6 text-center sm:rounded-[2rem] sm:p-12 lg:p-16">
                <SectionEyebrow>{t('solutions.ctaBadge')}</SectionEyebrow>
                <h2 className="mt-5 text-balance text-[2rem] font-semibold tracking-[-0.05em] text-white sm:mt-6 sm:text-5xl lg:text-[3.15rem] lg:leading-[1.03]">
                  {t('solutions.ctaTitle1')}
                  <br />
                  <span className="text-white/88">{t('solutions.ctaTitle2')}</span>
                </h2>
                <p className="mx-auto mt-4 max-w-3xl text-[0.98rem]/7 text-white/60 sm:mt-5 sm:text-lg/8">
                  {t('solutions.ctaDesc')}{' '}
                  <span className="font-semibold text-white">{t('solutions.ctaDescHighlight')}</span>{' '}
                  {t('solutions.ctaDescEnd')}
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
                  <button
                    onClick={() => navigate('/contact')}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A5B] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#E7794C] sm:w-auto"
                  >
                    {t('solutions.bookDemo')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full rounded-xl border border-white/10 px-8 py-3.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.04] hover:text-white sm:w-auto"
                  >
                    {t('solutions.contactSales')}
                  </button>
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
