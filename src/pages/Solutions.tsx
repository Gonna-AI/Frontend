import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../contexts/LanguageContext';
import { Header, Footer } from '../components/Landing/AgeroChrome';
import { shouldAutoplayMedia } from '../utils/idle';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './Solutions.css';

const SOLUTIONS_HERO_VIDEO_SRC =
  'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/solutiosboagevidoe.mp4';

export default function Solutions() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const shouldPlayVideo = shouldAutoplayMedia();


  const heroServices = [
    t('solutions.card1Title'),
    t('solutions.card2Title'),
    t('solutions.card3Title'),
    t('solutions.card5Title'),
  ];



  return (
    <div className="agero-works clerktree-solutions-page">
      <SEO
        title="Solutions"
        description="Explore ClerkTree's industrial machine intelligence layer for telemetry, predictive maintenance, production analytics, and maintenance workflow orchestration."
        canonical="https://clerktree.com/solutions"
        preloadVideos={[{ href: SOLUTIONS_HERO_VIDEO_SRC }]}
        videos={[
          {
            name: `${t('solutions.title1')} ${t('solutions.title2')}`,
            description: t('solutions.subtitle'),
            contentUrl: SOLUTIONS_HERO_VIDEO_SRC,
            thumbnailUrl: 'https://framerusercontent.com/images/x3RMizQqFhQ9G8jF5dqqcbxY8M.png?scale-down-to=2048',
            uploadDate: '2026-07-04',
          },
        ]}
      />
      <main className="clerktree-solutions-main">
        <section className="fabric-solution-shell" aria-labelledby="solutions-title">
          <Header />

          <div className="fabric-solution-stage">
            {SOLUTIONS_HERO_VIDEO_SRC ? (
              <video
                className="fabric-solution-video"
                src={SOLUTIONS_HERO_VIDEO_SRC}
                autoPlay={shouldPlayVideo}
                loop
                muted
                playsInline
                preload={shouldPlayVideo ? 'auto' : 'metadata'}
                crossOrigin="anonymous"
                aria-label="ClerkTree solutions video"
              />
            ) : (
              <div className="fabric-solution-video-placeholder" aria-hidden="true" />
            )}

            <div className="fabric-solution-grain" aria-hidden="true" />
            <div className="fabric-solution-shadow" aria-hidden="true" />

            <div className="fabric-solution-brand fabric-solution-brand--single">
              <h1 id="solutions-title">{t('solutions.eyebrow')}</h1>
            </div>

            <ul className="fabric-solution-list" aria-label="ClerkTree solution capabilities">
              {heroServices.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>

            <span className="fabric-solution-plus plus-one" aria-hidden="true">+</span>
            <span className="fabric-solution-plus plus-two" aria-hidden="true">+</span>
            <span className="fabric-solution-plus plus-three" aria-hidden="true">+</span>
            <span className="fabric-solution-plus plus-four" aria-hidden="true">+</span>

            <p className="fabric-solution-copy">{t('solutions.subtitle')}</p>

          </div>
        </section>



        <section className="fabric-solution-cta" aria-labelledby="solutions-cta-title">
          <p>{t('solutions.ctaBadge')}</p>
          <h2 id="solutions-cta-title">
            {t('solutions.ctaTitle1')} {t('solutions.ctaTitle2')}
          </h2>
          <span>
            {t('solutions.ctaDesc')} {t('solutions.ctaDescHighlight')} {t('solutions.ctaDescEnd')}
          </span>
          <button type="button" onClick={() => navigate('/contact')}>
            {t('solutions.bookDemo')}
            <ArrowRight aria-hidden="true" size={20} />
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
