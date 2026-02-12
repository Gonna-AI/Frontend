import { useNavigate } from 'react-router-dom';
import { Zap, Brain, FileCheck, Clock, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import Footer from '../components/Landing/Footer';
import ThreeDMarqueeDemo from '../components/ui/3d-marquee-demo';

export default function Solutions() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const solutions = [
    {
      icon: Brain,
      title: t('solutions.card1Title'),
      description: t('solutions.card1Desc'),
      features: [t('solutions.card1Feat1'), t('solutions.card1Feat2'), t('solutions.card1Feat3')],
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconGradient: 'from-emerald-400 to-teal-500',
      borderColor: 'emerald-500/30',
      color: 'emerald'
    },
    {
      icon: Zap,
      title: t('solutions.card2Title'),
      description: t('solutions.card2Desc'),
      features: [t('solutions.card2Feat1'), t('solutions.card2Feat2'), t('solutions.card2Feat3')],
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconGradient: 'from-blue-400 to-indigo-500',
      borderColor: 'blue-500/30',
      color: 'blue'
    },
    {
      icon: FileCheck,
      title: t('solutions.card3Title'),
      description: t('solutions.card3Desc'),
      features: [t('solutions.card3Feat1'), t('solutions.card3Feat2'), t('solutions.card3Feat3')],
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconGradient: 'from-purple-400 to-pink-500',
      borderColor: 'purple-500/30',
      color: 'purple'
    },
    {
      icon: Clock,
      title: t('solutions.card4Title'),
      description: t('solutions.card4Desc'),
      features: [t('solutions.card4Feat1'), t('solutions.card4Feat2'), t('solutions.card4Feat3')],
      gradient: 'from-orange-500/10 to-red-500/10',
      iconGradient: 'from-orange-400 to-red-500',
      borderColor: 'orange-500/30',
      color: 'orange'
    },
    {
      icon: BarChart3,
      title: t('solutions.card5Title'),
      description: t('solutions.card5Desc'),
      features: [t('solutions.card5Feat1'), t('solutions.card5Feat2'), t('solutions.card5Feat3')],
      gradient: 'from-cyan-500/10 to-blue-500/10',
      iconGradient: 'from-cyan-400 to-blue-500',
      borderColor: 'cyan-500/30',
      color: 'cyan'
    },
    {
      icon: Shield,
      title: t('solutions.card6Title'),
      description: t('solutions.card6Desc'),
      features: [t('solutions.card6Feat1'), t('solutions.card6Feat2'), t('solutions.card6Feat3')],
      gradient: 'from-violet-500/10 to-purple-500/10',
      iconGradient: 'from-violet-400 to-purple-500',
      borderColor: 'violet-500/30',
      color: 'violet'
    }
  ];

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      {/* Purple theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        <div
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.6) 0%, rgba(147,51,234,0.25) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(109,40,217,0.5) 0%, rgba(109,40,217,0.2) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Glassy Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg
              viewBox="0 0 464 468"
              className="w-9 h-9 md:w-11 md:h-11"
            >
              <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
          <div className="flex items-center gap-3">
            {/* Mobile Pill */}
            <div className="md:hidden">
              <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium whitespace-nowrap">
                {t('nav.solutions')}
              </span>
            </div>
            <LanguageSwitcher isExpanded={true} forceDark={true} />
          </div>
        </div>
      </header>

      <div className="relative z-10 py-12 px-6 pt-32 md:pt-36">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                {t('solutions.title1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text">
                {t('solutions.title2')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-4xl mx-auto">
              {t('solutions.subtitle')}
            </p>
          </div>

          <div className="mb-20">
            <ThreeDMarqueeDemo />
          </div>

          {/* Solutions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              const styles = {
                emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', shadow: 'hover:shadow-emerald-500/10', from: 'from-emerald-500/10', dot: 'bg-emerald-400' },
                blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', shadow: 'hover:shadow-blue-500/10', from: 'from-blue-500/10', dot: 'bg-blue-400' },
                purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', shadow: 'hover:shadow-purple-500/10', from: 'from-purple-500/10', dot: 'bg-purple-400' },
                orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', shadow: 'hover:shadow-orange-500/10', from: 'from-orange-500/10', dot: 'bg-orange-400' },
                cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', shadow: 'hover:shadow-cyan-500/10', from: 'from-cyan-500/10', dot: 'bg-cyan-400' },
                violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', shadow: 'hover:shadow-violet-500/10', from: 'from-violet-500/10', dot: 'bg-violet-400' }
              }[solution.color as string] || { bg: 'bg-white/10', text: 'text-white', shadow: 'hover:shadow-white/10', from: 'from-white/10', dot: 'bg-white' };

              return (
                <div
                  key={index}
                  onClick={() => navigate('/contact')}
                  className={`group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent p-10 ring-1 ring-white/5 backdrop-blur-md transition-all duration-500 hover:scale-[1.01] hover:from-white/[0.08] hover:ring-white/10 hover:shadow-2xl ${styles.shadow} cursor-pointer`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${styles.from} via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.bg}`}>
                        <Icon className={`w-7 h-7 ${styles.text}`} />
                      </div>
                      <h3 className="text-2xl font-semibold text-white leading-tight">
                        {solution.title}
                      </h3>
                    </div>

                    <p className="text-lg text-white/60 leading-relaxed mb-8 flex-grow">
                      {solution.description}
                    </p>

                    <ul className="space-y-4 mt-auto">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-white/60">
                          <div className={`mt-2 h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                          <span className="text-base">{feature}</span>
                        </div>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-purple-500/5 to-pink-500/5 ring-1 ring-purple-500/20 backdrop-blur-md overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10" />

            <div className="relative z-10 text-center py-16 px-8">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                  {t('solutions.ctaBadge')}
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-white/90 text-transparent bg-clip-text">
                  {t('solutions.ctaTitle1')}
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 text-transparent bg-clip-text">
                  {t('solutions.ctaTitle2')}
                </span>
              </h2>

              <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t('solutions.ctaDesc')} <span className="text-purple-400 font-semibold">{t('solutions.ctaDescHighlight')}</span> {t('solutions.ctaDescEnd')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-600/20 border-2 border-purple-500/30 text-white font-semibold hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-600/30 hover:border-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>{t('solutions.bookDemo')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {t('solutions.contactSales')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

